# Best Practices Guide

## Code Quality Standards

### 1. TypeScript & Type Safety

#### ❌ Avoid

```typescript
function handleData(data: any) {
  return data.user.name;
}
```

#### ✅ Do

```typescript
interface UserData {
  user: {
    name: string;
    email: string;
  };
}

function handleData(data: UserData): string {
  return data.user.name;
}
```

### 2. Error Handling

#### ❌ Avoid

```typescript
async function fetchUser() {
  const response = await fetch('/api/user');
  return response.json();
}
```

#### ✅ Do

```typescript
async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```

### 3. Component Props

#### ❌ Avoid

```typescript
export function MyComponent({ data, handler, config }: any) {
  // ...
}
```

#### ✅ Do

```typescript
interface MyComponentProps {
  data: User[];
  handler: (user: User) => void;
  config: { limit: number; sortBy: 'name' | 'date' };
}

export function MyComponent({ data, handler, config }: MyComponentProps) {
  // ...
}
```

### 4. Constants & Magic Strings

#### ❌ Avoid

```typescript
const url = '/dashboard'; // Used in 5 different files
const sidebarItems = [
  { url: '/dashboard', label: 'Dashboard' },
  { url: '/classes', label: 'Classes' },
];
```

#### ✅ Do

```typescript
// constants/config.ts
export const ROUTES = {
  DASHBOARD: '/dashboard',
  CLASSES: '/classes',
} as const;

// Usage
const sidebarItems = [
  { url: ROUTES.DASHBOARD, label: 'Dashboard' },
  { url: ROUTES.CLASSES, label: 'Classes' },
];
```

### 5. Null Safety & Defensive Programming

#### ❌ Avoid

```typescript
function getUserName(user: User) {
  return user.profile.name.toUpperCase(); // Can crash
}
```

#### ✅ Do

```typescript
function getUserName(user: User | null): string {
  return user?.profile?.name?.toUpperCase() ?? 'Unknown';
}

// Or with helper function
import { formatFullName } from '@/utils/helpers';
const name = formatFullName(user?.first_name, user?.last_name);
```

### 6. Reusable Utilities

#### ❌ Avoid

```typescript
// In ComponentA.tsx
const name =
  user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email;

// In ComponentB.tsx
const displayName =
  userData.first_name && userData.last_name
    ? `${userData.first_name} ${userData.last_name}`
    : userData.email;
```

#### ✅ Do

```typescript
// utils/helpers.ts
export const formatFullName = (
  firstName?: string,
  lastName?: string
): string => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'User';
};

// Usage in any component
import { formatFullName } from '@/utils/helpers';
const name = formatFullName(user.first_name, user.last_name);
```

### 7. Documentation & Comments

#### ❌ Avoid

```typescript
// Bad: explains the obvious
const isValid = user.age > 18; // check if age > 18

// Bad: no documentation
export function processData(data: any) {
  return data.map((item) => item.value * 2);
}
```

#### ✅ Do

```typescript
// Good: explains the why
const isAdult = user.age >= 18; // Users must be adults to access premium features

/**
 * Double all numeric values in the dataset
 * @param data - Array of items with numeric values
 * @returns Array with doubled values
 */
export function doubleValues(data: { value: number }[]): number[] {
  return data.map((item) => item.value * 2);
}
```

### 8. Component Structure

#### ✅ Good Pattern

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Imports organized: react → next → local

interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => Promise<void>;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic here
    } finally {
      setLoading(false);
    }
  };

  return <div>{/* JSX */}</div>;
}
```

### 9. Async/Await vs Promises

#### ✅ Prefer async/await

```typescript
// Better readability
async function fetchAndProcess(id: string) {
  try {
    const user = await getUser(id);
    const processed = await processUser(user);
    return processed;
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  }
}

// Over promise chains
function fetchAndProcess(id: string) {
  return getUser(id)
    .then((user) => processUser(user))
    .catch((error) => console.error('Processing failed:', error));
}
```

### 10. Array Operations

#### ❌ Avoid

```typescript
const filtered = items.filter((item) => item.active === true);
const mapped = filtered.map((item) => item.id);
const unique = [...new Set(mapped)];
```

#### ✅ Do

```typescript
const uniqueIds = [
  ...new Set(items.filter((item) => item.active).map((item) => item.id)),
];
```

## File Organization

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── layouts/     # Layout components
├── constants/       # Constants, configuration
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
├── features/       # Feature-specific code
├── lib/            # Third-party integrations
└── services/       # API services
```

## Naming Conventions

### ✅ Good Names

```typescript
// Boolean variables
const isActive = true;
const hasPermission = false;
const shouldShowModal = true;

// Functions
function formatUserName() {}
function validateEmail() {}
function getActiveUsers() {}

// Components (PascalCase)
function UserProfile() {}
function SidebarLayout() {}
function FormInput() {}

// Constants (UPPER_SNAKE_CASE)
const MAX_ITEMS = 100;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.example.com';
```

## Performance Tips

1. **Use useMemo for expensive calculations**

```typescript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

2. **Use React.memo for component optimization**

```typescript
export const MemoizedComponent = React.memo(MyComponent);
```

3. **Lazy load components**

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

4. **Avoid inline function definitions**

```typescript
// ❌ Creates new function on every render
<button onClick={() => handleClick(id)} />;

// ✅ Function defined once
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<button onClick={handleButtonClick} />;
```

## Security Best Practices

1. **Never expose sensitive data**

```typescript
// ❌ Don't log sensitive info
console.log('User password:', password);

// ✅ Log only necessary info
console.log('Authentication attempt for user:', email);
```

2. **Validate user input**

```typescript
function processUserInput(input: string): string {
  if (!input || input.trim().length === 0) {
    throw new Error('Input cannot be empty');
  }
  return input.trim();
}
```

3. **Use environment variables**

```typescript
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const secretKey = process.env.SECRET_API_KEY; // Not exposed to client
```

## Testing Mindset

Write code that's easy to test:

```typescript
// ✅ Easy to test (pure function)
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Easy to test (clear dependencies)
export async function fetchUserData(userId: string, api: ApiClient) {
  return api.get(`/users/${userId}`);
}
```

## Summary

- Write code for clarity and maintainability
- Use TypeScript to catch errors early
- Centralize configuration and constants
- Create reusable utilities
- Add proper documentation
- Handle errors gracefully
- Follow consistent naming conventions
- Optimize for performance when needed
- Prioritize security
- Write testable code
