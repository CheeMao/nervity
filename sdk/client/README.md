# NetVerify Client SDK (Python)

用于与 NetVerify 服务器通信的 Python 客户端 SDK。

## 安装

```bash
cd sdk/client
pip install -r requirements.txt
```

## 快速开始

```python
from netverify_client import NetVerifyClient

# 初始化客户端
client = NetVerifyClient(
    base_url="http://localhost:3000/api",
    app_id=1,
    app_secret="your_app_secret"  # 获取远程变量时需要
)

# 用户注册（可选设备名称）
client.register("username", "password", "device-hwid", "我的电脑")

# 用户登录（可选设备名称）
result = client.login("username", "password", "device-hwid", "我的电脑")

# 发送心跳（可选设备名称）
result = client.heartbeat("device-hwid", "我的电脑")
```

## 重要说明

### app_secret

`app_secret` 是应用密钥，从后台获取。以下接口需要签名验证，必须传入 `app_secret`：

- `get_remote_variables()` - 获取远程变量列表
- `get_remote_variables_as_object()` - 获取远程变量（对象格式）
- `get_remote_variable()` - 获取单个远程变量

如果不传入 `app_secret`，调用这些接口会抛出 `ValueError`。

### device_name（设备名称）

`device_name` 是可选参数，用于在设备列表中显示友好的设备名称，提升用户体验：

- `register()` - 注册时可选传入
- `login()` - 登录时可选传入
- `heartbeat()` - 心跳时可选传入，可更新设备名称

示例：`"我的电脑"`、`"办公室电脑"`、`"iPhone 15 Pro"`

## API 方法

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

### 远程变量

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

## 方法详解

### register(username, password, hwid=None)

用户注册。

**参数:**
- `username` (str): 用户名，3-50 字符
- `password` (str): 密码，最少 6 字符
- `hwid` (str, 可选): 硬件 ID

**返回:**
```python
{
    "data": {
        "id": 1,
        "username": "xxx",
        "app_id": 1,
        "created_at": "2024-01-01T00:00:00Z"
    }
}
```

---

### login(username, password, hwid)

用户登录。登录成功后 token 会自动保存。

**参数:**
- `username` (str): 用户名
- `password` (str): 密码
- `hwid` (str): 硬件 ID（必填）

**返回:**
```python
{
    "data": {
        "access_token": "eyJhbG...",
        "user": {
            "id": 1,
            "username": "xxx",
            "is_active": True,
            "expire_time": "2024-12-31T23:59:59Z",
            "max_devices": 3
        },
        "is_valid": True,            # 是否有效（可正常使用）
        "expire_time": "2024-12-31T23:59:59Z",
        "valid_message": ""          # 无效时显示原因
    }
}
```

**is_valid 判断逻辑：**
- `is_active = False` → `is_valid = False`, "账号已被禁用"
- `expire_time = None` → `is_valid = False`, "未激活，请充值"
- `expire_time < now` → `is_valid = False`, "授权已过期"
- 其他 → `is_valid = True`

---

### get_expire_time()

查询当前用户的授权状态和到期时间。

**返回:**
```python
{
    "data": {
        "username": "xxx",
        "is_valid": True,
        "is_active": True,
        "expire_time": "2024-12-31T23:59:59Z",
        "expire_timestamp": 1735689599,   # Unix 时间戳（秒）
        "remaining_seconds": 86400,      # 剩余秒数
        "valid_message": ""
    }
}
```

**示例:**
```python
result = client.get_expire_time()
data = result["data"]

if data["is_valid"]:
    days = data["remaining_seconds"] // 86400
    print(f"剩余 {days} 天")
else:
    print(f"无效: {data['valid_message']}")
```

---

### recharge(code, hwid=None)

兑换卡密充值。

**参数:**
- `code` (str): 卡密代码
- `hwid` (str, 可选): 硬件 ID

**返回:**
```python
{
    "data": {
        "success": True,
        "message": "充值成功",
        "added_seconds": 2592000,
        "new_expire_time": "2024-12-31T23:59:59Z"
    }
}
```

---

### trial(hwid, app_id=None)

申请试用激活。每个设备只能试用一次。

**参数:**
- `hwid` (str): 硬件 ID（必填）
- `app_id` (int, 可选): 应用 ID

**返回:**
```python
{
    "data": {
        "success": True,
        "added_seconds": 86400,
        "expire_time": "2024-01-02T00:00:00Z",
        "max_devices": 1,
        "is_trial": True
    }
}
```

---

### heartbeat(hwid)

发送心跳。建议按照返回的 `interval` 间隔定期发送。

**参数:**
- `hwid` (str): 硬件 ID

**返回:**
```python
{
    "data": {
        "success": True,
        "is_active": True,
        "expire_time": "2024-12-31T23:59:59Z",
        "interval": 60,           # 建议心跳间隔（秒）
        "heartbeat_timeout": 180, # 心跳超时（秒）
        "bound_devices": 1,
        "max_devices": 3,
        "commands": []            # 服务器命令，如 ["force_logout"]
    }
}
```

**commands 说明:**
- `[]`: 无命令
- `["force_logout"]`: 强制登出

---

### get_remote_variables(app_id=None)

获取远程变量列表。

**返回:**
```python
{
    "data": {
        "list": [
            {"key": "server_url", "value": "https://...", "description": "..."},
            {"key": "feature_enabled", "value": "true", "description": "..."}
        ]
    }
}
```

---

### get_remote_variables_as_object(app_id=None)

获取远程变量（键值对格式）。

**返回:**
```python
{
    "data": {
        "server_url": "https://...",
        "feature_enabled": "true"
    }
}
```

---

### get_remote_variable(key, app_id=None)

获取单个远程变量。

**参数:**
- `key` (str): 变量名

**返回:**
```python
{
    "data": {
        "exists": True,
        "key": "server_url",
        "value": "https://...",
        "description": "API服务器地址"
    }
}
```

---

### run_cloud_function(trigger_name, data=None, app_id=None)

执行云函数。

**参数:**
- `trigger_name` (str): 触发器名称
- `data` (dict, 可选): 传递给云函数的数据

**返回:**
```python
{
    "data": {
        "success": True,
        "result": { ... }  # 云函数返回值
    }
}
```

---

### get_app_info(app_id=None)

获取应用详情，包括版本号、下载地址、更新策略等。

**返回:**
```python
{
    "data": {
        "id": 1,
        "name": "我的应用",
        "app_secret": "xxx",

        # 版本和更新
        "version": "1.0.0",
        "download_url": "https://example.com/app.zip",
        "force_update": False,

        # 心跳配置
        "heart_interval": 60,
        "heartbeat_timeout_multiplier": 3,

        # 试用配置
        "trial_enabled": True,
        "trial_duration": 86400,
        "trial_device_limit": 1,

        # 状态
        "is_active": True
    }
}
```

**用途：**
- 检查客户端版本是否需要更新
- 获取下载地址进行自动更新
- 判断是否强制更新（`force_update=True` 时必须更新）

## 错误处理

```python
from netverify_client import NetVerifyClient, NetVerifyError

client = NetVerifyClient("http://localhost:3000/api", 1)

try:
    client.login("user", "wrong_password", "hwid")
except NetVerifyError as e:
    print(f"错误码: {e.code}")
    print(f"错误信息: {e.message}")
```

## 工具方法

```python
# 设置 token（手动）
client.set_token("eyJhbG...")

# 清除 token
client.clear_token()

# 检查是否已认证
if client.is_authenticated():
    client.heartbeat("hwid")
```

## 便捷函数

```python
from netverify_client import create_client

# 创建并自动登录
client = create_client(
    base_url="http://localhost:3000/api",
    app_id=1,
    username="user",
    password="pass",
    hwid="device-hwid"
)
```

## 完整示例

查看 `example.py` 获取更多使用示例。
