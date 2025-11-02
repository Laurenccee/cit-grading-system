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

/**
 * Error Boundary component to catch and display errors gracefully
 * Prevents white screen of death and provides recovery mechanism
 */
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
    // Log to error reporting service here
    console.error('ErrorBoundary caught error:', error);
    console.error('Error stack:', errorInfo.componentStack);
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
                variant="default"
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
