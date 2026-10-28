export interface BackoffJitterOptions {
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterFactor?: number; // 0 to 1
}

/**
 * Calculates exponential backoff with randomized jitter to prevent thundering herds.
 * @param attempt 1-indexed attempt number
 * @param options configuration for base, max, and jitter ratio
 * @returns delay in milliseconds
 */
export function calculateBackoffWithJitter(
  attempt: number,
  options: BackoffJitterOptions = {},
): number {
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 60000;
  const jitterFactor = options.jitterFactor ?? 0.25;

  if (attempt <= 0) {
    return baseDelayMs;
  }

  // Calculate exponential delay: base * 2^(attempt - 1)
  const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));

  // Apply symmetric jitter: delay ± (jitterFactor * delay)
  const jitterRange = exponentialDelay * jitterFactor;
  const jitterDelta = (Math.random() * 2 - 1) * jitterRange; // range: [-jitterRange, +jitterRange]

  const finalDelay = Math.round(exponentialDelay + jitterDelta);

  return Math.max(baseDelayMs, Math.min(maxDelayMs, finalDelay));
}
