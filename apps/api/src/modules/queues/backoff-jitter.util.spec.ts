import { calculateBackoffWithJitter } from './backoff-jitter.util';

describe('calculateBackoffWithJitter', () => {
  it('should return baseDelayMs for attempt 0 or 1 within jitter bounds', () => {
    const delay = calculateBackoffWithJitter(1, {
      baseDelayMs: 1000,
      jitterFactor: 0.2,
    });
    expect(delay).toBeGreaterThanOrEqual(800);
    expect(delay).toBeLessThanOrEqual(1200);
  });

  it('should increase exponentially with attempts', () => {
    const delays = [1, 2, 3, 4].map((attempt) =>
      calculateBackoffWithJitter(attempt, {
        baseDelayMs: 1000,
        jitterFactor: 0, // Deterministic test
      }),
    );

    expect(delays).toEqual([1000, 2000, 4000, 8000]);
  });

  it('should cap delay at maxDelayMs', () => {
    const delay = calculateBackoffWithJitter(20, {
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      jitterFactor: 0,
    });

    expect(delay).toBe(10000);
  });

  it('should stay within jitter bounds', () => {
    for (let i = 0; i < 50; i++) {
      const delay = calculateBackoffWithJitter(3, {
        baseDelayMs: 1000,
        jitterFactor: 0.25,
      });
      // exponential is 4000, 25% jitter is 3000 to 5000
      expect(delay).toBeGreaterThanOrEqual(3000);
      expect(delay).toBeLessThanOrEqual(5000);
    }
  });
});
