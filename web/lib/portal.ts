/** Default dashboard path after login, by API user role. */
export function dashboardPath(role: string): string {
  if (role === 'SUPER_ADMIN') return '/admin/dashboard';
  if (role.startsWith('UNIVERSITY_')) return '/university/dashboard';
  if (role === 'STUDENT') return '/student/dashboard';
  return '/agent/dashboard';
}
