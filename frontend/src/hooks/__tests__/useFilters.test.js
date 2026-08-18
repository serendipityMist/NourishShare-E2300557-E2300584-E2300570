import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters.js';

const items = [
  { id: 1, name: 'Apple', category: 'Fruit', price: 3 },
  { id: 2, name: 'Bread', category: 'Bakery', price: 2 },
  { id: 3, name: 'Avocado', category: 'Fruit', price: 5 },
];

describe('useFilters', () => {
  it('returns all items unfiltered by default', () => {
    const { result } = renderHook(() => useFilters(items, { searchKeys: ['name'] }));
    expect(result.current.filteredItems).toHaveLength(3);
  });

  it('filters items by a text query across the given search keys', () => {
    const { result } = renderHook(() => useFilters(items, { searchKeys: ['name'] }));

    act(() => {
      result.current.setQuery('av');
    });

    expect(result.current.filteredItems).toEqual([items[2]]);
  });

  it('is case-insensitive when searching', () => {
    const { result } = renderHook(() => useFilters(items, { searchKeys: ['name'] }));

    act(() => {
      result.current.setQuery('APPLE');
    });

    expect(result.current.filteredItems).toEqual([items[0]]);
  });

  it('applies a filter set via setFilter, ignoring "all"/empty values', () => {
    const { result } = renderHook(() =>
      useFilters(items, { searchKeys: ['name'], initialFilters: { category: 'all' } })
    );

    act(() => {
      result.current.setFilter('category', 'Fruit');
    });

    expect(result.current.filteredItems).toHaveLength(2);

    act(() => {
      result.current.setFilter('category', 'all');
    });

    expect(result.current.filteredItems).toHaveLength(3);
  });

  it('sorts using the selected sortFns entry', () => {
    const { result } = renderHook(() =>
      useFilters(items, {
        searchKeys: ['name'],
        sortFns: { priceAsc: (a, b) => a.price - b.price },
        initialSort: 'priceAsc',
      })
    );

    expect(result.current.filteredItems.map((i) => i.id)).toEqual([2, 1, 3]);
  });

  it('resetFilters restores the initial filters and clears the query', () => {
    const { result } = renderHook(() =>
      useFilters(items, { searchKeys: ['name'], initialFilters: { category: 'all' } })
    );

    act(() => {
      result.current.setQuery('bread');
      result.current.setFilter('category', 'Bakery');
    });
    expect(result.current.filteredItems).toHaveLength(1);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.query).toBe('');
    expect(result.current.filters).toEqual({ category: 'all' });
    expect(result.current.filteredItems).toHaveLength(3);
  });

  it('combines a search query and a filter together', () => {
    const { result } = renderHook(() =>
      useFilters(items, { searchKeys: ['name'], initialFilters: { category: 'all' } })
    );

    act(() => {
      result.current.setQuery('a'); // matches Apple, Bread, Avocado
      result.current.setFilter('category', 'Fruit');
    });

    expect(result.current.filteredItems.map((i) => i.id).sort()).toEqual([1, 3]);
  });
});
