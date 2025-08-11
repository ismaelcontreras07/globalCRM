import React, { useContext } from 'react';
import { AuthContext }             from '../context/AuthContext';
import CommissionsCard             from '../components/CommissionsCard';
import '../assets/css/Dashboard.css'; 

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <main>
      <header className="header-container">
        <h1 className="page-title">Dashboard</h1>
      </header>

      <div className="welcome-container">
        <p className="welcome">¡Hola, {user.name}!</p>
      </div>

      <section className="dashboard-content">
        <CommissionsCard />
        {/* aquí luego podrías añadir más cards */}
      </section>
    </main>
  );
}
