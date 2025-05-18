// This file is now just a re-export of the auth hook from AuthProvider
// This helps avoid circular dependencies
export { useAuth } from '@/components/AuthProvider';
export type { User, SignUpData } from '@/types/auth';
