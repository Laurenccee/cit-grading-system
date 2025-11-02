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
      enrollmentCount: cls.class_enrollments?.[0]?.count ?? 0,
    };
  });
  const hasClasses = formattedData.length > 0;

  return (
    <>
      <div className="flex gap-5">
        <div className="flex flex-col w-full gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Classes</h1>
              <p className="text-sm text-foreground/60 mt-0.5">
                Manage your classes and enrollments
              </p>
            </div>
            <InsertClassForm />
          </div>

          {/* Main Content */}
          {hasClasses ? (
            <div className="flex flex-col 2xl:flex-row gap-2.5 w-full">
              {/* Left: List of classes */}
              <div className="flex-1">
                <ClassList
                  initialClasses={formattedData}
                  dropdownData={dropdownData}
                />
              </div>

              {/* Right: Chart visualization */}
              <div className="w-full 2xl:w-96 shrink-0">
                <ClassCharts students={formattedData} className="w-full" />
              </div>
            </div>
          ) : (
            <div className="border-2 border-border bg-background shadow-shadow p-12 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                No Classes Yet
              </h2>
              <p className="text-sm text-foreground/60 mb-6 max-w-sm mx-auto">
                Get started by creating your first class. Add courses, manage
                enrollments, and track student progress.
              </p>
              <InsertClassForm />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
