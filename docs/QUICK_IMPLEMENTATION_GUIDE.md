# Quick Implementation Guide - Top 5 Improvements

This file provides step-by-step implementation guides for the highest-impact improvements.

---

## #1 Error Boundary Component (2 hours)

### Step 1: Create the Error Boundary

Create `src/components/error-boundary.tsx`:

```typescript
'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error);
    console.error('Error info:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.handleReset) || (
          <Card className="m-4 border-red-500">
            <CardHeader className="flex flex-row items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>
                  The application encountered an unexpected error
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <details className="space-y-2 text-sm">
                <summary className="cursor-pointer font-medium">
                  Error details
                </summary>
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}
```

### Step 2: Add to Main Layout

Update `app/(protected)/layout.tsx`:

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="flex">
        {/* sidebar */}
        <main className="flex-1">{children}</main>
      </div>
    </ErrorBoundary>
  );
}
```

### Step 3: Test It

```typescript
// In a component to test
export function TestErrorComponent() {
  if (Math.random() > 0.9) {
    throw new Error('Random error for testing!');
  }
  return <div>No error</div>;
}
```

---

## #2 Input Validation with Zod (4 hours)

### Step 1: Install Zod

```bash
npm install zod
```

### Step 2: Create Validation Schemas

Create `src/utils/validation.ts`:

```typescript
import { z } from 'zod';
import { isValidEmail } from '@/utils/helpers';

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;

// ============================================================================
// CLASSES
// ============================================================================

export const ClassFormSchema = z.object({
  subject_code: z
    .string()
    .min(1, 'Subject code is required')
    .max(10, 'Subject code must be 10 characters or less'),
  subject_name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be 100 characters or less'),
  course_id: z.string().uuid('Invalid course').min(1, 'Course is required'),
  major_id: z.string().uuid('Invalid major').min(1, 'Major is required'),
  section_id: z.string().uuid('Invalid section').min(1, 'Section is required'),
  year_level_id: z
    .string()
    .uuid('Invalid year level')
    .min(1, 'Year level is required'),
});

export type ClassFormType = z.infer<typeof ClassFormSchema>;

// ============================================================================
// GRADES
// ============================================================================

export const GradeSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  score: z
    .number()
    .min(0, 'Score cannot be less than 0')
    .max(100, 'Score cannot exceed 100'),
  grade: z
    .enum(['A', 'B', 'C', 'D', 'F'], {
      errorMap: () => ({ message: 'Invalid grade' }),
    })
    .optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type GradeType = z.infer<typeof GradeSchema>;

// ============================================================================
// ATTENDANCE
// ============================================================================

export const AttendanceSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  date: z.date().or(z.string().datetime()),
  status: z.enum(['present', 'absent', 'late', 'excused'], {
    errorMap: () => ({ message: 'Invalid attendance status' }),
  }),
  notes: z.string().optional(),
});

export type AttendanceType = z.infer<typeof AttendanceSchema>;

// ============================================================================
// HELPER FUNCTION FOR FORM VALIDATION
// ============================================================================

/**
 * Validate form data and return typed data or errors
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });

  return { success: false, errors };
}
```

### Step 3: Update Login Form

Update `src/features/login/components/loginForm.tsx`:

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { signIn } from '../actions/auth';
import { LoginFormSchema, validateFormData } from '@/utils/validation';

export default function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate input
    const validation = validateFormData(LoginFormSchema, { email, password });

    if (!validation.success) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // All validated, proceed to sign in
    const result = await signIn(new FormData());
    const fd = new FormData();
    fd.append('email', validation.data.email);
    fd.append('password', validation.data.password);

    const signInResult = await signIn(fd);

    if (signInResult.status === 'success') {
      router.push('/dashboard');
    } else {
      setGeneralError(signInResult.status);
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-sm bg-transparent border-0 sm:border-2 sm:bg-card">
      <CardHeader>
        <CardTitle className="flex justify-center">Sign In</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CardContent className="flex flex-col gap-2.5">
          {/* General Error Alert */}
          {generalError && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <InputGroup>
              <InputGroupInput
                name="email"
                type="email"
                placeholder="Email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
            </InputGroup>
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <InputGroup>
              <InputGroupInput
                name="password"
                type="password"
                placeholder="Password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
              />
              <InputGroupAddon>
                <RectangleEllipsisIcon />
              </InputGroupAddon>
            </InputGroup>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="flex w-full gap-1.5"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Access Account'}
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <ArrowRightIcon className="h-4 w-4" />
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

---

## #3 Result Type Pattern (2 hours)

### Step 1: Create Result Type

Create `src/types/result.ts`:

```typescript
/**
 * Result type for handling success/error cases
 */

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create a successful result
 */
export const Ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

/**
 * Create an error result
 */
export const Err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Check if result is successful
 */
export const isOk = <T, E>(
  result: Result<T, E>
): result is { success: true; data: T } => {
  return result.success === true;
};

/**
 * Check if result is error
 */
export const isErr = <T, E>(
  result: Result<T, E>
): result is { success: false; error: E } => {
  return result.success === false;
};

/**
 * Map over success value
 */
export const mapOk = <T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  return isOk(result) ? Ok(fn(result.data)) : result;
};

/**
 * Flat map over success value
 */
export const flatMapOk = <T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  return isOk(result) ? fn(result.data) : result;
};

/**
 * Get the value or return a default
 */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return isOk(result) ? result.data : defaultValue;
};
```

### Step 2: Update Server Actions

Update `src/features/login/actions/auth.ts`:

```typescript
'use server';

import { createClient } from '@/utils/supabase/server';
import { Ok, Err, Result } from '@/types/result';

interface AuthError {
  code: string;
  message: string;
}

interface AuthSuccess {
  user: {
    id: string;
    email: string;
  };
}

export async function signIn(
  formData: FormData
): Promise<Result<AuthSuccess, AuthError>> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return Err({
        code: 'INVALID_INPUT',
        message: 'Email and password are required',
      });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return Err({
        code: error.code || 'AUTH_ERROR',
        message: error.message,
      });
    }

    if (!data.user) {
      return Err({
        code: 'AUTH_FAILED',
        message: 'Authentication failed',
      });
    }

    return Ok({
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return Err({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
}
```

### Step 3: Use in Components

```typescript
import { isOk, getOrElse } from '@/types/result';

const result = await signIn(formData);

if (isOk(result)) {
  console.log('User:', result.data.user.email);
  router.push('/dashboard');
} else {
  console.error('Error:', result.error.message);
  setError(result.error.message);
}
```

---

## #4 Loading State Provider (3 hours)

### Step 1: Create Context

Create `src/contexts/loading-context.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  loading: Record<string, boolean>;
  setLoading: (key: string, value: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoadingState] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, value: boolean) => {
    setLoadingState((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  };

  const startLoading = (key: string) => setLoading(key, true);
  const stopLoading = (key: string) => setLoading(key, false);
  const isLoading = (key: string) => loading[key] || false;

  return (
    <LoadingContext.Provider
      value={{ loading, setLoading, startLoading, stopLoading, isLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(key: string) {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }

  return {
    isLoading: context.isLoading(key),
    setLoading: (value: boolean) => context.setLoading(key, value),
    startLoading: () => context.startLoading(key),
    stopLoading: () => context.stopLoading(key),
  };
}
```

### Step 2: Add to Root Layout

Update `app/layout.tsx`:

```typescript
import { LoadingProvider } from '@/contexts/loading-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
```

### Step 3: Use in Components

```typescript
'use client';

import { useLoading } from '@/contexts/loading-context';

export function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading('my-action');

  const handleClick = async () => {
    startLoading();
    try {
      await someAsyncAction();
    } finally {
      stopLoading();
    }
  };

  return (
    <button disabled={isLoading} onClick={handleClick}>
      {isLoading ? 'Loading...' : 'Click me'}
    </button>
  );
}
```

---

## #5 Enhanced Utility Functions (2 hours)

### Update `src/utils/helpers.ts`

Add these new utilities:

```typescript
/**
 * Debounce a function - delays execution
 */
export const debounce = <Args extends any[]>(
  fn: (...args: Args) => void,
  delay: number
): ((...args: Args) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function - limits execution frequency
 */
export const throttle = <Args extends any[]>(
  fn: (...args: Args) => void,
  delay: number
): ((...args: Args) => void) => {
  let lastRun = 0;
  return (...args: Args) => {
    const now = Date.now();
    if (now - lastRun >= delay) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * Format date to readable string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (
  date: Date | string,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is strong
 */
export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  );
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Clone object deeply
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
```

---

## 🚀 Implementation Order

1. **First (Week 1):** Error Boundary

   - Provides immediate error handling
   - No dependencies on other improvements

2. **Second (Week 2):** Validation with Zod

   - Improves data quality
   - Works independently

3. **Third (Week 2):** Result Type

   - Refactor existing functions
   - Use with validation

4. **Fourth (Week 3):** Loading Provider

   - Clean up component state
   - Integrate with existing components

5. **Fifth (Week 4):** Enhanced Utilities
   - Add as needed
   - Low priority

---

## ✅ Testing Each Improvement

### Error Boundary Testing

```bash
# Wrap a test component that throws
# <ErrorBoundary><TestThrow /></ErrorBoundary>
# Should show error card instead of white screen
```

### Validation Testing

```typescript
// Test with invalid data
const result = validateFormData(LoginFormSchema, {
  email: 'invalid',
  password: 'weak',
});
// Should return errors object
```

### Result Type Testing

```typescript
const result = await signIn(formData);
if (isOk(result)) {
  // Success path
} else {
  // Error path
}
```

---

## 📚 Total Effort Summary

| Improvement      | Setup           | Integration | Testing |
| ---------------- | --------------- | ----------- | ------- |
| Error Boundary   | 1h              | 1h          | 0.5h    |
| Validation       | 1h              | 2h          | 1h      |
| Result Type      | 1h              | 1h          | 0.5h    |
| Loading Provider | 1.5h            | 1.5h        | 0.5h    |
| Enhanced Utils   | 1h              | 0.5h        | 0.5h    |
| **TOTAL**        | **5.5h**        | **6h**      | **3h**  |
| **OVERALL**      | **~14.5 hours** |

---

## 💡 Pro Tips

1. **Commit after each improvement** - Makes rollback easy
2. **Test in isolation first** - Before integrating
3. **Update documentation** - As you implement
4. **Use TypeScript strict mode** - Catches more errors
5. **Run ESLint** - Before committing

```bash
npm run lint
npm run build
npm run test  # when available
```

---

**Ready to start? Begin with Error Boundary! 🎯**
