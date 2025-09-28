import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { User, SignUpData, AuthState } from '@/types/auth';
import auth from '@/lib/firebase';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (userData: SignUpData) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  verifyEmail: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to our User type
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  // Handle display name parsing safely
  let firstName = '';
  let lastName = '';
  
  if (firebaseUser.displayName) {
    const nameParts = firebaseUser.displayName.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  }
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    firstName,
    lastName,
    profileImageUrl: firebaseUser.photoURL || '',
    createdAt: firebaseUser.metadata.creationTime || '',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [initializing]);

  // Map Firebase user to our User type
  const user: User | null = firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null;
  
  // Auth state
  const isLoading = initializing;
  const isAuthenticated = !!user;
  const isGuest = !isLoading && !isAuthenticated;
  const isError = false;  // We'll set this when needed

  // Sign in with email/password
  const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error signing in",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      return false;
    }
  };

  // Sign up with email/password
  const signUp = async (userData: SignUpData): Promise<boolean> => {
    try {
      const { email, password } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
      });
      return true;
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Error creating account",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Signed in successfully",
        description: "Welcome!",
      });
      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Error signing in with Google",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };
  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Invalidate all queries to clear cached data
      queryClient.clear();
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Password reset
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Custom action code settings to redirect to your own domain
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/action`, // Your custom action handler
        handleCodeInApp: false, // Let your custom page handle the code
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for instructions",
      });
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error resetting password",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Send email verification
  const verifyEmail = async (): Promise<boolean> => {
    try {
      if (firebaseUser) {
        await sendEmailVerification(firebaseUser);
        toast({
          title: "Verification email sent",
          description: "Please check your inbox",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast({
        title: "Error sending verification email",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  // Change password (requires recent login)
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!firebaseUser || !firebaseUser.email) {
        toast({ title: "Cannot change password", description: "No email/password account linked.", variant: "destructive" });
        return false;
      }
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
      toast({ title: "Password updated" });
      return true;
    } catch (error: any) {
      console.error('Change password error:', error);
      const msg = error?.code === 'auth/wrong-password' ? 'Current password is incorrect' : (error?.message || 'Please try again');
      toast({ title: "Error changing password", description: msg, variant: "destructive" });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      isLoading,
      isAuthenticated,
      isError,
      isGuest,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      verifyEmail
      ,changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
