import { UserProfile } from '@/types/sidebar';
import { createClient } from '@/utils/supabase/server';

// ✅ Define allowable icon names manually
type IconName =
  | 'GalleryVerticalEnd'
  | 'AudioWaveform'
  | 'Command'
  | 'LayoutDashboard'
  | 'BookOpen'
  | 'Fingerprint'
  | 'CalendarDays'
  | 'Users';

const getSidebarData = async (user: UserProfile) => {
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('email', user.email)
    .single();

  return {
    user: {
      name: userData ? `${userData.first_name} ${userData.last_name}` : '',
      email: user.email,
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      { name: 'Acme Inc', logo: 'GalleryVerticalEnd', plan: 'Enterprise' },
      { name: 'Acme Corp.', logo: 'AudioWaveform', plan: 'Startup' },
      { name: 'Evil Corp.', logo: 'Command', plan: 'Free' },
    ] as { name: string; logo: IconName; plan: string }[],
    navMain: [
      {
        group: 'Home',
        title: 'Dashboard',
        url: '/dashboard',
        icon: 'LayoutDashboard',
        isActive: true,
        items: [
          { title: 'Dashboard', url: '/dashboard' },
          { title: 'Class', icon: 'Users', url: '/class' },
          { title: 'Schedule', icon: 'Users', url: '/schedule' },
        ],
      },
      {
        group: 'Grades',
        title: 'Grades',
        url: '/grades',
        icon: 'BookOpen',
        isActive: true,
        items: [
          { title: 'Raw Grade', url: '/raw-grades' },
          { title: 'Transmutated Grade', url: '/transmutated-grades' },
          { title: 'Reports', url: '/reports' },
        ],
      },
      {
        group: 'Attendance',
        title: 'Attendance',
        url: '/attendance',
        icon: 'Fingerprint',
        items: [
          { title: 'Daily Attendance', url: '/attendance' },
          { title: 'Attendance Reports', url: '/attendance/reports' },
        ],
      },
      {
        group: 'Schedule',
        title: 'Schedule',
        url: '/schedule',
        icon: 'CalendarDays',
        items: [
          { title: 'Class Schedule', url: '/schedule/classes' },
          { title: 'Exam Schedule', url: '/schedule/exams' },
        ],
      },
      {
        group: 'Classes',
        title: 'Classes',
        url: '/classes',
        icon: 'Users',
        items: [
          {
            title: 'CC 104',
            url: '/classes/cc104',
            children: [
              { title: 'IST 1A', url: '/classes/cc104/ist-1a' },
              { title: 'SMBPO 1A', url: '/classes/cc104/smbpo-1a' },
              { title: 'HN 1A', url: '/classes/cc104/hn-1a' },
            ],
          },
          {
            title: 'ELIE',
            url: '/classes/smbpo-1a',
            children: [
              { title: 'AFT 1A', url: '/classes/smbpo-1a/aft-1a' },
              { title: 'BCWT 1A', url: '/classes/smbpo-1a/bcwt-1a' },
            ],
          },
          {
            title: 'ACIT',
            url: '/classes/ist-b1',
            children: [{ title: 'CLT 1A', url: '/students/clt-1a' }],
          },
        ],
      },
    ],
  };
};

export default getSidebarData;
