import { createClient } from '@/utils/supabase/server';
import { ROUTES } from '@/constants/config';
import type { SidebarData, UserProfile } from '@/types/sidebar';

interface SidebarDataParams {
  email: string;
}

/**
 * Fetch sidebar data for the authenticated user
 * Includes user profile, teams, and navigation structure with classes
 */
export const getSidebarData = async (
  params: SidebarDataParams
): Promise<SidebarData | null> => {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Auth error:', userError?.message || 'No authenticated user');
    throw new Error('User not authenticated');
  }

  // Get user profile
  const { data: userData } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .single();

  // Fetch classes with relationships
  const { data: classes = [], error: classError } = await supabase
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

  if (classError) {
    console.error('Error loading classes:', classError.message);
  }

  // Normalize class relationships (handle array responses)
  const normalizedClasses = (classes || []).map((cls: any) => ({
    ...cls,
    major: Array.isArray(cls.major) ? cls.major[0] : cls.major,
    year_level: Array.isArray(cls.year_level)
      ? cls.year_level[0]
      : cls.year_level,
    section: Array.isArray(cls.section) ? cls.section[0] : cls.section,
  }));

  // Group classes by subject code
  const classItemsBySubject = normalizedClasses.reduce((acc: any, cls: any) => {
    const key = cls.subject_code;

    if (!acc[key]) {
      acc[key] = {
        subject_code: cls.subject_code,
        subject_name: cls.subject_name,
        id: cls.id,
        children: [],
      };
    }

    const displayName = [
      cls.major?.code,
      cls.year_level?.code,
      cls.section?.code,
    ]
      .filter(Boolean)
      .join(' ');

    acc[key].children.push({
      title: displayName,
      url: `/classes/${cls.course.id}/${cls.major.id}/${cls.section.id}`,
    });

    return acc;
  }, {});

  // Build class items for sidebar
  const classItems = Object.values(classItemsBySubject).map((cls: any) => ({
    title: cls.subject_code,
    url: `/classes/${cls.id}`,
    children: cls.children,
  }));

  // Build and return sidebar data structure
  const sidebarData: SidebarData = {
    user: {
      id: user.id,
      name: userData
        ? `${userData.first_name} ${userData.last_name}`
        : user.email || 'User',
      email: user.email || '',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'Faculty Portal',
        logo: 'GalleryVerticalEnd',
        plan: 'Academic',
      },
    ],
    navMain: [
      {
        group: 'Home',
        icon: 'LayoutDashboard',
        items: [
          { title: 'Dashboard', url: ROUTES.PROTECTED.DASHBOARD },
          { title: 'My Classes', url: ROUTES.PROTECTED.CLASSES },
          { title: 'Schedule', url: ROUTES.PROTECTED.SCHEDULE },
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
          { title: 'Raw Grade', url: ROUTES.PROTECTED.GRADES.RAW },
          {
            title: 'Transmuted Grade',
            url: ROUTES.PROTECTED.GRADES.TRANSMUTED,
          },
          { title: 'Reports', url: ROUTES.PROTECTED.GRADES.REPORTS },
        ],
      },
      {
        group: 'Attendance',
        icon: 'Fingerprint',
        items: [
          { title: 'Daily Attendance', url: ROUTES.PROTECTED.ATTENDANCE.DAILY },
          {
            title: 'Attendance Reports',
            url: ROUTES.PROTECTED.ATTENDANCE.REPORTS,
          },
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

  return sidebarData;
};

export default getSidebarData;
