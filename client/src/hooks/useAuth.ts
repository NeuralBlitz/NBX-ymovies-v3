import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// Define User interface 
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
}

export function useAuth() {
  // Using localStorage to remember if auth has been checked to prevent showing loader on refresh
  const [initialCheckComplete, setInitialCheckComplete] = useState(
    localStorage.getItem('authCheckComplete') === 'true'
  );
  
  const { 
    data: user, 
    isLoading: isQueryLoading,
    isError
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: 0,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Only show loading once for better UX
    if (!isQueryLoading && !initialCheckComplete) {
      setInitialCheckComplete(true);
      localStorage.setItem('authCheckComplete', 'true');
    }
  }, [isQueryLoading, initialCheckComplete]);

  // Only show loading on first visit, never after
  const isLoading = !initialCheckComplete && isQueryLoading;
  
  // Handle authentication state
  const isAuthenticated = !!user;
  const isGuest = !isLoading && !isAuthenticated;

  // Sign in function that connects to server
  const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      // For the Netflix clone, we're using Replit Auth, so redirect to the login endpoint
      window.location.href = "/api/login";
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  // Sign up function
  const signUp = async (userData: {email: string, password: string, firstName: string, lastName?: string}): Promise<boolean> => {
    try {
      // For the Netflix clone with Replit Auth, we'll redirect to register endpoint
      window.location.href = "/api/login";
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      window.location.href = "/api/logout";
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // This would typically call a password reset API endpoint
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isError,
    isGuest,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
}
