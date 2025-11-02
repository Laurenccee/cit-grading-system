'use server';

import { createClient } from '@/utils/supabase/server';

// Fetch data for course, major, year_level, and section
export async function fetchData() {
  const supabase = await createClient();

  // ✅ Fetch all in parallel
  const [courses, majors, yearLevels, sections] = await Promise.all([
    supabase.from('courses').select('id, code, name'),
    supabase.from('majors').select('id, code, name, course_id'),
    supabase.from('year_levels').select('id, code, name'),
    supabase.from('sections').select('id, code, name'),
  ]);

  // ✅ Handle errors safely
  if (courses.error || majors.error || yearLevels.error || sections.error) {
    console.error('Supabase fetch error:', {
      courses: courses.error?.message,
      majors: majors.error?.message,
      yearLevels: yearLevels.error?.message,
      sections: sections.error?.message,
    });
  }

  // ✅ Return consistent structure
  return {
    course: courses.data ?? [],
    major: majors.data ?? [],
    year_level: yearLevels.data ?? [],
    section: sections.data ?? [],
  };
}
