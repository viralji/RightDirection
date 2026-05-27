/**
 * Rich profile + timeline events for demo students (seed-student-01 … 10).
 */
import { PrismaClient } from '@prisma/client';

const d = (iso: string) => new Date(iso);

export const STUDENT_EXTENDED_PROFILES: Record<
  string,
  { profileDetails: object; counselorNotes: string }
> = {
  'seed-student-01': {
    profileDetails: {
      dateOfBirth: '2004-03-15',
      gender: 'Male',
      nationality: 'Indian',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      passportNumber: 'P1234567',
      passportExpiry: '2032-08-20',
      fatherName: 'Rajesh Mehta',
      motherName: 'Sunita Mehta',
      emergencyContact: '+91 98765 43210',
      currentEducation: '12th Commerce — Ryan International, 72%',
      workExperience: '6 months internship at HDFC Bank',
      backlogs: 0,
      gapYears: 0,
      languages: ['English', 'Hindi', 'Marathi'],
      linkedIn: 'linkedin.com/in/arjunmehta',
    },
    counselorNotes:
      'Strong MBA/CS interest. Parents involved in decisions. Target Sep 2026 UK intake. IELTS 6.5 — retake planned for 7.0. Priority: Coventry MBA + Herts MSc CS.',
  },
  'seed-student-02': {
    profileDetails: {
      dateOfBirth: '2003-11-02',
      city: 'Pune',
      state: 'Maharashtra',
      passportNumber: 'P2345678',
      currentEducation: 'BCom final year — Fergusson College',
      gapYears: 0,
    },
    counselorNotes: 'Referral from alumni. Budget conscious. Needs scholarship guidance.',
  },
  'seed-student-03': {
    profileDetails: {
      dateOfBirth: '1999-07-22',
      city: 'Bangalore',
      state: 'Karnataka',
      passportNumber: 'P3456789',
      currentEducation: 'B.Tech Mechanical — RV College, 58%',
      workExperience: '2 years at Bosch India',
    },
    counselorNotes: 'Postgrad engineering Canada focus. SOP draft approved. Algoma application submitted.',
  },
  'seed-student-04': {
    profileDetails: {
      dateOfBirth: '2002-01-10',
      city: 'Chennai',
      state: 'Tamil Nadu',
      passportNumber: 'P4567890',
      currentEducation: 'BBA — Loyola, 81%',
      loanApproved: true,
      loanAmountInr: 3500000,
    },
    counselorNotes: 'High-value lead. Conditional offer received Coventry MBA. Loan sanction verified.',
  },
  'seed-student-05': {
    profileDetails: {
      dateOfBirth: '2004-09-05',
      city: 'Jaipur',
      state: 'Rajasthan',
      passportNumber: 'P5678901',
      currentEducation: '12th Arts — 55%',
    },
    counselorNotes: 'Low IELTS. UK options limited. Passport scan rejected — renewal pending.',
  },
  'seed-student-06': {
    profileDetails: {
      dateOfBirth: '1998-04-18',
      city: 'Hyderabad',
      state: 'Telangana',
      passportNumber: 'P6789012',
      currentEducation: 'BSc Statistics — Osmania University',
    },
    counselorNotes: 'Australia PR pathway interest. Visa processing in progress.',
  },
  'seed-student-07': {
    profileDetails: {
      dateOfBirth: '2003-06-30',
      city: 'Ahmedabad',
      state: 'Gujarat',
      passportNumber: 'P7890123',
      currentEducation: 'BCom — Gujarat University',
    },
    counselorNotes: 'Fees paid Trent MBA. Commission university-paid stage.',
  },
  'seed-student-08': {
    profileDetails: {
      dateOfBirth: '1997-12-12',
      city: 'Delhi',
      state: 'Delhi',
      passportNumber: 'P8901234',
      currentEducation: 'B.Tech IT — DTU, 77%',
      gre: 310,
    },
    counselorNotes: 'Enrolled Algoma MSc CS Sep 2025. Success story for marketing.',
  },
  'seed-student-09': {
    profileDetails: {
      dateOfBirth: '2005-02-28',
      city: 'Surat',
      state: 'Gujarat',
      passportNumber: 'P9012345',
      currentEducation: '12th Commerce — 49%',
    },
    counselorNotes: 'High fraud risk on degree cert. Application withdrawn after review.',
  },
  'seed-student-10': {
    profileDetails: {
      dateOfBirth: '2000-08-14',
      city: 'Kolkata',
      state: 'West Bengal',
      passportNumber: 'P0123456',
      currentEducation: 'BSc Nursing — WBUHS',
    },
    counselorNotes: 'Public health masters UK + Australia. Unconditional offer Federation University.',
  },
};

type JourneySeed = {
  studentId: string;
  tenantId: string;
  events: Array<{
    type: string;
    title: string;
    description?: string;
    occurredAt: Date;
    applicationId?: string;
    actorName?: string;
    metadata?: object;
  }>;
};

export function buildJourneySeeds(tenantId: string): JourneySeed[] {
  return [
    {
      studentId: 'seed-student-01',
      tenantId,
      events: [
        { type: 'lead', title: 'Lead captured', description: 'Walk-in at StudyVision Mumbai office', occurredAt: d('2025-10-12T10:00:00'), actorName: 'StudyVision Owner' },
        { type: 'call', title: 'Counselling call (45 min)', description: 'Discussed UK vs Canada, budget ₹25L, IELTS prep plan', occurredAt: d('2025-10-15T14:30:00'), actorName: 'Priya Patel' },
        { type: 'profile', title: 'Profile completed', description: 'Academic history + preferences saved', occurredAt: d('2025-10-18T11:00:00'), actorName: 'Priya Patel' },
        { type: 'ai', title: 'AI university shortlist generated', description: '8 programs matched — Herts, Coventry, Algoma top 3', occurredAt: d('2025-10-22T09:15:00'), actorName: 'System' },
        { type: 'proposal', title: 'Proposal shared with student', description: 'PDF sent via WhatsApp', occurredAt: d('2025-10-25T16:00:00'), actorName: 'StudyVision Owner', metadata: { proposalId: 'seed-proposal-01' } },
        { type: 'application', title: 'Application opened — Herts MSc CS', description: 'Sep 2026 intake', occurredAt: d('2025-11-01T10:00:00'), applicationId: 'seed-app-01', actorName: 'Priya Patel' },
        { type: 'stage', title: 'Stage: Docs Collection', description: 'Herts MSc CS — collecting transcripts & IELTS', occurredAt: d('2025-11-20T10:00:00'), applicationId: 'seed-app-02', actorName: 'Priya Patel' },
        { type: 'document', title: '12th marksheet verified', description: 'ACADEMIC · VERIFIED', occurredAt: d('2025-11-22T12:00:00'), actorName: 'Platform Admin' },
        { type: 'document', title: 'IELTS TRF verified', description: 'TEST_SCORES · Overall 6.5', occurredAt: d('2025-11-25T09:30:00'), actorName: 'Platform Admin' },
        { type: 'application', title: 'Application opened — Coventry MBA', description: 'Priority application flagged', occurredAt: d('2025-12-05T11:00:00'), applicationId: 'seed-app-02', actorName: 'StudyVision Owner' },
        { type: 'meeting', title: 'Parent meeting (office)', description: 'Father attended — agreed on Coventry as backup', occurredAt: d('2026-01-10T15:00:00'), actorName: 'StudyVision Owner' },
        { type: 'note', title: 'Counselor note', description: 'Student targeting IELTS retake in March 2026 for 7.0 band', occurredAt: d('2026-02-01T10:00:00'), actorName: 'Priya Patel' },
        { type: 'stage', title: 'Stage: Lead (Herts)', description: 'Awaiting document pack completion', occurredAt: d('2026-02-15T10:00:00'), applicationId: 'seed-app-01', actorName: 'Priya Patel' },
      ],
    },
    {
      studentId: 'seed-student-02',
      tenantId,
      events: [
        { type: 'lead', title: 'Referral lead', description: 'Referred by enrolled student Meera Joshi', occurredAt: d('2025-11-05T10:00:00'), actorName: 'StudyVision Owner' },
        { type: 'application', title: 'Application — Herts BSc Business', occurredAt: d('2025-12-01T10:00:00'), applicationId: 'seed-app-03', actorName: 'Priya Patel' },
        { type: 'stage', title: 'Stage: Under Review', description: 'University reviewing application', occurredAt: d('2026-01-20T14:00:00'), applicationId: 'seed-app-03', actorName: 'Priya Patel' },
        { type: 'document', title: 'Bank statement uploaded', description: 'FINANCIAL · UNDER_REVIEW', occurredAt: d('2026-02-10T11:00:00'), actorName: 'Priya Patel' },
      ],
    },
    {
      studentId: 'seed-student-03',
      tenantId,
      events: [
        { type: 'lead', title: 'Digital lead — Meta ads', occurredAt: d('2025-09-20T09:00:00'), actorName: 'System' },
        { type: 'application', title: 'Application submitted — Algoma MSc CS', occurredAt: d('2025-12-15T10:00:00'), applicationId: 'seed-app-04', actorName: 'Priya Patel' },
        { type: 'stage', title: 'Stage: Submitted', description: 'Awaiting university decision', occurredAt: d('2026-01-25T10:00:00'), applicationId: 'seed-app-04', actorName: 'Priya Patel' },
        { type: 'document', title: 'SOP final verified', description: 'APPLICATION document approved', occurredAt: d('2026-02-05T16:00:00'), actorName: 'Platform Admin' },
        { type: 'ai', title: 'Trust score calculated', description: 'Overall score 81 — LOW risk', occurredAt: d('2026-03-01T08:00:00'), actorName: 'AI Engine' },
      ],
    },
    {
      studentId: 'seed-student-04',
      tenantId,
      events: [
        { type: 'lead', title: 'Education fair lead', occurredAt: d('2025-08-10T11:00:00'), actorName: 'StudyVision Owner' },
        { type: 'offer', title: 'Conditional offer — Coventry MBA', description: 'Condition: final degree certificate', occurredAt: d('2026-02-20T10:00:00'), applicationId: 'seed-app-05', actorName: 'University' },
        { type: 'document', title: 'Loan sanction letter verified', occurredAt: d('2026-03-05T12:00:00'), actorName: 'Platform Admin' },
        { type: 'application', title: 'Second application — UE MSc CS', occurredAt: d('2026-03-10T10:00:00'), applicationId: 'seed-app-12', actorName: 'Priya Patel' },
        { type: 'stage', title: 'Stage: Submitted (UE)', occurredAt: d('2026-04-01T10:00:00'), applicationId: 'seed-app-12', actorName: 'Priya Patel' },
      ],
    },
    {
      studentId: 'seed-student-05',
      tenantId,
      events: [
        { type: 'lead', title: 'Telecaller lead', occurredAt: d('2025-12-01T10:00:00'), actorName: 'Suresh Kumar' },
        { type: 'application', title: 'Application — Arden BSc', occurredAt: d('2026-01-05T10:00:00'), applicationId: 'seed-app-06', actorName: 'Priya Patel' },
        { type: 'stage', title: 'Application rejected', description: 'Insufficient academic requirements', occurredAt: d('2026-03-15T10:00:00'), applicationId: 'seed-app-06', actorName: 'University' },
        { type: 'document', title: 'Passport scan rejected', description: 'Expired passport — re-upload required', occurredAt: d('2026-02-28T14:00:00'), actorName: 'Platform Admin' },
      ],
    },
    {
      studentId: 'seed-student-06',
      tenantId,
      events: [
        { type: 'lead', title: 'Walk-in lead', occurredAt: d('2025-07-15T10:00:00'), actorName: 'StudyVision Owner' },
        { type: 'visa', title: 'Visa application lodged', description: 'Australia subclass 500', occurredAt: d('2026-02-01T10:00:00'), applicationId: 'seed-app-07', actorName: 'Priya Patel' },
        { type: 'stage', title: 'Stage: Visa Processing', occurredAt: d('2026-02-15T10:00:00'), applicationId: 'seed-app-07', actorName: 'Priya Patel' },
        { type: 'document', title: 'Transcript uploaded', description: 'Flagged for review — fraud score 71%', occurredAt: d('2026-01-20T11:00:00'), actorName: 'Priya Patel' },
      ],
    },
    {
      studentId: 'seed-student-07',
      tenantId,
      events: [
        { type: 'lead', title: 'Partner agent referral', occurredAt: d('2025-06-01T10:00:00'), actorName: 'StudyVision Owner' },
        { type: 'payment', title: 'Tuition fees paid', description: 'Trent University MBA Sep 2025', occurredAt: d('2025-11-15T10:00:00'), applicationId: 'seed-app-08', actorName: 'Student' },
        { type: 'stage', title: 'Stage: Fees Paid', occurredAt: d('2025-11-20T10:00:00'), applicationId: 'seed-app-08', actorName: 'Priya Patel' },
        { type: 'document', title: 'Visa application draft uploaded', occurredAt: d('2025-12-10T10:00:00'), actorName: 'Priya Patel' },
      ],
    },
    {
      studentId: 'seed-student-08',
      tenantId,
      events: [
        { type: 'lead', title: 'Digital lead', occurredAt: d('2025-05-01T10:00:00'), actorName: 'System' },
        { type: 'enrolled', title: 'Enrolled — Algoma MSc CS', description: 'Sep 2025 intake confirmed', occurredAt: d('2025-09-01T10:00:00'), applicationId: 'seed-app-09', actorName: 'University' },
        { type: 'document', title: 'GRE score verified', occurredAt: d('2025-07-10T10:00:00'), actorName: 'Platform Admin' },
        { type: 'payment', title: 'Commission approved', description: '₹59,500 agent share', occurredAt: d('2026-01-15T10:00:00'), applicationId: 'seed-app-09', actorName: 'Platform' },
      ],
    },
    {
      studentId: 'seed-student-09',
      tenantId,
      events: [
        { type: 'lead', title: 'Cold call lead', occurredAt: d('2025-11-20T10:00:00'), actorName: 'Suresh Kumar' },
        { type: 'application', title: 'Application withdrawn', description: 'Student chose domestic option', occurredAt: d('2026-02-01T10:00:00'), applicationId: 'seed-app-10', actorName: 'Priya Patel' },
        { type: 'document', title: 'Degree certificate flagged', description: 'Fraud score 82% — manual review', occurredAt: d('2026-01-15T10:00:00'), actorName: 'AI Engine' },
      ],
    },
    {
      studentId: 'seed-student-10',
      tenantId,
      events: [
        { type: 'lead', title: 'Referral lead', occurredAt: d('2025-09-01T10:00:00'), actorName: 'StudyVision Owner' },
        { type: 'offer', title: 'Unconditional offer — Federation MBA', occurredAt: d('2026-03-01T10:00:00'), applicationId: 'seed-app-11', actorName: 'University' },
        { type: 'stage', title: 'Stage: Offer Received', occurredAt: d('2026-03-05T10:00:00'), applicationId: 'seed-app-11', actorName: 'Priya Patel' },
      ],
    },
  ];
}

export async function seedStudentJourneyExtras(prisma: PrismaClient, tenantId: string) {
  for (const [studentId, ext] of Object.entries(STUDENT_EXTENDED_PROFILES)) {
    await prisma.student.update({
      where: { id: studentId },
      data: {
        profileDetails: ext.profileDetails as object,
        counselorNotes: ext.counselorNotes,
      },
    });
  }

  await prisma.studentJourneyEvent.deleteMany({
    where: { studentId: { startsWith: 'seed-student-' } },
  });

  const seeds = buildJourneySeeds(tenantId);
  let idx = 0;
  for (const { studentId, tenantId: tid, events } of seeds) {
    for (const ev of events) {
      await prisma.studentJourneyEvent.create({
        data: {
          id: `seed-journey-${studentId}-${idx++}`,
          studentId,
          tenantId: tid,
          type: ev.type,
          title: ev.title,
          description: ev.description,
          occurredAt: ev.occurredAt,
          applicationId: ev.applicationId,
          actorName: ev.actorName,
          metadata: ev.metadata as object | undefined,
        },
      });
    }
  }
}
