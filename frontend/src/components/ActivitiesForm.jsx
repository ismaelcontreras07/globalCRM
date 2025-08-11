// src/components/ActivitiesForm.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../assets/css/EntityForm.css';
import '../assets/css/ActivitiesForm.css';
import Checkbox from './Checkbox';

export default function ActivitiesForm({ onCreate, onCancel }) {
  const [users, setUsers]                     = useState([]);
  const [leadsOptions, setLeadsOptions]       = useState([]);
  const [contactsOptions, setContactsOptions] = useState([]);

  const [assignedTo, setAssignedTo]     = useState(null);
  const [activityType, setActivityType] = useState('interno');
  const [referenceId, setReferenceId]   = useState(null);
  const [relatedAccount, setRelatedAccount] = useState('');
  const [description, setDescription]   = useState('');
  const [status, setStatus]             = useState('no_iniciada');
  const [error, setError]               = useState('');

  const [dueDate, setDueDate]   = useState('');
  const [dueTime, setDueTime]   = useState('');
  const [allDay, setAllDay]     = useState(false);

  // 1) Fetch users
  useEffect(() => {
    fetch('/api/users/listUsers.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUsers(data.users || data.data || []))
      .catch(console.error);
  }, []);

  // 2) Fetch leads or contacts when type changes
  useEffect(() => {
    setReferenceId(null);
    setRelatedAccount('');
    if (activityType === 'leads') {
      fetch('/api/leads/listLeads.php', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setLeadsOptions(data.leads || []))
        .catch(console.error);
    } else if (activityType === 'contacto') {
      fetch('/api/contacts/listContacts.php', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setContactsOptions(data.contacts || []))
        .catch(console.error);
    }
  }, [activityType]);

  // 3) Fetch related account if contact selected
  useEffect(() => {
    if (activityType === 'contacto' && referenceId) {
      fetch(`/api/contacts/getContacts.php?id=${referenceId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setRelatedAccount(data.account_name || ''))
        .catch(console.error);
    }
  }, [activityType, referenceId]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const payload = {
      assigned_to: assignedTo,
      due_date:    dueDate,
      all_day:     allDay ? 1 : 0,
      due_time:    allDay ? null : dueTime,
      activity_type: activityType,
      reference_id:  referenceId,
      description,
      status
    };

    try {
      const res = await fetch('/api/activities/createActivities.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // notify parent to refresh Kanban and close form
        onCreate();
        // reset form fields
        setAssignedTo(null);
        setDueDate('');
        setAllDay(false);
        setDueTime('');
        setActivityType('interno');
        setReferenceId(null);
        setRelatedAccount('');
        setDescription('');
        setStatus('no_iniciada');
      } else {
        setError(data.message || 'Error al crear actividad');
      }
    } catch {
      setError('Error de conexión al servidor');
    }
  };

  // prepare React-Select options
  const userOptions    = users.map(u => ({ value: u.id, label: u.name }));
  const leadOptions    = leadsOptions.map(l => ({ value: l.id, label: `${l.first_name} ${l.last_name}` }));
  // justo después de definir contactsOptions
const contactOptions = contactsOptions.map(c => ({
  value: c.id,
  label: `${c.first_name} ${c.last_name}`,
  accountName: c.account_name    // guardamos también la empresa
}));


  return (
      <form onSubmit={handleSubmit} className="activities-form">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-close-form">
            X
          </button>
        )}
        {error && <div className="error">{error}</div>}

        {/* Encargado */}
        <div className="form-group">
          <label htmlFor="assignedTo" className="form-label">Encargado</label>
          <Select
            id="assignedTo"
            options={userOptions}
            value={userOptions.find(o => o.value === assignedTo) || null}
            onChange={opt => setAssignedTo(opt ? opt.value : null)}
            placeholder="Selecciona usuario..."
            isClearable
            classNamePrefix="react-select"
            required
          />
        </div>

        {/* Fecha límite */}
        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">Fecha límite</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
          />
        </div>

        {/* Todo el día */}
        <div className="form-group-checkbox">
          <label htmlFor="allDay" className="form-label">Todo el día</label>
          <Checkbox
            id="allDay"
            checked={allDay}
            onChange={e => setAllDay(e.target.checked)}
          />
        </div>

        {/* Hora si no es todo el día */}
        {!allDay && (
          <div className="form-group">
            <label htmlFor="dueTime" className="form-label">Hora</label>
            <input
              id="dueTime"
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              required
            />
          </div>
        )}

        {/* Tipo de referencia */}
        <div className="form-group">
          <label htmlFor="activityType" className="form-label">Tipo</label>
          <select
            id="activityType"
            value={activityType}
            onChange={e => setActivityType(e.target.value)}
            required
          >
            <option value="leads">Leads</option>
            <option value="contacto">Contacto</option>
            <option value="interno">Interno</option>
          </select>
        </div>

        {/* Select dinámico de Lead/Contacto */}
        {(activityType === 'leads' || activityType === 'contacto') && (
          <div className="form-group">
            <label htmlFor="referenceId" className="form-label">
              {activityType === 'leads' ? 'Lead' : 'Contacto'}
            </label>
            <Select
              id="referenceId"
              options={activityType === 'leads' ? leadOptions : contactOptions}
              value={ (activityType === 'leads' ? leadOptions : contactOptions)
                        .find(o => o.value === referenceId) || null }
              onChange={opt => setReferenceId(opt ? opt.value : null)}
              placeholder="Selecciona..."
              isClearable
              classNamePrefix="react-select"
              required
            />
            {activityType === 'contacto' && relatedAccount && (
              <p>Pertenece a cuenta: <strong>{relatedAccount}</strong></p>
            )}
          </div>
        )}

<div className="form-group">
      <label htmlFor="contactAccount" className="form-label">Cuenta asociada</label>
      <input
        id="contactAccount"
        type="text"
        value={
          contactOptions.find(o => o.value === referenceId)?.accountName || ''
        }
        readOnly
      />
    </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Estatus */}
        <div className="form-group">
          <label htmlFor="status" className="form-label">Estatus</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            required
          >
            <option value="no_iniciada">No iniciada</option>
            <option value="pendiente">Pendiente</option>
            <option value="aplazada">Aplazada</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <button type="submit" className="btn">Crear Actividad</button>
      </form>
  );
}
