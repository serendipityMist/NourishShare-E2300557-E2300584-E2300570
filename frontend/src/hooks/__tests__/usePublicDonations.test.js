import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockGetPublicDonations = vi.fn();

vi.mock('../../services/donationService.js', () => ({
  donationService: { getPublicDonations: (...args) => mockGetPublicDonations(...args) },
}));

const { usePublicDonations } = await import('../usePublicDonations.js');

beforeEach(() => {
  mockGetPublicDonations.mockReset();
});

describe('usePublicDonations', () => {
  it('starts in a loading state', () => {
    mockGetPublicDonations.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => usePublicDonations());
    expect(result.current.loading).toBe(true);
    expect(result.current.donations).toEqual([]);
  });

  it('loads donations and stops loading on success', async () => {
    mockGetPublicDonations.mockResolvedValue({
      data: { data: { donations: [{ _id: 'd1' }, { _id: 'd2' }] } },
    });

    const { result } = renderHook(() => usePublicDonations(3));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.donations).toHaveLength(2);
    expect(result.current.error).toBe('');
    expect(mockGetPublicDonations).toHaveBeenCalledWith({ limit: 3 });
  });

  it('defaults to an empty array when the response has no donations', async () => {
    mockGetPublicDonations.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => usePublicDonations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.donations).toEqual([]);
  });

  it('sets an error message and empties donations on failure', async () => {
    mockGetPublicDonations.mockRejectedValue({
      response: { data: { message: 'Server unavailable' } },
    });

    const { result } = renderHook(() => usePublicDonations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.donations).toEqual([]);
    expect(result.current.error).toBe('Server unavailable');
  });

  it('falls back to a generic error message when the server gives none', async () => {
    mockGetPublicDonations.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePublicDonations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Unable to load community listings');
  });

  it('re-fetches when the limit prop changes', async () => {
    mockGetPublicDonations.mockResolvedValue({ data: { data: { donations: [] } } });

    const { rerender } = renderHook(({ limit }) => usePublicDonations(limit), {
      initialProps: { limit: 3 },
    });

    await waitFor(() => expect(mockGetPublicDonations).toHaveBeenCalledWith({ limit: 3 }));

    rerender({ limit: 6 });

    await waitFor(() => expect(mockGetPublicDonations).toHaveBeenCalledWith({ limit: 6 }));
  });
});
