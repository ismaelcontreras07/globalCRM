// src/components/SummaryBoxes.jsx
import React from 'react';
import '../assets/css/SummaryBoxes.css';

export default function SummaryBoxes({ data }) {
  if (!data) return null;
  const { deuda, cobranza, comisiones } = data;

    // formatea y arregla el -0.00
    const fmt = n => {
      // si es +0 o -0, lo convertimos a 0
      const clean = Object.is(n, -0) || n === 0 ? 0 : n;
      return clean.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

  return (
    <div className="summary-boxes-container">
      <div className="summary-box deuda">
        <h3 className="summary-box-title">Deuda</h3>
        <div className="summary-box-row">
          <p><strong className="summary-box-row-label">Pendiente:</strong> ${fmt(deuda.pendiente)}</p>
          <p><strong className="summary-box-row-label">Vencido:</strong>   ${fmt(deuda.vencido)}</p>
          <p><strong className="summary-box-row-label">Pagado:</strong>    ${fmt(deuda.pagado)}</p>
        </div>
      </div>
      <div className="summary-box cobranza">
        <h3 className="summary-box-title">Cobranza</h3>
        <div className="summary-box-row">
          <p><strong className="summary-box-row-label">Pendiente:</strong> ${fmt(cobranza.pendiente)}</p>
          <p><strong className="summary-box-row-label">Vencido:</strong> ${fmt(cobranza.vencido)}</p>
          <p><strong className="summary-box-row-label">Pagado:</strong>    ${fmt(cobranza.pagado)}</p>
        </div>
      </div>
      <div className="summary-box comisiones">
        <h3 className="summary-box-title">Comisiones</h3>
        <div className="summary-box-row">
          <p><strong className="summary-box-row-label">Pendiente:</strong> ${fmt(comisiones.pendiente)}</p>
          <p><strong className="summary-box-row-label">Vencido:</strong>   ${fmt(comisiones.vencido)}</p>
          <p><strong className="summary-box-row-label">Pagado:</strong>    ${fmt(comisiones.pagado)}</p>
        </div>
      </div>
    </div>
  );
}
