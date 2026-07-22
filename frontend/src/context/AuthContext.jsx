import { createContext, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = localStorage.getItem('saveplate_user');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed?.accessToken) {
      localStorage.removeItem('saveplate_user');
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem('saveplate_user');
    return null;
  }
}

let initialAuthState;

function getInitialAuthState() {
  if (!initialAuthState) {
    const storedUser = readStoredUser();
    initialAuthState = {
      user: storedUser,
      isAuthenticated: !!storedUser,
    };
  }
  return initialAuthState;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getInitialAuthState().user);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getInitialAuthState().isAuthenticated
  );

  const [pendingIdentity, setPendingIdentity] = useState(null);

  // =========================
  // Helper
  // =========================

  function persistUser(loggedInUser, tokens = {}) {
    let existing = {};
    try {
      const stored = localStorage.getItem('saveplate_user');
      if (stored) existing = JSON.parse(stored);
    } catch {
      // ignore parse errors
    }

    const userData = {
      ...existing,
      ...loggedInUser,
      ...(tokens.accessToken && { accessToken: tokens.accessToken }),
      ...(tokens.refreshToken && { refreshToken: tokens.refreshToken }),
    };

    if (!tokens.accessToken && existing.accessToken) {
      userData.accessToken = existing.accessToken;
    }
    if (!tokens.refreshToken && existing.refreshToken) {
      userData.refreshToken = existing.refreshToken;
    }

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('saveplate_user', JSON.stringify(userData));
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
      persistUser(data.loggedInUser, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
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

    persistUser(data.loggedInUser, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

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

  async function resendRegistrationOtp(identity) {
    return authService.resendRegistrationOtp(buildIdentityPayload(identity));
  }

  async function updatePrivacySettings(settings) {
    const res = await authService.updatePrivacySettings(settings);
    persistUser(res.data.data);
    return res.data.data;
  }

  // =====================================================
  // NEW FUNCTIONS
  // =====================================================

  async function getCurrentUser() {
    try {
      const res = await authService.getCurrentUser();
      const loggedInUser = res.data.data;
      persistUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // If endpoint doesn't exist, user data is already in localStorage
      return user;
    }
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
    resendRegistrationOtp,

    getCurrentUser,
    updateProfile,
    updateAvatar,
    changePassword,
    toggleTwoFactor,
    updatePrivacySettings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}