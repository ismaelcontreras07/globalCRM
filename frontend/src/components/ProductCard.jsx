// src/components/ProductCard.jsx
import React from 'react';
import '../assets/css/ProductCard.css'; // crea este archivo para estilos específicos si lo deseas

export default function ProductCard({ product, onEdit, onDelete }) {
  const renderDetails = () => {
    switch (product.category) {
      case 'ups':
        return (
          <ul>
            <li><strong>Tipo:</strong> {product.type}</li>
            <li><strong>Potencia:</strong> {product.watts} W / {product.va} VA</li>
            <li><strong>Factor de Potencia:</strong> {product.power_factor}</li>
            <li><strong>VAC:</strong> {product.vac}</li>
            <li><strong>Baterías:</strong> {product.batteries}</li>
            <li><strong>Montaje:</strong> {product.mounting}</li>
          </ul>
        );
      case 'suppressor':
        return (
          <ul>
            <li><strong>VATios:</strong> {product.watts} W</li>
            <li><strong>VAC:</strong> {product.vac}</li>
            <li><strong>Outlets:</strong> {product.outlets}</li>
            <li><strong>Absorción:</strong> {product.absorption}</li>
          </ul>
        );
      case 'battery':
        return (
          <ul>
            <li><strong>Tecnología:</strong> {product.technology}</li>
            <li><strong>Ah:</strong> {product.ah}</li>
            <li><strong>VDC:</strong> {product.vdc}</li>
          </ul>
        );
      case 'accessory':
        return (
          <ul>
            <li><strong>Tipo:</strong> {product.type}</li>
            <li><strong>Compatibilidad:</strong> {product.family_compatibility}</li>
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{product.model}</h3>
        <span className="card-category">{product.category.toUpperCase()}</span>
      </div>
      <div className="card-body">
        <p><strong>Proveedor:</strong> {product.provider_name}</p>
        {product.description && <p className="card-description">{product.description}</p>}
        <p><strong>Costo:</strong> ${Number(product.provider_cost).toLocaleString(undefined, { minimumFractionDigits:2 })}</p>
        {renderDetails()}
      </div>
      <div className="card-footer">
        {onEdit && (
          <button className="btn" onClick={() => onEdit(product)}>
            Editar
          </button>
        )}
        {onDelete && (
          <button className="btn btn-danger" onClick={() => onDelete(product.id)}>
            Eliminar
          </button>
        )}
        {product.datasheet_url && (
          <a
            href={product.datasheet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Ver Datasheet
          </a>
        )}
      </div>
    </div>
  );
}
