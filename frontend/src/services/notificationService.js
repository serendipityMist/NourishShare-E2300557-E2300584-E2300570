import api from "../lib/axios";

export const notificationService = {
  getMyNotifications: () =>
    api.get("/notifications"),

  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch("/notifications/read-all"),
};
