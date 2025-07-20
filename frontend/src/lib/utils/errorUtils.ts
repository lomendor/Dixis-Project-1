/**
 * Utility functions for TypeScript-safe error handling
 */

/**
 * Converts unknown error to Error instance
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  
  return new Error(String(error));
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return String(error);
}

/**
 * Creates a context object from unknown error for logging
 */
export function errorToContext(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error && typeof error === 'object') {
    return { error: String(error) };
  }
  
  return { error: String(error) };
}

/**
 * Safely converts string or null to context object for logging
 */
export function stringToContext(value: string | null | undefined, key: string = 'value'): Record<string, any> | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return { [key]: value };
}

/**
 * Safe number to context conversion
 */
export function numberToContext(value: number, key: string = 'value'): Record<string, any> {
  return { [key]: value };
}