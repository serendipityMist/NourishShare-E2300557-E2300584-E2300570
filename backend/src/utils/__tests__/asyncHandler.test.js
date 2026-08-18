import { describe, it, expect, jest } from '@jest/globals';
import { asyncHandler } from '../asyncHandler.js';

describe('asyncHandler', () => {
  it('invokes the wrapped handler with (req, res, next)', async () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrapped = asyncHandler(handler);
    const req = {};
    const res = {};
    const next = jest.fn();

    wrapped(req, res, next);
    await new Promise(setImmediate);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it('forwards a rejected promise to next()', async () => {
    const error = new Error('boom');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    const next = jest.fn();

    wrapped({}, {}, next);
    await new Promise(setImmediate);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('forwards a synchronous throw inside an async handler to next()', async () => {
    const error = new Error('sync boom');
    const handler = jest.fn(async () => {
      throw error;
    });
    const wrapped = asyncHandler(handler);
    const next = jest.fn();

    wrapped({}, {}, next);
    await new Promise(setImmediate);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next() when the handler resolves successfully', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const next = jest.fn();

    wrapped({}, {}, next);
    await new Promise(setImmediate);

    expect(next).not.toHaveBeenCalled();
  });
});
