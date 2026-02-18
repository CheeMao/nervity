# 网络验证系统 (NetVerify)

> 一套完整的软件授权验证解决方案，支持用户管理、代理商系统、卡密激活、云函数、设备绑定、心跳机制等功能。

## 技术栈

| 层级 | 技术 |
| :--- | :--- |
| **后端框架** | NestJS (Node.js) |
| **数据库** | MySQL 8.0 |
| **缓存** | Redis |
| **ORM** | TypeORM |
| **认证** | JWT + Passport.js |
| **云函数沙箱** | VM2 |
| **前端框架** | Vue 3 + Arco Design Pro |

## 项目结构

```
网络验证/
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── auth/           # 认证模块 (JWT/Local策略)
│   │   ├── users/          # 用户模块
│   │   ├── apps/           # 应用管理模块
│   │   ├── cards/          # 卡密模块
│   │   ├── agents/         # 代理商模块
│   │   ├── statistics/     # 统计模块
│   │   ├── cloud-functions/# 云函数模块
│   │   ├── devices/        # 设备管理模块 (含心跳机制)
│   │   ├── remote-variables/ # 远程变量模块
│   │   └── common/         # 公共中间件
│   └── package.json
├── arco-design-pro-vite/    # Vue 3 前端
│   ├── src/
│   │   ├── api/            # API 接口定义
│   │   ├── views/apps/     # 应用管理页面
│   │   ├── views/cards/    # 卡密管理页面
│   │   ├── views/users/    # 用户管理页面
│   │   ├── views/agent/    # 代理商面板
│   │   └── router/         # 路由配置
│   └── package.json
└── README.md
```

## 已实现功能 ✅

### 后端 API

#### 用户与认证
| 端点 | 功能 |
| :--- | :--- |
| `POST /users/register` | 用户注册（旧接口） |
| `POST /users/public-register` | 软件开发者/代理商注册 🆕 |
| `GET /users/developer-lookup` | 开发者账号查询 🆕 |
| `GET /users/profile` | 获取用户信息 |
| `GET /users` | 分页查询用户列表（管理员）|
| `PUT /users/:id` | 更新用户信息 |
| `DELETE /users/:id` | 删除用户 |
| `POST /auth/login` | 登录获取 JWT |

#### 终端用户 (End Users) 🆕
| 端点 | 功能 |
| :--- | :--- |
| `GET /end-users` | 分页查询终端用户列表 |
| `POST /end-users` | 创建终端用户 |
| `GET /end-users/:id` | 获取终端用户详情 |
| `PUT /end-users/:id` | 更新终端用户 |
| `DELETE /end-users/:id` | 删除终端用户 |
| `GET /end-users/hwid/:hwid` | 按HWID查询用户 |
| `PUT /end-users/:id/unbind-hwid` | 解绑HWID |

#### 应用管理
| 端点 | 功能 |
| :--- | :--- |
| `GET /apps` | 分页查询应用列表 |
| `POST /apps` | 创建应用 |
| `PUT /apps/:id` | 更新应用 |
| `DELETE /apps/:id` | 删除应用 |

#### 卡密管理
| 端点 | 功能 |
| :--- | :--- |
| `GET /cards` | 分页查询卡密列表 |
| `POST /cards/generate` | 批量生成卡密 |
| `PUT /cards/:id/ban` | 禁用卡密 |
| `DELETE /cards/:id` | 删除卡密 |
| `POST /cards/redeem` | 使用卡密充值 |

#### 统计分析
| 端点 | 功能 |
| :--- | :--- |
| `GET /statistics/overview` | 总览数据（用户/应用/卡密统计）|
| `GET /statistics/user-trend` | 用户增长趋势 |
| `GET /statistics/card-stats` | 卡密使用统计 |

#### 代理商系统
| 端点 | 功能 |
| :--- | :--- |
| `GET /agents/dashboard` | 代理商仪表盘 |
| `GET /agents/users` | 代理商下属用户 |
| `GET /agents/cards` | 代理商卡密记录 |
| `POST /agents/cards/generate` | 代理商生成卡密 |

#### 云函数
| 端点 | 功能 |
| :--- | :--- |
| `GET /cloud/list` | 分页查询云函数列表 |
| `POST /cloud/create` | 创建云函数 |
| `GET /cloud/:id` | 获取云函数详情 |
| `PUT /cloud/:id` | 更新云函数 |
| `DELETE /cloud/:id` | 删除云函数 |
| `POST /cloud/run/:appId/:name` | 执行云函数 |

#### 设备管理与心跳机制 🆕
| 端点 | 功能 |
| :--- | :--- |
| `GET /devices` | 分页查询设备列表 |
| `GET /devices/:id` | 获取设备详情 |
| `GET /devices/by-hwid/:hwid` | 按HWID查询设备 |
| `GET /devices/online-count` | 获取在线设备数量 |
| `POST /devices/heartbeat` | 客户端心跳上报 |
| `GET /devices/heartbeat/check/:hwid` | 检查设备在线状态 |
| `PUT /devices/:id/ban` | 封禁设备 |
| `PUT /devices/:id/unban` | 解封设备 |
| `DELETE /devices/:id` | 删除设备 |

#### 远程变量 🆕
| 端点 | 功能 |
| :--- | :--- |
| `GET /remote-variables` | 分页查询变量列表 |
| `GET /remote-variables/:id` | 获取变量详情 |
| `POST /remote-variables` | 创建变量 |
| `PUT /remote-variables/:id` | 更新变量 |
| `DELETE /remote-variables/:id` | 删除变量 |
| `GET /remote-variables/app/:appId` | 获取应用的所有变量（客户端）|
| `GET /remote-variables/app/:appId/object` | 获取变量键值对（客户端）|
| `GET /remote-variables/app/:appId/key/:key` | 获取单个变量值（客户端）|

#### 余额日志 (Balance Logs) 🆕
| 端点 | 功能 |
| :--- | :--- |
| `GET /balance-logs` | 分页查询余额变动记录 |
| `GET /balance-logs/statistics` | 获取余额统计数据 |

#### 试用功能 🆕
| 端点 | 功能 |
| :--- | :--- |
| `POST /cards/trial` | 申请试用激活 |
| `PUT /apps/:id` | 更新应用（含试用配置） |

#### 数据导出 🆕
| 端点 | 功能 |
| :--- | :--- |
| `GET /cards/export` | 导出卡密数据 (Excel) |
| `GET /end-users/export` | 导出终端用户数据 (Excel) |
| `GET /devices/export` | 导出设备数据 (Excel) |


### 前端管理后台

| 模块 | 访问路径 | 功能 |
| :--- | :--- | :--- |
| **仪表盘** | `/dashboard/workplace` | 数据总览（真实 API 数据）|
| **应用管理** | `/apps/list` | 应用列表、创建、编辑、删除、试用配置 🆕 |
| **卡密管理** | `/cards/list` | 卡密列表、批量生成、禁用、删除、导出 🆕 |
| **终端用户** | `/end-users/list` | 终端用户列表、HWID解绑、导出 🆕 |
| **设备管理** | `/devices/list` | 设备列表、封禁管理、导出 🆕 |
| **云函数** | `/cloud/functions` | 云函数管理、在线编辑 |
| **远程变量** | `/remote-variables/list` | 远程变量管理 |
| **操作日志** | `/operation-logs/list` | 操作审计日志 |
| **黑名单** | `/access-control/blacklist` | IP/HWID 黑名单管理 |
| **用户管理** | `/users/list` | 系统用户列表、搜索、编辑、删除（管理员）|
| **代理商仪表盘** | `/agent/dashboard` | 代理商数据总览（代理商）|
| **代理商用户** | `/agent/users` | 下属用户管理（代理商）|
| **代理商卡密** | `/agent/cards` | 卡密记录管理（代理商）|

### 数据库实体

- `User` - 系统用户 (含RBAC角色、余额)
- `EndUser` - 终端用户 (软件使用者，含试用标记) 🆕
- `App` - 应用 (含心跳间隔、试用配置)
- `Card` - 卡密 (统一时长卡)
- `Agent` - 代理商
- `CloudFunction` - 云函数
- `Device` - 设备信息 (含心跳状态、封禁状态)
- `RemoteVariable` - 远程变量
- `BalanceLog` - 余额变动记录
- `Role` - RBAC 角色
- `Permission` - RBAC 权限
- `OperationLog` - 操作日志
- `Blacklist` - IP/HWID 黑名单

### 安全特性

- JWT 令牌认证
- RBAC 角色权限控制 🆕
- 密码哈希 (bcrypt)
- 签名验证中间件 (HMAC)
- 防重放时间戳检查
- VM2 云函数沙箱隔离
- 设备封禁机制 🆕

---

## 开发路线图 📋

### Phase 1: 核心功能 ✅ 已完成
- [x] 用户管理系统
- [x] 应用管理
- [x] 卡密系统
- [x] 代理商系统
- [x] 统计分析
- [x] 云函数 (VM2沙箱)
- [x] **设备管理 API**
- [x] **心跳机制**
- [x] **远程变量 API**
- [x] **终端用户管理 (End Users)**
- [x] **余额日志系统**
- [x] **RBAC 权限系统**

### Phase 2: 前端管理后台 ✅ 已完成
- [x] Vue 3 + Arco Design 管理面板
- [x] 仪表盘数据可视化
- [x] 代理商独立面板
- [x] 应用管理界面
- [x] 卡密管理界面
- [x] 系统用户管理界面
- [x] **终端用户管理界面**
- [x] **设备管理界面**
- [x] **云函数管理界面**
- [x] **远程变量管理界面**

### Phase 3: 安全增强 ✅ 已完成
- [x] 请求签名验证 (时间戳 + HMAC)
- [x] 通信加密 (AES/RSA 混合加密)
- [x] IP/HWID 黑名单系统
- [x] 操作日志审计
- [x] 管理员二次验证 (TOTP)

### Phase 4: 商业化功能 ✅ 已完成
- [x] 试用功能（可配置是否开启、试用时长）

### Phase 5: 体验优化 ✅ 已完成
- [ ] Monaco Editor 云函数编辑器
- [x] 数据导出 (Excel)
- [x] Swagger API 文档

---

## 快速开始

### 1. 启动数据库

```bash
# 启动 MySQL & Redis
docker start netverify-mysql netverify-redis

# 如果容器不存在，创建新容器
docker run --name netverify-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=netverify -p 3306:3306 -d mysql:8.0
docker run --name netverify-redis -p 6379:6379 -d redis
```

### 2. 启动后端

```bash
cd backend
cp .env.example .env  # 配置数据库连接
npm install
npm run start:dev
```

ß
后端地址: `http://localhost:3000`

### 3. 启动前端

```bash
cd arco-design-pro-vite
npm install
npm run dev
```

前端地址: `http://localhost:5173`

---

## API 测试示例

### 基础功能

```bash
# 用户注册（软件开发者）
curl -X POST http://localhost:3000/users/public-register \
  -H "Content-Type: application/json" \
  -d '{"username":"dev01","password":"password123","registerType":"developer"}'

# 用户注册（代理商 - 需提供上级开发者账号，默认禁用）
curl -X POST http://localhost:3000/users/public-register \
  -H "Content-Type: application/json" \
  -d '{"username":"agent01","password":"password123","registerType":"agent","developerUsername":"dev01"}'

# 开发者账号查询
curl http://localhost:3000/users/developer-lookup?username=dev01

# 登录获取 JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# 创建应用
curl -X POST http://localhost:3000/apps \
  -H "Content-Type: application/json" \
  -d '{"name":"MyApp","app_secret":"secret","version":"1.0.0"}'

# 生成卡密 (统一时长卡，value 为秒)
curl -X POST http://localhost:3000/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"value":259200,"app_id":1,"count":5}'

# 核销卡密 (支持 HWID 激活或用户续费)
curl -X POST http://localhost:3000/cards/redeem \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_CARD_CODE","hwid":"device-hwid-001"}'
```

### 心跳机制 🆕

```bash
# 客户端心跳上报
curl -X POST http://localhost:3000/devices/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"hwid":"device-hwid-001","app_id":1}'

# 检查设备在线状态
curl http://localhost:3000/devices/heartbeat/check/device-hwid-001

# 获取在线设备数量
curl http://localhost:3000/devices/online-count
```

### 远程变量 🆕

```bash
# 创建远程变量
curl -X POST http://localhost:3000/remote-variables \
  -H "Content-Type: application/json" \
  -d '{"key":"notice","value":"系统维护公告","app_id":1}'

# 客户端获取应用变量
curl http://localhost:3000/remote-variables/app/1

# 客户端获取单个变量
curl http://localhost:3000/remote-variables/app/1/key/notice
```

---

## 许可证

MIT License
