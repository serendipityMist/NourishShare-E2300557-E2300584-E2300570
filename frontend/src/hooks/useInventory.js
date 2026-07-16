import { useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext.jsx';

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within an InventoryProvider');
  return ctx;
}
