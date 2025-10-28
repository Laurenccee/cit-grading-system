'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function addStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'User not authenticated', students: null };
  } else {
    const studentData = {
      student_id: formData.get('student_id') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      middle_name: formData.get('middle_name') as string,
      course: formData.get('course') as string,
      year_level: formData.get('year_level') as string,
      section: formData.get('section') as string,
      major: formData.get('major') as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log('Adding student with data:', studentData);
    const { data: students, error } = await supabase
      .from('students')
      .insert([studentData])
      .select();
    if (error) {
      return { status: error?.message, students: null };
    }
    revalidatePath('/students');
    return { status: 'success', students };
  }
}

export async function deleteStudent(student_id: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'User not authenticated', students: null };
  } else {
    console.log('Deleting student with ID:', student_id);
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('student_id', student_id);
    if (error) {
      return { status: error?.message, students: null };
    }
    revalidatePath('/students');
    return { status: 'success' };
  }
}

export async function updateStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'User not authenticated', students: null };
  } else {
    const student_id = formData.get('student_id') as string;
    const studentData = {
      student_id,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      middle_name: formData.get('middle_name') as string,
      course: formData.get('course') as string,
      year_level: formData.get('year_level') as string,
      section: formData.get('section') as string,
      major: formData.get('major') as string,
      updated_at: new Date().toISOString(),
    };
    console.log('Updating student with ID:', student_id);
    const { error } = await supabase
      .from('students')
      .update(studentData)
      .eq('student_id', student_id)
      .select();
    if (error) {
      return { status: error?.message, students: null };
    }
    revalidatePath('/students');
    return { status: 'success', students: [studentData] };
  }
}
