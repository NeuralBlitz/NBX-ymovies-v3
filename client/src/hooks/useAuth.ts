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

  return {
    user,
    isLoading,
    isAuthenticated,
    isError,
    isGuest: !isLoading && !isAuthenticated
  };
}
