// src/components/SaleCard.jsx
import React, { useState } from 'react'
import '../assets/css/SaleCard.css'

const STATUS_OPTIONS = ['pendiente','vencido','pagado']

export default function SaleCard({ sale, onStatusChange, onDeleted }) {
  const { 
    sale_id, sale_date, project, description,
    customer_invoice: ci, provider_invoices: pis
  } = sale

  const [providers, setProviders] = useState(pis)
  const [customerInv, setCustomerInv] = useState(ci)
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [reason, setReason] = useState('')
  const [replacementInv, setReplacementInv] = useState('')

  // formatea YYYY-MM-DD → DD/MM/YYYY
  const formatDDMMYYYY = iso => {
    const [y,m,d] = iso.split('-')
    return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`
  }

  // helper para notificar delta al padre
  const notifyDelta = (category, oldSt, newSt, amount) => {
    onStatusChange?.({ category, oldStatus: oldSt, newStatus: newSt, amount })
  }

  // Cambiar estatus de factura proveedor
  const updateProviderStatus = async (provId, newStatus) => {
    const prov = providers.find(p => p.id === provId)
    const oldStatus = prov.status
    const amount    = prov.total    // ó prov.subtotal si prefieres con subtotales

    const res = await fetch('/api/provider_invoices/updateStatus.php', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id: provId, status: newStatus })
    }).then(r => r.json())

    if (res.success) {
      setProviders(ps =>
        ps.map(p => p.id === provId ? { ...p, status: newStatus } : p)
      )
      // notificamos el delta para “deuda”
      onStatusChange?.({
        category:  'deuda',
        oldStatus,
        newStatus,
        amount,
        sale_id,
        entity: 'provider',
        invoice_id: provId
      })
    } else {
      alert(res.message)
    }
  }

  const updateCustomerStatus = async newStatus => {
    const oldStatus = customerInv.status
    const amount    = customerInv.total  // ó customerInv.subtotal
    

    const res = await fetch('/api/customer_invoices/updateStatus.php', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        id: customerInv.invoice_id,
        status: newStatus
      })
    }).then(r => r.json())

    if (res.success) {
      setCustomerInv(ci => ({ ...ci, status: newStatus }))
      // notificamos el delta para “cobranza”
      onStatusChange?.({
        category:  'cobranza',
        oldStatus,
        newStatus,
        amount,
        sale_id,
        entity: 'customer',
        invoice_id: customerInv.invoice_id
      })
    } else {
      alert(res.message)
    }
  }

  const fmtMoney = (v) =>
    Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Soft replace
  const softReplace = async () => {
    if (!reason.trim() || !replacementInv.trim()) {
      return alert('Debe indicar motivo y nº de factura de reemplazo.')
    }
    const res = await fetch('/api/sales/softReplaceSale.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        sale_id,
        replace_reason: reason,
        replace_invoice: replacementInv
      })
    }).then(r => r.json())
    if (res.success) {
      setShowActions(false)
    } else {
      alert(res.message)
    }
  }

  // Hard delete
  const hardDelete = async () => {
    if (!window.confirm('¿Eliminar definitivamente esta venta?')) return
    const res = await fetch('/api/sales/deleteSale.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ sale_id })
    }).then(r => r.json())
    if (res.success) {
      onDeleted?.()
    } else {
      alert(res.message)
    }
  }

  return (
    <div className="sale-card">
      <header className="sale-card-header">
        <div className="sale-header-main">
          <h2 className="sale-title">Venta {customerInv.invoice_number}</h2>
        </div>
        <div className="sale-header-actions">
          <button
            className="btn-toggle-details"
            onClick={() => setExpanded(e => !e)}
            aria-label="Toggle detalles"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#ffffff"><path d="M313-40q-24 0-46-9t-39-26L24-280l33-34q14-14 34-19t40 0l69 20v-327q0-17 11.5-28.5T240-680q17 0 28.5 11.5T280-640v433l-98-28 103 103q6 6 13 9t15 3h167q33 0 56.5-23.5T560-200v-160q0-17 11.5-28.5T600-400q17 0 28.5 11.5T640-360v160q0 66-47 113T480-40H313Zm7-280v-160q0-17 11.5-28.5T360-520q17 0 28.5 11.5T400-480v160h-80Zm120 0v-120q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440v120h-80Zm40 200H285h195Zm160-400q-91 0-168-48T360-700q35-84 112-132t168-48q91 0 168 48t112 132q-35 84-112 132t-168 48Zm0-80q57 0 107.5-26t82.5-74q-32-48-82.5-74T640-800q-57 0-107.5 26T450-700q32 48 82.5 74T640-600Zm0-40q-25 0-42.5-17.5T580-700q0-25 17.5-42.5T640-760q25 0 42.5 17.5T700-700q0 25-17.5 42.5T640-640Z"/></svg>
          </button>
          <button
            className="btn-actions"
            onClick={() => setShowActions(a => !a)}
            aria-label="Acciones"
          >•••</button>
        </div>
      </header>

      <div className="sale-extra">
        {project && <p><strong>Proyecto:</strong> {project}</p>}
        {description && <p><strong>Descripción:</strong> {description}</p>}
      </div>

      <div className={`sale-card-body ${expanded ? 'is-expanded' : ''}`}>
        <section className="provider-section">
          <h3>Proveedores</h3>
          {providers.length === 0
            ? <p className="empty">Sin facturas de proveedor</p>
            : providers.map(pi => (
                <div key={pi.id} className="provider-invoice">
                  <p className="provider-invoice-faq">{pi.business_name}</p>
                  <p className="provider-invoice-item">Factura: <strong className="provider-invoice-main">{pi.invoice_number}</strong></p>
                  <p className="provider-invoice-item">Subtotal: <strong className="provider-invoice-main">${fmtMoney(pi.subtotal)}</strong></p>
                  <p className="provider-invoice-item">Total:    <strong className="provider-invoice-main">${fmtMoney(pi.total)}</strong></p>
                  <p className="provider-invoice-item">Vence:    <strong className="provider-invoice-main">{formatDDMMYYYY(pi.due_date)}</strong></p>
                  <div className="form-group">
                    <select
                      value={pi.status}
                      onChange={e => updateProviderStatus(pi.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
          }
        </section>

        <section className="client-section">
          <h3>Cliente</h3>
          {customerInv
            ? <div className="client-invoice">
                <p className="client-invoice-faq">{customerInv.business_name}</p>
                 <p className="client-invoice-item">Factura: <strong className="client-invoice-main">{customerInv.invoice_number}</strong></p>
                <p className="client-invoice-item">Subtotal: <strong className="client-invoice-main">${fmtMoney(customerInv.subtotal)}</strong></p>
                <p className="client-invoice-item">Total:    <strong className="client-invoice-main">${fmtMoney(customerInv.total)}</strong></p>
                <p className="client-invoice-item">Utilidad: <strong className="client-invoice-main">${fmtMoney(customerInv.net_profit)} ({customerInv.profit_pct.toFixed(2)}%)</strong></p>
                <p className="client-invoice-item">Vence:    <strong className="client-invoice-main">{formatDDMMYYYY(customerInv.due_date)}</strong></p>
                <div className="form-group">
                  <select
                    value={customerInv.status}
                    onChange={e => updateCustomerStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
               </div>
                </div>
            : <p className="empty">Sin factura de cliente</p>
          }
        </section>
      </div>

      {showActions && (
        <div className="action-card">
          <div className="card-content">
            <p className="card-heading">¿Qué deseas hacer?</p>
            <p className="card-description">
              “Reemplazar” marca esta venta como reemplazada;<br/>
              “Borrar” la elimina definitivamente.
            </p>
            <div className="card-button-wrapper">
              <button className="card-button secondary" onClick={() => setShowActions(false)}>
                Cancelar
              </button>
              <button className="card-button primary" onClick={softReplace}>
                Reemplazar
              </button>
              <button className="card-button primary" onClick={hardDelete}>
                Borrar
              </button>
            </div>
            <div className="replace-inputs">
              <label>
                Motivo de cancelación
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </label>
              <label>
                Factura de reemplazo
                <input
                  type="text"
                  value={replacementInv}
                  onChange={e => setReplacementInv(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
