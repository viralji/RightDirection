# RightDirection — Complete Product Development Plan
**Version 3.0 | Master Blueprint**
**Date: May 2026 | Classification: Internal**

---

## TABLE OF CONTENTS

1. [Vision & Strategic Positioning](#1-vision--strategic-positioning)
2. [Stakeholders & Personas](#2-stakeholders--personas)
3. [Business Model](#3-business-model)
4. [Final Tech Stack](#4-final-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Repository & Directory Structure](#6-repository--directory-structure)
7. [Database Schema (Full Prisma)](#7-database-schema-full-prisma)
8. [API Design Conventions](#8-api-design-conventions)
9. [UI Design System](#9-ui-design-system)
10. [Phase 1 — Foundation (Months 0–4)](#10-phase-1--foundation-months-04)
11. [Phase 2 — Trust & Monetization (Months 4–8)](#11-phase-2--trust--monetization-months-48)
12. [Phase 3 — Intelligence Layer (Months 8–12)](#12-phase-3--intelligence-layer-months-812)
13. [Phase 4 — Ecosystem Expansion (Months 12+)](#13-phase-4--ecosystem-expansion-months-12)
14. [Security Architecture](#14-security-architecture)
15. [Deployment Architecture](#15-deployment-architecture)
16. [Development Conventions & Workflow](#16-development-conventions--workflow)
17. [Feature Priority Matrix](#17-feature-priority-matrix)

---

## 1. Vision & Strategic Positioning

### 1.1 Product Vision
**RightDirection** is an AI-powered Global Admissions Exchange — a verified marketplace and recruitment infrastructure connecting universities, agents, and students through automation, intelligence, and trust.

> NOT a CRM. NOT a portal. An exchange with network effects.

### 1.2 Positioning
| Dimension | Decision |
|-----------|----------|
| Primary Market | India Tier-2/3 study abroad consultants (Phase 1) |
| Expansion Market | Global (South Asia, Middle East, Africa) from Phase 2 |
| Core Differentiation | AI-native trust engine + verified exchange (not CRM with AI bolted on) |
| Business Type | B2B2C SaaS + Marketplace hybrid |

### 1.3 North Star Metric
**Verified Enrolled Students** — students who reached Enrolled status with a verified agent through the platform.

### 1.4 Key Moat
Data compounding: every application adds visa trend data, fraud pattern data, and university conversion data — creating a prediction advantage competitors cannot replicate.

---

## 2. Stakeholders & Personas

### Portal Map (4 portals, 1 platform)

| Portal | URL Pattern | Users |
|--------|------------|-------|
| B2C Landing + Student | `www.rightdirection.com` / `app.rightdirection.com` | Students, public |
| Agent (White-Label) | `agencyname.rightdirection.com` | Agent Owner, Manager, Counselor, Telecaller |
| University | `university.rightdirection.com` | University Admin, Admission Officer |
| Super Admin | `admin.rightdirection.com` | Platform Ops Team |

### 2.1 Persona A — The Agent Owner (Primary B2B User)
- Small study abroad consultant in Tier-2 city (Surat, Jaipur, Indore, Nagpur)
- 2–20 counselors, mostly WhatsApp-driven operations
- Overwhelmed with manual paperwork; no tech currently
- Pain: Lost commissions from slow processing, fraud risk, poor conversion data
- Goal: Grow enrollment volume + faster verified commissions

### 2.2 Persona B — The University Admission Officer
- UK college or Canadian/Australian university looking for Indian recruitment
- Frustrated with low-quality applications and document fraud
- Goal: Trusted agent network, verified student profiles, better visa ratios

### 2.3 Persona C — The Student
- 20–26 year old, first-time applicant, mobile-first
- Overwhelmed by information asymmetry; doesn't know which university is right
- Goal: Transparency, verified guidance, clear timeline

### 2.4 Persona D — The Platform Admin
- Internal operations team managing agent KYC, commission approvals, university onboarding
- Goal: Fraud control, financial accuracy, platform health metrics

---

## 3. Business Model

### 3.1 Revenue Streams

| Stream | Model | Phase |
|--------|-------|-------|
| Agent Subscription | ₹2,999–₹9,999/month (Starter/Pro/Enterprise) | Phase 1 |
| University Commission Share | 30% of commission earned per enrolled student | Phase 1 |
| Lead Unlock Fees | ₹500–₹2,000 per B2C lead unlocked by agents | Phase 2 |
| AI Tools Add-on | ₹999/month (SOP AI, Visa AI bundle above base plan) | Phase 2 |
| Verification Fees | ₹99–₹299 per verified application (paid by agent) | Phase 2 |
| White-Label Enterprise | Custom pricing for large agencies wanting full white-label | Phase 3 |
| Financial Services | Education loans, forex, insurance referral commission | Phase 4 |

### 3.2 Commission Flow
```
University pays ₹X commission
  → RightDirection receives: ₹X × 30% (platform share)
  → Agent receives: ₹X × 70% (agent share)
      → If sub-agent: Agent pays sub-agent 10% of their 70%
  → TDS deducted: 10% from agent payout (Section 194H)
  → GST: 0% for international education commissions (LUT exemption)
```

### 3.3 Subscription Tiers (Agent)

| Feature | Starter (₹2,999) | Pro (₹5,999) | Enterprise (₹9,999) |
|---------|-----------------|-------------|---------------------|
| Students | 50 | 200 | Unlimited |
| Counselors | 2 | 10 | Unlimited |
| AI Proposals | 100/month | 500/month | Unlimited |
| SOP AI | Basic | Full | Full |
| Lead Unlocks | — | 10/month | 30/month |
| Back-Office Handoff | — | 5/month | 20/month |
| White-Label | Yes | Yes | Full custom |
| Priority Support | — | — | Dedicated |

---

## 4. Final Tech Stack

### 4.1 Complete Stack Decision Table

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Web Frontend** | Next.js + TypeScript | 15 / TS 5 | SSR for B2C SEO; App Router; unified multi-portal in one codebase |
| **UI Components** | shadcn/ui + Tailwind CSS | latest / v4 | Same philosophy as Workflow App; headless, accessible, customizable |
| **State Management** | Zustand | v5 | Lightweight; replaces Redux for client state |
| **Server State** | TanStack Query | v5 | Same as Workflow App; consistent pattern |
| **Forms** | React Hook Form + Zod | latest | Same as Workflow App |
| **Charts** | Recharts | v2 | Lightweight; composable; Tailwind-compatible |
| **Rich Text** | Tiptap | v2 | For SOP editor; extensible |
| **Kanban** | @dnd-kit | v6 | Application pipeline board |
| **PDF Viewer** | react-pdf | latest | Document previews |
| **Maps** | — | — | Not needed Phase 1–2 |
| **Mobile** | Flutter + Dart | 3.x | iOS + Android; single codebase |
| **Mobile State** | Riverpod | v2 | Most mature Flutter state solution |
| **Mobile HTTP** | Dio | latest | Interceptors, retry, auth headers |
| **Backend API** | NestJS + TypeScript | v10 / TS 5 | Module system, guards, interceptors — critical for multi-tenant RBAC |
| **ORM** | Prisma | v6 | Same as Workflow App; type-safe; migration management |
| **Primary DB** | PostgreSQL | 17 | ACID for financials; RLS for multi-tenancy; pgvector for embeddings |
| **Cache / Queue** | Redis | 7 | Sessions; BullMQ job queues; Socket.io pub/sub |
| **Job Queue** | BullMQ | v5 | Redis-backed; handles AI tasks, email, commission calc |
| **Real-time** | Socket.io | v4 | Same as Workflow App; notifications |
| **AI Service** | Python + FastAPI | 3.12 / latest | Native ML libs; LangChain; async streaming |
| **LLM Provider** | Anthropic Claude + OpenAI | latest | Claude for SOP/docs; GPT-4o for matching |
| **Vector DB** | pgvector (PostgreSQL ext.) | latest | Avoids separate vector DB in Phase 1 |
| **OCR** | AWS Textract | latest | Document text extraction for fraud check |
| **File Storage** | AWS S3 | — | Same as Workflow App |
| **CDN** | AWS CloudFront | — | Static assets + AI-generated PDFs |
| **Email** | Resend + React Email | latest | Developer-friendly; beautiful templates |
| **SMS** | Twilio Verify | latest | OTP, SMS notifications |
| **WhatsApp** | Gupshup / Twilio WA | latest | WhatsApp Business API; India-preferred |
| **Payments** | Razorpay | v2 | UPI, cards, wallets, payouts; India-native |
| **Auth** | Custom JWT + Prisma | — | httpOnly cookie (access 15min, refresh 7d); OTP via Twilio |
| **PDF Gen** | Puppeteer (headless Chrome) | latest | Branded PDF proposals and invoices |
| **Deploy (MVP)** | Native process + Nginx | — | Single VPS; processes run directly (no Docker) |
| **Deploy (Scale)** | AWS ECS Fargate + RDS | — | Phase 2+ when traffic demands |
| **CI/CD** | GitHub Actions | — | Build, test, deploy pipeline |
| **Monitoring** | Sentry + Pino logger | latest | Error tracking + structured logs |
| **Uptime** | Better Uptime / UptimeRobot | — | Health checks |

### 4.2 What We Are NOT Using (and Why)
| Rejected | Reason |
|---------|--------|
| Microservices architecture | Overkill for solo dev; monolith is faster and more maintainable at this scale |
| MongoDB | Eliminated in favor of PostgreSQL JSONB; single DB is simpler |
| AWS SQS/SNS | Replaced by BullMQ (Redis); same reliability without AWS complexity in MVP |
| AWS Cognito | Custom JWT is simpler, more flexible, and avoids vendor lock-in |
| GraphQL | REST is sufficient; reduces frontend complexity |
| Turborepo | Adds config complexity; simple root-level package.json is enough |
| Docker/Kubernetes | Native process deployment is simpler; no containerisation overhead |
| Separate Vector DB | pgvector handles Phase 1–3 needs without another service |

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
Internet
   │
   ▼
Cloudflare (DNS + DDoS protection + caching)
   │
   ▼
Nginx (reverse proxy + subdomain routing)
   ├── admin.rightdirection.com → Next.js (Admin portal)
   ├── app.rightdirection.com   → Next.js (Student portal)
   ├── *.rightdirection.com     → Next.js (Agent white-label portals)
   └── /api/*                   → NestJS API (port 4000)
                                 └── /ai/*  → Python FastAPI (port 8000)

Infrastructure:
   ├── PostgreSQL 17 + pgvector (primary DB)
   ├── Redis 7 (cache + BullMQ queues + Socket.io adapter)
   ├── AWS S3 (document storage)
   └── AWS CloudFront (CDN for S3 assets)

External Services:
   ├── Anthropic API (Claude for SOP, document analysis)
   ├── OpenAI API (embeddings, matching backup)
   ├── AWS Textract (OCR for document fraud check)
   ├── Razorpay (payments + payouts)
   ├── Twilio (SMS OTP + WhatsApp)
   ├── Gupshup (WhatsApp Business API - India)
   └── Resend (transactional email)
```

### 5.2 Multi-Tenancy Design

**Subdomain Routing Strategy**:
```
Request → agencyname.rightdirection.com
  → Nginx passes X-Tenant-Subdomain header to Next.js
  → Next.js middleware reads subdomain, queries tenant lookup
  → Sets tenant context in all downstream API calls
  → NestJS TenantGuard extracts tenant_id from JWT + validates
  → All DB queries automatically scoped: WHERE tenant_id = $1
```

**Database Tenant Isolation (Hybrid)**:
- Shared tables with `tenant_id` column + PostgreSQL Row-Level Security
- All queries automatically filtered via RLS policy: `USING (tenant_id = current_setting('app.current_tenant')::uuid)`
- No separate database/schema per tenant (too complex for MVP)
- Sensitive financial data: explicit tenant_id checks in service layer as double-safety

### 5.3 Request Flow (API)

```
Client Request
  → Nginx (TLS termination)
  → NestJS API
    → GlobalExceptionFilter (error formatting)
    → ThrottlerGuard (rate limiting via Redis)
    → JwtAuthGuard (JWT validation, sets req.user)
    → TenantGuard (extracts tenant_id, sets RLS context)
    → RolesGuard (RBAC permission check)
    → Controller
      → Service (business logic)
        → Prisma (DB, tenant-scoped)
        → Redis (cache)
        → BullMQ (async jobs)
        → External APIs
      → Response transformation
```

### 5.4 AI Service Architecture

```
NestJS API
  → BullMQ Queue (ai-jobs)
    → FastAPI Worker consumes job
      → LangChain pipeline
        → Claude/GPT-4o API call (with streaming)
        → pgvector similarity search (for university matching)
        → Response stored in DB (ai_outputs table)
      → Socket.io event pushed to client (job complete)
```

Real-time streaming for SOP generation: FastAPI streams to NestJS via Server-Sent Events, NestJS relays via Socket.io to browser.

---

## 6. Repository & Directory Structure

### 6.1 Root Structure
```
rightdirection/
├── api/                        # NestJS Backend
├── web/                        # Next.js Frontend (all portals)
├── ai-service/                 # Python FastAPI AI Service
├── mobile/                     # Flutter App
├── scripts/                    # Deploy, setup, utility scripts
├── docker-compose.yml          # Local dev orchestration
├── docker-compose.prod.yml     # Production
├── nginx.conf                  # Nginx routing config
├── .env.example                # Environment template
├── package.json                # Root scripts to run all services
└── README.md
```

### 6.2 API (NestJS) Structure
```
api/
├── src/
│   ├── modules/
│   │   ├── auth/               # JWT, OTP, refresh tokens, MFA
│   │   ├── tenant/             # Tenant lookup, branding config
│   │   ├── user/               # User CRUD, role management
│   │   ├── agent/              # Agent registration, KYC, team
│   │   ├── university/         # University master CRUD, courses
│   │   ├── student/            # Student CRM, profile, lead mgmt
│   │   ├── application/        # Application lifecycle, kanban stages
│   │   ├── document/           # Upload, versioning, S3, fraud score
│   │   ├── proposal/           # AI proposal engine, PDF generation
│   │   ├── commission/         # Ledger, wallet, payouts, TDS/GST
│   │   ├── notification/       # In-app, email, WhatsApp, Socket.io
│   │   ├── ai/                 # Bridge to FastAPI, job dispatch
│   │   ├── marketplace/        # University marketplace, lead marketplace
│   │   ├── admin/              # Super admin operations
│   │   └── health/             # Health check endpoint
│   ├── common/
│   │   ├── decorators/         # @CurrentUser, @Tenant, @Roles
│   │   ├── guards/             # JwtAuthGuard, TenantGuard, RolesGuard
│   │   ├── interceptors/       # LoggingInterceptor, TransformInterceptor
│   │   ├── filters/            # GlobalExceptionFilter
│   │   ├── pipes/              # ZodValidationPipe
│   │   └── middleware/         # TenantContextMiddleware
│   ├── lib/
│   │   ├── prisma.service.ts   # Prisma singleton
│   │   ├── redis.service.ts    # Redis singleton (ioredis)
│   │   ├── s3.service.ts       # AWS S3 presigned URLs
│   │   ├── logger.ts           # Pino logger
│   │   └── config/             # Zod env validation
│   └── main.ts                 # Bootstrap, Swagger, CORS config
├── prisma/
│   ├── schema.prisma           # Single source of truth
│   ├── migrations/             # Prisma migration history
│   └── seed.ts                 # Dev seed data
├── test/                       # Manual API test scripts
├── .env.example
└── package.json
```

### 6.3 Web (Next.js) Structure
```
web/
├── app/
│   ├── (public)/               # No auth required
│   │   ├── page.tsx            # B2C Landing (www.rightdirection.com)
│   │   ├── proposal/           # Anonymous AI proposal form
│   │   ├── universities/       # SEO: university listing pages
│   │   └── [country]/          # SEO: country-specific pages
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-otp/
│   ├── (agent)/                # Agent portal (subdomain-scoped)
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── applications/       # Kanban board
│   │   ├── universities/       # Marketplace
│   │   ├── proposals/
│   │   ├── documents/
│   │   ├── commission/         # Wallet + payouts
│   │   ├── team/
│   │   ├── leads/              # Lead marketplace
│   │   └── settings/           # White-label branding
│   ├── (student)/              # Student portal
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── proposals/
│   │   ├── documents/
│   │   ├── applications/
│   │   └── messages/
│   ├── (university)/           # University portal
│   │   ├── dashboard/
│   │   ├── applications/
│   │   ├── agents/
│   │   ├── analytics/
│   │   └── offers/
│   └── (admin)/                # Super admin
│       ├── dashboard/
│       ├── agents/
│       ├── universities/
│       ├── commissions/
│       ├── fraud/
│       └── config/
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # Shell, Sidebar, Header
│   ├── forms/                  # Reusable form components
│   ├── charts/                 # Recharts wrappers
│   ├── kanban/                 # Application pipeline board
│   └── shared/                 # Cross-portal reusable components
├── lib/
│   ├── api.ts                  # All API calls + TypeScript types (same pattern as Workflow App)
│   ├── auth.ts                 # Auth helpers (token management)
│   ├── tenant.ts               # Tenant context
│   └── utils.ts
├── middleware.ts               # Next.js middleware (auth, tenant routing)
├── tailwind.config.ts
└── package.json
```

### 6.4 AI Service (Python) Structure
```
ai-service/
├── app/
│   ├── routes/
│   │   ├── proposal.py         # University matching + proposal generation
│   │   ├── sop.py              # SOP/LOR writer
│   │   ├── document.py         # OCR + fraud analysis
│   │   ├── visa.py             # Visa prediction (Phase 2)
│   │   └── interview.py        # Interview AI (Phase 3)
│   ├── services/
│   │   ├── llm.py              # Claude + OpenAI client wrappers
│   │   ├── embeddings.py       # Embedding generation + pgvector
│   │   ├── scoring.py          # Trust score calculator
│   │   └── fraud.py            # Document fraud detection
│   ├── models/
│   │   ├── schemas.py          # Pydantic request/response models
│   │   └── prompts.py          # All LLM prompt templates
│   ├── db.py                   # PostgreSQL connection (psycopg3)
│   └── main.py                 # FastAPI app, routes
├── requirements.txt
└── Dockerfile
```

### 6.5 Mobile (Flutter) Structure
```
mobile/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── api/               # Dio HTTP client + interceptors
│   │   ├── auth/              # JWT storage (flutter_secure_storage)
│   │   └── router/            # GoRouter navigation
│   ├── features/
│   │   ├── auth/              # Login, OTP, biometric
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── applications/
│   │   ├── proposals/
│   │   ├── documents/         # Camera + file picker
│   │   └── notifications/
│   └── shared/
│       ├── widgets/
│       └── theme/
├── android/
├── ios/
└── pubspec.yaml
```

---

## 7. Database Schema (Full Prisma)

### 7.1 Core Schema
```prisma
// api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────

enum TenantType {
  AGENT
  UNIVERSITY
  ADMIN
}

enum UserRole {
  SUPER_ADMIN
  AGENT_OWNER
  AGENT_MANAGER
  AGENT_COUNSELOR
  AGENT_TELECALLER
  UNIVERSITY_ADMIN
  UNIVERSITY_STAFF
  STUDENT
}

enum KYCStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  RE_UPLOAD_REQUIRED
}

enum SubscriptionPlan {
  TRIAL
  STARTER
  PRO
  ENTERPRISE
}

enum ApplicationStage {
  LEAD
  DOCS_COLLECTION
  UNDER_REVIEW
  SUBMITTED
  OFFER_RECEIVED
  VISA_PROCESSING
  FEES_PAID
  ENROLLED
  REJECTED
  WITHDRAWN
}

enum DocumentCategory {
  ACADEMIC          // Marksheets, transcripts, degree
  TEST_SCORES       // IELTS, GMAT, GRE, PTE
  IDENTITY          // Passport, Aadhar
  FINANCIAL         // Bank statements, loan letters
  APPLICATION       // SOP, CV, LOR
  VISA              // Visa forms, medical, police verification
  KYC               // Agent KYC docs
}

enum DocumentStatus {
  NOT_UPLOADED
  UPLOADED
  UNDER_REVIEW
  VERIFIED
  REJECTED
}

enum CommissionStatus {
  PENDING
  UNIVERSITY_PAID
  APPROVED
  PAID_TO_AGENT
  DISPUTED
}

enum NotificationChannel {
  IN_APP
  EMAIL
  SMS
  WHATSAPP
}

enum AIJobType {
  PROPOSAL_GENERATION
  SOP_WRITING
  DOCUMENT_FRAUD_CHECK
  VISA_PREDICTION
  TRUST_SCORE_CALCULATION
  INTERVIEW_SIMULATION
}

enum AIJobStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

// ─── CORE ENTITIES ────────────────────────────────────────────────────────

model Tenant {
  id            String       @id @default(uuid())
  type          TenantType
  subdomain     String       @unique
  name          String
  email         String       @unique
  phone         String?
  country       String       @default("IN")
  status        String       @default("ACTIVE") // ACTIVE, SUSPENDED, CHURNED
  plan          SubscriptionPlan @default(TRIAL)
  planExpiresAt DateTime?

  // Branding (agent-specific)
  logoUrl       String?
  primaryColor  String?      @default("#2b7cff")
  secondaryColor String?
  customDomain  String?      @unique

  // University-specific
  universityId  String?      @unique
  university    University?  @relation(fields: [universityId], references: [id])

  users         User[]
  agents        Agent[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@map("tenants")
}

model User {
  id            String       @id @default(uuid())
  tenantId      String
  tenant        Tenant       @relation(fields: [tenantId], references: [id])
  email         String
  phone         String?
  passwordHash  String?
  role          UserRole
  name          String
  avatarUrl     String?
  language      String       @default("en") // en, hi
  isActive      Boolean      @default(true)
  lastLoginAt   DateTime?
  mfaEnabled    Boolean      @default(false)
  mfaSecret     String?

  // Relations
  student       Student?
  refreshTokens RefreshToken[]
  notifications Notification[]
  activityLogs  ActivityLog[]
  documents     Document[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([email])
  @@map("users")
}

model RefreshToken {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token      String   @unique
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  @@map("refresh_tokens")
}

// ─── AGENT ────────────────────────────────────────────────────────────────

model Agent {
  id              String       @id @default(uuid())
  tenantId        String       @unique
  tenant          Tenant       @relation(fields: [tenantId], references: [id])
  businessName    String
  city            String
  state           String?
  pincode         String?
  gstNumber       String?
  panNumber       String?
  kycStatus       KYCStatus    @default(PENDING)
  kycRejectedReason String?
  parentAgentId   String?      // Sub-agent parent
  parentAgent     Agent?       @relation("SubAgents", fields: [parentAgentId], references: [id])
  subAgents       Agent[]      @relation("SubAgents")

  // Performance scores (updated nightly)
  visaSuccessRate Float?
  conversionRate  Float?
  fraudIncidents  Int          @default(0)
  agentScore      Float?       // Composite verified agent score
  isBadgeVerified Boolean      @default(false)

  // Wallet
  walletBalance   Decimal      @default(0) @db.Decimal(12,2)
  totalEarned     Decimal      @default(0) @db.Decimal(12,2)

  kycDocuments    Document[]   @relation("AgentKYCDocuments")
  students        Student[]
  commissions     CommissionLedger[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@map("agents")
}

// ─── UNIVERSITY ────────────────────────────────────────────────────────────

model University {
  id                  String    @id @default(uuid())
  name                String
  country             String
  city                String
  website             String?
  logoUrl             String?
  bannerUrl           String?

  // Rankings
  qsWorldRank         Int?
  timesHigherRank     Int?
  shanghaiRank        Int?

  // Performance stats
  visaSuccessRate     Float?    // 0.0–1.0
  avgPostStudySalaryUsd Int?
  livingCostAnnualUsd Int?

  // Platform relationship
  isPartner           Boolean   @default(false)
  partnerSince        DateTime?
  defaultCommissionPct Float?   @default(15)
  contactEmail        String?
  contactName         String?

  // Portal access
  tenant              Tenant?   // University gets a portal tenant

  courses             Course[]
  applications        Application[]
  commissions         CommissionLedger[]

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([country])
  @@map("universities")
}

model Course {
  id                String      @id @default(uuid())
  universityId      String
  university        University  @relation(fields: [universityId], references: [id])
  name              String
  level             String      // UNDERGRADUATE, POSTGRADUATE, DIPLOMA, PHD
  field             String      // Engineering, Business, Health Sciences, etc.
  durationMonths    Int
  intakes           String[]    // ["September", "January", "May"]
  tuitionFeeUsd     Decimal     @db.Decimal(10,2)
  currency          String      @default("USD")
  localFee          Decimal?    @db.Decimal(10,2) // In original currency
  minGradePercent   Float?
  minIelts          Float?
  minPte            Float?
  minToefl          Float?
  minGre            Int?
  minGmat           Int?
  commissionPct     Float?
  isActive          Boolean     @default(true)
  applicationDeadline String?   // "Rolling" or specific date
  notes             String?

  applications      Application[]

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([universityId])
  @@index([country: false]) // via university relation
  @@map("courses")
}

// ─── STUDENT ──────────────────────────────────────────────────────────────

model Student {
  id              String      @id @default(uuid())
  userId          String      @unique
  user            User        @relation(fields: [userId], references: [id])
  agentId         String?
  agent           Agent?      @relation(fields: [agentId], references: [id])
  tenantId        String      // Agent's tenant who owns this student

  // Academic Profile
  educationLevel  String      // 10th, 12th, UNDERGRADUATE, POSTGRADUATE
  aggregatePct    Float?
  stream          String?     // Science, Commerce, Arts
  preferredField  String[]    // ["Engineering", "Business"]

  // Test Scores
  ieltsScore      Float?
  pteScore        Float?
  toeflScore      Int?
  duolingoScore   Int?
  greScore        Int?
  gmatScore       Int?
  satScore        Int?

  // Preferences
  annualBudgetInr Int?
  preferredCountries String[] // ["UK", "Canada", "Australia"]
  preferredIntake String?     // "September 2025"

  // Lead Info
  leadSource      String?     // WALK_IN, REFERRAL, MARKETPLACE, SOCIAL, WEBSITE
  leadQualityScore Int?       // 0–100 (for marketplace)

  // Profile Completion (computed)
  profileScore    Int?        @default(0)

  proposals       Proposal[]
  applications    Application[]
  documents       Document[]
  trustScore      GlobalTrustScore?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([tenantId])
  @@index([agentId])
  @@map("students")
}

// ─── APPLICATION ──────────────────────────────────────────────────────────

model Application {
  id              String          @id @default(uuid())
  studentId       String
  student         Student         @relation(fields: [studentId], references: [id])
  courseId        String
  course          Course          @relation(fields: [courseId], references: [id])
  universityId    String
  university      University      @relation(fields: [universityId], references: [id])
  agentId         String
  tenantId        String
  stage           ApplicationStage @default(LEAD)
  intake          String?         // "September 2025"
  priority        Boolean         @default(false)

  // University response
  offerLetterUrl  String?
  offerType       String?         // CONDITIONAL, FINAL, SCHOLARSHIP
  offerConditions String?
  offerExpiresAt  DateTime?

  // Visa tracking
  visaAppliedAt   DateTime?
  visaDecision    String?         // APPROVED, REJECTED, PENDING
  visaRejectedReason String?

  // University Trust Portal
  verifyToken     String?         @unique
  verifyTokenExpiresAt DateTime?

  // Back-office handoff
  handoffRequested Boolean        @default(false)
  handoffAssignedTo String?       // User ID of ops team member
  handoffSlaAt    DateTime?
  handoffCompletedAt DateTime?

  // AI scores
  visaProbabilityScore Float?
  enrollmentPredScore  Float?

  commission      CommissionLedger?
  documents       Document[]

  stageHistory    ApplicationStageHistory[]

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([tenantId])
  @@index([studentId])
  @@index([universityId])
  @@index([stage])
  @@map("applications")
}

model ApplicationStageHistory {
  id              String      @id @default(uuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id])
  fromStage       ApplicationStage?
  toStage         ApplicationStage
  changedBy       String      // User ID
  notes           String?
  createdAt       DateTime    @default(now())
  @@map("application_stage_history")
}

// ─── DOCUMENT ─────────────────────────────────────────────────────────────

model Document {
  id              String          @id @default(uuid())
  studentId       String?
  student         Student?        @relation(fields: [studentId], references: [id])
  applicationId   String?
  application     Application?    @relation(fields: [applicationId], references: [id])
  agentId         String?         // For KYC documents
  uploadedBy      String          // User ID
  user            User            @relation(fields: [uploadedBy], references: [id])

  category        DocumentCategory
  name            String
  originalFileName String
  s3Key           String
  s3Bucket        String
  sizeBytes       Int
  mimeType        String
  version         Int             @default(1)
  parentDocId     String?         // Previous version

  status          DocumentStatus  @default(UPLOADED)
  rejectionReason String?
  verifiedBy      String?         // User ID
  verifiedAt      DateTime?

  // AI Fraud Check
  fraudScore      Int?            // 0–100 (higher = more suspicious)
  fraudRiskLevel  RiskLevel?
  fraudDetails    Json?           // { flags: [], explanation: "" }
  ocrText         String?         // Extracted text for analysis

  tenantId        String

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([studentId])
  @@index([applicationId])
  @@index([tenantId])
  @@map("documents")
}

// ─── PROPOSAL ─────────────────────────────────────────────────────────────

model Proposal {
  id              String      @id @default(uuid())
  studentId       String
  student         Student     @relation(fields: [studentId], references: [id])
  agentId         String
  tenantId        String

  // AI Output
  aiInput         Json        // Snapshot of student profile at time of generation
  aiOutput        Json        // { topCountries: [], universities: [], explanation: "" }
  pdfUrl          String?     // S3 URL to branded PDF
  pdfGeneratedAt  DateTime?

  // SOP content (if SOP AI used)
  sopContent      String?
  sopGeneratedAt  DateTime?
  sopVersion      Int         @default(1)

  // Status
  sentToStudent   Boolean     @default(false)
  sentAt          DateTime?
  viewedAt        DateTime?

  aiJobId         String?     // BullMQ job ID

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([studentId])
  @@index([tenantId])
  @@map("proposals")
}

// ─── COMMISSION ───────────────────────────────────────────────────────────

model CommissionLedger {
  id                  String          @id @default(uuid())
  applicationId       String          @unique
  application         Application     @relation(fields: [applicationId], references: [id])
  agentId             String
  agent               Agent           @relation(fields: [agentId], references: [id])
  universityId        String
  university          University      @relation(fields: [universityId], references: [id])
  tenantId            String

  // Tuition & Commission
  tuitionFeeUsd       Decimal         @db.Decimal(10,2)
  commissionPct       Decimal         @db.Decimal(5,2)
  commissionAmountUsd Decimal         @db.Decimal(10,2)

  // Split
  platformSharePct    Decimal         @db.Decimal(5,2)  @default(30)
  platformAmountUsd   Decimal         @db.Decimal(10,2)
  agentSharePct       Decimal         @db.Decimal(5,2)  @default(70)
  agentAmountUsd      Decimal         @db.Decimal(10,2)
  subAgentId          String?
  subAgentSharePct    Decimal?        @db.Decimal(5,2)
  subAgentAmountUsd   Decimal?        @db.Decimal(10,2)

  // India Tax Compliance
  tdsPct              Decimal         @db.Decimal(5,2)  @default(10)
  tdsAmountInr        Decimal?        @db.Decimal(10,2)
  gstApplicable       Boolean         @default(false)
  gstPct              Decimal?        @db.Decimal(5,2)
  gstAmountInr        Decimal?        @db.Decimal(10,2)
  netPayoutInr        Decimal?        @db.Decimal(10,2)
  usdToInrRate        Decimal?        @db.Decimal(8,4)

  // Status
  status              CommissionStatus @default(PENDING)
  universityPaymentDate DateTime?
  universityPaymentProofUrl String?
  agentPayoutDate     DateTime?
  agentPayoutTxnId    String?
  razorpayPayoutId    String?

  // Dispute
  disputeRaisedAt     DateTime?
  disputeReason       String?
  disputeResolvedAt   DateTime?

  remarks             String?
  invoiceUrl          String?         // S3 URL to self-billed invoice PDF
  invoiceNumber       String?         @unique

  approvedBy          String?         // User ID
  approvedAt          DateTime?
  createdBy           String
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@index([agentId])
  @@index([status])
  @@map("commission_ledger")
}

model CommissionRule {
  id              String      @id @default(uuid())
  // Priority: COURSE > UNIVERSITY > COUNTRY > GLOBAL
  scope           String      // GLOBAL, COUNTRY, UNIVERSITY, COURSE, AGENT_UNIVERSITY
  countryCode     String?
  universityId    String?
  courseId        String?
  agentId         String?
  commissionPct   Decimal     @db.Decimal(5,2)
  platformPct     Decimal     @db.Decimal(5,2) @default(30)
  effectiveFrom   DateTime    @default(now())
  effectiveTo     DateTime?
  isActive        Boolean     @default(true)
  createdBy       String
  createdAt       DateTime    @default(now())
  @@map("commission_rules")
}

// ─── AI INFRASTRUCTURE ────────────────────────────────────────────────────

model AIJob {
  id              String      @id @default(uuid())
  type            AIJobType
  status          AIJobStatus @default(QUEUED)
  entityId        String      // proposal_id, student_id, document_id etc.
  entityType      String
  tenantId        String
  requestedBy     String      // User ID
  input           Json
  output          Json?
  errorMessage    String?
  processingMs    Int?
  bullJobId       String?     // BullMQ job ID
  createdAt       DateTime    @default(now())
  completedAt     DateTime?
  @@index([entityId])
  @@index([status])
  @@map("ai_jobs")
}

model GlobalTrustScore {
  id              String      @id @default(uuid())
  studentId       String      @unique
  student         Student     @relation(fields: [studentId], references: [id])
  documentScore   Int?        // 0–100
  financialScore  Int?
  academicScore   Int?
  interviewScore  Int?
  overallScore    Int?
  riskLevel       RiskLevel?
  visaProbability Float?      // 0.0–1.0
  authenticityScore Int?
  computedAt      DateTime    @default(now())
  details         Json?
  @@map("global_trust_scores")
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

model Notification {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  tenantId        String
  channel         NotificationChannel @default(IN_APP)
  title           String
  body            String
  metadata        Json?       // { applicationId, studentId, etc. }
  readAt          DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime    @default(now())
  @@index([userId, readAt])
  @@map("notifications")
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────

model ActivityLog {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  tenantId    String
  action      String    // document_upload, application_stage_change, etc.
  resource    String    // entity type + id
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  createdAt   DateTime  @default(now())
  @@index([tenantId, createdAt])
  @@map("activity_logs")
}

// ─── MARKETPLACE ──────────────────────────────────────────────────────────

model MarketplaceLead {
  id              String      @id @default(uuid())
  studentId       String
  qualityScore    Int         // 0–100
  isUnlocked      Boolean     @default(false)
  unlockedBy      String?     // Agent ID
  unlockedAt      DateTime?
  unlockFeeInr    Int?
  expiresAt       DateTime?   // Lead released back if not contacted
  contactedAt     DateTime?
  createdAt       DateTime    @default(now())
  @@map("marketplace_leads")
}

// ─── SYSTEM CONFIG ────────────────────────────────────────────────────────

model SystemConfig {
  key         String    @id
  value       String
  description String?
  updatedAt   DateTime  @updatedAt
  @@map("system_config")
}
```

### 7.2 Key Indexes (Performance)
```sql
-- Run after migrations for performance
CREATE INDEX CONCURRENTLY idx_students_tenant ON students(tenant_id);
CREATE INDEX CONCURRENTLY idx_applications_tenant_stage ON applications(tenant_id, stage);
CREATE INDEX CONCURRENTLY idx_documents_student ON documents(student_id);
CREATE INDEX CONCURRENTLY idx_commission_agent_status ON commission_ledger(agent_id, status);
CREATE INDEX CONCURRENTLY idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
```

---

## 8. API Design Conventions

### 8.1 NestJS Module Pattern (follow for every module)
```typescript
// Every module exports: Module, Controller, Service, DTOs

// DTO — validated with class-validator + ZodValidationPipe
export class CreateStudentDto {
  @IsString() @IsNotEmpty() name: string
  @IsEmail() email: string
  @IsPhoneNumber('IN') phone: string
  @IsEnum(EducationLevel) educationLevel: EducationLevel
  // ...
}

// Controller — thin, delegates to service
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentController {
  @Post()
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  create(@Body() dto: CreateStudentDto, @CurrentUser() user: User, @Tenant() tenant: string) {
    return this.studentService.create(dto, user, tenant)
  }
}

// Service — all business logic here
@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async create(dto: CreateStudentDto, user: User, tenantId: string) {
    return this.prisma.student.create({ data: { ...dto, tenantId, agentId: user.agentId } })
  }
}
```

### 8.2 API URL Convention
```
GET    /api/v1/students              List students (tenant-scoped)
POST   /api/v1/students              Create student
GET    /api/v1/students/:id          Get student by ID
PATCH  /api/v1/students/:id          Update student (partial)
DELETE /api/v1/students/:id          Soft delete

GET    /api/v1/students/:id/proposals      Student proposals
POST   /api/v1/students/:id/proposals      Generate AI proposal
GET    /api/v1/students/:id/documents      Student documents

POST   /api/v1/applications/:id/stage      Move application stage
GET    /api/v1/applications/kanban         Kanban board data (grouped by stage)

POST   /api/v1/ai/sop                     Generate SOP (async, returns job ID)
GET    /api/v1/ai/jobs/:jobId             Poll AI job status

POST   /api/v1/auth/login
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### 8.3 Response Shape (always consistent)
```typescript
// Success
{ data: T, meta?: { total, page, pageSize } }

// Error
{ error: string, code: string, details?: any }

// Paginated list
{
  data: T[],
  meta: { total: number, page: number, pageSize: number, totalPages: number }
}
```

### 8.4 Authentication Headers
- Web: JWT in httpOnly cookie (access_token + refresh_token)
- Mobile: JWT in Authorization: Bearer header (stored in flutter_secure_storage)
- Internal (NestJS → FastAPI): Static API key in X-Internal-API-Key header

---

## 9. UI Design System

### 9.1 Design Tokens (Tailwind config)
```typescript
// tailwind.config.ts
colors: {
  brand: {
    50:  '#eff5ff',
    100: '#dbe6ff',
    400: '#7aa8ff',
    500: '#2b7cff',   // Primary brand
    600: '#1a6aee',
    700: '#0f3d8a',   // Secondary brand
    900: '#08204d',
  },
  surface: {
    DEFAULT: '#0f1221',  // Page background
    card:    '#151936',  // Card background
    card2:   '#1b2147',  // Elevated card
    border:  '#1f2759',  // Border color
  },
  text: {
    primary:   '#eef3ff',
    secondary: '#c8d0e8',
    muted:     '#7a8499',
  },
  status: {
    success: '#32c671',
    warning: '#ffb020',
    error:   '#ef5350',
    info:    '#38b2fc',
  }
}
```

### 9.2 Portal Themes
| Portal | Mode | Primary BG | Accent |
|--------|------|-----------|--------|
| Agent Dashboard | Dark | #0f1221 | #2b7cff |
| University Portal | Light/Dark toggle | #f8faff / #0f1221 | #0f3d8a |
| Student Portal | Light | #f8faff | #2b7cff |
| Admin Portal | Dark | #0f1221 | #ef5350 (admin red accent) |
| B2C Landing | Light | #ffffff | #2b7cff |

### 9.3 Key UI Patterns
- **Sidebar navigation**: Collapsible; 240px open, 64px collapsed; pinned left
- **Data tables**: TanStack Table v8 with shadcn/ui DataTable wrapper; server-side pagination
- **Kanban board**: @dnd-kit; columns = ApplicationStage enum; student cards with drag
- **Status badges**: Pill chips using status color tokens above
- **Charts**: Recharts with dark/light theme props; area charts for trends, bar for comparisons
- **Forms**: Multi-step wizard for complex flows (proposal generation, student onboarding)
- **Document viewer**: react-pdf in a side-drawer (not modal)
- **Real-time updates**: Socket.io events update React Query cache directly (no page refresh needed)

### 9.4 Key Pages (Agent Portal — most complex)

#### Dashboard Home
```
┌─────────────────────────────────────────────┐
│ [Logo] RightDirection          [User] [Bell] │
├──────────┬──────────────────────────────────┤
│          │  ┌──────┐ ┌──────┐ ┌──────┐      │
│ Sidebar  │  │ 127  │ │  34  │ │  89  │      │
│          │  │Total │ │Active│ │Apps  │      │
│ Dashboard│  └──────┘ └──────┘ └──────┘      │
│ Students │                                   │
│ Applications  [Funnel Chart: Lead→Enrolled]  │
│ Proposals│                                   │
│ Docs     │  [Recent Activity Feed]           │
│ Wallet   │  [Top Performing Counselors]      │
│ Leads    │                                   │
│ Settings │                                   │
└──────────┴──────────────────────────────────┘
```

#### Kanban Board (Applications)
```
[LEAD]  [DOCS]  [REVIEW]  [SUBMITTED]  [OFFER]  [VISA]  [ENROLLED]
  │        │        │           │          │        │        │
[Card]  [Card]  [Card]      [Card]     [Card]  [Card]  [Card]
[Card]          [Card]      [Card]              [Card]
```

---

## 10. Phase 1 — Foundation (Months 0–4)

**Goal**: Launch all 3 portals, onboard 50 agents, 5 university partners, generate first 1,000 AI proposals.

### Module 1.1 — Auth & Multi-Tenant Core
**What to build**:
- [ ] OTP-based registration (Twilio SMS)
- [ ] Email + password login (bcrypt hash)
- [ ] JWT access token (15min) + refresh token (7 days) in httpOnly cookies
- [ ] Tenant creation on agent registration
- [ ] Subdomain routing middleware (Next.js + NestJS)
- [ ] RBAC guards for all roles (7 roles defined in schema)
- [ ] White-label branding: logo upload to S3, primary color stored per tenant
- [ ] Next.js middleware reads subdomain → fetches tenant branding from Redis (TTL 1hr) → applies CSS variables
- [ ] KYC document upload (PDF, max 5MB) to S3 with pre-signed URLs
- [ ] KYC review workflow in Admin portal (approve/reject/re-upload)
- [ ] Trial mode enforcement (50 students cap, 14-day expiry)
- [ ] Razorpay subscription integration for plan upgrades

**Technical notes**:
- Use `X-Forwarded-Host` header in Nginx to pass subdomain to Next.js
- Cache tenant branding in Redis: key = `tenant:branding:{subdomain}`, TTL = 1 hour
- Store S3 presigned URL generation in S3Service (`api/src/lib/s3.service.ts`)
- All KYC docs stored in S3: `kyc/{tenantId}/{docType}/{uuid}.pdf`
- RLS: Set `app.current_tenant` in Prisma middleware using `$executeRaw`

### Module 1.2 — University Marketplace
**What to build**:
- [ ] University master CRUD (Admin portal): name, country, city, rankings, visa success rate, logo
- [ ] Course CRUD: linked to university; intake dates, fees, requirements, commission%
- [ ] Bulk upload via Excel template (xlsx-js-style for parsing)
- [ ] University listing page (Agent portal): search by country, field, budget, intake
- [ ] Course comparison table (up to 5 courses side-by-side)
- [ ] University detail page: all courses, requirements, visa stats
- [ ] Commission rate display per university (visible to agents)
- [ ] University portal (Phase 1 Basic):
  - [ ] Dashboard: total applications received, pending, offers issued
  - [ ] Application list view (per university, per course)
  - [ ] Ability to approve/reject applications with notes
  - [ ] Request additional documents (sends notification to agent)
  - [ ] Issue offer letter (upload PDF to S3)

**Technical notes**:
- University data seeded from Excel initially (manual ops process)
- Course search uses PostgreSQL full-text search (`to_tsvector`) for university names + courses
- University portal users provisioned by Super Admin (email invite flow)

### Module 1.3 — Student Management (CRM)
**What to build**:
- [ ] Add student form: name, phone, email, academic profile, test scores, budget, preferences
- [ ] Student list with search + filters (status, country preference, budget, score)
- [ ] Student detail view with tabs: Profile, Proposals, Documents, Applications, Notes, Activity
- [ ] Internal notes (not visible to student)
- [ ] Activity log auto-generated for every action on student
- [ ] Bulk import students via CSV
- [ ] Export student list to Excel
- [ ] Profile completion score (0–100%, visible to agent)
- [ ] WhatsApp share button (pre-filled message with proposal link)

### Module 1.4 — AI Proposal Engine
**What to build**:
- [ ] Proposal generation form (subset of student profile if already added)
- [ ] FastAPI endpoint: POST /ai/proposal → runs matching algorithm
- [ ] Matching algorithm (deterministic, explainable):
  1. Filter eligible universities by: grade, budget (±20%), English score, country preference
  2. Score each by ROI formula (salary × 0.4 + affordability × 0.3 + ranking × 0.2 + visa rate × 0.1)
  3. Apply diversity filter (max 2 per country in top 5)
  4. Return top 5 universities with explanation
- [ ] Proposal results page: top countries, top universities, ROI scores, cost breakdown
- [ ] PDF generation (Puppeteer): branded with agent logo, color, proposal data
- [ ] PDF stored in S3: `proposals/{tenantId}/{studentId}/{uuid}.pdf`
- [ ] Auto-email to student (Resend) with PDF attachment
- [ ] Proposal history per student

**FastAPI proposal endpoint**:
```python
@router.post("/proposal")
async def generate_proposal(req: ProposalRequest, db: AsyncSession = Depends(get_db)):
    eligible = await filter_eligible_universities(req, db)
    scored = score_universities(eligible, req)
    top5 = apply_diversity_filter(scored)
    explanation = await generate_explanation(top5, req)  # Claude call
    return ProposalResponse(universities=top5, explanation=explanation)
```

### Module 1.5 — Document Management
**What to build**:
- [ ] Document upload component: drag-drop, multi-file, category auto-suggest by filename
- [ ] S3 presigned URL upload flow (client uploads directly to S3; NestJS stores metadata)
- [ ] Document categories (8 types defined in schema)
- [ ] Version control: new upload creates new document record with `parentDocId` link
- [ ] Document status workflow: Uploaded → Under Review → Verified/Rejected
- [ ] Document checklist per student (show what's missing)
- [ ] Secure share link for universities: tokenized URL (256-bit random, 30-day expiry, rate-limited)
- [ ] Document list view with filters by category, status
- [ ] In-browser PDF preview (react-pdf in drawer)
- [ ] Mobile upload: Flutter camera + file picker

**S3 path convention**: `documents/{tenantId}/{studentId}/{category}/{uuid}-v{version}.{ext}`

### Module 1.6 — Basic SOP AI
**What to build**:
- [ ] SOP generation form: academic background, work experience, motivation, career goals, tone
- [ ] FastAPI: POST /ai/sop → Claude API call with structured prompt
- [ ] SOP returned in streaming mode (SSE → Socket.io → browser)
- [ ] Tiptap rich text editor for editing generated SOP
- [ ] AI inline suggestions: hover sentence → "Make formal", "Expand"
- [ ] Export to PDF (agent-branded) and DOCX
- [ ] Stored in proposals table (sopContent field)
- [ ] Word count display, plagiarism check button (Copyscape API, pay-per-check)

**SOP prompt template** (in `ai-service/app/models/prompts.py`):
```python
SOP_PROMPT = """
You are an expert academic writing assistant specializing in study abroad applications.
Write a compelling Statement of Purpose for:
- Course: {course_name} at {university_name}
- Student: {academic_background}
- Work experience: {work_experience}
- Motivation: {motivation}
- Career goals: {career_goals}
- Tone: {tone}  # FORMAL, SEMI_FORMAL, NARRATIVE

Requirements:
- 800-1000 words
- No clichés ("I have always dreamed...")
- Strong opening paragraph
- Specific references to the university/course
- Clear narrative arc
"""
```

### Module 1.7 — Communication & Notifications
**What to build**:
- [ ] In-app notification bell (Socket.io, unread count badge)
- [ ] Notification list with mark-read, mark-all-read
- [ ] Email notifications (Resend):
  - Agent: KYC approved/rejected, new student added by counselor, commission update
  - Student: Proposal ready, document verified, application status change
  - University: New application received, document requested
- [ ] SMS notifications (Twilio): OTP, critical alerts (commission approved)
- [ ] WhatsApp (Gupshup): Proposal share, application status (Phase 2 full integration)
- [ ] Notification preferences per user (which channels to use)

**Socket.io event naming convention**:
```typescript
// Events emitted by server
'notification:new'          // { id, title, body, metadata }
'application:stage_changed' // { applicationId, stage, studentName }
'ai:job_completed'          // { jobId, type, entityId }
'document:verified'         // { documentId, studentId }
```

### Module 1.8 — Admin Portal (Basic)
**What to build**:
- [ ] Agent management: list, approve/reject KYC, suspend, view agent dashboard
- [ ] University master: CRUD for universities + courses
- [ ] Subscription management: upgrade/downgrade agent plans
- [ ] System health dashboard: active tenants, DAU, AI job queue depth
- [ ] Commission rules engine: create/edit global, country, university-level rules
- [ ] Email broadcast (send to all agents or segment)

---

## 11. Phase 2 — Trust & Monetization (Months 4–8)

**Goal**: Launch B2C marketplace, commission engine, document verification AI, acquire 10 university partners.

### Module 2.1 — Document Verification AI (Fraud Detection)
**What to build**:
- [ ] AWS Textract integration: extract text from uploaded PDFs
- [ ] FastAPI fraud check pipeline:
  - Check 1: Verify issuing authority name/logo (OCR pattern matching)
  - Check 2: Numeric range validation (IELTS 0–9, CGPA 0–10)
  - Check 3: Date logic check (graduation before application)
  - Check 4: Metadata analysis (PDF creation date vs claimed date)
  - Check 5: Font/format anomaly detection (ML model)
  - Check 6: Cross-student duplicate detection (same document submitted for multiple students)
- [ ] Fraud score (0–100) stored in documents table
- [ ] Risk level classification: LOW (<30), MEDIUM (30–70), HIGH (>70)
- [ ] Fraud flags shown to university in University Trust Portal
- [ ] Admin fraud monitoring dashboard: high-risk applications list
- [ ] Agent alert: "Document flagged for review" notification

### Module 2.2 — Global Admission Trust Score
**What to build**:
- [ ] Trust score calculator (FastAPI, runs after all documents verified):
  - documentScore: % of required documents verified + weighted fraud check
  - financialScore: Bank statement verified + loan letter present
  - academicScore: Academic docs verified + score plausibility
  - interviewScore: Phase 3 (AI interview not yet built; skip for now)
  - overallScore: Weighted average
- [ ] Trust score displayed to universities when viewing applications
- [ ] Universities can filter applicants by minimum trust score
- [ ] Trust score badge on student profile (Agent portal)

### Module 2.3 — B2C Lead Marketplace
**What to build**:
- [ ] B2C landing page (Next.js SSR): hero + embedded proposal form + SEO meta tags
- [ ] Anonymous student submits simplified proposal form → gets instant AI proposal
- [ ] Lead capture: student email/phone collected before showing results
- [ ] Lead quality scoring (completeness + email verification + behavioral signals)
- [ ] Lead marketplace (Agent portal):
  - Masked lead cards: initials, score range, budget range, preferred countries, city
  - Filter by country preference, budget, score range, quality score
  - Lead unlock: Razorpay payment (₹500–₹2,000 based on quality score)
  - Post-unlock: Full details revealed + notification to student + 24hr contact timer
- [ ] Lead expiry: if not contacted in 24h, released back to marketplace
- [ ] Lead unlock via credit packs (bulk purchase at discount)

### Module 2.4 — Commission & Payout Engine
**What to build**:
- [ ] Commission ledger (all fields in schema above)
- [ ] Commission rules engine with priority hierarchy
- [ ] Commission lifecycle state machine (PENDING → UNIVERSITY_PAID → APPROVED → PAID_TO_AGENT)
- [ ] Agent wallet dashboard:
  - Pending balance, approved balance, total earned
  - Transaction history (filterable, exportable)
  - Withdrawal request (min ₹5,000; Razorpay Payout API)
- [ ] TDS auto-calculation (10% Section 194H)
- [ ] GST handling (0% for international education commission with LUT)
- [ ] Self-billed invoice PDF generation (Puppeteer): invoice number, line items, tax details
- [ ] Invoice stored in S3 (7-year retention): `invoices/{agentId}/{year}/{invoiceNumber}.pdf`
- [ ] Admin commission approval workflow
- [ ] Dispute resolution flow
- [ ] Razorpay Payout API integration for bank transfer / UPI payouts
- [ ] Sub-agent commission calculation (10% from parent agent's share)

### Module 2.5 — Application Kanban Board
**What to build**:
- [ ] Kanban board with 10 stages (drag-and-drop via @dnd-kit)
- [ ] Student cards: name, photo, university logos, days in stage, priority flag
- [ ] Bulk stage move (select multiple → move to next stage)
- [ ] Filter by university, deadline (7-day warning in red), counselor
- [ ] Auto-move triggers: offer letter upload → OFFER_RECEIVED stage; commission created → FEES_PAID
- [ ] Stage history log (complete audit trail)
- [ ] Deadline reminders: background job (BullMQ) sends notification 7 days before deadline

### Module 2.6 — Back-Office Handoff
**What to build**:
- [ ] "Send to Ops Team" button on student profile
- [ ] Handoff checklist: verify docs, fill portal, upload, submit, screenshot
- [ ] 48-hour SLA timer with escalation notification
- [ ] Ops team assignment (Admin portal assigns to ops member)
- [ ] Completion confirmation: screenshot upload required
- [ ] Per-handoff billing via wallet deduction

### Module 2.7 — WhatsApp Integration
**What to build**:
- [ ] Gupshup WhatsApp Business API integration
- [ ] Approved message templates:
  - Proposal ready: "Your study abroad proposal from {agent_name} is ready: {link}"
  - Application update: "Your application to {university} has been updated to {stage}"
  - Document request: "Please upload {document_name} for your application"
  - Commission notification: "₹{amount} commission approved for enrollment of {student}"
- [ ] WhatsApp opt-in/opt-out management
- [ ] Bulk WhatsApp to students from agent portal (compliant templates only)

### Module 2.8 — Verified Agent System
**What to build**:
- [ ] Nightly agent score calculation (BullMQ cron job):
  - visaSuccessRate: visa_approved / visa_submitted (last 12 months)
  - conversionRate: enrolled / proposals_generated (last 12 months)
  - fraudIncidents: count of HIGH risk documents in last 6 months
  - responseTime: avg hours to first contact post lead-unlock
  - agentScore: weighted composite
- [ ] Verified badge awarded when agentScore > 80 AND fraudIncidents == 0
- [ ] Agent profile page showing score breakdown (visible to universities)
- [ ] University agent directory: sort by agent score, filter by country expertise

---

## 12. Phase 3 — Intelligence Layer (Months 8–12)

**Goal**: Create defensible AI moat; full predictive intelligence; voice AI; advanced university features.

### Module 3.1 — Visa Prediction AI
- Train model on historical visa decision data (build dataset from Phase 1-2)
- Features: nationality, destination country, university type, IELTS score, bank balance, program type, agent success rate
- Output: visa probability (0–1) + contributing factors + recommendations
- Displayed on: application card, University Trust Portal, student profile

### Module 3.2 — AI Interview Trainer
- Mock visa interview simulator
- Student inputs: country applying to, visa type (student), program, university
- AI generates interview questions (Claude)
- Student records video/audio response (browser MediaRecorder API)
- AI evaluates: confidence (tone analysis), fluency, consistency, intent risk, financial clarity
- Score + detailed feedback + recommended improvements
- Practice session history

### Module 3.3 — Enrollment Prediction & AI Counselor Copilot
- Predict which leads will convert to enrolled (ML model trained on Phase 1-2 data)
- Counselor copilot: right-panel AI assistant when viewing student profile
  - "This student has 73% chance of UK visa approval based on profile"
  - "Consider adding IELTS score — it will increase match quality by 40%"
  - "3 similar students from this city chose Canada over UK"
- Powered by LangGraph agentic pipeline with student context

### Module 3.4 — Voice AI (Telecalling)
- Integration with Twilio Voice (or Exotel for India)
- Automated follow-up call campaigns
- AI-read scripts: "Hi {name}, your study proposal is ready..."
- Call recording + transcript (stored in S3)
- Telecaller dashboard: call queue, status, notes
- Multi-lingual: English + Hindi

### Module 3.5 — Fraud Intelligence Network
- Cross-tenant fraud detection (PII hashed for privacy)
- Same bank statement used across multiple students → flag all
- Same passport number used by two different students → flag both
- Blacklist database of known fraudulent document patterns
- Network-wide fraud score update when pattern detected

### Module 3.6 — Advanced Analytics (Admin + University)
- Student funnel: Lead → Enrolled conversion rates by country, university, agent
- Visa trend heatmap (which nationalities, which courses, which universities have high visa rates)
- University enrollment prediction for next intake
- Geographic insights: student density map by city/state
- Revenue forecasting (based on pipeline stage + historical conversion)
- Cohort analysis: compare agents onboarded in different months

---

## 13. Phase 4 — Ecosystem Expansion (Months 12+)

| Feature | Description | Partner/Tech |
|---------|------------|--------------|
| Education Loans | In-app loan application + instant sanity | HDFC Credila, Avanse, GyanDhan API |
| Forex | Currency exchange for tuition/living | BookMyForex, EbixCash |
| Accommodation | University housing marketplace | UniAcco, University Stays APIs |
| Insurance | Travel/health/study insurance | Bajaj Allianz, ICICI Lombard |
| Alumni Network | Connect enrolled students with alumni | Custom feature; LinkedIn API |
| Internship Board | Study-to-intern pipeline | Custom feature |
| White-Label Enterprise | Full custom portal for HDFC, Thomas Cook | Custom enterprise contracts |

---

## 14. Security Architecture

### 14.1 Authentication
- JWT access token: 15-minute expiry; signed with RS256 (asymmetric)
- Refresh token: 7-day expiry; stored in DB; rotated on each use (refresh token rotation)
- httpOnly, Secure, SameSite=Strict cookies (web)
- flutter_secure_storage (mobile)
- OTP: 6-digit, valid 5 minutes, max 3 attempts per hour (rate limited by Redis)
- MFA: TOTP (Google Authenticator compatible) for Agent Owner + Admin

### 14.2 Authorization
- RBAC via NestJS RolesGuard — checks JWT role claim
- Resource ownership check in service layer (student.tenantId === user.tenantId)
- PostgreSQL RLS as defense-in-depth (set `app.current_tenant` before every query)
- Admin-only routes require additional `x-admin-secret` header (internal calls)

### 14.3 Data Security
- All S3 documents: server-side encryption (AES-256)
- PAN/Aadhar: field-level encryption before storage (AWS KMS envelope encryption)
- TLS 1.3 enforced; HSTS preload header
- Mobile: SSL certificate pinning via Dio certificate pinner
- No sensitive data in logs (mask mobile, email in Pino serializers)

### 14.4 Input Validation
- All DTOs validated with class-validator + Zod (double validation)
- File upload: MIME type validation (not just extension), max size enforced in Nginx
- SQL injection: Prisma parameterized queries only (no raw SQL with user input)
- XSS: Next.js escapes by default; Tiptap sanitizes with DOMPurify
- Rate limiting: ThrottlerGuard (NestJS) + Redis; 100 req/min per IP, 300 per authenticated user

### 14.5 Compliance
- DPDP Act 2023 (India): consent banner, right to erasure, data localization (Mumbai region)
- Financial data: 7-year retention for commission records
- KYC documents: 3-year retention post agent churn
- Audit logs: 1-year CloudWatch + archived to S3 Glacier (7 years)
- VAPT: External pentest before launch (CERT-IN empaneled firm)

---

## 15. Deployment Architecture

### 15.1 MVP Deployment (Phase 1, single VPS)
```
AWS EC2 t3.large (4 vCPU, 8GB RAM) — Mumbai region (ap-south-1)
├── Docker Compose
│   ├── web (Next.js)       → port 3000
│   ├── api (NestJS)        → port 4000
│   ├── ai-service (FastAPI)→ port 8000
│   ├── postgres            → port 5432
│   └── redis               → port 6379
└── Nginx (reverse proxy + SSL via Certbot)
    ├── Wildcard SSL: *.rightdirection.com
    └── SSL: rightdirection.com, admin.rightdirection.com

AWS S3 bucket: rightdirection-documents (Mumbai)
AWS CloudFront: distribution in front of S3 + CDN for Next.js static assets
```

**Docker Compose snippet**:
```yaml
services:
  api:
    build: ./api
    environment:
      DATABASE_URL: postgresql://rd:${DB_PASS}@postgres:5432/rightdirection
      REDIS_URL: redis://redis:6379
      JWT_PRIVATE_KEY: ${JWT_PRIVATE_KEY}
    depends_on: [postgres, redis]
    restart: unless-stopped

  web:
    build: ./web
    environment:
      NEXT_PUBLIC_API_URL: https://api.rightdirection.com
    restart: unless-stopped

  ai-service:
    build: ./ai-service
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      DATABASE_URL: postgresql://rd:${DB_PASS}@postgres:5432/rightdirection
    restart: unless-stopped
```

### 15.2 Scale Deployment (Phase 2+, AWS managed)
```
AWS (ap-south-1 — Mumbai)
├── CloudFront + S3 (static assets, documents)
├── AWS ALB (Application Load Balancer)
├── ECS Fargate
│   ├── web-service (Next.js, 2–10 tasks, auto-scale on CPU >70%)
│   ├── api-service (NestJS, 2–10 tasks)
│   └── ai-service (FastAPI, 1–5 tasks — GPU optional)
├── RDS PostgreSQL 17 Multi-AZ (db.t4g.medium → db.r6g.large as needed)
├── ElastiCache Redis 7 (cache.t4g.medium)
└── SQS (optional: replace BullMQ if queue depth becomes large)
```

### 15.3 Deploy Script (`scripts/deploy.sh`)
```bash
#!/bin/bash
set -e
echo "🚀 Deploying RightDirection..."

# Pull latest
git fetch origin main
git reset --hard origin/main

# API: migrate + build
cd api && npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

# AI Service: install deps
cd ai-service && pip install -r requirements.txt && cd ..

# Web: build
cd web && npm ci && npm run build && cd ..

# Restart via Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build

# Health check
sleep 15
curl -f http://localhost:4000/api/health || (echo "❌ API health check failed" && exit 1)
echo "✅ Deployment complete"
```

### 15.4 Environment Variables (`.env.example`)
```bash
# Database
DATABASE_URL=postgresql://rd:password@localhost:5432/rightdirection

# Auth
JWT_PRIVATE_KEY=...        # RS256 private key (PEM)
JWT_PUBLIC_KEY=...         # RS256 public key

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=rightdirection-documents
AWS_CLOUDFRONT_URL=https://cdn.rightdirection.com

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Communications
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
GUPSHUP_API_KEY=...        # WhatsApp Business

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Email
RESEND_API_KEY=re_...

# Redis
REDIS_URL=redis://localhost:6379

# App
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_API_URL=https://api.rightdirection.com
INTERNAL_API_KEY=...       # NestJS → FastAPI internal auth
```

---

## 16. Development Conventions & Workflow

### 16.1 Git Workflow
```
main                    → production (protected, CI must pass)
staging                 → staging environment
feature/RD-XXX-name    → feature branches (RD = RightDirection)
fix/RD-XXX-name        → bug fix branches
```
- Never push directly to `main`
- PR requires passing GitHub Actions CI (TypeScript build + Prisma schema check)
- Squash merge to keep history clean

### 16.2 Adding a New NestJS Module (End-to-End)
```
1. Create api/src/modules/<name>/
   ├── <name>.module.ts
   ├── <name>.controller.ts
   ├── <name>.service.ts
   └── dto/
       ├── create-<name>.dto.ts
       └── update-<name>.dto.ts

2. Add model to prisma/schema.prisma
   → npx prisma migrate dev --name add_<name>_model

3. Register module in api/src/app.module.ts

4. Add API types + fetch helpers to web/lib/api.ts

5. Create web/app/(agent)/<name>/page.tsx
   → Add nav entry in web/components/layout/Sidebar.tsx
```

### 16.3 Adding a New Next.js Page
- Server Components by default (no `'use client'`)
- Only add `'use client'` for interactive components (forms, charts, drag-drop)
- Data fetching in server components via direct API fetch with cache tags
- Client data fetching via TanStack Query (`useQuery`, `useMutation`)
- All API call functions defined in `web/lib/api.ts`

### 16.4 BullMQ Job Pattern (async background work)
```typescript
// Define queue in api/src/lib/queues.ts
export const aiQueue = new Queue('ai-jobs', { connection: redisConnection })

// Add job (from service)
await aiQueue.add('proposal', { studentId, tenantId, proposalId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
})

// Worker (api/src/workers/ai.worker.ts)
const worker = new Worker('ai-jobs', async (job) => {
  if (job.name === 'proposal') {
    const result = await aiService.generateProposal(job.data)
    await prisma.aiJob.update({ where: { bullJobId: job.id }, data: { status: 'COMPLETED', output: result } })
    io.to(job.data.tenantId).emit('ai:job_completed', { jobId: job.id, type: 'PROPOSAL_GENERATION' })
  }
}, { connection: redisConnection })
```

### 16.5 Database Rules (same discipline as Workflow App)
- Never `prisma db push` on production — always `migrate deploy`
- One migration per logical feature (not per field)
- All multi-table writes in `prisma.$transaction()`
- N+1 queries eliminated: use `include` or batch `findMany({ where: { id: { in: [...] } } })`
- Batch inserts: `createMany` over N×`create`

### 16.6 Logging
```typescript
// Use Pino in NestJS (never console.log)
import { Logger } from '@nestjs/common'
private readonly logger = new Logger(StudentService.name)
this.logger.log({ studentId, tenantId }, 'Student created')
this.logger.error({ err, studentId }, 'Failed to create student')
```
- Log levels: `error` (exceptions) > `warn` (retryable issues) > `log` (significant events)
- Never log sensitive data: mask phone (`919*******3`), mask email (`ra***@gmail.com`)
- Production: Pino → stdout → Docker log driver → CloudWatch Logs

### 16.7 Error Handling
```typescript
// GlobalExceptionFilter handles all exceptions uniformly
// Responses always: { error: string, code: string }
// Details hidden in production

// Custom exceptions
throw new NotFoundException(`Student ${id} not found`)
throw new ForbiddenException('Insufficient plan for this feature')
throw new BadRequestException({ error: 'Invalid IELTS score', code: 'INVALID_SCORE' })
```

---

## 17. Feature Priority Matrix

### Must-Have (Phase 1 — Ship This First)
| # | Feature | Module | Complexity |
|---|---------|--------|-----------|
| 1 | Auth (OTP + JWT + RBAC) | Auth | High |
| 2 | Agent registration + KYC | Agent | Medium |
| 3 | White-label branding (subdomain + logo + color) | Tenant | Medium |
| 4 | University master data CRUD | University | Low |
| 5 | Course catalog + search | Marketplace | Medium |
| 6 | Student CRM (add, list, detail) | Student | Medium |
| 7 | AI Proposal Engine + PDF | Proposal + AI | High |
| 8 | Document upload + S3 + checklist | Document | Medium |
| 9 | Basic SOP AI | AI | High |
| 10 | University portal (view apps, approve/reject) | University | Medium |
| 11 | Email notifications | Notification | Low |
| 12 | In-app notifications (Socket.io) | Notification | Medium |
| 13 | Admin KYC approval workflow | Admin | Medium |
| 14 | Razorpay subscription (plan gates) | Billing | Medium |

### Important (Phase 2)
| # | Feature | Module | Complexity |
|---|---------|--------|-----------|
| 1 | Document fraud detection AI | Document + AI | Very High |
| 2 | Global Admission Trust Score | AI | High |
| 3 | B2C landing page + lead capture | Marketing | Medium |
| 4 | Lead marketplace (masking + unlock) | Marketplace | High |
| 5 | Commission ledger + wallet | Commission | Very High |
| 6 | Razorpay payouts + TDS/GST | Commission | High |
| 7 | Application Kanban board | Application | High |
| 8 | WhatsApp integration (Gupshup) | Notification | Medium |
| 9 | Verified Agent scoring system | Agent | Medium |
| 10 | University Trust Portal (tokenized) | University | Medium |

### Advanced (Phase 3)
| # | Feature | Complexity |
|---|---------|-----------|
| 1 | Visa prediction ML model | Very High |
| 2 | AI Interview Trainer | Very High |
| 3 | Enrollment prediction | High |
| 4 | AI Counselor Copilot | High |
| 5 | Voice AI (telecalling) | Very High |
| 6 | Fraud Intelligence Network (cross-tenant) | Very High |
| 7 | Advanced analytics dashboards | High |

---

## Appendix A — Key Decisions Reference

| Decision | Choice | Reason |
|---------|--------|--------|
| Monolith vs microservices | NestJS modular monolith | Solo dev; can split modules to services later |
| One DB vs two | PostgreSQL only | Avoid MongoDB; JSONB handles flexible structures |
| BullMQ vs SQS | BullMQ (Phase 1), SQS (Phase 2+) | Simpler locally; upgrade path exists |
| NestJS vs Express | NestJS | Built-in module system for RBAC scale |
| pgvector vs Pinecone | pgvector | No extra service; sufficient for Phase 1-3 |
| Resend vs SES | Resend | Developer DX; better deliverability; SES for bulk later |
| Subdomain tenancy | Subdomain per tenant | White-label requirement; matches Detailed_Scope spec |
| Commission currency | USD (storage), INR (payout) | USD for consistency; INR conversion at payout time |
| PDF generation | Puppeteer | Best quality branded PDFs; runs in Docker |
| Mobile state | Riverpod | Most maintainable Flutter state solution |

## Appendix B — Environment Setup (Local Dev)
```bash
# 1. Clone repo
git clone https://github.com/org/rightdirection.git
cd rightdirection

# 2. Start dependencies
docker-compose up -d postgres redis

# 3. API setup
cd api
cp .env.example .env  # Fill in keys
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# 4. Web setup (new terminal)
cd web
npm install
npm run dev

# 5. AI service setup (new terminal)
cd ai-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 6. Open http://localhost:3000
# Admin: admin@rightdirection.com / password123
# Test Agent: testagent@demo.com / password123
```
