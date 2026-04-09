/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>}
 */
const retryWithBackoff = async (fn, maxRetries = 5, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isQuotaExceeded = error?.errorDetails?.some(
        (d) => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
      );

      const status = error?.status || (error?.response && error.response.status);

      const isRateLimitError = status === 429 && !isQuotaExceeded;

      // Treat 5xx server errors as transient and retryable (e.g., 503 Service Unavailable)
      const isServerError = status >= 500 && status < 600;

      if (isQuotaExceeded) {
        throw new Error('Daily API quota exhausted');
      }

      const shouldRetry = isRateLimitError || isServerError;

      if (attempt === maxRetries || !shouldRetry) {
        throw error;
      }

      // exponential backoff with jitter
      const expDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * baseDelay);
      const delay = expDelay + jitter;

      console.log(
        `⏳ Transient error (status=${status}). Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export default retryWithBackoff;
