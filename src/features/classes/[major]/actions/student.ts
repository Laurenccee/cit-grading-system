'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function addStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) {
    return { status: 'User not authenticated', students: null };
  }

  const classId = formData.get('class_id') as string;
  const studentCode = formData.get('student_id') as string;

  // Step 1️⃣: Check if student already exists
  const { data: existingStudent, error: fetchError } = await supabase
    .from('students')
    .select('id')
    .eq('student_id', studentCode)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking student existence:', fetchError.message);
    return { status: fetchError.message, students: null };
  }

  let studentId: string;

  if (existingStudent) {
    // ✅ Student already exists
    studentId = existingStudent.id;
    console.log(`Student already exists with ID: ${studentId}`);
  } else {
    // ✅ Student does not exist — insert new record
    const studentData = {
      user_id: user.user.id,
      student_id: studentCode,
      first_name: formData.get('first_name') as string,
      middle_name: formData.get('middle_name') as string | null,
      last_name: formData.get('last_name') as string,
    };

    const { data: insertedStudents, error: insertError } = await supabase
      .from('students')
      .insert([studentData])
      .select();

    if (insertError || !insertedStudents?.length) {
      console.error('Error inserting student:', insertError?.message);
      return {
        status: insertError?.message || 'Failed to insert student',
        students: null,
      };
    }

    studentId = insertedStudents[0].id;
  }

  // Step 2️⃣: Enroll student into class (avoid duplicate enrollment)
  const { data: existingEnrollment } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (!existingEnrollment) {
    const { error: enrollError } = await supabase
      .from('class_enrollments')
      .insert([{ class_id: classId, student_id: studentId }]);

    if (enrollError) {
      console.error('Error enrolling student:', enrollError.message);
    }
  }

  revalidatePath('/classes');
  return { status: 'success', students: [{ id: studentId }] };
}

export async function deleteStudent(student_id: string, class_id: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) {
    return { status: 'User not authenticated', students: null };
  }

  console.log(`Deleting student ${student_id} from class ${class_id}`);

  // Step 1️⃣: Get UUID of student
  const { data: student, error: fetchError } = await supabase
    .from('students')
    .select('id')
    .eq('student_id', student_id)
    .maybeSingle();

  if (fetchError || !student) {
    console.error('Error finding student:', fetchError?.message);
    return { status: 'Student not found', students: null };
  }

  const studentUUID = student.id;

  // Step 2️⃣: Unenroll from this class
  const { error: unenrollError } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('class_id', class_id)
    .eq('student_id', studentUUID);

  if (unenrollError) {
    console.error('Error unenrolling student:', unenrollError.message);
    return { status: unenrollError.message, students: null };
  }

  // Step 3️⃣: Check if the student is enrolled in any other class
  const { data: stillEnrolled, error: checkError } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('student_id', studentUUID);

  if (checkError) {
    console.error('Error checking other enrollments:', checkError.message);
    return { status: checkError.message, students: null };
  }

  // Step 4️⃣: Delete student record only if no more enrollments exist
  if (!stillEnrolled || stillEnrolled.length === 0) {
    const { error: deleteStudentError } = await supabase
      .from('students')
      .delete()
      .eq('id', studentUUID);

    if (deleteStudentError) {
      console.error(
        'Error deleting student record:',
        deleteStudentError.message
      );
      return { status: deleteStudentError.message, students: null };
    }

    console.log(`🧹 Student ${student_id} fully removed (no more classes).`);
  } else {
    console.log(
      `✅ Student ${student_id} unenrolled from class but still in ${stillEnrolled.length} other class(es).`
    );
  }

  revalidatePath('/classes');
  return { status: 'success' };
}

export async function updateStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) {
    return { status: 'User not authenticated', students: null };
  }

  const student_id = formData.get('student_id') as string;

  const studentData = {
    first_name: formData.get('first_name') as string,
    middle_name: formData.get('middle_name') as string | null,
    last_name: formData.get('last_name') as string,
  };

  console.log('Updating student with ID:', student_id);

  const { data: updated, error } = await supabase
    .from('students')
    .update(studentData)
    .eq('student_id', student_id)
    .select();

  if (error) {
    console.error('Error updating student:', error.message);
    return { status: error.message, students: null };
  }

  revalidatePath('/students');
  return { status: 'success', students: updated };
}
