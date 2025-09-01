// src/components/leads/LeadDetailsCard.jsx
import React, { useEffect, useState } from "react";

export default function LeadDetailsCard({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let abort = false;
    setLoading(true);
    fetch(`/api/leads/getLeads.php?id=${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (!abort) {
          if (!j.success) throw new Error(j.message || "Error al cargar lead");
          setData(j.data);
        }
      })
      .catch((e) => alert(e.message))
      .finally(() => !abort && setLoading(false));
    return () => { abort = true; };
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!data) return <div>No se encontró el lead.</div>;

  return (
    <div className="card">
      <h4 style={{ marginBottom: 8 }}>{data.first_name}</h4>
      <div className="grid-2">
        <div><strong>Empresa:</strong> {data.company || "-"}</div>
        <div><strong>Puesto:</strong> {data.position || "-"}</div>
        <div><strong>Email:</strong> {data.email}</div>
        <div><strong>Teléfono:</strong> {data.phone || "-"}</div>
        <div><strong>País:</strong> {data.country || "-"}</div>
        <div><strong>Estado:</strong> {data.status}</div>
        <div><strong>Creado:</strong> {new Date(data.created_at).toLocaleString()}</div>
        <div><strong>Actualizado:</strong> {new Date(data.updated_at).toLocaleString()}</div>
      </div>
    </div>
  );
}
