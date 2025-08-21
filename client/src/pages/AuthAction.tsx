import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Firebase Auth Action Handler
 * This page handles Firebase authentication actions like password reset, email verification, etc.
 * It parses the URL parameters and redirects to the appropriate page within your app.
 */
const AuthAction: React.FC = () => {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    const continueUrl = urlParams.get('continueUrl');

    console.log('Firebase Auth Action:', { mode, oobCode, continueUrl });

    // Handle different action modes
    switch (mode) {
      case 'resetPassword':
        // Redirect to your custom password reset confirmation page
        if (oobCode) {
          setLocation(`/confirm-reset-password?oobCode=${oobCode}`);
        } else {
          setLocation('/reset-password');
        }
        break;

      case 'verifyEmail':
        // Redirect to your custom email verification page
        if (oobCode) {
          setLocation(`/verify-email?oobCode=${oobCode}`);
        } else {
          setLocation('/signin');
        }
        break;

      case 'recoverEmail':
        // Handle email recovery (if you implement this feature)
        console.log('Email recovery action detected');
        setLocation('/signin');
        break;

      default:
        // Unknown action mode, redirect to home
        console.warn('Unknown Firebase auth action mode:', mode);
        setLocation('/');
        break;
    }
  }, [location, setLocation]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-black bg-opacity-75 p-8 rounded-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Processing authentication action...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthAction;
