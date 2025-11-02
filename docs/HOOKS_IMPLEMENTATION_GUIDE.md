# 🎣 React Hooks Implementation Guide

## Overview

You asked: **"I have not used hooks since I don't know how or what is the purpose, can you implement those?"**

This document explains everything about the hooks we just implemented, why they're useful, and how to use them.

---

## Part 1: What Are Hooks?

### The Simple Definition

**Hooks are functions that let you use React features in functional components.**

Before hooks (pre-2019), if you wanted state or lifecycle methods, you had to use class components. Hooks made it possible to use all those features in simpler functional components.

### Why Hooks Matter

| Feature          | Before Hooks (Class Components)                                   | After Hooks (Functional Components) |
| ---------------- | ----------------------------------------------------------------- | ----------------------------------- |
| **Code**         | Long and complex                                                  | Short and readable                  |
| **Logic Reuse**  | Render props, HOCs                                                | Custom hooks                        |
| **State**        | `this.state`                                                      | `useState` hook                     |
| **Side Effects** | `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` | `useEffect` hook                    |
| **Testing**      | Harder, need to render component                                  | Easier, just call the function      |

### The Two Main Rules of Hooks

```typescript
// ✅ CORRECT: Call hooks at top level
function MyComponent() {
  const [count, setCount] = useState(0); // ✅ Top level

  return <div>{count}</div>;
}

// ❌ WRONG: Don't call in loops
function MyComponent() {
  for (let i = 0; i < 5; i++) {
    const [count, setCount] = useState(0); // ❌ Inside loop!
  }
}

// ❌ WRONG: Don't call conditionally
function MyComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0); // ❌ Inside if!
  }
}

// ✅ CORRECT: Only call in React functions
function MyComponent() {
  // ✅ React component
  const [count, setCount] = useState(0); // ✅ Can use hooks
}

function useMyHook() {
  // ✅ Custom hook
  const [count, setCount] = useState(0); // ✅ Can use hooks
}

function regularFunction() {
  // ❌ Regular function
  const [count, setCount] = useState(0); // ❌ Can't use hooks!
}
```

---

## Part 2: Built-in React Hooks (The Ones We Use)

### useState - Add State to Functions

```typescript
// BEFORE (class component):
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  render() {
    return (
      <div>
        {this.state.count}
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          +
        </button>
      </div>
    );
  }
}

// AFTER (with useState hook):
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {count}
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

### useEffect - Run Side Effects

```typescript
/**
 * useEffect runs code after the component renders
 *
 * Replaces:
 * - componentDidMount (runs once on mount)
 * - componentDidUpdate (runs after every update)
 * - componentWillUnmount (cleanup)
 */

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This effect runs after component renders
  useEffect(() => {
    // Load user data
    fetchUser(userId)
      .then((data) => setUser(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    // Cleanup function (runs when component unmounts)
    return () => {
      console.log('Component unmounting, cleanup here');
    };
  }, [userId]); // Re-run when userId changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>{user.name}</p>;
}
```

### useContext - Avoid Prop Drilling

```typescript
/**
 * Context lets you pass data through component tree
 * without passing props at every level
 */

// Create context
const ThemeContext = React.createContext();

// Provider (wrap your app)
export function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}

// Use in any nested component (no props needed!)
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

### useCallback - Memoize Functions

```typescript
/**
 * useCallback prevents function recreation on every render
 * Useful for:
 * 1. Passing to child components (prevents unnecessary re-renders)
 * 2. Using as dependency in other hooks
 */

function Parent() {
  const [count, setCount] = useState(0);

  // WITHOUT useCallback: handleClick recreated every render
  // This causes Child to re-render every time (even if props didn't change)
  const handleClickBad = () => setCount(count + 1);

  // WITH useCallback: handleClick only created when count changes
  // Child won't re-render unnecessarily
  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  return (
    <div>
      Count: {count}
      <Child onClick={handleClick} />
    </div>
  );
}
```

### useRef - Keep Mutable Value Between Renders

```typescript
/**
 * useRef creates a value that persists across renders
 * but doesn't cause re-renders when it changes
 *
 * Common uses:
 * 1. Access DOM elements directly
 * 2. Keep mutable values without triggering re-renders
 */

// Example 1: Access DOM element
function TextInput() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current.focus(); // Access the input element
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleFocus}>Focus the input</button>
    </>
  );
}

// Example 2: Keep previous value
function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = count; // Update after render
  }, [count]);

  return (
    <div>
      Now: {count}, Before: {prevCountRef.current}
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

---

## Part 3: Custom Hooks We Created

### useForm - Manage Form State

```typescript
/**
 * PURPOSE: Handle form state, validation, and submission
 * LOCATION: src/hooks/index.ts
 *
 * WHY: Instead of managing email, password, errors separately,
 *      useForm handles all that for you!
 */

// BEFORE (without useForm):
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // ... validation and submission logic
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={handleEmailChange} />
      <input value={password} onChange={handlePasswordChange} />
      {errors.email && <span>{errors.email}</span>}
      {errors.password && <span>{errors.password}</span>}
      <button disabled={isLoading}>Submit</button>
    </form>
  );
}

// AFTER (with useForm):
function LoginForm() {
  const { values, errors, handleChange, handleSubmit, isLoading } = useForm(
    { email: '', password: '' },
    async (data) => {
      return await submitForm(data);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" value={values.password} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
      {errors.password && <span>{errors.password}</span>}
      <button disabled={isLoading}>Submit</button>
    </form>
  );
}
```

**What useForm does:**

- Tracks all form values automatically
- Manages error states for each field
- Provides `handleChange` for all inputs (no need for individual handlers)
- Provides `handleSubmit` that validates and submits
- Tracks loading state during submission

### useAsync - Handle Async Operations

```typescript
/**
 * PURPOSE: Load data from API with loading/error states
 * LOCATION: src/hooks/index.ts
 *
 * WHY: Instead of managing loading, error, data separately,
 *      useAsync handles all that automatically!
 */

// Example: Load user data
function UserProfile({ userId }) {
  const {
    data: user,
    loading,
    error,
    execute,
  } = useAsync(
    async () => {
      return await fetchUser(userId);
    },
    true // Run immediately on mount
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>{user.name}</p>;
}

// Example: Load on demand (button click)
function SearchUsers() {
  const {
    data: users,
    loading,
    error,
    execute,
  } = useAsync(
    async (searchTerm) => {
      return await searchAPI(searchTerm);
    },
    false // Don't run immediately
  );

  return (
    <div>
      <button onClick={() => execute('john')}>Search for John</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {users && users.map((user) => <p key={user.id}>{user.name}</p>)}
    </div>
  );
}
```

**What useAsync does:**

- Tracks loading state automatically
- Tracks errors automatically
- Stores the result data
- Provides `execute` function to run the async operation
- Can run immediately or on demand

### useDebounce - Delay Value Updates

```typescript
/**
 * PURPOSE: Wait for user to stop typing before searching
 * LOCATION: src/hooks/index.ts
 *
 * WHY: Don't search after every keystroke,
 *      wait 500ms to see if user keeps typing
 */

function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedTerm) {
      searchUsers(debouncedTerm); // Only runs 500ms after user stops typing
    }
  }, [debouncedTerm]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {/* Search results would appear here */}
    </div>
  );
}
```

**What useDebounce does:**

- Takes a value and delay time
- Returns a debounced version that updates after delay
- Useful for search inputs, filter changes, resize handlers

### useLocalStorage - Persist State

```typescript
/**
 * PURPOSE: Save data to browser storage
 * LOCATION: src/hooks/index.ts
 *
 * WHY: Remember user preferences even after they close the browser
 */

function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
  // Theme is saved to localStorage automatically!
}
```

**What useLocalStorage does:**

- Works like useState but persists to localStorage
- Survives browser reload
- Typed with TypeScript

### useLoading - Manage Multiple Loading States

```typescript
/**
 * PURPOSE: Track different loading states
 * LOCATION: src/hooks/index.ts
 *
 * WHY: You might have multiple operations loading (login, signup, etc.)
 *      This tracks each one separately
 */

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading('search');

  const handleSearch = async () => {
    startLoading(); // isLoading('search') becomes true
    await searchAPI();
    stopLoading(); // isLoading('search') becomes false
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={isLoading()}>
        {isLoading() ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}
```

**What useLoading does:**

- Tracks multiple named loading states
- `startLoading(key)` - set loading for key
- `stopLoading(key)` - set not loading for key
- `isLoading(key)` - check if key is loading

---

## Part 4: Context & LoadingProvider

### What is Context?

```typescript
/**
 * Context solves "prop drilling" problem
 *
 * PROBLEM (without context):
 * App → Page → Layout → Sidebar → Menu → Item
 *       Pass loading state through all these components!
 *
 * SOLUTION (with context):
 * App provides LoadingProvider
 * Any nested component can useLoadingContext() - no props needed!
 */
```

### LoadingProvider - Global Loading State

```typescript
/**
 * LOCATION: src/contexts/loading-context.tsx
 * USAGE: Wrap your app in app/layout.tsx
 *
 * HOW IT WORKS:
 * 1. LoadingProvider stores loading states
 * 2. Any nested component can access it with useLoadingContext()
 * 3. No prop drilling needed!
 */

// In app/layout.tsx:
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}

// In any nested component:
function LoginForm() {
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  const handleLogin = async () => {
    startLoading('login');
    await login();
    stopLoading('login');
  };

  return (
    <button onClick={handleLogin} disabled={isLoading('login')}>
      {isLoading('login') ? 'Loading...' : 'Login'}
    </button>
  );
}
```

---

## Part 5: What We Implemented in LoginForm

### Before (Without Hooks)

```typescript
export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    setError('');
    // Manual form data creation
    const formData = new FormData(e.currentTarget);
    // ... manual error handling
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      {/* No field-level error display */}
      <button disabled={loading}>{loading ? 'Loading' : 'Sign In'}</button>
    </form>
  );
}
```

### After (With Hooks + Context)

```typescript
export default function LoginForm() {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (data) => {
      startLoading('login');
      try {
        // Validation and submission
        const result = await signIn(formData);
        if (result.status === 'success') {
          router.push('/dashboard');
        }
        return result;
      } finally {
        stopLoading('login');
      }
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}

      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
      />
      {errors.password && <span>{errors.password}</span>}

      <button disabled={isLoading('login')}>
        {isLoading('login') ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
```

**Improvements:**
✅ Field-level error display
✅ Real-time validation on type
✅ Global loading state (shared across app)
✅ Better error handling
✅ Cleaner code (no manual form state management)
✅ Type-safe with TypeScript

---

## Part 6: How to Use These Hooks in Other Components

### Example 1: Search Component

```typescript
'use client';

import { useForm, useDebounce, useAsync } from '@/hooks';

export function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);

  const { data: results, loading } = useAsync(async () => {
    if (!debouncedTerm) return { success: true, data: [] };
    return await searchUsersAPI(debouncedTerm);
  }, false);

  useEffect(() => {
    // This runs when debouncedTerm changes (500ms after user stops typing)
  }, [debouncedTerm]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      {loading && <p>Searching...</p>}
      {results?.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}
```

### Example 2: Class Form

```typescript
'use client';

import { useForm } from '@/hooks';
import { useLoadingContext } from '@/contexts/loading-context';

export function ClassForm() {
  const { startLoading, stopLoading, isLoading } = useLoadingContext();

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      subject_name: '',
      subject_code: '',
      year_level_id: '',
    },
    async (data) => {
      startLoading('class-form');
      try {
        return await createClass(data);
      } finally {
        stopLoading('class-form');
      }
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="subject_name"
        value={values.subject_name}
        onChange={handleChange}
      />
      {errors.subject_name && <span>{errors.subject_name}</span>}

      <button disabled={isLoading('class-form')}>
        {isLoading('class-form') ? 'Creating...' : 'Create Class'}
      </button>
    </form>
  );
}
```

### Example 3: Todo List with LocalStorage

```typescript
'use client';

import { useLocalStorage } from '@/hooks';

export function TodoList() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Part 7: Key Takeaways

### Why We Created All These Hooks

| Hook              | Problem It Solves            | When to Use              |
| ----------------- | ---------------------------- | ------------------------ |
| `useForm`         | Manual form state management | Every form component     |
| `useAsync`        | Manual loading/error states  | Data fetching            |
| `useDebounce`     | Unnecessary API calls        | Search inputs, filters   |
| `useLocalStorage` | Losing data on refresh       | User preferences, drafts |
| `useLoading`      | Prop drilling loading states | Global loading tracking  |
| `useWindowSize`   | Responsive layout logic      | Responsive design        |
| `useTimeout`      | Manual setTimeout cleanup    | Delayed actions          |
| `usePrevious`     | Tracking previous values     | Comparing old vs new     |

### How Hooks Improve Your Code

```
BEFORE (Class Components + Manual State)
├─ Lots of boilerplate
├─ Hard to reuse logic
├─ Harder to test
├─ Difficult to understand flow
└─ Prop drilling

AFTER (Hooks + Custom Hooks)
├─ Clean, readable code
├─ Easy to reuse with custom hooks
├─ Easy to test (just functions)
├─ Clear data flow
└─ No prop drilling with Context
```

### React Hooks Ecosystem

```
Built-in Hooks (React)
├─ useState - state
├─ useEffect - side effects
├─ useContext - context
├─ useCallback - memoize functions
├─ useRef - mutable values
├─ useMemo - memoize values
├─ useReducer - complex state
└─ ... and more

Our Custom Hooks (Your App)
├─ useForm - form handling
├─ useAsync - async operations
├─ useDebounce - delay values
├─ useLocalStorage - persist to storage
├─ useLoading - multi-state loading
├─ useWindowSize - window dimensions
├─ useTimeout - delayed execution
└─ usePrevious - track previous value

Context (State Without Props)
├─ LoadingProvider - global loading
└─ useLoadingContext - access global state
```

---

## Part 8: Next Steps - How to Use This in Your App

### Step 1: The Infrastructure is Ready! ✅

- ✅ Custom hooks created in `src/hooks/index.ts`
- ✅ LoadingProvider created in `src/contexts/loading-context.tsx`
- ✅ App wrapped with LoadingProvider in `app/layout.tsx`
- ✅ LoginForm updated with hooks and validation

### Step 2: Update Other Forms (Copy-Paste Pattern)

```typescript
// In any form component:
'use client';

import { useForm } from '@/hooks';
import { useLoadingContext } from '@/contexts/loading-context';
import { validateFormData } from '@/utils/validation';

export function MyForm() {
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      /* initial values */
    },
    async (data) => {
      startLoading('form');
      try {
        return await submitAPI(data);
      } finally {
        stopLoading('form');
      }
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Add inputs with handleChange */}
      {/* Add error display from errors object */}
      <button disabled={isLoading('form')}>Submit</button>
    </form>
  );
}
```

### Step 3: Add Data Loading (useAsync)

```typescript
'use client';

import { useAsync } from '@/hooks';

export function MyPage() {
  const {
    data: items,
    loading,
    error,
  } = useAsync(
    async () => await fetchItems(),
    true // Run immediately
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {items?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## Summary

You now have:

1. **8 Custom Hooks** - Reusable logic for common tasks
2. **Loading Context** - Global loading state without prop drilling
3. **Validation System** - Zod-based validation with error tracking
4. **Error Boundary** - Graceful error handling
5. **Result Type** - Type-safe error handling
6. **Updated LoginForm** - Working example of all improvements

All of this demonstrates **modern React best practices** and makes your app:

- ✅ More maintainable
- ✅ More reusable
- ✅ Easier to test
- ✅ Better performance
- ✅ More scalable

Start using these hooks in your other components to see the improvements!
