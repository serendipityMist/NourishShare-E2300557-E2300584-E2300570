import { jest } from '@jest/globals';

export function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
}

export function mockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    cookies: {},
    files: undefined,
    user: undefined,
    header: jest.fn(() => undefined),
    ...overrides,
  };
}

// asyncHandler swallows both sync throws (inside the async fn) and rejected
// promises, forwarding them to next(). Awaiting this flushes the microtask
// queue so `next` has been called by the time we assert on it.
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));
