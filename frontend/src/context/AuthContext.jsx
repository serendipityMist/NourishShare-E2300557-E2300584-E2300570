import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

const INITIAL_USER = {
  fullName: 'Ahmad Zulkifli',
  email: 'ahmad@email.com',
  phone: '012-345 6789',
  isVerified: true,
  twoFactorEnabled: false,
  privacy: {
    foodListingVisibility: 'public', // 'public' | 'neighbors' | 'private'
    showPhoneToClaimers: true,
    showExactAddress: false,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // realistic default: start logged out
  const [registeredEmails] = useState(['taken@email.com']); // for duplicate-email demo

  function register({ fullName, email, phone }) {
    setUser((prev) => ({ ...prev, fullName, email, phone, isVerified: false }));
    setIsAuthenticated(true);
  }

  function login() {
    setIsAuthenticated(true);
  }

  function logout() {
    setIsAuthenticated(false);
  }

  function verifyEmail() {
    setUser((prev) => ({ ...prev, isVerified: true }));
  }

  function isEmailTaken(email) {
    return registeredEmails.includes(email.trim().toLowerCase());
  }

  function enableTwoFactor() {
    setUser((prev) => ({ ...prev, twoFactorEnabled: true }));
  }

  function disableTwoFactor() {
    setUser((prev) => ({ ...prev, twoFactorEnabled: false }));
  }

  function updatePrivacy(partialPrivacy) {
    setUser((prev) => ({ ...prev, privacy: { ...prev.privacy, ...partialPrivacy } }));
  }

  function updateProfile(partialUser) {
    setUser((prev) => ({ ...prev, ...partialUser }));
  }

  const value = {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    verifyEmail,
    isEmailTaken,
    enableTwoFactor,
    disableTwoFactor,
    updatePrivacy,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
