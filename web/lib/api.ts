// Browser: same-origin /api/v1 (Next.js rewrite → Nest) so httpOnly auth cookies work on :5175.
// Server (SSR): call API directly.
const API_BASE =
  typeof window !== 'undefined'
    ? '/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api/v1';

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: any) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json.code || 'ERROR', json.error || 'Request failed', json.details);
  }

  // Paginated list endpoints return { data: T[], meta } at the top level
  if (json.meta !== undefined && Array.isArray(json.data)) {
    return { data: json.data, meta: json.meta } as T;
  }

  return json.data as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const patch = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const auth = {
  sendOtp: (phone: string) =>
    post<{ message: string; devHint?: string }>('/auth/send-otp', { phone }),
  login: (email: string, password: string) => post<{ user: User }>('/auth/login', { email, password }),
  loginOtp: (phone: string, otp: string) => post<{ user: User }>('/auth/login/otp', { phone, otp }),
  registerStudent: (data: {
    phone: string;
    otp: string;
    name: string;
    email: string;
    password: string;
    agentSubdomain: string;
    preferredCountries?: string[];
  }) => post<{ user: User }>('/auth/register/student', data),
  logout: () => post('/auth/logout'),
  me: () => get<User>('/auth/me'),
  refresh: () => post<{ user: User }>('/auth/refresh'),
  stopImpersonation: () =>
    post<{ user: User; redirectPath: string; impersonating: boolean }>('/auth/impersonate/stop'),
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const admin = {
  demoPersonas: () => get<DemoPersona[]>('/admin/demo-personas'),
  impersonate: (email: string) =>
    post<{ user: User; redirectPath: string; personaLabel: string; impersonating: boolean }>(
      '/admin/impersonate',
      { email },
    ),
};

// ─── TENANTS ─────────────────────────────────────────────────────────────────
export const tenants = {
  bySubdomain: (subdomain: string) => get<TenantBranding>(`/tenants/by-subdomain/${subdomain}`),
  updateBranding: (data: Partial<TenantBranding>) => patch<TenantBranding>('/tenants/branding', data),
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const students = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<PaginatedResponse<Student>>(`/students${qs}`);
  },
  findOne: (id: string) => get<StudentDetail>(`/students/${id}`),
  journey: (id: string) => get<StudentJourneyResponse>(`/students/${id}/journey`),
  meDashboard: () => get<StudentDashboardResponse>('/students/me/dashboard'),
  meJourney: () => get<StudentJourneyResponse>('/students/me/journey'),
  meProfile: () => get<StudentDetail>('/students/me/profile'),
  meDocuments: () => get<StudentDocumentsResponse>('/students/me/documents'),
  meDocumentsPresign: (data: {
    category: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }) => post<{ uploadUrl: string; s3Key: string }>('/students/me/documents/presign', data),
  meDocumentsCreate: (data: {
    category: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    s3Key: string;
    parentDocId?: string;
  }) => post<{ id: string; s3Key: string; status: string }>('/students/me/documents', data),
  meDocumentDownload: (docId: string) =>
    get<{ url: string; fileName: string }>(`/students/me/documents/${docId}/download`),
  create: (data: Partial<Student>) => post<Student>('/students', data),
  update: (id: string, data: Partial<Student>) => patch<Student>(`/students/${id}`, data),
};

// ─── UNIVERSITIES ─────────────────────────────────────────────────────────────
export const universities = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<PaginatedResponse<University>>(`/universities${qs}`);
  },
  findOne: (id: string) => get<University>(`/universities/${id}`),
  courses: (universityId: string) => get<Course[]>(`/universities/${universityId}/courses`),
};

// ─── APPLICATIONS ────────────────────────────────────────────────────────────
export const applications = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<PaginatedResponse<Application>>(`/applications${qs}`);
  },
  kanban: () => get<Record<string, Application[]>>('/applications/kanban'),
  findOne: (id: string) => get<Application>(`/applications/${id}`),
  create: (data: any) => post<Application>('/applications', data),
  changeStage: (id: string, stage: string, note?: string) =>
    patch<Application>(`/applications/${id}/stage`, { stage, note }),
  update: (id: string, data: any) => patch<Application>(`/applications/${id}`, data),
};

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────
export const documents = {
  getPresignUrl: (data: any) => post<{ uploadUrl: string; s3Key: string }>('/documents/presign', data),
  create: (data: any) => post<Document>('/documents', data),
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<Document[]>(`/documents${qs}`);
  },
  download: (id: string) => get<{ url: string; fileName: string }>(`/documents/${id}/download`),
};

// ─── PROPOSALS ───────────────────────────────────────────────────────────────
export const proposals = {
  list: (studentId?: string) => get<any[]>(`/proposals${studentId ? `?studentId=${studentId}` : ''}`),
  findOne: (id: string) => get<any>(`/proposals/${id}`),
  generate: (studentId: string) => post<any>('/proposals/generate', { studentId }),
  updateSop: (id: string, sopContent: string) => patch<any>(`/proposals/${id}/sop`, { sopContent }),
  generatePdf: (id: string) => post<{ downloadUrl: string; pdfKey: string }>(`/proposals/${id}/pdf`),
};

// ─── COMMISSIONS ─────────────────────────────────────────────────────────────
export const commissions = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<any>(`/commissions${qs}`);
  },
  wallet: () => get<{ walletBalance: number; totalEarned: number; pendingCommission: number; approvedAndPayable: number }>('/commissions/wallet'),
};

// ─── AGENT ───────────────────────────────────────────────────────────────────
export const agent = {
  profile: () => get<any>('/agent/profile'),
  stats: () => get<any>('/agent/stats'),
  team: () => get<any[]>('/agent/team'),
  update: (data: any) => patch<any>('/agent/profile', data),
};

// ─── MARKETPLACE ─────────────────────────────────────────────────────────────
export const marketplace = {
  listLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<any>(`/marketplace/leads${qs}`);
  },
  unlockLead: (leadId: string) => post<any>(`/marketplace/leads/${leadId}/unlock`),
  myUnlockedLeads: () => get<any[]>('/marketplace/leads/my-unlocked'),
};

// ─── BILLING ─────────────────────────────────────────────────────────────────
export const billing = {
  plan: () => get<any>('/billing/plan'),
  history: () => get<any[]>('/billing/history'),
  subscribe: (plan: string) => post<any>('/billing/subscribe', { plan }),
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  channel?: string;
}

export const notifications = {
  list: (unread = false) => get<Notification[]>(`/notifications${unread ? '?unread=true' : ''}`),
  unreadCount: () => get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => patch(`/notifications/${id}/read`),
  markAllRead: () => patch('/notifications/read-all'),
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  avatarUrl?: string;
  impersonating?: boolean;
}

export interface DemoPersona {
  email: string;
  label: string;
  role: string;
  redirectPath: string;
}

export interface TenantBranding {
  id: string;
  subdomain: string;
  name: string;
  type: string;
  status: string;
  plan: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
}

export interface Student {
  id: string;
  user: { name: string; email: string; phone?: string };
  agentId?: string;
  tenantId: string;
  educationLevel?: string;
  aggregatePct?: number;
  stream?: string;
  ieltsScore?: number;
  pteScore?: number;
  greScore?: number;
  toeflScore?: number;
  annualBudgetInr?: number;
  preferredCountries: string[];
  preferredField: string[];
  preferredIntake?: string;
  profileScore: number;
  leadSource?: string;
  leadQualityScore?: number;
  profileDetails?: Record<string, unknown>;
  counselorNotes?: string;
  createdAt: string;
}

export interface StudentDetail extends Student {
  agent?: { businessName: string; city?: string };
  applications?: Application[];
  proposals?: any[];
  documents?: any[];
  trustScore?: {
    documentScore?: number;
    financialScore?: number;
    academicScore?: number;
    overallScore?: number;
    riskLevel?: string;
  };
  journeyEvents?: JourneyEvent[];
}

export interface JourneyEvent {
  id: string;
  type: string;
  icon?: string;
  title: string;
  description?: string;
  occurredAt: string;
  applicationId?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
}

export interface StudentJourneyResponse {
  student: { id: string; name: string; email: string };
  stats: {
    totalEvents: number;
    applications: number;
    activeStage: string | null;
    daysWithAgency: number;
  };
  events: JourneyEvent[];
  applications: Application[];
}

export interface StudentDocumentSlotView {
  category: string;
  label: string;
  description: string;
  required: boolean;
  accept: string;
  status: string;
  historyCount: number;
  document: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    status: string;
    rejectedReason?: string | null;
    version: number;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface StudentDocumentsResponse {
  studentId: string;
  slots: StudentDocumentSlotView[];
  summary: {
    totalSlots: number;
    uploaded: number;
    verified: number;
    requiredTotal: number;
    requiredUploaded: number;
    underReview: number;
    rejected: number;
  };
}

export interface StudentDashboardResponse {
  student: StudentDetail;
  summary: {
    profileScore: number;
    applicationsCount: number;
    documentsCount: number;
    proposalsCount: number;
    trustOverall: number | null;
    unreadNotifications: number;
    preferredCountries: string[];
    preferredIntake?: string;
  };
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  stateProvince?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  overview?: string;

  // Profile
  type?: string;
  foundedYear?: number;
  totalStudents?: number;
  internationalStudentPct?: number;
  campusType?: string;
  accreditations?: string[];

  // Rankings
  qsWorldRank?: number;
  timesHigherRank?: number;
  shanghaiRank?: number;
  nirf?: number;

  // Financials
  applicationFeeUsd?: number;
  livingCostAnnualUsd?: number;
  dormAvailable?: boolean;
  dormCostAnnualUsd?: number;

  // Scholarships
  scholarshipAvailable?: boolean;
  scholarshipInfo?: string;

  // Post-study & visa
  postStudyWorkYears?: number;
  visaSuccessRate?: number;
  avgPostStudySalaryUsd?: number;

  // Partner info
  isPartner: boolean;
  defaultCommissionPct?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Social
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;

  courses?: Course[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  overview?: string;
  level: string;
  field: string;
  specializations?: string[];
  durationMonths: number;
  languageOfInstruction?: string;
  intakes: string[];
  tuitionFeeUsd: number;
  currency?: string;
  localFee?: number;
  applicationFeeUsd?: number;
  minGradePercent?: number;
  minIelts?: number;
  minPte?: number;
  minToefl?: number;
  minDuolingo?: number;
  minGre?: number;
  minGmat?: number;
  workExperienceYears?: number;
  scholarshipAvailable?: boolean;
  scholarshipAmountUsd?: number;
  scholarshipInfo?: string;
  coopAvailable?: boolean;
  onlineAvailable?: boolean;
  commissionPct?: number;
  applicationDeadline?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ApplicationStageHistory {
  id: string;
  stage: string;
  note?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  student: Student;
  courseId: string;
  course: Course & { annualFeeUsd?: number };
  universityId: string;
  university: University;
  stage: string;
  intake?: string;
  priority: boolean;
  offerLetterUrl?: string;
  visaDecision?: string;
  notes?: string;
  stageHistory?: ApplicationStageHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}
