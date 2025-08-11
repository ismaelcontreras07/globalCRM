// src/components/LogoutButton.jsx
import React, { useState, useContext } from 'react';
import { useNavigate }                 from 'react-router-dom';
import { AuthContext }                 from '../context/AuthContext';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  // desestructura el logout del contexto
  const { logout }            = useContext(AuthContext);
  const navigate              = useNavigate();

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    await logout();               // borra sesión en PHP y React
    setLoading(false);
    navigate('/', { replace: true });
  };

  return (
    <button onClick={handleLogout} disabled={loading} className="btn-logout">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
    {loading ? 'Cerrando sesión…' : ''}
    </button>
  );
}
