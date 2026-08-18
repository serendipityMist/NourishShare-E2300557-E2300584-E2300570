import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  retryWithBackoff,
  getDetailedErrorMessage,
  isRetryableError,
  parseError,
} from '../errorHandling.js';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the result immediately when the function succeeds on the first try', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryWithBackoff(fn, 3, 10);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce('ok');

    const promise = retryWithBackoff(fn, 3, 10);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 400-level client error other than 408/429', async () => {
    const error = { response: { status: 404 } };
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, 3, 10)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does retry a 429 (rate limit) error', async () => {
    const error = { response: { status: 429 } };
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('ok');

    const promise = retryWithBackoff(fn, 3, 10);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws the last error after exhausting all retries', async () => {
    const error = new Error('always fails');
    const fn = vi.fn().mockRejectedValue(error);

    const promise = retryWithBackoff(fn, 2, 10);
    const assertion = expect(promise).rejects.toBe(error);
    await vi.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});

describe('getDetailedErrorMessage', () => {
  it('returns a network message when no error is given', () => {
    expect(getDetailedErrorMessage(null)).toMatch(/Network error/);
  });

  it('prefers the API response message', () => {
    const error = { response: { data: { message: 'Invalid input' } } };
    expect(getDetailedErrorMessage(error)).toBe('Invalid input');
  });

  it('recognizes a timeout message', () => {
    const error = { message: 'Request timeout exceeded' };
    expect(getDetailedErrorMessage(error)).toMatch(/timed out/);
  });

  it('recognizes a generic network failure message', () => {
    const error = { message: 'Network Error' };
    expect(getDetailedErrorMessage(error)).toMatch(/Network error/);
  });

  it('falls back to the raw error message when nothing else matches', () => {
    const error = { message: 'Something specific broke' };
    expect(getDetailedErrorMessage(error)).toBe('Something specific broke');
  });

  it('falls back to the default message when the error has none', () => {
    expect(getDetailedErrorMessage({}, 'fallback text')).toBe('fallback text');
  });
});

describe('isRetryableError', () => {
  it('returns false for no error', () => {
    expect(isRetryableError(null)).toBe(false);
  });

  it('returns true for a network/timeout message', () => {
    expect(isRetryableError({ message: 'Network Error' })).toBe(true);
    expect(isRetryableError({ message: 'timeout of 5000ms exceeded' })).toBe(true);
  });

  it('returns true for 408, 429, and 5xx status codes', () => {
    expect(isRetryableError({ response: { status: 408 } })).toBe(true);
    expect(isRetryableError({ response: { status: 429 } })).toBe(true);
    expect(isRetryableError({ response: { status: 503 } })).toBe(true);
  });

  it('returns false for a normal 4xx status code', () => {
    expect(isRetryableError({ response: { status: 404 } })).toBe(false);
  });

  it('returns true when there is no response and the request was not canceled', () => {
    expect(isRetryableError({ code: 'ECONNABORTED' })).toBe(true);
  });

  it('returns false when the request was explicitly canceled', () => {
    expect(isRetryableError({ code: 'ERR_CANCELED' })).toBe(false);
  });
});

describe('parseError', () => {
  it('builds a structured error object from an axios-style error', () => {
    const error = { response: { status: 500, data: { message: 'Server exploded' } } };
    const parsed = parseError(error);
    expect(parsed.code).toBe(500);
    expect(parsed.message).toBe('Server exploded');
    expect(parsed.isRetryable).toBe(true);
    expect(typeof parsed.timestamp).toBe('string');
  });

  it('falls back to error.code or UNKNOWN_ERROR when there is no response', () => {
    expect(parseError({ code: 'ECONNRESET' }).code).toBe('ECONNRESET');
    expect(parseError({}).code).toBe('UNKNOWN_ERROR');
  });
});
