// src/components/TableContacts.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/EntityTable.css';
import Checkbox from './Checkbox';

export default function TableContacts() {
  const [contacts, setContacts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);
  const [error, setError]         = useState('');

  // Estado de edición: { id, field } o null
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue]   = useState('');
  const inputRef = useRef(null);

  // Campos que no pueden editarse
  const nonEditable = ['account_id', 'created_at'];

  function formatDDMMYYYY(rawDatetime) {
    const [ymd] = rawDatetime.split(' ');
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  }

  // Carga inicial de contactos
  useEffect(() => {
    fetch('/api/contacts/listContacts.php', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar contactos');
        return res.json();
      })
      .then(data => setContacts(data.contacts || []))
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar los contactos');
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-focus al entrar en modo edición
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const startEditing = (contactId, field) => {
    if (nonEditable.includes(field)) return;
    const raw = contacts.find(c => c.id === contactId)?.[field];
    const current = field === 'created_at'
      ? new Date(raw).toISOString().slice(0, 10)
      : raw;
    setEditingCell({ id: contactId, field });
    setInputValue(current || '');
  };

  const saveEdit = async () => {
    const { id, field } = editingCell;
    setUpdating(true);
    try {
      const res = await fetch('/api/contacts/updateContacts.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, [field]: inputValue })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setContacts(prev => prev.map(c =>
          c.id === id ? { ...c, [field]: inputValue } : c
        ));
      } else {
        setError(data.message || 'Error al actualizar contacto');
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

  if (loading) return <p>Cargando contactos…</p>;
  if (error)   return <p className="error">{error}</p>;

  const fields = [
    'account_id','first_name','last_name','title','department',
    'email','phone','mobile','lead_source','created_at'
  ];

  return (
    <div className="table-container">
      <table className="entity-table">
        <thead>
          <tr>
            <th />
            <th>Cuenta</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Móvil</th>
            <th>Fuente Lead</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td><Checkbox /></td>
              {fields.map(field => (
                <td
                  key={field}
                  onClick={() => startEditing(contact.id, field)}
                  style={{ cursor: nonEditable.includes(field) ? 'default' : 'pointer' }}
                >
                  {editingCell?.id === contact.id && editingCell.field === field ? (
                    <input
                      ref={inputRef}
                      type={field === 'created_at' ? 'date' : 'text'}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    field === 'account_id'
                      ? contact.account_name
                      : field === 'created_at'
                        ? formatDDMMYYYY(contact.created_at)
                        : contact[field]
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
