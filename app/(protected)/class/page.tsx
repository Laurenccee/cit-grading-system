import StudentTable from '@/features/students/components/class-table';
import { createClient } from '@/utils/supabase/server';
import React from 'react';

export default async function StudentPage() {
  const supabase = await createClient();

  const { data: students } = await supabase.from('students').select('*');
  return (
    <>
      <StudentTable data={students || []} />
    </>
  );
}
