'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  ArrowRightIcon,
  Loader2,
  RectangleEllipsisIcon,
  UserIcon,
} from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '../actions/auth';

export default function LoginForm() {
  const [error, setError] = React.useState('');
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    console.log('Login result:', result);

    if (result.status === 'success') {
      router.push('/dashboard');
    } else {
      setError(result.status);
    }

    setLoading(false);
  };
  return (
    <Card className="w-full max-w-sm bg-transparent border-0 sm:border-2 sm:bg-card">
      <CardHeader>
        <CardTitle className="flex justify-center">Sign Up</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CardContent className="flex flex-col gap-2.5">
          <InputGroup>
            <InputGroupInput name="email" placeholder="Email" />
            <InputGroupAddon>
              <UserIcon />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              name="password"
              type="password"
              placeholder="Password"
            />
            <InputGroupAddon>
              <RectangleEllipsisIcon />
            </InputGroupAddon>
          </InputGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="flex gap-1.5" disabled={loading}>
            {loading ? 'Loading' : 'Access Account'}
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ArrowRightIcon />
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
