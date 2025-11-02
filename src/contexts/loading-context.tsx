/**
 * Loading Context - Global loading state management
 *
 * WHAT IS CONTEXT?
 * ───────────────
 * Context allows you to pass data through the component tree without
 * having to pass props down manually at every level (prop drilling).
 *
 * EXAMPLE PROBLEM (without Context):
 * App → Layout → Sidebar → Menu → Button (needs isLoading)
 * You'd have to pass isLoading through all intermediate components!
 *
 * SOLUTION (with Context):
 * App provides LoadingProvider → Any nested component can use useLoadingContext()
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// ============================================================================
// LoadingContext Type Definition
// ============================================================================

interface LoadingContextType {
  // Check if a specific operation is loading
  isLoading: (key?: string) => boolean;

  // Start loading for an operation
  startLoading: (key?: string) => void;

  // Stop loading for an operation
  stopLoading: (key?: string) => void;

  // Toggle loading state
  toggleLoading: (key?: string) => void;

  // Get all loading states
  loadingStates: Record<string, boolean>;
}

// ============================================================================
// Create the Context
// ============================================================================

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// ============================================================================
// LoadingProvider Component
// ============================================================================

/**
 * Provider component that wraps your app to enable loading state management
 *
 * USAGE IN app/layout.tsx:
 * ```tsx
 * import { LoadingProvider } from '@/contexts/loading-context';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <LoadingProvider>
 *           {children}
 *         </LoadingProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Check if something is loading
  const isLoading = useCallback(
    (key: string = 'default') => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  // Start loading
  const startLoading = useCallback((key: string = 'default') => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
  }, []);

  // Stop loading
  const stopLoading = useCallback((key: string = 'default') => {
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  // Toggle loading
  const toggleLoading = useCallback((key: string = 'default') => {
    setLoadingStates((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value: LoadingContextType = {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    loadingStates,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

// ============================================================================
// Custom Hook to use Loading Context
// ============================================================================

/**
 * Custom hook to access loading context
 *
 * PURPOSE: Use global loading state from any component
 *
 * EXAMPLE in a component:
 * ```tsx
 * 'use client';
 *
 * import { useLoadingContext } from '@/contexts/loading-context';
 *
 * export function LoginForm() {
 *   const { isLoading, startLoading, stopLoading } = useLoadingContext();
 *
 *   const handleLogin = async () => {
 *     startLoading('login');
 *     try {
 *       await loginAPI();
 *     } finally {
 *       stopLoading('login');
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {isLoading('login') && <p>Loading...</p>}
 *       <button onClick={handleLogin} disabled={isLoading('login')}>
 *         Login
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * WHY USE THIS?
 * 1. No prop drilling - any component can access loading state
 * 2. Single source of truth - one place to manage all loading states
 * 3. Consistent UI - all components show consistent loading state
 * 4. Type-safe - full TypeScript support
 */
export function useLoadingContext(): LoadingContextType {
  const context = useContext(LoadingContext);

  if (context === undefined) {
    throw new Error(
      'useLoadingContext must be used within a LoadingProvider. ' +
        'Make sure LoadingProvider wraps your app in the root layout.'
    );
  }

  return context;
}

// ============================================================================
// Convenience Hooks (Optional - makes the API cleaner)
// ============================================================================

/**
 * Simple hook to check if something is loading
 */
export function useIsLoading(key: string = 'default'): boolean {
  const { isLoading } = useLoadingContext();
  return isLoading(key);
}

/**
 * Simple hook to get loading control functions
 */
export function useLoadingState(key: string = 'default') {
  const { isLoading, startLoading, stopLoading, toggleLoading } =
    useLoadingContext();

  return {
    isLoading: isLoading(key),
    start: () => startLoading(key),
    stop: () => stopLoading(key),
    toggle: () => toggleLoading(key),
  };
}
