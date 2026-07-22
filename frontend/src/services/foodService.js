import api from "../lib/axios";

export const foodService = {
  // ==========================
  // Add Food Item
  // ==========================

  addFoodItem: (formData) =>
    api.post("/food/addFoodItem", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ==========================
  // Edit Food Item
  // ==========================

  editFoodItem: (id, formData) =>
    api.put(`/food/editFoodItem/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ==========================
  // Delete Food Item
  // ==========================

  deleteFoodItem: (id) =>
    api.delete(`/food/deleteFoodItem/${id}`),

  // ==========================
  // Get Single Food Item
  // ==========================

  getFoodDetails: (id) =>
    api.get(`/food/getFoodDetails/${id}`),

  // ==========================
  // Get My Food Items
  // ==========================

  getMyFoodItems: () =>
    api.get("/food/getMyFoodItems"),

  // ==========================
  // Mark Food as Used
  // ==========================

  markFoodAsUsed: (id) =>
    api.patch(`/food/markAsUsed/${id}`),
};