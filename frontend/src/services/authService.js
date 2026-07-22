import api from "../lib/axios";

export const authService = {
  // =========================================
  // Authentication
  // =========================================

  register: (formData) =>
    api.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  login: (payload) =>
    api.post("/users/login", payload),

  verifyLoginOtp: (payload) =>
    api.post("/users/verifyLogin", payload),

  verifyRegistrationOtp: (payload) =>
    api.post("/users/verifyRegistrationOtp", payload),

  resendRegistrationOtp: (payload) =>
    api.post("/users/resendRegistrationOtp", payload),

  logout: () =>
    api.post("/users/logout"),

  refreshToken: () =>
    api.post("/users/refreshToken"),

  // =========================================
  // Password
  // =========================================

  forgotPassword: (payload) =>
    api.post("/users/forgotPassword", payload),

  verifyOtp: (payload) =>
    api.post("/users/verifyOTP", payload),

  resetPassword: (payload) =>
    api.post("/users/resetPassword", payload),

  changePassword: (payload) =>
    api.patch("/users/changePassword", payload),

  // =========================================
  // Profile
  // =========================================

  updateProfile: (payload) =>
    api.patch("/users/updateProfile", payload),

  updateAvatar: (formData) =>
    api.patch("/users/updateAvatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // =========================================
  // Security
  // =========================================

  toggleTwoFactor: () =>
    api.patch("/users/toggle2FA"),

  updatePrivacySettings: (payload) =>
    api.patch("/users/privacySettings", payload),

  // =========================================
  // Current User
  // =========================================

  getCurrentUser: () =>
    api.get("/users/currentUser"),
};

