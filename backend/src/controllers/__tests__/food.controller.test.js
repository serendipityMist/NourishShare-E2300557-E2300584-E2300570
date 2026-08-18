import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockFood = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
};
const mockUploadFileInCloudinary = jest.fn();

jest.unstable_mockModule('../../models/food.model.js', () => ({ Food: mockFood }));
jest.unstable_mockModule('../../utils/cloudinary.js', () => ({ uploadFileInCloudinary: mockUploadFileInCloudinary }));

const {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
  getFoodDetails,
  getMyFoodItems,
  markFoodAsUsed,
  browseFoodItems,
} = await import('../food.controller.js');

function validFoodBody(overrides = {}) {
  return {
    name: 'Milk',
    number: '2',
    units: 'L',
    expiryDate: '2026-12-01',
    status: 'Available',
    description: 'Fresh milk',
    storageLocation: 'Refrigerator',
    category: 'cat1',
    ...overrides,
  };
}

function withPopulate(value, times = 1) {
  const chain = { populate: jest.fn() };
  chain.populate.mockReturnValue(chain);
  // last populate call resolves; simplest: make populate return a thenable chain
  const populated = {
    populate: jest.fn().mockReturnThis(),
    then: (resolve) => resolve(value),
  };
  return populated;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('addFoodItem', () => {
  it('rejects (400) listing every missing required field', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, body: {}, files: {} });
    const res = mockResponse();
    const next = jest.fn();

    addFoodItem(req, res, next);
    await flushPromises();

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/name/);
    expect(err.message).toMatch(/units/);
  });

  it('rejects (400) for a zero or negative quantity', async () => {
    const req = mockRequest({
      user: { _id: 'u1' },
      body: validFoodBody({ number: '0' }),
      files: { foodImage: [{ path: '/tmp/x.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) for a non-numeric quantity', async () => {
    const req = mockRequest({
      user: { _id: 'u1' },
      body: validFoodBody({ number: 'abc' }),
      files: { foodImage: [{ path: '/tmp/x.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) when no food image is uploaded', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, body: validFoodBody(), files: {} });
    const res = mockResponse();
    const next = jest.fn();

    addFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (500) when the image upload fails', async () => {
    mockUploadFileInCloudinary.mockResolvedValue(null);
    const req = mockRequest({
      user: { _id: 'u1' },
      body: validFoodBody(),
      files: { foodImage: [{ path: '/tmp/x.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('creates a food item and returns 201 on success', async () => {
    mockUploadFileInCloudinary.mockResolvedValue({ secure_url: 'https://cdn/milk.png' });
    mockFood.create.mockResolvedValue({ _id: 'food1' });
    mockFood.findById.mockReturnValue(withPopulate({ _id: 'food1', name: 'Milk' }));

    const req = mockRequest({
      user: { _id: 'u1' },
      body: validFoodBody(),
      files: { foodImage: [{ path: '/tmp/x.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addFoodItem(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(mockFood.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Milk',
        quantity: { number: 2, units: 'L' },
        foodImage: 'https://cdn/milk.png',
        owner: 'u1',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('editFoodItem', () => {
  it('rejects (400) for missing fields', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' }, body: {} });
    const res = mockResponse();
    const next = jest.fn();

    editFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the food item does not belong to the user', async () => {
    mockFood.findOne.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' }, body: validFoodBody(), files: {} });
    const res = mockResponse();
    const next = jest.fn();

    editFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('updates fields and keeps the old image when no new image is provided', async () => {
    const foodDoc = { foodImage: 'https://cdn/old.png', save: jest.fn().mockResolvedValue(true) };
    mockFood.findOne.mockResolvedValue(foodDoc);
    mockFood.findById.mockReturnValue(withPopulate({ _id: 'f1' }));

    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'f1' },
      body: validFoodBody({ name: 'Whole Milk' }),
      files: {},
    });
    const res = mockResponse();
    const next = jest.fn();

    editFoodItem(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(foodDoc.name).toBe('Whole Milk');
    expect(foodDoc.foodImage).toBe('https://cdn/old.png');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('replaces the image when a new one is uploaded', async () => {
    const foodDoc = { foodImage: 'https://cdn/old.png', save: jest.fn().mockResolvedValue(true) };
    mockFood.findOne.mockResolvedValue(foodDoc);
    mockUploadFileInCloudinary.mockResolvedValue({ url: 'https://cdn/new.png' });
    mockFood.findById.mockReturnValue(withPopulate({ _id: 'f1' }));

    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'f1' },
      body: validFoodBody(),
      files: { foodImage: [{ path: '/tmp/new.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    editFoodItem(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(foodDoc.foodImage).toBe('https://cdn/new.png');
  });

  it('rejects (500) when the new image upload fails', async () => {
    mockFood.findOne.mockResolvedValue({ foodImage: 'old.png' });
    mockUploadFileInCloudinary.mockResolvedValue(null);

    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'f1' },
      body: validFoodBody(),
      files: { foodImage: [{ path: '/tmp/new.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    editFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });
});

describe('deleteFoodItem', () => {
  it('rejects (404) when the food item is not owned by the user', async () => {
    mockFood.findOne.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (500) when the delete operation fails', async () => {
    mockFood.findOne.mockResolvedValue({ _id: 'f1' });
    mockFood.findByIdAndDelete.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteFoodItem(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('deletes the food item and returns 200 on success', async () => {
    mockFood.findOne.mockResolvedValue({ _id: 'f1' });
    mockFood.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteFoodItem(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getFoodDetails', () => {
  it('rejects (404) when the item is not found for this owner', async () => {
    mockFood.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    getFoodDetails(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('returns the food details on success', async () => {
    mockFood.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: 'f1', name: 'Milk' }) });
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    getFoodDetails(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getMyFoodItems', () => {
  it('returns an empty list with the "no items" message', async () => {
    mockFood.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getMyFoodItems(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toMatch(/No food items/);
  });

  it('returns the list of owned food items', async () => {
    mockFood.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([{ _id: 'f1' }, { _id: 'f2' }]) });
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getMyFoodItems(req, res, next);
    await flushPromises();

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.foods).toHaveLength(2);
  });
});

describe('markFoodAsUsed', () => {
  it('rejects (404) when the item is not found for this owner', async () => {
    mockFood.findOne.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    markFoodAsUsed(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when the item is already marked used', async () => {
    mockFood.findOne.mockResolvedValue({ status: 'Used' });
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    markFoodAsUsed(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) when the item has already been donated', async () => {
    mockFood.findOne.mockResolvedValue({ status: 'Donated' });
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    markFoodAsUsed(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('marks an available item as used', async () => {
    const foodDoc = { status: 'Available', save: jest.fn().mockResolvedValue(true) };
    mockFood.findOne.mockResolvedValue(foodDoc);
    mockFood.findById.mockReturnValue(withPopulate({ _id: 'f1', status: 'Used' }));

    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'f1' } });
    const res = mockResponse();
    const next = jest.fn();

    markFoodAsUsed(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(foodDoc.status).toBe('Used');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('browseFoodItems', () => {
  it('filters by owner only when no query params are given', async () => {
    mockFood.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
    const req = mockRequest({ user: { _id: 'u1' }, query: {} });
    const res = mockResponse();
    const next = jest.fn();

    browseFoodItems(req, res, next);
    await flushPromises();

    expect(mockFood.find).toHaveBeenCalledWith({ owner: 'u1' });
  });

  it('applies category, storageLocation, status, and expiryBefore filters', async () => {
    mockFood.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
    const req = mockRequest({
      user: { _id: 'u1' },
      query: { category: 'cat1', storageLocation: 'Pantry', status: 'Available', expiryBefore: '2026-01-01' },
    });
    const res = mockResponse();
    const next = jest.fn();

    browseFoodItems(req, res, next);
    await flushPromises();

    const filterArg = mockFood.find.mock.calls[0][0];
    expect(filterArg.category).toBe('cat1');
    expect(filterArg.storageLocation).toBe('Pantry');
    expect(filterArg.status).toBe('Available');
    expect(filterArg.expiryDate.$lte).toBeInstanceOf(Date);
  });
});
