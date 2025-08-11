// src/components/TableAccounts.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/EntityTable.css';
import Checkbox from './Checkbox';

const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

const ROLE_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'provider', label: 'Proveedor' }
];

export default function TableAccounts( { filterRole = 'all', refreshKey = 0 } ) {
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState(false);
  const [error, setError]           = useState('');

  // Estado de edición: { id, field } o null
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue]   = useState('');
  const inputRef = useRef(null);

  function formatDDMMYYYY(rawDatetime) {
    if (!rawDatetime) return '';
    // toma solo la parte fecha, antes del espacio
    const fecha = String(rawDatetime).split(' ')[0];
    const [y, m, d] = fecha.split('-');
    if (![y, m, d].every(x => x)) return '';
    return `${d}/${m}/${y}`;
  }
  
  // Carga inicial de cuentas
  useEffect(() => {
    setLoading(true);
    fetch('/api/accounts/listAccounts.php', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar cuentas');
        return res.json();
      })
      .then(data => setAccounts(data.accounts || []))
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar las cuentas');  
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Auto-focus al entrar en modo edición
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const startEditing = (accountId, field) => {
    const raw = accounts.find(a => a.id === accountId)?.[field];
    const current = field === 'created_at'
      ? new Date(raw).toISOString().slice(0, 10)
      : raw;
    setEditingCell({ id: accountId, field });
    setInputValue(current || '');
  };

  const saveEdit = async () => {
    const { id, field } = editingCell;
    setUpdating(true);
    try {
      const res = await fetch('/api/accounts/updateAccounts.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, [field]: inputValue })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccounts(prev => prev.map(a =>
          a.id === id ? { ...a, [field]: inputValue } : a
        ));
      } else {
        setError(data.message || 'Error al actualizar cuenta');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setEditingCell(null);
      setUpdating(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

  if (loading) return <p>Cargando cuentas…</p>;
  if (error)   return <p className="error">{error}</p>;

  const fields = [
    'name','industry','website','phone','email',
    'address','city','state','country','postal_code',
    'status','credit', 'razones_sociales', 'created_at', 'role'
  ];

  const filteredAccounts = accounts.filter(acc =>
    filterRole === 'all' || acc.role === filterRole
  );

  return (
    <div className="table-container">
      <table className="entity-table">
        <thead>
          <tr>
            <th />
            <th>Nombre</th>
            <th>Industria</th>
            <th>Website</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>País</th>
            <th>Código Postal</th>
            <th>Estado</th>
            <th>Credito (días)</th>
            <th>Razones Sociales</th>
            <th>Creado</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map(account => (
            <tr key={account.id}>
              <td><Checkbox /></td>
              {fields.map(field => (
                <td
                  key={field}
                  onClick={() => startEditing(account.id, field)}
                >
                  {editingCell?.id === account.id && editingCell.field === field ? (
                    // Renderizar select para status, role o input para otros campos
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
                    ) : field === 'role' ? (
                      <select
                        ref={inputRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                      >
                        {ROLE_OPTIONS.map(opt => (
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
                    // Modo lectura
                    field === 'status' ? (
                      account[field]
                    ) : field === 'role' ? (
                      // Mostrar label de rol, si existe
                      ROLE_OPTIONS.find(o => o.value === account.role)?.label || account.role
                    ) : field === 'created_at' ? (
                      formatDDMMYYYY(account[field])
                    ) : (
                      account[field]
                    )
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
