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

      const isRateLimitError =
        error?.status === 429 &&
        !isQuotaExceeded;

      if (isQuotaExceeded) {
        throw new Error('Daily Gemini quota exhausted');
      }

      if (attempt === maxRetries || !isRateLimitError) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);

      console.log(
        `⏳ Rate limit hit. Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export default retryWithBackoff;
