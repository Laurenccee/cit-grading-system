import DataTableDemo from '@/features/grades/components/data-table';
import { createClient } from '@/utils/supabase/server';
import React from 'react';

export default async function GradesPage() {
  const supabase = await createClient();

  const { data: students } = await supabase.from('students').select('*');
  return (
    <div className="w-full mx-auto">
      <DataTableDemo data={students || []} />
    </div>
  );
}
