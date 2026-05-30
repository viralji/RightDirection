# RightDirection — AGENTS.md
**Quick reference for AI coding agents working on this codebase**
Last updated: 2026-05-30

---

## Current Build State

### Completed (as of 2026-05-21)
- Root repo structure: `api/`, `web/`, `ai-service/`, `mobile/`, `scripts/`
- Root `package.json`, `.env.example`, `nginx.conf`, `.gitignore`
- `CLAUDE.md`, `AGENTS.md`
- **NestJS API** — full scaffold with all Phase 1 modules built
- **Prisma schema** — complete (all models, enums, RLS hooks)
- **Auth** — JWT + OTP + refresh tokens (httpOnly cookies)
- **Tenant** — subdomain lookup + Redis branding cache
- **Student** — CRM CRUD + profile scoring
- **University** — marketplace CRUD + courses + eligibility filter
- **Application** — kanban + stage history + CRUD
- **Document** — S3 presign + versioning + share tokens
- **Notification** — in-app + unread count
- **Python FastAPI AI service** — proposal matching, SOP writer, fraud check stub
- **Next.js** — layout, providers, middleware, Tailwind tokens
- **Agent portal** — sidebar, dashboard stats, student list, kanban board
- **Auth pages** — login
- **B2C landing page**
- **API client** (`web/lib/api.ts`) — all endpoints typed

### Phase 1 COMPLETE (as of 2026-05-21 session 2)
All core Phase 1 modules built. See CLAUDE.md for full checklist.

### Phase 1 + Phase 2 COMPLETE (session 3)
Everything from the TODO list is now built. See CLAUDE.md for full checklist.

### Remaining (optional future work)
- Razorpay payout API (fund transfer to agent bank accounts)
- Phase 3: Predictive AI, interview trainer, advanced analytics

### Key new files (session 3)
- `api/src/modules/marketplace/` — lead marketplace (list, unlock, wallet deduct)
- `api/src/modules/billing/` — Razorpay subscription webhook + order creation
- `api/src/lib/email.service.ts` — Resend email service + full HTML templates
- `ai-service/app/services/trust_score.py` — deterministic Trust Score engine (document/financial/academic/profile sub-scores)
- `ai-service/app/routes/trust_score.py` — POST `/ai/trust-score` endpoint
- `ai-service/app/routes/document.py` — AWS Textract integration (detect_document_text via S3)
- Prisma schema: MarketplaceLead, LeadUnlock, BillingHistory, PlatformConfig; Tenant subscription fields
- `web/app/(agent)/documents/page.tsx` — documents table + inline iframe drawer
- `web/app/(agent)/applications/[id]/page.tsx` — full application detail with pipeline timeline
- `web/app/(agent)/leads/page.tsx` — lead marketplace UI with masking + unlock
- `web/app/(agent)/billing/page.tsx` — plan cards + Razorpay redirect + payment history
- `web/app/(university)/agents/page.tsx` — partner agent cards with stats
- `web/app/(university)/analytics/page.tsx` — funnel + top courses + top agents
- `web/app/(university)/offers/page.tsx` — issue offer / reject modal
- `web/app/(admin)/config/page.tsx` — platform config toggles (commission, AI, marketplace, plans)
- `web/app/(admin)/activity/page.tsx` — activity log with pagination + filters
- `web/components/activity-log.tsx` — reusable activity log component

### Key new files (session 2)
- `api/src/modules/commission/` — CommissionLedger CRUD, wallet summary, TDS calc
- `api/src/modules/proposal/` — AI trigger, SOP save, PDF stub
- `api/src/modules/agent/` — profile, team, KYC upload
- `api/src/modules/admin/` — KYC review, platform stats, fraud + commission admin
- `api/src/modules/ai/` — FastAPI bridge, SSE streaming, Socket.io gateway
- `api/prisma/seed.ts` — 8 universities, 24 courses, demo agent/student
- `web/app/(agent)/students/[id]/` — student detail with tabs
- `web/app/(agent)/students/new/` — add student form with multi-select
- `web/app/(agent)/universities/` — marketplace grid + detail
- `web/app/(agent)/proposals/[id]/sop/` — Tiptap SOP editor with streaming AI
- `web/app/(agent)/commission/` — wallet + ledger
- `web/app/(agent)/team/`, `settings/` — team management, white-label branding
- `web/app/(student)/` — student portal (dashboard, profile)
- `web/app/(university)/` — university portal (dashboard, applications)
- `web/app/(admin)/` — admin portal (dashboard, agents, universities, commissions, fraud)

---

## Architecture in One Paragraph
NestJS API (port 4000) serves all REST endpoints. Next.js (port 3000) handles all 4 portals via subdomain routing in `middleware.ts`. Python FastAPI (port 8000) handles AI workloads (proposals, SOP, fraud). PostgreSQL is the only database (+ pgvector extension). Redis handles caching + BullMQ job queues + Socket.io pub/sub. No Docker — services run natively. Multi-tenancy via PostgreSQL RLS + tenant_id on all rows.

---

## When Adding a New NestJS Module

1. Create `api/src/modules/{name}/{name}.module.ts`
2. Create `{name}.controller.ts`, `{name}.service.ts`
3. Create DTOs in `dto/` subdirectory using Zod schemas
4. Register in `api/src/app.module.ts` imports array
5. All service methods must scope DB queries to `tenantId`
6. Use `@Roles(UserRole.X)` + `@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)` on controllers

## When Adding a Next.js Page

1. Determine which portal: `(agent)`, `(student)`, `(university)`, `(admin)`, `(public)`, `(auth)`
2. Place in `web/app/(portal)/page-name/page.tsx`
3. Server components by default; use `'use client'` only when needed
4. Fetch data via `web/lib/api.ts` functions (TanStack Query on client, fetch on server)
5. Use shadcn/ui components + Tailwind tokens from `tailwind.config.ts`

## When Adding a FastAPI Route

1. Add route file: `ai-service/app/routes/{name}.py`
2. Register in `ai-service/app/main.py` with `app.include_router(...)`
3. Add Pydantic schemas to `ai-service/app/models/schemas.py`
4. Add prompts to `ai-service/app/models/prompts.py`
5. All LLM calls go through `ai-service/app/services/llm.py` wrappers

---

## Critical Patterns

### Tenant Scoping (NestJS)
```typescript
// In every service method that touches DB:
async findStudents(tenantId: string, filters: any) {
  await this.prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
  return this.prisma.student.findMany({ where: { tenantId, ...filters } });
}
```

### JWT Auth (NestJS)
- Access token: 15min, httpOnly cookie `access_token`
- Refresh token: 7 days, httpOnly cookie `refresh_token`
- `req.user` after guard = `{ id, tenantId, role, email }`

### S3 Upload Flow
1. Client calls `POST /api/v1/documents/presign` → gets presigned URL
2. Client uploads directly to S3 with presigned URL
3. Client calls `POST /api/v1/documents` with S3 key to save metadata

### AI Job Flow (async)
1. NestJS enqueues BullMQ job: `aiQueue.add('sop', { studentId, ... })`
2. FastAPI worker picks up job, runs Claude call
3. Result stored in `ai_outputs` table
4. Socket.io event `ai:job_completed` pushed to client

### Socket.io Events
```
'notification:new'          → { id, title, body, metadata }
'application:stage_changed' → { applicationId, stage, studentName }
'ai:job_completed'          → { jobId, type, entityId }
'document:verified'         → { documentId, studentId }
```

---

## Database Quick Reference

### Key Models
- `Tenant` — one per agent/university; has subdomain + branding
- `User` — belongs to Tenant; has UserRole
- `Agent` — extends Tenant for agent-type tenants; has wallet, KYC, scores
- `Student` — belongs to Agent; has academic profile, test scores, preferences
- `Application` — Student + Course + University + Stage tracking
- `Course` — belongs to University; has intake, fees, requirements, commission%
- `Document` — versioned; belongs to Student or Application; has fraud score
- `CommissionLedger` — one per Application; tracks payout lifecycle
- `Proposal` — AI-generated university match; linked to Student
- `GlobalTrustScore` — one per Student; has document/financial/academic/overall scores

### Enums (frequently used)
- `UserRole`: SUPER_ADMIN, AGENT_OWNER, AGENT_MANAGER, AGENT_COUNSELOR, AGENT_TELECALLER, UNIVERSITY_ADMIN, UNIVERSITY_STAFF, STUDENT
- `ApplicationStage`: LEAD → DOCS_COLLECTION → UNDER_REVIEW → SUBMITTED → OFFER_RECEIVED → VISA_PROCESSING → FEES_PAID → ENROLLED | REJECTED | WITHDRAWN
- `KYCStatus`: PENDING, UNDER_REVIEW, APPROVED, REJECTED, RE_UPLOAD_REQUIRED
- `SubscriptionPlan`: TRIAL, STARTER, PRO, ENTERPRISE

---

## Environment Variables (key ones)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=ap-south-1
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
INTERNAL_API_KEY=...   (NestJS → FastAPI auth)
```

---

## Production deploy (git only)

Never edit the server tree by hand or rsync. Workflow: develop locally → `git push origin main` → `./scripts/deploy-digitalocean.sh`.

| Item | Value |
|------|-------|
| Public URL | http://139.59.87.174:8090 |
| Server path | `/var/www/rightdirection` |
| Deploy script | `scripts/deploy-digitalocean.sh` |

Full details: **CLAUDE.md → Production Deploy (Git Only)**.

---

## Run Commands
```bash
# From repo root
npm run dev:api      # Start NestJS (port 4000)
npm run dev:web      # Start Next.js (port 3000)
npm run dev:ai       # Start FastAPI (port 8000)
npm run dev          # Start all three
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio
```
