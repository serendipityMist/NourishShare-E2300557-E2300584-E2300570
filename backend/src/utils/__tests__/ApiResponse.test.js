import { describe, it, expect } from '@jest/globals';
import { ApiResponse } from '../ApiReponse.js';

describe('ApiResponse', () => {
  it('marks success=true for status codes under 400', () => {
    const res = new ApiResponse(200, { id: 1 }, 'ok');
    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({ id: 1 });
    expect(res.message).toBe('ok');
  });

  it('marks success=false for status codes 400 and above', () => {
    const res = new ApiResponse(400, null, 'bad request');
    expect(res.success).toBe(false);
  });

  it('marks the 399/400 boundary correctly', () => {
    expect(new ApiResponse(399, {}).success).toBe(true);
    expect(new ApiResponse(400, {}).success).toBe(false);
  });

  it('defaults the message to "Success" when omitted', () => {
    const res = new ApiResponse(200, {});
    expect(res.message).toBe('Success');
  });
});
