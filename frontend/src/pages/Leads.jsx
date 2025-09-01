// src/pages/Leads.jsx
import React, { useState, useCallback } from "react";
import EntityForm from "../components/EntityForm";
import TableLeads from "../components/TableLeads";
import ActionModal from "../components/shared/ActionModal";
import LeadDetailsCard from "../components/leads/LeadDetailsCard";
import ImportLeadsModal from "../components/leads/ImportLeadsModal";

export default function Leads() {
  // UI principal
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Tabla
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal de acciones
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("actions"); // "actions" | "details"
  const [selectedId, setSelectedId] = useState(null);

  // Recibe (lead, checked) desde TableLeads
  const handleCheckbox = useCallback((lead, checked) => {
    if (checked) {
      setSelectedId(lead.id);
      setView("actions");
      setOpen(true);
    } else {
      // si se desmarca, cerramos el modal y limpiamos selección
      setOpen(false);
      setSelectedId(null);
      setView("actions");
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
    setView("actions");
  };

  const handleSeeMore = () => setView("details");

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch("/api/leads/deleteLeads.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error al eliminar");

      // cerrar y refrescar tabla
      handleClose();
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <main>
      <header>
        <div className="header-container">
          <h1 className="page-title">Leads</h1>
        </div>
      </header>

      <div className="btn-container">
        <button onClick={() => setShowForm((p) => !p)} className="btn">
          + Nuevo Lead
        </button>

        <button onClick={() => setShowImport(true)} className="btn">
          Importar XLSX
        </button>
      </div>

      {showForm ? (
        <EntityForm
          entity="leads"
          onCancel={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setRefreshKey((k) => k + 1);
          }}
          requiredFields={[
            // 'first_name',
            // 'email',
          ]}
        />
      ) : null}

      <div className="table-leads">
        <TableLeads
          refreshKey={refreshKey}
          onCheckboxClick={handleCheckbox} // ← ahora recibe (lead, checked)
        />
      </div>

      {showImport && (
        <ImportLeadsModal
          open={showImport}
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      <ActionModal
        open={open}
        onClose={handleClose}
        title={view === "actions" ? "Opciones de Lead" : "Detalle del Lead"}
        actions={
          view === "actions"
            ? [
                { label: "Ver más", variant: "primary", onClick: handleSeeMore },
                { label: "Eliminar", variant: "danger", onClick: handleDelete },
              ]
            : []
        }
      >
        {view === "actions" ? (
          <p>Elige una acción para el lead seleccionado.</p>
        ) : (
          <LeadDetailsCard id={selectedId} />
        )}
      </ActionModal>
    </main>
  );
}
