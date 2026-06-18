# RightDirection — CLAUDE.md
**AI-powered Global Admissions Exchange**
Last updated: 2026-06-18

---

## What This Project Is
B2B2C EdTech SaaS + Marketplace. Connects India Tier-2/3 study abroad consultants (agents) → universities → students. NOT a CRM — a verified exchange with network effects.

North Star: **Verified Enrolled Students** (students who enrolled via a verified agent through the platform).

---

## Golden Rule — Local → Git → Server

**Every change follows this order. No exceptions.**

```
1. Develop locally     edit code in this repo
2. Commit              git add … && git commit
3. Push                git push origin main        ← GitHub is source of truth
4. Deploy              npm run deploy              ← server pulls from git only
```

### Never do this
- Edit application code on the server (`/var/www/rightdirection`)
- rsync or scp **code** to the server
- Deploy before pushing to GitHub

### Only exception
- **`.env.production`** is copied to the server via scp (secrets are never in git). Use `npm run deploy:env` to update env only.

### Verify sync
```bash
npm run sync:status   # local, GitHub, and server commits should match
```

---

## Repo Structure
```
rightdirection/
├── api/              # NestJS backend (local :4005)
├── web/              # Next.js frontend — all 4 portals (local :5175)
├── ai-service/       # Python FastAPI AI service (:8000)
├── mobile/           # Flutter app (Phase 1)
├── scripts/          # Dev/deploy utility scripts
├── docs/             # Planning archive + test plans (see docs/README.md)
├── nginx/            # Production nginx config (IP deploy :8090)
├── .env.example      # Local dev env template
├── .env.production.example  # Production env template (copy → .env.production)
├── package.json      # Root run scripts
├── CLAUDE.md         # ← YOU ARE HERE (source of truth)
└── AGENTS.md         # AI agent quick reference
```

---

## Tech Stack (Final Decisions)

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 15 + TypeScript + App Router |
| UI | shadcn/ui + Tailwind CSS v4 |
| State | Zustand v5 (client) + TanStack Query v5 (server) |
| Forms | React Hook Form + Zod |
| Charts | Recharts v2 |
| Rich Text | Tiptap v2 (SOP editor) |
| Kanban | @dnd-kit v6 |
| Mobile | Flutter 3.x + Riverpod v2 + Dio |
| Backend | NestJS v10 + TypeScript 5 |
| ORM | Prisma v6 |
| Database | PostgreSQL 17 + pgvector |
| Cache/Queue | Redis 7 + BullMQ v5 |
| Real-time | Socket.io v4 |
| AI Service | Python FastAPI 3.12 + LangChain |
| LLM | Anthropic Claude (SOP/docs) + OpenAI (embeddings) |
| Vector | pgvector (no separate vector DB) |
| OCR | AWS Textract |
| Storage | AWS S3 + CloudFront |
| Email | Resend + React Email |
| SMS/OTP | Twilio Verify |
| WhatsApp | Gupshup |
| Payments | Razorpay |
| Auth | Custom JWT httpOnly cookies (15min access / 7d refresh) |
| PDF | Puppeteer |
| Deploy | Native processes + Nginx (NO Docker) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + Pino |

**NOT using**: Docker, Kubernetes, MongoDB, GraphQL, AWS Cognito, AWS SQS, Turborepo, separate Vector DB.

---

## Multi-Tenancy Design
- Every agent gets a subdomain: `agencyname.rightdirection.com`
- Nginx passes `X-Forwarded-Host` → Next.js middleware reads subdomain
- NestJS `TenantGuard` extracts `tenant_id` from JWT + sets PostgreSQL RLS context
- All DB queries auto-scoped via RLS: `USING (tenant_id = current_setting('app.current_tenant')::uuid)`
- Tenant branding cached in Redis: `tenant:branding:{subdomain}` TTL 1hr

## Portal URLs
| Portal | URL |
|--------|-----|
| B2C Landing + Student | `app.rightdirection.com` |
| Agent (White-Label) | `agencyname.rightdirection.com` |
| University | `university.rightdirection.com` |
| Super Admin | `admin.rightdirection.com` |

---

## User Roles (7)
`SUPER_ADMIN` | `AGENT_OWNER` | `AGENT_MANAGER` | `AGENT_COUNSELOR` | `AGENT_TELECALLER` | `UNIVERSITY_ADMIN` | `UNIVERSITY_STAFF` | `STUDENT`

---

## API Conventions
- Base URL: `/api/v1`
- Auth: httpOnly cookie (web) | Bearer token (mobile)
- Response shape:
  - Success: `{ data: T, meta?: { total, page, pageSize } }`
  - Error: `{ error: string, code: string, details?: any }`
- Internal NestJS→FastAPI: `X-Internal-API-Key` header

## NestJS Module List
`auth` | `tenant` | `user` | `agent` | `university` | `student` | `application` | `document` | `proposal` | `commission` | `notification` | `ai` | `marketplace` | `admin` | `health`

## Common Layer (`api/src/common/`)
- Guards: `JwtAuthGuard`, `TenantGuard`, `RolesGuard`
- Decorators: `@CurrentUser`, `@Tenant`, `@Roles`
- Interceptors: `LoggingInterceptor`, `TransformInterceptor`
- Filters: `GlobalExceptionFilter`
- Pipes: `ZodValidationPipe`
- Middleware: `TenantContextMiddleware`

---

## Build Status

**Phase 1 + Phase 2: COMPLETE** (as of 2026-06). All core modules, portals, marketplace, billing, trust score, and production deploy pipeline are built.

### Optional / future
- Razorpay payout API (fund transfer to agent bank)
- Phase 3: Predictive AI, interview trainer, advanced analytics
- Phase 4: Education loans, forex, insurance, accommodation

Historical phase checklists and feature lists live in git history; planning blueprints archived under `docs/planning/`.

---

## Key File Paths (Quick Reference)
| What | Where |
|------|-------|
| Prisma schema | `api/prisma/schema.prisma` |
| DB seed | `api/prisma/seed.ts` |
| NestJS entry | `api/src/main.ts` |
| App module | `api/src/app.module.ts` |
| Prisma service | `api/src/lib/prisma.service.ts` |
| Redis service | `api/src/lib/redis.service.ts` |
| S3 service | `api/src/lib/s3.service.ts` |
| Env config | `api/src/lib/config/env.config.ts` |
| JWT guard | `api/src/common/guards/jwt-auth.guard.ts` |
| Tenant guard | `api/src/common/guards/tenant.guard.ts` |
| Roles guard | `api/src/common/guards/roles.guard.ts` |
| Next.js middleware | `web/middleware.ts` |
| API client | `web/lib/api.ts` |
| Auth helpers | `web/lib/auth.ts` |
| Tailwind config | `web/tailwind.config.ts` |
| AI service entry | `ai-service/app/main.py` |
| AI prompts | `ai-service/app/models/prompts.py` |
| LLM clients | `ai-service/app/services/llm.py` |
| Deploy script | `scripts/deploy-digitalocean.sh` |
| Push env only | `scripts/push-env.sh` |
| Sync check | `scripts/sync-status.sh` |
| PM2 config | `scripts/ecosystem.config.cjs` |
| Nginx (IP deploy) | `nginx/rightdirection-ip.conf` |

---

## Design System
Dark theme for Agent/Admin portals. Light for Student/B2C.
Primary brand: `#2b7cff` | Surface BG: `#0f1221` | Card: `#151936` | Border: `#1f2759`

---

## Revenue Model (Summary)
1. Agent subscription: ₹2,999–₹9,999/month (Starter/Pro/Enterprise)
2. Commission share: platform takes 30% of university commission per enrollment
3. Lead unlock fees: ₹500–₹2,000 per B2C lead (Phase 2)
4. AI tools add-on: ₹999/month (Phase 2)

---

## Production Deploy

See **Golden Rule** above. Deploy script: `scripts/deploy-digitalocean.sh` (`npm run deploy`).

### Workflow
1. `git commit` + `git push origin main`
2. Ensure `.env.production` exists (copy from `.env.production.example`)
3. `npm run deploy`

The script scp's `.env.production` → server `.env`, then `git clone` / `git reset --hard origin/main`, builds, migrates, seeds, restarts PM2, reloads nginx.

### Server (DigitalOcean)
| Item | Value |
|------|-------|
| Host | `139.59.87.174` |
| SSH key | `~/.ssh/do_139.59.87.174` → `root@139.59.87.174` |
| App path | `/var/www/rightdirection` |
| Git remote | `git@github.com:viralji/RightDirection.git` (`main`) |
| Public URL | http://139.59.87.174:8090 (nginx on **8090** only — does not touch ClickK `:3000`/`:5001` or liveindus `:8080`) |
| API (internal) | `127.0.0.1:4005` → proxied as `/api/v1` |
| Web (internal) | `127.0.0.1:3001` → proxied as `/` |
| AI (internal) | `127.0.0.1:8000` |
| Process manager | PM2 — `scripts/ecosystem.config.cjs` |
| Nginx config | `nginx/rightdirection-ip.conf` |

### Secrets & env
- Production env file: **`.env.production`** on your machine (gitignored). Deploy copies it to `/var/www/rightdirection/.env` via scp — never commit it.
- `FRONTEND_URL` must match the public origin (e.g. `http://139.59.87.174:8090`) so cookies and redirects work on HTTP.

### Verify after deploy
```bash
curl http://139.59.87.174:8090/api/v1/health   # database + redis ok
# On server: git -C /var/www/rightdirection rev-parse --short HEAD  # should match origin/main
```

**Note:** The droplet has ~2GB RAM. On-server `curl` during deploy may exit 137 (OOM) after a full Next build; PM2/nginx can still be healthy — check from your machine or `pm2 list`.

### Demo credentials (seed)
- Admin: `admin@rightdirection.com` / `Admin@123`
- Agent: `owner@studyvision.com` / `Demo@123`
- Student: `student@example.com` / `Demo@123`

---

## Dev Notes
- **Local dev ports:** API `4005`, Web `5175`, AI `8000` (see `api/package.json`, `web/package.json`)
- **Production ports:** nginx `:8090` → web `:3001`, api `:4005`, ai `:8000` (see `nginx/rightdirection-ip.conf`)
- Solo developer / small team — keep it simple, no premature abstraction
- Reference project: Workflow_App (same patterns for NestJS + Prisma + Next.js)
- India-first geo: Razorpay for payments, Gupshup for WhatsApp, INR pricing
- RLS is the primary multi-tenant isolation layer — always set `app.current_tenant` before queries
- S3 path conventions:
  - Documents: `documents/{tenantId}/{studentId}/{category}/{uuid}-v{version}.{ext}`
  - KYC: `kyc/{tenantId}/{docType}/{uuid}.pdf`
  - Proposals: `proposals/{tenantId}/{studentId}/{uuid}.pdf`
