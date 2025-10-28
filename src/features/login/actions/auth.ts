'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  console.log('Login attempt with:', credentials);
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { status: error?.message, user: null };
  }

  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', credentials?.email)
    .limit(1)
    .single();
  if (!existingUser) {
    const { data: user } = await supabase.from('user_profiles').insert({
      email: credentials.email,
      first_name: '',
      last_name: '',
      created_at: new Date().toISOString(),
    });
  }

  revalidatePath('/', 'layout');
  return { status: 'success', user: data.user };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect('/error');
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
