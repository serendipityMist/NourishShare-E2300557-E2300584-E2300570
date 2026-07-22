import api from "../lib/axios";

export const mealPlanService = {
  getMyMealPlans: (weekStartDate) =>
    api.get("/meal-plans", {
      params: weekStartDate ? { weekStartDate } : undefined,
    }),

  addMealPlanEntry: (payload) =>
    api.post("/meal-plans", payload),

  deleteMealPlanEntry: (id) =>
    api.delete(`/meal-plans/${id}`),
};
