import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../lib/firebase';

const ConfirmResetPassword: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);

  // Extract oobCode from URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const oobCode = urlParams.get('oobCode');

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Invalid or missing reset code');
        return;
      }

      try {
        // Verify the password reset code and get the email
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setCodeVerified(true);
      } catch (error: any) {
        console.error('Error verifying reset code:', error);
        if (error.code === 'auth/expired-action-code') {
          setError('This password reset link has expired. Please request a new one.');
        } else if (error.code === 'auth/invalid-action-code') {
          setError('This password reset link is invalid. Please request a new one.');
        } else {
          setError('Failed to verify reset code. Please try again.');
        }
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!oobCode) {
      setError('Invalid reset code');
      return;
    }

    setLoading(true);

    try {
      // Confirm the password reset with the new password
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        setLocation('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error.code === 'auth/expired-action-code') {
        setError('This password reset link has expired. Please request a new one.');
      } else if (error.code === 'auth/invalid-action-code') {
        setError('This password reset link is invalid. Please request a new one.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!codeVerified && !error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black bg-opacity-75 p-8 rounded-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-white">Verifying reset code...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black bg-opacity-75 p-8 rounded-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-white text-2xl font-bold mb-4">Password Reset Successful!</h2>
            <p className="text-gray-300 mb-4">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <p className="text-gray-400 text-sm">
              Redirecting in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-black bg-opacity-75 p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-white text-3xl font-bold mb-6 text-center">
          Reset Your Password
        </h2>
        
        {email && (
          <p className="text-gray-300 mb-6 text-center">
            Setting new password for: <strong>{email}</strong>
          </p>
        )}

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {codeVerified ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Enter your new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Confirm your new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Unable to verify the password reset code.
            </p>
            <button
              onClick={() => setLocation('/reset-password')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
              Request New Reset Link
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/login')}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetPassword;
