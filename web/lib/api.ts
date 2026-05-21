const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

  return json.data as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const patch = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const auth = {
  sendOtp: (phone: string) => post('/auth/send-otp', { phone }),
  login: (email: string, password: string) => post<{ user: User }>('/auth/login', { email, password }),
  logout: () => post('/auth/logout'),
  me: () => get<User>('/auth/me'),
  refresh: () => post<{ user: User }>('/auth/refresh'),
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
  findOne: (id: string) => get<Student>(`/students/${id}`),
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
  ieltsScore?: number;
  pteScore?: number;
  annualBudgetInr?: number;
  preferredCountries: string[];
  preferredField: string[];
  preferredIntake?: string;
  profileScore: number;
  leadSource?: string;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  logoUrl?: string;
  qsWorldRank?: number;
  visaSuccessRate?: number;
  defaultCommissionPct?: number;
  isPartner: boolean;
  courses?: Course[];
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  level: string;
  field: string;
  durationMonths: number;
  intakes: string[];
  tuitionFeeUsd: number;
  commissionPct?: number;
  minIelts?: number;
  minGradePercent?: number;
}

export interface Application {
  id: string;
  studentId: string;
  student: Student;
  courseId: string;
  course: Course;
  universityId: string;
  university: University;
  stage: string;
  intake?: string;
  priority: boolean;
  offerLetterUrl?: string;
  visaDecision?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}
