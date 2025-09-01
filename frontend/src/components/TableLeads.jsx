// src/components/TableLeads.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/EntityTable.css';
import Checkbox from './Checkbox';

const STATUS_OPTIONS = [
  { value: 'interesado', label: 'Interesado' },
  { value: 'aplazados',  label: 'Aplazados'  },
  { value: 'en_curso',   label: 'En curso'   },
  { value: 'completado', label: 'Completado' }
];

export default function TableLeads({ refreshKey = 0, onCheckboxClick }) {
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]       = useState('');

  // Edición inline
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue]   = useState('');
  const inputRef = useRef(null);

  function formatDDMMYYYY(raw) {
    if (!raw) return '';
    const d = new Date(raw);
    if (!isNaN(d)) {
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }
    const [ymd] = String(raw).split(' ');
    const [y, m, d2] = (ymd || '').split('-');
    return (d2 && m && y) ? `${d2}/${m}/${y}` : String(raw);
  }

  const reloadLeads = () => {
    setLoading(true);
    setError('');
    fetch('/api/leads/listLeads.php', { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar leads');
        return r.json();
      })
      .then(d => setLeads(d.leads || []))
      .catch(() => setError('No se pudieron cargar los leads'))
      .finally(() => setLoading(false));
  };

  // Carga inicial
  useEffect(() => {
    reloadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarga cuando cambie refreshKey (después de importar)
  useEffect(() => {
    if (refreshKey > 0) reloadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Enfocar input/select al entrar en modo edición
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const startEditing = (leadId, field) => {
    const raw = leadId && leads.find(l => l.id === leadId)?.[field];
    const current = field === 'created_at'
      ? new Date(raw).toISOString().slice(0, 10)
      : raw;
    setEditingCell({ id: leadId, field });
    setInputValue(current || '');
  };

  const saveEdit = async () => {
    const { id, field } = editingCell;
    setUpdating(true);
    try {
      const res = await fetch('/api/leads/updateLeads.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, [field]: inputValue })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(prev => prev.map(l =>
          l.id === id ? { ...l, [field]: inputValue } : l
        ));
      } else {
        setError(data.message || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setEditingCell(null);
      setUpdating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

// Click en checkbox
const handleCheckbox = (e, lead) => {
  // Mandamos al padre el lead y el estado final del checkbox
  onCheckboxClick?.(lead, e.target.checked);
};


  if (loading) return <p>Cargando leads…</p>;
  if (error)   return <p className="error">{error}</p>;

  const fields = [
    'first_name','company','position',
    'email','phone','status','created_at'
  ];

  return (
    <div className="table-container">
      <table className="entity-table">
        <thead>
          <tr>
            <th />
            <th>Nombre Completo</th>
            <th>Empresa</th>
            <th>Puesto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td>
                {/* El componente Checkbox que ya usas */}
                <Checkbox onChange={(e) => handleCheckbox(e, lead)} />
              </td>

              {fields.map(field => (
                <td
                  key={field}
                  onClick={() => startEditing(lead.id, field)}
                >
                  {editingCell &&
                   editingCell.id === lead.id &&
                   editingCell.field === field ? (
                    field === 'status' ? (
                      <select
                          ref={inputRef}
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          disabled={updating}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                    ) : (
                      <input
  ref={inputRef}
  type={field === 'created_at' ? 'date' : 'text'}
  value={inputValue}
  onChange={e => setInputValue(e.target.value)}
  onBlur={saveEdit}
  onKeyDown={handleKeyDown}
  onClick={(e) => e.stopPropagation()}
  onMouseDown={(e) => e.stopPropagation()}
  disabled={updating}
/>

                    )
                  ) : (
                    field === 'status'
                      ? String(lead[field] ?? '').replace('_', ' ')
                      : field === 'created_at'
                        ? formatDDMMYYYY(lead[field])
                        : String(lead[field] ?? '')
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
