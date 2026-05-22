import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as authApi } from '../lib/api';
import { getFirebaseAuth } from '../lib/firebase';

const ThemeContext = createContext({ dark: true, setDark: () => { } });
const AuthContext = createContext({ user: null, login: async () => { }, logout: () => { }, loading: true });
const PageChromeContext = createContext({
  hideFooter: false,
  hideFloatingUi: false,
  setPageChrome: () => {},
});

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
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    const timeout = window.setTimeout(finish, 8000);

    const unsub = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      if (!fbUser && !authApi.getToken()) {
        setUser(null);
        finish();
        return;
      }
      try {
        const session = await authApi.me();
        setUser(session.user);
      } catch {
        await authApi.logout();
        setUser(null);
      } finally {
        finish();
      }
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
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

export function PageChromeProvider({ children }) {
  const [chrome, setChrome] = useState({ hideFooter: false, hideFloatingUi: false });
  const setPageChrome = useCallback((patch) => {
    setChrome((prev) => ({ ...prev, ...patch }));
  }, []);
  const value = useMemo(
    () => ({ hideFooter: chrome.hideFooter, hideFloatingUi: chrome.hideFloatingUi, setPageChrome }),
    [chrome.hideFooter, chrome.hideFloatingUi, setPageChrome],
  );
  return <PageChromeContext.Provider value={value}>{children}</PageChromeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
export function useAuth() { return useContext(AuthContext); }
export function usePageChrome() { return useContext(PageChromeContext); }
