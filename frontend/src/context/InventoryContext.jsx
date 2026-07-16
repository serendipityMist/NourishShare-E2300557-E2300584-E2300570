import { createContext, useState } from 'react';
import { INITIAL_INVENTORY } from '../data/mockData';

export const InventoryContext = createContext(null);

let idCounter = 100;

export function InventoryProvider({ children }) {
  const [items, setItems] = useState(INITIAL_INVENTORY);

  function addItem(item) {
    const newItem = {
      id: `inv-${idCounter++}`,
      status: 'active',
      image: item.image || `https://picsum.photos/seed/item${idCounter}/400/300`,
      ...item,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }

  function updateItem(id, updates) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function markAsUsed(id) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'used' } : item)));
  }

  function markAsDonated(id) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'donated' } : item)));
  }

  function getItemById(id) {
    return items.find((item) => item.id === id);
  }

  const activeItems = items.filter((item) => item.status === 'active');

  const value = {
    items,
    activeItems,
    addItem,
    updateItem,
    deleteItem,
    markAsUsed,
    markAsDonated,
    getItemById,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}
