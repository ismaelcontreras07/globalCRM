// src/components/SalesForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import '../assets/css/EntityForm.css'
import '../assets/css/SalesForm.css'

export default function SalesForm({ onCancel, onCreate }) {
  // Venta
  const [saleDate, setSaleDate]       = useState(new Date().toISOString().slice(0,10))
  const [project, setProject]         = useState('')
  const [description, setDescription] = useState('')

  // Proveedores
  const [providerAccounts, setProviderAccounts] = useState([])
  const defaultProv = {
    accountId: '',
    businessName: '',
    invoiceNumber: '',
    issueDate: '',
    creditDays: 0,
    dueDate: '',
    subtotal: '0.00',
    status: 'pendiente'
  }
  const [providerInvoices, setProviderInvoices] = useState([ defaultProv ])

  // Cliente
  const [clientAccounts, setClientAccounts]         = useState([])
  const [clientInvoiceNumber, setClientInvoiceNumber] = useState('')
  const [clientAccountId, setClientAccountId]       = useState('')
  const [clientBusinessName, setClientBusinessName] = useState('')
  const [clientRazones,    setClientRazones]    = useState([])  
const [clientRazonSelect, setClientRazonSelect] = useState('')
  const [clientIssueDate, setClientIssueDate]       = useState(new Date().toISOString().slice(0,10))
  const [clientCreditDays, setClientCreditDays]     = useState(0)
  const [clientDueDate, setClientDueDate]           = useState('')
  const [clientSubtotal, setClientSubtotal]         = useState('0.00')
  const [clientTotal, setClientTotal]               = useState('0.00')
  const [clientStatus, setClientStatus]             = useState('pendiente')
  const [clientUtilityPct, setClientUtilityPct]     = useState('0.00')
  const [clientUtilityAmt, setClientUtilityAmt]     = useState('0.00')

  // Comisiones
  const [users, setUsers] = useState([])
  const defaultComm = { userId:'', pct:'0.00', amount:'0.00' }
  const [commissions, setCommissions] = useState([ defaultComm ])

  const statusOpts = ['pendiente','vencido','pagado']

  // carga cuentas y usuarios
  useEffect(() => {
    fetch('/api/accounts/listAccounts.php?role=provider',{credentials:'include'})
    .then(res => res.json())
    .then(data => setProviderAccounts(data.accounts || data.data || []))
    fetch('/api/accounts/listAccounts.php?role=cliente',{credentials:'include'})
    .then(res => res.json())
    .then(data => setClientAccounts(data.accounts || data.data || []))
    fetch('/api/users/listUsers.php',{credentials:'include'})
    .then(res => res.json())
    .then(data => setUsers(data.users || data.data || []))
    .catch(console.error);
  },[])

  // actualizar cliente businessName y creditDays
  useEffect(() => {
    const acc = clientAccounts.find(a => a.id === Number(clientAccountId)) || {}
    const razones = acc.razones_sociales || []
    setClientRazones(razones)
    setClientRazonSelect(razones[0] || '')
    setClientCreditDays(Number(acc.credit) || 0)
  }, [clientAccountId, clientAccounts])

  // cliente dueDate
  useEffect(() => {
    const d = new Date(clientIssueDate)
    d.setDate(d.getDate() + clientCreditDays)
    setClientDueDate(d.toISOString().slice(0,10))
  }, [clientIssueDate, clientCreditDays])

  // cliente total
  useEffect(() => {
    const sub = parseFloat(clientSubtotal) || 0
    setClientTotal((sub * 1.16).toFixed(2))
  }, [clientSubtotal])

  // utilidad cliente menos proveedores
  const totalProv = useMemo(
    () => providerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.subtotal)||0), 0),
    [providerInvoices]
  )
  useEffect(() => {
    const subC = parseFloat(clientSubtotal) || 0
    const utilAmt = subC - totalProv
    setClientUtilityAmt(utilAmt.toFixed(2))
    if (subC > 0) {
      // pct = (1 - provSubtotal / clientSubtotal) * 100
      setClientUtilityPct(((1 - (totalProv / subC)) * 100).toFixed(2))
    }
  }, [clientSubtotal, totalProv])

  // handlers proveedores (incluye businessName, creditDays, dueDate)
  const addProv = useCallback(() => {
    setProviderInvoices(p => [...p, defaultProv])
  }, [])
  const updProv = useCallback((i, field, val) => {
    setProviderInvoices(p =>
      p.map((inv, idx) => {
        if (idx !== i) return inv
        const upd = { ...inv, [field]: val }
        if (field === 'accountId') {
          const acc = providerAccounts.find(a => a.id === Number(val))
          upd.businessName = acc?.razones_sociales || ''
          upd.creditDays = Number(acc?.credit) || 0
        }
        if (field === 'issueDate' || field === 'accountId') {
          if (upd.issueDate) {
            const d = new Date(upd.issueDate)
            d.setDate(d.getDate() + (upd.creditDays || 0))
            upd.dueDate = d.toISOString().slice(0,10)
          }
        }
        return upd
      })
    )
  }, [providerAccounts])
  const delProv = useCallback(i => {
    setProviderInvoices(p => p.filter((_, idx) => idx !== i))
  }, [])

  // handlers comisiones (sobre utilidad)
  const addComm = useCallback(() => {
    setCommissions(p => [...p, defaultComm])
  }, [])
  const updComm = useCallback((i, field, val) => {
    setCommissions(p =>
      p.map((c, idx) => {
        if (idx !== i) return c
        const upd = { ...c, [field]: val }
        if (field === 'pct') {
          const amt = (parseFloat(clientUtilityAmt) || 0) * (parseFloat(val) || 0) / 100
          upd.amount = amt.toFixed(2)
        }
        return upd
      })
    )
  }, [clientUtilityAmt])
  const delComm = useCallback(i => {
    setCommissions(p => p.filter((_, idx) => idx !== i))
  }, [])

  // submit
  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    if (!clientAccountId) {
      alert('Selecciona cliente');
      return;
    }
  
    const payload = {
      sale: { sale_date: saleDate, project, description },
      providerInvoices: providerInvoices.map(inv => ({
        account_id: Number(inv.accountId),
        invoice_number: inv.invoiceNumber,
        issue_date: inv.issueDate,
        due_date: inv.dueDate,
        subtotal: parseFloat(inv.subtotal),
        status: inv.status
      })),
      customerInvoice: {
        invoice_number: clientInvoiceNumber,
        account_id: Number(clientAccountId),
        business_name: clientRazonSelect || clientRazones[0] || clientBusinessName,
        issue_date: clientIssueDate,
        due_date: clientDueDate,
        subtotal: parseFloat(clientSubtotal),
        total: parseFloat(clientTotal),
        status: clientStatus,
        net_profit: parseFloat(clientUtilityAmt),
        profit_pct: parseFloat(clientUtilityPct)
      },
      commissions: commissions.map(c => ({
        user_id: Number(c.userId),
        pct: parseFloat(c.pct),
        amount: parseFloat(c.amount)
      }))
    };
  
    console.log('customerInvoice payload:', payload.customerInvoice)

    try {
      const response = await fetch('/api/sales/createSale.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      // Si falla a nivel HTTP (500, 404, etc.)
      if (!response.ok) {
        const text = await response.text();
        console.error(`HTTP ${response.status}:`, text);
        alert('Error del servidor al crear la venta. Revisa la consola para más detalles.');
        return;
      }
  
      // Intentamos parsear JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        alert('La respuesta del servidor no es válida.');
        return;
      }
  
      // Ahora manejamos el caso de éxito o error de aplicación
      if (data.success) {
        onCreate();
      } else {
        alert(data.message || 'Error al crear venta');
      }
  
    } catch (networkErr) {
      console.error('Fetch error:', networkErr);
      alert('No se pudo conectar con el servidor.');
    }
  }, [
    saleDate, project, description,
    providerInvoices,
    clientInvoiceNumber, clientAccountId, clientRazonSelect, clientRazones, clientBusinessName,
    clientIssueDate, clientDueDate, clientSubtotal, clientTotal, clientStatus,
    clientUtilityAmt, clientUtilityPct,
    commissions, onCreate
  ]);

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <button type="button" className="btn-close-form" onClick={onCancel}>X</button>

    <h2 className="form-title">Nueva Venta</h2>

      <div className="nueva-venta">
      <h3 className="venta-title">Datos de la Venta</h3>
      {/* Datos Venta */}
      <div className="form-group">
        <label className="form-label">Fecha Venta</label>
        <input type="date" className="form-control"
          value={saleDate} onChange={e=>setSaleDate(e.target.value)} required/>
      </div>
      <div className="form-group">
        <label className="form-label">Proyecto</label>
        <input type="text" className="form-control"
          value={project} onChange={e=>setProject(e.target.value)}/>
      </div>
      <div className="form-group">
        <label className="form-label">Descripción</label>
        <textarea className="form-control"
          value={description} onChange={e=>setDescription(e.target.value)}/>
      </div>
      </div>


    <div className="invoices">
      <div className="provider-invoices"> 
        {/* Facturas Proveedor */}
        <h3 className="provider-title">Facturas de Proveedores</h3>
        {providerInvoices.map((inv, idx) => (
          <React.Fragment key={idx}>
            <div className="form-group">
            <label className="form-label">Proveedor</label>
            <select className="form-control"
              value={inv.accountId}
              onChange={e=>updProv(idx,'accountId',e.target.value)} required>
              <option value="">Selecciona…</option>
              {providerAccounts.map(a=>(
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Razón Social</label>
            <input type="text" className="form-control"
              value={inv.businessName} readOnly/>
          </div>
          <div className="form-group">
            <label className="form-label">N° Factura</label>
            <input type="text" className="form-control"
              value={inv.invoiceNumber}
              onChange={e=>updProv(idx,'invoiceNumber',e.target.value)} required/>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label className="form-label">Emisión</label>
              <input type="date" className="form-control"
                value={inv.issueDate}
                onChange={e=>updProv(idx,'issueDate',e.target.value)} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Días Crédito</label>
              <input type="number" className="form-control"
                value={inv.creditDays}
                onChange={e=>updProv(idx,'creditDays',Number(e.target.value))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Vencimiento</label>
              <input type="date" className="form-control"
                value={inv.dueDate}
                onChange={e=>updProv(idx,'dueDate',e.target.value)} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Subtotal</label>
            <input type="number" step="0.01" className="form-control"
              value={inv.subtotal}
              onChange={e=>updProv(idx,'subtotal',e.target.value)} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Total (×1.16)</label>
            <input type="text" className="form-control" value={((parseFloat(inv.subtotal) || 0) * 1.16).toFixed(2)} readOnly/>
          </div>
          <div className="form-group">
            <label className="form-label">Estatus</label>
            <select className="form-control"
              value={inv.status}
              onChange={e=>updProv(idx,'status',e.target.value)} required>
              {statusOpts.map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn-delete" onClick={()=>delProv(idx)}>
            Eliminar
          </button>
        </React.Fragment>
      ))}
      <div className="form-group-inline">  
        <label className="form-label">Agregar Proveedor</label>
        <button type="button" className="btn-add" onClick={addProv}>
          +
        </button>
      </div>
      </div>

      <div className="client-invoices">
      {/* Factura Cliente */}
      <h3 className="client-title">Factura Cliente</h3>
      <div className="form-group">
        <label className="form-label">N° Factura</label>
        <input type="text" className="form-control"
          value={clientInvoiceNumber}
          onChange={e=>setClientInvoiceNumber(e.target.value)} required/>
      </div>
      <div className="form-group">
        <label className="form-label">Cliente</label>
        <select className="form-control"
          value={clientAccountId}
          onChange={e=>setClientAccountId(e.target.value)} required>
          <option value="">Selecciona…</option>
          {clientAccounts.map(a=>(
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
  <label className="form-label">Razón Social</label>

  {clientRazones.length > 1 ? (
    <select
      className="form-control"
      value={clientRazonSelect}
      onChange={e => setClientRazonSelect(e.target.value)}
      required
    >
      {clientRazones.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  ) : (
    <input
      type="text"
      className="form-control"
      value={clientRazones[0] || ''}
      readOnly
    />
  )}
</div>

      <div className="form-group-inline">
        <div className="form-group">
          <label className="form-label">Emisión</label>
          <input type="date" className="form-control"
            value={clientIssueDate}
            onChange={e=>setClientIssueDate(e.target.value)} required/>
        </div>
        <div className="form-group">
          <label className="form-label">Días Crédito</label>
          <input type="number" className="form-control"
            value={clientCreditDays}
            onChange={e=>setClientCreditDays(Number(e.target.value))}/>
        </div>
        <div className="form-group">
          <label className="form-label">Vencimiento</label>
          <input type="date" className="form-control"
            value={clientDueDate}
            onChange={e=>setClientDueDate(e.target.value)} required/>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Subtotal</label>
        <input type="number" step="0.01" className="form-control"
          value={clientSubtotal}
          onChange={e=>setClientSubtotal(e.target.value)} required/>
      </div>
      <div className="form-group">
        <label className="form-label">Total (×1.16)</label>
        <input type="text" className="form-control" value={clientTotal} readOnly/>
      </div>
      <div className="form-group">
        <label className="form-label">Estatus</label>
        <select className="form-control"
          value={clientStatus}
          onChange={e=>setClientStatus(e.target.value)} required>
          {statusOpts.map(s=>(
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="form-group-inline">
        <div className="form-group">
          <label className="form-label">Utilidad %</label>
          <input type="number" step="0.01" className="form-control"
            value={clientUtilityPct}
            onChange={e=>setClientUtilityPct(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Utilidad $</label>
          <input type="text" className="form-control" value={clientUtilityAmt} readOnly/>
        </div>
      </div>
      </div>
      </div>

      <div className="commissions">
      {/* Comisiones */}
      <h3 className="commission-title">Comisiones</h3>
      {commissions.map((c, idx) => (
        <div key={idx} className="form-group-inline">
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <select className="form-control"
              value={c.userId}
              onChange={e=>updComm(idx,'userId',e.target.value)} required>
              <option value="">Selecciona…</option>
              {users.map(u=>(
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">% Comisión</label>
            <input type="number" step="0.01" className="form-control"
              value={c.pct}
              onChange={e=>updComm(idx,'pct',e.target.value)} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Monto comisión</label>
            <input type="text" className="form-control" value={c.amount} readOnly/>
          </div>
        </div>
      ))}
      <div className="form-group-inline">
        <label className="form-label">Agregar Comisión</label>
      <button type="button" className="btn-add" onClick={addComm}>+</button>
      </div>
      </div>

      {/* Acciones */}
      <div className="form-actions">
        <button type="submit" className="btn">Guardar Venta</button>
      </div>
    </form>
  )
}
