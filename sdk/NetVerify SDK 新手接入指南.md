# NetVerify SDK 接入指南（AI 优先）

> 本文件为 AI / LLM 优先阅读的接入指南。所有代码片段**可直接复制运行**，所有字段均列出精确类型与取值范围，不依赖外部文档。

- **SDK 路径**: `sdk/client/netverify_client.py`
- **语言**: Python 3.8+
- **HTTP 库依赖**: `requests`（必需）、`cryptography`（可选，启用响应解密）
- **API 前缀**: `{base_url}/client/*`、`{base_url}/cards/*`、`{base_url}/cloud/*`
- **时区**: 服务端统一东八区（Asia/Shanghai）
- **业务成功码**: `code == 20000`，其它均为失败

---

## 1. 最小可运行示例（30 秒接入）

```python
from netverify_client import NetVerifyClient, NetVerifyError

client = NetVerifyClient(
    base_url="https://yz.ledougc.com/api",  # 注意带 /api
    app_id=1,                                 # 后台 "应用管理" 里拿
)

HWID = "stable-machine-fingerprint"  # 必须稳定，换机后会被视为新设备

# 1) 注册（若应用开启试用 + 传 hwid，会自动发放试用期）
try:
    client.register("alice", "secret123", hwid=HWID, device_name="Alice 的 Mac")
except NetVerifyError as e:
    if e.code != 40000:  # 40000 可能是"用户已存在"，忽略
        raise

# 2) 登录（成功后 token 自动保存到 client._token）
client.login("alice", "secret123", hwid=HWID)

# 3) 校验授权状态
info = client.get_expire_time()["data"]
if not info["is_valid"]:
    raise RuntimeError(f"授权无效：{info['valid_message']}")

# 4) 进入心跳循环
import time
while True:
    r = client.heartbeat(hwid=HWID)["data"]
    if "force_logout" in r.get("commands", []):
        raise RuntimeError("服务器下发强制登出")
    time.sleep(r["interval"])
```

---

## 2. 客户端初始化参数（完整）

```python
NetVerifyClient(
    base_url: str,                          # 例 "https://yz.ledougc.com/api"（末尾 /api 不可少）
    app_id: int,                            # 后台应用 ID
    app_secret: Optional[str] = None,       # 仅"远程变量 / 云函数"接口需要（HMAC 签名）
    rsa_private_key: Optional[str] = None,  # 固定私钥模式（兼容老客户端），一般不用
    timeout: int = 30,                      # 秒
)
```

### 加密模式（二选一，SDK 自动处理）

| 模式 | 条件 | 行为 |
|---|---|---|
| **会话临时密钥**（推荐） | 安装了 `cryptography`，未传 `rsa_private_key` | SDK 启动时生成临时 RSA 密钥对，登录时把公钥发给服务端；服务端加密响应，SDK 用内存中的私钥自动解密 |
| **固定私钥** | 传入 `rsa_private_key` | 用你提供的固定私钥解密。仅在需要 AOT 预置密钥时使用 |
| **不加密** | 未装 `cryptography` | 服务端返回原始 JSON（部分接口如 `/client/app-info` 默认就不加密） |

> `/client/app-info/:appId` 永远返回明文（commit `dd5f7fc`），可安全地在启动时拉取，无需加密依赖。

---

## 3. 完整 API 参考

### 3.1 应用信息（无需登录）

| 方法 | HTTP | 鉴权 | 说明 |
|---|---|---|---|
| `get_app_info(app_id=None)` | GET `/client/app-info/{app_id}` | 无 | 公开信息：版本、公告、下载地址、心跳配置、`is_active` |
| `check_update(current_version, app_id=None)` | 同上 | 无 | 基于 `get_app_info` 比对版本，返回 `need_upgrade` / `force_upgrade` |

**建议**: SDK 启动第一步调用 `get_app_info` 检查 `is_active`，若 `False` 直接拒绝启动。

### 3.2 账号

| 方法 | HTTP | 鉴权 | 关键参数 |
|---|---|---|---|
| `register(username, password, hwid=None, device_name=None)` | POST `/client/register` | 无 | `hwid` 传了才能拿自动试用 |
| `login(username, password, hwid, device_name=None)` | POST `/client/login` | 无 | 成功后 `client._token` 自动填充 |
| `get_profile()` | GET `/client/profile` | JWT | 返回完整用户对象 |
| `get_expire_time()` | GET `/client/expire-time` | JWT | 轻量端点，仅返回到期/剩余秒数 |

### 3.3 充值

| 方法 | HTTP | 鉴权 | 说明 |
|---|---|---|---|
| `recharge(code, hwid=None)` | POST `/cards/redeem` | JWT | 卡密充值到当前登录账号 |
| `trial(hwid, app_id=None)` | POST `/cards/trial` | 无 | 申请试用（同 hwid 每应用仅一次）|

### 3.4 心跳

| 方法 | HTTP | 鉴权 | 说明 |
|---|---|---|---|
| `heartbeat(hwid, device_name=None)` | PUT `/client/heartbeat` | JWT | 服务端可下发 `commands`；服务端若返回 `new_token`，SDK 自动续期 |

### 3.5 远程变量（需要 `app_secret`）

| 方法 | HTTP | 鉴权 |
|---|---|---|
| `get_remote_variables(app_id=None)` | GET `/apps/{app_id}/remote-variables/client` | HMAC 签名 |
| `get_remote_variables_as_object(app_id=None)` | 同上 | 同上 |
| `get_remote_variable(key, app_id=None)` | 同上 | 同上 |

### 3.6 云函数

| 方法 | HTTP | 鉴权 |
|---|---|---|
| `run_cloud_function(trigger_name, data=None, app_id=None)` | POST `/cloud/run/{app_id}/{trigger_name}` | HMAC 签名 |

### 3.7 工具方法

```python
client.set_token(token)        # 手动设置 token（用于持久化恢复）
client.clear_token()           # 清除 token
client.is_authenticated()      # 是否已登录（仅检查 _token 是否存在）
client.token                   # property，读取当前 token
```

---

## 4. 关键数据结构（精确字段）

### 4.1 登录响应 `data`

```python
{
    "access_token": str,        # JWT，7 天有效
    "user": {
        "id": int,
        "username": str,
        "app_id": int,
        "is_active": bool,      # 账号级启用/禁用
        "expire_time": str | None,   # ISO 8601；9999-12-31 = 永久卡
        "max_devices": int,
    },
    "heart_interval": int,      # 建议心跳间隔（秒），一般 60
    "heartbeat_timeout": int,   # 服务端判定离线的超时（秒），一般 180
    "is_valid": bool,           # 授权是否可用
    "expire_time": str | None,
    "valid_message": str,       # 失效原因文本
}
```

`valid_message` 取值：

| 值 | 含义 | `is_valid` |
|---|---|---|
| `""` | 正常 | `True` |
| `"账号已被禁用"` | `user.is_active = False` | `False` |
| `"未激活，请充值"` | `expire_time = None` | `False` |
| `"授权已过期"` | `expire_time < now` | `False` |
| `"授权信息无效"` | 日期字段损坏 | `False` |

### 4.2 心跳响应 `data`

```python
{
    "success": bool,
    "is_active": bool,          # 综合账号启用状态 + 过期检查
    "expire_time": str | None,
    "username": str,
    "max_devices": int,
    "bound_devices": int,
    "interval": int,            # SDK 应据此调整循环间隔
    "heartbeat_timeout": int,
    "server_time": int,         # 毫秒
    "commands": list[str],      # 见下
    "new_token": str | None,    # 存在则 SDK 已自动替换
}
```

`commands` 当前唯一值：`"force_logout"` —— SDK 必须立即停止使用、清除 token、提示用户。

### 4.3 `get_expire_time()` 响应 `data`

```python
{
    "username": str,
    "is_valid": bool,
    "is_active": bool,
    "expire_time": str | None,      # ISO 8601
    "expire_timestamp": int | None, # Unix 秒
    "remaining_seconds": int,       # 剩余秒数；永久卡 ≈ 2.5e11
    "valid_message": str,
}
```

### 4.4 充值响应 `data`（永久卡兼容）

```python
{
    "success": True,
    "message": "激活成功",
    "expire_time": str,          # 永久卡 = "9999-12-31T15:59:59.000Z"（UTC，北京时间 23:59:59）
    "added_seconds": int,        # 永久卡为 0
    "is_permanent": bool,        # 2026-04 新增：标识该卡是否永久
    "max_devices": int,
}
```

---

## 5. 错误码速查

`NetVerifyError` 携带 `.code`（业务码）、`.message`、`.http_status`。

| 业务码 | HTTP | 含义 | 典型来源 |
|---|---|---|---|
| `20000` | 200 | 成功 | — |
| `40000` | 400 | 参数/业务错误 | 卡密无效、用户名已存在、hwid 缺失 |
| `40001`~`40004` | 4xx | 细分客户端错误 | — |
| `50000` | 500 | 服务端内部错误 | 需看服务端日志 |
| `50003` | 403 | 无权限 / 应用下线 | `e.is_app_disabled` 辅助判断 |
| `50008` | 401 | token 无效 | 需重新 `login()` |
| `50012` | 401 | token 过期 | 同上 |
| `50014` | 401 | 设备未绑定 / 设备被封禁 | 需要换 hwid 或联系管理员 |
| — | 429 | 限流 | `e.is_rate_limited == True` |

### 推荐的异常分派模板

```python
try:
    client.login(u, p, hwid)
except NetVerifyError as e:
    if e.is_rate_limited:
        ui.show("请求太频繁，稍后再试")
    elif e.is_app_disabled:
        ui.show("服务已下线，请联系管理员")
    elif e.http_status == 401:
        ui.show("账号或密码错误")
    elif e.code == 40000:
        ui.show(e.message)  # 一般是业务提示，可直接展示
    else:
        log.exception(e)
        ui.show("登录失败，请稍后重试")
except requests.RequestException as e:
    ui.show("网络异常，请检查连接")
```

---

## 6. 标准接入流程（状态机）

```
┌──────────────┐
│ 1. 启动自检  │  get_app_info() → 检查 is_active + check_update()
└──────┬───────┘
       │
┌──────▼───────┐
│ 2. 账号状态  │  本地有 token?
└──────┬───────┘
       │ 无/过期                    │ 有
┌──────▼───────┐            ┌──────▼───────┐
│ 3a. 登录/注册│            │ 3b. 恢复 token│  set_token(saved)
└──────┬───────┘            │    立刻心跳   │  heartbeat() 验证
       │                    └──────┬───────┘
       ▼                           │
┌──────────────┐                   │
│ 4. 授权校验  │◄──────────────────┘
│ get_expire_  │  is_valid? 是 → 进入主循环；否 → 提示充值/试用
│ time()       │
└──────┬───────┘
       │
┌──────▼───────┐
│ 5. 心跳循环  │  while True: heartbeat(); sleep(interval)
│              │  收到 force_logout → 清 token + 回 3a
└──────────────┘
```

---

## 7. 永久卡支持（2026-04 新增）

后台可创建"永久卡"（卡类型编辑页勾选"永久"快捷标签）。SDK 视角：

- **无需修改 SDK**。永久卡激活后 `expire_time = 9999-12-31 23:59:59`，所有 `expire_time < now` 判断自然通过。
- 新字段 `is_permanent: bool` 仅在充值响应里返回，供 UI 显示"永久"用，不是判断依据。
- **不要**在 SDK 里写 `if year == 9999` 作为激活条件；永远以 `is_valid` / 服务端判断为准。
- 展示优化（可选）：

```python
info = client.get_expire_time()["data"]
if info["remaining_seconds"] >= 100 * 365 * 86400:  # 大于 100 年
    expire_display = "永久"
else:
    expire_display = info["expire_time"]
```

---

## 8. HWID 策略（非常重要）

HWID 是设备指纹，服务端按 HWID 做**设备绑定**、**试用去重**、**心跳识别**。

**必须稳定**（同一设备每次返回相同值）、**必须唯一**（不同设备不冲突）、**不依赖网络**。

推荐组合：
- Windows: 主板序列号 + CPU ID + 硬盘序列号 → MD5/SHA1
- macOS: `IOPlatformUUID`（通过 `ioreg` 获取）
- Linux: `/etc/machine-id` 或 `dmidecode -s system-uuid`

**反模式（不要用）**：
- 网卡 MAC（虚拟网卡会变）
- 进程 UUID / PID
- 用户名 / 主机名（可修改）
- 每次启动 `uuid4()`（完全破坏绑定）

---

## 9. 签名算法（仅远程变量 / 云函数）

SDK 已封装，如果你要**自己用别的语言实现**，规则如下：

```
待签名字符串 = "app_id={appId}&nonce={nonce}&timestamp={timestamp}"
            + ("&" + 排序后的 query: k1=v1&k2=v2...)  if query
            + body_json_compact                        if body
signature  = HMAC_SHA256(app_secret, 待签名字符串)  # 十六进制小写
```

- `body_json_compact`: `json.dumps(body, separators=(',', ':'), ensure_ascii=False)`
- timestamp: Unix 秒字符串
- nonce: 一次性随机串（建议 UUID4 hex）
- 请求头：`x-app-id` / `x-timestamp` / `x-nonce` / `x-signature`

---

## 10. 常见陷阱

| 症状 | 原因 | 处理 |
|---|---|---|
| `解密失败` | 服务端开了加密但 SDK 未装 `cryptography` | `pip install cryptography` |
| `响应解密失败: ...padding` | 固定私钥模式但私钥与服务端公钥不匹配 | 不传 `rsa_private_key`，让 SDK 自动生成会话密钥 |
| 心跳 401 | token 过期（默认 7 天） | 捕获 `e.http_status == 401` → 重新 `login()` |
| 试用未发放 | `register` 没传 `hwid` | `hwid` 是拿试用的前提 |
| `ValueError: app_secret 未设置` | 调用远程变量 / 云函数时没配 secret | 初始化 client 时传 `app_secret` |
| 设备绑定超限 | 用户在 `max_devices` 台设备上都登录过 | 引导后台解绑旧设备，或充值带高 `device_limit` 的卡 |
| 429 限流 | 同 IP 触发限流（注册 5/min、兑换 10/min） | 退避重试，不要并发刷 |
| 心跳收到 `force_logout` | 服务端主动登出 | **必须**清 token + 回到登录页 |
| `server_time` 差很多 | 客户端时间错乱 | 不要用本地时间判断过期，信任服务端 `expire_timestamp` |

---

## 11. 最小持久化示例（token 复用）

避免每次启动都重新登录：

```python
import json, os

TOKEN_FILE = os.path.expanduser("~/.myapp/token.json")

def restore_session(client):
    if not os.path.exists(TOKEN_FILE):
        return False
    try:
        with open(TOKEN_FILE) as f:
            client.set_token(json.load(f)["token"])
        # 立刻做一次心跳验证 token 有效
        client.heartbeat(hwid=HWID)
        return True
    except NetVerifyError:
        client.clear_token()
        return False

def save_session(client):
    os.makedirs(os.path.dirname(TOKEN_FILE), exist_ok=True)
    with open(TOKEN_FILE, "w") as f:
        json.dump({"token": client.token}, f)
    os.chmod(TOKEN_FILE, 0o600)  # 仅当前用户可读

if not restore_session(client):
    client.login(u, p, HWID)
    save_session(client)
```

---

## 12. 测试检查清单（上线前）

- [ ] 正常流程：注册 → 登录 → 心跳 10 次 → 退出
- [ ] Token 持久化：重启程序能恢复会话
- [ ] Token 过期：手动等 7 天或删 `_token`，断言心跳 401 → 重新登录
- [ ] 强制登出：后台封禁账号 / 过期 → 下一次心跳收到 `force_logout`
- [ ] 设备绑定超限：同账号用 `max_devices + 1` 个 hwid 登录 → 第 N+1 次报错
- [ ] 试用去重：同 hwid 在同一应用注册两次，第二次 `trial_granted = False`
- [ ] 应用下线：后台 `is_active = False` → `get_app_info().data.is_active == False`
- [ ] 永久卡：充值永久卡 → `expire_time` 为 9999 → `is_valid = True` 永远成立
- [ ] 限流：快速注册 6 次 → 第 6 次收到 `e.is_rate_limited = True`
- [ ] 离线/网络差：断网 → `requests.RequestException`，不是 `NetVerifyError`
- [ ] 强制升级：本地版本 < `min_supported_version` → `check_update().force_upgrade = True`

---

## 附：端点 → SDK 方法 速查

| HTTP | Path | SDK |
|---|---|---|
| GET | `/client/app-info/:id` | `get_app_info()` / `check_update()` |
| POST | `/client/register` | `register()` |
| POST | `/client/login` | `login()` |
| GET | `/client/profile` | `get_profile()` |
| GET | `/client/expire-time` | `get_expire_time()` |
| PUT | `/client/heartbeat` | `heartbeat()` |
| POST | `/cards/redeem` | `recharge()` |
| POST | `/cards/trial` | `trial()` |
| GET | `/apps/:id/remote-variables/client` | `get_remote_variables*()` / `get_remote_variable()` |
| POST | `/cloud/run/:app_id/:trigger` | `run_cloud_function()` |
