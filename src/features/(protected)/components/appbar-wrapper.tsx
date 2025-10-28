'use client';

import dynamic from 'next/dynamic';

// dynamically import the sidebar client-only
const AppSidebar = dynamic(() =>
  import('@/components/layouts/app-sidebar').then((m) => m.AppSidebar)
);

export default function AppSidebarWrapper({
  sideBarData,
}: {
  sideBarData: any;
}) {
  return <AppSidebar sideBarData={sideBarData} />;
}
