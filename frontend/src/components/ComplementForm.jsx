// src/components/ComplementForm.jsx
import React, { useState } from 'react';
import '../assets/css/EntityForm.css';

export default function ComplementForm({ onCancel, onCreate }) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate]         = useState(new Date().toISOString().slice(0,10));
  const [description, setDescription]     = useState('');
  const [error, setError]                 = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!invoiceNumber || !issueDate) {
      setError('Número de factura y fecha obligatorios');
      return;
    }
    try {
      const res = await fetch('/api/sales/createComplement.php', {
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ invoice_number: invoiceNumber, issue_date: issueDate, description })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onCreate();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <button type="button" className="btn-close-form" onClick={onCancel}>X</button>
      <h2 className="form-title">Complemento de Pago</h2>

      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label className="form-label">N° Factura</label>
        <input 
          type="text" 
          className="form-control" 
          value={invoiceNumber} 
          onChange={e=>setInvoiceNumber(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha Emisión</label>
        <input 
          type="date" 
          className="form-control" 
          value={issueDate} 
          onChange={e=>setIssueDate(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Descripción</label>
        <textarea 
          className="form-control" 
          value={description} 
          onChange={e=>setDescription(e.target.value)} 
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn">Guardar Complemento</button>
      </div>
    </form>
  );
}
