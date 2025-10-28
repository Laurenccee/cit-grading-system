import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import BreadcrumbDynamic from '@/features/(protected)/components/breadcrumb-dynamic';
import { createClient } from '@/utils/supabase/server';
import getSidebarData from '@/data/sidebar-data';
import Search from '@/features/(protected)/components/search';
import { cache } from 'react';
import dynamic from 'next/dynamic';
import AppSidebarWrapper from '@/features/(protected)/components/appbar-wrapper';

// Import the sidebar dynamically — client only

const getCachedSidebarData = cache(async (email: string) => {
  return JSON.parse(JSON.stringify(await getSidebarData({ email })));
});

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sidebarData = await getCachedSidebarData(user?.email ?? '');

  return (
    <SidebarProvider>
      {/* Sidebar is client-only, but layout itself persists */}
      <AppSidebarWrapper sideBarData={sidebarData} />
      <SidebarInset>
        <header className="flex h-16.5 shrink-0 border-b-2 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <BreadcrumbDynamic sidebarData={sidebarData} />
          </div>
          <div className="flex items-center gap-2 px-4">
            <Search />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 ">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
