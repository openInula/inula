// Authentication API service
const HOST = 'http://10.25.79.168:3001'
const API_BASE_URL = `${HOST}/auth`; // Adjust if your API has a different base URL

/**
 * Login user and store JWT token
 */
export const loginUser = async (account: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (
  name: string,
  account: string,
  password: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: name, account, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Get the current user profile
 */
export const getUserProfile = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return false;
    }

    // Validate token by attempting to fetch user profile
    await getUserProfile();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Logout user
 */
export const logoutUser = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Force reload to reset application state (optional)
  window.location.href = '/login';
};

/**
 * Helper to get authentication headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
