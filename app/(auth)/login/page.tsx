import LoginForm from '@/features/login/components/loginForm';
import React from 'react';

export default function LoginPage() {
  return (
    <>
      <div className=" bg-white flex w-full flex-col items-center justify-center h-screen">
        <LoginForm />
      </div>
    </>
  );
}
