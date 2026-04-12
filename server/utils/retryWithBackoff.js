/**
 * Retry a function with exponential backoff.
 * 429s keep the full retry budget.
 * 5xx errors get a much smaller retry budget so we do not hammer a
 * struggling provider for long stretches across many lessons.
 */
const TRANSIENT_WINDOW_MS = 60_000;
const TRANSIENT_COOLDOWN_MS = 30_000;
const TRANSIENT_FAILURE_LIMIT = 3;

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
        throw cooldownError;
      }

      const result = await fn();
      resetTransientState();
      return result;
    } catch (error) {
      lastError = error;

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

      const retryLimit = isServerError ? Math.min(maxRetries, 1) : maxRetries;
      if (attempt === retryLimit || transientState.cooldownUntil > Date.now()) {
        throw error;
      }

      const expDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * baseDelay);
      const delay = expDelay + jitter;

      console.log(
        `Transient error (status=${status}). Retrying in ${delay}ms... (${attempt + 1}/${retryLimit})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export default retryWithBackoff;
