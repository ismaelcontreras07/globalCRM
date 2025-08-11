// src/components/MonthlyInvoicesModal.jsx
import React from 'react';

export default function MonthlyInvoicesModal({ detailModal, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>
          {detailModal.type === 'providers' ? 'Proveedores'
            : detailModal.type === 'clients' ? 'Clientes'
            : 'Comisiones'} — {detailModal.month}
        </h3>
        <div className="table-container">
          <table className="entity-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Emisión</th>
                <th>{detailModal.type === 'commissions' ? 'Comisión' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {detailModal.invoices.map(inv => (
                <tr key={inv.invoice_number}>
                  <td>{inv.invoice_number}</td>
                  <td>{inv.issue_date}</td>
                  <td>
                    ${Number(
                      detailModal.type === 'commissions'
                        ? inv.commission
                        : inv.total
                    ).toLocaleString(undefined, { minimumFractionDigits:2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
