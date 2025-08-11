// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [checking, setChecking]         = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser]                 = useState(null);

  useEffect(() => {
    fetch('/api/check_session.php', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAuthenticated(true);
        setUser(data.user);
      } else {
        setAuthenticated(false);
        setUser(null);
      }
    })
    .catch(() => {
      setAuthenticated(false);
      setUser(null);
    })
    .finally(() => {
      setChecking(false);
    });
  }, []);

  return { checking, isAuthenticated, user };
}
