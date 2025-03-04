'use client';

import { useState, useCallback } from 'react';

export interface ApiError {
  status?: number;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  execute: (options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling API requests with proper error handling
 * 
 * @param url The API endpoint URL to call
 * @param options Request options (method, headers, etc.)
 * @returns API response state and execute function
 */
export function useApi<T = any>(
  url: string,
  options: RequestInit = {}
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Reset the state
  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // Execute the API request
  const execute = useCallback(
    async (overrideOptions: RequestInit = {}): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Allow overriding options when executing
        const requestOptions = {
          ...options,
          ...overrideOptions,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...overrideOptions.headers,
          },
        };

        const response = await fetch(url, requestOptions);
        
        // Handle non-200 responses as errors
        if (!response.ok) {
          let errorData;
          
          try {
            // Try to parse JSON error response
            errorData = await response.json();
          } catch (e) {
            // If that fails, use text
            errorData = { message: await response.text() };
          }
          
          const apiError: ApiError = {
            status: response.status,
            message: errorData.message || response.statusText || 'Unknown error',
            details: errorData
          };
          
          setError(apiError);
          setIsLoading(false);
          return null;
        }

        // For successful requests, parse the JSON response
        const responseData = await response.json();
        setData(responseData);
        return responseData;
      } catch (error: any) {
        // Handle network errors or JSON parsing errors
        const apiError: ApiError = {
          message: error.message || 'Network error occurred',
          details: error
        };
        setError(apiError);
        console.error('API request failed:', apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  return { data, isLoading, error, execute, reset };
}

/**
 * Custom hook for handling POST requests to an API
 * 
 * @param url The API endpoint URL to call
 * @param options Additional request options
 * @returns API response state and execute function
 */
export function useApiPost<T = any, D = any>(
  url: string,
  options: RequestInit = {}
): ApiResponse<T> & { 
  executePost: (data: D, additionalOptions?: RequestInit) => Promise<T | null> 
} {
  const api = useApi<T>(url, {
    method: 'POST',
    ...options,
  });

  // Enhanced execute function that accepts data as first parameter
  const executePost = useCallback(
    async (data: D, additionalOptions: RequestInit = {}) => {
      return api.execute({
        ...additionalOptions,
        body: JSON.stringify(data),
      });
    },
    [api]
  );

  return { ...api, executePost };
} 