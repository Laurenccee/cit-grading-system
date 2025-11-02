# 🚀 Quick Reference - React Hooks & Context

## 📁 File Locations

| What                | Where                                         |
| ------------------- | --------------------------------------------- |
| Custom Hooks        | `src/hooks/index.ts`                          |
| Loading Context     | `src/contexts/loading-context.tsx`            |
| Error Boundary      | `src/components/error-boundary.tsx`           |
| Validation Schemas  | `src/utils/validation.ts`                     |
| Result Type         | `src/types/result.ts`                         |
| LoginForm (Example) | `src/features/login/components/loginForm.tsx` |

---

## 🪝 The 8 Custom Hooks

### 1. useForm - Form State Management

```typescript
const { values, errors, handleChange, handleSubmit, isLoading, resetForm } =
  useForm(
    { email: '', password: '' }, // Initial values
    async (data) => {
      return await submitForm(data); // Submission handler
    }
  );

// In JSX:
<input name="email" value={values.email} onChange={handleChange} />;
{
  errors.email && <span>{errors.email}</span>;
}
<button onClick={handleSubmit} disabled={isLoading}>
  Submit
</button>;
```

### 2. useAsync - Load Data from API

```typescript
const { data, loading, error, execute } = useAsync(
  async () => await fetchUsers(), // Async function
  true // Run immediately?
);

// Run manually:
<button onClick={() => execute()}>Load</button>;

// In JSX:
{
  loading && <p>Loading...</p>;
}
{
  error && <p>Error: {error}</p>;
}
{
  data && data.map((item) => <div key={item.id}>{item.name}</div>);
}
```

### 3. useDebounce - Delay Value Changes

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedTerm = useDebounce(searchTerm, 500); // 500ms delay

useEffect(() => {
  if (debouncedTerm) {
    searchUsers(debouncedTerm); // Only runs after 500ms
  }
}, [debouncedTerm]);

// In JSX:
<input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
```

### 4. useLocalStorage - Persist to Browser

```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');

// Gets saved to localStorage automatically
setTheme('dark'); // Also saves to storage

// In JSX:
<button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
  Toggle
</button>;
```

### 5. useLoading - Track Loading States

```typescript
const { isLoading, startLoading, stopLoading } = useLoading('search');

// Use in your code:
startLoading();
await someOperation();
stopLoading();

// Check state:
if (isLoading()) {
  /* loading */
}
```

### 6. useWindowSize - Responsive Layout

```typescript
const { width, height, isMobile, isTablet, isDesktop } = useWindowSize();

// In JSX:
{
  isMobile ? <MobileMenu /> : <DesktopMenu />;
}
<p>
  Window size: {width}x{height}
</p>;
```

### 7. useTimeout - Delayed Execution

```typescript
const { clear, reset } = useTimeout(() => {
  console.log('Runs after 2 seconds');
}, 2000);

// In JSX:
<button onClick={clear}>Cancel</button>
<button onClick={reset}>Restart</button>
```

### 8. usePrevious - Track Previous Value

```typescript
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);

// In JSX:
<p>
  Now: {count}, Before: {prevCount}
</p>;
```

---

## 🌐 Context for Global State

### Loading Context

```typescript
// Already wrapped in app/layout.tsx, so just use:
import { useLoadingContext } from '@/contexts/loading-context';

export function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  const handleClick = async () => {
    startLoading('myOperation');
    await doSomething();
    stopLoading('myOperation');
  };

  return <button disabled={isLoading('myOperation')}>Do Something</button>;
}
```

### Alternative Convenience Hooks

```typescript
// Check if loading
const isLoading = useIsLoading('login');

// Get convenient methods
const { isLoading, start, stop, toggle } = useLoadingState('login');
```

---

## ✔️ Validation with Zod

### Available Schemas

```typescript
import {
  LoginFormSchema, // email + password
  ClassFormSchema, // class fields
  GradeSchema, // grade fields
  AttendanceSchema, // attendance fields
  validateFormData, // Helper function
} from '@/utils/validation';

// Validate single value:
const result = validateFormData(data, 'login');
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error);
}
```

### Strong Password Requirements

```
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one number (0-9)

Example: MyPassword1 ✅
Example: mypassword1 ❌ (no uppercase)
```

---

## 🎯 Common Patterns

### Pattern: Form with Validation

```typescript
'use client';

import { useForm } from '@/hooks';
import { useLoadingContext } from '@/contexts/loading-context';

export function SignupForm() {
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '', name: '' },
    async (data) => {
      startLoading('signup');
      try {
        return await createUser(data);
      } finally {
        stopLoading('signup');
      }
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={values.name} onChange={handleChange} />
      {errors.name && <span>{errors.name}</span>}

      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}

      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
      />
      {errors.password && <span>{errors.password}</span>}

      <button disabled={isLoading('signup')}>
        {isLoading('signup') ? 'Creating...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Pattern: Search with Debounce

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDebounce, useAsync } from '@/hooks';

export function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);

  const { data: results, loading } = useAsync(async () => {
    if (!debouncedTerm) return { success: true, data: [] };
    return await searchUsersAPI(debouncedTerm);
  }, false);

  useEffect(() => {
    // Triggered 500ms after user stops typing
  }, [debouncedTerm]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Searching...</p>}
      {results?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Pattern: Data Table with Loading

```typescript
'use client';

import { useAsync } from '@/hooks';

export function UsersTable() {
  const {
    data: users,
    loading,
    error,
    execute,
  } = useAsync(async () => await fetchUsers(), true);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {users?.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🎓 Learning Resources in Your Project

### Read These Files to Understand Hooks

1. **Start Here**: `HOOKS_IMPLEMENTATION_GUIDE.md`

   - Complete explanation of hooks
   - Why they exist
   - How to use each one
   - Examples for each hook

2. **See Examples**: `src/features/login/components/loginForm.tsx`

   - Real working example
   - Shows useForm + useLoadingContext
   - Shows validation integration

3. **Understand Patterns**: Read source code comments in:
   - `src/hooks/index.ts`
   - `src/contexts/loading-context.tsx`

---

## ⚠️ Common Mistakes

❌ **Calling hooks conditionally**

```typescript
// WRONG
if (condition) {
  const [state, setState] = useState(0);
}

// RIGHT
const [state, setState] = useState(0);
if (condition) {
  // Use state here
}
```

❌ **Calling hooks outside components**

```typescript
// WRONG
const result = useForm(...);  // Error! Not in a component

function MyComponent() {
  return <div>{result}</div>;
}

// RIGHT
function MyComponent() {
  const result = useForm(...);
  return <div>{result}</div>;
}
```

❌ **Forgetting 'use client' in client components**

```typescript
// WRONG (in Client Component)
import { useForm } from '@/hooks'; // Error! Need 'use client'

// RIGHT
('use client');
import { useForm } from '@/hooks';
```

---

## 📊 Component Integration Checklist

When adding hooks to a new component, do this:

- [ ] Add `'use client'` directive at top
- [ ] Import needed hooks from `@/hooks`
- [ ] Import `useLoadingContext` if needed
- [ ] Create form/data with hooks
- [ ] Add error displays
- [ ] Add loading indicators
- [ ] Test in browser

---

## 🔗 Import Cheat Sheet

```typescript
// Hooks
import {
  useForm,
  useAsync,
  useDebounce,
  useLocalStorage,
  useLoading,
  useWindowSize,
  useTimeout,
  usePrevious,
} from '@/hooks';

// Context
import {
  useLoadingContext,
  useIsLoading,
  useLoadingState,
  LoadingProvider,
} from '@/contexts/loading-context';

// Error Boundary
import { ErrorBoundary } from '@/components/error-boundary';

// Validation
import {
  validateFormData,
  LoginFormSchema,
  ClassFormSchema,
  GradeSchema,
  AttendanceSchema,
  type LoginFormType,
  type ClassFormType,
  type GradeType,
  type AttendanceType,
} from '@/utils/validation';

// Result Type
import type { Result } from '@/types/result';
import { Ok, Err, isOk, isErr } from '@/types/result';
```

---

## 🚀 Quick Start - New Form Component

Copy this template for any new form:

```typescript
'use client';

import { useForm } from '@/hooks';
import { useLoadingContext } from '@/contexts/loading-context';

export function MyForm() {
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      field1: '',
      field2: '',
    },
    async (data) => {
      startLoading('myform');
      try {
        return await submitAPI(data);
      } finally {
        stopLoading('myform');
      }
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="field1"
        value={values.field1}
        onChange={handleChange}
        disabled={isLoading('myform')}
      />
      {errors.field1 && <span>{errors.field1}</span>}

      <input
        name="field2"
        value={values.field2}
        onChange={handleChange}
        disabled={isLoading('myform')}
      />
      {errors.field2 && <span>{errors.field2}</span>}

      <button disabled={isLoading('myform')}>
        {isLoading('myform') ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## 📚 Further Learning

### Concepts Covered

- React Hooks fundamentals
- Custom hooks patterns
- Context API
- Form handling
- Validation
- Error handling
- Global state management
- Best practices

### By Using This Code, You're Learning

- Modern React patterns
- TypeScript best practices
- Composition over inheritance
- Separation of concerns
- Type-safe error handling
- Reusable logic patterns

### Applied To Your App

- Better maintainability
- Less duplicate code
- Easier testing
- Better user experience
- Production-ready patterns

---

That's it! You now have a complete, hooks-based React application with all best practices implemented! 🎉
