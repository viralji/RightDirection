# PROJECT SCOPE OF WORK: RightDirection Platform

## DOCUMENT VERSION: 2.0 (Production Ready)
**Date:** November 2025  
**Project Type:** B2B2C EdTech Marketplace & White-Label SaaS Platform  
**Target Market:** Tier-2/3 Indian Study Abroad Consultants & Students

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview
**RightDirection** is an AI-native B2B2C EdTech marketplace designed to empower small and mid-sized study abroad consultants across Tier-2 and Tier-3 Indian cities. The platform provides agents with a complete "Business in a Box" solution while offering students instant, AI-powered study abroad recommendations.

### 1.2 Business Model
- **B2B**: White-label CRM platform for study abroad consultants (Agents/Sub-Agents)
- **B2C**: Direct student lead generation marketplace
- **Revenue Streams**:
  - SaaS subscription fees from agents (Monthly/Annual)
  - Commission on successful university admissions (15-25% of university commission)
  - Lead unlock fees in marketplace
  - Premium AI tools (SOP/CV writer)

### 1.3 Core Value Propositions

#### For Agents (Primary Users - B2B)
- **White-Label CRM**: Branded subdomain (agency-name.rightdirection.com) with custom logo and theme
- **Zero Setup Cost**: No IT infrastructure investment required
- **Lead Management**: Capture, nurture, and convert student leads efficiently
- **AI Tools**: Instant study proposal generator, SOP/CV writer
- **Commission Automation**: Transparent tracking and automated payouts
- **Sub-Agent Network**: Manage referral partners and track their commissions
- **Mobile Access**: Flutter app for on-the-go counseling

#### For Students (End Users - B2C)
- **Instant AI Recommendations**: Get personalized course/country suggestions in under 10 seconds
- **Unbiased Guidance**: Algorithm-driven recommendations based on profile, not sales targets
- **Transparent Pricing**: Clear visibility of tuition fees, living costs, ROI projections
- **Document Tracking**: Upload and track application documents in real-time
- **Multi-Agent Access**: Get matched with best-fit consultants based on expertise

#### For Super Admin (Platform Owner)
- **Marketplace Orchestration**: Control agent approval, lead distribution, and quality scores
- **Financial Engine**: Commission rules, split management, wallet system
- **Data Goldmine**: Analytics on student preferences, conversion rates, market trends
- **Compliance Management**: KYC verification, audit trails, financial reporting
- **University Partnerships**: Centralized commission negotiations and payouts

### 1.4 Competitive Advantages
1. **Hyper-Local Focus**: Built specifically for Indian Tier-2/3 consultants (vernacular support, local payment methods)
2. **AI-First Architecture**: Not a traditional CRM with AI bolted on; AI is core to the experience
3. **Fair Commission Model**: Transparent 30-70 split (Platform-Agent) vs. opaque industry practices
4. **Mobile-First Design**: Recognizing that agents often work from home offices with limited desktop access
5. **Sub-Agent Network**: Two-tier referral system (unique in Indian market)

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Architecture Principles
The vendor MUST implement a **Cloud-Native, Microservices Architecture** with the following principles:
- **Multi-Tenancy**: Schema/ID-based tenant isolation (NOT separate databases per agent)
- **API-First Design**: All features accessible via RESTful APIs
- **Event-Driven**: Asynchronous processing for AI tasks, notifications, commission calculations
- **Scalability**: Horizontal auto-scaling on AWS
- **Security**: Zero-trust architecture with RBAC at every layer

### 2.2 Technology Stack (Mandatory)

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Web Frontend** | Next.js 14+ (React 18+) | SEO-critical for B2C lead generation; SSR for fast TTFB; ISR for static pages |
| **Mobile App** | Flutter 3.x | Single codebase for iOS/Android; critical for agent mobility |
| **Backend API** | Node.js (NestJS) | TypeScript for type safety; microservices architecture; excellent for concurrent requests |
| **AI/ML Service** | Python (FastAPI) | Native ML library support (Scikit-learn, TensorFlow Lite); async API; websocket for streaming |
| **Primary Database** | PostgreSQL 15+ | ACID compliance for financial transactions; JSONB for flexible document storage; excellent for multi-tenant row-level security (RLS) |
| **NoSQL Database** | MongoDB 6+ | University/course catalog (nested structures); logs; user activity tracking |
| **Cache Layer** | Redis 7+ | Session management; real-time leaderboards; API rate limiting; pub/sub for notifications |
| **Message Queue** | AWS SQS + AWS SNS | Decoupled async processing (AI tasks, emails, commission calculations) |
| **File Storage** | AWS S3 | Documents, PDFs, images with lifecycle policies (30-day for temp files, 7-year for compliance) |
| **CDN** | AWS CloudFront | Static assets, AI-generated PDFs (reduce load time from 3s to <500ms) |
| **Container Orchestration** | AWS ECS (Fargate) | Serverless containers; auto-scaling; no EC2 management |
| **API Gateway** | AWS API Gateway | Rate limiting, API versioning, request throttling |
| **Monitoring** | AWS CloudWatch + Datadog | Real-time alerts, APM, error tracking |
| **CI/CD** | GitHub Actions | Automated testing, deployment to staging/production |
| **Authentication** | AWS Cognito + Custom JWT | Social login (Google), OTP-based mobile auth, multi-tenant user pools |
| **Payment Gateway** | Razorpay | UPI, cards, net banking, wallets; automatic TDS/GST calculation |
| **Email Service** | AWS SES + SendGrid | Transactional emails (SES for cost, SendGrid for deliverability) |
| **SMS/WhatsApp** | Twilio / Gupshup | OTP, notifications, agent-student communication |

### 2.3 System Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD (Mumbai Region)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ CloudFront   │◄─────┤ S3 (Static)  │      │ S3 (Docs)    │  │
│  │ CDN          │      │ Assets       │      │ + Lifecycle  │  │
│  └──────┬───────┘      └──────────────┘      └──────────────┘  │
│         │                                                        │
│  ┌──────▼────────────────────────────────────────────────────┐ │
│  │              AWS API Gateway (Rate Limiting)              │ │
│  └──────┬────────────────────────────────────────────────────┘ │
│         │                                                        │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │              Application Load Balancer (ALB)             │  │
│  └──────┬───────┬───────────┬──────────────┬────────────────┘  │
│         │       │           │              │                    │
│  ┌──────▼───┐ ┌▼─────────┐ ┌▼─────────┐  ┌▼─────────────┐     │
│  │ ECS      │ │ ECS      │ │ ECS      │  │ ECS          │     │
│  │ (NestJS) │ │ (NestJS) │ │ (FastAPI)│  │ (Workers)    │     │
│  │ Auth API │ │ Core API │ │ AI API   │  │ Background   │     │
│  └──────┬───┘ └─┬────────┘ └─┬────────┘  └──────────────┘     │
│         │       │             │                                 │
│  ┌──────▼───────▼─────────────▼──────────────────────────────┐ │
│  │                   Redis Cluster (ElastiCache)             │ │
│  │          (Session, Cache, Pub/Sub, Rate Limiting)         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────┐        ┌───────────────────────────┐   │
│  │ PostgreSQL (RDS)   │        │ MongoDB (DocumentDB)      │   │
│  │ Multi-AZ           │        │ University Catalog        │   │
│  │ Auto Backup        │        │ Logs, Analytics           │   │
│  └────────────────────┘        └───────────────────────────┘   │
│                                                                  │
│  ┌────────────────────┐        ┌───────────────────────────┐   │
│  │ SQS (Queues)       │        │ SNS (Pub/Sub)             │   │
│  │ - AI Processing    │        │ - Email Notifications     │   │
│  │ - Commission Calc  │        │ - SMS Alerts              │   │
│  └────────────────────┘        └───────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Twilio       │  │ Razorpay     │  │ AWS SES      │
│ (SMS/WA)     │  │ (Payments)   │  │ (Email)      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 2.4 Multi-Tenancy Implementation

#### Database Schema Strategy (Hybrid Approach)
```sql
-- Shared Tables (Super Admin Domain)
- users (all users across tenants with tenant_id)
- tenants (agent organizations)
- universities_master
- commission_rules
- system_config

-- Row-Level Security (RLS) for Tenant Isolation
CREATE POLICY tenant_isolation ON students
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Separate Schemas per Tenant (for high-volume data)
- tenant_12345.applications
- tenant_12345.documents
- tenant_12345.activity_logs
```

#### Subdomain Routing
- **Agent Access**: `agencyname.rightdirection.com` → Backend identifies tenant via subdomain
- **Student Portal**: Student logs in via agent's branded URL → Backend uses tenant_id from user session
- **Super Admin**: `admin.rightdirection.com` → Global dashboard

---

## 3. FUNCTIONAL REQUIREMENTS (PHASE-WISE)

### PHASE 1: MVP - "The Digital Hook" (4-5 Months)
**Goal**: Onboard first 50 agents, generate 1000+ student proposals

#### Module 1.1: Consultant Onboarding & White-Label Setup

**1.1.1 Self-Service Registration**
- **Mobile OTP Flow**:
  - Agent enters mobile number
  - OTP sent via Twilio
  - OTP valid for 5 minutes, max 3 retries/hour
  - Post-verification, collect: Full Name, Business Name, City, Preferred Language (English/Hindi)
- **Email Verification**:
  - Secondary email for account recovery
  - Email verification link (24-hour validity)
- **KYC Document Upload**:
  - Required Documents:
    - GST Certificate (for GST-registered agents)
    - PAN Card (mandatory)
    - Aadhar Card (optional but recommended)
    - Business Proof (Shop Act License, Udyam Certificate, or Rent Agreement)
  - File Format: PDF only, max 5MB per file
  - Status: Auto-set to "Pending KYC Approval"
- **Default Account State**: 
  - Trial Mode (14 days, 10 student limit)
  - Cannot receive commission until KYC approved

**1.1.2 White-Label Branding Engine**
- **Subdomain Selection**:
  - Agent chooses subdomain: `[desired-name].rightdirection.com`
  - Validation: alphanumeric, min 4 chars, max 20 chars
  - Real-time availability check
  - Auto-suggestions if taken (e.g., agencyname-delhi)
- **Visual Customization**:
  - Logo Upload: PNG/JPG, max 1MB, recommended 200x60px
  - Primary Color Picker: Hex color, real-time preview
  - Secondary Color: Auto-generated (darker shade) or manual override
  - CSS Variables Updated: `--primary-color`, `--secondary-color`, `--logo-url`
  - Preview Mode: Agent sees student-facing dashboard before going live
- **Contact Details**:
  - Display Phone: WhatsApp-enabled number for student queries
  - Support Email: Displayed on student portal
  - Office Address: Optional (for local trust building)
  - Social Links: Facebook, Instagram, LinkedIn (optional)

**1.1.3 Staff/Counselor Management**
- **Role-Based Access Control (RBAC)**:
  - **Owner**: Full access (including financials, subscription management)
  - **Manager**: Student management, reports (NO financial access)
  - **Counselor**: Add/edit students, generate proposals (NO reports, NO financials)
- **Invite Flow**:
  - Owner sends invite via email or mobile
  - Invitee receives link (48-hour validity)
  - Sets password and logs in with restricted access
- **Activity Logging**: All staff actions logged (IP, timestamp, action type)

#### Module 1.2: AI Study Proposal Engine

**1.2.1 Student Profile Input Form**
- **Academic Details**:
  - Education Level: 10th, 12th, Undergraduate, Postgraduate
  - Aggregate Score: Percentage or CGPA (auto-converted to percentage)
  - Stream: Science, Commerce, Arts, Engineering, etc.
  - Preferred Field of Study: Drop-down with 50+ options (Engineering, Business, Medicine, etc.)
- **Test Scores** (Optional but improves recommendations):
  - English: IELTS (0-9), TOEFL (0-120), PTE (0-90), Duolingo (0-160)
  - Competitive: GRE (260-340), GMAT (200-800), SAT (400-1600)
- **Budget & Preferences**:
  - Annual Budget: INR slider (5L - 50L) or "Budget Not a Constraint"
  - Preferred Countries: Multi-select (USA, UK, Canada, Australia, Germany, Ireland, etc.)
  - Intake Preference: Fall, Spring, Summer (year auto-populated)
- **Personal Info** (for personalized communication):
  - Full Name, Mobile, Email
  - City (for visa assistance later)

**1.2.2 AI Matching Algorithm (Python FastAPI)**
The algorithm MUST be deterministic, explainable, and auditable.

**Step 1: Eligibility Filtering**
```python
# Pseudo-code
eligible_universities = UniversityDB.filter(
    min_grade <= student.score,
    min_english_score <= student.ielts_equivalent,
    tuition_fee <= student.annual_budget * 1.2,  # Allow 20% flexibility
    country IN student.preferred_countries
)
```

**Step 2: ROI Scoring (Weighted Algorithm)**
```python
for university in eligible_universities:
    roi_score = (
        (university.avg_post_study_salary * 0.4) +      # 40% weight
        (1 / university.tuition_fee * 0.3) +             # 30% weight (inverse)
        (university.ranking_score * 0.2) +               # 20% weight
        (university.visa_success_rate * 0.1)             # 10% weight
    )
    university.roi_score = normalize(roi_score, 0, 100)
```

**Step 3: Diversity & Ranking**
- Sort by `roi_score` DESC
- Apply diversity filter: Maximum 2 universities per country in top 5
- If < 5 results, relax budget constraint by 30%

**Step 4: Output Generation**
- **Top 3 Countries**: Based on highest-scoring universities
- **Top 5 Universities**: With course names, fees, duration, ROI score
- **Explanation**: "Selected based on your score (85%), budget (₹20L), and career ROI"

**1.2.3 PDF Report Generation**
- **Branding**: Agent's logo, subdomain watermark
- **Content**:
  - Student Profile Summary
  - Top 3 Countries (with flags, avg. salary, visa success rate)
  - Top 5 Universities Table:
    - University Name, Location, Course, Duration
    - Tuition Fee (INR + Original Currency)
    - Living Cost (Annual Estimate)
    - Total Cost (Tuition + Living)
    - ROI Score (Graphical Bar)
  - Next Steps: "Contact [Agent Name] at [WhatsApp Link]"
- **Delivery**:
  - Auto-email to student (if email provided)
  - WhatsApp message with PDF link (if mobile provided)
  - Stored in student's account for 90 days
- **Performance**: PDF generation < 3 seconds (using headless Chrome or Puppeteer)

#### Module 1.3: Consultant Dashboard (Business OS)

**1.3.1 Dashboard Home (Analytics Overview)**
- **Key Metrics (Last 30 Days)**:
  - Total Students: Added count
  - Active Students: With at least 1 proposal generated
  - Proposals Generated: Count
  - Applications Submitted: Count
  - Conversion Rate: (Applications / Total Students) * 100
- **Quick Actions**:
  - Add Student (Modal form)
  - Generate Bulk Proposals (CSV upload)
  - Invite Student via WhatsApp (pre-filled message template)
- **Recent Activity Feed**: Last 10 actions (Student added, Proposal generated, Document uploaded)

**1.3.2 Student List (CRM)**
- **Table Columns**:
  - Name, Mobile, Email, Score, Budget, Preferred Country
  - Status: New, Proposal Sent, Documents Collected, Applied, Admitted, Rejected
  - Last Activity Date
  - Actions: View Profile, Generate Proposal, Add Note, Send Message
- **Filters**: Status, Date Range, Budget Range, Country, Score Range
- **Search**: By name, mobile, email
- **Bulk Actions**: Export to Excel, Send bulk WhatsApp message

**1.3.3 Student Detail View**
- **Tabs**:
  - **Profile**: All student details, edit option
  - **Proposals**: List of all generated proposals with download links
  - **Documents**: Upload/view section (categorized: Marksheets, Passport, LOR, SOP, etc.)
  - **Applications**: Universities applied to, status tracking
  - **Activity Log**: Timeline of all interactions
  - **Notes**: Internal notes (not visible to student)

#### Module 1.4: Super Admin - Master Data Management

**1.4.1 Agent Management**
- **Agent Directory**:
  - Table: Business Name, Owner Name, Mobile, City, KYC Status, Subscription Plan, Signup Date
  - Actions: Approve KYC, Reject KYC (with reason), Suspend Account, View Dashboard
- **KYC Verification Workflow**:
  - Admin views uploaded documents in side-by-side viewer
  - Verifies: GST number (via API if possible), PAN format, Business proof authenticity
  - Options: Approve, Request Re-upload (with comment), Reject
  - Notification: Agent receives email/SMS with status update
- **Performance Leaderboard**:
  - Ranking by: Applications Submitted, Conversion Rate, Data Quality Score
  - Filterable by: City, Subscription Plan, Date Range
  - Incentivize top performers with "Verified Partner" badge

**1.4.2 University Master Database**
- **Data Structure** (MongoDB Collection):
```json
{
  "_id": "uuid",
  "university_name": "University of Greenwich",
  "country": "UK",
  "city": "London",
  "ranking": {
    "qs_world": 700,
    "times_higher": 600
  },
  "courses": [
    {
      "course_name": "MSc Computer Science",
      "duration_months": 12,
      "intake": ["September", "January"],
      "tuition_fee_usd": 20000,
      "currency": "GBP",
      "min_grade_percent": 60,
      "min_ielts": 6.5,
      "commission_percent": 15
    }
  ],
  "living_cost_annual_usd": 12000,
  "visa_success_rate": 0.85,
  "avg_post_study_salary_usd": 60000,
  "application_deadline": "Rolling",
  "created_at": "2024-01-01",
  "updated_at": "2024-06-01"
}
```
- **CRUD Interface**:
  - Add University: Form with all fields (auto-currency conversion to USD for consistency)
  - Edit: Inline editing with validation
  - Bulk Upload: Excel template (with validation on upload)
  - Deactivate: Soft delete (for historical data integrity)
- **Data Source Strategy** (Vendor to clarify):
  - Option A: Manual entry by Super Admin (labor-intensive, high accuracy)
  - Option B: Web scraping with human verification (semi-automated, medium accuracy)
  - Option C: Third-party API integration (e.g., StudyPortals, QS API - cost involved)
  - **Recommended**: Hybrid (Scraping + Manual Verification)

**1.4.3 Commission Rules Engine**
- **Rule Types**:
  - **Global Default**: 15% commission on all admissions (unless overridden)
  - **University-Specific**: E.g., "University of Greenwich = 18%"
  - **Country-Specific**: E.g., "All UK universities = 12%"
  - **Course-Specific**: E.g., "All MBA programs = 20%"
  - **Agent-Tier-Based**: E.g., "Premium Agents = +2% bonus"
- **Split Configuration**:
  - Platform Share: Default 30%
  - Agent Share: Default 70%
  - Sub-Agent Share: If applicable, default 10% (from Agent's 70%)
- **Precedence Order**: Course > University > Country > Global Default

---

### PHASE 2: Lead Monetization & AI Tools (3-4 Months)
**Goal**: Launch B2C marketplace, generate ₹10L+ in lead unlock revenue

#### Module 2.1: Lead Marketplace

**2.1.1 B2C Landing Page (SEO-Optimized)**
- **URL**: `www.rightdirection.com` (vs. agent subdomains)
- **Content**:
  - Hero Section: "Find Your Dream University in 60 Seconds"
  - AI Proposal Form (embedded): Simplified version of agent form
  - Trust Indicators: "10,000+ Students Helped", "500+ Partner Agents"
  - Testimonials: Real student stories with photos (with consent)
  - FAQ Section: Common questions about study abroad
- **SEO Requirements**:
  - Server-Side Rendering (Next.js SSR)
  - Meta Tags: Dynamic per page (course, country-specific pages)
  - Schema Markup: Organization, Review, FAQ schemas
  - Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lead Capture**:
  - Student fills form → Gets instant AI proposal
  - Proposal email includes: "Connect with Expert Consultants" CTA
  - Click → Redirected to "Lead Marketplace" (agent selection)

**2.1.2 Lead Matching Algorithm**
- **Criteria for Agent-Lead Matching**:
  1. **Geographic Proximity**: Agents in same city/state ranked higher (for in-person meetings)
  2. **Country Expertise**: Agent's past success rate in student's preferred country
  3. **Capacity**: Agents with < 50 active students ranked higher (avoid overload)
  4. **Response Time**: Agents with avg. response < 2 hours ranked higher
  5. **Rating**: Student reviews (post-Phase 3)
- **Matching Output**: Top 5 agents displayed to student

**2.1.3 Lead Unlock Mechanism**
- **Masked Lead View** (Free for Agents):
  - Student Initials: "Rahul S."
  - Score Range: "80-85%"
  - Budget Range: "₹15-20L"
  - Preferred Countries: "USA, Canada"
  - City: "Pune"
- **Unlock Options**:
  - **Pay-Per-Lead**: ₹500-₹2000 per lead (dynamic pricing based on lead quality)
  - **Credit Pack**: Buy 10 credits for ₹8000 (20% discount)
  - **Subscription Add-On**: Premium plan includes 20 free lead unlocks/month
- **Post-Unlock**:
  - Full details revealed: Name, Mobile, Email, Detailed Profile
  - Auto-notification to student: "Agent [Name] will contact you shortly"
  - Agent has 24 hours to contact (or lead is released back to marketplace)

**2.1.4 Lead Quality Scoring (Anti-Spam)**
- **Factors**:
  - Completeness: All fields filled (higher score)
  - Email Verification: Verified email (higher score)
  - Mobile Verification: OTP-verified mobile (higher score)
  - Duplicate Check: Same mobile/email flagged (lower score)
  - Behavioral Signals: Time spent on page > 3 min (higher score)
- **Score Range**: 0-100
- **Pricing Correlation**: High-quality leads (80+) cost more to unlock

#### Module 2.2: Advanced AI Workbench (Premium Feature)

**2.2.1 AI SOP (Statement of Purpose) Writer**
- **Input Form**:
  - Academic Background: Degree, University, CGPA
  - Work Experience: Job title, Company, Duration, Key achievements (bullet points)
  - Motivation: Why this course? Why this university? (500-word text area)
  - Career Goals: Short-term and long-term (text area)
  - Tone Preference: Formal, Semi-Formal, Narrative
- **AI Generation**:
  - Model: GPT-4 or Claude Sonnet (via Anthropic API)
  - Prompt Engineering: Structured prompt with placeholders
  - Output: 800-1000 word SOP in 15-20 seconds
- **Editor Features**:
  - Rich Text Editor: Bold, Italic, Bullet Points, Undo/Redo
  - AI Suggestions: Hover over sentences for "Make more formal", "Expand this point"
  - Plagiarism Check: (Optional, via Copyscape API - ₹2/check)
  - Word Count: Real-time display
- **Export**: PDF with agent branding, DOCX for editing

**2.2.2 AI CV/Resume Builder**
- **Template Selection**: 5 professional templates (ATS-friendly)
- **Input**:
  - Personal Details: Name, Contact, LinkedIn
  - Education: Auto-populate from student profile
  - Work Experience: Add multiple entries
  - Skills: Multi-select from 200+ skills
  - Certifications: Optional
- **AI Enhancement**:
  - Bullet Point Rewriter: Convert weak points to strong, achievement-focused bullets
  - Skill Recommender: Based on course, suggest relevant skills to add
- **Export**: PDF (multiple formats), DOCX

**2.2.3 Multilingual Chatbot (English + Hindi)**
- **Platform**: Embedded chat widget on student portal
- **Capabilities**:
  - Answer FAQs: "What is IELTS?", "What is the cost of studying in Canada?"
  - Course Search: "Show me affordable MBA programs in Germany"
  - Document Checklist: "What documents do I need for UK visa?"
- **Tech Stack**: 
  - NLP: Dialogflow or Rasa
  - Knowledge Base: Stored in MongoDB (FAQs, document checklists)
  - Fallback: If bot can't answer, route to agent's WhatsApp
- **Language Detection**: Auto-detect language from first message or manual toggle

---

### PHASE 3: End-to-End Operations & Payouts (4-5 Months)
**Goal**: Full application lifecycle management, process ₹5Cr+ in commissions

#### Module 3.1: Governance & Performance Metrics (Super Admin)

**3.1.1 Agent Oversight Dashboard**
- **Agent Lifecycle Management**:
  - **Pending Approval**: New signups awaiting KYC verification
  - **Active**: Approved, currently on paid plan
  - **Suspended**: Temporarily blocked (non-payment, policy violation)
  - **Churned**: Cancelled subscription (retain data for 90 days)
- **Real-Time Metrics**:
  - Total Active Agents, Total Students Managed, Total Applications Submitted
  - Revenue Generated (subscription + lead fees + commission share)
- **Cohort Analysis**: Compare agent performance by signup month

**3.1.2 Performance Leaderboard (Gamification)**
- **Ranking Criteria**:
  1. **Application Volume**: Total applications submitted (20% weight)
  2. **Conversion Rate**: (Admissions / Applications) * 100 (40% weight)
  3. **Data Quality**: % of complete student profiles (20% weight)
  4. **Rejection Rate**: Lower is better (20% weight, negative scoring)
- **Incentives**:
  - Top 10 Agents: Featured on homepage with "Top Performer" badge
  - Monthly Winner: ₹10,000 bonus credited to wallet
  - Quarterly Awards: "Most Improved Agent", "Best Conversion Rate"
- **Public Leaderboard**: Visible to all agents (opt-out option for privacy)

**3.1.3 Business Health Dashboard**
- **Student Funnel Metrics**:
  - Leads Generated → Proposals → Documents → Applications → Offers → Visa → Enrolled
  - Conversion rates at each stage
- **Financial Metrics**:
  - Total Tuition Value Processed: Sum of all enrolled students' tuition fees
  - Commission Earned: Total commission received from universities
  - Commission Paid Out: Total paid to agents
  - Platform Revenue: (Commission Earned - Commission Paid Out) + Subscription Revenue + Lead Fees
- **Geographic Insights**: Heatmap showing student density by city/state
- **Trend Analysis**: Month-over-month growth charts

#### Module 3.2: Commission & Payout Engine (Financial Core)

**3.2.1 Commission Master (Rules Engine)**
- **Rule Hierarchy** (as defined in Phase 1, expanded):
  - **Priority 1**: Agent-University Specific (e.g., "Agent A + University X = 18%")
  - **Priority 2**: Course-Specific (e.g., "All MBA = 20%")
  - **Priority 3**: University-Specific (e.g., "University X = 15%")
  - **Priority 4**: Country-Specific (e.g., "All UK = 12%")
  - **Priority 5**: Global Default (e.g., "15%")
- **Dynamic Pricing**: Admin can set date-based rules (e.g., "15% until Dec 31, 2024, then 12%")
- **Approval Workflow**: Any commission rule change requires Super Admin approval + email notification to affected agents

**3.2.2 Wallet System (Double-Entry Ledger)**

**Database Schema (PostgreSQL)**:
```sql
CREATE TABLE commission_ledger (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,  -- Agent ID
    student_id UUID NOT NULL,
    university_id UUID NOT NULL,
    application_id UUID NOT NULL,
    
    -- Financial Details
    tuition_fee_usd DECIMAL(10,2),
    commission_percent DECIMAL(5,2),  -- e.g., 15.00
    commission_amount_usd DECIMAL(10,2),
    
    -- Split Details
    platform_share_percent DECIMAL(5,2),  -- e.g., 30.00
    platform_amount_usd DECIMAL(10,2),
    agent_share_percent DECIMAL(5,2),  -- e.g., 70.00
    agent_amount_usd DECIMAL(10,2),
    sub_agent_id UUID,  -- NULL if no sub-agent
    sub_agent_share_percent DECIMAL(5,2),  -- e.g., 10.00
    sub_agent_amount_usd DECIMAL(10,2),
    
    -- Status Tracking
    status VARCHAR(20),  -- PENDING, UNIVERSITY_PAID, APPROVED, PAID_TO_AGENT, DISPUTED
    university_payment_date DATE,
    university_payment_proof_url VARCHAR(500),
    agent_payout_date DATE,
    agent_payout_txn_id VARCHAR(100),
    
    -- Compliance (India-Specific)
    tds_percent DECIMAL(5,2),  -- Tax Deducted at Source (default 10%)
    tds_amount_inr DECIMAL(10,2),
    gst_percent DECIMAL(5,2),  -- GST if applicable (18%)
    gst_amount_inr DECIMAL(10,2),
    net_payout_inr DECIMAL(10,2),
    
    -- Audit Trail
    created_at TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    remarks TEXT
);
```

**Commission Lifecycle**:

1. **PENDING**: Student fee payment confirmed by university → Commission entry created
   - Agent sees in wallet: "Pending: ₹X (Expected by [Date])"
   
2. **UNIVERSITY_PAID**: Super Admin marks university payment as received
   - Upload: Bank statement screenshot, Payment reference number
   - Agent notification: "Commission received from university, under verification"
   
3. **APPROVED**: Super Admin verifies and approves for payout
   - Auto-calculation: Net Payout = Gross Commission - TDS - Platform Share
   - Agent sees: "Approved: ₹X (Ready for withdrawal)"
   
4. **PAID_TO_AGENT**: Payout executed via Razorpay Payout API
   - Methods: Bank Transfer (IMPS/NEFT), UPI
   - Receipt: Auto-generated PDF with TDS certificate
   - Status email: "Payment of ₹X credited to your account"

5. **DISPUTED**: If agent contests commission amount
   - Agent raises dispute with reason
   - Super Admin reviews, either approves correction or rejects with explanation

**Wallet Dashboard (Agent View)**:
- **Balance Summary**:
  - Pending: ₹X (awaiting university payment)
  - Approved: ₹Y (ready for withdrawal)
  - Paid: ₹Z (lifetime earnings)
- **Transaction History**: Filterable table with export to Excel
- **Withdrawal Request**:
  - Minimum: ₹5,000
  - Processing Time: 5-7 business days
  - Bank Details: Pre-saved (with verification via penny drop)

**3.2.3 Invoicing System**

**Self-Billed Invoice Generation**:
- **Trigger**: Commission status changes to APPROVED
- **Content**:
  - Invoice Number: Auto-generated (INV-YYYY-MM-XXXXX)
  - Agent Details: Name, GST Number, PAN, Address
  - RightDirection Details: Company name, GSTIN, Address
  - Line Items: 
    - Student Name, University, Course
    - Gross Commission, Platform Share, TDS, GST
    - Net Payable
  - Legal Text: "This is a self-billed invoice as per GST regulations"
- **Format**: PDF (branded, digitally signed)
- **Storage**: S3 with 7-year retention (for tax audits)
- **Delivery**: Auto-emailed to agent + downloadable from wallet

**GST Compliance (Indian Context)**:
- **Agents with GST**: 
  - Commission treated as "Export of Services" (if university is abroad)
  - GST: 0% on commission (IGST exemption under Notification 09/2017)
  - Input Tax Credit: Agent can claim GST on business expenses
- **Agents without GST** (Turnover < ₹20L):
  - Commission paid without GST
  - TDS still deducted (10% under Section 194H)
- **Platform Responsibility**:
  - File GSTR-1 (monthly) reporting all agent payouts
  - Issue Form 16A (TDS certificate) to agents quarterly

**TDS Handling**:
- **Rate**: 10% (as per Section 194H - Commission/Brokerage)
- **Exemption**: If agent provides Form 15G/15H (no tax liability)
- **Deposit**: Platform deposits TDS to govt within 7 days of month-end
- **Certificate**: Form 16A issued quarterly (auto-generated)

#### Module 3.3: Application Pipeline (Kanban Board)

**3.3.1 Visual Workflow (Drag-and-Drop)**

**Stages** (Customizable per agent):
1. **Lead**: Student interested, proposal sent
2. **Documents Collection**: Gathering marksheets, passport, LOR, SOP
3. **Review**: Agent reviewing completeness and quality
4. **Submitted**: Application sent to university
5. **Offer Received**: Admission offer received
6. **Visa Processing**: Visa application submitted
7. **Fees Paid**: Student paid first-year tuition
8. **Enrolled**: Student enrolled, commission triggered
9. **Rejected**: Application rejected by university
10. **Withdrawn**: Student withdrew application

**Features**:
- **Drag & Drop**: Move student cards between stages
- **Card Details**: 
  - Student Name, Photo
  - University logos (all applied universities)
  - Days in current stage
  - Priority flag (urgent cases)
- **Bulk Actions**: Move multiple students to next stage (e.g., 10 students from "Review" to "Submitted")
- **Filters**: By university, course, deadline (applications due within 7 days highlighted in red)
- **Automation**: 
  - Auto-move to "Offer Received" when agent uploads offer letter
  - Auto-move to "Fees Paid" when commission entry created

**3.3.2 Document Management**

**Document Categories** (Per Student):
- Academic: 10th Marksheet, 12th Marksheet, Degree Certificate, Transcripts
- Test Scores: IELTS, TOEFL, GRE, GMAT scorecards
- Identity: Passport, Aadhar
- Financial: Bank Statements (6 months), Loan Sanction Letter
- Application: SOP, CV, LORs (3x), Portfolio (for design courses)
- Visa: Visa application form, Medical certificate, Police verification

**Upload Features**:
- **Drag-and-Drop**: Multi-file upload (max 10 files, 50MB total)
- **Auto-Categorization**: AI suggests category based on filename (e.g., "IELTS_Scorecard.pdf" → Test Scores)
- **Version Control**: Upload new version of document (old versions archived, not deleted)
- **Status Tracking**: 
  - Not Uploaded (red)
  - Uploaded, Pending Review (yellow)
  - Verified (green)
  - Rejected, Re-upload Required (red with comment)
- **Secure Sharing**: Generate time-limited (24h), password-protected link for university portals
- **AI Fraud Check**: (Phase 3 Advanced)
  - OCR: Extract text from PDFs
  - Check 1: Verify issuing authority logo/seal
  - Check 2: Cross-reference scores with standard ranges (e.g., IELTS 0-9)
  - Check 3: Flag suspicious patterns (e.g., perfect 100% in all subjects)
  - Output: Fraud Risk Score (0-100)

**3.3.3 Back-Office Handoff (Outsourced Operations)**

**Use Case**: Agent uploads docs, wants RightDirection ops team to handle submission

**Workflow**:
1. **Handoff Request**: Agent clicks "Send to Ops Team" button on student profile
2. **SLA Timer Starts**: 48-hour countdown displayed
3. **Ops Assignment**: Super Admin assigns to ops team member
4. **Checklist**: 
   - Verify all documents uploaded and categorized
   - Fill university application portal
   - Upload documents to portal
   - Pay application fee (agent pre-deposits to escrow)
   - Submit application
   - Update status to "Submitted"
5. **Completion**: Agent receives notification + screenshot proof of submission
6. **SLA Breach**: If not completed in 48h, escalation email to Super Admin

**Pricing**:
- Free: Included in Premium subscription (up to 10 handoffs/month)
- Pay-Per-Handoff: ₹500 per student application

**3.3.4 University Trust Portal (Verification Gateway)**

**Purpose**: Enable universities to verify student credentials without needing agent intermediary

**Access**:
- **Unique Link**: `verify.rightdirection.com/application/[SECURE_TOKEN]`
- **Generation**: Agent generates link from student profile → copies to university portal or emails university
- **Validity**: 30 days (extendable)
- **No Login Required**: Direct access via token

**Content Displayed**:
- Student Name (masked: "Rahul S."), Photo
- Applied Course, Intake
- Documents:
  - Uploaded Date, Document Name
  - View (PDF viewer, no download option by default)
  - Verification Status (green checkmark if RightDirection verified)
- AI Fraud Check Score:
  - Overall Score: 85/100 (Low Risk)
  - Red Flags: None detected
  - Green Signals: Verified email, Government-issued documents, Consistent data
- Agent Details: RightDirection partner badge, agent's name (builds trust)

**Security**:
- Token: 256-bit random string (unguessable)
- Rate Limiting: Max 10 accesses per token per day (prevent scraping)
- IP Logging: Log all access attempts with IP, timestamp
- Expiry: Auto-expire after 30 days or when application status is "Enrolled/Rejected"

**Analytics** (Super Admin):
- Which universities are actively using this feature (trust signal)
- Average time spent viewing documents (engagement metric)

---

## 4. NON-FUNCTIONAL REQUIREMENTS (NFRs)

### 4.1 Security & Compliance

**4.1.1 Authentication & Authorization**

**Multi-Factor Authentication (MFA)**:
- **Agent/Super Admin**: Mandatory for login
  - Primary: Email + Password
  - Secondary: OTP via SMS or Authenticator App (Google Authenticator, Authy)
- **Student**: Optional (but recommended for document security)

**Role-Based Access Control (RBAC)**:
- **Principle**: Least Privilege Access
- **Implementation**: 
  - PostgreSQL Row-Level Security (RLS) policies
  - API Gateway: JWT token with role claims
  - Frontend: Conditional rendering based on role
- **Roles & Permissions Matrix**:

| Feature | Super Admin | Agent Owner | Agent Manager | Agent Counselor | Student |
|---------|------------|-------------|---------------|-----------------|---------|
| View Own Students | ✓ | ✓ | ✓ | ✓ | Own Profile |
| Edit Student Data | ✓ | ✓ | ✓ | ✓ | Own Profile |
| Generate Proposal | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Financials | ✓ | ✓ | ✗ | ✗ | ✗ |
| Commission Payout | ✓ | ✓ | ✗ | ✗ | ✗ |
| University Master | ✓ | ✗ | ✗ | ✗ | ✗ |
| Approve Agents | ✓ | ✗ | ✗ | ✗ | ✗ |
| Lead Marketplace | ✓ | ✓ (unlock) | ✓ (unlock) | ✗ | ✗ |

**Session Management**:
- **Web**: JWT tokens (access: 15 min, refresh: 7 days)
- **Mobile**: Biometric authentication (after initial login)
- **Auto-Logout**: 30 minutes of inactivity
- **Concurrent Sessions**: Max 3 devices per user (prevent account sharing)

**4.1.2 Data Encryption**

**At Rest**:
- **Database**: PostgreSQL Transparent Data Encryption (TDE) + AWS RDS Encryption
- **Documents**: S3 Server-Side Encryption (SSE-AES256)
- **Sensitive Fields**: Additional field-level encryption for PAN, Aadhar (using AWS KMS)

**In Transit**:
- **TLS 1.3**: Mandatory for all API calls
- **HSTS**: Enforce HTTPS with Strict-Transport-Security header
- **Certificate Pinning**: Mobile apps pin SSL certificate (prevent MITM attacks)

**4.1.3 Audit Trails**

**What to Log**:
- User Actions: Login, Logout, Document Upload, Commission Approval, Data Export
- System Events: API errors, Database failures, Payment gateway timeouts
- Security Events: Failed login attempts (>3 in 5 min → alert), Permission denied errors

**Log Storage**:
- **Platform**: AWS CloudWatch Logs (retention: 1 year)
- **Critical Logs**: Archived to S3 Glacier (retention: 7 years for compliance)
- **Format**: JSON structured logs with fields:
  ```json
  {
    "timestamp": "2024-11-22T10:30:00Z",
    "user_id": "uuid",
    "tenant_id": "uuid",
    "action": "document_upload",
    "resource": "student/12345/documents/passport.pdf",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "status": "success",
    "metadata": {}
  }
  ```

**Access**:
- Super Admin: Full read access via CloudWatch console
- Agents: Cannot view audit logs (prevents tampering awareness)

**4.1.4 Data Privacy (GDPR & Indian Context)**

**Compliance**:
- **DPDP Act 2023** (Digital Personal Data Protection Act, India): 
  - Consent: Explicit consent banner on first visit
  - Right to Access: Students can download all their data
  - Right to Erasure: Students can request account deletion (with 30-day grace period)
  - Data Localization: All Indian user data stored in AWS Mumbai region
- **GDPR** (for EU students):
  - Cookie Consent: Granular consent for tracking, analytics, marketing
  - Data Portability: Export data in JSON format
  - DPO Contact: Designated email for privacy queries

**Data Retention Policy**:
- Active Students: Indefinite (until account deletion)
- Inactive Students (no activity > 2 years): Data anonymized (name → "User_12345", mobile → "XXX")
- Deleted Accounts: Hard delete after 90 days (except financial records → 7 years)

**4.1.5 Penetration Testing & Vulnerability Management**

**Pre-Launch**:
- External Pentest: Hire certified firm (VAPT report required)
- OWASP Top 10: Verify mitigation for all 10 vulnerabilities
- Dependency Scanning: Snyk or Dependabot on GitHub (auto-PR for updates)

**Post-Launch**:
- Quarterly Pentests: Focus on new features
- Bug Bounty: (Phase 3+) Reward ethical hackers (₹5K-₹50K per vulnerability)

### 4.2 Scalability & Performance

**4.2.1 Traffic Projections**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active Agents | 500 | 2,000 | 5,000 |
| Active Students | 10,000 | 50,000 | 150,000 |
| Daily Active Users (DAU) | 2,000 | 10,000 | 30,000 |
| Peak Concurrent Users | 200 | 1,000 | 3,000 |
| API Requests/Day | 100K | 500K | 1.5M |
| Storage (Docs + DB) | 500 GB | 2 TB | 5 TB |

**4.2.2 Performance Benchmarks**

| Page/Action | Target Load Time | Max Acceptable |
|-------------|------------------|----------------|
| Landing Page (B2C) | < 1.5s (LCP) | < 2.5s |
| Agent Dashboard Home | < 2s | < 3s |
| AI Proposal Generation | < 10s | < 15s |
| Document Upload (10MB) | < 5s | < 8s |
| Search (Student List) | < 500ms | < 1s |
| PDF Report Generation | < 3s | < 5s |
| API Response (95th percentile) | < 300ms | < 500ms |

**Optimization Strategies**:
- **CDN**: CloudFront for static assets (images, CSS, JS)
- **Lazy Loading**: Images load only when scrolled into view
- **Code Splitting**: Next.js dynamic imports (reduce initial bundle size by 40%)
- **Database Indexing**: 
  - Postgres: Index on `tenant_id`, `created_at`, `status` (most queried fields)
  - MongoDB: Compound index on `country`, `tuition_fee`, `min_grade`
- **Query Optimization**: 
  - N+1 problem: Use SQL JOINs or Dataloader (batching)
  - Pagination: Limit results to 50 per page (infinite scroll)
- **Caching Strategy**:
  - Redis: Cache frequently accessed data (university list, commission rules) with 1-hour TTL
  - Browser Cache: Static assets cached for 1 year (with versioned filenames)

**4.2.3 Auto-Scaling Configuration**

**AWS ECS (Fargate)**:
- **Scaling Trigger**: CPU > 70% for 2 minutes → Add 1 task
- **Min Tasks**: 2 (for high availability)
- **Max Tasks**: 20 (Year 1), 50 (Year 2)
- **Cool-down**: 5 minutes (prevent rapid scaling)

**Database**:
- **PostgreSQL RDS**: 
  - Instance Class: Start with db.t3.large (2 vCPU, 8GB RAM)
  - Scale-Up Trigger: CPU > 80% for 15 minutes
  - Read Replicas: Add 1 replica when read queries > 10K/hour
- **MongoDB DocumentDB**: 
  - Instance Class: db.r5.large (2 vCPU, 16GB RAM)
  - Sharding: Implement when collection size > 500GB (shard key: `country`)

**Load Testing** (Pre-Launch):
- Tool: Apache JMeter or k6
- Scenario: Simulate 1000 concurrent users (50% browsing, 30% generating proposals, 20% uploading docs)
- Target: 0% error rate, 95th percentile response time < 500ms

### 4.3 Availability & Disaster Recovery

**4.3.1 Uptime SLA**
- **Commitment**: 99.9% uptime (43.8 minutes downtime/month)
- **Measurement**: Uptime Robot or Pingdom (external monitoring)
- **Exclusions**: Scheduled maintenance (announced 48h advance, max 2h/month)

**4.3.2 Backup Strategy**

**Database Backups**:
- **Automated Daily Backups**: 
  - PostgreSQL: RDS automated backups (retention: 30 days)
  - MongoDB: DocumentDB snapshots (retention: 30 days)
  - Time: 2 AM IST (low-traffic window)
- **Weekly Full Backups**: Archived to S3 Glacier (retention: 1 year)
- **Transaction Logs**: Continuous (Point-in-Time Recovery for last 7 days)

**Document Backups**:
- S3 Versioning: Enabled (recover accidental deletions)
- Cross-Region Replication: Critical documents replicated to AWS Singapore (disaster recovery)

**4.3.3 Disaster Recovery Plan**

**RTO (Recovery Time Objective)**: 4 hours
**RPO (Recovery Point Objective)**: 1 hour (max data loss)

**DR Runbook**:
1. **Incident Detection**: CloudWatch alarm triggers PagerDuty alert
2. **Assessment**: On-call engineer assesses severity (P0: Total outage, P1: Major feature down)
3. **Communication**: Status page updated (status.rightdirection.com), email to all agents
4. **Failover** (if primary region fails):
   - DNS: Update Route53 to point to DR region (Singapore)
   - Database: Promote read replica to master
   - Application: Deploy containers in DR region (pre-configured AMIs)
5. **Recovery**: Restore from latest backup, replay transaction logs
6. **Verification**: Smoke tests (login, generate proposal, upload doc)
7. **Post-Mortem**: Document incident, identify root cause, implement fixes

**Multi-Region Setup** (Phase 3):
- **Primary**: AWS Mumbai (ap-south-1)
- **DR**: AWS Singapore (ap-southeast-1)
- **Active-Passive**: Singapore in standby mode (activated only during disaster)

### 4.4 Monitoring & Observability

**4.4.1 Application Performance Monitoring (APM)**
- **Tool**: Datadog or New Relic
- **Metrics**:
  - Request Rate: Requests per second (RPS)
  - Error Rate: % of 4xx/5xx errors
  - Latency: p50, p95, p99 response times
  - Apdex Score: User satisfaction metric (target: > 0.9)
- **Dashboards**: 
  - Executive: High-level KPIs (uptime, DAU, revenue)
  - Engineering: API performance, database queries, error logs
  - Business: Student signups, proposals generated, applications submitted

**4.4.2 Alerting (PagerDuty or Opsgenie)**
- **Critical Alerts** (P0 - Immediate Response):
  - API error rate > 5% for 5 minutes
  - Database CPU > 90% for 10 minutes
  - Payment gateway failure
  - Security: Suspected DDoS attack (>10K requests/min from single IP)
- **Warning Alerts** (P1 - Response within 1 hour):
  - API latency > 1s (p95) for 15 minutes
  - Disk usage > 80%
  - Email delivery failure rate > 10%
- **Info Alerts** (P2 - Review next business day):
  - SSL certificate expiring in 30 days
  - Daily backup failed (retry automated)

**4.4.3 Business Metrics (Real-Time Dashboards)**
- **For Super Admin**:
  - Live Student Signups: Counter with sparkline chart
  - Proposals Generated Today: Count + hourly breakdown
  - Commission Pipeline: Total value in each status (Pending, Approved, Paid)
  - Agent Churn Rate: % of agents who cancelled subscription this month
- **For Agents**:
  - My Performance: Students added, proposals sent, applications submitted (vs. last month)
  - Leaderboard Rank: "You are #45 out of 500 agents"

---

## 5. INTEGRATION REQUIREMENTS

### 5.1 Payment Gateway (Razorpay)

**Use Cases**:
1. **Subscription Payments**: Agents pay monthly/annual subscription
2. **Lead Unlock Fees**: Agents pay to unlock student leads
3. **Premium Features**: One-time purchase (AI SOP writer credits)
4. **Agent Payouts**: Commission disbursement to agent bank accounts

**Features Required**:
- **Payment Links**: Generate unique links for subscription renewal
- **Recurring Payments**: Auto-debit for monthly subscriptions (with 3-day grace period)
- **Webhooks**: Real-time notification on payment success/failure
- **Refunds**: Partial/full refunds via API (for disputed charges)
- **Payouts API**: Transfer money to agent bank accounts (IMPS/NEFT)
- **UPI AutoPay**: For recurring subscriptions (Indian market)
- **Invoices**: Auto-generated GST-compliant invoices

**Razorpay Setup**:
- Account Type: Business (KYC required)
- Settlement Cycle: T+1 (funds settle next day)
- MDR (Merchant Discount Rate): Negotiate for 1.8-2% (default is 2-2.5%)

### 5.2 Communication Channels

**5.2.1 SMS (Twilio or Gupshup)**
- **Use Cases**: OTP, payment reminders, application status updates
- **Volume Estimate**: 50K SMS/month (Year 1)
- **Template Examples**:
  - OTP: "Your RightDirection OTP is {code}. Valid for 5 minutes."
  - Reminder: "Hi {name}, your subscription expires in 3 days. Renew now: {link}"
- **DND Compliance**: Check DLT (Distributed Ledger Technology) registration (mandatory in India)

**5.2.2 WhatsApp Business API (Twilio or Gupshup)**
- **Use Cases**: 
  - Agent-Student Communication: Proposal sharing, document requests
  - Notifications: Application updates, offer letters
  - Chatbot: Basic FAQs
- **Template Approval**: Pre-approved message templates (WhatsApp policy)
- **Pricing**: ₹0.25-₹0.40 per message (conversation-based pricing)
- **Integration**: 
  - Send Message API: `POST /messages` with recipient, template, variables
  - Receive Webhook: Student replies routed to agent's dashboard

**5.2.3 Email (AWS SES + SendGrid)**
- **AWS SES**: 
  - Use Case: Transactional emails (OTP, password reset, receipts)
  - Volume: First 62K emails/month free, then $0.10/1000
  - Warm-up: Gradually increase volume to avoid spam filters
- **SendGrid**:
  - Use Case: Marketing emails (newsletters, feature announcements)
  - Volume: 100 emails/day free, then paid plans
  - Features: Email templates, A/B testing, analytics
- **Deliverability**:
  - SPF/DKIM/DMARC: Configure DNS records (reduce spam score)
  - Bounce Handling: Auto-remove invalid emails after 3 bounces
  - Unsubscribe Link: Mandatory in all marketing emails

### 5.3 Document Processing

**5.3.1 OCR (Optical Character Recognition)**
- **Use Case**: Extract text from uploaded documents (marksheets, passports)
- **Provider Options**:
  - AWS Textract: Best for structured documents (tables, forms)
  - Google Cloud Vision: Best for handwritten text
  - Tesseract (Open Source): Cost-effective, needs fine-tuning
- **Workflow**:
  - Student uploads PDF → S3 → Lambda triggers OCR → Extract text → Store in database
  - Verification: Compare extracted data with user-inputted data (flag mismatches)

**5.3.2 PDF Generation (Puppeteer or PDFKit)**
- **Use Case**: AI proposals, invoices, receipts
- **Approach**:
  - Puppeteer: Render HTML template → Headless Chrome → PDF (high quality, slower)
  - PDFKit: Programmatic PDF creation (faster, less flexible design)
- **Template Storage**: HTML templates in S3, variables injected at runtime

### 5.4 Analytics & Tracking

**5.4.1 Google Analytics 4 (GA4)**
- **Web Tracking**: 
  - Page views, sessions, bounce rate
  - Conversion events: Proposal generated, lead unlocked, subscription purchased
- **Custom Events**:
  - `proposal_generated`: { student_id, country, budget }
  - `lead_unlocked`: { agent_id, lead_id, price }
- **UTM Parameters**: Track marketing campaign effectiveness

**5.4.2 Mixpanel (Product Analytics)**
- **User Behavior**: 
  - Funnel Analysis: Landing page → Signup → Proposal → Application
  - Retention: Cohort analysis (how many agents active after 30/60/90 days)
  - A/B Testing: Test different proposal templates, pricing tiers
- **Events**:
  - Track every user action (button click, form submission, feature usage)
  - Custom properties: user_role, subscription_plan, city

**5.4.3 Hotjar (User Experience)**
- **Heatmaps**: Where users click, scroll depth
- **Session Recordings**: Watch how users navigate (identify UX issues)
- **Surveys**: Pop-up surveys for feature feedback

### 5.5 Third-Party Data Sources (Optional but Recommended)

**5.5.1 University Data APIs**
- **StudyPortals API**: 
  - 220K+ programs from 3,700 universities
  - Cost: ~$500/month (or custom pricing)
  - Data: Course names, fees, entry requirements, intakes
- **QS API**: 
  - University rankings, reputation scores
  - Cost: Custom pricing (enterprise only)
- **Alternative**: Web scraping (legal gray area, needs university consent)

**5.5.2 Currency Conversion API**
- **Provider**: Fixer.io or Open Exchange Rates
- **Use Case**: Convert tuition fees (USD/GBP/AUD/CAD) to INR
- **Update Frequency**: Daily (cache rates for 24 hours)

**5.5.3 Address Verification (Indian Context)**
- **Aadhaar Verification API** (via authorized vendors):
  - Verify agent's Aadhar number (prevent fraud)
  - Cost: ₹1-₹3 per verification
  - Compliance: UIDAI regulations (consent required)
- **GST Verification API** (via GST Network or third-party):
  - Verify GST number validity, business name
  - Free (public API) or ₹0.50/check (premium APIs with additional data)

---

## 6. USER INTERFACE & EXPERIENCE (UI/UX) GUIDELINES

### 6.1 Design Principles

1. **Mobile-First**: 70% of agents will access via mobile → Design for small screens first
2. **Simplicity**: Tier-2/3 agents may have limited tech literacy → Intuitive UI, minimal jargon
3. **Speed**: Every second counts → Skeleton loaders, optimistic UI updates
4. **Trust**: Money is involved → Professional design, clear CTAs, transparent pricing
5. **Localization**: Hindi support → RTL-ready, local currency formatting

### 6.2 Web Frontend (Next.js)

**6.2.1 Landing Page (B2C)**
- **Hero Section**:
  - Headline: "Find Your Dream University in 60 Seconds"
  - Sub-headline: "AI-Powered Study Abroad Guidance from Expert Consultants"
  - CTA Button: "Get Free AI Proposal" (prominent, contrast color)
  - Hero Image: Happy students (diverse, Indian faces for relatability)
- **Trust Section**:
  - Logos: Partner universities (20+ logos in carousel)
  - Stats: "10,000+ Students Helped", "500+ Partner Consultants", "95% Visa Success Rate"
- **How It Works**:
  - Step 1: Fill Profile (icon: form)
  - Step 2: Get AI Recommendations (icon: robot)
  - Step 3: Connect with Expert (icon: handshake)
  - Timeline visualization with connecting lines
- **Social Proof**:
  - Video testimonials (3 students, 30 sec each)
  - Ratings: "4.8/5 from 1,200+ reviews" (with Google Reviews widget)
- **FAQ Accordion**: Address common objections (cost, visa success, credibility)
- **Footer**: Links to About, Terms, Privacy, Contact

**6.2.2 Agent Dashboard**
- **Layout**: Sidebar (collapsible on mobile) + Main Content Area
- **Sidebar Menu**:
  - Dashboard (home icon)
  - Students (users icon)
  - Proposals (document icon)
  - Applications (briefcase icon)
  - Documents (folder icon)
  - Lead Marketplace (shopping cart icon)
  - AI Tools (sparkles icon)
  - Wallet (money icon)
  - Settings (gear icon)
  - Help & Support (question mark icon)
- **Color Scheme**: 
  - Primary: Agent's custom color (from branding settings)
  - Neutral: Grays for text, backgrounds
  - Accents: Green (success), Red (error), Yellow (warning), Blue (info)
- **Typography**: 
  - Headings: Inter or Poppins (clean, modern)
  - Body: System fonts for performance (SF Pro on iOS, Roboto on Android)
- **Responsive Breakpoints**:
  - Mobile: < 640px (1 column, bottom nav)
  - Tablet: 640-1024px (sidebar overlay)
  - Desktop: > 1024px (permanent sidebar)

**6.2.3 Super Admin Dashboard**
- **Different Theme**: Darker, more "command center" feel
- **Data Visualizations**: 
  - Charts: Recharts library (line, bar, pie charts)
  - Maps: Leaflet or Google Maps (heatmap of student density)
  - Tables: React Table with sorting, filtering, pagination
- **Accessibility**: 
  - WCAG 2.1 AA compliance
  - Keyboard navigation (Tab, Enter, Escape)
  - Screen reader support (ARIA labels)
  - Color contrast ratio > 4.5:1

### 6.3 Mobile App (Flutter)

**6.3.1 Navigation Pattern**
- **Bottom Tab Bar** (5 tabs):
  - Home (dashboard overview)
  - Students (list + search)
  - Add Student (+ icon, center)
  - Marketplace (leads)
  - Profile (settings, wallet)
- **Gestures**:
  - Swipe right on student card → Quick actions (call, WhatsApp, generate proposal)
  - Pull-to-refresh on lists
  - Long-press on document → Download or share

**6.3.2 Offline Mode**
- **Cache Strategy**: 
  - Student list cached locally (SQLite)
  - Proposals cached (viewable offline)
  - Document thumbnails cached
- **Sync Indicator**: "Last synced 5 minutes ago" with refresh button
- **Queue Actions**: If offline, queue API calls (e.g., "Add Student") and sync when online

**6.3.3 Push Notifications**
- **Firebase Cloud Messaging (FCM)**: For Android + iOS
- **Notification Types**:
  - New Lead Available: "3 new leads match your expertise"
  - Application Update: "Offer received for Rahul's application to U of Greenwich"
  - Payment Reminder: "Commission of ₹15,000 approved. Withdraw now"
  - System Alerts: "Your subscription expires in 3 days"
- **Settings**: User can toggle notification types on/off

**6.3.4 Biometric Authentication**
- **Fingerprint/Face ID**: After first login, enable quick login
- **Fallback**: PIN code (4-6 digits)
- **Security**: Tokens stored in device keychain (not in SharedPreferences)

### 6.4 Accessibility Features

**For Agents (Many from Tier-2/3 cities)**:
- **Language Toggle**: English/Hindi switch (persist preference)
- **Hindi Transliteration**: Allow typing in English, auto-convert to Hindi (for student names)
- **Voice Input**: Speech-to-text for filling forms (useful while driving)
- **Reduced Data Mode**: Option to disable images, use lower quality (for 3G connections)

**For Students (Diverse Backgrounds)**:
- **Simple Language**: Avoid technical jargon (e.g., "Study Plan" instead of "SOP")
- **Progress Indicators**: Show completion % for profile forms (motivate to finish)
- **Tooltips**: Hover/tap on "IELTS", "GPA" for quick explanations
- **Regional Language Support** (Phase 2+): Tamil, Telugu, Marathi, Bengali

---

## 7. DATA MODEL (Database Schema Overview)

### 7.1 PostgreSQL (Relational Data)

**Core Tables**:

```sql
-- Tenants (Agents)
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    business_name VARCHAR(200) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    owner_name VARCHAR(100),
    owner_mobile VARCHAR(15) UNIQUE,
    owner_email VARCHAR(100) UNIQUE,
    
    -- KYC
    kyc_status VARCHAR(20), -- PENDING, APPROVED, REJECTED
    kyc_documents JSONB,  -- {gst: 'url', pan: 'url', ...}
    kyc_approved_at TIMESTAMP,
    kyc_rejected_reason TEXT,
    
    -- Branding
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),  -- Hex color
    secondary_color VARCHAR(7),
    
    -- Contact
    display_phone VARCHAR(15),
    support_email VARCHAR(100),
    office_address TEXT,
    
    -- Subscription
    subscription_plan VARCHAR(20),  -- TRIAL, BASIC, PREMIUM
    subscription_start_date DATE,
    subscription_end_date DATE,
    subscription_status VARCHAR(20),  -- ACTIVE, EXPIRED, CANCELLED
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Users (Agent Staff, Students, Super Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),  -- NULL for students and super admins
    user_type VARCHAR(20),  -- SUPER_ADMIN, AGENT_OWNER, AGENT_MANAGER, AGENT_COUNSELOR, STUDENT
    
    full_name VARCHAR(100),
    mobile VARCHAR(15) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    
    -- Auth
    email_verified BOOLEAN DEFAULT FALSE,
    mobile_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    
    -- Profile
    profile_picture_url VARCHAR(500),
    preferred_language VARCHAR(10),  -- en, hi
    city VARCHAR(100),
    
    -- Permissions (for staff)
    permissions JSONB,  -- {view_financials: true, edit_students: true, ...}
    
    -- Status
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),  -- NULL if direct B2C lead
    user_id UUID REFERENCES users(id),  -- Link to user account (for login)
    
    -- Personal
    full_name VARCHAR(100),
    mobile VARCHAR(15),
    email VARCHAR(100),
    date_of_birth DATE,
    passport_number VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    
    -- Academic
    education_level VARCHAR(50),
    aggregate_score DECIMAL(5,2),  -- Percentage
    stream VARCHAR(100),
    preferred_field VARCHAR(100),
    
    -- Test Scores
    ielts_score DECIMAL(3,1),
    toefl_score INTEGER,
    pte_score INTEGER,
    gre_score INTEGER,
    gmat_score INTEGER,
    
    -- Preferences
    annual_budget_inr DECIMAL(12,2),
    preferred_countries JSONB,  -- ['USA', 'Canada', ...]
    intake_preference VARCHAR(20),  -- FALL_2025, SPRING_2026
    
    -- Lead Source (for B2C)
    source VARCHAR(50),  -- DIRECT, MARKETPLACE, REFERRAL
    utm_params JSONB,
    
    -- Status
    current_status VARCHAR(50),  -- LEAD, PROPOSAL_SENT, DOCUMENTS_COLLECTED, APPLIED, etc.
    assigned_counselor_id UUID REFERENCES users(id),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Proposals (AI-Generated)
CREATE TABLE proposals (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    tenant_id UUID REFERENCES tenants(id),
    
    -- Input Parameters (for audit)
    input_params JSONB,  -- {score: 85, budget: 2000000, ...}
    
    -- Output
    recommended_countries JSONB,  -- [{name: 'USA', score: 95, ...}, ...]
    recommended_universities JSONB,  -- [{name: 'X', course: 'Y', ...}, ...]
    
    -- PDF
    pdf_url VARCHAR(500),
    pdf_generated_at TIMESTAMP,
    
    -- Engagement
    viewed_at TIMESTAMP,
    downloaded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Applications (University Applications)
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    tenant_id UUID REFERENCES tenants(id),
    university_id UUID,  -- Reference to MongoDB university collection
    
    -- Application Details
    course_name VARCHAR(200),
    intake VARCHAR(20),  -- FALL_2025
    application_fee_usd DECIMAL(10,2),
    tuition_fee_usd DECIMAL(12,2),
    
    -- Status Tracking
    status VARCHAR(50),  -- DRAFT, SUBMITTED, UNDER_REVIEW, OFFER_RECEIVED, REJECTED, etc.
    status_history JSONB,  -- [{status: 'SUBMITTED', date: '2024-01-01', note: '...'}, ...]
    
    -- Documents
    documents JSONB,  -- {marksheet: 'url', sop: 'url', ...}
    
    -- Dates
    application_submitted_at DATE,
    offer_received_at DATE,
    offer_deadline DATE,
    visa_submitted_at DATE,
    fees_paid_at DATE,
    enrollment_date DATE,
    
    -- Commission Tracking
    commission_triggered BOOLEAN DEFAULT FALSE,
    commission_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission Ledger (as detailed earlier)
CREATE TABLE commission_ledger (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    student_id UUID REFERENCES students(id),
    application_id UUID REFERENCES applications(id),
    
    tuition_fee_usd DECIMAL(10,2),
    commission_percent DECIMAL(5,2),
    commission_amount_usd DECIMAL(10,2),
    
    platform_share_percent DECIMAL(5,2),
    platform_amount_usd DECIMAL(10,2),
    agent_share_percent DECIMAL(5,2),
    agent_amount_usd DECIMAL(10,2),
    
    sub_agent_id UUID REFERENCES tenants(id),
    sub_agent_share_percent DECIMAL(5,2),
    sub_agent_amount_usd DECIMAL(10,2),
    
    status VARCHAR(20),
    university_payment_date DATE,
    agent_payout_date DATE,
    agent_payout_txn_id VARCHAR(100),
    
    tds_percent DECIMAL(5,2),
    tds_amount_inr DECIMAL(10,2),
    gst_percent DECIMAL(5,2),
    gst_amount_inr DECIMAL(10,2),
    net_payout_inr DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead Marketplace
CREATE TABLE marketplace_leads (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    
    -- Quality Score
    quality_score INTEGER,  -- 0-100
    
    -- Matching
    matched_agents JSONB,  -- [{tenant_id: 'x', match_score: 85}, ...]
    
    -- Unlock Tracking
    unlocked_by JSONB,  -- [{tenant_id: 'x', unlocked_at: '...', price: 500}, ...]
    
    -- Status
    status VARCHAR(20),  -- AVAILABLE, UNLOCKED, CONVERTED, EXPIRED
    expires_at TIMESTAMP,  -- 30 days from creation
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Commission Rules (Master)
CREATE TABLE commission_rules (
    id UUID PRIMARY KEY,
    rule_type VARCHAR(50),  -- GLOBAL, UNIVERSITY, COUNTRY, COURSE, AGENT_TIER
    
    -- Identifiers
    university_id UUID,  -- NULL if not university-specific
    country VARCHAR(50),  -- NULL if not country-specific
    course_category VARCHAR(100),  -- NULL if not course-specific
    agent_tier VARCHAR(20),  -- NULL if not tier-specific
    
    -- Commission
    commission_percent DECIMAL(5,2),
    platform_share_percent DECIMAL(5,2),
    agent_share_percent DECIMAL(5,2),
    
    -- Validity
    effective_from DATE,
    effective_to DATE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),
    
    action VARCHAR(100),  -- LOGIN, DOCUMENT_UPLOAD, COMMISSION_APPROVED, etc.
    resource_type VARCHAR(50),  -- STUDENT, APPLICATION, COMMISSION, etc.
    resource_id UUID,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Details
    old_value JSONB,
    new_value JSONB,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.2 MongoDB (Semi-Structured Data)

**Collections**:

```javascript
// universities (Master Database)
{
  _id: ObjectId(),
  university_name: "University of Greenwich",
  country: "UK",
  city: "London",
  
  ranking: {
    qs_world: 700,
    times_higher: 600,
    national: 90
  },
  
  courses: [
    {
      course_id: "uuid",
      course_name: "MSc Computer Science",
      level: "Postgraduate",
      duration_months: 12,
      intake: ["September", "January"],
      
      fees: {
        tuition_usd: 20000,
        currency: "GBP",
        tuition_original_currency: 16000
      },
      
      requirements: {
        min_grade_percent: 60,
        min_ielts: 6.5,
        min_toefl: 90,
        min_pte: 58,
        work_experience_years: 0
      },
      
      commission_percent: 15,
      
      outcomes: {
        avg_salary_usd: 60000,
        employment_rate: 0.92,
        top_employers: ["Google", "Amazon", "Microsoft"]
      }
    }
  ],
  
  living_cost_annual_usd: 12000,
  visa_success_rate: 0.85,
  application_deadline: "Rolling",
  
  contact: {
    website: "https://...",
    admission_email: "admissions@...",
    phone: "+44..."
  },
  
  metadata: {
    created_at: ISODate(),
    updated_at: ISODate(),
    data_source: "MANUAL",  // or SCRAPED, API
    verified: true
  }
}

// activity_logs (User Behavior Tracking)
{
  _id: ObjectId(),
  user_id: "uuid",
  tenant_id: "uuid",
  session_id: "uuid",
  
  event_type: "PAGE_VIEW",  // BUTTON_CLICK, FORM_SUBMIT, etc.
  event_name: "dashboard_home",
  
  properties: {
    page_url: "/dashboard",
    referrer: "/login",
    device: "mobile",
    browser: "Chrome"
  },
  
  timestamp: ISODate()
}

// notifications (For Real-Time Alerts)
{
  _id: ObjectId(),
  user_id: "uuid",
  tenant_id: "uuid",
  
  type: "NEW_LEAD",  // OFFER_RECEIVED, COMMISSION_APPROVED, etc.
  title: "New Lead Available",
  message: "3 new leads match your expertise in USA admissions",
  
  data: {
    lead_ids: ["uuid1", "uuid2", "uuid3"]
  },
  
  status: "UNREAD",  // READ, DISMISSED
  
  action_url: "/marketplace",
  
  created_at: ISODate(),
  read_at: ISODate()
}
```

---

## 8. TESTING STRATEGY

### 8.1 Unit Testing
- **Backend**: Jest (Node.js), Pytest (Python)
  - Target Coverage: 80%+ for business logic (commission calculations, matching algorithm)
  - Mock external services (Razorpay, Twilio)
- **Frontend**: React Testing Library
  - Test user interactions (form submissions, button clicks)
  - Snapshot testing for UI components

### 8.2 Integration Testing
- **API Testing**: Postman/Newman
  - Test all CRUD operations for each entity
  - Test authentication flows (login, logout, token refresh)
  - Test edge cases (invalid inputs, concurrent requests)
- **Database Testing**: 
  - Test multi-tenant isolation (ensure Agent A cannot access Agent B's data)
  - Test transaction rollbacks (if commission calculation fails, no partial commits)

### 8.3 End-to-End (E2E) Testing
- **Tool**: Playwright or Cypress
- **Critical User Journeys**:
  1. Agent Signup → KYC Upload → Approval → Dashboard Access
  2. Add Student → Generate Proposal → Download PDF
  3. Student Direct Signup → Get Proposal → Agent Unlocks Lead → Contact
  4. Application Submitted → Offer Received → Commission Triggered → Payout
- **Run Frequency**: Daily on staging, before each production deploy

### 8.4 Performance Testing
- **Load Testing**: Apache JMeter, k6
  - Scenario 1: 1000 concurrent users generating proposals (AI service stress test)
  - Scenario 2: 500 agents uploading documents simultaneously (S3 throughput test)
  - Scenario 3: 100 commission calculations per second (database concurrency test)
- **Stress Testing**: Gradually increase load until system breaks (identify bottlenecks)
- **Target**: 0% error rate up to 2x expected peak load

### 8.5 Security Testing
- **OWASP ZAP**: Automated vulnerability scanning
- **Manual Pentest**: Hire ethical hackers (pre-launch)
- **Tests**:
  - SQL Injection: Attempt in all input fields
  - XSS: Test with `<script>alert('XSS')</script>` payloads
  - CSRF: Verify CSRF tokens on all state-changing requests
  - Authentication Bypass: Try accessing API without tokens, with expired tokens
  - IDOR (Insecure Direct Object Reference): Try accessing other tenant's data by ID manipulation

### 8.6 User Acceptance Testing (UAT)
- **Beta Program**: Invite 20 agents to test MVP (Phase 1) for 2 weeks
- **Feedback Collection**: 
  - In-app surveys: "How easy was it to add a student?" (1-5 scale)
  - Weekly calls with beta users (30 min each)
  - Bug reporting: Dedicated Slack channel or email
- **Success Criteria**: 
  - 80%+ of beta users rate ease-of-use as 4/5 or higher
  - < 10 critical bugs reported
  - At least 50% of beta users upgrade to paid plan after trial

---

## 9. DEPLOYMENT & DevOps

### 9.1 Environments

| Environment | Purpose | Access | Data |
|-------------|---------|--------|------|
| **Development** | Engineers code & test locally | All developers | Dummy data |
| **Staging** | Pre-production testing, client demos | Developers + QA + Stakeholders | Anonymized production data (GDPR-compliant) |
| **Production** | Live user traffic | Ops team only (restricted) | Real user data |

### 9.2 CI/CD Pipeline (GitHub Actions)

**Workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Staging/Production

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies (npm install, pip install)
      - Run linters (ESLint, Pylint)
      - Run unit tests (Jest, Pytest)
      - Run integration tests (Postman/Newman)
      - Code coverage check (fail if < 80%)
  
  build:
    needs: test
    steps:
      - Build Docker images (Backend, AI Service)
      - Tag with commit SHA
      - Push to AWS ECR
  
  deploy:
    needs: build
    steps:
      - If branch = staging:
          - Update ECS service (staging cluster)
          - Run smoke tests
          - Notify Slack: "Staging deployed"
      - If branch = main:
          - Require manual approval (GitHub Environments)
          - Update ECS service (production cluster)
          - Run smoke tests
          - If tests pass: Notify Slack: "Production deployed ✅"
          - If tests fail: Auto-rollback to previous version
```

**Deployment Frequency**:
- Staging: Every commit to `staging` branch (multiple times per day)
- Production: Weekly (Saturdays, 2 AM IST - low traffic window)

### 9.3 Rollback Strategy
- **Blue-Green Deployment**: 
  - Current version: Blue (100% traffic)
  - New version: Green (0% traffic initially)
  - Deploy Green, run smoke tests
  - If pass: Shift 10% traffic → 50% → 100% (gradual rollout over 1 hour)
  - If fail: Keep 100% on Blue, destroy Green
- **Database Migrations**: 
  - Always backward-compatible (add columns, never drop immediately)
  - Rollback: Revert application code (no need to rollback DB schema)

### 9.4 Infrastructure as Code (IaC)
- **Tool**: Terraform
- **Resources Defined**:
  - VPC, Subnets, Security Groups
  - ECS Clusters, Task Definitions
  - RDS (PostgreSQL), DocumentDB (MongoDB)
  - S3 Buckets, CloudFront Distributions
  - IAM Roles & Policies
- **State Management**: Terraform state stored in S3 (with locking via DynamoDB)
- **Version Control**: All `.tf` files in Git (never manual AWS Console changes)

### 9.5 Secrets Management
- **AWS Secrets Manager**: Store API keys, DB passwords, JWT secrets
- **Access**: 
  - ECS tasks fetch secrets at startup (environment variables)
  - Developers cannot view secrets (only rotate)
- **Rotation**: Auto-rotate DB passwords every 90 days

---

## 10. PROJECT TIMELINE & MILESTONES

### Phase 1: MVP (Months 1-5)

| Month | Deliverables | Success Criteria |
|-------|-------------|------------------|
| **Month 1** | Backend setup, Database schema, Auth API, Agent onboarding API | 20 agents can sign up and complete KYC |
| **Month 2** | AI Proposal Engine, University Master CRUD, Super Admin dashboard | Generate 100 accurate proposals (manual verification) |
| **Month 3** | Agent Dashboard (web), Student CRM, Document upload | 50 agents manage 500 students, upload 1000 docs |
| **Month 4** | Mobile App (Flutter), White-label branding, PDF generation | 10 agents test mobile app, rate 4/5+ |
| **Month 5** | UAT, Bug fixes, Performance optimization, Launch prep | Beta program: 80% satisfaction, < 10 critical bugs |

**Go-Live Date**: End of Month 5

### Phase 2: Lead Monetization & AI Tools (Months 6-9)

| Month | Deliverables | Success Criteria |
|-------|-------------|------------------|
| **Month 6** | B2C Landing Page (SEO), Lead Marketplace, Lead Matching Algorithm | 100 B2C leads captured, 50 leads unlocked by agents |
| **Month 7** | AI SOP Writer, AI CV Builder, Payment for lead unlocks | 200 SOPs generated, 50 leads monetized (₹25K revenue) |
| **Month 8** | Multilingual Chatbot, Lead quality scoring | 1000 chatbot interactions, 70% resolved without human |
| **Month 9** | Refinement, Marketing campaigns, Agent training webinars | 500 active agents, 5000 students in system |

**Go-Live Date**: End of Month 9

### Phase 3: End-to-End Operations & Payouts (Months 10-14)

| Month | Deliverables | Success Criteria |
|-------|-------------|------------------|
| **Month 10** | Application Kanban, Document Management, Back-office Handoff | 100 applications tracked, 20 handoffs to ops team |
| **Month 11** | Commission Engine, Wallet System, Invoicing | ₹10L in commissions processed, 0 calculation errors |
| **Month 12** | University Trust Portal, AI Fraud Check, Payout Automation | 50 universities use portal, 200 payouts executed |
| **Month 13** | Performance Leaderboard, Agent Tiers, Gamification | 90% agent engagement with leaderboard |
| **Month 14** | Final testing, Documentation, Handover, Warranty period | 99.9% uptime, 1000+ agents, 20K+ students |

**Go-Live Date**: End of Month 14

### Post-Launch Support (Months 15-18)
- **Warranty Period**: 3 months free bug fixes
- **Enhancements**: Based on user feedback (charged separately)
- **Training**: Monthly webinars for agents, video tutorials

---

## 11. COST ESTIMATION (Vendor to Provide Detailed Quote)

### 11.1 Development Costs (Expected Range)

| Component | Estimated Hours | Rate (₹/hour) | Total (₹) |
|-----------|----------------|---------------|-----------|
| **Backend Development** (NestJS, FastAPI) | 800-1000 | 1500-2500 | 12-25L |
| **Frontend Development** (Next.js) | 600-800 | 1500-2500 | 9-20L |
| **Mobile App** (Flutter) | 400-600 | 1500-2500 | 6-15L |
| **AI/ML Development** (Matching, SOP Writer) | 300-400 | 2000-3000 | 6-12L |
| **UI/UX Design** | 200-300 | 1000-2000 | 2-6L |
| **DevOps & Infrastructure** | 150-200 | 2000-3000 | 3-6L |
| **QA & Testing** | 300-400 | 1000-1500 | 3-6L |
| **Project Management** | 200-300 | 1500-2500 | 3-7.5L |
| **Documentation & Training** | 100-150 | 1000-1500 | 1-2.25L |

**Total Development Cost Estimate**: ₹45L - ₹1Cr (depending on team seniority, location)

### 11.2 Recurring Costs (Monthly, Post-Launch)

| Service | Cost (₹/month) | Notes |
|---------|----------------|-------|
| **AWS Infrastructure** | 50K-2L | Scales with usage; Year 1: ~₹50K, Year 3: ~₹2L |
| **Razorpay MDR** | Variable | 2% of payment volume; ₹10L transactions = ₹20K |
| **Twilio (SMS/WhatsApp)** | 10K-50K | 50K SMS/month @ ₹0.20 = ₹10K |
| **Email (SendGrid)** | 2K-5K | 100K emails/month |
| **Monitoring (Datadog)** | 10K-30K | APM + Logs |
| **Third-Party APIs** | 10K-50K | StudyPortals, Currency, Address Verification |
| **SSL Certificates** | 2K | Wildcard SSL for subdomains |
| **Backups & Archival** | 5K-10K | S3 Glacier storage |
| **Support & Maintenance** | 50K-2L | 10-20% of dev cost annually / 12 |

**Total Recurring Cost (Year 1)**: ₹1.5L-₹5L/month

---

## 12. VENDOR QUESTIONNAIRE

The vendor MUST answer the following in their proposal:

### 12.1 Technical Questions

1. **Multi-Tenancy**: Describe your approach to ensuring complete data isolation between agents. Have you implemented schema-based multi-tenancy before? Provide a reference project.

2. **University Data**: 
   - Do you have existing access to university course databases (e.g., StudyPortals API)? 
   - If not, will you build a web scraper? Clarify the legal implications.
   - What is your plan for keeping data updated (frequency, automated or manual)?

3. **AI Matching Algorithm**: 
   - Explain your approach to the ROI scoring formula. Will you use collaborative filtering, content-based, or hybrid?
   - How will you handle "cold start" problem (new universities with no historical data)?
   - Can the algorithm be easily tuned by Super Admin (e.g., change weightages)?

4. **Concurrency & Financial Accuracy**: 
   - How will you prevent race conditions in commission calculations? 
   - Describe your approach to database transactions (ACID compliance for financial ledger).
   - What happens if university payment is received twice by mistake?

5. **Scalability**: 
   - Provide load test results from a similar project (concurrent users handled, p95 latency).
   - How will you handle 10x growth (from 500 to 5000 agents) without major refactoring?

6. **Security**: 
   - Have you conducted penetration tests on previous projects? Share summary reports.
   - How will you implement API rate limiting to prevent abuse?
   - Describe your approach to prevent IDOR (Insecure Direct Object Reference) attacks.

### 12.2 Project Management Questions

7. **Team Composition**: 
   - Provide CVs of key team members (Backend Lead, Frontend Lead, AI/ML Engineer, DevOps, QA Lead).
   - What is the team's availability? Will they work full-time or part-time on this project?
   - Do you have Hindi-speaking team members for user interviews and support?

8. **Past Experience**: 
   - Share 2-3 case studies of similar B2B2C marketplace projects you've built.
   - Specifically, have you built multi-tenant SaaS platforms? Commission/payout systems?
   - Provide client references (we will contact them).

9. **Development Methodology**: 
   - Do you follow Agile/Scrum? What is your sprint duration?
   - How often will you provide demos (weekly, bi-weekly)?
   - What project management tool do you use (Jira, Trello, Asana)?

10. **Communication**: 
    - Who will be our primary point of contact?
    - How will you handle scope changes or ambiguities during development?
    - What is your policy on change requests (included in estimate or charged extra)?

11. **Testing & QA**: 
    - What is your test coverage target (unit, integration, E2E)?
    - Will you provide UAT support (helping us test with beta users)?
    - What is your bug fix policy post-launch?

12. **Post-Launch Support**: 
    - What is included in your warranty period (duration, scope)?
    - What are your SLAs for critical bugs (P0, P1, P2)?
    - Do you offer ongoing maintenance contracts? What are the terms?

### 12.3 Commercial Questions

13. **Pricing Model**: 
    - Provide a fixed-price quote for each phase separately (Phase 1, 2, 3).
    - What is your payment schedule (milestones, advance, deliverable-based)?
    - Are there any additional costs not covered in your quote?

14. **Timeline**: 
    - Are you comfortable with the proposed timeline (5 months for Phase 1)?
    - What are the risks to the timeline? How will you mitigate them?
    - What are your penalty clauses for delays?

15. **Intellectual Property**: 
    - Confirm that all source code, designs, and documentation will be owned by the client.
    - Will you sign an NDA and IP assignment agreement?
    - Do you use any proprietary libraries/frameworks that would require licensing?

16. **Data Security & Compliance**: 
    - Are you GDPR-compliant in your development practices?
    - Have you worked on projects requiring Indian compliance (GST, TDS, DPDP Act)?
    - Will you sign a Data Processing Agreement (DPA)?

---

## 13. ACCEPTANCE CRITERIA (Per Phase)

### Phase 1 MVP - Acceptance Criteria

**Functional Requirements**:
- [ ] 20 agents can successfully complete self-service signup and KYC submission
- [ ] Super Admin can approve/reject KYC within the dashboard
- [ ] Agent can configure white-label branding (subdomain, logo, colors) and see preview
- [ ] Agent can add 50 students with complete profiles
- [ ] AI Proposal Engine generates accurate proposals in < 10 seconds for 95% of requests
- [ ] Proposal PDF includes agent branding and is delivered via email and WhatsApp
- [ ] Agent Dashboard displays all key metrics (students, proposals, conversion rate)
- [ ] Mobile app (Flutter) has feature parity with web for core functions (add student, generate proposal)
- [ ] Super Admin can CRUD university master data (add, edit, deactivate universities)
- [ ] Multi-tenancy: Agent A cannot access Agent B's data (verified via API testing)

**Non-Functional Requirements**:
- [ ] 99% uptime during UAT period (30 days)
- [ ] Dashboard load time < 2 seconds on 4G connection
- [ ] AI Proposal generation < 10 seconds for 95th percentile
- [ ] Mobile app size < 50 MB (Android APK)
- [ ] Zero critical security vulnerabilities (per pentest report)
- [ ] Code coverage > 75% for backend business logic

**Documentation**:
- [ ] API documentation (Swagger/OpenAPI) for all endpoints
- [ ] Super Admin manual (PDF, 20+ pages)
- [ ] Agent onboarding video tutorial (5 minutes)
- [ ] Database schema documentation (ERD diagram)

**Deliverables**:
- [ ] Source code committed to client's GitHub repository
- [ ] Terraform scripts for AWS infrastructure
- [ ] Deployed to staging environment (accessible via URL)
- [ ] UAT sign-off from client (email confirmation)

### Phase 2 - Acceptance Criteria

**Functional Requirements**:
- [ ] B2C landing page achieves Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] 100 students can sign up directly without agent (B2C flow)
- [ ] Lead Marketplace displays 50 leads with quality scores
- [ ] Agent can unlock leads and see full contact details
- [ ] Payment integration: Agent can purchase lead credits via Razorpay (UPI, cards)
- [ ] AI SOP Writer generates 800-1000 word SOPs in < 20 seconds
- [ ] AI CV Builder exports professional PDFs in 3 templates
- [ ] Multilingual chatbot answers 50 pre-defined FAQs in English and Hindi
- [ ] Lead quality scoring flags low-quality leads (< 30 score)

**Non-Functional Requirements**:
- [ ] B2C landing page ranks on Google for 5 target keywords (tracked via Google Search Console)
- [ ] Payment success rate > 95% (tracked via Razorpay dashboard)
- [ ] AI tools (SOP, CV) have < 2% error rate (manual review of 100 samples)
- [ ] Chatbot resolution rate > 60% (does not escalate to human)

**Deliverables**:
- [ ] SEO audit report (from SEMrush or Ahrefs)
- [ ] Updated API documentation
- [ ] Marketing assets (landing page copy, email templates)

### Phase 3 - Acceptance Criteria

**Functional Requirements**:
- [ ] Application Kanban board: Agent can drag-drop 100 applications across 8 stages
- [ ] Document Management: 1000 documents uploaded, categorized, and verified
- [ ] Commission Ledger: 100 commission entries created with accurate calculations (0 errors)
- [ ] Wallet System: 50 agents can view balance, transaction history, request withdrawals
- [ ] Automated Payouts: Super Admin can trigger bulk payouts to 20 agents via Razorpay
- [ ] Invoicing: Auto-generated GST-compliant invoices for 100 transactions
- [ ] University Trust Portal: 10 secure links generated, accessed by university admissions officers
- [ ] AI Fraud Check: 100 documents scanned, fraud risk scores displayed
- [ ] Performance Leaderboard: 500 agents ranked by conversion rate, visible in dashboard

**Non-Functional Requirements**:
- [ ] Commission calculations handle 100 concurrent requests with 0% error rate
- [ ] Wallet balance discrepancies: 0% (verified via manual audit)
- [ ] Payout success rate > 98% (Razorpay API reliability)
- [ ] University Trust Portal links are secure (penetration test confirms no unauthorized access)

**Deliverables**:
- [ ] Financial reconciliation report (sample 100 transactions)
- [ ] TDS/GST compliance documentation
- [ ] University Trust Portal demo video
- [ ] Final handover document (credentials, runbooks, maintenance guide)

---

## 14. RISKS & MITIGATION STRATEGIES

### 14.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **AI Proposal Accuracy Issues** | Medium | High | • Validate algorithm with 500+ test cases<br>• Implement feedback loop (agents rate proposal quality)<br>• Fallback: Manual curation for edge cases |
| **Multi-Tenancy Data Leaks** | Low | Critical | • Rigorous testing (penetration test specifically for IDOR)<br>• Code review by security expert<br>• Row-Level Security (RLS) in PostgreSQL |
| **Third-Party API Downtime** (Razorpay, Twilio) | Medium | Medium | • Implement retries with exponential backoff<br>• Queue failed requests (SQS)<br>• Multiple SMS providers (failover) |
| **Scalability Bottlenecks** | Medium | High | • Load testing before each phase launch<br>• Auto-scaling on ECS, RDS<br>• Database query optimization (indexing, caching) |
| **University Data Staleness** | High | Medium | • Weekly automated data refresh scripts<br>• Flag outdated records (last_updated > 90 days)<br>• Manual verification for top 50 universities |

### 14.2 Business Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Low Agent Adoption** | Medium | High | • Extensive beta testing (50 agents before launch)<br>• Onboarding webinars, in-app tutorials<br>• First 3 months free for early adopters |
| **Commission Disputes** | High | Medium | • Transparent rules engine (agents can see calculations)<br>• Audit trail for every transaction<br>• Dedicated dispute resolution process (48-hour SLA) |
| **Compliance Issues** (GST, TDS) | Low | High | • Consult CA/Tax Lawyer before launch<br>• Automated GST filing integration (ClearTax API)<br>• Annual compliance audit |
| **University Pushback** (Trust Portal) | Medium | Low | • White-label as "Student Verification Service"<br>• Get MoU with 5 universities before launch<br>• Emphasize fraud prevention benefits |
| **Competitive Entry** | Medium | Medium | • Focus on Tier-2/3 market (underserved niche)<br>• Lock-in via network effects (more agents = more leads)<br>• Aggressive feature development (6-month roadmap) |

### 14.3 Project Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Scope Creep** | High | High | • Freeze scope after sign-off (change requests charged separately)<br>• Phase-wise delivery (defer non-critical features)<br>• Change Control Board (CCB) for approvals |
| **Key Personnel Turnover** | Medium | High | • Document everything (code comments, runbooks)<br>• Knowledge transfer sessions (recorded)<br>• Backup team members for critical roles |
| **Timeline Delays** | Medium | High | • Buffer time (20%) in each phase<br>• Weekly progress reviews, red flag blockers early<br>• Parallel workstreams where possible (frontend + backend) |
| **Budget Overruns** | Medium | Medium | • Fixed-price contract with clear scope<br>• Change requests require written approval + quote<br>• Monthly budget reviews |

---

## 15. SUCCESS METRICS (KPIs)

### 15.1 Product KPIs (12 Months Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Active Agents** | 1,000+ | Agents with ≥1 login in last 30 days |
| **Paying Agents** | 500+ (50% conversion from trial) | Agents on Basic/Premium plan |
| **Students in System** | 20,000+ | Total student profiles created |
| **Proposals Generated** | 50,000+ | Cumulative AI proposals |
| **Applications Submitted** | 2,000+ | Via platform or back-office handoff |
| **Commission Processed** | ₹5 Cr+ | Total tuition value leading to commission |
| **Platform Revenue** | ₹50 L+ | Subscriptions + Lead Fees + Commission Share |
| **User Satisfaction** | 4.2/5 | In-app NPS survey (quarterly) |

### 15.2 Technical KPIs (Ongoing)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Uptime** | 99.9% | Uptime Robot monitoring |
| **API Latency (p95)** | < 500ms | Datadog APM |
| **Error Rate** | < 0.5% | CloudWatch Logs (4xx/5xx) |
| **Mobile Crash Rate** | < 1% | Firebase Crashlytics |
| **Page Load Time (LCP)** | < 2.5s | Google Lighthouse (monthly audit) |
| **Database Query Time (p95)** | < 100ms | RDS Performance Insights |

### 15.3 Business KPIs (Financial)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **MRR** (Monthly Recurring Revenue) | ₹10 L | ₹50 L | ₹2 Cr |
| **CAC** (Customer Acquisition Cost per agent) | ₹5,000 | ₹3,000 | ₹2,000 |
| **LTV** (Lifetime Value per agent) | ₹30,000 | ₹50,000 | ₹1,00,000 |
| **LTV/CAC Ratio** | 6:1 | 16:1 | 50:1 |
| **Churn Rate** | < 15% | < 10% | < 5% |
| **Gross Margin** | 60% | 70% | 80% |

---

## 16. GLOSSARY

| Term | Definition |
|------|------------|
| **Agent** | Study abroad consultant/agency using RightDirection's white-label platform |
| **Sub-Agent** | Referral partner of an Agent (earns commission on referred students) |
| **Student** | End-user seeking study abroad guidance |
| **Tenant** | Technical term for Agent (in multi-tenant architecture) |
| **B2C Lead** | Student who signed up directly on RightDirection.com (not via agent) |
| **Proposal** | AI-generated study plan (countries + universities) for a student |
| **ROI Score** | Algorithm-calculated metric balancing tuition cost vs. future earning potential |
| **Commission Ledger** | Financial record of all commissions earned, split, and paid |
| **Wallet** | Agent's internal account showing commission balance (pending, approved, paid) |
| **Lead Unlock** | Action where agent pays to see full details of a B2C lead |
| **Quality Score** | 0-100 rating of lead authenticity (higher = more likely to convert) |
| **Trust Portal** | Secure link for universities to verify student documents |
| **Fraud Check** | AI analysis of uploaded documents to detect tampering/forgery |
| **TDS** | Tax Deducted at Source (10% of commission, per Indian Income Tax Act) |
| **GST** | Goods and Services Tax (18% on platform services, exemptions apply) |
| **KYC** | Know Your Customer (identity verification for agents) |
| **SLA** | Service Level Agreement (e.g., "Resolve P0 bugs within 4 hours") |
| **RTO/RPO** | Recovery Time/Point Objective (disaster recovery metrics) |
| **RBAC** | Role-Based Access Control (permissions per user role) |
| **IDOR** | Insecure Direct Object Reference (vulnerability where user accesses unauthorized data) |
| **LCP/FID/CLS** | Core Web Vitals (Google's page performance metrics) |
| **SSR/ISR** | Server-Side Rendering / Incremental Static Regeneration (Next.js features) |

---

## 17. APPENDICES

### Appendix A: Sample Commission Calculation

**Scenario**:
- Student: Rahul Sharma
- University: University of Greenwich, UK
- Course: MSc Computer Science
- Tuition Fee: £16,000 (GBP) = ₹16,00,000 (INR @ 1 GBP = 100 INR)
- Commission Rate: 15% (per university agreement)
- Platform Share: 30%
- Agent Share: 70%
- Sub-Agent: Yes (referred by Partner Agency, 10% share from agent's portion)
- TDS: 10%

**Calculation**:
1. Gross Commission = ₹16,00,000 × 15% = **₹2,40,000**
2. Platform Share = ₹2,40,000 × 30% = **₹72,000**
3. Agent Share = ₹2,40,000 × 70% = **₹1,68,000**
4. Sub-Agent Share = ₹1,68,000 × 10% = **₹16,800**
5. Net Agent Share = ₹1,68,000 - ₹16,800 = **₹1,51,200**
6. TDS Deduction = ₹1,51,200 × 10% = **₹15,120**
7. **Final Payout to Agent** = ₹1,51,200 - ₹15,120 = **₹1,36,080**
8. **Payout to Sub-Agent** = ₹16,800 (no TDS if under threshold)

**Ledger Entries** (Double-Entry):
```
DEBIT: Commission Receivable (University of Greenwich) - ₹2,40,000
CREDIT: Platform Revenue - ₹72,000
CREDIT: Agent Wallet (Pending) - ₹1,36,080
CREDIT: Sub-Agent Wallet (Pending) - ₹16,800
CREDIT: TDS Payable (Govt) - ₹15,120
```

### Appendix B: Sample API Endpoints

**Authentication**:
- `POST /api/auth/signup` - Agent/Student signup
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/verify-otp` - Verify mobile OTP
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Invalidate session

**Students** (Agent Portal):
- `GET /api/students` - List all students (paginated, filtered by tenant_id)
- `POST /api/students` - Add new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student profile
- `DELETE /api/students/:id` - Delete student (soft delete)

**Proposals**:
- `POST /api/proposals/generate` - Generate AI proposal for student
- `GET /api/proposals/:id` - Get proposal details
- `GET /api/proposals/:id/pdf` - Download PDF report

**Applications**:
- `POST /api/applications` - Create application record
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/pipeline` - Get Kanban board data

**Marketplace** (Lead System):
- `GET /api/marketplace/leads` - List available leads (for agent)
- `POST /api/marketplace/leads/:id/unlock` - Unlock lead (deduct credits)
- `GET /api/marketplace/my-leads` - Get agent's unlocked leads

**Commission & Wallet**:
- `GET /api/wallet/balance` - Get agent's wallet balance
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/withdraw` - Request withdrawal

**Admin** (Super Admin Only):
- `GET /api/admin/agents` - List all agents
- `PUT /api/admin/agents/:id/kyc-status` - Approve/reject KYC
- `GET /api/admin/universities` - List universities
- `POST /api/admin/universities` - Add university
- `PUT /api/admin/commission-rules` - Update commission rules

**All APIs Return**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Student created successfully",
  "timestamp": "2024-11-22T10:30:00Z"
}
```

**Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  },
  "timestamp": "2024-11-22T10:30:00Z"
}
```

### Appendix C: Regulatory Compliance Checklist (India)

**GST Compliance**:
- [ ] Register for GST (if annual turnover > ₹20L)
- [ ] Issue GST-compliant invoices (with GSTIN, HSN code)
- [ ] File monthly GSTR-1 (outward supplies)
- [ ] File monthly GSTR-3B (summary return)
- [ ] Claim Input Tax Credit (ITC) on business expenses

**TDS Compliance**:
- [ ] Deduct 10% TDS on agent commissions (Section 194H)
- [ ] Deposit TDS to govt within 7 days of month-end
- [ ] File quarterly TDS return (24Q)
- [ ] Issue Form 16A to agents (quarterly TDS certificate)

**Income Tax**:
- [ ] File annual ITR (for company)
- [ ] Maintain books of accounts (audited if turnover > ₹1 Cr)

**Data Privacy (DPDP Act 2023)**:
- [ ] Appoint Data Protection Officer (DPO)
- [ ] Publish Privacy Policy on website
- [ ] Obtain explicit consent for data collection
- [ ] Implement user rights (access, erasure, portability)
- [ ] Data breach notification (within 72 hours to authorities)

**RBI Guidelines** (for Payouts):
- [ ] Partner with RBI-authorized payment aggregator (Razorpay)
- [ ] KYC for all payout recipients (agents)
- [ ] Monitor suspicious transactions (>₹50,000 flagged)

### Appendix D: Testing Checklist (Pre-Launch)

**Functional Testing**:
- [ ] All user journeys tested (agent signup to commission payout)
- [ ] Boundary testing (max students per agent, max file upload size)
- [ ] Negative testing (invalid inputs, unauthorized access)

**Performance Testing**:
- [ ] Load test: 1000 concurrent users (95th percentile latency < 500ms)
- [ ] Stress test: Identify breaking point (2x expected peak load)
- [ ] Spike test: Sudden traffic surge (e.g., marketing campaign)

**Security Testing**:
- [ ] OWASP Top 10 verified (SQL injection, XSS, CSRF, etc.)
- [ ] External penetration test (certified firm, report submitted)
- [ ] Dependency vulnerability scan (Snyk, no critical/high issues)
- [ ] SSL/TLS configuration (A+ grade on SSL Labs)

**Compatibility Testing**:
- [ ] Web: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Mobile: iOS 14+, Android 10+
- [ ] Responsive: Tested on 5 screen sizes (320px to 1920px)

**Usability Testing**:
- [ ] 10 agents test and provide feedback (SUS score > 70)
- [ ] Heatmap analysis (Hotjar) - no dead zones on critical pages

**Compliance Testing**:
- [ ] GDPR consent flow tested (EU users)
- [ ] Accessibility audit (WCAG 2.1 AA, using axe DevTools)
- [ ] Email deliverability test (Mailtester, score > 8/10)

---

## 18. FINAL NOTES FOR VENDOR

1. **This is a Living Document**: We expect the vendor to suggest improvements based on their expertise. If you see a better approach (technology, architecture, feature), please highlight it in your proposal.

2. **Indian Market Context**: This platform is designed for Indian Tier-2/3 agents. Consider local nuances:
   - Low digital literacy → Simple UI, vernacular support
   - Mobile-first → 70% traffic from mobile
   - Price sensitivity → Affordable pricing (₹999-₹2999/month for agents)
   - Trust deficit → Transparent pricing, clear value prop

3. **Scalability is Key**: We plan to scale to 10,000+ agents in 3 years. Every architectural decision should consider 10x growth. Avoid shortcuts that will require major refactoring later.

4. **AI is Core, Not Optional**: The AI Proposal Engine is our competitive advantage. Invest in making it accurate, fast, and explainable. Consider A/B testing different algorithms.

5. **Financial Accuracy is Non-Negotiable**: Commission calculations must be 100% accurate. Even 1% error will destroy trust. Implement extensive testing, auditing, and reconciliation processes.

6. **Security First**: We're handling sensitive data (Aadhar, PAN, Passports) and money. Security cannot be an afterthought. Budget for penetration testing, security audits, and ongoing monitoring.

7. **Documentation is Critical**: We need to understand and maintain this system post-handover. Invest in clear documentation (code comments, API docs, runbooks, architecture diagrams).

8. **Support Our Vision**: We're building this to empower small consultants, not replace them. Keep this mission in mind while designing features. The platform should make agents more efficient, not obsolete.

---

## 19. SUBMISSION GUIDELINES

**Proposal Must Include**:
1. **Executive Summary** (2 pages): Your understanding of the project, proposed approach
2. **Technical Proposal** (15-20 pages): 
   - Detailed architecture diagram
   - Technology stack with justifications
   - Answers to all vendor questions (Section 12)
   - Database schema (high-level ERD)
   - API design (sample endpoints)
3. **Team Profiles** (5 pages): CVs of key team members with relevant experience
4. **Project Plan** (5 pages): 
   - Phase-wise timeline with milestones
   - Resource allocation (who works on what)
   - Risk management plan
5. **Commercial Proposal** (3 pages):
   - Fixed-price quote per phase
   - Payment terms
   - Post-launch support options
6. **Case Studies** (5 pages): 2 relevant past projects with client references
7. **Assumptions & Exclusions** (2 pages): What's included/excluded in your quote

**Submission Deadline**: [To be filled by client]

**Format**: PDF, max 50 pages (excluding appendices)

**Contact for Queries**: [To be filled by client]

---

**END OF DOCUMENT**

*Version 2.0 | November 2025 | Prepared for IT Service Provider RFP*