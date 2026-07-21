import api from "../lib/axios";

export const authService = {
  // ==========================
  // Authentication
  // ==========================

  register: (formData) =>
    api.post("/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  login: (payload) =>
    api.post("/login", payload),

  verifyLoginOtp: (payload) =>
    api.post("/verifyLogin", payload),

  verifyRegistrationOtp: (payload) =>
    api.post("/verifyRegistrationOtp", payload),

  logout: () =>
    api.post("/logout"),

  refreshToken: () =>
    api.post("/refreshToken"),

  // ==========================
  // Password
  // ==========================

  forgotPassword: (payload) =>
    api.post("/forgotPassword", payload),

  verifyOtp: (payload) =>
    api.post("/verifyOTP", payload),

  resetPassword: (payload) =>
    api.post("/resetPassword", payload),

  changePassword: (payload) =>
    api.patch("/changePassword", payload),

  // ==========================
  // Profile
  // ==========================

  updateProfile: (payload) =>
    api.patch("/updateProfile", payload),

  updateAvatar: (formData) =>
    api.patch("/updateAvatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ==========================
  // Security
  // ==========================

  toggleTwoFactor: () =>
    api.patch("/toggle2FA"),
};