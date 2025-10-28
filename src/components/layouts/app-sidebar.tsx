'use client';

import {
  Loader2,
  BadgeCheck,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Plus,
  Sparkles,
} from 'lucide-react';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { signOut } from '@/features/login/actions/auth';

import {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  LayoutDashboard,
  BookOpen,
  Fingerprint,
  CalendarDays,
  Users,
} from 'lucide-react';

const iconMap = {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  LayoutDashboard,
  BookOpen,
  Fingerprint,
  CalendarDays,
  Users,
};

export function AppSidebar({ sideBarData }: { sideBarData: any }) {
  const { isMobile } = useSidebar();
  const data = sideBarData;
  // Defensive: ensure data is a plain object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Loader2 className="animate-spin mx-auto my-8" />
        </SidebarHeader>
      </Sidebar>
    );
  }
  // Defensive: ensure teams is an array
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const [activeTeam, setActiveTeam] = React.useState(
    teams.length > 0 ? teams[0] : null
  );
  const [loading, setLoading] = React.useState(false);

  // Fallback for missing user/email
  const displayName = data?.user?.name || 'User';
  const displayEmail = data?.user?.email || 'No email';

  async function handleSignOut(event: React.MouseEvent) {
    event?.preventDefault();
    setLoading(true);
    await signOut();
    setLoading(false);
  }

  if (!activeTeam) {
    return null;
  }

  // When rendering logo:

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-visible:ring-0" asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-main data-[state=open]:text-main-foreground data-[state=open]:outline-border data-[state=open]:outline-2"
                >
                  <div className="flex aspect-square size-8 items-center justify-center ">
                    {activeTeam.logo &&
                      React.createElement(
                        iconMap[activeTeam.logo as keyof typeof iconMap],
                        {
                          className: 'size-4',
                        }
                      )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-heading">
                      {activeTeam.name}
                    </span>
                    <span className="truncate text-xs">{activeTeam.plan}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="start"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-sm font-heading">
                  Teams
                </DropdownMenuLabel>
                {data.teams.map((team: any, index: number) => (
                  <DropdownMenuItem
                    key={team.name}
                    onClick={() => setActiveTeam(team)}
                    className="gap-2 p-1.5"
                  >
                    <div className="flex size-6 items-center justify-center">
                      {React.createElement(
                        iconMap[team.logo as keyof typeof iconMap],
                        {
                          className: 'size-4 shrink-0',
                        }
                      )}
                    </div>
                    {team.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-1.5">
                  <div className="flex size-6 items-center justify-center">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-base">Add team</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((section: any) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            <SidebarMenu>
              {section.group === 'Classes'
                ? section.items?.map((item: any) => (
                    <Collapsible
                      key={item.title}
                      defaultOpen={false}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground"
                            tooltip={item.title}
                          >
                            {React.createElement(
                              iconMap[section.icon as keyof typeof iconMap],
                              {
                                className: 'mr-2 size-4',
                              }
                            )}

                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {'children' in item &&
                              item.children.map(
                                (subItem: { title: string; url: string }) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                      <a href={subItem.url}>
                                        <span>{subItem.title}</span>
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))
                : section.items?.map((item: any) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          {section.icon &&
                            React.createElement(
                              iconMap[section.icon as keyof typeof iconMap],
                              {
                                className: 'mr-2 size-4',
                              }
                            )}

                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="group-data-[state=collapsed]:hover:outline-0 group-data-[state=collapsed]:hover:bg-transparent overflow-visible"
                  size="lg"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://github.com/shadcn.png?size=40"
                      alt="CN"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-heading">{displayName}</span>
                    <span className="truncate text-xs">{displayEmail}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-base">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="https://github.com/shadcn.png?size=40"
                        alt="CN"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-heading">
                        {displayName}
                      </span>
                      <span className="truncate text-xs">{displayEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={loading} onClick={handleSignOut}>
                  {loading ? <Loader2 /> : <LogOut />}
                  {loading ? 'Logging out...' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
