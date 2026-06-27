import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleRetry = () => {
    setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  if (state.hasError) {
    return (
      <div className="min-h-screen bg-[#1a1c20] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#22252b] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-6">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {state.error && (
            <details className="mb-6 text-left">
              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-500">
                View error details
              </summary>
              <pre className="mt-2 p-3 bg-[#16181c] rounded-lg text-[10px] text-red-400/80 overflow-auto max-h-32">
                {state.error.message}
                {'\n\n'}
                {state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
            <RefreshCw size={14} />
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for functional component error handling
export function useErrorBoundary() {
  const [, setError] = useState<Error | null>(null);

  const captureError = (error: Error) => {
    setError(() => {
      throw error;
    });
  };

  return { captureError };
}
