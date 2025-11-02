import { createClient } from '@/utils/supabase/server';
import ClassTable from '@/features/classes/components/class-table';

export default async function Page(props: {
  params: Promise<{ course_id: string; major_id: string; section_id: string }>;
}) {
  // ✅ unwrap promise before using
  const params = await props.params;
  const { course_id, major_id, section_id } = params;

  console.log('Server Params:', { course_id, major_id, section_id });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('classes')
    .select(
      `
      id,
      subject_code,
      subject_name,
      course:course_id (id, code, name),
      major:major_id (id, code, name),
      year_level:year_level_id (id, code, name),
      section:section_id (id, code, name),
      class_enrollments!inner (
        id,
        student:student_id!inner (
          id,
          student_id,
          first_name,
          middle_name,
          last_name
        )
      )
    `
    )
    .eq('course_id', course_id)
    .eq('major_id', major_id)
    .eq('section_id', section_id)
    .single();

  if (error || !data) {
    console.error('Error fetching class:', error?.message);
    return <p className="text-red-500">Error loading data.</p>;
  }

  const normalizedClass = {
    ...data,
    course: Array.isArray(data.course) ? data.course[0] : data.course,
    major: Array.isArray(data.major) ? data.major[0] : data.major,
    year_level: Array.isArray(data.year_level)
      ? data.year_level[0]
      : data.year_level,
    section: Array.isArray(data.section) ? data.section[0] : data.section,
  };

  const students =
    normalizedClass.class_enrollments?.map((enroll: any) => ({
      id: enroll.student.id,
      student_id: enroll.student.student_id,
      first_name: enroll.student.first_name,
      middle_name: enroll.student.middle_name,
      last_name: enroll.student.last_name,
      section: normalizedClass.section.code,
    })) || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {`${normalizedClass.major.code} ${normalizedClass.year_level.code}${normalizedClass.section.code}`}
      </h2>
      <ClassTable data={students} classID={normalizedClass.id} />
    </div>
  );
}
