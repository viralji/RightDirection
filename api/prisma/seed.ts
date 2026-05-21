import { PrismaClient, UserRole, TenantType, KYCStatus, SubscriptionPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── SUPER ADMIN ────────────────────────────────────────────────────────────
  const adminTenant = await prisma.tenant.upsert({
    where: { subdomain: 'admin' },
    update: {},
    create: {
      type: TenantType.ADMIN,
      subdomain: 'admin',
      name: 'RightDirection Platform',
      email: 'admin@rightdirection.com',
    },
  });

  await prisma.user.upsert({
    where: { id: 'super-admin-seed' },
    update: {},
    create: {
      id: 'super-admin-seed',
      tenantId: adminTenant.id,
      email: 'admin@rightdirection.com',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      role: UserRole.SUPER_ADMIN,
      name: 'Platform Admin',
    },
  });

  // ── DEMO UNIVERSITIES ──────────────────────────────────────────────────────
  const universities = [
    {
      name: 'University of Hertfordshire',
      country: 'UK',
      city: 'Hertfordshire',
      qsWorldRank: 801,
      visaSuccessRate: 0.82,
      defaultCommissionPct: 15,
      isPartner: true,
      avgPostStudySalaryUsd: 38000,
      livingCostAnnualUsd: 12000,
    },
    {
      name: 'Coventry University',
      country: 'UK',
      city: 'Coventry',
      qsWorldRank: 651,
      visaSuccessRate: 0.79,
      defaultCommissionPct: 14,
      isPartner: true,
      avgPostStudySalaryUsd: 37000,
      livingCostAnnualUsd: 11000,
    },
    {
      name: 'Algoma University',
      country: 'Canada',
      city: 'Sault Ste. Marie',
      qsWorldRank: null,
      visaSuccessRate: 0.71,
      defaultCommissionPct: 20,
      isPartner: true,
      avgPostStudySalaryUsd: 42000,
      livingCostAnnualUsd: 14000,
    },
    {
      name: 'Trent University',
      country: 'Canada',
      city: 'Peterborough',
      qsWorldRank: 801,
      visaSuccessRate: 0.74,
      defaultCommissionPct: 18,
      isPartner: true,
      avgPostStudySalaryUsd: 44000,
      livingCostAnnualUsd: 13000,
    },
    {
      name: 'CQUniversity Australia',
      country: 'Australia',
      city: 'Rockhampton',
      qsWorldRank: 751,
      visaSuccessRate: 0.76,
      defaultCommissionPct: 16,
      isPartner: true,
      avgPostStudySalaryUsd: 48000,
      livingCostAnnualUsd: 18000,
    },
    {
      name: 'Federation University',
      country: 'Australia',
      city: 'Ballarat',
      qsWorldRank: null,
      visaSuccessRate: 0.73,
      defaultCommissionPct: 17,
      isPartner: true,
      avgPostStudySalaryUsd: 46000,
      livingCostAnnualUsd: 16000,
    },
    {
      name: 'Arden University',
      country: 'UK',
      city: 'Coventry',
      qsWorldRank: null,
      visaSuccessRate: 0.80,
      defaultCommissionPct: 12,
      isPartner: false,
      avgPostStudySalaryUsd: 36000,
      livingCostAnnualUsd: 11500,
    },
    {
      name: 'University of Europe for Applied Sciences',
      country: 'Germany',
      city: 'Berlin',
      qsWorldRank: null,
      visaSuccessRate: 0.85,
      defaultCommissionPct: 10,
      isPartner: false,
      avgPostStudySalaryUsd: 41000,
      livingCostAnnualUsd: 10000,
    },
  ];

  for (const uData of universities) {
    const uni = await prisma.university.upsert({
      where: { id: uData.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: uData.name.toLowerCase().replace(/\s+/g, '-'), ...uData },
    });

    // Seed courses for each
    const courses = [
      {
        name: 'MSc Computer Science',
        level: 'POSTGRADUATE',
        field: 'Computer Science',
        durationMonths: 12,
        intakes: ['September', 'January'],
        tuitionFeeUsd: uData.country === 'UK' ? 15000 : uData.country === 'Canada' ? 18000 : 20000,
        minGradePercent: 55,
        minIelts: 6.0,
        commissionPct: uData.defaultCommissionPct,
      },
      {
        name: 'MBA Business Administration',
        level: 'POSTGRADUATE',
        field: 'Business',
        durationMonths: 12,
        intakes: ['September', 'January', 'May'],
        tuitionFeeUsd: uData.country === 'UK' ? 16000 : uData.country === 'Canada' ? 19000 : 22000,
        minGradePercent: 50,
        minIelts: 6.5,
        commissionPct: uData.defaultCommissionPct,
      },
      {
        name: 'BSc Business Management',
        level: 'UNDERGRADUATE',
        field: 'Business',
        durationMonths: 36,
        intakes: ['September'],
        tuitionFeeUsd: uData.country === 'UK' ? 12000 : uData.country === 'Canada' ? 14000 : 15000,
        minGradePercent: 55,
        minIelts: 5.5,
        commissionPct: uData.defaultCommissionPct,
      },
    ];

    for (const course of courses) {
      const courseId = `${uni.id}-${course.name.toLowerCase().replace(/\s+/g, '-')}`;
      await prisma.course.upsert({
        where: { id: courseId },
        update: {},
        create: { id: courseId, universityId: uni.id, ...course },
      });
    }
  }

  // ── DEMO AGENT ─────────────────────────────────────────────────────────────
  const agentTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      type: TenantType.AGENT,
      subdomain: 'demo',
      name: 'StudyVision Consultancy',
      email: 'demo@studyvision.com',
      subscriptionPlan: SubscriptionPlan.PRO,
      subscriptionExpiresAt: new Date('2027-01-01'),
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { id: 'demo-agent-seed' },
    update: {},
    create: {
      id: 'demo-agent-seed',
      tenantId: agentTenant.id,
      email: 'owner@studyvision.com',
      passwordHash: await bcrypt.hash('Demo@123', 10),
      role: UserRole.AGENT_OWNER,
      name: 'Rahul Sharma',
      phone: '+919876543210',
    },
  });

  await prisma.agent.upsert({
    where: { tenantId: agentTenant.id },
    update: {},
    create: {
      tenantId: agentTenant.id,
      businessName: 'StudyVision Consultancy',
      city: 'Surat',
      state: 'Gujarat',
      kycStatus: KYCStatus.APPROVED,
      isBadgeVerified: true,
      visaSuccessRate: 0.78,
      conversionRate: 0.42,
    },
  });

  // Demo counselor
  await prisma.user.upsert({
    where: { id: 'demo-counselor-seed' },
    update: {},
    create: {
      id: 'demo-counselor-seed',
      tenantId: agentTenant.id,
      email: 'counselor@studyvision.com',
      passwordHash: await bcrypt.hash('Demo@123', 10),
      role: UserRole.AGENT_COUNSELOR,
      name: 'Priya Patel',
      phone: '+919876543211',
    },
  });

  // Demo student
  const studentUser = await prisma.user.upsert({
    where: { id: 'demo-student-seed' },
    update: {},
    create: {
      id: 'demo-student-seed',
      tenantId: agentTenant.id,
      email: 'student@example.com',
      passwordHash: await bcrypt.hash('Demo@123', 10),
      role: UserRole.STUDENT,
      name: 'Arjun Mehta',
      phone: '+919876543212',
    },
  });

  const agent = await prisma.agent.findUnique({ where: { tenantId: agentTenant.id } });

  await prisma.student.upsert({
    where: { userId: 'demo-student-seed' },
    update: {},
    create: {
      userId: 'demo-student-seed',
      agentId: agent!.id,
      tenantId: agentTenant.id,
      educationLevel: 'UNDERGRADUATE',
      aggregatePct: 72,
      stream: 'Commerce',
      preferredField: ['Business', 'Finance'],
      ieltsScore: 6.5,
      annualBudgetInr: 2500000,
      preferredCountries: ['UK', 'Canada'],
      preferredIntake: 'September 2025',
      leadSource: 'WALK_IN',
      profileScore: 75,
    },
  });

  console.log('✅ Seed complete');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Admin:     admin@rightdirection.com / Admin@123');
  console.log('  Agent:     owner@studyvision.com   / Demo@123  (subdomain: demo)');
  console.log('  Counselor: counselor@studyvision.com / Demo@123');
  console.log('  Student:   student@example.com    / Demo@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
