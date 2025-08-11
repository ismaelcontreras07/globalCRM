// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';


// exporta el contexto
export const AuthContext = createContext({
  checking: true,
  isAuthenticated: false,
  user: null,
  logout: async () => {},
  login: async () => false,
});

export function AuthProvider({ children }) {
  const [checking, setChecking]         = useState(true);
  const [isAuthenticated, setAuth]      = useState(false);
  const [user, setUser]                 = useState(null);

  // Checa la sesión en el servidor
  const checkSession = async () => {
    try {
      const res  = await fetch('/api/check_session.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAuth(true);
        setUser(data.user);
      } else {
        setAuth(false);
        setUser(null);
      }
    } catch {
      setAuth(false);
      setUser(null);
    } finally {
      setChecking(false);
    }
  };

  // Función de login
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Opcional: si tu login.php devuelve también user en data.user, úsalo:
        // setUser(data.user);
        // setAuth(true);
        // Si no, podemos re-chequear la sesión:
        await checkSession();
        return true;
      } else {
        setAuth(false);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Error en login:', err);
      setAuth(false);
      setUser(null);
      return false;
    }
  };

  // Logout que limpia tanto PHP como el estado de React
  const logout = async () => {
    await fetch('/api/auth/logout.php', {
      method: 'POST',
      credentials: 'include',
    });
    // aquí no importa la respuesta: destruimos el estado
    setAuth(false);
    setUser(null);
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ checking, isAuthenticated, user, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}
