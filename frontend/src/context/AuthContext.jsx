import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stockflow_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('stockflow_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (endpoint, credentials) => {
    const { data } = await api.post(`/auth/${endpoint}`, credentials);
    localStorage.setItem('stockflow_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('stockflow_token');
    setUser(null);
  };

  const updateOrganizationName = (organizationName) => {
    setUser((current) => current ? { ...current, organizationName } : current);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login: (credentials) => authenticate('login', credentials),
    signup: (credentials) => authenticate('signup', credentials),
    logout,
    updateOrganizationName,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
