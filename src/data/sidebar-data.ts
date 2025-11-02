import { createClient } from '@/utils/supabase/server';

type IconName =
  | 'GalleryVerticalEnd'
  | 'AudioWaveform'
  | 'Command'
  | 'LayoutDashboard'
  | 'BookOpen'
  | 'Fingerprint'
  | 'CalendarDays'
  | 'Users';

export const getSidebarData = async (p0: { email: string }) => {
  const supabase = await createClient();

  // 1️⃣ Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No authenticated user found:', userError);
    return null;
  }

  // 2️⃣ Get user profile
  const { data: userData } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .single();

  // 3️⃣ Fetch classes + relations
  const { data: classes, error } = await supabase
    .from('classes')
    .select(
      `
      id,
      subject_code,
      subject_name,
      course:courses(id, code, name),
      major:majors(id, code, name),
      year_level:year_levels(id, code, name),
      section:sections(id, code, name)
    `
    )
    .eq('user_id', user.id)
    .order('subject_code', { ascending: true });

  if (error)
    console.error('Error loading classes:', JSON.stringify(error, null, 2));

  // 4️⃣ Normalize relations
  const normalizedClasses =
    classes?.map((cls: any) => ({
      ...cls,
      major: Array.isArray(cls.major) ? cls.major[0] : cls.major,
      year_level: Array.isArray(cls.year_level)
        ? cls.year_level[0]
        : cls.year_level,
      section: Array.isArray(cls.section) ? cls.section[0] : cls.section,
    })) ?? [];

  // 5️⃣ Group by subject_code
  const grouped = normalizedClasses.reduce((acc: any, cls: any) => {
    const key = cls.subject_code;
    if (!acc[key]) {
      acc[key] = {
        subject_code: cls.subject_code,
        subject_name: cls.subject_name,
        id: cls.id,
        children: [],
      };
    }

    const displayName = `${cls.major?.code ?? ''} ${
      cls.year_level?.code ?? ''
    }${cls.section?.code ?? ''}`.trim();

    acc[key].children.push({
      title: displayName,
      url: `/classes/${cls.course.id}/${cls.major.id}/${cls.section.id}`,
    });

    return acc;
  }, {});

  // 6️⃣ Build sidebar class items
  const classItems = Object.values(grouped).map((cls: any) => ({
    title: cls.subject_code,
    url: `/classes/${cls.id}`,
    children: cls.children,
  }));

  // 7️⃣ Return sidebar structure
  return {
    user: {
      name: userData
        ? `${userData.first_name} ${userData.last_name}`
        : user.email,
      email: user.email,
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      { name: 'Faculty Portal', logo: 'GalleryVerticalEnd', plan: 'Academic' },
    ] as { name: string; logo: IconName; plan: string }[],
    navMain: [
      {
        group: 'Home',
        icon: 'LayoutDashboard',
        items: [
          { title: 'Dashboard', url: '/dashboard' },
          { title: 'My Classes', url: '/classes' },
          { title: 'Schedule', url: '/schedule' },
        ],
      },
      {
        group: 'Classes',
        icon: 'Users',
        items: classItems,
      },
      {
        group: 'Grades',
        icon: 'BookOpen',
        items: [
          { title: 'Raw Grade', url: '/grades/raw' },
          { title: 'Transmuted Grade', url: '/grades/transmuted' },
          { title: 'Reports', url: '/grades/reports' },
        ],
      },
      {
        group: 'Attendance',
        icon: 'Fingerprint',
        items: [
          { title: 'Daily Attendance', url: '/attendance/daily' },
          { title: 'Attendance Reports', url: '/attendance/reports' },
        ],
      },
      {
        group: 'Schedule',
        icon: 'CalendarDays',
        items: [
          { title: 'Class Schedule', url: '/schedule/classes' },
          { title: 'Exam Schedule', url: '/schedule/exams' },
        ],
      },
    ],
  };
};

export default getSidebarData;
