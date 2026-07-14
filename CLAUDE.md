# RightDirection — CLAUDE.md
**AI-powered Global Admissions Exchange**
Last updated: 2026-07-14

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
| Database | PostgreSQL 17 + pgvector (production tracks whatever major version the OS repo provides at deploy time — was 16, now 18 after the 2026-07-13 rebuild; not hard-pinned) |
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
| Specs | 2 vCPU / 3.8GB RAM (upgraded 2026-07-13 from 1 vCPU / 1.9GB) |
| OS | Ubuntu (whatever image DO gives on rebuild — was 24.04, then 26.04 "resolute" after the 2026-07-13 rebuild; **do not assume a fixed version**, the deploy script bootstraps from scratch each time) |
| SSH key | `~/.ssh/do_139.59.87.174` → `root@139.59.87.174` (key-only login; password auth is disabled — see Security below) |
| App path | `/var/www/rightdirection` |
| Git remote | `git@github.com:viralji/RightDirection.git` (`main`) — pulled via a **per-repo deploy key** generated on the server itself (`/root/.ssh/id_ed25519`), registered read-only under repo Settings → Deploy keys. This key does **not** survive a rebuild — regenerate and re-register it each time (the deploy script prints the new pubkey and exits with instructions if GitHub access fails). |
| Public URL | http://139.59.87.174:8090 (nginx on **8090** only — does not touch ClickK `:3000`/`:5001` or liveindus `:8080`) |
| API (internal) | `127.0.0.1:4005` → proxied as `/api/v1` |
| Web (internal) | `127.0.0.1:3001` → proxied as `/` |
| AI (internal) | `127.0.0.1:8000` — runs on a **Python 3.12** venv (via deadsnakes PPA), not the OS default `python3`. Newer Ubuntu images ship Python versions too new for `pydantic-core`'s prebuilt wheels/PyO3 build toolchain; the deploy script installs 3.12 automatically. |
| Process manager | PM2 — `scripts/ecosystem.config.cjs` |
| Nginx config | `nginx/rightdirection-ip.conf` |
| Firewall | UFW, default deny incoming, allow only `22/tcp` and `8090/tcp` |

### Secrets & env
- Production env file: **`.env.production`** on your machine (gitignored). Deploy copies it to `/var/www/rightdirection/.env` via scp — never commit it.
- `FRONTEND_URL` must match the public origin (e.g. `http://139.59.87.174:8090`) so cookies and redirects work on HTTP.

### Security incident (2026-07-13) — why SSH is hardened
The droplet was rebuilt (fresh OS image) and briefly ran with DigitalOcean's default `PasswordAuthentication yes` + `PermitRootLogin yes` while the deploy was being set up. Within ~30 minutes it was brute-forced and a rootkit-style backdoor was planted (an immutable `/etc/cron.d/root` entry pulling a remote payload every 10 min, plus an actively-running malicious binary). Root cause was password auth being enabled by default on a freshly-provisioned box with a public IP — not an application vulnerability.

**Remediation now baked into the deploy script** (`scripts/deploy-digitalocean.sh`), applied as the *very first* step on any fresh box, before any package installs:
- `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PermitRootLogin prohibit-password` (via `/etc/ssh/sshd_config.d/00-harden.conf`)
- UFW firewall: default deny incoming, allow only `22/tcp` and `8090/tcp`

**If the server is ever rebuilt again:**
1. Add the local machine's SSH pubkey to `~/.ssh/authorized_keys` via the DigitalOcean **web console** (not this repo's key — that only exists locally) — run the `mkdir`/`echo`/`chmod` steps as **separate single-line commands**, not one long combined line (the browser console mangles long pasted lines with embedded `&&`/`>>`).
2. Run `./scripts/deploy-digitalocean.sh` — it hardens SSH + firewall first, then will stop and print a fresh GitHub deploy-key pubkey if one isn't registered yet (register it under repo Settings → Deploy keys, read-only, then re-run).
3. Treat any secrets that were on a compromised box as exposed. `.env.production` values (DB password, JWT secret, third-party API keys) were **not** rotated after this incident (data loss was acceptable for this demo environment) — rotate them before this becomes anything more than a demo box.

### Verify after deploy
```bash
curl http://139.59.87.174:8090/api/v1/health   # database + redis ok
# On server: git -C /var/www/rightdirection rev-parse --short HEAD  # should match origin/main
```

**Note:** The droplet has 3.8GB RAM (upgraded 2026-07-13 from 1.9GB, specifically to reduce OOM risk during builds). On-server `curl` during deploy may still occasionally exit 137 (OOM) after a full Next build; PM2/nginx can still be healthy — check from your machine or `pm2 list`.

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
