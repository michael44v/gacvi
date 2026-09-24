export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  roles: string[];
}

export interface Course {
  id: number;
  title: string;
  code: string;
  category: string;
  description: string;
  thumbnail_url: string;
  status: string;
  modules?: CourseModule[];
}

export interface CourseOffering {
  id: number;
  course_id: number;
  course_title: string;
  course_code: string;
  course_category: string;
  course_description?: string;
  delivery_mode: 'ONLINE' | 'PHYSICAL';
  title: string;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  classroom_name?: string;
  instructor_first_name?: string;
  instructor_last_name?: string;
  capacity: number;
  enrolled_count: number;
  price: number;
  start_date?: string;
  end_date?: string;
  schedule_description?: string;
  status: string;
  thumbnail_url?: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content_type: 'VIDEO' | 'TEXT' | 'PDF' | 'ASSIGNMENT' | 'QUIZ';
  content_body?: string;
  file_url?: string;
  video_url?: string;
  is_preview: number;
  sort_order: number;
  quiz?: Quiz;
  assignment?: Assignment;
}

export interface Quiz {
  id: number;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: string;
  options_json: string;
}

export interface Assignment {
  id: number;
  title: string;
  instructions: string;
  max_score: number;
  due_date?: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  offering_id: number;
  offering_title: string;
  delivery_mode: 'ONLINE' | 'PHYSICAL';
  course_title: string;
  course_code: string;
  thumbnail_url?: string;
  price: number;
  status: string;
  schedule_description?: string;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  classroom_name?: string;
  start_date?: string;
  end_date?: string;
  invoice_id?: number;
  invoice_number?: string;
  invoice_status?: string;
}
