// src/pages/Accounts.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntityForm from '../components/EntityForm';
import TableAccounts from '../components/TableAccounts';

export default function Accounts() {
  const navigate    = useNavigate();
  const [showForm, setShowForm]     = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [refreshKey, setRefreshKey]       = useState(0);

  const handleSaved = () => {            // <<< NUEVO
    setShowForm(false);                  // cierra el form
    setRefreshKey(k => k + 1);           // fuerza reload de la tabla
  };


  return (
    <main>
      <header>
        <div className="header-container">
          <h1 className="page-title">Cuentas</h1>
        </div>
      </header>

      <div className="btn-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setShowForm(f => !f)}
          className="btn"
        >
          + Nueva Cuenta
        </button>

        <label>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="btn"
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="all">Todos</option>
            <option value="provider">Proveedores</option>
            <option value="cliente">Clientes</option>
          </select>
        </label>
      </div>

      {showForm && (
        <EntityForm
          entity="accounts"
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
          requiredFields={[]}
        />
      )}

      <div className="table-accounts">
        <TableAccounts filterRole={filterRole} refreshKey={refreshKey} />
      </div>
    </main>
  );
}
