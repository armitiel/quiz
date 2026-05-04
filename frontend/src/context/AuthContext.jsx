import { createContext, useContext, useState, useEffect } from 'react';
import { api, getUser, clearSession } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());

  // Synchronizacja - jeśli inna karta wyloguje
  useEffect(() => {
    const onStorage = () => setUser(getUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const loginUser = async (firstName, lastName, groupSymbol = '', classLevel = '') => {
    const data = await api.loginUser(firstName, lastName, groupSymbol, classLevel);
    setUser(data.user);
    return data.user;
  };

  const loginAdmin = async (login, password) => {
    const data = await api.loginAdmin(login, password);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musi być w AuthProvider');
  return ctx;
}
