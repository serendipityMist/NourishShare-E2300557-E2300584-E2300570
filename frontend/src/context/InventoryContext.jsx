import { createContext, useCallback, useEffect, useState } from 'react';
import { foodService } from '../services/foodService';
import { useAuth } from '../hooks/useAuth';

export const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // Fetch logged-in user's food items
  // ==========================================
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
       console.log("FETCHING INVENTORY");

 
      const response = await foodService.getMyFoodItems();


  console.log(response.data);
      const foods = response.data?.data?.foods || [];
console.log("Foods from backend:", foods);
console.log("Setting items:", foods.length);
      setItems(foods);
    } catch (error) {
      // Silently handle 401 (will be caught by axios interceptor for refresh)
      if (error.response?.status === 401) {
        console.warn('Inventory fetch failed: Unauthorized. Token may be expired.');
        // Don't clear items on 401 to avoid UI flash
        setLoading(false);
        return;
      }

      // Backend returns 404 when there are no food items
      if (error.response?.status === 404) {
        setItems([]);
      } else {
        setError(
          error.response?.data?.message ||
          'Failed to load food items'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
      return;
    }

    setItems([]);
    setError('');
    setLoading(false);
  }, [isAuthenticated, fetchItems]);

  // ==========================================
  // Add Food Item
  // ==========================================
  // ==========================================
// Add Food Item
// ==========================================
async function addItem(formData) {
  try {
    const response = await foodService.addFoodItem(formData);

    console.log("========== ADD FOOD RESPONSE ==========");
    console.log(response.data);

    // Always refresh inventory from backend
    await fetchItems();

    return response.data?.data?.food;
  } catch (error) {
    console.error("Failed to add food:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to add food item"
    );
  }
}

  // ==========================================
// Update Food Item
// ==========================================
async function updateItem(id, formData) {
  try {
    const response =
      await foodService.editFoodItem(id, formData);

    console.log("========== EDIT FOOD RESPONSE ==========");
    console.log(response.data);

    await fetchItems();

    return response.data?.data?.food;
  } catch (error) {
    console.error(
      "Failed to update food:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to update food item"
    );
  }
}

  // ==========================================
// Delete Food Item
// ==========================================
async function deleteItem(id) {
  try {
    await foodService.deleteFoodItem(id);

    await fetchItems();
  } catch (error) {
    console.error(
      "Failed to delete food:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to delete food item"
    );
  }
}

 // ==========================================
// Mark Food as Used
// ==========================================
async function markAsUsed(id) {
  try {
    const response =
      await foodService.markFoodAsUsed(id);

    console.log("========== MARK USED RESPONSE ==========");
    console.log(response.data);

    await fetchItems();
  } catch (error) {
    console.error(
      "Failed to mark food as used:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to mark food as used"
    );
  }
}

function markItemAsDonated(id) {
  setItems((prevItems) =>
    prevItems.map((item) =>
      item._id === id || item.id === id
        ? { ...item, status: 'Donated' }
        : item
    )
  );
}

  // ==========================================
  // Get Food By ID
  // ==========================================
  function getItemById(id) {
    return items.find(
      (item) =>
        item._id === id ||
        item.id === id
    );
  }

  // ==========================================
  // Only active food items
  // Backend status values:
  // Available
  // Reserved
  // Donated
  // Used
  // ==========================================
  const activeItems = items.filter(
    (item) =>
      item.status !== 'Used' &&
      item.status !== 'Donated'
  );

  const value = {
    items,
    activeItems,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    markAsUsed,
    markItemAsDonated,
    getItemById,
    fetchItems,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}