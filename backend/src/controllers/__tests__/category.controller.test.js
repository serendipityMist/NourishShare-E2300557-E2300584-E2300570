import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockCategory = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  insertMany: jest.fn(),
};

jest.unstable_mockModule('../../models/category.model.js', () => ({ Category: mockCategory }));
jest.unstable_mockModule('../../utils/defaultCategories.js', () => ({
  DEFAULT_CATEGORY_NAMES: ['Dairy', 'Bakery', 'Produce'],
}));

const { getCategories } = await import('../category.controller.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCategories', () => {
  it('returns existing categories without seeding when some already exist', async () => {
    mockCategory.countDocuments.mockResolvedValue(2);
    mockCategory.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ name: 'Dairy' }, { name: 'Bakery' }]) });

    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    getCategories(req, res, next);
    await flushPromises();

    expect(mockCategory.insertMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('seeds default categories when none exist yet', async () => {
    mockCategory.countDocuments.mockResolvedValue(0);
    mockCategory.insertMany.mockResolvedValue([]);
    mockCategory.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Bakery' }, { name: 'Dairy' }, { name: 'Produce' }]),
    });

    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    getCategories(req, res, next);
    await flushPromises();

    expect(mockCategory.insertMany).toHaveBeenCalledWith([
      { name: 'Dairy' },
      { name: 'Bakery' },
      { name: 'Produce' },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
