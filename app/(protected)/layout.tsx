// app/(protected)/layout.tsx
import { createClient } from '@/utils/supabase/server';
import getSidebarData from '@/data/sidebar-data';
import { cache } from 'react';
import PersistentSidebarLayout from '@/features/(protected)/components/client-sidebar-layout';

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

  if (!user) {
  }

  const sidebarData = await getCachedSidebarData(user?.email ?? '');

  return (
    <PersistentSidebarLayout sidebarData={sidebarData}>
      {children}
    </PersistentSidebarLayout>
  );
}
