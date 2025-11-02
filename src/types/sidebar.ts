import { LucideIcon } from 'lucide-react';

/** Icon name for serialization across server/client boundary */
export type IconName =
  | 'GalleryVerticalEnd'
  | 'AudioWaveform'
  | 'Command'
  | 'LayoutDashboard'
  | 'BookOpen'
  | 'Fingerprint'
  | 'CalendarDays'
  | 'Users';

/** User profile information */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

/** Team/Organization information */
export interface Team {
  name: string;
  logo: IconName;
  plan: string;
}

/** Navigation item (can be nested) */
export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: IconName;
  children?: SidebarNavItem[];
}

/** Navigation group containing items */
export interface SidebarGroup {
  group: string;
  icon?: IconName;
  items: SidebarNavItem[];
}

/** Complete sidebar data structure */
export interface SidebarData {
  user: UserProfile;
  teams: Team[];
  navMain: SidebarGroup[];
}

// Alias for backwards compatibility
export type SidebarTeam = Team;
