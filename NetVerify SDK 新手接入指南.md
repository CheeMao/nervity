# NetVerify SDK 新手接入指南

本文档旨在帮助你快速将 NetVerify 验证系统接入到你的 Python 项目中。

## 1. 准备工作 (必做)

### 步骤 A: 复制文件

将 SDK 中的 `client` 文件夹完整复制到你的项目根目录，并重命名为 `netverify`（或保持原名）。

你的项目结构应该看起来像这样：

```
你的项目/
├── main.py             <-- 你的程序入口
├── requirements.txt
└── netverify/          <-- 复制过来的 SDK 文件夹
    ├── __init__.py
    ├── netverify_client.py
    ├── encryption.py
    └── ...
```

### 步骤 B: 安装依赖

在你的 `requirements.txt` 中添加以下内容，或直接运行命令安装：

```bash
pip install requests cryptography
```

> 注意：`cryptography` 是可选的，仅在需要响应解密功能时安装。

## 2. 快速接入代码

为了方便使用，建议创建一个 `verify_helper.py` 辅助文件，将验证逻辑封装起来。

### 创建 verify_helper.py

```python
import platform
import uuid
import hashlib
import time
import threading
from netverify_client import NetVerifyClient, NetVerifyError


class VerifyHelper:
    def __init__(self, base_url: str, app_id: int, app_secret: str = None):
        """
        初始化验证助手

        Args:
            base_url: 服务器地址，如 "http://localhost:3000/api"
            app_id: 应用 ID（从后台获取）
            app_secret: 应用密钥（可选，获取远程变量时需要）
        """
        self.client = NetVerifyClient(
            base_url=base_url,
            app_id=app_id,
            app_secret=app_secret
        )
        self.app_id = app_id
        self.hwid = self._get_hwid()
        self._heartbeat_thread = None
        self._heartbeat_running = False

    def _get_hwid(self) -> str:
        """生成设备唯一指纹 (HWID)"""
        info = f"{platform.node()}-{platform.machine()}-{uuid.getnode()}"
        return hashlib.md5(info.encode()).hexdigest()

    def register(self, username: str, password: str, device_name: str = None):
        """用户注册"""
        try:
            result = self.client.register(
                username=username,
                password=password,
                hwid=self.hwid,
                device_name=device_name or "我的电脑"
            )
            return True, result
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def login(self, username: str, password: str, device_name: str = None):
        """用户登录"""
        try:
            result = self.client.login(
                username=username,
                password=password,
                hwid=self.hwid,
                device_name=device_name or "我的电脑"
            )
            data = result.get("data", {})

            # 检查账号状态
            if not data.get("is_valid"):
                return False, data.get("valid_message", "账号无效")

            print(f"登录成功: {data.get('user', {}).get('username')}")
            return True, data
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def recharge(self, card_code: str):
        """卡密充值（需要先登录）"""
        try:
            result = self.client.recharge(code=card_code, hwid=self.hwid)
            return True, result
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def request_trial(self):
        """申请试用（无需登录）"""
        try:
            result = self.client.trial(hwid=self.hwid, app_id=self.app_id)
            return True, result
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def heartbeat(self, device_name: str = None):
        """发送心跳"""
        try:
            result = self.client.heartbeat(hwid=self.hwid, device_name=device_name)
            data = result.get("data", {})

            # 检查是否有强制登出命令
            commands = data.get("commands", [])
            if "force_logout" in commands:
                print("收到强制登出命令")
                return False, "force_logout"

            return True, data
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def start_heartbeat_loop(self, interval: int = None):
        """
        开启心跳循环（建议在登录成功后调用）

        Args:
            interval: 心跳间隔（秒），不传则使用服务器返回的间隔
        """
        if self._heartbeat_running:
            return

        self._heartbeat_running = True

        def _loop():
            while self._heartbeat_running:
                success, result = self.heartbeat()
                if not success:
                    if result == "force_logout":
                        print("被强制登出，停止心跳")
                        self._heartbeat_running = False
                        break
                    print(f"心跳失败: {result}")

                # 使用服务器返回的间隔，或默认 60 秒
                sleep_interval = interval or (result.get("interval", 60) if isinstance(result, dict) else 60)
                time.sleep(sleep_interval)

        self._heartbeat_thread = threading.Thread(target=_loop, daemon=True)
        self._heartbeat_thread.start()

    def stop_heartbeat_loop(self):
        """停止心跳循环"""
        self._heartbeat_running = False

    def get_expire_time(self):
        """获取到期时间（需要先登录）"""
        try:
            result = self.client.get_expire_time()
            return True, result.get("data", {})
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def get_profile(self):
        """获取用户信息（需要先登录）"""
        try:
            result = self.client.get_profile()
            return True, result.get("data", {})
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"

    def get_remote_variable(self, key: str):
        """获取远程变量（需要 app_secret）"""
        try:
            result = self.client.get_remote_variable(key=key)
            data = result.get("data", {})
            if data.get("exists"):
                return True, data.get("value")
            return False, "变量不存在"
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"
        except ValueError as e:
            return False, str(e)

    def get_remote_variables(self):
        """获取所有远程变量（需要 app_secret）"""
        try:
            result = self.client.get_remote_variables_as_object()
            return True, result.get("data", {})
        except NetVerifyError as e:
            return False, f"[{e.code}] {e.message}"
        except ValueError as e:
            return False, str(e)
```

## 3. 在主程序中使用

在你的 `main.py` 中使用刚刚创建的 Helper：

```python
from verify_helper import VerifyHelper

# 配置你的服务器地址和应用信息
BASE_URL = "http://localhost:3000/api"  # 注意：需要包含 /api 前缀
APP_ID = 1                               # 请改为你在后台创建的应用 ID
APP_SECRET = "your_app_secret"           # 从后台获取（获取远程变量时需要）

# 1. 初始化
auth = VerifyHelper(BASE_URL, APP_ID, APP_SECRET)

# 2. 尝试登录
username = input("请输入用户名: ")
password = input("请输入密码: ")

success, result = auth.login(username, password)

if success:
    print("验证通过，进入主程序...")

    # 获取到期时间
    ok, expire_info = auth.get_expire_time()
    if ok:
        days = expire_info.get("remaining_seconds", 0) // 86400
        print(f"剩余 {days} 天，到期时间: {expire_info.get('expire_time')}")

    # 开启心跳保活
    auth.start_heartbeat_loop()

    # ... 在这里写你的核心代码 ...

    # 示例：获取远程变量
    ok, server_url = auth.get_remote_variable("server_url")
    if ok:
        print(f"服务器地址: {server_url}")

    input("按回车键退出...")

else:
    print(f"验证失败: {result}")

    # 3. 失败处理：询问是否使用卡密充值或试用
    if "过期" in result or "未激活" in result:
        print("\n请选择操作:")
        print("1. 卡密充值")
        print("2. 申请试用")
        choice = input("请输入选项 (1/2): ")

        if choice == "1":
            code = input("请输入卡密: ")
            ok, res = auth.recharge(code)
            if ok:
                print(f"充值成功！新到期时间: {res.get('data', {}).get('new_expire_time')}")
            else:
                print(f"充值失败: {res}")

        elif choice == "2":
            ok, res = auth.request_trial()
            if ok:
                print(f"试用申请成功！到期时间: {res.get('data', {}).get('expire_time')}")
            else:
                print(f"试用申请失败: {res}")
```

## 4. API 方法速查表

### 认证相关

| 方法 | 说明 | 需要登录 |
|------|------|----------|
| `register(username, password, hwid?, device_name?)` | 用户注册 | ❌ |
| `login(username, password, hwid, device_name?)` | 用户登录 | ❌ |
| `get_profile()` | 获取用户信息 | ✅ |
| `get_expire_time()` | 查询到期时间 | ✅ |

### 充值和试用

| 方法 | 说明 | 需要登录 |
|------|------|----------|
| `recharge(code, hwid?)` | 兑换卡密充值 | ✅ |
| `trial(hwid, app_id?)` | 申请试用激活 | ❌ |

### 心跳保活

| 方法 | 说明 | 需要登录 |
|------|------|----------|
| `heartbeat(hwid, device_name?)` | 发送心跳 | ✅ |

### 远程变量（需要 app_secret）

| 方法 | 说明 | 需要登录 |
|------|------|----------|
| `get_remote_variables(app_id?)` | 获取变量列表 | ❌ |
| `get_remote_variables_as_object(app_id?)` | 获取变量对象 | ❌ |
| `get_remote_variable(key, app_id?)` | 获取单个变量 | ❌ |

### 云函数

| 方法 | 说明 | 需要登录 |
|------|------|----------|
| `run_cloud_function(trigger_name, data?, app_id?)` | 执行云函数 | ❌ |

### 应用信息

| 方法 | 说明 | 需要登录 |
|------|------|----------|
| `get_app_info(app_id?)` | 获取应用详情 | ❌ |

## 5. 常见问题 (FAQ)

### Q1: app_id 是什么？
A: 在 NetVerify 管理后台创建应用时生成的 ID。你需要登录后台查看你的应用列表来获取。

### Q2: app_secret 是什么？什么时候需要？
A: `app_secret` 是应用密钥，从后台应用详情中获取。只有获取**远程变量**相关接口需要签名验证，必须传入 `app_secret`。其他接口不需要。

### Q3: hwid 是必须要传的吗？
A: 是的。NetVerify 使用 HWID 来绑定设备。如果用户换了电脑登录，系统会根据后台配置决定是否允许（受 `max_devices` 限制）。

### Q4: device_name 参数有什么用？
A: `device_name` 是可选参数，用于在后台设备列表中显示友好的设备名称，如 "我的电脑"、"办公室电脑" 等，提升用户体验。

### Q5: 心跳 (heartbeat) 有什么用？
A: 这是一个安全机制。客户端每隔一段时间（默认 60 秒）向服务器发送一次请求，证明程序还在运行且用户在线。它可以：
- 检测用户是否已过期/被禁用
- 接收服务器下发的命令（如强制登出）
- 实时更新用户的在线状态

### Q6: 怎么处理试用？
A: 调用 `trial(hwid)` 会根据设备指纹 (HWID) 自动赠送试用时间。如果该设备已试用过，会抛出异常。每个设备每个应用只能试用一次。

### Q7: 登录返回的 is_valid 是什么意思？
A: `is_valid` 表示用户是否可以正常使用。判断逻辑：
- `is_active = False` → 账号已被禁用
- `expire_time = None` → 未激活，请充值
- `expire_time < now` → 授权已过期
- 其他 → 正常可用

### Q8: 心跳返回的 commands 有什么用？
A: 服务器可以通过 `commands` 字段下发命令：
- `[]`: 无命令
- `["force_logout"]`: 强制登出（账号过期/被禁用/设备被封禁）

收到 `force_logout` 时应立即停止程序并提示用户。

## 6. 完整示例

查看 SDK 目录中的 `example.py` 获取更多使用示例。

```bash
cd sdk/client
python example.py
```
