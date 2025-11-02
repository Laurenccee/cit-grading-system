// /types/class.ts

export interface Student {
  student_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
}
export type ClassStudent = {
  student_id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  year_level: string;
  course: string;
  major: string;
  section: string;
};

export interface Enrollment {
  student: Student;
}

export interface RelatedInfo {
  name: string;
  code: string;
}

export interface ClassRecord {
  id: string;
  subject_code: string;
  subject_name: string;
  course?: RelatedInfo | RelatedInfo[];
  major?: RelatedInfo | RelatedInfo[];
  section?: RelatedInfo | RelatedInfo[];
  year_level?: RelatedInfo | RelatedInfo[];
  class_enrollments?: Enrollment[];
}

// ===============================
//  FORMATTED DATA (for display)
// ===============================
export interface FormattedStudent {
  id: string;
  student_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  section: string;
}

export interface FormattedClass {
  id: string;
  subject_code: string;
  subject_name: string;
  course: string; // course code
  course_id?: string; // ✅ new
  major: string; // major code
  major_id?: string; // ✅ new
  section: string; // section code
  section_id?: string; // ✅ new
  year_level: string; // year level code
  year_level_id?: string; // ✅ new
  studentCount?: number;
  enrollmentCount?: number; // Total enrolled students
  schedules?: { day_of_week: string; start_time: string; end_time: string }[];
}
