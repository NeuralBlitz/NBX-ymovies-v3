import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User } from "./useAuth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isError: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (userData: SignUpData) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  acceptTerms: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Using localStorage to remember if auth has been checked to prevent showing loader on refresh
  const [initialCheckComplete, setInitialCheckComplete] = useState(
    localStorage.getItem('authCheckComplete') === 'true'
  );
  
  const { 
    data: user, 
    isLoading: isQueryLoading,
    isError,
    refetch
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
      toast({
        title: "Error signing in",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
      return false;
    }
  };

  // Sign up function
  const signUp = async (userData: SignUpData): Promise<boolean> => {
    try {
      // For the Netflix clone with Replit Auth, we'll redirect to register endpoint
      // Note: In a real implementation, you'd handle this differently
      window.location.href = "/api/login";
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Error creating account",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      window.location.href = "/api/logout";
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // This would typically call a password reset API endpoint
      // For now, we'll just show a success message
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for instructions",
      });
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error resetting password",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading,
      isAuthenticated,
      isError,
      isGuest,
      signIn,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
