// src/types/sidebar.ts
export type UserProfile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
};

export type Team = {
  name: string;
  logo: React.ComponentType<any>;
  plan: string;
};

export type SidebarClassItem = {
  title: string;
  url: string;
  children?: SidebarClassItem[];
};

export type SidebarGroup = {
  group: string;
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  items: SidebarClassItem[];
};

export type SidebarData = {
  user: UserProfile;
  teams: Team[];
  navMain: SidebarGroup[];
};
