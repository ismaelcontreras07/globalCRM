// src/pages/DetalleFacturacion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/DetalleFacturacion.css';
import '../assets/css/EntityTable.css';
import BillingChart from '../components/BillingChart';

export default function DetalleFacturacion() {
  const nav = useNavigate();
  const [providers, setProviders]     = useState([]);
  const [clients, setClients]         = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [modal, setModal]             = useState(null); // detalle por estado
  const [detailModal, setDetailModal] = useState(null); // detalle mensual
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, monRes] = await Promise.all([
          fetch('/api/sales/detailSummary.php',  { credentials:'include' }).then(r => r.json()),
          fetch('/api/sales/monthlySummary.php', { credentials:'include' }).then(r => r.json()),
        ]);

        if (sumRes.success) {
          setProviders(sumRes.providers);
          setClients(sumRes.clients);
        }
        if (monRes.success) {
          if (monRes.success) {
            setMonthlyData(
              monRes.data.map(d => ({
                month: d.month,
                clients: Number(d.clients),
                providers: Number(d.providers),
                commissions: Number(d.commissions),
                profitAfterComm: Number(d.profit_after_comm)  // <— aquí
              }))
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openList = ({ role, account_id, business_name, status }) => {
    let url = `/api/sales/invoicesByStatus.php`
            + `?role=${role}`
            + `&account_id=${account_id}`
            + `&status=${status}`;
    if (role === 'client') {
      url += `&business_name=${encodeURIComponent(business_name)}`;
    }
    fetch(url, { credentials:'include' })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.message);
        setModal({ role, business_name, status, invoices: json.invoices });
      })
      .catch(err => {
        console.error(err);
        alert('Error al cargar facturas');
      });
  };

  const openMonthlyModal = (month, type) => {
    fetch(`/api/sales/monthlyInvoices.php?month=${month}&type=${type}`, { credentials:'include' })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.message);
        setDetailModal({ month, type, invoices: json.invoices });
      })
      .catch(err => {
        console.error(err);
        alert('Error al cargar facturas mensuales');
      });
  };

  if (loading) return <p>Cargando detalle…</p>;

  const renderTable = (data, roleLabel) => {
    const totPend = data.reduce((s,row)=>s+Number(row.pendiente),0);
    const totVenc = data.reduce((s,row)=>s+Number(row.vencido),0);
    const totPag  = data.reduce((s,row)=>s+Number(row.pagado),0);
    const totAll  = totPend + totVenc + totPag;

    return (
      <div className="table-container">
        <table className="entity-table">
          <thead>
            <tr>
              <th>Razón Social</th>
              <th>Pendiente</th>
              <th>Vencido</th>
              <th>Pagado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const rowTotal = Number(row.pendiente) + Number(row.vencido) + Number(row.pagado);
              return (
                <tr key={`${roleLabel}-${row.account_id}-${row.business_name}`}>
                  <td>{row.business_name}</td>
                  {['pendiente','vencido','pagado'].map(st=>(
                    <td key={st}>
                      <button
                        className="link-button"
                        onClick={() => openList({
                          role: roleLabel==='Proveedores'?'provider':'client',
                          account_id: row.account_id,
                          business_name: row.business_name,
                          status: st
                        })}
                      >
                        ${Number(row[st]).toLocaleString(undefined,{minimumFractionDigits:2})}
                      </button>
                    </td>
                  ))}
                  <td>${rowTotal.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total facturado</strong></td>
              <td>${totPend.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
              <td>${totVenc.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
              <td>${totPag.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
              <td>${totAll.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <main className="detalle-page">
      <div className="header-container">
        <h1 className="page-title">Detalle de Facturación</h1>
      </div>
      <div className="btn-container">
        <button className="btn back" onClick={()=>nav(-1)}>← Volver</button>
      </div>

      {/* Gráfico mensual */}
      <section className="chart-container">
        <h2 className="chart-title-chart">Facturado por Mes</h2>
        <div className="billing-chart">
          <BillingChart
            data={monthlyData}
            onBarClick={openMonthlyModal}
          />
        </div>
      </section>

      {/* Tablas */}
      <section className="tables-container">
        <div className="table-detail-container">
          <h2>Proveedores</h2>
          {renderTable(providers,'Proveedores')}
        </div>
        <div className="table-detail-container">
          <h2>Clientes</h2>
          {renderTable(clients,'Clientes')}
        </div>
      </section>

      {/* Modal por estado */}
      {modal && (
        <section className="modal-container">
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 className="modal-title">
              {modal.role==='provider'?'Proveedor':'Cliente'}: {modal.business_name}<br/>
              Estado: {modal.status}
            </h3>
            <div className="table-container">
              <table className="entity-table">
                <thead>
                  <tr><th>Factura</th><th>Emisión</th><th>Vence</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {modal.invoices.map(inv=>(
                    <tr key={inv.invoice_number}>
                      <td>{inv.invoice_number}</td>
                      <td>{inv.issue_date}</td>
                      <td>{inv.due_date}</td>
                      <td>${Number(inv.total).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn-close-form" onClick={()=>setModal(null)}>X</button>
          </div>
        </div>
        </section>
      )}

      {/* Modal mensual */}
      {detailModal && (
        <section className="modal-container">
        <div className="modal-overlay" onClick={()=>setDetailModal(null)}>
          
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 className="modal-title">
              {detailModal.type==='providers'?'Proveedores'
                :detailModal.type==='clients'?'Clientes'
                :'Comisiones'} — {detailModal.month}
            </h3>
            <div className="table-container">
              <table className="entity-table">
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Emisión</th>
                    <th>{detailModal.type==='commissions'?'Comisión':'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {detailModal.invoices.map(inv=>(
                    <tr key={inv.invoice_id || inv.invoice_number}>
                      <td>{inv.invoice_number ?? inv.invoice_id}</td>
                      <td>{inv.issue_date}</td>
                      <td>${Number(
                        detailModal.type==='commissions'
                          ? inv.commission
                          : inv.total
                      ).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn-close-form" onClick={()=>setDetailModal(null)}>X</button>
          </div>
        </div>
        </section>
      )}
    </main>
  );
}
