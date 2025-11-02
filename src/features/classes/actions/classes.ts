'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export interface Schedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export async function addClass(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData?.user;
  if (!user) {
    return { status: 'User not authenticated', classes: null };
  }

  // ✅ Parse schedule data (expecting JSON string from form)
  const schedules: Schedule[] = JSON.parse(formData.get('schedules') as string);

  const classData = {
    user_id: user.id,
    subject_code: formData.get('subject_code') as string,
    subject_name: formData.get('subject_name') as string,
    course_id: formData.get('course_id') as string,
    major_id: formData.get('major_id') as string,
    section_id: formData.get('section_id') as string,
    year_level_id: formData.get('year_level_id') as string,
    created_at: new Date().toISOString(),
  };

  console.log('Adding class:', classData);

  const { data: insertedClasses, error: classError } = await supabase
    .from('classes')
    .insert([classData])
    .select();

  if (classError || !insertedClasses?.length) {
    console.error('Error adding class:', classError);
    return { status: classError?.message ?? 'Insert failed', classes: null };
  }

  const insertedClass = insertedClasses[0];

  // ✅ Insert schedules for this class
  if (Array.isArray(schedules) && schedules.length > 0) {
    const scheduleInserts = schedules.map((sched) => ({
      class_id: insertedClass.id,
      day_of_week: sched.day_of_week,
      start_time: sched.start_time,
      end_time: sched.end_time,
    }));

    const { error: scheduleError } = await supabase
      .from('class_schedules')
      .insert(scheduleInserts);

    if (scheduleError) {
      console.error('Error inserting schedules:', scheduleError);
      return { status: scheduleError.message, classes: null };
    }
  }

  revalidatePath('/classes');
  return { status: 'success', classes: insertedClasses };
}

export async function deleteClass(classId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData?.user;
  if (!user) {
    return { status: 'User not authenticated', classes: null };
  }

  console.log('Deleting class with ID:', classId);

  const { error } = await supabase.from('classes').delete().eq('id', classId);

  if (error) {
    console.error('Error deleting class:', error);
    return { status: error.message, classes: null };
  }

  revalidatePath('/classes');
  return { status: 'success' };
}

export async function updateClass(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData?.user;
  if (!user) {
    return { status: 'User not authenticated', classes: null };
  }

  const classId = formData.get('id') as string;
  const schedules: Schedule[] = JSON.parse(formData.get('schedules') as string);

  const classData = {
    user_id: user.id,
    subject_code: formData.get('subject_code') as string,
    subject_name: formData.get('subject_name') as string,
    course_id: formData.get('course_id') as string,
    major_id: formData.get('major_id') as string,
    section_id: formData.get('section_id') as string,
    year_level_id: formData.get('year_level_id') as string,
    created_at: new Date().toISOString(),
  };

  console.log('Updating class with ID:', classId);

  const { data, error } = await supabase
    .from('classes')
    .update(classData)
    .eq('id', classId)
    .select();

  if (error) {
    console.error('Error updating class:', error);
    return { status: error.message, classes: null };
  }

  // ✅ Replace existing schedules
  await supabase.from('class_schedules').delete().eq('class_id', classId);

  if (Array.isArray(schedules) && schedules.length > 0) {
    const scheduleInserts = schedules.map((sched) => ({
      class_id: classId,
      day_of_week: sched.day_of_week,
      start_time: sched.start_time,
      end_time: sched.end_time,
    }));

    const { error: scheduleError } = await supabase
      .from('class_schedules')
      .insert(scheduleInserts);

    if (scheduleError) {
      console.error('Error updating schedules:', scheduleError);
      return { status: scheduleError.message, classes: null };
    }
  }

  revalidatePath('/classes');
  return { status: 'success', classes: data };
}
