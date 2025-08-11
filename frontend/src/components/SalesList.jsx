// src/components/SalesList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import SaleCard       from './SaleCard'
import ComplementCard from './ComplementCard'
import '../assets/css/SalesList.css'

export default function SalesList({ onStatusChange, filters }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true);
    fetch('/api/sales/listSales.php', { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        if (!json.success) throw new Error(json.message || 'Error en listado');

        const combined = [
          ...json.sales.map(s => ({
            type: 'sale',
            data: s,
            num: parseInt(String(s?.customer_invoice?.invoice_number || '').replace(/\D/g, ''), 10) || 0
          })),
          ...json.complements.map(c => ({
            type: 'complement',
            data: c,
            num: parseInt(String(c?.invoice_number || '').replace(/\D/g, ''), 10) || 0
          }))
        ];

        // Orden descendente por num (el mayor arriba)
        combined.sort((a, b) => b.num - a.num);

        setItems(combined);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar los registros');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshKey]);

  const handleDeleted = useCallback(() => {
    // Si eliminas una venta, sí recargamos todo
    setRefreshKey(k => k + 1)
  }, [])

  // ===== Helpers de filtros =====
  const hasStatus = (item, status) => {
    if (item.type !== 'sale') return false;
    const ci = item.data?.customer_invoice;
    if ((ci?.status || '').toLowerCase() === status) return true;
    const provs = item.data?.provider_invoices || [];
    return provs.some(p => (p?.status || '').toLowerCase() === status);
  };

  const getItemDate = (item) => {
    // Fecha “principal” para filtros (ajústala si necesitas otra lógica)
    const d =
      item?.data?.customer_invoice?.issue_date ||
      item?.data?.issue_date ||
      item?.data?.invoice_date ||
      item?.data?.due_date ||
      item?.data?.created_at ||
      item?.data?.date;

    const dt = d ? new Date(d) : null;
    return isNaN(dt?.getTime?.()) ? null : dt;
  };

  // ===== Patch local cuando cambias estatus (sin refetch ni reorder) =====
  const handleStatusChange = useCallback((delta) => {
    // 1) Mantén la actualización del summary (SummaryBoxes)
    onStatusChange?.(delta);

    // 2) Parchea el item afectado en memoria
    const { sale_id, entity, invoice_id, newStatus } = delta || {};
    if (!sale_id || !entity) return;

    setItems(curr => curr.map(it => {
      if (it.type !== 'sale') return it;
      if (it.data.sale_id !== sale_id) return it;

      if (entity === 'customer') {
        return {
          ...it,
          data: {
            ...it.data,
            customer_invoice: {
              ...it.data.customer_invoice,
              status: newStatus
            }
          }
        };
      }
      if (entity === 'provider') {
        return {
          ...it,
          data: {
            ...it.data,
            provider_invoices: (it.data.provider_invoices || []).map(p =>
              p.id === invoice_id ? { ...p, status: newStatus } : p
            )
          }
        };
      }
      return it;
    }));
  }, [onStatusChange]);

  // ===== Aplica filtros =====
  const filtered = useMemo(() => {
    const { status = 'todos', fromDate = '', toDate = '' } = filters || {};

    const from = fromDate ? new Date(fromDate) : null;
    const to   = toDate   ? new Date(toDate)   : null;
    if (to) to.setHours(23,59,59,999); // incluir el día completo

    return items.filter((it) => {
      // Estatus: cuando se pide un estatus, solo mostramos ventas que tengan
      // AL MENOS una factura (cliente o proveedor) con ese estatus.
      if (status !== 'todos') {
        if (it.type !== 'sale') return false;     // oculta complementos con filtro de estatus
        if (!hasStatus(it, status)) return false;
      }

      // Rango de fechas (aplicado a la fecha “principal” del item)
      const dt = getItemDate(it);
      if (from && (!dt || dt < from)) return false;
      if (to   && (!dt || dt > to))   return false;

      return true;
    });
  }, [items, filters]);

  if (loading) return <p>Cargando registros…</p>
  if (error)   return <p className="error">{error}</p>

  return (
    <div className="sales-list-container">
      {filtered.length > 0
        ? filtered.map(item =>
            item.type === 'sale'
              ? (
                <SaleCard
                  key={`sale-${item.data.sale_id}`}
                  sale={item.data}
                  onStatusChange={handleStatusChange}  // <-- parche local + summary
                  onDeleted={handleDeleted}
                />
              ) : (
                <ComplementCard
                  key={`comp-${item.data.id}`}
                  complement={item.data}
                  onDeleted={handleDeleted}
                />
              )
          )
        : <p>No hay registros con esos filtros.</p>
      }
    </div>
  )
}
