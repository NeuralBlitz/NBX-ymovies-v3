export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isError: boolean;
  isGuest: boolean;
}
