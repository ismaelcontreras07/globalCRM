import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../assets/css/CommissionsCard.css';

const STATUS_OPTIONS = ['pendiente','vencido','pagado'];

export default function CommissionsCard() {
  const { user } = useContext(AuthContext);
  const [coms, setComs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/commissions/listUserCommissions.php', { credentials:'include' })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.message);
        setComs(json.commissions);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar las comisiones');
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  const updateStatus = (id, newStatus) => {
    fetch('/api/commissions/updateCommissionStatus.php', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id, status: newStatus })
    })
    .then(r => r.json())
    .then(json => {
      if (!json.success) throw new Error(json.message);
      setComs(cs => cs.map(c => c.id === id ? { ...c, status: newStatus } : c));
    })
    .catch(err => {
      console.error(err);
      alert('Error actualizando estatus');
    });
  };

  if (loading) return <div className="comm-card">Cargando comisiones…</div>;
  if (error)   return <div className="comm-card error">{error}</div>;

  return (
    <div className="comm-card">
      <h2 className="comm-title">Mis Comisiones</h2>
      {coms.length === 0 ? (
        <p>No tienes comisiones pendientes.</p>
      ) : (
        <div className="table-container">
        <table className="entity-table">
          <thead>
            <tr>
              <th>Factura</th>
              <th>% Comisión</th>
              <th>Monto</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {coms.map(c => (
              <tr key={c.id}>
                <td>{c.invoice_number}</td>
                <td>{Number(c.pct).toFixed(2)}%</td>
                <td>${Number(c.amount).toFixed(2)}</td>
                <td>
                  <div className="select-container">
                  <select
                    value={c.status}
                    onChange={e => updateStatus(c.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
