import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

const TOKEN_KEY = 'chama_token';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync(TOKEN_KEY);
      setTokenState(t);
      setLoading(false);
    })();
  }, []);

  const setToken = async (t) => {
    if (!t) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setTokenState(null);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, t);
    setTokenState(t);
  };

  const value = useMemo(() => ({ token, setToken, loading }), [token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}
