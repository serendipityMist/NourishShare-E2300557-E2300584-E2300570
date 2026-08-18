import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockNotification = {
  find: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
};

jest.unstable_mockModule('../../models/notification.model.js', () => ({ Notification: mockNotification }));

const { getMyNotifications, markNotificationRead, markAllNotificationsRead } = await import(
  '../notification.controller.js'
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getMyNotifications', () => {
  it('returns the "no notifications" message for an empty list', async () => {
    mockNotification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getMyNotifications(req, res, next);
    await flushPromises();

    expect(mockNotification.find).toHaveBeenCalledWith({ owner: 'u1' });
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toMatch(/No notifications/);
  });

  it('returns notifications sorted by newest first', async () => {
    const sortMock = jest.fn().mockResolvedValue([{ _id: 'n1' }]);
    mockNotification.find.mockReturnValue({ sort: sortMock });
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getMyNotifications(req, res, next);
    await flushPromises();

    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('markNotificationRead', () => {
  it('rejects (404) when the notification does not belong to the user', async () => {
    mockNotification.findOne.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'n1' } });
    const res = mockResponse();
    const next = jest.fn();

    markNotificationRead(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('marks the notification as read', async () => {
    const notif = { isRead: false, save: jest.fn().mockResolvedValue(true) };
    mockNotification.findOne.mockResolvedValue(notif);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'n1' } });
    const res = mockResponse();
    const next = jest.fn();

    markNotificationRead(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(notif.isRead).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('markAllNotificationsRead', () => {
  it('marks all unread notifications owned by the user as read', async () => {
    mockNotification.updateMany.mockResolvedValue({ modifiedCount: 3 });
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    markAllNotificationsRead(req, res, next);
    await flushPromises();

    expect(mockNotification.updateMany).toHaveBeenCalledWith(
      { owner: 'u1', isRead: false },
      { $set: { isRead: true } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
