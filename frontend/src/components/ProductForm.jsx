// src/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';

export default function ProductForm({ onCreate, onCancel }) {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({
    provider_id:         '',
    category:            'ups',
    model:               '',
    description:         '',
    provider_cost:       '',
    datasheet_url:       '',
    // Ups details
    type:                '',
    power_factor:        '',
    family:              '',
    watts:               '',
    va:                  '',
    vac:                 '',
    batteries:           '',
    mounting:            '',
    // Suppressor details
    outlets:             '',
    absorption:          '',
    // Battery details
    technology:          '',
    ah:                  '',
    vdc:                 '',
    // Accessory details
    family_compatibility:''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/accounts/listProviders.php', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.success) setProviders(json.providers);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/products/createProduct.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onCreate(json.product);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Render de campos según categoría
  const renderCategoryFields = () => {
    switch (form.category) {
      case 'ups':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">-- Selecciona --</option>
                <option value="online">Online</option>
                <option value="interactivo">Interactivo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Factor de Potencia</label>
              <input
                type="number"
                name="power_factor"
                value={form.power_factor}
                onChange={handleChange}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Familia</label>
              <input
                type="text"
                name="family"
                value={form.family}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Watts (W)</label>
              <input
                type="number"
                name="watts"
                value={form.watts}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">VA</label>
              <input
                type="number"
                name="va"
                value={form.va}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" >VAC</label>
              <input
                type="number"
                name="vac"
                value={form.vac}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Baterías</label>
              <input
                type="number"
                name="batteries"
                value={form.batteries}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Montaje</label>
              <select name="mounting" value={form.mounting} onChange={handleChange}>
                <option value="">-- Selecciona --</option>
                <option value="rack">Rack</option>
                <option value="torre">Torre</option>
              </select>
            </div>
          </>
        );
      case 'suppressor':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Familia</label>
              <input name="family" value={form.family} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Watts (W)</label>
              <input type="number" name="watts" value={form.watts} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">VAC</label>
              <input type="number" name="vac" value={form.vac} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Outlets</label>
              <input type="number" name="outlets" value={form.outlets} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Absorción (kVA)</label>
              <input
                type="number"
                name="absorption"
                value={form.absorption}
                step="0.01"
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 'battery':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Tecnología</label>
              <input name="technology" value={form.technology} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacidad (Ah)</label>
              <input type="number" name="ah" value={form.ah} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Voltaje (Vdc)</label>
              <input type="number" name="vdc" value={form.vdc} onChange={handleChange} />
            </div>
          </>
        );
      case 'accessory':
        return (
          <>
            <div className="form-group">
                <label className="form-label">Tipo de Accesorio</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="">-- Selecciona --</option>
                <option value="snmp">SNMP</option>
                <option value="rails">Rails</option>
                <option value="case">Case</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Compatibilidad (Familia)</label>
              <input
                name="family_compatibility"
                value={form.family_compatibility}
                onChange={handleChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
  {onCancel && (
    <button type="button" className="btn-close-form" onClick={onCancel} disabled={saving} clas>X</button>
  )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
      <label className="form-label">Proveedor</label>
      <select
        name="provider_id"
        value={form.provider_id}
        onChange={handleChange}
        required
      >
        <option value="">-- Selecciona --</option>
        {providers.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      </div>

      <div className="form-group">
      <label className="form-label">Categoría</label>
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
      >
        <option value="ups">UPS</option>
        <option value="suppressor">Supresor</option>
        <option value="battery">Batería</option>
        <option value="accessory">Accesorio</option>
      </select>
      </div>

      <div className="form-group">  
      <label className="form-label">Modelo</label>
      <input
        type="text"
        name="model"
        value={form.model}
        onChange={handleChange}
        required
      />
      </div>

      <div className="form-group">
      <label className="form-label">Costo del proveedor</label>
      <input
        type="number"
        name="provider_cost"
        value={form.provider_cost}
        onChange={handleChange}
        step="0.01"
        required
      />
      </div>

      <div className="form-group">
      <label className="form-label">Descripción</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
      />
      </div>

      <div className="form-group">
      <label className="form-label">Datasheet (URL)</label>
      <input
        type="url"
        name="datasheet_url"
        value={form.datasheet_url}
        onChange={handleChange}
      />
      </div>

      {renderCategoryFields()}

      <div className="btn-container">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
