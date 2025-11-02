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
  AlertCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '../actions/auth';
import { useForm } from '@/hooks';
import { useLoadingContext } from '@/contexts/loading-context';
import type { LoginFormType } from '@/utils/validation';
import { validateFormData, LoginFormSchema } from '@/utils/validation';

/**
 * LoginForm Component with Hooks
 *
 * HOW THIS COMPONENT USES HOOKS:
 * ────────────────────────────────
 *
 * 1. useForm Hook:
 *    - Manages form state (email, password)
 *    - Tracks field validation errors
 *    - Provides handleChange and handleSubmit
 *    - Result: No need for multiple useState calls!
 *
 * 2. useLoadingContext Hook:
 *    - Gets global loading state
 *    - Shares loading state across components
 *    - No prop drilling needed
 *    - Result: Clean API loading state management!
 *
 * 3. useState Hook (custom):
 *    - Tracks form-specific error messages
 *
 * WHAT CHANGED FROM BEFORE:
 * ────────────────────────
 * Before: Manual state management (loading, error, email, password)
 * After: useForm hook handles all form state automatically!
 *
 * Before: No validation
 * After: Zod validation on submit with field-level error tracking!
 *
 * Before: No global loading state
 * After: LoadingProvider + useLoadingContext for app-wide loading state!
 */

export default function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');

  // Using the useLoadingContext hook to access global loading state
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  // Using the useForm hook (see src/hooks/index.ts for details)
  // This handles:
  // - Form values (email, password)
  // - Field-level validation errors
  // - Change handlers for inputs
  // - Submit handler
  const {
    values,
    errors,
    handleChange,
    handleSubmit: formHandleSubmit,
  } = useForm(
    {
      email: '',
      password: '',
    } as LoginFormType,
    async (data: LoginFormType): Promise<void> => {
      setSubmitError('');
      startLoading('login');

      try {
        // Validate before sending
        const validationResult = validateFormData(LoginFormSchema, data);
        if (!validationResult.success) {
          // Set field errors from validation result
          setSubmitError('Please fix the validation errors');
          return;
        }

        // Create FormData for server action
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);

        // Call server action
        const result = await signIn(formData);

        if (result.status === 'success') {
          router.push('/dashboard');
        } else {
          setSubmitError(result.status);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        setSubmitError(errorMessage);
      } finally {
        stopLoading('login');
      }
    }
  );

  // Wrapper for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await formHandleSubmit(e);
  };

  return (
    <Card className="w-full max-w-sm bg-transparent border-0 sm:border-2 sm:bg-card">
      <CardHeader>
        <CardTitle className="flex justify-center">Sign In</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CardContent className="flex flex-col gap-3">
          {/* Email Input with error display */}
          <div>
            <InputGroup>
              <InputGroupInput
                name="email"
                type="email"
                placeholder="Email"
                value={values.email}
                onChange={handleChange}
                disabled={isLoading('login')}
              />
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
            </InputGroup>
            {/* Display validation error if exists */}
            {errors.email && (
              <div className="flex items-center gap-2 mt-1 text-xs text-red-500">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Input with error display */}
          <div>
            <InputGroup>
              <InputGroupInput
                name="password"
                type="password"
                placeholder="Password (min 8 chars, uppercase, number)"
                value={values.password}
                onChange={handleChange}
                disabled={isLoading('login')}
              />
              <InputGroupAddon>
                <RectangleEllipsisIcon />
              </InputGroupAddon>
            </InputGroup>
            {/* Display validation error if exists */}
            {errors.password && (
              <div className="flex items-center gap-2 mt-1 text-xs text-red-500">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Display form-level errors */}
          {(submitError || errors.form) && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              <AlertCircle size={16} />
              <span>{submitError || errors.form}</span>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="flex w-full gap-1.5"
            disabled={isLoading('login')}
          >
            {isLoading('login') ? 'Signing In...' : 'Access Account'}
            {isLoading('login') ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ArrowRightIcon size={16} />
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
