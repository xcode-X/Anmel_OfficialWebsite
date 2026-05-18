import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../lib/api';

const ThemeContext = createContext({ dark: true, setDark: () => { } });
const AuthContext = createContext({ user: null, login: async () => { }, logout: () => { }, loading: true });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('intelera_theme') === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('intelera_theme', dark ? 'dark' : 'light'); } catch { void 0; }
  }, [dark]);
  return <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authApi.getToken()) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    authApi.me().then((data) => setUser(data.user)).catch(() => authApi.logout()).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    authApi.setToken(token);
    setUser(u);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
export function useAuth() { return useContext(AuthContext); }
