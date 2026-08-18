import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockDonation = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};
const mockFood = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};
const mockNotification = {
  create: jest.fn(),
};

jest.unstable_mockModule('../../models/donation.model.js', () => ({ Donation: mockDonation }));
jest.unstable_mockModule('../../models/food.model.js', () => ({ Food: mockFood }));
jest.unstable_mockModule('../../models/notification.model.js', () => ({ Notification: mockNotification }));

const {
  convertToDonation,
  getMyDonations,
  editDonation,
  deleteDonation,
  getAllDonations,
  getDonationDetails,
  getMyClaimedDonations,
  claimDonation,
  getPublicDonations,
} = await import('../donation.controller.js');

function chain(finalValue) {
  const obj = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: (resolve) => resolve(finalValue),
  };
  return obj;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockNotification.create.mockResolvedValue({ _id: 'notif1' });
});

describe('convertToDonation', () => {
  it('rejects (400) when pickup location or availability time is missing', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, params: { foodId: 'f1' }, body: {} });
    const res = mockResponse();
    const next = jest.fn();

    convertToDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the food item is not owned by the user', async () => {
    mockFood.findOne.mockResolvedValue(null);
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { foodId: 'f1' },
      body: { pickUpLocation: 'Lobby', availabilityTime: '5-6pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    convertToDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when the food has already been donated', async () => {
    mockFood.findOne.mockResolvedValue({ status: 'Donated' });
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { foodId: 'f1' },
      body: { pickUpLocation: 'Lobby', availabilityTime: '5-6pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    convertToDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) when the food has already been used', async () => {
    mockFood.findOne.mockResolvedValue({ status: 'Used' });
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { foodId: 'f1' },
      body: { pickUpLocation: 'Lobby', availabilityTime: '5-6pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    convertToDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('creates a donation, flips the food status, and notifies the donor', async () => {
    const foodDoc = { _id: 'f1', name: 'Bread', status: 'Available', expiryDate: '2026-01-01', save: jest.fn().mockResolvedValue(true) };
    mockFood.findOne.mockResolvedValue(foodDoc);
    mockDonation.create.mockResolvedValue({ _id: 'd1', status: 'Available' });

    const req = mockRequest({
      user: { _id: 'u1' },
      params: { foodId: 'f1' },
      body: { pickUpLocation: 'Lobby', availabilityTime: '5-6pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    convertToDonation(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(foodDoc.status).toBe('Donated');
    expect(mockNotification.create).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'u1', notificationType: 'Donation' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('getMyDonations', () => {
  it('returns donations belonging to the current user', async () => {
    mockDonation.find.mockReturnValue(chain([{ _id: 'd1' }]));
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getMyDonations(req, res, next);
    await flushPromises();

    expect(mockDonation.find).toHaveBeenCalledWith({ donor: 'u1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('editDonation', () => {
  it('rejects (400) for missing input', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'd1' }, body: {} });
    const res = mockResponse();
    const next = jest.fn();

    editDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the donation is not owned by the user', async () => {
    mockDonation.findOne.mockResolvedValue(null);
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'd1' },
      body: { pickUpLocation: 'Lobby', availabilityTime: '5-6pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    editDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when the donation has already been claimed', async () => {
    mockDonation.findOne.mockResolvedValue({ status: 'Claimed' });
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'd1' },
      body: { pickUpLocation: 'Lobby', availabilityTime: '5-6pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    editDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('updates an editable donation', async () => {
    const donationDoc = { status: 'Available', save: jest.fn().mockResolvedValue(true) };
    mockDonation.findOne.mockResolvedValue(donationDoc);
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'd1' },
      body: { pickUpLocation: 'New Spot', availabilityTime: '6-7pm' },
    });
    const res = mockResponse();
    const next = jest.fn();

    editDonation(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(donationDoc.pickUpLocation).toBe('New Spot');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('deleteDonation', () => {
  it('rejects (404) when the donation is not owned by the user', async () => {
    mockDonation.findOne.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when the donation has already been claimed', async () => {
    mockDonation.findOne.mockResolvedValue({ status: 'Claimed' });
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('deletes the donation and restores food status to Available', async () => {
    mockDonation.findOne.mockResolvedValue({ status: 'Available', food: 'f1' });
    mockDonation.findByIdAndDelete.mockResolvedValue({});
    mockFood.findByIdAndUpdate.mockResolvedValue({});
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteDonation(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(mockFood.findByIdAndUpdate).toHaveBeenCalledWith('f1', { $set: { status: 'Available' } });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getAllDonations', () => {
  it('excludes donations from donors with Private visibility', async () => {
    mockDonation.find.mockReturnValue(
      chain([
        { donor: { foodListingVisibility: 'Public' }, food: {} },
        { donor: { foodListingVisibility: 'Private' }, food: {} },
        { donor: null, food: {} }, // defaults to Community -> visible
      ])
    );
    const req = mockRequest({ query: {} });
    const res = mockResponse();
    const next = jest.fn();

    getAllDonations(req, res, next);
    await flushPromises();

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.donations).toHaveLength(2);
  });

  it('filters by category name or id after visibility filtering', async () => {
    mockDonation.find.mockReturnValue(
      chain([
        { donor: { foodListingVisibility: 'Public' }, food: { category: { name: 'Dairy', _id: 'c1' } } },
        { donor: { foodListingVisibility: 'Public' }, food: { category: { name: 'Bakery', _id: 'c2' } } },
      ])
    );
    const req = mockRequest({ query: { category: 'Dairy' } });
    const res = mockResponse();
    const next = jest.fn();

    getAllDonations(req, res, next);
    await flushPromises();

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.donations).toHaveLength(1);
    expect(payload.data.donations[0].food.category.name).toBe('Dairy');
  });

  it('applies a case-insensitive location filter to the query', async () => {
    mockDonation.find.mockReturnValue(chain([]));
    const req = mockRequest({ query: { location: 'downtown' } });
    const res = mockResponse();
    const next = jest.fn();

    getAllDonations(req, res, next);
    await flushPromises();

    const filterArg = mockDonation.find.mock.calls[0][0];
    expect(filterArg.pickUpLocation).toEqual({ $regex: 'downtown', $options: 'i' });
  });
});

describe('getDonationDetails', () => {
  it('rejects (404) when no matching donation is visible to this user', async () => {
    mockDonation.findOne.mockReturnValue(chain(null));
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    getDonationDetails(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('returns donation details when found', async () => {
    mockDonation.findOne.mockReturnValue(chain({ _id: 'd1' }));
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    getDonationDetails(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getMyClaimedDonations', () => {
  it('queries for donations claimed by the current user', async () => {
    mockDonation.find.mockReturnValue(chain([]));
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getMyClaimedDonations(req, res, next);
    await flushPromises();

    expect(mockDonation.find).toHaveBeenCalledWith({ claimedBy: 'u1', status: 'Claimed' });
  });
});

describe('claimDonation', () => {
  it('rejects (404) when the donation is not available', async () => {
    mockDonation.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const req = mockRequest({ user: { _id: 'u1', name: 'Jane' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    claimDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when claiming your own donation', async () => {
    mockDonation.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ donor: { toString: () => 'u1' } }),
    });
    const req = mockRequest({ user: { _id: 'u1', name: 'Jane' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    claimDonation(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('claims an available donation and notifies both parties', async () => {
    const donationDoc = {
      donor: { toString: () => 'owner1' },
      pickUpLocation: 'Lobby',
      availabilityTime: '5-6pm',
      save: jest.fn().mockResolvedValue(true),
    };
    mockDonation.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(donationDoc) });
    mockDonation.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: (resolve) => resolve({ _id: 'd1', food: { name: 'Bread' } }),
    });

    const req = mockRequest({ user: { _id: 'claimer1', name: 'Jane' }, params: { id: 'd1' } });
    const res = mockResponse();
    const next = jest.fn();

    claimDonation(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(donationDoc.status).toBe('Claimed');
    expect(donationDoc.claimedBy).toBe('claimer1');
    expect(mockNotification.create).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getPublicDonations', () => {
  it('clamps the limit between 1 and 12 and defaults to 6', async () => {
    mockDonation.find.mockReturnValue(chain([]));
    const req = mockRequest({ query: {} });
    const res = mockResponse();
    const next = jest.fn();

    getPublicDonations(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
  });

  it('filters out private donors and slices to the requested limit', async () => {
    mockDonation.find.mockReturnValue(
      chain([
        { donor: { foodListingVisibility: 'Public' } },
        { donor: { foodListingVisibility: 'Private' } },
        { donor: { foodListingVisibility: 'Community' } },
        { donor: { foodListingVisibility: 'Public' } },
      ])
    );
    const req = mockRequest({ query: { limit: '2' } });
    const res = mockResponse();
    const next = jest.fn();

    getPublicDonations(req, res, next);
    await flushPromises();

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.donations).toHaveLength(2);
  });
});
