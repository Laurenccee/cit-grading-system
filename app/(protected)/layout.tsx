// app/(protected)/layout.tsx
import { createClient } from '@/utils/supabase/server';
import getSidebarData from '@/data/sidebar-data';
import { cache } from 'react';
import PersistentSidebarLayout from '@/features/(protected)/components/client-sidebar-layout';
import type { SidebarData } from '@/types/sidebar';

const getCachedSidebarData = cache(
  async (email: string): Promise<SidebarData | null> => {
    try {
      return await getSidebarData({ email });
    } catch (error) {
      console.error('Failed to fetch sidebar data:', error);
      return null;
    }
  }
);

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Redirect to login or show error
    throw new Error('User not authenticated');
  }

  const sidebarData = await getCachedSidebarData(user.email ?? '');

  if (!sidebarData) {
    throw new Error('Failed to load sidebar data');
  }

  return (
    <PersistentSidebarLayout sidebarData={sidebarData}>
      {children}
    </PersistentSidebarLayout>
  );
}
