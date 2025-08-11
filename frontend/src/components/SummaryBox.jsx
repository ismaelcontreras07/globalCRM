// src/components/SummaryBox.jsx
import React from 'react';
import '../assets/css/SummaryBox.css';

export default function SummaryBox({ title, data, fields }) {
  // fields: e.g. [{ key:'sum_subtotal', label:'Subtotal' }, { key:'sum_total', label:'Total' }]
  return (
    <div className={`summary-box summary-${title.toLowerCase()}`}>
      <h3>{title}</h3>
      <div className="summary-row">
        {Object.entries(data).map(([status, vals]) => (
          <div key={status} className="summary-cell">
            <strong>{status.charAt(0).toUpperCase()+status.slice(1)}</strong>
            {fields.map(f => (
              <p key={f.key}>{f.label}: ${vals[f.key].toLocaleString()}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
