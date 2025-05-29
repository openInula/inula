// src/context/UserContext.tsx
import React, { useCallback } from 'react';
import { createContext } from 'use-context-selector';
import { useLocalStorageState } from 'ahooks';

// Define the user data type
interface User {
  id: number;
  account: string;
  username: string;
}

// Define the auth data structure
interface AuthData {
  access_token: string;
  user: User | null;
}

// Define the context value type
interface UserContextValue {
  authData: AuthData;
  isAuthenticated: boolean;
  setAuthData: (data: AuthData) => void;
  clearAuthData: () => void;
}

// Initialize default context value
const defaultAuthData: AuthData = {
  access_token: '',
  user: null,
};

// Create the context with use-context-selector
export const UserContext = createContext<UserContextValue>({
  authData: defaultAuthData,
  isAuthenticated: false,
  setAuthData: () => {},
  clearAuthData: () => {},
});

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Using ahooks useLocalStorageState for persistence with the correct type signature
  const [authData, setAuthDataState] = useLocalStorageState<AuthData>(
    'auth_data',
    {
      defaultValue: defaultAuthData,
    }
  );

  // Ensure we have a valid authData even if storage returns undefined
  const safeAuthData: AuthData = authData || defaultAuthData;

  // Check if user is authenticated
  const isAuthenticated = Boolean(safeAuthData.access_token && safeAuthData.user);

  // Set auth data
  const setAuthData = useCallback((data: AuthData) => {
    setAuthDataState(data);
  }, [setAuthDataState]);

  // Clear auth data (logout)
  const clearAuthData = useCallback(() => {
    setAuthDataState(defaultAuthData);
  }, [setAuthDataState]);

  // Provide context value
  const contextValue: UserContextValue = {
    authData: safeAuthData,
    isAuthenticated,
    setAuthData,
    clearAuthData,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hooks for consuming the context
export const useAuthData = () => {
  return useCallback((s: UserContextValue) => s.authData, []);
};

export const useIsAuthenticated = () => {
  return useCallback((s: UserContextValue) => s.isAuthenticated, []);
};

export const useSetAuthData = () => {
  return useCallback((s: UserContextValue) => s.setAuthData, []);
};

export const useClearAuthData = () => {
  return useCallback((s: UserContextValue) => s.clearAuthData, []);
};

export const useUserInfo = () => {
  return useCallback((s: UserContextValue) => s.authData.user, []);
};