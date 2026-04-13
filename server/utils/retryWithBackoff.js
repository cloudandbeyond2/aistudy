/**
 * Retry a function with exponential backoff.
 * Keep retries intentionally conservative so one bad Gemini window does not
 * turn into a burst of repeated API calls across multiple requests.
 */
const TRANSIENT_WINDOW_MS = 60_000;
const TRANSIENT_COOLDOWN_MS = 45_000;
const TRANSIENT_FAILURE_LIMIT = 2;
const MAX_RETRYABLE_ATTEMPTS = 1;
const MIN_RETRY_DELAY_MS = 1_500;
const MAX_RETRY_DELAY_MS = 6_000;

const transientState = {
  count: 0,
  lastFailureAt: 0,
  cooldownUntil: 0
};

const resetTransientState = () => {
  transientState.count = 0;
  transientState.lastFailureAt = 0;
  transientState.cooldownUntil = 0;
};

const recordTransientFailure = () => {
  const now = Date.now();

  if (now - transientState.lastFailureAt > TRANSIENT_WINDOW_MS) {
    transientState.count = 0;
  }

  transientState.lastFailureAt = now;
  transientState.count += 1;

  if (transientState.count >= TRANSIENT_FAILURE_LIMIT) {
    transientState.cooldownUntil = now + TRANSIENT_COOLDOWN_MS;
  }
};

const retryWithBackoff = async (fn, maxRetries = 5, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (transientState.cooldownUntil && Date.now() < transientState.cooldownUntil) {
        const cooldownError = new Error(
          'AI provider temporarily unavailable. Cooling down before retrying again.'
        );
        cooldownError.status = 503;
        cooldownError.retryable = false;
        cooldownError.code = 'AI_PROVIDER_COOLDOWN';
        throw cooldownError;
      }

      const result = await fn();
      resetTransientState();
      return result;
    } catch (error) {
      lastError = error;

      if (error?.code === 'AI_PROVIDER_COOLDOWN' || error?.retryable === false) {
        throw error;
      }

      const isQuotaExceeded = error?.errorDetails?.some(
        (detail) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
      );
      const status = error?.status || error?.response?.status;
      const isRateLimitError = status === 429 && !isQuotaExceeded;
      const isServerError = status >= 500 && status < 600;
      const shouldRetry = isRateLimitError || isServerError;

      if (isQuotaExceeded) {
        throw new Error('Daily API quota exhausted');
      }

      if (!shouldRetry) {
        throw error;
      }

      recordTransientFailure();

      const retryLimit = Math.min(maxRetries, MAX_RETRYABLE_ATTEMPTS);
      if (attempt === retryLimit || transientState.cooldownUntil > Date.now()) {
        throw error;
      }

      const effectiveBaseDelay = Math.max(
        MIN_RETRY_DELAY_MS,
        Math.min(baseDelay, MAX_RETRY_DELAY_MS)
      );
      const expDelay = effectiveBaseDelay * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * Math.min(effectiveBaseDelay, 1000));
      const delay = Math.min(expDelay + jitter, MAX_RETRY_DELAY_MS);

      console.log(
        `Transient error (status=${status}). Retrying in ${delay}ms... (${attempt + 1}/${retryLimit})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export default retryWithBackoff;
