// src/components/TableLeads.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/EntityTable.css';
import Checkbox from './Checkbox';

const STATUS_OPTIONS = [
  { value: 'no_iniciado', label: 'No iniciado' },
  { value: 'aplazados',   label: 'Aplazados'   },
  { value: 'en_curso',    label: 'En curso'    },
  { value: 'completado',  label: 'Completado'  }
];

export default function TableLeads() {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); 
  const [error, setError]     = useState('');

  // Estado de edición: { id, field } o null
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue]   = useState('');
  const inputRef = useRef(null);


function formatDDMMYYYY(rawDatetime) {
  const [ymd] = rawDatetime.split(' ');
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}


  useEffect(() => {
    fetch('/api/leads/listLeads.php', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar leads');
        return res.json();
      })
      .then(data => setLeads(data.leads || []))
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar los leads');
      })
      .finally(() => setLoading(false));
  }, []);

  // Cuando entras en modo edición, enfoca el input/select
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const startEditing = (leadId, field) => {
    // para fecha: formatea a YYYY-MM-DD
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

  if (loading) return <p>Cargando leads…</p>;
  if (error)   return <p className="error">{error}</p>;

  const fields = [
    'first_name','last_name','company','position',
    'country','email','phone','status','created_at'
  ];

  return (
    <div className="table-container">
      <table className="entity-table">
        <thead>
          <tr>
            <th />
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Empresa</th>
            <th>Puesto</th>
            <th>País</th>
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
                <Checkbox />
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
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
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
                      />
                    )
                  ) : (
                    field === 'status'
                      ? lead[field].replace('_', ' ')
                      : field === 'created_at'
                        ? formatDDMMYYYY(lead[field])
                        : lead[field]
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
