/**
 * Typed API Client SDK for the Nexus Marketplace.
 * This ensures the frontend consumes our endpoints strictly, without resorting to manual type-casting
 * or raw `fetch` statements everywhere.
 */

interface FetchConfig extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}

class ApiError extends Error {
  public code?: string;
  public errors?: Record<string, string[]>;
  public status: number;

  constructor(message: string, status: number, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

async function fetchApi<T>(endpoint: string, config: FetchConfig = {}): Promise<T> {
  let url = endpoint;
  
  if (config.params) {
    const searchParams = new URLSearchParams(config.params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string>),
  };

  if (config.token) {
    headers['Authorization'] = `Bearer ${config.token}`;
  }

  const res = await fetch(url, { ...config, headers });
  
  // Try to parse the response
  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new ApiError('Failed to parse API response', res.status);
  }

  if (!res.ok) {
    throw new ApiError(json.message || 'API request failed', res.status, json.code, json.errors);
  }

  // Handle standard envelopes { data: T } or fallback to raw json
  if (json.data !== undefined) {
    return json.data as T;
  }
  
  return json as T;
}

export const apiClient = {
  addresses: {
    create: async (data: any, token?: string) => fetchApi<any>('/api/addresses', { method: 'POST', body: JSON.stringify(data), token }),
    list: async (token?: string) => fetchApi<any>('/api/addresses', { method: 'GET', token }),
  },
  orders: {
    create: async (data: any, token?: string) => fetchApi<any>('/api/orders', { method: 'POST', body: JSON.stringify(data), token }),
  },
  payments: {
    createIntent: async (data: { orderId: string }, token?: string) => fetchApi<any>('/api/payments/create-intent', { method: 'POST', body: JSON.stringify(data), token }),
  },
};
