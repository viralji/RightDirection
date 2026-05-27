import { UserRole } from '@prisma/client';

export type DemoPersona = {
  email: string;
  label: string;
  role: UserRole;
  redirectPath: string;
};

/** Whitelisted accounts for super-admin demo impersonation (must exist in seed). */
export const DEMO_PERSONAS: DemoPersona[] = [
  {
    email: 'owner@studyvision.com',
    label: 'Agent Owner — StudyVision',
    role: UserRole.AGENT_OWNER,
    redirectPath: '/agent/dashboard',
  },
  {
    email: 'counselor@studyvision.com',
    label: 'Agent Counselor — StudyVision',
    role: UserRole.AGENT_COUNSELOR,
    redirectPath: '/agent/dashboard',
  },
  {
    email: 'telecaller@studyvision.com',
    label: 'Agent Telecaller — StudyVision',
    role: UserRole.AGENT_TELECALLER,
    redirectPath: '/agent/dashboard',
  },
  {
    email: 'student@example.com',
    label: 'Student — Arjun Mehta',
    role: UserRole.STUDENT,
    redirectPath: '/student/dashboard',
  },
  {
    email: 'admin@herts.university.demo',
    label: 'University Admin — Herts',
    role: UserRole.UNIVERSITY_ADMIN,
    redirectPath: '/university/dashboard',
  },
  {
    email: 'admin@coventry.university.demo',
    label: 'University Admin — Coventry',
    role: UserRole.UNIVERSITY_ADMIN,
    redirectPath: '/university/dashboard',
  },
  {
    email: 'owner@metrooverseas.com',
    label: 'Agent Owner — KYC Pending',
    role: UserRole.AGENT_OWNER,
    redirectPath: '/agent/dashboard',
  },
  {
    email: 'owner@aspireedu.com',
    label: 'Agent Owner — KYC Under Review',
    role: UserRole.AGENT_OWNER,
    redirectPath: '/agent/dashboard',
  },
];

export function findDemoPersona(email: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
}
