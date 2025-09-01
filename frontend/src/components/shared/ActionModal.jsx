// src/components/shared/ActionModal.jsx
import React from "react";

export default function ActionModal({ open, onClose, title, actions = [], children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>
        <section className="modal-body">{children}</section>
        {!!actions.length && (
          <footer className="modal-footer">
            {actions.map((a, i) => (
              <button
                key={i}
                className={`btn ${a.variant || "secondary"}`}
                onClick={a.onClick}
              >
                {a.label}
              </button>
            ))}
          </footer>
        )}
      </div>
    </div>
  );
}
