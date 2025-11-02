import { createClient } from '@/utils/supabase/server';
import DashboardContent from '@/features/dashboard/components/dashboard-content';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('classes')
    .select(
      `
      id,
      subject_code,
      subject_name,
      course:course_id ( id, name, code ),
      major:major_id ( id, name, code ),
      section:section_id ( id, name, code ),
      year_level:year_level_id ( id, name, code ),
      class_schedules ( day_of_week, start_time, end_time )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error.message);
    return <DashboardContent classes={[]} />;
  }

  // normalize helper
  const normalize = (rel: any) => (Array.isArray(rel) ? rel[0] : rel || {});

  const formattedData = (data || []).map((cls: any) => ({
    id: cls.id,
    subject_code: cls.subject_code,
    subject_name: cls.subject_name,
    schedules: cls.class_schedules || [],
  }));

  return <DashboardContent classes={formattedData} />;
}
