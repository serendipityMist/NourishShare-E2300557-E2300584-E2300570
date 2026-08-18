import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockUser = { findById: jest.fn() };

jest.unstable_mockModule('../../models/user.models.js', () => ({ User: mockUser }));

const { verifyJWT } = await import('../auth.middleware.js');

function buildToken(payload, secret = process.env.ACCESS_TOKEN_SECRET, expiresIn = '1h') {
  return jwt.sign(payload, secret, { expiresIn });
}

describe('verifyJWT middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next(ApiError 401) when no token is present', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    verifyJWT(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('accepts a valid Authorization header token and attaches req.user', async () => {
    const token = buildToken({ _id: 'user123' });
    const req = mockRequest({ header: jest.fn((name) => (name === 'Authorization' ? `Bearer ${token}` : undefined)) });
    const res = mockResponse();
    const next = jest.fn();

    mockUser.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'user123', isAccountActive: true }),
    });

    verifyJWT(req, res, next);
    await flushPromises();

    expect(mockUser.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toEqual({ _id: 'user123', isAccountActive: true });
    expect(next).toHaveBeenCalledWith();
  });

  it('accepts a valid cookie token when no Authorization header is present', async () => {
    const token = buildToken({ _id: 'user456' });
    const req = mockRequest({ cookies: { accessToken: token } });
    const res = mockResponse();
    const next = jest.fn();

    mockUser.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'user456', isAccountActive: true }),
    });

    verifyJWT(req, res, next);
    await flushPromises();

    expect(req.user._id).toBe('user456');
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(ApiError 401) when the user no longer exists', async () => {
    const token = buildToken({ _id: 'ghost' });
    const req = mockRequest({ cookies: { accessToken: token } });
    const res = mockResponse();
    const next = jest.fn();

    mockUser.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    verifyJWT(req, res, next);
    await flushPromises();

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('rejects an inactive account (re-wrapped as 401 by the outer catch block)', async () => {
    // NOTE: the middleware raises a 403 ApiError for inactive accounts, but its
    // try/catch wraps that same block and rethrows everything as a generic 401
    // ("Account is not active...") -- this test documents that actual behavior.
    const token = buildToken({ _id: 'inactive' });
    const req = mockRequest({ cookies: { accessToken: token } });
    const res = mockResponse();
    const next = jest.fn();

    mockUser.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'inactive', isAccountActive: false }),
    });

    verifyJWT(req, res, next);
    await flushPromises();

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toMatch(/not active/i);
  });

  it('calls next(ApiError 401 "Access token expired") for an expired token', async () => {
    const expiredToken = buildToken({ _id: 'user789' }, process.env.ACCESS_TOKEN_SECRET, '-1s');
    const req = mockRequest({ cookies: { accessToken: expiredToken } });
    const res = mockResponse();
    const next = jest.fn();

    verifyJWT(req, res, next);
    await flushPromises();

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toMatch(/expired/i);
  });

  it('calls next(ApiError 401) for a token signed with the wrong secret', async () => {
    const badToken = buildToken({ _id: 'user000' }, 'wrong-secret');
    const req = mockRequest({ cookies: { accessToken: badToken } });
    const res = mockResponse();
    const next = jest.fn();

    verifyJWT(req, res, next);
    await flushPromises();

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});
