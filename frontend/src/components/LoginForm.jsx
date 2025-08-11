// src/components/LoginForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../assets/css/LoginForm.css';
import iconLogo from '../assets/icon2.svg';

export default function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // desestructura el login del contexto
  const { login }    = useContext(AuthContext);
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Llama al método login del contexto
    const ok = await login(email, password);

    if (ok) {
      // Si fue exitoso, navega al dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // Si hubo error, muestra mensaje
      setError('Usuario o contraseña incorrectos');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
    <form className="login-form" onSubmit={handleSubmit}>
      <img src={iconLogo} alt="Icon Logo" className="logo-login" />
      <h2 className="form-title">Iniciar sesión</h2>
      <p className="form-subtitle">Ingresa tus datos para iniciar sesión</p>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="email" className="form-label">Correo:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          required
          placeholder="@iconfacility.com.mx"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Contraseña:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <button type="submit" disabled={loading} className="btn">
        {loading ? 'Validando…' : 'Entrar'}
      </button>
    </form>
    </div>
    );
}
