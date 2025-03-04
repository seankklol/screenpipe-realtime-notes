'use client';

import React from 'react';
import { ApiError } from '@/lib/hooks/use-api';

interface ApiErrorDisplayProps {
  error: ApiError | string | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Component for displaying API errors in a consistent way
 */
export default function ApiErrorDisplay({
  error,
  onRetry,
  className = ''
}: ApiErrorDisplayProps) {
  // If no error, don't render anything
  if (!error) return null;
  
  // Extract error message
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'An unknown error occurred';
  
  // Extract error status code if available
  const statusCode = typeof error === 'string' 
    ? undefined 
    : error.status;
  
  // Determine the severity based on status code
  const getSeverityStyles = () => {
    // Client errors (4xx) are shown as warnings
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        title: 'text-yellow-800',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      };
    }
    
    // Server errors (5xx) are shown as critical errors
    if (statusCode && statusCode >= 500) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        title: 'text-red-800',
        button: 'bg-red-600 hover:bg-red-700'
      };
    }
    
    // Default style for unknown errors
    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      title: 'text-orange-800',
      button: 'bg-orange-600 hover:bg-orange-700'
    };
  };
  
  const styles = getSeverityStyles();
  
  // Determine error title based on status code
  const getErrorTitle = () => {
    if (!statusCode) return 'Error';
    
    switch (statusCode) {
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 429: return 'Too Many Requests';
      case 500: return 'Server Error';
      case 503: return 'Service Unavailable';
      case 504: return 'Gateway Timeout';
      default: return `Error (${statusCode})`;
    }
  };
  
  return (
    <div className={`p-4 ${styles.bg} border ${styles.border} rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 pt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${styles.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-medium ${styles.title}`}>
            {getErrorTitle()}
          </h3>
          
          <div className={`mt-2 ${styles.text}`}>
            <p>{errorMessage}</p>
            
            {typeof error !== 'string' && error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Show technical details</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap overflow-auto max-h-48 p-2 bg-white bg-opacity-50 rounded">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`px-4 py-2 text-white rounded ${styles.button} transition-colors`}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 