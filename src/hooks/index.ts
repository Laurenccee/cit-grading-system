/**
 * Custom React Hooks for the application
 *
 * WHAT ARE HOOKS?
 * ───────────────
 * Hooks are JavaScript functions that let you "hook into" React features.
 * They allow you to use state and other React features without writing classes.
 *
 * Common Hooks:
 * - useState: Adds state to functional components
 * - useEffect: Runs side effects (API calls, subscriptions, etc.)
 * - useContext: Access context values
 * - useCallback: Memoize functions to prevent unnecessary re-renders
 * - useMemo: Memoize values for expensive calculations
 *
 * CUSTOM HOOKS:
 * ────────────
 * Custom hooks are functions that use React hooks to solve specific problems.
 * They let you extract component logic into reusable functions.
 *
 * Rules:
 * 1. Must start with "use" (useMyHook, useForm, etc.)
 * 2. Can only call hooks from React components or other hooks
 * 3. Must be called unconditionally (not in loops, conditionals, etc.)
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Result } from '@/types/result';

// ============================================================================
// useAsync - Handle async operations with loading and error states
// ============================================================================

/**
 * Custom hook for managing async operations
 *
 * PURPOSE: Handles loading states, errors, and data for async functions
 *
 * EXAMPLE:
 * ```tsx
 * const { data, loading, error, execute } = useAsync(fetchUser);
 *
 * return (
 *   <>
 *     {loading && <Spinner />}
 *     {error && <Error>{error}</Error>}
 *     {data && <User user={data} />}
 *     <button onClick={() => execute(userId)}>Load</button>
 *   </>
 * );
 * ```
 */
export function useAsync<T, E = string>(
  asyncFunction: (...args: any[]) => Promise<Result<T, E>>,
  immediate = false
) {
  const [state, setState] = useState<{
    loading: boolean;
    data: T | null;
    error: E | null;
  }>({
    loading: false,
    data: null,
    error: null,
  });

  // Wrap execute with useCallback so it can be used in useEffect
  const execute = useCallback(
    async (...args: any[]) => {
      setState({ loading: true, data: null, error: null });
      try {
        const result = await asyncFunction(...args);
        if (result.success) {
          setState({ loading: false, data: result.data, error: null });
          return result;
        } else {
          setState({ loading: false, data: null, error: result.error });
          return result;
        }
      } catch (error) {
        setState({ loading: false, data: null, error: error as E });
      }
    },
    [asyncFunction]
  );

  // Run immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

// ============================================================================
// useForm - Simplified form handling with validation
// ============================================================================

/**
 * Custom hook for form handling
 *
 * PURPOSE: Manage form state, validation errors, and submission
 *
 * EXAMPLE:
 * ```tsx
 * const { values, errors, handleChange, handleSubmit, isLoading } = useForm(
 *   { email: '', password: '' },
 *   async (data) => {
 *     return await signIn(data);
 *   }
 * );
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input
 *       name="email"
 *       value={values.email}
 *       onChange={handleChange}
 *     />
 *     {errors.email && <span>{errors.email}</span>}
 *     <button disabled={isLoading}>Submit</button>
 *   </form>
 * );
 * ```
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<Result<any>> | Promise<void>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrors({});

      try {
        const result = await onSubmit(values);

        // Check if result is a Result type
        if (result && typeof result === 'object' && 'success' in result) {
          if (!result.success) {
            setErrors({ form: result.error as string });
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ form: 'An unexpected error occurred' });
      } finally {
        setIsLoading(false);
      }
    },
    [values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
  };
}

// ============================================================================
// useDebounce - Debounce a value to delay updates
// ============================================================================

/**
 * Custom hook for debouncing values
 *
 * PURPOSE: Delay value updates (useful for search inputs, filter changes)
 *
 * EXAMPLE USAGE:
 * - Import: const { useDebounce } = require('./hooks')
 * - Use: const debouncedTerm = useDebounce(searchTerm, 500)
 * - Ideal for: Search inputs, filter changes, resize handlers
 * - Delay: Configurable in milliseconds
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// useLocalStorage - Persist state to localStorage
// ============================================================================

/**
 * Custom hook for persisting state in localStorage
 *
 * PURPOSE: Save and restore state from browser storage
 *
 * EXAMPLE USAGE:
 * - Import: const { useLocalStorage } = require('./hooks')
 * - Use: const [theme, setTheme] = useLocalStorage('theme', 'light')
 * - Persists: Data saved in browser localStorage
 * - Type-safe: Full TypeScript support for stored values
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// ============================================================================
// useLoading - Manage loading states
// ============================================================================

/**
 * Custom hook for managing multiple loading states
 *
 * PURPOSE: Track different loading states for different operations
 *
 * EXAMPLE USAGE:
 * - Import: const { useLoading } = require('./hooks')
 * - Use: const { isLoading, startLoading, stopLoading } = useLoading('search')
 * - Methods: startLoading(), stopLoading(), toggleLoading(), isLoading(key)
 * - Multi-key: Can track multiple operations simultaneously
 */
export function useLoading(initialKey: string = 'default') {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const isLoading = useCallback(
    (key: string = initialKey) => {
      return loadingStates[key] || false;
    },
    [loadingStates, initialKey]
  );

  const startLoading = useCallback(
    (key: string = initialKey) => {
      setLoadingStates((prev) => ({ ...prev, [key]: true }));
    },
    [initialKey]
  );

  const stopLoading = useCallback(
    (key: string = initialKey) => {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    },
    [initialKey]
  );

  const toggleLoading = useCallback(
    (key: string = initialKey) => {
      setLoadingStates((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [initialKey]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    loadingStates,
  };
}

// ============================================================================
// usePrevious - Get the previous value
// ============================================================================

/**
 * Custom hook to access previous value
 *
 * PURPOSE: Compare current and previous values
 *
 * EXAMPLE USAGE:
 * - Import: const { usePrevious } = require('./hooks')
 * - Use: const prevCount = usePrevious(count)
 * - Type-safe: Full TypeScript generics support
 * - Useful for: Detecting value changes, animations, comparisons
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================================
// useWindowSize - Get window dimensions
// ============================================================================

/**
 * Custom hook to get current window size
 *
 * PURPOSE: Respond to window resize events
 *
 * EXAMPLE USAGE:
 * - Import: const { useWindowSize } = require('./hooks')
 * - Use: const { width, height, isMobile } = useWindowSize()
 * - Responsive: Automatically updates on window resize
 * - Properties: width, height, isMobile (width < 768px)
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...windowSize,
    isMobile: (windowSize.width || 0) < 768,
    isTablet: (windowSize.width || 0) < 1024,
    isDesktop: (windowSize.width || 0) >= 1024,
  };
}

// ============================================================================
// useTimeout - Run a function after a delay
// ============================================================================

/**
 * Custom hook to run a callback after a delay
 *
 * PURPOSE: Execute code after a certain time
 *
 * EXAMPLE:
 * ```tsx
 * const { clear, reset } = useTimeout(() => {
 *   console.log('This runs after 2 seconds');
 * }, 2000);
 *
 * return (
 *   <>
 *     <button onClick={clear}>Cancel</button>
 *     <button onClick={reset}>Restart</button>
 *   </>
 * );
 * ```
 */
export function useTimeout(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = () => savedCallback.current();
    timeoutId.current = setTimeout(handler, delay);

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
  }, []);

  const reset = useCallback(() => {
    clear();
    timeoutId.current = setTimeout(savedCallback.current, delay);
  }, [clear, delay]);

  return { clear, reset };
}
