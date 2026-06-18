# RightDirection — AGENTS.md
**Quick reference for AI coding agents**
Last updated: 2026-06-18

> **Source of truth:** [`CLAUDE.md`](CLAUDE.md) — architecture, deploy workflow, build status.  
> **Planning archive:** [`docs/planning/`](docs/planning/) — historical blueprints (may be stale).

---

## Golden Rule (mandatory)

```
local edit → git commit → git push origin main → npm run deploy
```

- Never edit server code at `/var/www/rightdirection`
- Never rsync/scp application code to the server
- Only `.env.production` is scp'd (secrets, not in git)
- Verify: `npm run sync:status`

---

## Stack & ports

| Service | Local | Production (internal) |
|---------|-------|------------------------|
| API (NestJS) | 4005 | 4005 |
| Web (Next.js) | 5175 | 3001 (nginx :8090 public) |
| AI (FastAPI) | 8000 | 8000 |

PostgreSQL + pgvector, Redis, PM2, Nginx. No Docker.

---

## When Adding Code

### NestJS module
1. `api/src/modules/{name}/` — module, controller, service, DTOs (Zod)
2. Register in `api/src/app.module.ts`
3. Scope all DB queries to `tenantId`; set RLS context before queries
4. Guards: `@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)` + `@Roles(...)`

### Next.js page
1. Portal route group: `(agent)` | `(student)` | `(university)` | `(admin)` | `(public)` | `(auth)`
2. `web/app/(portal)/…/page.tsx` — server components default
3. Fetch via `web/lib/api.ts` (TanStack Query on client)

### FastAPI route
1. `ai-service/app/routes/{name}.py` → register in `main.py`
2. Schemas in `models/schemas.py`, prompts in `models/prompts.py`
3. LLM calls via `services/llm.py`

---

## Critical Patterns

### Tenant scoping
```typescript
await this.prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
return this.prisma.student.findMany({ where: { tenantId, ...filters } });
```

### Auth cookies
- `access_token` (15min) + `refresh_token` (7d), httpOnly
- `req.user` = `{ id, tenantId, role, email }`

### S3 upload
`POST /documents/presign` → upload to S3 → `POST /documents` with key

### Socket.io events
`notification:new` | `application:stage_changed` | `ai:job_completed` | `document:verified`

---

## Commands

```bash
# Local dev
npm run dev              # API + Web + AI
npm run db:migrate
npm run db:seed
npm run test:student-flow

# Production
npm run sync:status      # local / GitHub / server commit check
npm run deploy           # git pull on server + build + PM2
npm run deploy:env       # scp .env.production only
```

SSH: `ssh -i ~/.ssh/do_139.59.87.174 root@139.59.87.174`  
Public: http://139.59.87.174:8090

### Demo logins (seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rightdirection.com | Admin@123 |
| Agent | owner@studyvision.com | Demo@123 |
| Student | student@example.com | Demo@123 |

---

## Key paths

| What | Where |
|------|-------|
| Prisma schema | `api/prisma/schema.prisma` |
| API client | `web/lib/api.ts` |
| Middleware | `web/middleware.ts` |
| Deploy | `scripts/deploy-digitalocean.sh` |
| PM2 | `scripts/ecosystem.config.cjs` |
| Nginx | `nginx/rightdirection-ip.conf` |

Full file index → **CLAUDE.md → Key File Paths**
