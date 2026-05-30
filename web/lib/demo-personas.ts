/** Mirrors api/src/modules/admin/demo-personas.ts — used for Demo as… dropdown */
export type DemoPersona = {
  email: string;
  label: string;
  role: string;
  redirectPath: string;
};

export const DEMO_PERSONAS: DemoPersona[] = [
  { email: 'owner@studyvision.com', label: 'Agent Owner — StudyVision', role: 'AGENT_OWNER', redirectPath: '/agent/dashboard' },
  { email: 'counselor@studyvision.com', label: 'Agent Counselor — StudyVision', role: 'AGENT_COUNSELOR', redirectPath: '/agent/dashboard' },
  { email: 'telecaller@studyvision.com', label: 'Agent Telecaller — StudyVision', role: 'AGENT_TELECALLER', redirectPath: '/agent/dashboard' },
  { email: 'student@example.com', label: 'Student — Arjun Mehta', role: 'STUDENT', redirectPath: '/student/dashboard' },
  { email: 'admin@herts.university.demo', label: 'University Admin — Herts', role: 'UNIVERSITY_ADMIN', redirectPath: '/university/dashboard' },
  { email: 'admin@coventry.university.demo', label: 'University Admin — Coventry', role: 'UNIVERSITY_ADMIN', redirectPath: '/university/dashboard' },
  { email: 'owner@metrooverseas.com', label: 'Agent Owner — KYC Pending', role: 'AGENT_OWNER', redirectPath: '/agent/dashboard' },
  { email: 'owner@aspireedu.com', label: 'Agent Owner — KYC Under Review', role: 'AGENT_OWNER', redirectPath: '/agent/dashboard' },
];
