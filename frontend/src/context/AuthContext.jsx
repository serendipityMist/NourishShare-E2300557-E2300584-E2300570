import { createContext, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('saveplate_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('saveplate_user')
  );

  const [pendingIdentity, setPendingIdentity] = useState(null);

  // =========================
  // Helper
  // =========================

  function persistUser(loggedInUser) {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem(
      'saveplate_user',
      JSON.stringify(loggedInUser)
    );
  }

  function buildIdentityPayload(identity) {
    return identity.includes("@")
      ? { email: identity }
      : { phone: identity };
  }

  // =========================
  // Authentication
  // =========================

  async function register(formData) {
    const res = await authService.register(formData);
    return res.data;
  }

  async function login({ identity, password }) {
    const payload = {
      ...buildIdentityPayload(identity),
      password,
    };

    const res = await authService.login(payload);
    const { data } = res.data;

    if (data?.accessToken) {
      persistUser(data.loggedInUser);
      return { requiresOtp: false };
    }

    setPendingIdentity(buildIdentityPayload(identity));

    return {
      requiresOtp: true,
    };
  }

  async function verifyLoginOtp(otp) {
    const res = await authService.verifyLoginOtp({
      ...pendingIdentity,
      otp,
    });

    const { data } = res.data;

    persistUser(data.loggedInUser);

    setPendingIdentity(null);

    return data;
  }

  async function logout() {
    await authService.logout();

    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem("saveplate_user");
  }

  // =========================
  // Forgot Password
  // =========================

  async function forgotPassword(identifier) {
    const payload = buildIdentityPayload(identifier);

    await authService.forgotPassword(payload);

    setPendingIdentity(payload);
  }

  async function verifyResetOtp(otp) {
    await authService.verifyOtp({
      ...pendingIdentity,
      otp,
    });
  }

  async function resetPassword(password) {
    await authService.resetPassword({
      ...pendingIdentity,
      password,
    });

    setPendingIdentity(null);
  }

  async function verifyRegistrationOtp({ identity, otp }) {
    const payload = {
      ...buildIdentityPayload(identity),
      otp,
    };

    return authService.verifyRegistrationOtp(payload);
  }

  // =====================================================
  // NEW FUNCTIONS
  // =====================================================

  async function getCurrentUser() {
    const res = await authService.getCurrentUser();

    const loggedInUser = res.data.data;

    persistUser(loggedInUser);

    return loggedInUser;
  }

  async function updateProfile(profileData) {
    const res = await authService.updateProfile(profileData);

    persistUser(res.data.data);

    return res.data;
  }

  async function updateAvatar(file) {
    const formData = new FormData();

    formData.append("avatar", file);

    const res = await authService.updateAvatar(formData);

    persistUser(res.data.data);

    return res.data;
  }

  async function changePassword(oldPassword, newPassword) {
    return authService.changePassword({
      oldPassword,
      newPassword,
    });
  }

  async function toggleTwoFactor() {
    const res = await authService.toggleTwoFactor();

    setUser((prev) => ({
      ...prev,
      twoFAEnabled: res.data.data.twoFAEnabled,
    }));

    localStorage.setItem(
      "saveplate_user",
      JSON.stringify({
        ...user,
        twoFAEnabled: res.data.data.twoFAEnabled,
      })
    );

    return res.data.data;
  }

  // =========================
  // Context Value
  // =========================

  const value = {
    user,
    isAuthenticated,
    pendingIdentity,

    register,
    login,
    verifyLoginOtp,
    logout,

    forgotPassword,
    verifyResetOtp,
    resetPassword,

    verifyRegistrationOtp,

    getCurrentUser,
    updateProfile,
    updateAvatar,
    changePassword,
    toggleTwoFactor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}