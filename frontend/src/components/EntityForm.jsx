// src/components/EntityForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/EntityForm.css';

// Configuración de campos por entidad
const fieldConfigs = {
  leads: [
    { name: 'first_name', label: 'Nombre', type: 'text', required: true },
    { name: 'last_name',  label: 'Apellido', type: 'text', required: true },
    { name: 'company',    label: 'Empresa',  type: 'text' },
    { name: 'position',   label: 'Puesto',   type: 'text' },
    { name: 'country',    label: 'País',     type: 'text' },
    { name: 'email',      label: 'Email',    type: 'email', required: true },
    { name: 'phone',      label: 'Teléfono', type: 'text' },
    { name: 'status',     label: 'Estado',   type: 'select', options: [
        { value: 'interesado', label: 'Interesado' },
        { value: 'aplazados',   label: 'Aplazados'   },
        { value: 'en_curso',    label: 'En curso'    },
        { value: 'completado',  label: 'Completado'  }
      ]
    }
  ],
  accounts: [
    { name: 'name',        label: 'Nombre de la cuenta', type: 'text', required: true },
    { name: 'industry',    label: 'Industria',           type: 'text' },
    { name: 'website',     label: 'Sitio web',           type: 'url'  },
    { name: 'phone',       label: 'Teléfono',            type: 'text' },
    { name: 'email',       label: 'Email',               type: 'email' },
    { name: 'address',     label: 'Dirección',           type: 'text' },
    { name: 'city',        label: 'Ciudad',              type: 'text' },
    { name: 'state',       label: 'Estado',              type: 'text' },
    { name: 'country',     label: 'País',                type: 'text' },
    { name: 'postal_code', label: 'Código Postal',       type: 'text' },
    { name: 'credit',      label: 'Crédito',             type: 'number' },
    { name: 'role',        label: 'Rol',                 type: 'select', options: [
        { value: 'cliente', label: 'Cliente' },
        { value: 'provider', label: 'Proveedor' }
      ]
    }
  ],
  contacts: [
    { name: 'account_id',  label: 'ID de Cuenta',        type: 'number', required: true },
    { name: 'first_name',  label: 'Nombre',              type: 'text',   required: true },
    { name: 'last_name',   label: 'Apellido',            type: 'text',   required: true },
    { name: 'title',       label: 'Cargo',               type: 'text' },
    { name: 'department',  label: 'Departamento',        type: 'text' },
    { name: 'email',       label: 'Email',               type: 'email' },
    { name: 'phone',       label: 'Teléfono',            type: 'text' },
    { name: 'mobile',      label: 'Móvil',               type: 'text' },
    { name: 'lead_source', label: 'Fuente del Lead',     type: 'text' }
  ]
};

// Endpoints de creación y actualización
const createEndpoint = {
  leads:    'leads/createLeads.php',
  accounts: 'accounts/createAccounts.php',
  contacts: 'contacts/createContacts.php'
};

const updateEndpoint = {
  leads:    'leads/updateLeads.php',
  accounts: 'accounts/updateAccounts.php',
  contacts: 'contacts/updateContacts.php'
};

/**
 * EntityForm component
 * @param {{
 *   entity: 'leads'|'accounts'|'contacts',
 *   id?: number|null,
 *   requiredFields?: string[],
 *   onCancel?: () => void
 * }} props
 */
export default function EntityForm({ entity, id = null, requiredFields = [], onCancel, onSaved }) {
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const endpoint = isEdit ? updateEndpoint[entity] : createEndpoint[entity];

  const [accountOptions, setAccountOptions] = useState([]);

  // Estado general
  const [formData, setFormData] = useState({});
  const [razones,   setRazones] = useState(['']);           // solo para accounts
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState('');

  // 1) Inicializar formData vacío al cambiar de entidad
  useEffect(() => {
    const initial = (fieldConfigs[entity] || []).reduce(
      (acc, f) => ({ ...acc, [f.name]: '' }), {}
    );
    setFormData(initial);
    if (entity === 'accounts') setRazones(['']);
  }, [entity]);

  // 2) Si es edición, cargar datos de account y razones sociales
  useEffect(() => {
    if (entity === 'accounts' && isEdit) {
      // Cuenta
      fetch(`/api/accounts/getAccount.php?id=${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setFormData(data.account));
      // Razones
      fetch(`/api/razones_sociales/listRazonSociales.php?account_id=${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.success && setRazones(data.razones.map(rs => rs.nombre)));
    }
  }, [entity, id, isEdit]);

  // tras tu useEffect de inicialización de formData:
useEffect(() => {
  if (entity === 'contacts') {
    fetch('/api/accounts/listAccounts.php', { credentials: 'include' })
      .then(r => r.json())
      .then(d => d.success && setAccountOptions(d.accounts))
      .catch(console.error);
  }
}, [entity]);

  // Manejadores
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepara payload
    const payload = { ...formData };
    if (isEdit) payload.id = id;
    if (entity === 'accounts') payload.razones_sociales = JSON.stringify(razones);

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSaved?.();            // << notifica al padre (cerrar form + refresh)
        return;                 // sal temprano; no navegues a la misma ruta
      } else {
        setError(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
<form onSubmit={handleSubmit} className="entity-form">
  {onCancel && (
    <button type="button" onClick={onCancel} className="btn-close-form">X</button>
  )}

  {/* Campos genéricos */}
  {fieldConfigs[entity]?.map(field => {
    const required = field.required || requiredFields.includes(field.name);

    // Si es contacts y es account_id, renderizamos el select
    if (entity === 'contacts' && field.name === 'account_id') {
      return (
        <div key="account_id" className="form-group">
          <label htmlFor="account_id" className="form-label">Cuenta</label>
          <select
            id="account_id"
            name="account_id"
            value={formData.account_id || ''}
            onChange={handleChange}
            required={required}
          >
            <option value="">Selecciona cuenta…</option>
            {accountOptions.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name} className="form-group">
        <label htmlFor={field.name} className="form-label">{field.label}</label>
        {field.type === 'select' ? (
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={required}
          >
            <option value="">Selecciona…</option>
            {field.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={required}
          />
        )}
      </div>
    );
  })}

  {/* Razones sociales (solo en accounts) */}
  {entity === 'accounts' && (
    <div className="form-group">
      <label htmlFor="razones_sociales" className="form-label">Razones Sociales</label>
      {razones.map((r, i) => (
        <input
          key={i}
          type="text"
          value={r}
          onChange={e => {
            const copy = [...razones];
            copy[i] = e.target.value;
            setRazones(copy);
          }}
        />
      ))}
      <div className="add-btn-container">
      <button type="button" onClick={() => setRazones(prev => [...prev, ''])} className="btn-add">
        +
      </button>
      <p>Agregar otra razón social</p>
      </div>
    </div>
  )}

  {error && <div className="error">{error}</div>}
  <button type="submit" disabled={loading} className="btn">
    {loading ? 'Guardando…' : 'Guardar'}
  </button>
</form>

  );
}
