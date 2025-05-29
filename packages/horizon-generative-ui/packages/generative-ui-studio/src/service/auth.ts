import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from './base';

// Types
export interface LoginCredentials {
  account: string;
  password: string;
}

export interface RegisterData {
  username: string;
  account: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: any; // Replace with your user type
}


// Auth-specific API methods
export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    post<AuthResponse>('auth/login', credentials),

  register: (data: RegisterData): Promise<AuthResponse> =>
    post<AuthResponse>('auth/register', data),

  getProfile: (): Promise<any> =>
    get<any>('auth/profile', { requiresAuth: true }),

  checkAuth: async (): Promise<boolean> => {
    try {
      await get('profile', { requiresAuth: true });
      return true;
    } catch (error) {
      return false;
    }
  }
};

// React Query hooks
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Add some logging to see what's happening
      console.log('Login attempt with:', credentials);
      try {
        const response = await authApi.login(credentials);
        console.log('Login response:', response);
        return response;
      } catch (error) {
        console.error('Login error:', error);
        throw error; // Re-throw to let React Query handle it
      }
    },
    onSuccess: (data) => {
      // Store token
      localStorage.setItem('authToken', data['access_token']);

      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Update auth status in React Query cache
      queryClient.setQueryData(['auth', 'status'], true);
      queryClient.setQueryData(['auth', 'user'], data.user);

      // Invalidate any queries that might depend on auth status
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data)
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authApi.getProfile(),
    // Only fetch if we have a token
    enabled: !!localStorage.getItem('authToken'),
    // Set initial data from localStorage if available
    initialData: () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          return undefined;
        }
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: () => authApi.checkAuth(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return true;
    },
    onSuccess: () => {
      // Clear auth data from React Query cache
      queryClient.setQueryData(['auth', 'status'], false);
      queryClient.setQueryData(['auth', 'user'], null);

      // Invalidate all queries to force refetch when needed
      queryClient.invalidateQueries();
    }
  });
}