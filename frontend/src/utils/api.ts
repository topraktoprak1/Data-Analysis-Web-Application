/**
 * Authenticated fetch wrapper that handles session expiration
 * Automatically redirects to login on 401 Unauthorized
 */

const API_BASE_URL = '';

interface FetchOptions extends RequestInit {
  credentials?: RequestCredentials;
}

export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  // Always include credentials (session cookies)
  const fetchOptions: FetchOptions = {
    ...options,
    credentials: 'include',
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      console.warn('Session expired, redirecting to login...');
      // Clear any local auth state
      localStorage.removeItem('__app_user');
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    return response;
  } catch (error) {
    // Re-throw network errors
    throw error;
  }
}

/**
 * Helper for JSON API calls
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await authenticatedFetch(endpoint, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Download file with authentication
 */
export async function downloadFile(
  endpoint: string,
  filename?: string
): Promise<void> {
  const response = await authenticatedFetch(endpoint, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(error.error || 'Download failed');
  }

  // Get filename from header or use provided/default
  const contentDisposition = response.headers.get('content-disposition');
  let finalFilename = filename || 'download';
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      finalFilename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  // Download the file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
