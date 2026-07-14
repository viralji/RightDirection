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
| Host | `134.209.158.145` (replaces the `139.59.87.174` droplet, compromised 2026-07-13 and decommissioned 2026-07-14 — see Security incidents below) |
| Specs | 2 vCPU / 3.8GB RAM |
| OS | Ubuntu 24.04.4 LTS (whatever image DO gives on rebuild — **do not assume a fixed version**, the deploy script bootstraps from scratch each time) |
| SSH key | `~/.ssh/do_134.209.158.145` → `root@134.209.158.145` (key-only login; password auth is disabled — see Security below). Locally this is a copy of the Windows-side key generated at droplet creation (`C:\Users\ViralShah\.ssh\id_ed25519`), stripped of its passphrase so the deploy script can run non-interactively — the original Windows key still has its passphrase. |
| App path | `/var/www/rightdirection` |
| Git remote | `git@github.com:viralji/RightDirection.git` (`main`) — pulled via a **per-repo deploy key** generated on the server itself (`/root/.ssh/id_ed25519`), registered read-only under repo Settings → Deploy keys. This key does **not** survive a rebuild — regenerate and re-register it each time (the deploy script prints the new pubkey and exits with instructions if GitHub access fails). |
| Public URL | http://134.209.158.145:8090 (nginx on **8090** only) |
| API (internal) | `127.0.0.1:4005` → proxied as `/api/v1` |
| Web (internal) | `127.0.0.1:3001` → proxied as `/` |
| AI (internal) | `127.0.0.1:8000` — runs on a **Python 3.12** venv, not the OS default `python3`. On Ubuntu 24.04 `python3.12` ships by default but `python3.12-venv` does **not** — it's a separate apt package. The deploy script always `apt-get install`s `python3.12 python3.12-venv python3.12-dev`, and only adds the deadsnakes PPA first if the `python3.12` binary itself is missing (older Ubuntu images). |
| Process manager | PM2 — `scripts/ecosystem.config.cjs` |
| Nginx config | `nginx/rightdirection-ip.conf` |
| Firewall | UFW, default deny incoming, allow only `22/tcp` and `8090/tcp` |

### Secrets & env
- Production env file: **`.env.production`** on your machine (gitignored). Deploy copies it to `/var/www/rightdirection/.env` via scp — never commit it.
- `FRONTEND_URL` must match the public origin (e.g. `http://134.209.158.145:8090`) so cookies and redirects work on HTTP.
- `DATABASE_URL`'s password is treated as the source of truth: the deploy script extracts it from `.env.production` (falling back to `rd_prod_change_me` only if none is set) and uses that same value for `CREATE USER` on a fresh box, so the Postgres role and the app's connection string can never drift apart.

### Security incident (2026-07-13) — why SSH is hardened
The previous droplet (`139.59.87.174`) was rebuilt (fresh OS image) and briefly ran with DigitalOcean's default `PasswordAuthentication yes` + `PermitRootLogin yes` while the deploy was being set up. Within ~30 minutes it was brute-forced and a rootkit-style backdoor was planted (an immutable `/etc/cron.d/root` entry pulling a remote payload every 10 min, plus an actively-running malicious binary). Root cause was password auth being enabled by default on a freshly-provisioned box with a public IP — not an application vulnerability. That droplet was decommissioned 2026-07-14 and replaced with `134.209.158.145` above.

**Remediation baked into the deploy script** (`scripts/deploy-digitalocean.sh`), applied as the *very first* step on any fresh box, before any package installs:
- `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PermitRootLogin prohibit-password` (via `/etc/ssh/sshd_config.d/00-harden.conf`)
- UFW firewall: default deny incoming, allow only `22/tcp` and `8090/tcp`

**If the server is ever rebuilt again:**
1. Add the local machine's SSH pubkey to `~/.ssh/authorized_keys` via the DigitalOcean **web console** — run the `mkdir`/`echo`/`chmod` steps as **separate single-line commands**, not one long combined line (the browser console hard-wraps long pasted lines by inserting real newlines, which breaks shell syntax mid-command — this happened again on 2026-07-14; if it does, split the key itself into ~30-char `printf` chunks appended one at a time, then verify with `tail -c 200 ~/.ssh/authorized_keys` before retrying SSH).
2. Run `./scripts/deploy-digitalocean.sh` — it hardens SSH + firewall first, then will stop and print a fresh GitHub deploy-key pubkey if one isn't registered yet (register it under repo Settings → Deploy keys, read-only, then re-run).
3. Treat any secrets that were on a compromised box as exposed. Rotate `.env.production` values (DB password, JWT secret, third-party API keys) before this becomes anything more than a demo box — the 2026-07-13 incident did **not** rotate them (data loss was acceptable for that demo environment at the time).

### Deploy script gotchas (found/fixed 2026-07-14, worth knowing before editing the script)
- The remote setup runs as a heredoc piped into `ssh ... bash -s`. **The heredoc delimiter must stay quoted (`<<'REMOTE'`)** — an unquoted delimiter makes bash expand every `$(...)`/`${...}` in the body *locally* before it ever reaches the server, so checks like `node -v` silently ran on the dev machine instead of the droplet and the "deploy" did nothing while reporting success. Variables the remote side needs (`RD`, `GIT_REPO`, `GIT_BRANCH`, `DB_PASSWORD`, `SERVER_IP`) are passed in as an env-var prefix to the remote command instead (`VAR=val ... bash -s`), shell-escaped with `printf %q`.
- Any command *inside* that remote script which itself invokes `ssh` must redirect its stdin from `/dev/null` (or use `ssh -n`). Otherwise it shares the same stdin stream that's still feeding the rest of the outer script to `bash -s`, and consumes/truncates it — the script would stop dead silently right after that line, exit 0, with no error. This bit the GitHub-deploy-key connectivity check (`ssh -T git@github.com`).
- A pipeline like `ssh ... | grep -q ...` under `set -o pipefail` reports failure if `ssh` itself exits non-zero — which it always does for `-T` — **even when `grep` found its match**, because pipefail takes the last non-zero exit in the pipeline, not "did the whole thing logically succeed." Capture the command's output into a variable first, then `grep` the variable.
- The final post-deploy health check only `sleep 3`'d before curling the API — not always enough time for NestJS + Prisma to finish booting, especially under load right after a build. It's now a retry loop (up to 40s) and failures there are warnings, not `set -e` deploy failures.

### Verify after deploy
```bash
curl http://134.209.158.145:8090/api/v1/health   # database + redis ok
# On server: git -C /var/www/rightdirection rev-parse --short HEAD  # should match origin/main
```

### Demo credentials (seed)
- Admin: `admin@rightdirection.com` / `Admin@123`
- Agent: `owner@studyvision.com` / `Demo@123`
- Student: `student@example.com` / `Demo@123`

### Security audit (2026-07-14) — was the compromise caused by our code?
Ran a full audit while migrating to the new droplet, prompted by the 2026-07-13 incident. Short answer: the *actual* incident was SSH password auth on a fresh box, not application code — but the audit also turned up a real, unrelated, currently-live risk that needed closing regardless.

**Clean:**
- Git history (14 commits, single author, no force-pushes/rewrites): no `.env` files ever committed, no hardcoded secrets/API keys/private keys anywhere in full history.
- No command-injection patterns (`exec`/`eval`/`child_process`/`subprocess`) anywhere in `api/src` or `ai-service/app`.
- New server: no cron backdoors, no rogue users, no unexpected SSH keys, no recently-modified system binaries, UFW correctly blocks everything except `22`/`8090` (verified externally — port 80, where nginx's default site used to also listen, is unreachable from outside; the default site is now disabled entirely as defense in depth).

**Found and fixed:** the web app was running **Next.js 15.0.0**, vulnerable to an unauthenticated RCE (CVSS 10.0, CVE-2025-66478/CVE-2025-55182) in the React Server Components protocol, under active exploitation in the wild since December 2025 — a single crafted HTTP request against the App Router. There is no patch within the 15.0.x line covering everything: the Dec 2025 fix line tops out at 15.0.7, and a further May 2026 release (13 more CVEs, including a **middleware/auth-bypass via segment-prefetch URLs** — directly relevant to this app's `web/middleware.ts` tenant/role routing) has no fix at all below **15.5.18**. Upgraded straight to `^15.5.18` (resolved `15.5.20`); build + typecheck verified clean across all 37 routes, then redeployed and re-verified (health check, page load, live demo login) against the server.

Also removed the `xlsx` dependency from `api/` — unused anywhere in the codebase, with a prototype-pollution/ReDoS vulnerability that has no upstream fix.

**Known residual risk (not yet addressed, lower urgency):** `npm audit` on `api/` still shows moderate/high findings in NestJS-ecosystem runtime packages (`@nestjs/core`, `@nestjs/platform-express`, `express`, `body-parser`, `multer`, `lodash`, `qs`, etc.). These are tied to **NestJS v10** itself — fully resolving them means a NestJS major-version upgrade (v10 → v11+), which is a separate, larger undertaking (breaking changes likely, needs its own testing pass) and hasn't been done. Worth scheduling as its own task; not a driver of either known incident.

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
