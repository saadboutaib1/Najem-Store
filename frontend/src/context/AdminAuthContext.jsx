import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AdminApiError,
  ADMIN_SESSION_EXPIRED_EVENT,
  changePassword as changeAdminPassword,
  clearAdminToken,
  getAdminToken,
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  setAdminToken,
  updateProfile as updateAdminProfile,
} from '../services/adminApi.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => getAdminToken());
  const [admin, setAdmin] = useState(null);
  const [isChecking, setIsChecking] = useState(Boolean(getAdminToken()));

  const clearSession = useCallback(() => {
    clearAdminToken();
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, clearSession);

    return () => {
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, clearSession);
    };
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token) {
        setIsChecking(false);
        return;
      }

      setIsChecking(true);

      try {
        const profile = await getProfile();

        if (isMounted) {
          setAdmin(profile);
        }
      } catch (error) {
        if (isMounted && (error instanceof AdminApiError || error.status === 401 || error.status === 403)) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [clearSession, token]);

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    const nextToken = response?.token;
    const nextAdmin = response?.admin;

    if (!nextToken) {
      throw new AdminApiError('Login response did not include a token.', 0, response);
    }

    setAdminToken(nextToken);
    setToken(nextToken);
    setAdmin(nextAdmin || null);

    return nextAdmin;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutRequest();
      }
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const updateProfile = useCallback(async (data) => {
    const nextAdmin = await updateAdminProfile(data);
    setAdmin(nextAdmin);
    return nextAdmin;
  }, []);

  const changePassword = useCallback(async (data) => {
    await changeAdminPassword(data);
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      admin,
      token,
      isChecking,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateProfile,
      changePassword,
      clearSession,
    }),
    [admin, changePassword, clearSession, isChecking, login, logout, token, updateProfile]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }

  return context;
}
