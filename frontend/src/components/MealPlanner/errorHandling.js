/**
 * Retry mechanism with exponential backoff for network requests
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms for exponential backoff (default: 1000)
 * @returns {Promise} Result of the function or throws after all retries exhausted
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response?.status !== 408 && error.response?.status !== 429) {
          throw error;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff: baseDelay * 2^attempt + random jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Generate user-friendly error message from error object
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Fallback message if error can't be parsed
 * @returns {string} User-friendly error message
 */
export function getDetailedErrorMessage(error, defaultMessage = 'An error occurred') {
  // Network errors
  if (!error) {
    return 'Network error - please check your connection';
  }

  // Axios error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Custom API error message
  if (error.message) {
    // Check for specific error patterns
    if (error.message.includes('timeout')) {
      return 'Request timed out - please try again';
    }
    if (error.message.includes('Network')) {
      return 'Network error - please check your connection';
    }
    return error.message;
  }

  return defaultMessage;
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} Whether the error should be retried
 */
export function isRetryableError(error) {
  if (!error) return false;

  // Retry on network errors
  if (error.message?.includes('Network') || error.message?.includes('timeout')) {
    return true;
  }

  // Retry on specific HTTP status codes
  const status = error.response?.status;
  if (status && (status === 408 || status === 429 || status >= 500)) {
    return true;
  }

  // Retry on no response (network failure)
  if (!error.response && error.code !== 'ERR_CANCELED') {
    return true;
  }

  return false;
}

/**
 * Wrap an API call with error handling and retry logic
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Function} onError - Callback when error occurs with (error, retryFn)
 * @param {Function} onRetry - Callback when retry is attempted
 * @returns {Promise} Result of the API call
 */
export async function withErrorHandling(apiCall, onError, onRetry) {
  let retryCount = 0;
  const maxRetries = 3;

  const attemptCall = async () => {
    try {
      return await retryWithBackoff(apiCall, maxRetries);
    } catch (error) {
      if (onError) {
        const shouldRetry = isRetryableError(error) && retryCount < maxRetries;
        onError(error, shouldRetry ? attemptCall : null);
        if (shouldRetry) {
          retryCount++;
          if (onRetry) {
            onRetry(retryCount);
          }
          return attemptCall();
        }
      }
      throw error;
    }
  };

  return attemptCall();
}

/**
 * Parse error response and extract relevant information
 * @param {Error} error - The error object
 * @returns {Object} Parsed error object with code, message, and details
 */
export function parseError(error) {
  return {
    code: error.response?.status || error.code || 'UNKNOWN_ERROR',
    message: getDetailedErrorMessage(error),
    details: error.response?.data || error.message,
    isRetryable: isRetryableError(error),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log error for debugging (can be extended to send to monitoring service)
 * @param {Error} error - The error to log
 * @param {string} context - Context where error occurred
 */
export function logError(error, context) {
  const parsed = parseError(error);
  console.error(`[${context}] Error:`, {
    ...parsed,
    originalError: error,
  });

  // TODO: Send to monitoring service like Sentry
  // Sentry.captureException(error, { contexts: { location: context } });
}
