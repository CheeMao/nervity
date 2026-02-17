# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NetVerify (网络验证系统) - A complete software authorization verification solution with user management, agent system, card activation, cloud functions, device binding, and heartbeat mechanisms.

## Tech Stack

- **Backend**: NestJS (Node.js) + TypeORM + MySQL 8.0 + JWT/Passport.js
- **Frontend**: Vue 3 + Arco Design Pro + Vite + Pinia + TypeScript
- **SDK**: Python client library (`sdk/python/`)

## Development Commands

### Backend (backend/)
```bash
cd backend
cp .env.example .env    # First-time setup
npm install
npm run start:dev       # Development (hot reload)
npm run start:prod      # Production
npm run build           # Build
npm run lint            # ESLint fix
npm run test            # Unit tests
npm run test:e2e        # E2E tests
```

### Frontend (arco-design-pro-vite/)
```bash
cd arco-design-pro-vite
npm install
npm run dev             # Development server
npm run build           # Production build (with type check)
npm run type:check      # TypeScript only
```

### Database (Docker)
```bash
docker start netverify-mysql
# Create new container:
docker run --name netverify-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=netverify -p 3306:3306 -d mysql:8.0
```

## Architecture

### Backend Module Structure
Each module follows NestJS conventions: `module-name/`
- `module-name.controller.ts` - HTTP handling, param validation, calls Service
- `module-name.service.ts` - Business logic, injects TypeORM Repository
- `entities/*.entity.ts` - TypeORM entity definitions
- `dto/*.dto.ts` - Request/Response DTOs with class-validator

Service uses `@InjectRepository(Entity)` directly - no separate Model layer.

### Main Backend Modules
- `auth/` - JWT/Local strategies, 2FA (TOTP), role guards
- `access-control/` - RBAC (roles/permissions entities, guards), blacklist
- `users/` - Admin/Developer/Agent user management
- `apps/` - Application management
- `cards/`, `card-types/` - Card key management
- `devices/` - Device registration and heartbeat
- `cloud-functions/` - Sandbox cloud functions (VM2)
- `end-users/` - End user management with client auth
- `common/` - Interceptors, guards, middleware, encryption service

### Frontend Structure
- `api/` - API interfaces (kebab-case: `user.ts`, `cards.ts`)
- `views/` - Page components by business module
- `store/modules/` - Pinia state modules
- `router/routes/modules/` - Route modules with meta config
- `types/` - TypeScript definitions
- `utils/encryption.ts` - RSA+AES hybrid encryption

## Database & Naming

- **Entity fields**: `snake_case` (e.g., `is_active`, `created_at`, `parent_id`)
- **Timezone**: Beijing time (UTC+8), configured in `database.module.ts`
- **Date handling**: MySQL returns date strings to avoid UTC offset issues
- **Global prefix**: API runs at `/api/*`

## API Response Format

All endpoints use `ResponseHelper` unified format:
```typescript
{ status: 200, code: 20000, msg: "操作成功", data: {} }
```

Business codes: 20000 (success), 40001-40004 (client errors), 50008/50012/50014 (token errors), 50000 (server error)

Pagination: `{ list, total, page, pageSize }`

`TransformInterceptor` auto-wraps Controller return values.

## Authentication & Authorization

### User Roles (AdminRole enum)
- `admin` - Full system access
- `developer` - Can create apps, manage own resources
- `agent` - Agent level with `agent_level` and `parent_id` hierarchy

### Guards
- `JwtAuthGuard` - Validates JWT token
- `RolesGuard` - Checks `@Roles()` decorator
- `PermissionsGuard` - Checks `@RequirePermissions()` decorator

### Decorators
```typescript
@Roles('admin', 'developer')
@RequirePermissions('app:read', 'app:write')
```

## Frontend Conventions

- File naming: kebab-case only (e.g., `user-list.vue`)
- Use Arco Design components only (no Element Plus, Ant Design)
- Components auto-import via unplugin-vue-components
- Route meta must include: `locale`, `requiresAuth`, optional `roles`, `permissions`, `icon`
- Pagination: request uses `page`, Arco Table uses `current`

## Encryption (RSA+AES Hybrid)

Sensitive endpoints support hybrid encryption:
1. Frontend gets public key from `/encryption/public-key`
2. Generate random AES key, encrypt request body with AES
3. Encrypt AES key with RSA public key
4. Send `{ data: encrypted_body, key: encrypted_key }` with header `x-encryption: true`
5. Backend decrypts AES key with RSA private key, then decrypts body

Enable per-request: `axios.post('/endpoint', data, { encryption: true })`

## Environment Variables (backend/.env)

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=netverify
JWT_SECRET=supersecretkey
PORT=3000
```

## Python SDK (sdk/python/)

Client library for integrating with NetVerify API:
- Authentication with encryption support
- Apps, Cards, Devices, EndUsers, RemoteVariables, CloudFunctions APIs
- See `sdk/python/README.md` for usage

## Key Files

- `backend/src/main.ts` - App bootstrap, Swagger at `/api/docs`
- `backend/src/app.module.ts` - Module registration
- `backend/src/database/database.module.ts` - TypeORM config with timezone
- `backend/src/common/utils/response.helper.ts` - Response format utility
- `arco-design-pro-vite/src/utils/encryption.ts` - Frontend encryption

## Security Notes

- VM2 is deprecated for cloud functions - consider alternatives for production
- Signature middleware is currently disabled in `app.module.ts`
