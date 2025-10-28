'use server';

import { createClient } from '@/utils/supabase/server';

// Fetch data for course, major, year_level, and section
export async function fetchData() {
  const supabase = await createClient();

  // ✅ Fetch from your database tables
  const [courses, majors] = await Promise.all([
    supabase.from('courses').select('id, code, name'),
    supabase.from('majors').select('id, code, name, course_id'),
  ]);

  // ✅ Return consistent structure
  return {
    course: courses.data ?? [],
    major: majors.data ?? [],
    // Hardcoded year levels and sections
    year_level: [
      { code: '1', name: '1st Year' },
      { code: '2', name: '2nd Year' },
      { code: '3', name: '3rd Year' },
      { code: '4', name: '4th Year' },
    ],
    section: [
      { code: 'A', name: 'Section A' },
      { code: 'B', name: 'Section B' },
      { code: 'C', name: 'Section C' },
    ],
  };
}
