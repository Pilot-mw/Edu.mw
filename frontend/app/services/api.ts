import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return api(error.config);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Student {
  id: number;
  user: User;
  student_id: string;
  gender: string;
  date_of_birth: string;
  class_room: number;
  class_room_name: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  admission_date: string;
  photo: string;
  photo_url: string;
  is_active: boolean;
}

export interface Teacher {
  id: number;
  user: User;
  teacher_id: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  address: string;
  qualification: string;
  date_employed: string;
  photo: string;
  photo_url: string;
  is_active: boolean;
  assigned_classes: [string, string][];
}

export interface ClassRoom {
  id: number;
  form: string;
  stream: string;
  name: string;
  class_teacher: number | null;
  students_count: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface ClassSubject {
  id: number;
  class_room: number;
  class_name: string;
  subject: number;
  subject_name: string;
  subject_code: string;
  teacher: number;
  teacher_name: string;
}

export interface Term {
  id: number;
  term: string;
  year: string;
  start_date: string;
  end_date: string;
}

export interface Payment {
  id: number;
  student: number;
  student_name: string;
  student_id: string;
  term: number;
  term_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  balance: number;
  is_complete: boolean;
  balance_after: number;
}

export interface Mark {
  id: number;
  student: number;
  student_name: string;
  student_id: string;
  subject: number;
  subject_name: string;
  exam: number;
  exam_name: string;
  marks_obtained: number;
  grade: string;
  points: number;
  teacher: number;
  teacher_name: string;
  date_recorded: string;
}

export interface Exam {
  id: number;
  name: string;
  term: number;
  term_name: string;
  year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface StudentResult {
  id: number;
  student: number;
  student_name: string;
  student_id: string;
  exam: number;
  exam_name: string;
  total_marks: number;
  average_marks: number;
  total_points: number;
  average_points: number;
  division: string;
  position: number;
  class_name: string;
}

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  students_by_class: { form: string; stream: string; student_count: number }[];
  fees_collected: number;
  outstanding_balance: number;
  performance_summary: { division: string; count: number }[];
  recent_payments: {
    student: string;
    amount: number;
    term: string;
    date: string;
    receipt: string;
  }[];
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  image: string | null;
  image_url: string | null;
  status: string;
  author: number | null;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  room: number;
  sender: number | null;
  sender_name: string;
  sender_type: 'visitor' | 'admin';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  visitor_name: string;
  visitor_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message: ChatMessage | null;
  unread_count: number;
}

export interface Application {
  id: number;
  student_name: string;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  previous_school: string;
  class_applying: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolSettings {
  id: number;
  name: string;
  short_name: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  primary_color: string;
  secondary_color: string;
  theme: string;
}

export interface Memo {
  id: string;
  title: string;
  message: string;
  audience: 'teachers' | 'students' | 'all';
  created_by: string;
  important: boolean;
  attachment_url: string | null;
  file_name: string | null;
  file_type: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}
