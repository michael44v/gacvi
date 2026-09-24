import type { User, Course, CourseOffering, Enrollment } from '../types';

// Support configurable API base URL via environment variable or default relative route / direct server path
const API_BASE = import.meta.env.VITE_API_BASE || 'https://localhost:80/gacvi/backend/public/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gacvi_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'An error occurred during request execution.');
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  login: (credentials: any) => apiFetch<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => apiFetch<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  me: () => apiFetch<User>('/auth/me'),

  getCourses: () => apiFetch<Course[]>('/courses'),
  getCourse: (id: number) => apiFetch<Course>(`/courses/${id}`),
  getOfferings: (mode?: string) => apiFetch<CourseOffering[]>(`/offerings${mode ? `?mode=${mode}` : ''}`),
  getOffering: (id: number) => apiFetch<CourseOffering>(`/offerings/${id}`),

  enroll: (offeringId: number) => apiFetch<any>('/enrollments', { method: 'POST', body: JSON.stringify({ offering_id: offeringId }) }),
  confirmPayment: (invoiceId: number, paymentIntentId?: string) => apiFetch<any>('/enrollments/confirm-payment', { method: 'POST', body: JSON.stringify({ invoice_id: invoiceId, stripe_payment_intent_id: paymentIntentId }) }),
  getMyEnrollments: () => apiFetch<Enrollment[]>('/student/enrollments'),

  submitQuiz: (quizId: number, answers: Record<number, string>) => apiFetch<any>('/lms/quiz/submit', { method: 'POST', body: JSON.stringify({ quiz_id: quizId, answers }) }),
  submitAssignment: (assignmentId: number, submissionText: string, fileUrl?: string) => apiFetch<any>('/lms/assignment/submit', { method: 'POST', body: JSON.stringify({ assignment_id: assignmentId, submission_text: submissionText, file_url: fileUrl }) }),

  getTeacherOfferings: () => apiFetch<any[]>('/teacher/offerings'),
  getOfferingStudents: (id: number) => apiFetch<any[]>(`/teacher/offerings/${id}/students`),
  recordAttendance: (offeringId: number, classDate: string, records: any[]) => apiFetch<any>('/teacher/attendance', { method: 'POST', body: JSON.stringify({ offering_id: offeringId, class_date: classDate, records }) }),

  getParentWards: () => apiFetch<any[]>('/parent/wards'),
  getWardOverview: (studentId: number) => apiFetch<any>(`/parent/wards/${studentId}`),

  getAdminStats: () => apiFetch<any>('/admin/stats'),
};
