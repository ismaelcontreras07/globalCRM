// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="wrapper">
      <Sidebar />

      <div>
        {/* Aquí se renderizan las páginas. */}
        <Outlet />
      </div>
    </div>
  );
}
  