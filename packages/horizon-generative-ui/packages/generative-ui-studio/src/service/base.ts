export interface RequestOptions {
  headers?: HeadersInit;
  requiresAuth?: boolean;
  params?: Record<string, string>;
}

const HOST = 'http://10.25.79.168:3001';

export async function request<T>(
  url: string,
  method: string = 'GET',
  data?: any,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, requiresAuth = false, params } = options;

  // Build URL with query parameters if provided
  const queryParams = params
    ? `?${new URLSearchParams(params).toString()}`
    : '';

  const fullUrl = `${HOST}/${url}${queryParams}`;

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('Authentication required but no token found');
    }
  }

  // Prepare request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body data for non-GET requests
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, config);

    // Check if the response is a 401 (Unauthorized)
    if (response.status === 401 && requiresAuth) {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      window.location.href = '/login'; // Adjust the login path as needed

      throw new Error('Authentication expired. Please login again.');
    }

    // Handle response
    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`
      }));

      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as T; // Return empty object for non-JSON responses
  } catch (error) {
    // Re-throw the error for handling by the caller
    throw error;
  }
}

// Helper methods for common HTTP methods
export const get = <T>(
  url: string,
  options?: RequestOptions
): Promise<T> => request<T>(url, 'GET', undefined, options);

export const post = <T>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> => request<T>(url, 'POST', data, options);

export const put = <T>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> => request<T>(url, 'PUT', data, options);

export const del = <T>(
  url: string,
  options?: RequestOptions
): Promise<T> => request<T>(url, 'DELETE', undefined, options);

export const patch = <T>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> => request<T>(url, 'PATCH', data, options);
