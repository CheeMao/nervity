"""
NetVerify 客户端 SDK
====================

用于与 NetVerify 服务器进行通信的 Python 客户端库。
支持用户注册、登录、充值、试用、心跳保活、远程变量、云函数等功能。

使用示例:
    from netverify_client import NetVerifyClient

    # 初始化客户端（不带加密）
    client = NetVerifyClient(
        base_url="http://localhost:3000/api",
        app_id=1
    )

    # 初始化客户端（带响应解密）
    client = NetVerifyClient(
        base_url="http://localhost:3000/api",
        app_id=1,
        rsa_private_key="-----BEGIN RSA PRIVATE KEY-----\\n..."
    )

    # 注册
    result = client.register("username", "password", "device-hwid")

    # 登录
    result = client.login("username", "password", "device-hwid")

    # 心跳
    result = client.heartbeat("device-hwid")
"""

import requests
import hmac
import hashlib
import time
import uuid
import json
import base64
from typing import Optional, Dict, Any, List

# 延迟导入加密库（可选依赖）
try:
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False


class NetVerifyError(Exception):
    """
    NetVerify SDK 异常基类

    当 API 请求失败时抛出此异常。

    Attributes:
        code: 错误码
        message: 错误信息
    """
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"[{code}] {message}")


class ResponseDecryptor:
    """
    响应解密器

    用于解密服务器返回的 AES-256-CBC 加密响应。

    Example:
        >>> decryptor = ResponseDecryptor(private_key_pem)
        >>> decrypted = decryptor.decrypt(encrypted_response)
    """

    def __init__(self, private_key_pem: str):
        """
        初始化解密器

        Args:
            private_key_pem: PEM 格式的 RSA 私钥
        """
        self.private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )

    def decrypt(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        解密服务器响应

        Args:
            response: 加密的响应对象

        Returns:
            解密后的响应数据
        """
        if not response.get("encrypted"):
            return response

        encrypted_data = response.get("data")
        encrypted_key = response.get("key")
        signature = response.get("signature")

        if not encrypted_data or not encrypted_key:
            raise ValueError("加密响应缺少必要字段")

        # 1. 用 RSA 私钥解密 AES 密钥 + IV
        key_data = self._decrypt_key(encrypted_key)
        aes_key = key_data[:32]
        iv = key_data[32:48]

        # 2. 验证签名
        if signature:
            expected_sig = hmac.new(aes_key, encrypted_data.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(signature, expected_sig):
                raise ValueError("签名验证失败，数据可能被篡改")

        # 3. 用 AES 解密数据
        decrypted_data = self._decrypt_data(encrypted_data, aes_key, iv)

        return json.loads(decrypted_data)

    def _decrypt_key(self, encrypted_key_b64: str) -> bytes:
        """用 RSA 私钥解密 AES 密钥"""
        encrypted_key = base64.b64decode(encrypted_key_b64)
        return self.private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

    def _decrypt_data(self, encrypted_data_b64: str, key: bytes, iv: bytes) -> str:
        """用 AES-256-CBC 解密数据"""
        encrypted_data = base64.b64decode(encrypted_data_b64)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        padding_len = padded_data[-1]
        return padded_data[:-padding_len].decode('utf-8')


class NetVerifyClient:
    """
    NetVerify 客户端类

    提供与 NetVerify 服务器交互的所有方法。

    Attributes:
        base_url: API 基础地址，如 "http://localhost:3000/api"
        app_id: 应用 ID
        app_secret: 应用密钥（用于签名验证）
        rsa_private_key: RSA 私钥（用于解密服务器响应）
        token: 当前登录的 JWT token（登录成功后自动设置）
        timeout: 请求超时时间（秒）

    Example:
        >>> client = NetVerifyClient("http://localhost:3000/api", app_id=1, app_secret="xxx")
        >>> client.login("user", "pass", "hwid123")
        {'access_token': 'xxx', 'user': {...}}
    """

    def __init__(
        self,
        base_url: str,
        app_id: int,
        app_secret: Optional[str] = None,
        rsa_private_key: Optional[str] = None,
        timeout: int = 30
    ):
        """
        初始化 NetVerify 客户端

        Args:
            base_url: API 基础地址
                - 示例: "http://localhost:3000/api"
                - 生产环境: "https://your-domain.com/api"
            app_id: 应用 ID
                - 由后台管理员创建应用后获得
                - 用于标识客户端所属的应用
            app_secret: 应用密钥（可选）
                - 由后台创建应用时生成
                - 用于签名验证，获取远程变量等需要签名的接口
            rsa_private_key: RSA 私钥（可选）
                - PEM 格式的私钥字符串
                - 用于解密服务器加密的响应
                - 需要安装 cryptography 库
            timeout: 请求超时时间（秒）
                - 默认 30 秒
                - 网络较差时可适当增大
        """
        self.base_url = base_url.rstrip('/')
        self.app_id = app_id
        self.app_secret = app_secret
        self.timeout = timeout
        self._token: Optional[str] = None

        # 初始化解密器
        self._decryptor = None
        if rsa_private_key:
            if not CRYPTO_AVAILABLE:
                raise ImportError(
                    "使用 rsa_private_key 需要安装 cryptography 库：\n"
                    "pip install cryptography"
                )
            self._decryptor = ResponseDecryptor(rsa_private_key)

    @property
    def token(self) -> Optional[str]:
        """
        获取当前 JWT token

        Returns:
            当前存储的 token，未登录时返回 None
        """
        return self._token

    @token.setter
    def token(self, value: str):
        """
        设置 JWT token

        Args:
            value: JWT token 字符串
        """
        self._token = value

    def _get_headers(self, with_auth: bool = False) -> Dict[str, str]:
        """
        构建请求头

        Args:
            with_auth: 是否添加 Authorization 头

        Returns:
            请求头字典
        """
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if with_auth and self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        return headers

    def _generate_signature(
        self,
        timestamp: str,
        nonce: str,
        body: Optional[Dict] = None,
        query_params: Optional[Dict] = None
    ) -> str:
        """
        生成请求签名

        签名算法：
        1. 构建待签名字符串：app_id={appId}&nonce={nonce}&timestamp={timestamp}[&sorted_query][body_json]
        2. 使用 HMAC-SHA256 算法签名
        3. 返回十六进制签名值

        Args:
            timestamp: Unix 时间戳（秒）
            nonce: 随机字符串
            body: 请求体数据
            query_params: URL 查询参数

        Returns:
            签名字符串（十六进制）

        Raises:
            ValueError: app_secret 未设置时抛出
        """
        if not self.app_secret:
            raise ValueError("app_secret 未设置，无法生成签名。请在初始化时传入 app_secret 参数。")

        # 构建基础字符串
        data_to_sign = f"app_id={self.app_id}&nonce={nonce}&timestamp={timestamp}"

        # 添加排序后的查询参数
        if query_params:
            sorted_query = "&".join(
                f"{k}={v}" for k, v in sorted(query_params.items())
            )
            if sorted_query:
                data_to_sign += f"&{sorted_query}"

        # 添加请求体
        if body:
            body_string = json.dumps(body, separators=(',', ':'), ensure_ascii=False)
            data_to_sign += body_string

        # HMAC-SHA256 签名
        hmac_obj = hmac.new(
            self.app_secret.encode('utf-8'),
            data_to_sign.encode('utf-8'),
            hashlib.sha256
        )
        return hmac_obj.hexdigest()

    def _get_signature_headers(
        self,
        body: Optional[Dict] = None,
        query_params: Optional[Dict] = None
    ) -> Dict[str, str]:
        """
        生成签名验证所需的请求头

        Args:
            body: 请求体数据
            query_params: URL 查询参数

        Returns:
            包含签名相关头的字典：
            - x-app-id: 应用 ID
            - x-timestamp: Unix 时间戳
            - x-nonce: 随机字符串
            - x-signature: 签名
        """
        timestamp = str(int(time.time()))
        nonce = uuid.uuid4().hex
        signature = self._generate_signature(timestamp, nonce, body, query_params)

        return {
            "x-app-id": str(self.app_id),
            "x-timestamp": timestamp,
            "x-nonce": nonce,
            "x-signature": signature
        }

    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        with_auth: bool = False
    ) -> Dict[str, Any]:
        """
        发送 HTTP 请求

        Args:
            method: HTTP 方法 (GET, POST, PUT, DELETE)
            endpoint: API 端点路径
            data: 请求体数据
            params: URL 查询参数
            with_auth: 是否需要认证

        Returns:
            API 响应数据

        Raises:
            NetVerifyError: API 返回错误时抛出
            requests.RequestException: 网络请求失败时抛出
        """
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers(with_auth)

        response = requests.request(
            method=method,
            url=url,
            json=data,
            params=params,
            headers=headers,
            timeout=self.timeout
        )

        # 尝试解析 JSON 响应
        try:
            result = response.json()
        except ValueError:
            # 非 JSON 响应
            if not response.ok:
                raise NetVerifyError(
                    response.status_code,
                    f"HTTP Error: {response.text}"
                )
            return {"status": response.status_code, "data": response.text}

        # 检查业务错误码
        if "code" in result and result["code"] != 20000:
            raise NetVerifyError(
                result.get("code", -1),
                result.get("msg", "Unknown error")
            )

        # 自动解密响应（如果服务器返回加密数据）
        if self._decryptor and result.get("encrypted"):
            try:
                result = self._decryptor.decrypt(result)
            except Exception as e:
                raise NetVerifyError(-1, f"响应解密失败: {e}")

        return result

    def _request_with_signature(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        发送带签名验证的 HTTP 请求

        用于需要签名验证的接口（如远程变量）。
        会自动在请求头中添加签名相关信息。

        Args:
            method: HTTP 方法 (GET, POST, PUT, DELETE)
            endpoint: API 端点路径
            data: 请求体数据
            params: URL 查询参数

        Returns:
            API 响应数据

        Raises:
            NetVerifyError: API 返回错误时抛出
            ValueError: app_secret 未设置时抛出
            requests.RequestException: 网络请求失败时抛出
        """
        url = f"{self.base_url}{endpoint}"

        # 基础请求头
        headers = self._get_headers()

        # 添加签名头
        signature_headers = self._get_signature_headers(data, params)
        headers.update(signature_headers)

        response = requests.request(
            method=method,
            url=url,
            json=data,
            params=params,
            headers=headers,
            timeout=self.timeout
        )

        # 尝试解析 JSON 响应
        try:
            result = response.json()
        except ValueError:
            if not response.ok:
                raise NetVerifyError(
                    response.status_code,
                    f"HTTP Error: {response.text}"
                )
            return {"status": response.status_code, "data": response.text}

        # 检查业务错误码
        if "code" in result and result["code"] != 20000:
            raise NetVerifyError(
                result.get("code", -1),
                result.get("msg", "Unknown error")
            )

        # 自动解密响应（如果服务器返回加密数据）
        if self._decryptor and result.get("encrypted"):
            try:
                result = self._decryptor.decrypt(result)
            except Exception as e:
                raise NetVerifyError(-1, f"响应解密失败: {e}")

        return result

    # ==================== 认证相关方法 ====================

    def register(
        self,
        username: str,
        password: str,
        hwid: Optional[str] = None,
        device_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        用户注册

        在指定应用中注册新用户账号。

        Args:
            username: 用户名
                - 长度: 3-50 个字符
                - 同一应用内不能重复
            password: 密码
                - 最小长度: 6 个字符
            hwid: 硬件 ID（可选）
                - 用于设备绑定
                - 如不提供，可在后续登录时绑定
            device_name: 设备名称（可选）
                - 用于在设备列表中显示友好名称
                - 如 "我的电脑"、"办公室电脑" 等

        Returns:
            注册成功响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "id": 1,           # 用户 ID
                    "username": "xxx", # 用户名
                    "app_id": 1,       # 应用 ID
                    "created_at": "2024-01-01T00:00:00Z"
                }
            }
            ```

        Raises:
            NetVerifyError: 注册失败时抛出
                - 用户名已存在
                - 参数验证失败

        Example:
            >>> client.register("myuser", "mypassword", "DEVICE-HWID-001", "我的电脑")
            {'data': {'id': 1, 'username': 'myuser', ...}}
        """
        data = {
            "username": username,
            "password": password,
            "app_id": self.app_id
        }
        if hwid:
            data["hwid"] = hwid
        if device_name:
            data["device_name"] = device_name

        return self._request("POST", "/client/register", data=data)

    def login(
        self,
        username: str,
        password: str,
        hwid: str,
        device_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        用户登录

        使用用户名和密码登录，获取 JWT token。
        登录成功后 token 会自动保存到客户端实例中。

        Args:
            username: 用户名
            password: 密码
            hwid: 硬件 ID（必填）
                - 用于设备绑定验证
                - 每个用户最多绑定 max_devices 台设备
                - 超过限制将无法登录
            device_name: 设备名称（可选）
                - 用于在设备列表中显示友好名称
                - 如 "我的电脑"、"办公室电脑" 等

        Returns:
            登录成功响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "user": {
                        "id": 1,
                        "username": "xxx",
                        "app_id": 1,
                        "is_active": True,
                        "expire_time": "2024-12-31T23:59:59Z",
                        "max_devices": 3
                    },
                    "heart_interval": 60,        # 建议心跳间隔（秒）
                    "heartbeat_timeout": 180,    # 心跳超时时间（秒）
                    "is_valid": True,            # 是否有效（可正常使用）
                    "expire_time": "2024-12-31T23:59:59Z",  # 到期时间
                    "valid_message": ""          # 状态说明（无效时显示原因）
                }
            }
            ```

            valid_message 可能的值：
            - "": 有效
            - "账号已被禁用": is_active = False
            - "未激活，请充值": expire_time = None
            - "授权已过期": expire_time < now

        Raises:
            NetVerifyError: 登录失败时抛出
                - 用户名或密码错误
                - 账号被禁用
                - 设备绑定数量超限

        Example:
            >>> result = client.login("myuser", "mypassword", "DEVICE-HWID-001", "我的电脑")
            >>> data = result["data"]
            >>> if data["is_valid"]:
            ...     print("登录成功，可正常使用")
            ... else:
            ...     print(f"登录成功但无效: {data['valid_message']}")
        """
        data = {
            "username": username,
            "password": password,
            "app_id": self.app_id,
            "hwid": hwid
        }
        if device_name:
            data["device_name"] = device_name

        result = self._request("POST", "/client/login", data=data)

        # 自动保存 token
        if "data" in result and "access_token" in result["data"]:
            self._token = result["data"]["access_token"]

        return result

    def get_profile(self) -> Dict[str, Any]:
        """
        获取当前用户信息

        获取已登录用户的详细信息。需要先调用 login() 登录。

        Returns:
            用户信息响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "id": 1,
                    "username": "xxx",
                    "app_id": 1,
                    "is_active": True,
                    "expire_time": "2024-12-31T23:59:59Z",
                    "max_devices": 3,
                    "hwid": "DEVICE-HWID-001",
                    "last_login": "2024-01-01T00:00:00Z",
                    "created_at": "2024-01-01T00:00:00Z"
                }
            }
            ```

        Raises:
            NetVerifyError: 未登录或 token 过期时抛出

        Example:
            >>> client.login("user", "pass", "hwid")
            >>> profile = client.get_profile()
            >>> print(profile["data"]["username"])
        """
        return self._request("GET", "/client/profile", with_auth=True)

    # ==================== 充值和试用 ====================

    def recharge(
        self,
        code: str,
        hwid: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        兑换卡密充值

        使用卡密为当前登录用户充值时长。
        登录后调用此方法，充值到当前登录的账号。

        Args:
            code: 卡密代码
                - 由后台生成的激活码
                - 格式通常为 16-32 位字母数字组合
            hwid: 硬件 ID（可选）
                - 某些卡密可能需要设备绑定

        Returns:
            充值成功响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "success": True,
                    "message": "充值成功",
                    "added_seconds": 2592000,  # 充值的秒数（30天）
                    "new_expire_time": "2024-12-31T23:59:59Z",
                    "card_type": "月卡"
                }
            }
            ```

        Raises:
            NetVerifyError: 充值失败时抛出
                - 卡密无效或已使用
                - 卡密已被封禁
                - 卡密与应用不匹配

        Example:
            >>> client.login("user", "pass", "hwid")
            >>> result = client.recharge("ABCD1234EFGH5678")
            >>> print(f"充值成功，新到期时间: {result['data']['new_expire_time']}")
        """
        data = {"code": code}
        if hwid:
            data["hwid"] = hwid

        return self._request("POST", "/cards/redeem", data=data, with_auth=True)

    def trial(
        self,
        hwid: str,
        app_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        申请试用激活

        申请应用的免费试用。
        每个设备每个应用只能试用一次。

        Args:
            hwid: 硬件 ID（必填）
                - 用于标识设备
                - 同一设备不能重复试用
            app_id: 应用 ID（可选）
                - 默认使用初始化时设置的 app_id
                - 如需试用其他应用可传入此参数

        Returns:
            试用激活响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "success": True,
                    "message": "试用激活成功",
                    "added_seconds": 86400,     # 增加的试用时长（秒）
                    "expire_time": "2024-01-02T00:00:00Z",
                    "max_devices": 1,           # 设备数量限制
                    "is_trial": True            # 标识为试用激活
                }
            }
            ```

        Raises:
            NetVerifyError: 试用失败时抛出
                - 该设备已使用过试用
                - 应用未启用试用功能
                - 设备 ID 无效

        Example:
            >>> result = client.trial("DEVICE-HWID-001")
            >>> print(f"试用账号: {result['data']['username']}")
        """
        data = {
            "app_id": app_id or self.app_id,
            "hwid": hwid
        }
        return self._request("POST", "/cards/trial", data=data)

    # ==================== 心跳保活 ====================

    def heartbeat(
        self,
        hwid: str,
        device_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        发送心跳

        客户端定期发送心跳以保持在线状态。
        建议按照服务器返回的 interval 间隔发送心跳。

        Args:
            hwid: 硬件 ID（必填）
                - 必须与登录时使用的 hwid 一致
                - 用于验证设备绑定状态
            device_name: 设备名称（可选）
                - 用于更新设备的友好名称
                - 如 "我的电脑"、"办公室电脑" 等

        Returns:
            心跳响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "success": True,          # 心跳是否成功
                    "is_active": True,        # 用户是否有效（未过期/未禁用）
                    "expire_time": "2024-12-31T23:59:59Z",
                    "username": "xxx",
                    "max_devices": 3,         # 最大设备数
                    "bound_devices": 1,       # 已绑定设备数
                    "interval": 60,           # 建议心跳间隔（秒）
                    "heartbeat_timeout": 180, # 心跳超时时间（秒）
                    "server_time": 1704067200000,  # 服务器时间戳（毫秒）
                    "commands": []            # 服务器下发的命令
                }
            }
            ```

            commands 可能的值:
            - `[]`: 无命令
            - `["force_logout"]`: 强制登出（授权过期/账号被禁用/设备被封禁）

        Raises:
            NetVerifyError: 心跳失败时抛出
                - 未登录或 token 过期
                - 设备被封禁
                - 设备绑定超限

        Note:
            - 收到 `force_logout` 命令时应立即停止使用并提示用户
            - 建议使用 heartbeat_timeout 作为实际超时判断依据
            - heartbeat_timeout = interval * multiplier（容错机制）

        Example:
            >>> while True:
            ...     result = client.heartbeat("DEVICE-HWID-001", "我的电脑")
            ...     if "force_logout" in result["data"].get("commands", []):
            ...         print("被强制登出")
            ...         break
            ...     time.sleep(result["data"]["interval"])
        """
        data = {"hwid": hwid}
        if device_name:
            data["device_name"] = device_name
        return self._request("PUT", "/client/heartbeat", data=data, with_auth=True)

    # ==================== 远程变量 ====================

    def get_remote_variables(
        self,
        app_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        获取远程变量列表

        获取指定应用的所有远程变量。
        远程变量可用于动态配置客户端行为，无需更新客户端。

        注意：此接口需要签名验证，初始化时必须传入 app_secret。

        Args:
            app_id: 应用 ID（可选）
                - 默认使用初始化时设置的 app_id

        Returns:
            变量列表响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "list": [
                        {
                            "id": 1,
                            "key": "server_url",
                            "value": "https://api.example.com",
                            "description": "API服务器地址"
                        },
                        {
                            "id": 2,
                            "key": "feature_enabled",
                            "value": "true",
                            "description": "是否启用新功能"
                        }
                    ]
                }
            }
            ```

        Raises:
            ValueError: app_secret 未设置时抛出

        Example:
            >>> client = NetVerifyClient("http://localhost:3000/api", app_id=1, app_secret="xxx")
            >>> result = client.get_remote_variables()
            >>> for var in result["data"]["list"]:
            ...     print(f"{var['key']} = {var['value']}")
        """
        app_id = app_id or self.app_id
        return self._request_with_signature("GET", f"/remote-variables/app/{app_id}")

    def get_remote_variables_as_object(
        self,
        app_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        获取远程变量（对象格式）

        以 key-value 键值对形式获取远程变量。
        更便于直接通过 key 查找 value。

        注意：此接口需要签名验证，初始化时必须传入 app_secret。

        Args:
            app_id: 应用 ID（可选）
                - 默认使用初始化时设置的 app_id

        Returns:
            变量对象响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "server_url": "https://api.example.com",
                    "feature_enabled": "true",
                    "max_retries": "3",
                    "timeout_seconds": "30"
                }
            }
            ```

        Raises:
            ValueError: app_secret 未设置时抛出

        Example:
            >>> client = NetVerifyClient("http://localhost:3000/api", app_id=1, app_secret="xxx")
            >>> result = client.get_remote_variables_as_object()
            >>> server_url = result["data"]["server_url"]
            >>> print(f"服务器地址: {server_url}")
        """
        app_id = app_id or self.app_id
        return self._request_with_signature("GET", f"/remote-variables/app/{app_id}/object")

    def get_remote_variable(
        self,
        key: str,
        app_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        获取单个远程变量

        获取指定 key 的远程变量值。

        注意：此接口需要签名验证，初始化时必须传入 app_secret。

        Args:
            key: 变量名
                - 在后台配置的变量标识
            app_id: 应用 ID（可选）
                - 默认使用初始化时设置的 app_id

        Returns:
            单个变量响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "exists": True,           # 变量是否存在
                    "key": "server_url",
                    "value": "https://api.example.com",
                    "description": "API服务器地址"
                }
            }
            ```

        Raises:
            ValueError: app_secret 未设置时抛出

        Example:
            >>> client = NetVerifyClient("http://localhost:3000/api", app_id=1, app_secret="xxx")
            >>> result = client.get_remote_variable("server_url")
            >>> if result["data"]["exists"]:
            ...     print(f"服务器地址: {result['data']['value']}")
            ... else:
            ...     print("变量不存在")
        """
        app_id = app_id or self.app_id
        return self._request_with_signature("GET", f"/remote-variables/app/{app_id}/key/{key}")

    # ==================== 云函数 ====================

    def run_cloud_function(
        self,
        trigger_name: str,
        data: Optional[Dict[str, Any]] = None,
        app_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        执行云函数

        调用服务器端预定义的云函数。
        云函数在服务器端沙箱环境中执行，可用于复杂业务逻辑。

        Args:
            trigger_name: 触发器名称
                - 在后台配置的云函数标识
                - 如 "on_login"、"calculate_score" 等
            data: 传递给云函数的数据（可选）
                - 将作为云函数的输入参数
                - 示例: {"user_id": 1, "action": "purchase"}
            app_id: 应用 ID（可选）
                - 默认使用初始化时设置的 app_id

        Returns:
            云函数执行响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "success": True,
                    "result": {  # 云函数返回的结果
                        "score": 100,
                        "message": "计算完成"
                    }
                }
            }
            ```

        Raises:
            NetVerifyError: 执行失败时抛出
                - 云函数不存在
                - 云函数执行错误
                - 参数验证失败

        Example:
            >>> result = client.run_cloud_function(
            ...     "calculate_score",
            ...     {"user_id": 1, "level": 5}
            ... )
            >>> print(f"得分: {result['data']['result']['score']}")
        """
        app_id = app_id or self.app_id
        body = {"data": data} if data else {}
        return self._request("POST", f"/cloud/run/{app_id}/{trigger_name}", data=body)

    # ==================== 应用信息 ====================

    def get_app_info(
        self,
        app_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        获取应用详情

        获取指定应用的基本信息和配置，包括版本号、下载地址等。

        Args:
            app_id: 应用 ID（可选）
                - 默认使用初始化时设置的 app_id

        Returns:
            应用详情响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "id": 1,
                    "name": "我的应用",
                    "app_secret": "xxx",        # 应用密钥

                    # 版本和更新相关
                    "version": "1.0.0",         # 当前版本号
                    "download_url": "https://example.com/download/app.zip",  # 下载地址
                    "force_update": False,      # 是否强制更新

                    # 心跳配置
                    "heart_interval": 60,       # 心跳间隔（秒）
                    "heartbeat_timeout_multiplier": 3,  # 心跳超时倍数

                    # 试用配置
                    "trial_enabled": True,      # 是否启用试用
                    "trial_duration": 86400,    # 试用时长（秒）
                    "trial_device_limit": 1,    # 试用设备数限制

                    # 状态
                    "is_active": True,          # 是否启用
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-01T00:00:00Z"
                }
            }
            ```

        Example:
            >>> result = client.get_app_info()
            >>> app = result["data"]
            >>> print(f"应用名: {app['name']}")
            >>> print(f"版本: {app['version']}")
            >>> print(f"下载地址: {app['download_url']}")
            >>> if app['force_update']:
            ...     print("需要强制更新！")
        """
        app_id = app_id or self.app_id
        return self._request("GET", f"/apps/{app_id}")

    # ==================== 工具方法 ====================

    def set_token(self, token: str) -> None:
        """
        手动设置 JWT token

        如果已经保存了 token，可以直接设置而不需要重新登录。

        Args:
            token: JWT token 字符串

        Example:
            >>> client.set_token("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        """
        self._token = token

    def clear_token(self) -> None:
        """
        清除当前 token

        用于登出或清除认证状态。

        Example:
            >>> client.clear_token()
        """
        self._token = None

    def get_expire_time(self) -> Dict[str, Any]:
        """
        查询到期时间

        查询当前登录用户的授权状态和到期时间。

        Returns:
            到期时间响应:
            ```python
            {
                "status": 200,
                "code": 20000,
                "data": {
                    "username": "xxx",
                    "is_valid": True,           # 是否有效（可正常使用）
                    "is_active": True,          # 账号是否启用
                    "expire_time": "2024-12-31T23:59:59Z",
                    "expire_timestamp": 1735689599,  # 到期时间戳（秒）
                    "remaining_seconds": 86400,      # 剩余秒数
                    "valid_message": ""              # 状态说明
                }
            }
            ```

            valid_message 可能的值：
            - "": 有效
            - "账号已被禁用": is_active = False
            - "未激活，请充值": expire_time = None
            - "授权已过期": expire_time < now

        Raises:
            NetVerifyError: 未登录或 token 过期时抛出

        Example:
            >>> result = client.get_expire_time()
            >>> data = result["data"]
            >>> if data["is_valid"]:
            ...     days = data["remaining_seconds"] // 86400
            ...     print(f"剩余 {days} 天")
            ... else:
            ...     print(f"无效: {data['valid_message']}")
        """
        return self._request("GET", "/client/expire-time", with_auth=True)

    def is_authenticated(self) -> bool:
        """
        检查是否已认证

        检查当前是否设置了 token。
        注意：此方法不验证 token 是否有效，仅检查是否存在。

        Returns:
            bool: 是否设置了 token

        Example:
            >>> if client.is_authenticated():
            ...     client.heartbeat("hwid")
        """
        return self._token is not None


# 便捷函数

def create_client(
    base_url: str,
    app_id: int,
    app_secret: Optional[str] = None,
    username: Optional[str] = None,
    password: Optional[str] = None,
    hwid: Optional[str] = None,
    device_name: Optional[str] = None,
    timeout: int = 30
) -> NetVerifyClient:
    """
    创建并初始化客户端

    便捷函数，创建客户端并可选地自动登录。

    Args:
        base_url: API 基础地址
        app_id: 应用 ID
        app_secret: 应用密钥（可选，获取远程变量时需要）
        username: 用户名（可选，提供则自动登录）
        password: 密码（可选，提供则自动登录）
        hwid: 硬件 ID（可选，登录时需要）
        device_name: 设备名称（可选，显示友好名称）
        timeout: 请求超时时间

    Returns:
        初始化后的 NetVerifyClient 实例

    Example:
        >>> # 仅创建客户端
        >>> client = create_client("http://localhost:3000/api", 1)

        >>> # 创建并自动登录
        >>> client = create_client(
        ...     "http://localhost:3000/api",
        ...     app_id=1,
        ...     app_secret="xxx",  # 获取远程变量时需要
        ...     username="user",
        ...     password="pass",
        ...     hwid="DEVICE-001",
        ...     device_name="我的电脑"
        ... )
    """
    client = NetVerifyClient(base_url, app_id, app_secret, timeout=timeout)

    if username and password and hwid:
        client.login(username, password, hwid, device_name)

    return client
