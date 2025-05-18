import React from 'react';
import { AuthProvider } from './AuthProvider';

/**
 * This component is a safety wrapper around the AuthProvider
 * It catches errors during the Firebase initialization and prevents
 * the entire application from crashing
 */
export const SafeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = React.useState<Error | null>(null);

  // Error boundary pattern for auth initialization errors
  if (error) {
    // Log the error but don't crash the app
    console.error('Firebase Authentication Error:', error);
    
    // Return children without the auth provider to allow app to function
    // even if authentication is not working
    return <>{children}</>;
  }

  return (
    <React.ErrorBoundary
      fallback={<>{children}</>}
      onError={(error) => {
        console.error('Auth Provider Error:', error);
        setError(error);
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </React.ErrorBoundary>
  );
};

// Polyfill for React.ErrorBoundary if not available
if (!React.ErrorBoundary) {
  React.ErrorBoundary = class ErrorBoundary extends React.Component<{
    fallback: React.ReactNode;
    onError?: (error: Error) => void;
    children: React.ReactNode;
  }> {
    state = { hasError: false };
    
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    
    componentDidCatch(error: Error) {
      if (this.props.onError) {
        this.props.onError(error);
      }
    }
    
    render() {
      if (this.state.hasError) {
        return this.props.fallback;
      }
      
      return this.props.children;
    }
  };
}

export default SafeAuthProvider;
