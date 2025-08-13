// src/App.jsx
import React, { useContext, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import Layout          from './components/Layout';
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import Leads           from './pages/Leads';
import Contacts        from './pages/Contacts';
import Activities     from './pages/Activities';
import Accounts           from './pages/Accounts';
import './index.css';



// Mapa de rutas a título de la página
const routeTitles = {
  '/login':     'Login',
  '/dashboard': 'Dashboard',
  '/leads':     'Leads',
  '/contacts':  'Contactos',
  '/activities': 'Actividades',
  '/accounts': 'Cuentas',
};

function TitleHandler() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = routeTitles[pathname] || 'Icon CRM';
  }, [pathname]);
  return null;
}

export default function App() {
  const { checking, isAuthenticated } = useContext(AuthContext);

  if (checking) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <TitleHandler />

      <Routes>
        {/* Ruta pública */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />

        {/* Rutas protegidas: todo queda dentro de Layout */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Layout />
              : <Navigate to="/login" replace />
          }
        >
          {/* Al acceder a "/" redirige a "/dashboard" */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads"     element={<Leads />} />
          <Route path="contacts"     element={<Contacts />} />
          <Route path="activities"     element={<Activities />} />
          <Route path="accounts"     element={<Accounts />} />
        </Route>

        {/* Catch-all: redirige según auth */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? '/dashboard' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </>
  );
}
