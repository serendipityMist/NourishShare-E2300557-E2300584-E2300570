import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockMealPlan = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};
const mockFood = {
  find: jest.fn(),
  updateMany: jest.fn(),
};

jest.unstable_mockModule('../../models/mealPlan.model.js', () => ({ MealPlan: mockMealPlan }));
jest.unstable_mockModule('../../models/food.model.js', () => ({ Food: mockFood }));
jest.unstable_mockModule('../../models/notification.model.js', () => ({ Notification: { create: jest.fn() } }));

const { addMealPlanEntry, updateMealPlanEntry, getMyMealPlans, deleteMealPlanEntry } = await import(
  '../mealPlan.controller.js'
);

function withPopulate(value) {
  return { populate: jest.fn().mockResolvedValue(value) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFood.updateMany.mockResolvedValue({});
});

describe('addMealPlanEntry', () => {
  it('rejects (400) when day, mealType, or mealName is missing', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, body: { day: 'Monday' } });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) for an invalid day', async () => {
    const req = mockRequest({
      user: { _id: 'u1' },
      body: { day: 'Funday', mealType: 'Lunch', mealName: 'Pasta' },
    });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) for an invalid meal type', async () => {
    const req = mockRequest({
      user: { _id: 'u1' },
      body: { day: 'Monday', mealType: 'Brunch', mealName: 'Pasta' },
    });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when a referenced food item does not exist / is not owned by the user', async () => {
    mockFood.find.mockResolvedValue([]); // fewer results than requested ids
    const req = mockRequest({
      user: { _id: 'u1' },
      body: { day: 'Monday', mealType: 'Lunch', mealName: 'Pasta', foodIds: ['f1'] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when a referenced food item is Used or Donated', async () => {
    mockFood.find.mockResolvedValue([{ _id: 'f1', status: 'Used' }]);
    const req = mockRequest({
      user: { _id: 'u1' },
      body: { day: 'Monday', mealType: 'Lunch', mealName: 'Pasta', foodIds: ['f1'] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('creates the entry, reserves Available foods, and returns 201', async () => {
    const foodDoc = { _id: 'f1', status: 'Available', save: jest.fn().mockResolvedValue(true) };
    mockFood.find.mockResolvedValue([foodDoc]);
    mockMealPlan.create.mockResolvedValue({ _id: 'mp1' });
    mockMealPlan.findById.mockReturnValue(withPopulate({ _id: 'mp1' }));

    const req = mockRequest({
      user: { _id: 'u1' },
      body: { day: 'Monday', mealType: 'Lunch', mealName: 'Pasta', foodIds: ['f1'] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(foodDoc.status).toBe('Reserved');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('does not re-reserve a food item that is already Reserved', async () => {
    const foodDoc = { _id: 'f1', status: 'Reserved', save: jest.fn().mockResolvedValue(true) };
    mockFood.find.mockResolvedValue([foodDoc]);
    mockMealPlan.create.mockResolvedValue({ _id: 'mp1' });
    mockMealPlan.findById.mockReturnValue(withPopulate({ _id: 'mp1' }));

    const req = mockRequest({
      user: { _id: 'u1' },
      body: { day: 'Monday', mealType: 'Lunch', mealName: 'Pasta', foodIds: ['f1'] },
    });
    const res = mockResponse();
    const next = jest.fn();

    addMealPlanEntry(req, res, next);
    await flushPromises();

    expect(foodDoc.save).not.toHaveBeenCalled();
  });
});

describe('updateMealPlanEntry', () => {
  it('rejects (400) for invalid day/mealType/mealName', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'mp1' }, body: { day: 'Someday' } });
    const res = mockResponse();
    const next = jest.fn();

    updateMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the entry does not belong to the user', async () => {
    mockMealPlan.findOne.mockResolvedValue(null);
    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'mp1' },
      body: { day: 'Monday', mealType: 'Lunch', mealName: 'Pasta' },
    });
    const res = mockResponse();
    const next = jest.fn();

    updateMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('releases removed foods back to Available and reserves the new set', async () => {
    const entry = {
      food: [{ toString: () => 'oldFood' }],
      set: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue(true),
    };
    mockMealPlan.findOne.mockResolvedValue(entry);
    mockFood.find.mockResolvedValue([{ _id: 'newFood', status: 'Available' }]);

    const req = mockRequest({
      user: { _id: 'u1' },
      params: { id: 'mp1' },
      body: { day: 'Monday', mealType: 'Lunch', mealName: 'Pasta', foodIds: ['newFood'] },
    });
    const res = mockResponse();
    const next = jest.fn();

    updateMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    // first updateMany call releases old foods no longer referenced
    expect(mockFood.updateMany).toHaveBeenNthCalledWith(
      1,
      { _id: { $in: ['oldFood'] }, status: 'Reserved' },
      { $set: { status: 'Available' } }
    );
    // second updateMany reserves the new set
    expect(mockFood.updateMany).toHaveBeenNthCalledWith(
      2,
      { _id: { $in: ['newFood'] } },
      { $set: { status: 'Reserved' } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getMyMealPlans', () => {
  it('queries meal plans within the current week window when no weekStartDate is given', async () => {
    mockMealPlan.find.mockReturnValue(withPopulate([]));
    const req = mockRequest({ user: { _id: 'u1' }, query: {} });
    const res = mockResponse();
    const next = jest.fn();

    getMyMealPlans(req, res, next);
    await flushPromises();

    const filterArg = mockMealPlan.find.mock.calls[0][0];
    expect(filterArg.user).toBe('u1');
    expect(filterArg.weekStartDate.$gte).toBeInstanceOf(Date);
    expect(filterArg.weekStartDate.$lt).toBeInstanceOf(Date);
  });

  it('returns the "no meal plans" message for an empty result', async () => {
    mockMealPlan.find.mockReturnValue(withPopulate([]));
    const req = mockRequest({ user: { _id: 'u1' }, query: {} });
    const res = mockResponse();
    const next = jest.fn();

    getMyMealPlans(req, res, next);
    await flushPromises();

    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toMatch(/No meal plans/);
  });
});

describe('deleteMealPlanEntry', () => {
  it('rejects (404) when the entry does not belong to the user', async () => {
    mockMealPlan.findOne.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'mp1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('releases reserved foods and removes the entry', async () => {
    const entry = { food: ['f1', 'f2'], deleteOne: jest.fn().mockResolvedValue(true) };
    mockMealPlan.findOne.mockResolvedValue(entry);
    const req = mockRequest({ user: { _id: 'u1' }, params: { id: 'mp1' } });
    const res = mockResponse();
    const next = jest.fn();

    deleteMealPlanEntry(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(mockFood.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['f1', 'f2'] }, status: 'Reserved' },
      { $set: { status: 'Available' } }
    );
    expect(entry.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
