# RightDirection — CLAUDE.md
**AI-powered Global Admissions Exchange**
Last updated: 2026-06-18

---

## What This Project Is
B2B2C EdTech SaaS + Marketplace. Connects India Tier-2/3 study abroad consultants (agents) → universities → students. NOT a CRM — a verified exchange with network effects.

North Star: **Verified Enrolled Students** (students who enrolled via a verified agent through the platform).

---

## Repo Structure
```
rightdirection/
├── api/              # NestJS backend (port 4000)
├── web/              # Next.js frontend — all 4 portals
├── ai-service/       # Python FastAPI AI service (port 8000)
├── mobile/           # Flutter app (Phase 1)
├── scripts/          # Dev/deploy utility scripts
├── nginx.conf        # Subdomain routing config
├── .env.example      # Environment variable template
├── package.json      # Root run scripts (starts all services)
├── CLAUDE.md         # ← YOU ARE HERE
└── AGENTS.md         # AI agent task reference
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

## Phase Build Status

### Phase 1 — Foundation (Months 0–4) 🔄 IN PROGRESS
- [x] Root repo structure + scripts
- [x] CLAUDE.md + AGENTS.md created
- [x] NestJS API scaffold (modules, guards, prisma) — `api/src/`
- [x] Prisma schema (full — all models, enums, indexes) — `api/prisma/schema.prisma`
- [x] Auth module (JWT + OTP + refresh tokens) — `api/src/modules/auth/`
- [x] Tenant module (subdomain routing + branding + Redis cache) — `api/src/modules/tenant/`
- [x] University marketplace (CRUD + search + courses) — `api/src/modules/university/`
- [x] Student management CRM (list, create, update, profile score) — `api/src/modules/student/`
- [x] Application module (kanban, stage history, CRUD) — `api/src/modules/application/`
- [x] Document management (S3 presign, version control, share tokens) — `api/src/modules/document/`
- [x] Notification module (in-app, unread count) — `api/src/modules/notification/`
- [x] Health endpoint — `api/src/modules/health/`
- [x] Common layer (guards, decorators, filter, interceptor) — `api/src/common/`
- [x] Lib layer (PrismaService, RedisService, S3Service, env config) — `api/src/lib/`
- [x] Python FastAPI AI service (proposal engine, SOP writer, fraud check) — `ai-service/`
- [x] AI Proposal Engine (deterministic matching + Claude explanation) — `ai-service/app/routes/proposal.py`
- [x] SOP AI (Claude streaming + non-streaming) — `ai-service/app/routes/sop.py`
- [x] Next.js web scaffold (layout, providers, middleware) — `web/`
- [x] Agent portal (sidebar, dashboard, students list, kanban board) — `web/app/(agent)/`
- [x] Login page — `web/app/(auth)/login/page.tsx`
- [x] B2C Landing page — `web/app/(public)/page.tsx`
- [x] API client (all endpoints typed) — `web/lib/api.ts`
- [x] Auth store (Zustand) — `web/lib/auth.ts`
- [x] Design tokens (Tailwind config) — `web/tailwind.config.ts`

- [x] Commission module (ledger, wallet, TDS/GST calc) — `api/src/modules/commission/`
- [x] Admin module (KYC review, platform stats, fraud monitor) — `api/src/modules/admin/`
- [x] AI module (FastAPI bridge, Socket.io gateway, SSE streaming) — `api/src/modules/ai/`
- [x] Proposal module (AI generation, SOP save, PDF stub) — `api/src/modules/proposal/`
- [x] Agent module (profile, team, KYC upload, stats) — `api/src/modules/agent/`
- [x] Socket.io gateway — `api/src/modules/ai/ai.gateway.ts`
- [x] DB seed (8 universities + courses, demo agent + student + admin) — `api/prisma/seed.ts`
- [x] Student portal (layout, dashboard, profile) — `web/app/(student)/`
- [x] University portal (layout, dashboard, applications) — `web/app/(university)/`
- [x] Admin portal (layout, dashboard, agents KYC, universities, commissions, fraud) — `web/app/(admin)/`
- [x] Student detail + add student form — `web/app/(agent)/students/[id]/`, `new/`
- [x] University marketplace + detail — `web/app/(agent)/universities/`
- [x] SOP editor with Tiptap + streaming AI — `web/app/(agent)/proposals/[id]/sop/`
- [x] Proposals list + generate — `web/app/(agent)/proposals/`
- [x] Commission wallet + ledger page — `web/app/(agent)/commission/`
- [x] Team management page — `web/app/(agent)/team/`
- [x] Settings / white-label branding — `web/app/(agent)/settings/`
- [x] Register page — `web/app/(auth)/register/`
- [x] Extended API client — commissions, proposals, agent endpoints

### Phase 1 + Phase 2 COMPLETE (as of 2026-05-21 session 3)
- [x] `api/src/modules/marketplace/` — lead marketplace (list, unlock, wallet deduction)
- [x] `api/src/modules/billing/` — Razorpay subscription webhook + order creation
- [x] `api/src/lib/email.service.ts` — Resend email service + HTML templates (welcome, OTP, KYC, commission)
- [x] Document viewer page — `web/app/(agent)/documents/page.tsx` — table + iframe drawer with presigned URL
- [x] Application detail page — `web/app/(agent)/applications/[id]/page.tsx` — pipeline timeline + stage history + move stage modal
- [x] Leads page — `web/app/(agent)/leads/page.tsx` — intent/destination filters, masked PII, unlock flow
- [x] Billing page — `web/app/(agent)/billing/page.tsx` — plan cards + Razorpay redirect + payment history
- [x] University portal: agents — `web/app/(university)/agents/page.tsx`
- [x] University portal: analytics — `web/app/(university)/analytics/page.tsx` — funnel, top courses, top agents
- [x] University portal: offers — `web/app/(university)/offers/page.tsx` — issue offer / reject flow
- [x] Admin config page — `web/app/(admin)/config/page.tsx` — all platform settings toggles
- [x] Activity log viewer — `web/app/(admin)/activity/page.tsx` + `web/components/activity-log.tsx`
- [x] Phase 2: Document verification AI (AWS Textract) — `ai-service/app/routes/document.py`
- [x] Phase 2: Trust Score engine — `ai-service/app/services/trust_score.py` + `routes/trust_score.py`
- [x] Prisma schema additions: MarketplaceLead, LeadUnlock, BillingHistory, PlatformConfig + Tenant subscription fields

### Remaining (optional / future)
- [ ] Push notifications / email OTP flow in production
- [ ] Phase 2: Razorpay payout API integration (fund transfer to agent bank)
- [ ] Phase 3: Predictive AI (visa, enrollment)
- [ ] Phase 3: AI interview trainer

### Phase 2 — Trust & Monetization (Months 4–8)
- Document verification AI (AWS Textract + fraud pipeline)
- Trust Score Engine
- Commission/wallet engine
- B2C lead marketplace
- Razorpay subscription billing

### Phase 3 — Intelligence Layer (Months 8–12)
- Predictive AI (visa, enrollment)
- AI interview trainer
- Analytics dashboards
- AI counselor copilot

### Phase 4 — Ecosystem Expansion
- Education loans, forex, insurance, accommodation

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

## Production Deploy (Git Only)

**Rule:** All server code comes from GitHub — never edit `/var/www/rightdirection` by hand or rsync. Develop locally, commit, push, then deploy.

### Workflow
1. Make changes locally (this repo).
2. `git commit` + `git push origin main`
3. Ensure `.env.production` exists locally (gitignored — production secrets/URLs).
4. From repo root: `./scripts/deploy-digitalocean.sh` (optional arg: server IP)

The script **scp’s `.env.production` → server `.env`** (only file not from git), then SSHs and runs `git fetch` + `git reset --hard origin/main` (or `git clone` on first deploy). It bootstraps Node/PM2/Postgres/Redis/Nginx on a fresh server, builds API/web/AI, runs Prisma migrate + seed, restarts PM2, reloads nginx.

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
