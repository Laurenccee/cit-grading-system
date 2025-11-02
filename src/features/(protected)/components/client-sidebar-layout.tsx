// features/(protected)/components/persistent-sidebar.tsx
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useState } from 'react';
import BreadcrumbDynamic from '@/features/(protected)/components/breadcrumb-dynamic';
import Search from '@/features/(protected)/components/search';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layouts/app-sidebar';

export default function PersistentSidebarLayout({
  children,
  sidebarData,
}: {
  children: React.ReactNode;
  sidebarData: any;
}) {
  const [data] = useState(sidebarData); // ✅ Keep data stable after hydration

  return (
    <SidebarProvider>
      <AppSidebar sideBarData={data} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16.5 shrink-0 border-b-2 items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <BreadcrumbDynamic sidebarData={data} />
          </div>
          <div className="flex items-center gap-2 px-4">
            <Search />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
