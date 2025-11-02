import { createClient } from '@/utils/supabase/server';
import InsertClassForm from '@/features/classes/components/classes-form/add-classes-form';
import ClassList from '@/features/classes/components/class-list';
import ClassCharts from '@/features/classes/components/class-chart';
import { fetchData } from '@/features/classes/data/dropdown';

export default async function ClassPage() {
  const supabase = await createClient();

  const [{ data, error }, dropdownData] = await Promise.all([
    supabase
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
        class_enrollments(count),
        class_schedules ( day_of_week, start_time, end_time )
      `
      )
      .order('created_at', { ascending: false }),
    fetchData(),
  ]);

  if (error) {
    console.error('Error fetching classes:', error.message);
    return <p className="text-red-500">Error loading data.</p>;
  }

  // normalize helper
  const normalize = (rel: any) => (Array.isArray(rel) ? rel[0] : rel || {});

  const formattedData = (data || []).map((cls: any) => {
    const course = normalize(cls.course);
    const major = normalize(cls.major);
    const section = normalize(cls.section);
    const year_level = normalize(cls.year_level);

    return {
      id: cls.id,
      subject_code: cls.subject_code,
      subject_name: cls.subject_name,
      course: course.code || '',
      course_id: course.id || '',
      major: major.code || '',
      major_id: major.id || '',
      section: section.code || '',
      section_id: section.id || '',
      year_level: year_level.code || '',
      year_level_id: year_level.id || '',
      schedules: cls.class_schedules || [],
    };
  });
  const hasClasses = formattedData.length > 0;

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Classes Overview</h1>
        <InsertClassForm />
      </div>

      {/* Main Content */}
      {hasClasses ? (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Left: List of classes */}
          <ClassList
            initialClasses={formattedData}
            dropdownData={dropdownData}
          />

          {/* Right: Chart visualization */}
          <div className="flex justify-center items-start">
            <ClassCharts students={formattedData} className="w-full" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
          <p>No classes yet.</p>
          <InsertClassForm />
        </div>
      )}
    </div>
  );
}
