# NetVerify 项目审计（2026-09-12）

结论：当前项目可以编译，但认证、管理权限和计费链路存在严重漏洞。应先修复匿名写接口、管理员账号接管和云函数执行风险，再处理授权一致性、部署和性能问题。

本次检查涵盖后端主要 Controller / Service / Guard / Entity、前端 API / 登录状态 / 业务表单、Python SDK、数据库建表文件及部署配置。未修改业务代码，未加载业务环境变量，未连接真实数据库，未调用现有服务的写接口，也未执行沙箱逃逸攻击。

验证采用真实 Nest 路由、ValidationPipe、JWT 策略、业务 Service 与内存替身仓库；部分路由验证使用替身 Service 来观察路由是否能到达处理函数。并发测试模拟可发生的请求交错，证明缺少锁与事务时的错误状态，不代表真实数据库压测结果。

P0：应立即处理的账号接管、匿名管理写入或服务器执行风险。P1：授权、资金、数据隔离和部署阻断问题。P2：明确的功能错误、协议缺陷和维护问题。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| 后端 `tsc --noEmit --incremental false` | 通过 |
| 后端 `npm run build` | 通过 |
| 前端 `npm run type:check` | 通过 |
| 前端 `npm run build` | 通过 |
| 后端 `npm test -- --runInBand --watch=false` | 失败：No tests found，0 个匹配测试 |
| 第一批隔离验证 | 17 / 17 个异常场景得到确认 |
| 补充隔离验证 | 6 / 6 个异常场景得到确认 |
| 后端 npm audit | 35 个受影响依赖项：2 critical、18 high、13 moderate、2 low |
| 前端 npm audit | 93 个受影响依赖项：2 critical、41 high、48 moderate、2 low |

依赖计数包含开发依赖和间接依赖，是 npm 的依赖项统计，不能当作可利用漏洞数量。后端另一项 critical 是开发依赖 handlebars；前端两项 critical（decompress、fast-xml-parser）在当前 lockfile 中也属于开发依赖。vm2 则直接进入后端运行时。

当前验证使用 Node v25.4.0 和已有 node_modules，没有重新安装或升级依赖；这不代表仓库的 Node 18 Docker 镜像兼容。


## 01. [P0] 旧公开注册接口允许指定管理员角色和余额

`POST /api/users/register` 无鉴权，参数类型为 `any`。Service 将请求对象直接展开给实体，并接受调用者提供的 `role_id`。全局 ValidationPipe 不会给 `any` 应用 DTO 字段白名单。匿名调用者因此可以指定 `role=admin`、已有管理员 RBAC 角色 ID、激活状态与余额。正常公开注册中“代理商需审核”的规则也可被绕过。

代码：[users.controller.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.controller.ts:30)；[users.service.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.service.ts:32)。

验证：隔离 HTTP 请求返回 201，保存结果保留了请求指定的 admin 角色、role_id 和 888 余额。使用的是合成账号和内存仓库。

建议：移除旧公开接口，或复用严格的公开注册 DTO 与业务逻辑；角色、RBAC 关系、激活状态、余额、主键全部由服务端决定。


## 02. [P0] 终端用户 Token 可以修改后台管理员密码和余额

管理端与终端用户共用 JwtAuthGuard。JwtStrategy 对终端用户校验后仍返回通用的 `userId`；`PUT /users/:id` 没有管理端身份门槛，也没有目标账号归属校验。UsersService.update 只检查“分配角色”这一种动作，提交 password、balance、is_active 时不经过这一检查。`DELETE /users/:id` 也只要求有 Token。`/users/change-password` 还会把终端用户 ID 当作后台用户 ID 使用。

代码：[jwt.strategy.ts](/Users/cheemao/Apps/Ner/backend/src/auth/strategies/jwt.strategy.ts:25)；[users.controller.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.controller.ts:138)；[users.service.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.service.ts:236)。

验证：用 sub=77、type=end_user 的真实签名 JWT 调用 PUT /users/1，得到 200；后台合成管理员的密码哈希和余额均发生变化。无需角色变更字段。

建议：区分管理端与客户端身份，管理接口显式限制 Token 类型；用户详情、修改、删除都执行操作权限和目标账号归属检查；密码修改、余额调整、角色变更使用独立 DTO 和权限。


## 03. [P0] 多组管理接口完全没有鉴权

云函数详情/修改/删除、远程变量详情/修改/删除、卡密封禁/解封/删除、设备详情/封禁/解封/删除均存在未配置 Guard 的路由。AppModule 没有兜底的全局认证 Guard，Service 也直接按 ID 操作资源。前端菜单权限和 Swagger 的描述不会阻止直接 HTTP 请求。

代码：[cloud-functions.controller.ts](/Users/cheemao/Apps/Ner/backend/src/cloud-functions/cloud-functions.controller.ts:104)；[remote-variables.controller.ts](/Users/cheemao/Apps/Ner/backend/src/remote-variables/remote-variables.controller.ts:82)；[cards.controller.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.controller.ts:162)；[devices.controller.ts](/Users/cheemao/Apps/Ner/backend/src/devices/devices.controller.ts:169)；[app.module.ts](/Users/cheemao/Apps/Ner/backend/src/app.module.ts:69)。

验证：隔离路由中，匿名 PUT /cloud/7、PUT /remote-variables/7、PUT /devices/7/ban、DELETE /cards/7 均返回 200，并进入对应处理逻辑。这里只修改了替身数据。

建议：让管理路由默认要求管理端认证，真正公开的客户端路由单独声明；每个写接口再要求操作权限和资源归属。补匿名、终端用户、他租户、正确用户四类权限测试。


## 04. [P0] 云函数运行时 vm2 版本命中严重沙箱逃逸公告

本地安装 vm2 3.10.4，云函数直接在后端进程中调用 `new VM(...).run(...)`。维护者公告 GHSA-grj5-jjm8-h35p 明确影响 <=3.10.4，并描述可在主机执行任意命令。结合匿名云函数修改和下述应用密钥泄露，存在形成远程代码执行链的风险。这里的整条攻击链是基于代码与公告的推断，未执行实际逃逸。

来源：[vm2 维护者安全公告](https://github.com/patriksimek/vm2/security/advisories/GHSA-grj5-jjm8-h35p)。

代码：[cloud-functions.service.ts](/Users/cheemao/Apps/Ner/backend/src/cloud-functions/cloud-functions.service.ts:87)；[package.json](/Users/cheemao/Apps/Ner/backend/package.json:55)。

验证：npm audit 将 vm2 标为 critical；本地版本与维护者公告受影响范围一致。未执行公告中的系统命令或文件写入 PoC。

建议：先关闭未受控的云函数管理/执行入口；更新受影响依赖并逐项复核公告适用条件。长期将不可信代码执行放入独立、最小权限的进程或容器，限制 CPU、内存、文件和网络访问。单个 timeout 不是安全隔离边界。


## 05. [P1] 应用签名密钥通过公开详情和关联对象泄露

`GET /api/apps/:id` 无鉴权并返回完整 App 实体，app_secret 没有 select:false。设备、云函数、变量的公开详情还会返回关联 app。`GET /client/profile` 也直接返回加载了 app 关系的 EndUser。另一个泄露位置是签名失败日志，它直接输出 AppSecret。新建的公开 app-info 接口虽做了字段白名单，但旧入口仍在。

代码：[apps.controller.ts](/Users/cheemao/Apps/Ner/backend/src/apps/apps.controller.ts:64)；[app.entity.ts](/Users/cheemao/Apps/Ner/backend/src/apps/entities/app.entity.ts:20)；[end-users.service.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.service.ts:150)；[signature.guard.ts](/Users/cheemao/Apps/Ner/backend/src/common/guards/signature.guard.ts:104)。

验证：隔离匿名 GET /apps/10 返回了合成 app_secret。其他关系泄露由实体与返回路径静态确认，未读取真实密钥。

建议：公开返回值使用明确的响应 DTO，不序列化完整关系实体；密钥仅在受控管理流程提供。删除敏感日志字段；修复泄露入口后轮换已暴露的应用密钥。


## 06. [P1] 列表做了租户过滤，详情和写操作却绕过过滤

DataPermissionService 主要用在列表查询。AppsController.update/remove 不接收调用者；终端用户和卡类型的详情/修改/删除只有功能权限而无资源归属检查；云函数、远程变量 create 声称只能为自己应用创建，Service 实际只写入 creator_id，没有验证 app_id 的拥有者。拥有相同功能权限的开发者可直接传其他租户资源 ID。旧 create-developer 路径也没有复用统一创建接口的可分配角色检查。

代码：[apps.controller.ts](/Users/cheemao/Apps/Ner/backend/src/apps/apps.controller.ts:80)；[end-users.controller.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.controller.ts:89)；[card-types.service.ts](/Users/cheemao/Apps/Ner/backend/src/card-types/card-types.service.ts:71)；[cloud-functions.service.ts](/Users/cheemao/Apps/Ner/backend/src/cloud-functions/cloud-functions.service.ts:19)；[remote-variables.service.ts](/Users/cheemao/Apps/Ner/backend/src/remote-variables/remote-variables.service.ts:84)；[users.controller.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.controller.ts:166)。

验证：已逐条核对 Controller 到 Service 参数与数据库操作路径。当前方法根本没有接收足够的调用者上下文，不能执行目标归属判断；未做真实跨租户数据库写入。

建议：将“可访问目标资源”收敛到 Service 查询条件，读写都带所属应用/创建者约束；创建子资源先校验父应用；所有同类创建入口共用角色分配规则。


## 07. [P1] 制卡参数可绕过扣费，负数数量反而充值

`/cards/generate` 使用 any DTO：不传 card_type_id、直接传 value 时，代理商跳过整个定价扣款分支并生成有效卡密。传负数 count 时总价变成负数，余额减去负数后增加，循环却不生成卡。数量也未限制为正整数，存在小数导致扣费数量与生成数量不同的问题。旧 `/agents/cards/generate` 另有独立实现，同样接受负数，且未验证应用归属；两套计价规则也不一致。

代码：[cards.controller.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.controller.ts:98)；[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:50)；[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:91)；[agents.service.ts](/Users/cheemao/Apps/Ner/backend/src/agents/agents.service.ts:143)。

验证：合成余额 100：省略 card_type_id 成功生成 1 张卡且扣款为 0；单价 10、count=-2 时余额变为 120、生成 0 张卡。旧代理接口也复现了 10→12。

建议：统一制卡入口和计价服务；代理商必须选择所属应用可售的卡类，并检查 card_type.app_id 与目标应用一致、agent_visible 等规则；count 使用 IsInt、Min(1) 和业务上限；拒绝任意实体字段透传。


## 08. [P1] 扣费、日志和卡密保存缺少同一事务与并发控制

制卡先查询余额，再用绝对值 UPDATE 扣款，然后写日志，最后保存卡密。余额校验和更新没有原子条件，也没有行锁。失败时前面扣款不能回滚；并发订单读取同一余额后会相互覆盖扣款。

代码：[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:130)；[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:165)；[agents.service.ts](/Users/cheemao/Apps/Ner/backend/src/agents/agents.service.ts:168)。

验证：合成卡密保存异常后余额由 100 降为 80，未回滚。两笔各 60 的并发订单生成 12 张单价 10 的卡，最终余额为 40，即仅体现了一笔扣款。

建议：在同一数据库事务中完成原子扣款、卡密保存、账本记录；使用 balance >= cost 的条件更新并检查 affected，或锁定余额行。金额按最小货币单位整数或精确 decimal 计算。


## 09. [P1] 同一卡密可并发兑换，授权与消费状态可不一致

useCard 先查询 unused，更新用户到期时间后才更新卡状态。末尾 UPDATE 只按 id，没有附加 status=unused 条件，也没有事务或锁。两个请求可同时通过检查；用户更新成功、卡状态更新失败时也会留下仍可兑换的卡。不同卡同时续期同一用户还可能覆盖到期时间。

代码：[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:215)；[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:289)；[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:298)。

验证：内存仓库模拟并发读取，两位用户对同一卡兑换都得到 success=true，两个用户的授权时间均被更新。真实数据库锁竞争、回滚与重试仍需 MySQL 集成测试。

建议：在一个事务内锁定卡与用户，或原子占用未使用卡并验证 affected=1；串行化同一用户续期；把设备绑定和额度更新纳入一致性设计。


## 10. [P1] 2FA 登录验证与启用流程均不完整

有四个独立问题：UsersService.findOne 的显式 select 不包含 is_totp_enabled，正常登录读取不到开关；AuthService.login 即使收到开关，也只要求 code 非空而未验证验证码；当前 otplib 导出没有 authenticator，相关调用会 TypeError；enable/disable 从 req.user.sub 取 ID，但 JwtStrategy 返回的是 id/userId。`@ts-expect-error` 掩盖了依赖 API 不兼容。

代码：[users.service.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.service.ts:128)；[auth.service.ts](/Users/cheemao/Apps/Ner/backend/src/auth/auth.service.ts:48)；[auth.service.ts](/Users/cheemao/Apps/Ner/backend/src/auth/auth.service.ts:94)；[auth.controller.ts](/Users/cheemao/Apps/Ner/backend/src/auth/auth.controller.ts:73)。

验证：直接向真实 AuthService.login 传 is_totp_enabled=true 与任意非空错误字符串，仍签发 JWT；generateTotpSecret 在当前依赖下抛 TypeError。其余两点由调用链确认。

建议：按实际安装 otplib API 完成验证码校验和密钥生成；显式加载开关与必要密钥；统一使用 userId；增加“已启用但无验证码、错误码、正确码、启用/禁用”的端到端测试。


## 11. [P1] 后台账号停用、删除、密码和权限变化不会及时撤销 JWT

JwtStrategy 只有 end_user 分支查库。后台 Token 的 role、permissions、parent_id 完全采信签发时快照，因此禁用或删除后台账号、修改密码或撤销权限后，旧 Token 仍能使用到自然过期。后台 expire_at 也未用于登录或 Token 校验。

代码：[jwt.strategy.ts](/Users/cheemao/Apps/Ner/backend/src/auth/strategies/jwt.strategy.ts:27)；[auth.module.ts](/Users/cheemao/Apps/Ner/backend/src/auth/auth.module.ts:23)；[users.service.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.service.ts:530)。

验证：真实 JwtStrategy.validate 对后台负载直接放行且没有任何账户查询；Token 默认有效期为 1d。未通过实际禁用现有账号来验证。

建议：对后台用户验证当前存在性、启用和到期状态；维护 token_version/session_version，在密码、权限、账号状态变化时失效旧会话；身份和权限缓存应有可控失效机制。


## 12. [P1] 未充值用户在心跳中被报告为有效授权

登录和 expire-time 把 expire_time=null 判为未激活；heartbeat 却计算 `isExpired = user.expire_time && ...`，随后 `isActive = user.is_active && !isExpired`。因此启用但从未充值的用户得到 is_active=true。非法日期也会落入相似分支。允许未激活用户登录以便充值是合理的，但各接口必须一致地报告未授权。

代码：[client-auth.controller.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/client-auth.controller.ts:241)；[end-users.service.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.service.ts:446)。

验证：真实 ClientAuthController 在隔离 HTTP 测试中对 expire_time=null 返回 success=true、is_active=true，并刷新 Token。

建议：集中计算授权状态：时间必须存在、可解析且未过期，永久授权使用显式规则；区分 account_enabled、license_valid 与 transport_success，不复用含义不同的 is_active。


## 13. [P1] 试用历史依赖会改变的 HWID，可重复领取

注册以 end_users(app_id, hwid, has_used_trial) 查找试用记录，但登录会把同一条用户记录的 hwid 改成当前设备。先从 A 注册领试用，再首次登录 B，就把历史记录从 A 移到了 B；随后用 A 注册另一个账号又能领到试用。并发注册的“查询后保存”也没有唯一约束来保护一次性领取。

代码：[end-users.service.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.service.ts:291)；[end-users.service.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.service.ts:417)。

验证：调用真实 clientRegister→clientLogin→clientRegister：原设备 A 的两次注册均得到 trial_granted=true，第一次账号的 hwid 已变为 B。

建议：使用独立、不可随登录变化的 trial_claims 记录，以 app_id + 设备标识建立唯一约束，在事务中发放试用。设备解绑、账号删除和试用历史应有明确的保留策略。


## 14. [P1] 响应加密的会话键按用户保存，多个设备互相覆盖

SessionKeyStore 仅使用 userId 作为公钥索引，而 SDK 每个实例生成独立 RSA 密钥对。同一账号在 B 设备登录后，后端所有响应改用 B 的公钥，A 无法再解密。内存存储在服务重启/多进程之间也不共享。另外，签名方式访问云函数/变量时没有 JWT 用户上下文，SDK 的 _request_with_signature 也不发送 Token，拦截器找不到此前的会话公钥：无固定公钥时会返回明文，有固定公钥时自动临时密钥客户端可能解不开。

代码：[session-key.store.ts](/Users/cheemao/Apps/Ner/backend/src/common/services/session-key.store.ts:22)；[end-users.service.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.service.ts:422)；[response-encryption.interceptor.ts](/Users/cheemao/Apps/Ner/backend/src/common/interceptors/response-encryption.interceptor.ts:107)；[netverify_client.py](/Users/cheemao/Apps/Ner/sdk/client/netverify_client.py:501)。

验证：用两套真实 RSA 密钥模拟两设备：覆盖公钥后，A 私钥解密失败、B 成功。签名接口公钥缺失由 SDK、Guard、拦截器链路确认。

建议：以 session_id/jti 绑定每个会话与设备，Token 带会话标识，公钥和失效状态使用共享、有 TTL 的存储；明确签名接口如何关联会话，并使“强制加密”在没有密钥时明确失败。


## 15. [P1] 余额汇总覆盖了用户过滤条件，返回平台总金额

getStatistics 先 where(user_id)，随后 clone().where(amount > 0) 和 clone().where(amount < 0)。第二次 where 替换原条件，因此 totalCount/latestLogs 仍可能是个人数据，而 totalIncome/totalExpense/currentBalance 却取全平台数据，既统计错误又泄露汇总。

代码：[balance-logs.service.ts](/Users/cheemao/Apps/Ner/backend/src/balance-logs/balance-logs.service.ts:75)；[balance-logs.service.ts](/Users/cheemao/Apps/Ner/backend/src/balance-logs/balance-logs.service.ts:91)。

验证：使用真实 TypeORM QueryBuilder 离线生成 SQL，两个 SUM 查询的 WHERE 均只有 amount 条件，没有 user_id。没有连接数据库。

建议：把后续条件改为 andWhere，并对统计、列表使用同一权限范围；当前余额应有清晰账本口径，不能将不完整日志差额误当实际余额。


## 16. [P1] 黑名单管理存在，但请求链没有执行黑名单检查

BlacklistService 能保存和缓存规则，BlacklistGuard 也有实现，但项目没有注册或使用该 Guard；登录、注册、心跳路径都没有调用 isBlocked；另有管理端 check 接口仅用于主动查询某条规则是否命中。因此在管理页封禁 IP/HWID 后，登录/注册/心跳不会因这份黑名单被拦截。

代码：[blacklist.guard.ts](/Users/cheemao/Apps/Ner/backend/src/common/guards/blacklist.guard.ts:10)；[access-control.module.ts](/Users/cheemao/Apps/Ner/backend/src/access-control/access-control.module.ts:15)；[app.module.ts](/Users/cheemao/Apps/Ner/backend/src/app.module.ts:69)。

验证：全文引用检索确认 BlacklistGuard 仅出现在定义文件，没有使用点；isBlocked 的另外一个调用点是管理端手动 check 接口，不能拦截正常业务请求。设备表的 is_banned 是另一套机制。

建议：将黑名单校验接入适用的客户端和认证请求链，明确全局/应用级范围；不要把某开发者维护的规则直接变成全平台规则。多个实例间同步缓存失效。


## 17. [P1] 默认数据库配置与部署镜像不匹配当前实现

数据库类型默认 postgres，但 .env.example 未设置 DB_TYPE，端口/账号默认值和时区 SQL 却按 MySQL 编写；实体含 PostgreSQL 不支持的 datetime，兑换、统计又有 MySQL 专属 SQL。Dockerfile 仍为 node:18-alpine，而 @nestjs/core 11.1.13 声明 Node>=20，uuid 13 是 ESM 包、当前输出又使用 CommonJS require。

此外 synchronize=false，但没有正式迁移链；随库 SQL 缺少新实体字段（如 app.min_supported_version、card.is_permanent、end_users.card_creator_id），device.hwid 仍是唯一索引，与现模型“同设备允许多用户”冲突。按旧 SQL 恢复不能直接视为可部署状态。

代码：[database.module.ts](/Users/cheemao/Apps/Ner/backend/src/database/database.module.ts:12)；[Dockerfile](/Users/cheemao/Apps/Ner/backend/Dockerfile:3)；[tsconfig.json](/Users/cheemao/Apps/Ner/backend/tsconfig.json:3)；[package-lock.json](/Users/cheemao/Apps/Ner/backend/package-lock.json:2091)；[netverify_backup_57_compatible.sql](/Users/cheemao/Apps/Ner/netverify_backup_57_compatible.sql:184)。

验证：未连接数据库的 PostgreSQL 元数据校验已报 datetime 不受支持。Node 版本和 ESM 冲突依据镜像及本地包声明；未实际构建 Docker 镜像。SQL 仅提取 DDL 比对，没有查看或披露备份中的账户行。

建议：明确唯一支持的数据库或完整实现方言适配；启动时验证必需配置；建立从空库及旧版本升级的迁移；统一实际受支持的 Node 版本和模块格式，使用 lockfile 安装并在同版本容器验证启动。


## 其他明确问题

以下为较局部的功能和协议问题，适合在上述高风险修复后处理。

| 优先级 | 问题及触发条件 | 定位及建议 |
| --- | --- | --- |
| P2 | 设备、终端用户导出路由被 `GET :id` 抢先匹配，export 转成 NaN；真实路由替身验证已确认。 | [devices.controller.ts](/Users/cheemao/Apps/Ner/backend/src/devices/devices.controller.ts:161)、[end-users.controller.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.controller.ts:62)。固定路由放在参数路由前，参数使用 ParseIntPipe。终端用户导出目前还复用了默认分页，需要明确导出全量还是当前筛选页。 |
| P2 | 登录配置为每分钟 30 次，却实际同时应用 register=5、redeem=10 等策略，第 6 次登录即 429。 | [app.module.ts](/Users/cheemao/Apps/Ner/backend/src/app.module.ts:33)、[client-auth.controller.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/client-auth.controller.ts:138)。按路由显式跳过不适用策略；公共注册的另两条 users 路由也应有合理限流。 |
| P2 | 新登录按 `(hwid,end_user_id)` 绑定，旧设备服务却仅按 hwid 找第一条；兑换使用 force=true 可能抢占其他用户的记录。同 HWID 不同用户存在时也可能误报绑定上限。 | [devices.service.ts](/Users/cheemao/Apps/Ner/backend/src/devices/devices.service.ts:323)、[cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:240)。统一设备身份键；新建记录不得覆写别人的绑定。隔离 Service 测试已复现抢占。 |
| P2 | 设备离线清理函数没有调用者，列表/在线数依赖持久化 online 状态，断线后可长期显示在线；checkDeviceStatus 又固定使用两分钟，与应用配置不一致。 | [devices.service.ts](/Users/cheemao/Apps/Ner/backend/src/devices/devices.service.ts:272)。用最后心跳和应用 timeout 计算在线状态或接入定时更新；时间口径一致。 |
| P2 | 登录和心跳都“count 后 insert”绑定设备，缺少用户级并发锁；新实体也没有 `(app_id,end_user_id,hwid)` 唯一约束。 | [end-users.service.ts](/Users/cheemao/Apps/Ner/backend/src/end-users/end-users.service.ts:388)、[device.entity.ts](/Users/cheemao/Apps/Ner/backend/src/devices/entities/device.entity.ts:25)。对同一用户并发绑定加事务锁并补复合唯一约束。此项静态确认，未做真实数据库并发绑定测试。 |
| P2 | 使用卡密时只更新 `used_by`，开发者/代理商用户数却统计 `used_by_id`，新兑换不会进入该计数。 | [cards.service.ts](/Users/cheemao/Apps/Ner/backend/src/cards/cards.service.ts:298)、[statistics.service.ts](/Users/cheemao/Apps/Ner/backend/src/statistics/statistics.service.ts:101)。只保留一个真实外键字段并迁移旧数据，所有计数和关联使用同一字段。 |
| P2 | 删除应用先删除 end_users，后删除引用它的 card；按当前实体及附带 DDL，存在已兑换卡密时可能触发外键约束并回滚删除。 | [apps.service.ts](/Users/cheemao/Apps/Ner/backend/src/apps/apps.service.ts:115)、[card.entity.ts](/Users/cheemao/Apps/Ner/backend/src/cards/entities/card.entity.ts:58)。调整子表删除顺序或明确级联规则，再做有兑换数据的 MySQL 集成测试。 |
| P2 | Python 将 `1.0` 序列化为 `1.0`，服务端 JSON.stringify 重序列化为 `1`，云函数包含这种数字时 HMAC 不一致。 | [netverify_client.py](/Users/cheemao/Apps/Ner/sdk/client/netverify_client.py:363)、[signature.guard.ts](/Users/cheemao/Apps/Ner/backend/src/common/guards/signature.guard.ts:86)。签名使用原始请求字节或跨语言统一规范；已隔离验证字符串与签名不同。 |
| P2 | 签名虽然要求 nonce，但没有记录已用 nonce，60 秒内可重放；method/path 未签名，相同签名可用于同应用其他满足相同 body/query 的路由。 | [signature.guard.ts](/Users/cheemao/Apps/Ner/backend/src/common/guards/signature.guard.ts:92)。签入 method、规范化 path/query、body 摘要，并用共享存储原子占用 nonce；隔离 Guard 已确认重放和路径复用可通过。 |
| P2 | 前端加密请求会发送 data/key，但 PayloadEncryptionInterceptor 从未注册；开启 encryption:true 的调用无法按预期解密。 | [interceptor.ts](/Users/cheemao/Apps/Ner/arco-design-pro-vite/src/api/interceptor.ts:41)、[payload-encryption.interceptor.ts](/Users/cheemao/Apps/Ner/backend/src/common/interceptors/payload-encryption.interceptor.ts:14)。先定义清晰协议；若用于 LocalAuthGuard 登录，需要在 Guard 读取密码之前解密，不能只挂一个后执行的 interceptor。当前业务页面未发现开启该选项的实际调用。 |
| P2 | 前端编辑用户时始终提交 role，即使只改备注；后端将“字段存在”视为改角色，管理员编辑 admin 行可被拒绝。 | [index.vue](/Users/cheemao/Apps/Ner/arco-design-pro-vite/src/views/users/list/index.vue:696)、[users.service.ts](/Users/cheemao/Apps/Ner/backend/src/users/users.service.ts:169)。前端仅提交修改字段，后端比较实际新旧角色；普通字段编辑和角色分配权限分离。 |
| P2 | 代理专用解绑接口清空 endUser.hwid，却未删除实际 Device 绑定；URL 的 :id 也未使用，而改读 body.id。 | [agents.controller.ts](/Users/cheemao/Apps/Ner/backend/src/agents/agents.controller.ts:114)、[agents.service.ts](/Users/cheemao/Apps/Ner/backend/src/agents/agents.service.ts:227)。复用当前设备解绑服务，从路径解析 ID 并验证操作者归属。 |



## 值得投入的优化

1. **先收敛业务入口与状态模型。** 制卡、试用、设备心跳/绑定目前都有新旧两套路径，这是相同限制只修一处、另一处继续绕过的重要原因。保留兼容 URL 也应调用同一服务。统一授权状态计算，统一卡使用外键，区分身份类型。
2. **把数据范围变成读写默认约束。** 列表、详情、更新、删除、导出不应各自拼一套权限。DataPermissionService 缺少用户 ID 时当前直接跳过过滤，应改成拒绝访问；带权限的 Service 参数不应可选。为每个资源建立调用者×操作×归属的测试矩阵。
3. **消除列表和统计的重复查询。** EndUsersService.findAll 对每个用户单独查询 devices，导出大量用户会放大为 N+1；改为按用户 ID 批量查询后分组。趋势查询按天串行执行多个 SQL，改为一次时间范围查询并按日期分组，再补零日期。
4. **按实际查询添加索引和容量限制。** 检查 app.creator_id、card 的 creator_id/status/created_at、end_users 的 app_id/username、devices 的用户与最后心跳、日志的用户和时间组合索引；以 EXPLAIN 验证，不盲目全加。分页大小和制卡数量统一上限，批量导出使用受控分页或流式任务。真实数据分布、慢查询与吞吐量本次未测。
5. **减少每次心跳的数据库写入。** 全局日志拦截器记录每个 PUT /client/heartbeat，又将终端用户 ID 写入 admin_id，既产生高频写入，也会混淆审计主体。分离客户端遥测与管理审计，增加 actor_type/session_id；心跳状态、计数和日志按需要合并或异步落库。以 1 万设备、60 秒间隔估算，仅心跳日志就约 1440 万条/天，此为算术估算，非压测。
6. **用测试覆盖故障模式。** 当前 Jest 未发现用例。优先覆盖匿名/越权拒绝、Token 类型隔离、卡密并发兑换、扣款失败回滚、试用一次性、多设备加密、禁用账号、导出路由、跨语言签名、空库迁移与旧库升级。将构建、类型检查、测试和依赖审计接入 CI。
7. **改善类型与依赖维护。** 替换接口 any 和 inline object 参数，给服务统一 CurrentAdmin/CurrentEndUser 类型；统一前端 axios 实际返回结构与类型声明。逐步收紧后端 TypeScript 检查。依赖升级按运行时、构建工具分类评估，更新 lockfile，避免直接 `npm audit fix --force` 引入未经验证的大版本变更。
8. **前端优化排在正确性之后。** 当前构建主要块约为 arco 955 KiB、chart 576 KiB、主块 616 KiB（构建输出口径）。检查实际首屏加载，按需注册图表和组件、延迟非首屏依赖。不能仅凭 chunk 大小断言首屏慢，本次没有浏览器性能测量。

## 建议修复顺序

| 批次 | 工作 | 验收标准 |
| --- | --- | --- |
| 第一批 | 01–06：公开入口、管理身份、租户隔离、云函数与密钥 | 匿名和终端用户不能调用管理写接口；他租户 ID 返回拒绝；公开响应无 app_secret；不可信代码无法共享后端进程权限 |
| 第二批 | 07–09、12–15：定价、余额/兑换事务、授权/试用、会话和统计 | 负数/小数/超限参数拒绝；并发扣款不丢失；卡只兑换一次；失败回滚；未充值不授权；设备会话互不影响 |
| 第三批 | 10–11、16–17：2FA、会话撤销、黑名单、数据库与镜像 | 错误验证码拒绝；停用/改密后旧会话失效；封禁规则生效；从空库和旧库都能部署启动 |
| 第四批 | 导出、设备状态、字段一致性、SDK 签名、性能与 CI | 导出可用、在线数准确、签名跨语言一致；关键异常场景有自动回归测试 |

## 证据与复现方式

这些脚本是审计时用于确认现存问题的诊断脚本，断言的是“旧行为仍可复现”，不是修复后的回归测试。修复后出现断言失败可能正是预期结果。脚本只使用合成数据、替身仓库和本机临时测试 HTTP 服务，不连接业务数据库，不运行 AppModule，不调用现有服务。


诊断脚本：[bootstrap.cjs](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/bootstrap.cjs)、[verify.cjs](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/verify.cjs)、[verify-extra.cjs](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/verify-extra.cjs)。

结果：[results.json](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/results.json)、[extra-results.json](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/extra-results.json)。

依赖报告：[backend-dependency-audit.json](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/backend-dependency-audit.json)、[frontend-dependency-audit.json](/Users/cheemao/Apps/Ner/docs/audits/2026-09-12/frontend-dependency-audit.json)。


```bash
node /Users/cheemao/Apps/Ner/docs/audits/2026-09-12/verify.cjs
node /Users/cheemao/Apps/Ner/docs/audits/2026-09-12/verify-extra.cjs
```

需要项目现有后端依赖和 Python 3；跨设备加密验证使用临时生成的 RSA 密钥。若移到别处，可设置 NETVERIFY_AUDIT_ROOT 指向项目。

本次未验证的范围：真实数据库执行计划与压力测试、线上反向代理与网络配置、真实账户/权限种子数据、Docker 完整构建启动、旧库实际升级、浏览器交互验收，以及任何沙箱逃逸的端到端攻击。附带 SQL 的旧 schema 不等同于当前生产 schema。依赖公告存在运行条件差异，audit 标记不能直接等同于已利用或已入侵。
