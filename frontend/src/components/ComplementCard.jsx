// src/components/ComplementCard.jsx
import React from 'react';
import '../assets/css/SaleCard.css';
import '../assets/css/ComplementCard.css';

export default function ComplementCard({ complement, onDeleted }) {
  const { id, invoice_number, issue_date, description } = complement;

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este complemento de pago?')) return;
    try {
      const res = await fetch(`/api/sales/deleteComplement.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onDeleted?.();
    } catch (err) {
      console.error('Error al eliminar complemento:', err);
      alert(err.message);
    }
  };

  return (
    <div className="sale-card complement-card">
      <header className="sale-card-header">
        <div className="sale-header-main">
          <h2 className="sale-title">Complemento {invoice_number}</h2>
        </div>
        <div className="sale-header-actions">
          <button
            className="btn-delete-complement"
            onClick={handleDelete}
            aria-label="Eliminar complemento"
          >
          Borrar
          </button>
        </div>
      </header>

      <div className="sale-card-body is-expanded">
        <section className="complement-section">
          <div className="complement-body">
            <p><strong>Emisión:</strong> {issue_date}</p>
            {description && (
              <p><strong>Descripción:</strong> {description}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
