// src/pages/Catalog.jsx
import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [showForm, setShowForm]     = useState(false);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/products', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setProducts(json.products);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = (newProduct) => {
    setProducts([ newProduct, ...products ]);
    setShowForm(false);
  };

  if (loading) return <p>Cargando catálogo…</p>;

  return (
    <main>
      <header>
        <div className="header-container">
          <h1 className="page-title">Catálogo de Productos</h1>
        </div>
      </header>

      <div className="btn-container">
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="btn"
        >
          + Nuevo Producto
        </button>
      </div>

      {showForm && (
        <ProductForm
          onCreate={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="cards-container">
        {products.map(prod => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </main>
  );
}
