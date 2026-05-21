/**
 * RightDirection — exhaustive demo seed
 * Covers all entities, statuses, and realistic cross-portal scenarios.
 * Run: npm run db:seed  (from repo root)
 */
import {
  PrismaClient,
  Prisma,
  UserRole,
  TenantType,
  KYCStatus,
  SubscriptionPlan,
  ApplicationStage,
  DocumentCategory,
  DocumentStatus,
  CommissionStatus,
  NotificationChannel,
  AIJobType,
  AIJobStatus,
  RiskLevel,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedStudentJourneyExtras } from './student-journey-seed';

const prisma = new PrismaClient();
const PASS_DEMO = 'Demo@123';
const PASS_ADMIN = 'Admin@123';

// ─── Fixed IDs (deterministic re-runs) ───────────────────────────────────────
const ID = {
  adminTenant: 'seed-tenant-admin',
  adminUser: 'seed-user-admin',
  platformConfig: 'seed-platform-config',

  agentDemoTenant: 'seed-tenant-agent-demo',
  agentDemo: 'seed-agent-demo',
  agentDemoOwner: 'seed-user-agent-demo-owner',
  agentDemoCounselor: 'seed-user-agent-demo-counselor',
  agentDemoTelecaller: 'seed-user-agent-demo-telecaller',

  agentGlobalTenant: 'seed-tenant-agent-global',
  agentGlobal: 'seed-agent-global',
  agentGlobalOwner: 'seed-user-agent-global-owner',

  agentAspireTenant: 'seed-tenant-agent-aspire',
  agentAspire: 'seed-agent-aspire',
  agentAspireOwner: 'seed-user-agent-aspire-owner',

  agentMetroTenant: 'seed-tenant-agent-metro',
  agentMetro: 'seed-agent-metro',
  agentMetroOwner: 'seed-user-agent-metro-owner',

  agentQuickTenant: 'seed-tenant-agent-quick',
  agentQuick: 'seed-agent-quick',
  agentQuickOwner: 'seed-user-agent-quick-owner',

  agentPrimeTenant: 'seed-tenant-agent-prime',
  agentPrime: 'seed-agent-prime',
  agentPrimeOwner: 'seed-user-agent-prime-owner',

  agentSuspendedTenant: 'seed-tenant-agent-suspended',
  agentSuspended: 'seed-agent-suspended',
  agentSuspendedOwner: 'seed-user-agent-suspended-owner',

  uniHerts: 'university-of-hertfordshire',
  uniCoventry: 'coventry-university',
  uniAlgoma: 'algoma-university',
  uniTrent: 'trent-university',
  uniCqu: 'cqu-australia',
  uniFed: 'federation-university',
  uniArden: 'arden-university',
  uniUe: 'university-of-europe-for-applied-sciences',

  uniHertsTenant: 'seed-tenant-uni-herts',
  uniHertsAdmin: 'seed-user-uni-herts-admin',
  uniCoventryTenant: 'seed-tenant-uni-coventry',
  uniCoventryAdmin: 'seed-user-uni-coventry-admin',
};

const UNIVERSITIES = [
  { id: ID.uniHerts, name: 'University of Hertfordshire', country: 'UK', city: 'Hertfordshire', qsWorldRank: 801, visaSuccessRate: 0.82, defaultCommissionPct: 15, isPartner: true, avgPostStudySalaryUsd: 38000, livingCostAnnualUsd: 12000 },
  { id: ID.uniCoventry, name: 'Coventry University', country: 'UK', city: 'Coventry', qsWorldRank: 651, visaSuccessRate: 0.79, defaultCommissionPct: 14, isPartner: true, avgPostStudySalaryUsd: 37000, livingCostAnnualUsd: 11000 },
  { id: ID.uniAlgoma, name: 'Algoma University', country: 'Canada', city: 'Sault Ste. Marie', qsWorldRank: null, visaSuccessRate: 0.71, defaultCommissionPct: 20, isPartner: true, avgPostStudySalaryUsd: 42000, livingCostAnnualUsd: 14000 },
  { id: ID.uniTrent, name: 'Trent University', country: 'Canada', city: 'Peterborough', qsWorldRank: 801, visaSuccessRate: 0.74, defaultCommissionPct: 18, isPartner: true, avgPostStudySalaryUsd: 44000, livingCostAnnualUsd: 13000 },
  { id: ID.uniCqu, name: 'CQUniversity Australia', country: 'Australia', city: 'Rockhampton', qsWorldRank: 751, visaSuccessRate: 0.76, defaultCommissionPct: 16, isPartner: true, avgPostStudySalaryUsd: 48000, livingCostAnnualUsd: 18000 },
  { id: ID.uniFed, name: 'Federation University', country: 'Australia', city: 'Ballarat', qsWorldRank: null, visaSuccessRate: 0.73, defaultCommissionPct: 17, isPartner: true, avgPostStudySalaryUsd: 46000, livingCostAnnualUsd: 16000 },
  { id: ID.uniArden, name: 'Arden University', country: 'UK', city: 'Coventry', qsWorldRank: null, visaSuccessRate: 0.8, defaultCommissionPct: 12, isPartner: false, avgPostStudySalaryUsd: 36000, livingCostAnnualUsd: 11500 },
  { id: ID.uniUe, name: 'University of Europe for Applied Sciences', country: 'Germany', city: 'Berlin', qsWorldRank: null, visaSuccessRate: 0.85, defaultCommissionPct: 10, isPartner: false, avgPostStudySalaryUsd: 41000, livingCostAnnualUsd: 10000 },
];

const COURSE_TEMPLATES = [
  { suffix: 'msc-cs', name: 'MSc Computer Science', level: 'POSTGRADUATE', field: 'Computer Science', durationMonths: 12, intakes: ['September', 'January'], tuitionMultiplier: 1 },
  { suffix: 'mba', name: 'MBA Business Administration', level: 'POSTGRADUATE', field: 'Business', durationMonths: 12, intakes: ['September', 'January', 'May'], tuitionMultiplier: 1.1 },
  { suffix: 'bsc-bm', name: 'BSc Business Management', level: 'UNDERGRADUATE', field: 'Business', durationMonths: 36, intakes: ['September'], tuitionMultiplier: 0.85 },
];

const STUDENT_PROFILES = [
  { id: 'seed-student-01', name: 'Arjun Mehta', email: 'student@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 72, stream: 'Commerce', ielts: 6.5, budget: 2500000, countries: ['UK', 'Canada'], fields: ['Business', 'Finance'], profileScore: 75, leadSource: 'WALK_IN' },
  { id: 'seed-student-02', name: 'Priya Desai', email: 'priya.desai@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 68, stream: 'Science', ielts: 6.0, budget: 1800000, countries: ['UK'], fields: ['Computer Science'], profileScore: 62, leadSource: 'REFERRAL' },
  { id: 'seed-student-03', name: 'Rohan Kapoor', email: 'rohan.kapoor@example.com', educationLevel: 'POSTGRADUATE', aggregatePct: 58, stream: 'Engineering', ielts: 7.0, budget: 3200000, countries: ['Canada', 'Australia'], fields: ['Engineering'], profileScore: 81, leadSource: 'DIGITAL' },
  { id: 'seed-student-04', name: 'Sneha Iyer', email: 'sneha.iyer@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 81, stream: 'Commerce', ielts: 7.5, budget: 4000000, countries: ['UK', 'Germany'], fields: ['Business'], profileScore: 88, leadSource: 'FAIR' },
  { id: 'seed-student-05', name: 'Vikram Singh', email: 'vikram.singh@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 55, stream: 'Arts', ielts: 5.5, budget: 1200000, countries: ['UK'], fields: ['Arts'], profileScore: 45, leadSource: 'TELECALL' },
  { id: 'seed-student-06', name: 'Ananya Reddy', email: 'ananya.reddy@example.com', educationLevel: 'POSTGRADUATE', aggregatePct: 74, stream: 'Science', ielts: 6.5, pte: 58, budget: 2800000, countries: ['Australia'], fields: ['Data Science'], profileScore: 70, leadSource: 'WALK_IN' },
  { id: 'seed-student-07', name: 'Karan Malhotra', email: 'karan.malhotra@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 63, stream: 'Commerce', ielts: 6.0, budget: 2000000, countries: ['Canada'], fields: ['Accounting'], profileScore: 58, leadSource: 'PARTNER' },
  { id: 'seed-student-08', name: 'Meera Joshi', email: 'meera.joshi@example.com', educationLevel: 'POSTGRADUATE', aggregatePct: 77, stream: 'Engineering', ielts: 7.0, gre: 310, budget: 3500000, countries: ['USA', 'Canada'], fields: ['Computer Science'], profileScore: 84, leadSource: 'DIGITAL' },
  { id: 'seed-student-09', name: 'Dev Patel', email: 'dev.patel@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 49, stream: 'Commerce', ielts: 5.0, budget: 900000, countries: ['UK'], fields: ['Hospitality'], profileScore: 38, leadSource: 'COLD_CALL' },
  { id: 'seed-student-10', name: 'Isha Gupta', email: 'isha.gupta@example.com', educationLevel: 'POSTGRADUATE', aggregatePct: 69, stream: 'Science', ielts: 6.5, budget: 2200000, countries: ['UK', 'Australia'], fields: ['Public Health'], profileScore: 66, leadSource: 'REFERRAL' },
  { id: 'seed-student-11', name: 'Amit Shah', email: 'amit.shah@example.com', educationLevel: 'UNDERGRADUATE', aggregatePct: 71, stream: 'Science', ielts: 6.0, budget: 1900000, countries: ['Germany'], fields: ['Engineering'], profileScore: 64, leadSource: 'WALK_IN', agentKey: 'global' },
  { id: 'seed-student-12', name: 'Neha Verma', email: 'neha.verma@example.com', educationLevel: 'POSTGRADUATE', aggregatePct: 82, stream: 'Commerce', ielts: 7.5, budget: 4500000, countries: ['UK'], fields: ['Finance'], profileScore: 91, leadSource: 'FAIR', agentKey: 'global' },
];

const APPLICATION_SCENARIOS: Array<{
  id: string;
  studentId: string;
  courseKey: string;
  stage: ApplicationStage;
  intake: string;
  priority?: boolean;
  offerType?: string;
  visaDecision?: string;
  visaRejectedReason?: string;
  withCommission?: CommissionStatus;
}> = [
  { id: 'seed-app-01', studentId: 'seed-student-01', courseKey: `${ID.uniHerts}-msc-cs`, stage: ApplicationStage.LEAD, intake: 'Sep 2026' },
  { id: 'seed-app-02', studentId: 'seed-student-01', courseKey: `${ID.uniCoventry}-mba`, stage: ApplicationStage.DOCS_COLLECTION, intake: 'Sep 2026', priority: true },
  { id: 'seed-app-03', studentId: 'seed-student-02', courseKey: `${ID.uniHerts}-bsc-bm`, stage: ApplicationStage.UNDER_REVIEW, intake: 'Jan 2026' },
  { id: 'seed-app-04', studentId: 'seed-student-03', courseKey: `${ID.uniAlgoma}-msc-cs`, stage: ApplicationStage.SUBMITTED, intake: 'Sep 2026' },
  { id: 'seed-app-05', studentId: 'seed-student-04', courseKey: `${ID.uniCoventry}-mba`, stage: ApplicationStage.OFFER_RECEIVED, intake: 'Sep 2026', offerType: 'CONDITIONAL', withCommission: CommissionStatus.PENDING },
  { id: 'seed-app-06', studentId: 'seed-student-05', courseKey: `${ID.uniArden}-bsc-bm`, stage: ApplicationStage.REJECTED, intake: 'Sep 2026' },
  { id: 'seed-app-07', studentId: 'seed-student-06', courseKey: `${ID.uniCqu}-msc-cs`, stage: ApplicationStage.VISA_PROCESSING, intake: 'Feb 2026', visaDecision: 'PENDING' },
  { id: 'seed-app-08', studentId: 'seed-student-07', courseKey: `${ID.uniTrent}-mba`, stage: ApplicationStage.FEES_PAID, intake: 'Sep 2025', withCommission: CommissionStatus.UNIVERSITY_PAID },
  { id: 'seed-app-09', studentId: 'seed-student-08', courseKey: `${ID.uniAlgoma}-msc-cs`, stage: ApplicationStage.ENROLLED, intake: 'Sep 2025', withCommission: CommissionStatus.APPROVED },
  { id: 'seed-app-10', studentId: 'seed-student-09', courseKey: `${ID.uniHerts}-bsc-bm`, stage: ApplicationStage.WITHDRAWN, intake: 'Jan 2026' },
  { id: 'seed-app-11', studentId: 'seed-student-10', courseKey: `${ID.uniFed}-mba`, stage: ApplicationStage.OFFER_RECEIVED, intake: 'Jul 2026', offerType: 'UNCONDITIONAL', withCommission: CommissionStatus.PAID_TO_AGENT },
  { id: 'seed-app-12', studentId: 'seed-student-04', courseKey: `${ID.uniUe}-msc-cs`, stage: ApplicationStage.SUBMITTED, intake: 'Oct 2026' },
  { id: 'seed-app-13', studentId: 'seed-student-11', courseKey: `${ID.uniCoventry}-msc-cs`, stage: ApplicationStage.DOCS_COLLECTION, intake: 'Sep 2026' },
  { id: 'seed-app-14', studentId: 'seed-student-12', courseKey: `${ID.uniHerts}-mba`, stage: ApplicationStage.ENROLLED, intake: 'Sep 2025', withCommission: CommissionStatus.DISPUTED },
];

function commissionAmounts(grossInr: number) {
  const gross = new Prisma.Decimal(grossInr);
  const platformShare = gross.mul(0.3);
  const agentShare = gross.mul(0.7);
  const tdsAmount = agentShare.mul(0.1);
  const netPayableInr = agentShare.sub(tdsAmount);
  return { grossAmountInr: gross, platformShare, agentShare, tdsAmount, netPayableInr };
}

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function clearDatabase() {
  console.log('  Clearing existing data…');
  await prisma.leadUnlock.deleteMany();
  await prisma.marketplaceLead.deleteMany();
  await prisma.billingHistory.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.aIJob.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commissionLedger.deleteMany();
  await prisma.applicationStageHistory.deleteMany();
  await prisma.studentJourneyEvent.deleteMany();
  await prisma.document.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.globalTrustScore.deleteMany();
  await prisma.application.deleteMany();
  await prisma.student.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.university.deleteMany();
  await prisma.platformConfig.deleteMany();
}

async function seedUniversitiesAndCourses() {
  const courseIds: Record<string, string> = {};
  for (const u of UNIVERSITIES) {
    await prisma.university.create({
      data: {
        ...u,
        partnerSince: u.isPartner ? new Date('2024-01-15') : undefined,
        contactEmail: `admissions@${u.id.replace(/-/g, '')}.edu`,
        contactName: 'Admissions Office',
      },
    });
    const baseTuition = u.country === 'UK' ? 15000 : u.country === 'Canada' ? 18000 : u.country === 'Australia' ? 20000 : 14000;
    for (const tpl of COURSE_TEMPLATES) {
      const courseId = `${u.id}-${tpl.suffix}`;
      courseIds[courseId] = courseId;
      await prisma.course.create({
        data: {
          id: courseId,
          universityId: u.id,
          name: tpl.name,
          level: tpl.level,
          field: tpl.field,
          durationMonths: tpl.durationMonths,
          intakes: tpl.intakes,
          tuitionFeeUsd: new Prisma.Decimal(Math.round(baseTuition * tpl.tuitionMultiplier)),
          minGradePercent: tpl.level === 'POSTGRADUATE' ? 55 : 50,
          minIelts: tpl.level === 'POSTGRADUATE' ? 6.0 : 5.5,
          commissionPct: u.defaultCommissionPct,
          isActive: true,
        },
      });
    }
  }
  return courseIds;
}

async function seedPlatform() {
  const demoHash = await hash(PASS_DEMO);
  const adminHash = await hash(PASS_ADMIN);

  await prisma.platformConfig.create({
    data: {
      id: ID.platformConfig,
      platformSharePct: 30,
      tdsRatePct: 10,
      minPayoutThreshold: 5000,
      payoutCycleDays: 30,
      defaultLeadPrice: 999,
      leadExpiryDays: 30,
      marketplaceEnabled: true,
      trialAiCredits: 10,
      fraudAlertThreshold: 0.55,
      autoFraudFlagEnabled: true,
      planSTARTERPrice: 2999,
      planPROPrice: 5999,
      planENTERPRISEPrice: 9999,
    },
  });

  await prisma.tenant.create({
    data: {
      id: ID.adminTenant,
      type: TenantType.ADMIN,
      subdomain: 'admin',
      name: 'RightDirection Platform',
      email: 'admin@rightdirection.com',
      status: 'ACTIVE',
      subscriptionPlan: SubscriptionPlan.ENTERPRISE,
    },
  });

  await prisma.user.create({
    data: {
      id: ID.adminUser,
      tenantId: ID.adminTenant,
      email: 'admin@rightdirection.com',
      passwordHash: adminHash,
      role: UserRole.SUPER_ADMIN,
      name: 'Platform Admin',
      phone: '+919000000001',
      lastLoginAt: new Date(),
    },
  });

  return { demoHash, adminHash };
}

type AgentSeed = {
  tenantId: string;
  agentId: string;
  ownerId: string;
  ownerEmail: string;
  subdomain: string;
  name: string;
  email: string;
  businessName: string;
  city: string;
  kyc: KYCStatus;
  plan: SubscriptionPlan;
  tenantStatus?: string;
  walletBalance: number;
  totalEarned: number;
  rejectedReason?: string;
  verified?: boolean;
  extraUsers?: Array<{ id: string; email: string; name: string; role: UserRole }>;
};

async function seedAgents(demoHash: string) {
  const agents: AgentSeed[] = [
    {
      tenantId: ID.agentDemoTenant,
      agentId: ID.agentDemo,
      ownerId: ID.agentDemoOwner,
      ownerEmail: 'owner@studyvision.com',
      subdomain: 'demo',
      name: 'StudyVision Consultancy',
      email: 'demo@studyvision.com',
      businessName: 'StudyVision Consultancy',
      city: 'Surat',
      kyc: KYCStatus.APPROVED,
      plan: SubscriptionPlan.PRO,
      walletBalance: 125000,
      totalEarned: 890000,
      verified: true,
      extraUsers: [
        { id: ID.agentDemoCounselor, email: 'counselor@studyvision.com', name: 'Priya Patel', role: UserRole.AGENT_COUNSELOR },
        { id: ID.agentDemoTelecaller, email: 'telecaller@studyvision.com', name: 'Suresh Kumar', role: UserRole.AGENT_TELECALLER },
      ],
    },
    {
      tenantId: ID.agentGlobalTenant,
      agentId: ID.agentGlobal,
      ownerId: ID.agentGlobalOwner,
      ownerEmail: 'owner@globalpathways.com',
      subdomain: 'globalpath',
      name: 'Global Pathways',
      email: 'owner@globalpathways.com',
      businessName: 'Global Pathways Overseas',
      city: 'Ahmedabad',
      kyc: KYCStatus.APPROVED,
      plan: SubscriptionPlan.ENTERPRISE,
      walletBalance: 340000,
      totalEarned: 2100000,
      verified: true,
    },
    {
      tenantId: ID.agentAspireTenant,
      agentId: ID.agentAspire,
      ownerId: ID.agentAspireOwner,
      ownerEmail: 'owner@aspireedu.com',
      subdomain: 'aspireedu',
      name: 'Aspire Education',
      email: 'owner@aspireedu.com',
      businessName: 'Aspire Education Hub',
      city: 'Indore',
      kyc: KYCStatus.UNDER_REVIEW,
      plan: SubscriptionPlan.STARTER,
      walletBalance: 45000,
      totalEarned: 120000,
    },
    {
      tenantId: ID.agentMetroTenant,
      agentId: ID.agentMetro,
      ownerId: ID.agentMetroOwner,
      ownerEmail: 'owner@metrooverseas.com',
      subdomain: 'metrooverseas',
      name: 'Metro Overseas',
      email: 'owner@metrooverseas.com',
      businessName: 'Metro Overseas Consultants',
      city: 'Jaipur',
      kyc: KYCStatus.PENDING,
      plan: SubscriptionPlan.TRIAL,
      walletBalance: 0,
      totalEarned: 0,
    },
    {
      tenantId: ID.agentQuickTenant,
      agentId: ID.agentQuick,
      ownerId: ID.agentQuickOwner,
      ownerEmail: 'owner@quickvisa.com',
      subdomain: 'quickvisa',
      name: 'Quick Visa Services',
      email: 'owner@quickvisa.com',
      businessName: 'Quick Visa Services Pvt Ltd',
      city: 'Lucknow',
      kyc: KYCStatus.REJECTED,
      plan: SubscriptionPlan.STARTER,
      walletBalance: 0,
      totalEarned: 45000,
      rejectedReason: 'PAN document mismatch; GST certificate expired.',
    },
    {
      tenantId: ID.agentPrimeTenant,
      agentId: ID.agentPrime,
      ownerId: ID.agentPrimeOwner,
      ownerEmail: 'owner@primeabroad.com',
      subdomain: 'primeabroad',
      name: 'Prime Abroad',
      email: 'owner@primeabroad.com',
      businessName: 'Prime Abroad Consultants',
      city: 'Pune',
      kyc: KYCStatus.RE_UPLOAD_REQUIRED,
      plan: SubscriptionPlan.PRO,
      walletBalance: 18000,
      totalEarned: 310000,
      rejectedReason: 'Blurry address proof — please re-upload utility bill.',
    },
    {
      tenantId: ID.agentSuspendedTenant,
      agentId: ID.agentSuspended,
      ownerId: ID.agentSuspendedOwner,
      ownerEmail: 'owner@legacyabroad.com',
      subdomain: 'suspended-demo',
      name: 'Legacy Abroad (Suspended)',
      email: 'owner@legacyabroad.com',
      businessName: 'Legacy Abroad LLP',
      city: 'Delhi',
      kyc: KYCStatus.APPROVED,
      plan: SubscriptionPlan.STARTER,
      tenantStatus: 'SUSPENDED',
      walletBalance: 5000,
      totalEarned: 80000,
    },
  ];

  const agentIdByKey: Record<string, string> = { demo: ID.agentDemo, global: ID.agentGlobal };

  for (const a of agents) {
    await prisma.tenant.create({
      data: {
        id: a.tenantId,
        type: TenantType.AGENT,
        subdomain: a.subdomain,
        name: a.name,
        email: a.email,
        status: a.tenantStatus ?? 'ACTIVE',
        subscriptionPlan: a.plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date('2027-06-01'),
        primaryColor: '#2b7cff',
      },
    });

    await prisma.user.create({
      data: {
        id: a.ownerId,
        tenantId: a.tenantId,
        email: a.ownerEmail,
        passwordHash: demoHash,
        role: UserRole.AGENT_OWNER,
        name: a.businessName.split(' ')[0] + ' Owner',
        phone: '+9198765' + String(Math.floor(Math.random() * 100000)).padStart(5, '0'),
      },
    });

    if (a.extraUsers) {
      for (const u of a.extraUsers) {
        await prisma.user.create({
          data: {
            id: u.id,
            tenantId: a.tenantId,
            email: u.email,
            passwordHash: demoHash,
            role: u.role,
            name: u.name,
          },
        });
      }
    }

    await prisma.agent.create({
      data: {
        id: a.agentId,
        tenantId: a.tenantId,
        businessName: a.businessName,
        city: a.city,
        state: 'Gujarat',
        pincode: '395001',
        gstNumber: '24AABCU9603R1ZM',
        panNumber: 'AABCU9603R',
        kycStatus: a.kyc,
        kycRejectedReason: a.rejectedReason,
        isBadgeVerified: a.verified ?? false,
        visaSuccessRate: a.verified ? 0.75 + Math.random() * 0.15 : null,
        conversionRate: a.verified ? 0.3 + Math.random() * 0.2 : null,
        agentScore: a.verified ? 70 + Math.floor(Math.random() * 25) : null,
        fraudIncidents: a.kyc === KYCStatus.REJECTED ? 2 : 0,
        walletBalance: new Prisma.Decimal(a.walletBalance),
        totalEarned: new Prisma.Decimal(a.totalEarned),
      },
    });

    agentIdByKey[a.subdomain === 'globalpath' ? 'global' : a.subdomain === 'demo' ? 'demo' : a.agentId] = a.agentId;
  }

  agentIdByKey.demo = ID.agentDemo;
  agentIdByKey.global = ID.agentGlobal;
  return agentIdByKey;
}

async function seedUniversityPortals(demoHash: string) {
  await prisma.tenant.create({
    data: {
      id: ID.uniHertsTenant,
      type: TenantType.UNIVERSITY,
      subdomain: 'herts',
      name: 'University of Hertfordshire Portal',
      email: 'portal@herts.ac.uk',
      universityId: ID.uniHerts,
      subscriptionPlan: SubscriptionPlan.ENTERPRISE,
    },
  });
  await prisma.user.create({
    data: {
      id: ID.uniHertsAdmin,
      tenantId: ID.uniHertsTenant,
      email: 'admin@herts.university.demo',
      passwordHash: demoHash,
      role: UserRole.UNIVERSITY_ADMIN,
      name: 'Herts Admissions Admin',
    },
  });

  await prisma.tenant.create({
    data: {
      id: ID.uniCoventryTenant,
      type: TenantType.UNIVERSITY,
      subdomain: 'coventry',
      name: 'Coventry University Portal',
      email: 'portal@coventry.ac.uk',
      universityId: ID.uniCoventry,
      subscriptionPlan: SubscriptionPlan.PRO,
    },
  });
  await prisma.user.create({
    data: {
      id: ID.uniCoventryAdmin,
      tenantId: ID.uniCoventryTenant,
      email: 'admin@coventry.university.demo',
      passwordHash: demoHash,
      role: UserRole.UNIVERSITY_ADMIN,
      name: 'Coventry Admissions Admin',
    },
  });
}

async function seedStudents(agentIdByKey: Record<string, string>) {
  const defaultAgentId = agentIdByKey.demo;
  const created: string[] = [];

  for (const s of STUDENT_PROFILES) {
    const userId = `seed-user-${s.id}`;
    const agentId = s.agentKey === 'global' ? agentIdByKey.global : defaultAgentId;
    const tenantId = s.agentKey === 'global' ? ID.agentGlobalTenant : ID.agentDemoTenant;

    await prisma.user.create({
      data: {
        id: userId,
        tenantId,
        email: s.email,
        passwordHash: await hash(PASS_DEMO),
        role: UserRole.STUDENT,
        name: s.name,
        phone: '+9198' + String(10000000 + created.length),
      },
    });

    await prisma.student.create({
      data: {
        id: s.id,
        userId,
        agentId,
        tenantId,
        educationLevel: s.educationLevel,
        aggregatePct: s.aggregatePct,
        stream: s.stream,
        preferredField: s.fields,
        ieltsScore: s.ielts,
        pteScore: s.pte,
        greScore: s.gre,
        annualBudgetInr: s.budget,
        preferredCountries: s.countries,
        preferredIntake: 'September 2026',
        leadSource: s.leadSource,
        profileScore: s.profileScore,
        leadQualityScore: s.profileScore > 80 ? 9 : s.profileScore > 60 ? 6 : 3,
      },
    });

    await prisma.globalTrustScore.create({
      data: {
        studentId: s.id,
        documentScore: 50 + (s.profileScore % 40),
        financialScore: 40 + (s.budget % 30) / 100000,
        academicScore: s.aggregatePct ?? 50,
        interviewScore: s.profileScore > 70 ? 75 : 45,
        overallScore: s.profileScore,
        riskLevel: s.profileScore < 50 ? RiskLevel.HIGH : s.profileScore < 70 ? RiskLevel.MEDIUM : RiskLevel.LOW,
      },
    });

    created.push(s.id);
  }
  return created;
}

async function seedApplications(agentId: string, tenantId: string, adminUserId: string) {
  for (const sc of APPLICATION_SCENARIOS) {
    const course = await prisma.course.findUnique({ where: { id: sc.courseKey } });
    if (!course) continue;

    const student = await prisma.student.findUnique({
      where: { id: sc.studentId },
      include: { user: true },
    });
    if (!student) continue;

    const agentForApp = student.agentId ?? agentId;
    const tenantForApp = student.tenantId;

    await prisma.application.create({
      data: {
        id: sc.id,
        studentId: sc.studentId,
        courseId: course.id,
        universityId: course.universityId,
        agentId: agentForApp,
        tenantId: tenantForApp,
        stage: sc.stage,
        intake: sc.intake,
        priority: sc.priority ?? false,
        offerType: sc.offerType,
        offerLetterUrl: sc.offerType ? `s3://mock/offers/${sc.id}.pdf` : undefined,
        offerExpiresAt: sc.offerType ? new Date('2026-08-01') : undefined,
        visaAppliedAt: sc.stage === ApplicationStage.VISA_PROCESSING ? new Date('2026-02-01') : undefined,
        visaDecision: sc.visaDecision,
        visaRejectedReason: sc.visaRejectedReason,
        visaProbabilityScore: 0.55 + Math.random() * 0.35,
        enrollmentPredScore: 0.5 + Math.random() * 0.4,
      },
    });

    await prisma.applicationStageHistory.createMany({
      data: [
        {
          applicationId: sc.id,
          fromStage: null,
          toStage: ApplicationStage.LEAD,
          changedById: ID.agentDemoOwner,
          note: 'Lead captured from walk-in',
          createdAt: new Date('2025-11-01'),
        },
        {
          applicationId: sc.id,
          fromStage: ApplicationStage.LEAD,
          toStage: sc.stage,
          changedById: ID.agentDemoCounselor,
          note: `Moved to ${sc.stage}`,
          createdAt: new Date('2026-01-15'),
        },
      ],
    });

    if (sc.withCommission) {
      const amounts = commissionAmounts(85000 + Math.floor(Math.random() * 40000));
      await prisma.commissionLedger.create({
        data: {
          id: `seed-comm-${sc.id}`,
          applicationId: sc.id,
          universityId: course.universityId,
          agentId: agentForApp,
          tenantId: tenantForApp,
          ...amounts,
          status: sc.withCommission,
          payoutRef: sc.withCommission === CommissionStatus.PAID_TO_AGENT ? 'RZP_OUT_demo123' : undefined,
          payoutDate: sc.withCommission === CommissionStatus.PAID_TO_AGENT ? new Date('2026-03-01') : undefined,
          notes: sc.withCommission === CommissionStatus.DISPUTED ? 'Agent disputes TDS calculation' : undefined,
        },
      });
    }
  }

  // Extra pending commissions for admin queue
  const extraPending = await prisma.application.findFirst({
    where: { stage: ApplicationStage.SUBMITTED, id: 'seed-app-04' },
  });
  if (extraPending) {
    const amounts = commissionAmounts(72000);
    await prisma.commissionLedger.create({
      data: {
        id: 'seed-comm-extra-pending',
        applicationId: extraPending.id,
        universityId: extraPending.universityId,
        agentId: extraPending.agentId,
        tenantId: extraPending.tenantId,
        ...amounts,
        status: CommissionStatus.PENDING,
      },
    });
  }
}

async function seedDocuments(adminUserId: string) {
  const docSpecs: Array<{
    id: string;
    studentId: string;
    category: DocumentCategory;
    status: DocumentStatus;
    risk?: RiskLevel;
    fraudScore?: number;
    flags?: string[];
    fileName: string;
  }> = [
    { id: 'seed-doc-01', studentId: 'seed-student-01', category: DocumentCategory.ACADEMIC, status: DocumentStatus.VERIFIED, fileName: '12th-marksheet.pdf' },
    { id: 'seed-doc-02', studentId: 'seed-student-01', category: DocumentCategory.TEST_SCORES, status: DocumentStatus.VERIFIED, fileName: 'ielts-trf.pdf' },
    { id: 'seed-doc-01b', studentId: 'seed-student-01', category: DocumentCategory.IDENTITY, status: DocumentStatus.VERIFIED, fileName: 'passport.pdf' },
    { id: 'seed-doc-01c', studentId: 'seed-student-01', category: DocumentCategory.FINANCIAL, status: DocumentStatus.UPLOADED, fileName: 'father-itr.pdf' },
    { id: 'seed-doc-01d', studentId: 'seed-student-01', category: DocumentCategory.APPLICATION, status: DocumentStatus.UPLOADED, fileName: 'sop-draft-v1.pdf' },
    { id: 'seed-doc-02b', studentId: 'seed-student-02', category: DocumentCategory.ACADEMIC, status: DocumentStatus.VERIFIED, fileName: 'degree-marksheet.pdf' },
    { id: 'seed-doc-03b', studentId: 'seed-student-03', category: DocumentCategory.ACADEMIC, status: DocumentStatus.VERIFIED, fileName: 'btech-transcript.pdf' },
    { id: 'seed-doc-04b', studentId: 'seed-student-04', category: DocumentCategory.IDENTITY, status: DocumentStatus.VERIFIED, fileName: 'passport.pdf' },
    { id: 'seed-doc-10b', studentId: 'seed-student-10', category: DocumentCategory.ACADEMIC, status: DocumentStatus.VERIFIED, fileName: 'nursing-degree.pdf' },
    { id: 'seed-doc-03', studentId: 'seed-student-02', category: DocumentCategory.FINANCIAL, status: DocumentStatus.UNDER_REVIEW, fileName: 'bank-statement.pdf' },
    { id: 'seed-doc-04', studentId: 'seed-student-05', category: DocumentCategory.IDENTITY, status: DocumentStatus.REJECTED, fileName: 'passport-scan.jpg', flags: ['EXPIRED_PASSPORT'] },
    { id: 'seed-doc-05', studentId: 'seed-student-09', category: DocumentCategory.ACADEMIC, status: DocumentStatus.UPLOADED, risk: RiskLevel.HIGH, fraudScore: 0.82, flags: ['FONT_MISMATCH', 'METADATA_EDIT'], fileName: 'degree-certificate.pdf' },
    { id: 'seed-doc-06', studentId: 'seed-student-04', category: DocumentCategory.FINANCIAL, status: DocumentStatus.VERIFIED, fileName: 'loan-sanction.pdf' },
    { id: 'seed-doc-07', studentId: 'seed-student-07', category: DocumentCategory.VISA, status: DocumentStatus.UPLOADED, fileName: 'visa-application-draft.pdf' },
    { id: 'seed-doc-08', studentId: 'seed-student-03', category: DocumentCategory.APPLICATION, status: DocumentStatus.VERIFIED, fileName: 'sop-final.pdf' },
    { id: 'seed-doc-09', studentId: 'seed-student-06', category: DocumentCategory.ACADEMIC, status: DocumentStatus.UPLOADED, risk: RiskLevel.HIGH, fraudScore: 0.71, flags: ['DUPLICATE_TEMPLATE'], fileName: 'transcript.pdf' },
    { id: 'seed-doc-10', studentId: 'seed-student-08', category: DocumentCategory.TEST_SCORES, status: DocumentStatus.VERIFIED, fileName: 'gre-score.pdf' },
  ];

  for (const d of docSpecs) {
    const student = await prisma.student.findUnique({ where: { id: d.studentId } });
    if (!student) continue;
    await prisma.document.create({
      data: {
        id: d.id,
        userId: student.userId,
        tenantId: student.tenantId,
        studentId: d.studentId,
        category: d.category,
        status: d.status,
        fileName: d.fileName,
        fileSize: 240000 + Math.floor(Math.random() * 500000),
        mimeType: d.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        s3Key: `documents/${student.tenantId}/${d.studentId}/${d.category.toLowerCase()}/${d.id}.pdf`,
        version: 1,
        fraudScore: d.fraudScore,
        riskLevel: d.risk,
        fraudFlags: d.flags ?? [],
        verifiedById: d.status === DocumentStatus.VERIFIED ? adminUserId : undefined,
        verifiedAt: d.status === DocumentStatus.VERIFIED ? new Date() : undefined,
        rejectedReason: d.status === DocumentStatus.REJECTED ? 'Document illegible' : undefined,
      },
    });
  }

  // KYC docs for agents under review
  await prisma.document.createMany({
    data: [
      {
        id: 'seed-kyc-aspire-pan',
        userId: ID.agentAspireOwner,
        tenantId: ID.agentAspireTenant,
        agentKycId: ID.agentAspire,
        category: DocumentCategory.KYC,
        status: DocumentStatus.UNDER_REVIEW,
        fileName: 'pan-card.pdf',
        fileSize: 120000,
        mimeType: 'application/pdf',
        s3Key: `kyc/${ID.agentAspireTenant}/pan/seed-kyc-aspire-pan.pdf`,
      },
      {
        id: 'seed-kyc-metro-gst',
        userId: ID.agentMetroOwner,
        tenantId: ID.agentMetroTenant,
        agentKycId: ID.agentMetro,
        category: DocumentCategory.KYC,
        status: DocumentStatus.UPLOADED,
        fileName: 'gst-certificate.pdf',
        fileSize: 98000,
        mimeType: 'application/pdf',
        s3Key: `kyc/${ID.agentMetroTenant}/gst/seed-kyc-metro-gst.pdf`,
      },
    ],
  });
}

async function seedProposals() {
  const matches = (uniIds: string[]) =>
    uniIds.map((uid, i) => ({
      universityId: uid,
      score: 92 - i * 8,
      explanation: 'Strong academic fit and budget alignment.',
      fees: 15000 + i * 2000,
      roi: 'High',
    }));

  await prisma.proposal.createMany({
    data: [
      {
        id: 'seed-proposal-01',
        studentId: 'seed-student-01',
        tenantId: ID.agentDemoTenant,
        createdById: ID.agentDemoOwner,
        matchedUniversities: matches([ID.uniHerts, ID.uniCoventry, ID.uniAlgoma]),
        budgetInr: 2500000,
        targetCountries: ['UK', 'Canada'],
        targetIntake: 'September 2026',
        sopContent: '<p>Arjun aspires to study business analytics abroad…</p>',
        sopVersion: 2,
      },
      {
        id: 'seed-proposal-02',
        studentId: 'seed-student-04',
        tenantId: ID.agentDemoTenant,
        createdById: ID.agentDemoCounselor,
        matchedUniversities: matches([ID.uniCoventry, ID.uniUe]),
        budgetInr: 4000000,
        targetCountries: ['UK', 'Germany'],
        targetIntake: 'September 2026',
        sopVersion: 0,
      },
      {
        id: 'seed-proposal-03',
        studentId: 'seed-student-11',
        tenantId: ID.agentGlobalTenant,
        createdById: ID.agentGlobalOwner,
        matchedUniversities: matches([ID.uniTrent, ID.uniCqu]),
        budgetInr: 1900000,
        targetCountries: ['Canada'],
        targetIntake: 'January 2026',
        sopVersion: 1,
      },
    ],
  });
}

async function seedMarketplace() {
  const leads = [
    { id: 'seed-lead-01', name: 'Ravi Kulkarni', city: 'Nagpur', intent: 'HOT', field: 'Computer Science', budget: '15-20L', dest: ['UK'], score: 85, price: 1999 },
    { id: 'seed-lead-02', name: 'Sana Merchant', city: 'Mumbai', intent: 'HOT', field: 'MBA', budget: '25-35L', dest: ['UK', 'Canada'], score: 90, price: 2499 },
    { id: 'seed-lead-03', name: 'Harsh Trivedi', city: 'Vadodara', intent: 'WARM', field: 'Engineering', budget: '10-15L', dest: ['Canada'], score: 62, price: 999 },
    { id: 'seed-lead-04', name: 'Kavya Nair', city: 'Kochi', intent: 'WARM', field: 'Nursing', budget: '8-12L', dest: ['Australia'], score: 58, price: 799 },
    { id: 'seed-lead-05', name: 'Mohit Agarwal', city: 'Kanpur', intent: 'COLD', field: 'Business', budget: '5-8L', dest: ['UK'], score: 35, price: 499 },
    { id: 'seed-lead-06', name: 'Pooja Sinha', city: 'Patna', intent: 'WARM', field: 'Data Science', budget: '18-22L', dest: ['Australia', 'Canada'], score: 71, price: 1299 },
    { id: 'seed-lead-07', name: 'Yash Bansal', city: 'Chandigarh', intent: 'HOT', field: 'Finance', budget: '30-40L', dest: ['UK'], score: 88, price: 1999 },
    { id: 'seed-lead-08', name: 'Divya Rao', city: 'Hyderabad', intent: 'COLD', field: 'Arts', budget: '6-10L', dest: ['Germany'], score: 40, price: 499 },
  ];

  for (const l of leads) {
    const [first, ...rest] = l.name.split(' ');
    const masked = `${first} ${rest.map(() => 'X').join('') || 'X'}`;
    await prisma.marketplaceLead.create({
      data: {
        id: l.id,
        name: l.name,
        maskedName: masked,
        phone: '+9190000' + l.id.slice(-5),
        email: `${l.name.split(' ')[0].toLowerCase()}@lead.example.com`,
        city: l.city,
        state: 'India',
        fieldOfStudy: l.field,
        budgetRange: l.budget,
        targetIntake: 'Sep 2026',
        preferredDestinations: l.dest,
        intent: l.intent,
        profileScore: l.score,
        unlockPrice: l.price,
        isPublished: true,
        expiresAt: new Date('2026-12-31'),
      },
    });
  }

  await prisma.leadUnlock.createMany({
    data: [
      { id: 'seed-unlock-01', leadId: 'seed-lead-01', agentId: ID.agentDemoTenant, pricePaid: 1999 },
      { id: 'seed-unlock-02', leadId: 'seed-lead-02', agentId: ID.agentDemoTenant, pricePaid: 2499 },
      { id: 'seed-unlock-03', leadId: 'seed-lead-03', agentId: ID.agentGlobalTenant, pricePaid: 999 },
    ],
  });
}

async function seedBillingAndNotifications() {
  const billingRows = [
    { tenantId: ID.agentDemoTenant, amount: 5999, status: 'PAID', desc: 'PRO plan — May 2026' },
    { tenantId: ID.agentDemoTenant, amount: 5999, status: 'PAID', desc: 'PRO plan — Apr 2026' },
    { tenantId: ID.agentGlobalTenant, amount: 9999, status: 'PAID', desc: 'ENTERPRISE plan — May 2026' },
    { tenantId: ID.agentAspireTenant, amount: 2999, status: 'FAILED', desc: 'STARTER plan — payment failed' },
    { tenantId: ID.agentPrimeTenant, amount: 5999, status: 'REFUNDED', desc: 'PRO plan — refunded' },
  ];

  for (let i = 0; i < billingRows.length; i++) {
    const b = billingRows[i];
    await prisma.billingHistory.create({
      data: {
        id: `seed-billing-${i + 1}`,
        tenantId: b.tenantId,
        amount: b.amount,
        status: b.status,
        description: b.desc,
        razorpayPaymentId: b.status === 'PAID' ? `pay_demo_${i}` : undefined,
      },
    });
  }

  const notifs = [
    { userId: ID.agentDemoOwner, title: 'New application submitted', body: 'Rohan Kapoor — Algoma MSc CS', read: false },
    { userId: ID.agentDemoOwner, title: 'Commission approved', body: '₹59,500 payable for Arjun Mehta enrollment', read: false },
    { userId: ID.agentDemoCounselor, title: 'Document verified', body: 'IELTS TRF verified for Priya Desai', read: true },
    { userId: ID.adminUser, title: 'KYC review required', body: 'Aspire Education Hub submitted documents', read: false },
    { userId: ID.adminUser, title: 'High-risk document flagged', body: 'Fraud score 0.82 on Dev Patel degree certificate', read: false },
    { userId: 'seed-user-seed-student-01', title: 'Offer received', body: 'Conditional offer from Coventry MBA', read: false },
    { userId: 'seed-user-seed-student-01', title: 'Documents verified', body: 'Your 12th marksheet and IELTS TRF are verified', read: true },
    { userId: 'seed-user-seed-student-01', title: 'Counselling session scheduled', body: 'Parent meeting Fri 15 Jan 3pm — Mumbai office', read: false },
    { userId: 'seed-user-seed-student-01', title: 'AI shortlist ready', body: '3 universities matched your profile — view proposal', read: false },
    { userId: 'seed-user-seed-student-01', title: 'Application update', body: 'Coventry MBA moved to Docs Collection', read: false },
  ];

  for (let i = 0; i < notifs.length; i++) {
    const n = notifs[i];
    await prisma.notification.create({
      data: {
        id: `seed-notif-${i + 1}`,
        userId: n.userId,
        tenantId: n.userId === ID.adminUser ? ID.adminTenant : ID.agentDemoTenant,
        channel: NotificationChannel.IN_APP,
        title: n.title,
        body: n.body,
        isRead: n.read,
        readAt: n.read ? new Date() : undefined,
      },
    });
  }
}

async function seedAiJobs() {
  const jobs = [
    { id: 'seed-ai-01', type: AIJobType.PROPOSAL_GENERATION, status: AIJobStatus.COMPLETED, entityId: 'seed-student-01' },
    { id: 'seed-ai-02', type: AIJobType.SOP_WRITING, status: AIJobStatus.COMPLETED, entityId: 'seed-student-04' },
    { id: 'seed-ai-03', type: AIJobType.DOCUMENT_FRAUD_CHECK, status: AIJobStatus.COMPLETED, entityId: 'seed-doc-05' },
    { id: 'seed-ai-04', type: AIJobType.TRUST_SCORE_CALCULATION, status: AIJobStatus.COMPLETED, entityId: 'seed-student-03' },
    { id: 'seed-ai-05', type: AIJobType.VISA_PREDICTION, status: AIJobStatus.PROCESSING, entityId: 'seed-app-07' },
    { id: 'seed-ai-06', type: AIJobType.PROPOSAL_GENERATION, status: AIJobStatus.FAILED, entityId: 'seed-student-09', error: 'Anthropic API key not configured' },
    { id: 'seed-ai-07', type: AIJobType.SOP_WRITING, status: AIJobStatus.QUEUED, entityId: 'seed-student-02' },
  ];

  for (const j of jobs) {
    await prisma.aIJob.create({
      data: {
        id: j.id,
        tenantId: ID.agentDemoTenant,
        type: j.type,
        status: j.status,
        entityId: j.entityId,
        input: { source: 'seed' },
        output: j.status === AIJobStatus.COMPLETED ? { success: true } : undefined,
        error: j.error,
        startedAt: j.status !== AIJobStatus.QUEUED ? new Date('2026-05-20') : undefined,
        completedAt: j.status === AIJobStatus.COMPLETED ? new Date('2026-05-20') : undefined,
      },
    });
  }
}

async function seedActivityLogs() {
  const actions = [
    { userId: ID.adminUser, tenantId: ID.adminTenant, action: 'KYC_REVIEW', entity: 'agent', entityId: ID.agentAspire, desc: 'Opened KYC review for Aspire Education' },
    { userId: ID.adminUser, tenantId: ID.adminTenant, action: 'CONFIG_UPDATE', entity: 'platform_config', entityId: ID.platformConfig, desc: 'Updated marketplace lead price default' },
    { userId: ID.agentDemoOwner, tenantId: ID.agentDemoTenant, action: 'STUDENT_CREATE', entity: 'student', entityId: 'seed-student-01', desc: 'Created student Arjun Mehta' },
    { userId: ID.agentDemoCounselor, tenantId: ID.agentDemoTenant, action: 'STAGE_CHANGE', entity: 'application', entityId: 'seed-app-05', desc: 'Moved application to OFFER_RECEIVED' },
    { userId: ID.agentDemoOwner, tenantId: ID.agentDemoTenant, action: 'LEAD_UNLOCK', entity: 'marketplace_lead', entityId: 'seed-lead-01', desc: 'Unlocked marketplace lead Ravi Kulkarni' },
    { userId: ID.agentGlobalOwner, tenantId: ID.agentGlobalTenant, action: 'PROPOSAL_GENERATE', entity: 'proposal', entityId: 'seed-proposal-03', desc: 'AI proposal generated for Amit Shah' },
    { userId: ID.adminUser, tenantId: ID.adminTenant, action: 'AGENT_SUSPEND', entity: 'tenant', entityId: ID.agentSuspendedTenant, desc: 'Suspended Legacy Abroad tenant' },
    { userId: ID.agentDemoCounselor, tenantId: ID.agentDemoTenant, action: 'DOCUMENT_UPLOAD', entity: 'document', entityId: 'seed-doc-02', desc: 'Uploaded IELTS TRF' },
  ];

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    await prisma.activityLog.create({
      data: {
        id: `seed-activity-${i + 1}`,
        userId: a.userId,
        tenantId: a.tenantId,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId,
        description: a.desc,
        metadata: { source: 'seed' },
        createdAt: new Date(Date.now() - i * 3600000),
      },
    });
  }

  // Bulk filler logs for pagination demo
  for (let i = 0; i < 25; i++) {
    await prisma.activityLog.create({
      data: {
        id: `seed-activity-bulk-${i}`,
        userId: i % 2 === 0 ? ID.agentDemoOwner : ID.adminUser,
        tenantId: i % 2 === 0 ? ID.agentDemoTenant : ID.adminTenant,
        action: 'SYSTEM_EVENT',
        entity: 'application',
        entityId: `seed-app-0${(i % 9) + 1}`,
        description: `Automated sync event #${i + 1}`,
        createdAt: new Date(Date.now() - (i + 10) * 7200000),
      },
    });
  }
}

async function printSummary() {
  const [agents, students, apps, comms, docs, leads, logs, fraud] = await Promise.all([
    prisma.agent.count(),
    prisma.student.count(),
    prisma.application.count(),
    prisma.commissionLedger.count(),
    prisma.document.count(),
    prisma.marketplaceLead.count(),
    prisma.activityLog.count(),
    prisma.document.count({ where: { riskLevel: RiskLevel.HIGH } }),
  ]);

  const kycReview = await prisma.agent.count({ where: { kycStatus: KYCStatus.UNDER_REVIEW } });

  console.log('');
  console.log('✅ Seed complete — summary');
  console.log(`   Agents:          ${agents} (KYC under review: ${kycReview})`);
  console.log(`   Students:        ${students}`);
  console.log(`   Applications:    ${apps}`);
  console.log(`   Commissions:     ${comms}`);
  console.log(`   Documents:       ${docs} (high-risk: ${fraud})`);
  console.log(`   Marketplace:     ${leads} leads`);
  console.log(`   Activity logs:   ${logs}`);
  console.log('');
  console.log('── Login credentials (password in column) ──');
  console.log('  SUPER ADMIN     admin@rightdirection.com        Admin@123');
  console.log('  Agent (demo)    owner@studyvision.com           Demo@123');
  console.log('  Counselor       counselor@studyvision.com       Demo@123');
  console.log('  Telecaller      telecaller@studyvision.com      Demo@123');
  console.log('  Agent (global)  owner@globalpathways.com        Demo@123');
  console.log('  KYC pending     owner@metrooverseas.com         Demo@123');
  console.log('  KYC review      owner@aspireedu.com             Demo@123');
  console.log('  KYC rejected    owner@quickvisa.com             Demo@123');
  console.log('  Student         student@example.com             Demo@123');
  console.log('  Uni (Herts)     admin@herts.university.demo     Demo@123');
  console.log('  Uni (Coventry)  admin@coventry.university.demo  Demo@123');
  console.log('');
  console.log('  Admin portal:  http://localhost:3000/admin/dashboard');
  console.log('  Agent portal:  http://localhost:3000/agent/dashboard');
}

async function main() {
  console.log('🌱 Seeding RightDirection (exhaustive demo data)…\n');
  await clearDatabase();
  await seedUniversitiesAndCourses();
  const { demoHash } = await seedPlatform();
  const agentIdByKey = await seedAgents(demoHash);
  await seedUniversityPortals(demoHash);
  await seedStudents(agentIdByKey);
  await seedApplications(ID.agentDemo, ID.agentDemoTenant, ID.adminUser);
  await seedDocuments(ID.adminUser);
  await seedStudentJourneyExtras(prisma, ID.agentDemoTenant);
  await seedProposals();
  await seedMarketplace();
  await seedBillingAndNotifications();
  await seedAiJobs();
  await seedActivityLogs();
  await printSummary();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
