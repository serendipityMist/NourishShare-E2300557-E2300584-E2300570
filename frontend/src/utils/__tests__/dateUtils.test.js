import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { daysUntil, getExpiryStatus, formatDate, formatRelativeTime } from '../dateUtils.js';

describe('daysUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when no date is given', () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil(undefined)).toBeNull();
    expect(daysUntil('')).toBeNull();
  });

  it('returns 0 for today', () => {
    expect(daysUntil('2026-06-15')).toBe(0);
  });

  it('returns a positive count for a future date', () => {
    expect(daysUntil('2026-06-20')).toBe(5);
  });

  it('returns a negative count for a past date', () => {
    expect(daysUntil('2026-06-10')).toBe(-5);
  });
});

describe('getExpiryStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "unknown" when there is no date', () => {
    expect(getExpiryStatus(null)).toBe('unknown');
  });

  it('returns "expired" for a past date', () => {
    expect(getExpiryStatus('2026-06-10')).toBe('expired');
  });

  it('returns "expiring" within the 3-day window (inclusive)', () => {
    expect(getExpiryStatus('2026-06-15')).toBe('expiring');
    expect(getExpiryStatus('2026-06-18')).toBe('expiring');
  });

  it('returns "fresh" beyond the 3-day window', () => {
    expect(getExpiryStatus('2026-06-19')).toBe('fresh');
  });
});

describe('formatDate', () => {
  it('returns an em dash placeholder when no date is given', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('formats a valid date string as "MMM D, YYYY"', () => {
    const formatted = formatDate('2026-01-15T00:00:00Z');
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/Jan/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for timestamps under a minute old', () => {
    expect(formatRelativeTime(Date.now() - 30 * 1000)).toBe('just now');
  });

  it('returns minutes for timestamps under an hour old', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe('5m ago');
  });

  it('returns hours for timestamps under a day old', () => {
    expect(formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000)).toBe('3h ago');
  });

  it('returns days for older timestamps', () => {
    expect(formatRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000)).toBe('2d ago');
  });
});
