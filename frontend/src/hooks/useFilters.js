import { useMemo, useState } from 'react';

/**
 * Generic filter/search/sort hook.
 * @param {Array} items
 * @param {Object} options
 *   searchKeys: string[] - fields to match against the search query
 *   initialFilters: Object - starting filter values
 *   sortFns: Object<string, (a,b)=>number> - available sort comparators
 *   initialSort: string - key into sortFns
 */
export function useFilters(items, { searchKeys = [], initialFilters = {}, sortFns = {}, initialSort = null } = {}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState(initialSort);

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(initialFilters);
    setQuery('');
  }

  const filteredItems = useMemo(() => {
    let result = items;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === 'all' || value === '') return;
      result = result.filter((item) => item[key] === value);
    });

    if (sortKey && sortFns[sortKey]) {
      result = [...result].sort(sortFns[sortKey]);
    }

    return result;
  }, [items, query, filters, sortKey, searchKeys, sortFns]);

  return { query, setQuery, filters, setFilter, resetFilters, sortKey, setSortKey, filteredItems };
}
