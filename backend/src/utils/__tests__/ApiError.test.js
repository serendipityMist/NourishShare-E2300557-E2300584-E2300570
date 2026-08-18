import { describe, it, expect } from '@jest/globals';
import { ApiError } from '../ApiError.js';

describe('ApiError', () => {
  it('sets statusCode, message, success=false and empty data by default', () => {
    const err = new ApiError(404, 'Not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.success).toBe(false);
    expect(err.data).toBeNull();
    expect(err.errors).toEqual([]);
    expect(err).toBeInstanceOf(Error);
  });

  it('falls back to a default message when none is given', () => {
    const err = new ApiError(500);
    expect(err.message).toBe('Something Went Wrong');
  });

  it('stores a custom errors array when provided', () => {
    const err = new ApiError(400, 'Bad request', ['field is required']);
    expect(err.errors).toEqual(['field is required']);
  });

  it('uses a provided stack instead of generating one', () => {
    const err = new ApiError(400, 'Bad', [], 'custom-stack-trace');
    expect(err.stack).toBe('custom-stack-trace');
  });

  it('auto-generates a stack trace when none is provided', () => {
    const err = new ApiError(400, 'Bad');
    expect(typeof err.stack).toBe('string');
    expect(err.stack.length).toBeGreaterThan(0);
  });
});
