import React from 'react';
import { AuthProvider } from './AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';

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
    <ErrorBoundary
      fallback={<>{children}</>}
      onError={(error: Error) => {
        console.error('Auth Provider Error:', error);
        setError(error);
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
};

export default SafeAuthProvider;
