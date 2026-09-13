# NetVerify remediation

本轮修复基于同目录的审计报告，重点覆盖了会造成越权、授权绕过、重复兑换、余额不一致和远程代码执行的路径。

## 已完成

- 增加全局 API 身份边界：后台接口默认要求后台 JWT；客户端接口只接受 `end_user` JWT；公开接口必须显式标注 `@Public()`。
- 管理资源统一进行权限和租户归属检查，详情、修改、删除、封禁接口不再只依赖列表过滤。
- 收紧公开注册和用户更新 DTO，禁止客户端提交角色、余额归属、激活历史等内部字段；余额调整使用行锁、分币计算和同事务日志。
- 管理员 TOTP 改用 otplib 13 的 API，强制六位验证码；启用、停用、改密会递增 token version。
- 客户端会话密钥改为持久化的随机 session ID，绑定用户和 HWID；解绑、停用、改密会使旧会话失效。
- 卡密生成、扣款、兑换和用户到期时间更新均在事务内执行；兑换以用户和卡密行锁串行化，数据库条件更新防止重复消费。
- 试用改为 `trial_claims(app_id, hwid)` 不可变记录，解绑、改 HWID 或删号都不能重新领取。
- vm2 替换为 QuickJS WebAssembly，并设置内存、栈和 1 秒中断限制；云函数没有 Node 主机绑定。
- 签名接口读取隐藏的 app secret，使用原始请求体、时间窗口和持久化 nonce 防重放，并校验 URL/会话的 app 隔离。
- 修正应用删除的外键顺序、导出路由被 `:id` 截获、设备 HWID 绑定范围和终端用户设备列表的 N+1 查询。
- 删除 uuid/vm2/xlsx 运行时依赖，导出改用 ExcelJS；升级锁文件中的 Nest、TypeORM、mysql2 等可升级依赖并覆盖 multer/minimatch。

## 数据库迁移

生产环境先备份数据库，再执行：

```bash
cd backend
npm ci
npm run migration:run
```

迁移文件为 `src/database/migrations/1760000000000-security-hardening.ts`。应用默认不会自动迁移；如确需启动时执行，设置 `RUN_MIGRATIONS=true`。`JWT_SECRET` 必须使用至少 32 个字符的随机值，升级后已有后台和客户端 JWT 会按 token version 重新登录。

## 验证

- `backend/npm run build` 通过。
- `arco-design-pro-vite/npm run type:check` 通过。
- `arco-design-pro-vite/npm run build` 通过。
- `python3 -m py_compile sdk/client/netverify_client.py` 通过。
- `backend/npm audit --omit=dev` 当前无高危/严重漏洞；ExcelJS 的 uuid 依赖仍有 2 个中危提示，属于导出库的传递依赖，未暴露在服务端输入解析路径。

本轮未在生产数据库执行正式迁移；部署时需由发布流程在备份后执行。验证期间曾用 TypeORM CLI 做装载检查，产生的临时迁移表已清理。
