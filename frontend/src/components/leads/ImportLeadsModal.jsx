// src/components/ImportLeadsModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import '../../assets/css/ImportLeadsModal.css';

// 1) Columnas visibles (las del <th>) → campo de DBs
const VISIBLE_TO_DB = [
  { label: 'Nombre Completo', db: 'first_name' },
  { label: 'Empresa',         db: 'company' },
  { label: 'Puesto',          db: 'position' },
  { label: 'Email',           db: 'email' },
  { label: 'Teléfono',        db: 'phone' },
  { label: 'Estado',          db: 'status' },
  { label: 'Creado',          db: 'created_at' },
];

// 2) Sinónimos por campo de DB (para autodetectección)
const FIELD_SYNONYMS = {
  first_name: ['nombre', 'nombre completo', 'first_name', 'nombrecompleto', 'nombre y apellidos', 'contacto', 'cliente'],
  company:    ['empresa', 'compañia', 'compania', 'company', 'organizacion', 'organización', 'negocio'],
  position:   ['puesto', 'cargo', 'position', 'rol'],
  email:      ['email', 'correo', 'correo electronico', 'e-mail', 'mail'],
  phone:      ['telefono', 'teléfono', 'tel', 'phone', 'movil', 'móvil', 'mobile', 'cel', 'celular', 'whatsapp'],
  status:     ['estado', 'estatus', 'status'],
  created_at: ['creado', 'fecha', 'fecha de creacion', 'fecha creación', 'created', 'created_at', 'fecha_creado', 'creado el'],
};

// 3) Tipos SQL disponibles para creación de columna
const SQL_TYPES = [
  { value: 'VARCHAR(255)', label: 'Texto (VARCHAR 255)' },
  { value: 'TEXT',         label: 'Texto largo (TEXT)' },
  { value: 'DATE',         label: 'Fecha (DATE)' },
  { value: 'DATETIME',     label: 'Fecha/Hora (DATETIME)' },
  { value: 'INT',          label: 'Entero (INT)' },
  { value: 'DECIMAL(10,2)',label: 'Decimal (10,2)' }
];

// Normaliza texto: minúsculas, sin acentos, sin signos
const normalize = (s='') =>
  s.toString()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .toLowerCase()
   .replace(/[^\w]+/g, ' ')
   .trim();

export default function ImportLeadsModal({ onClose, onImported }) {
  const [workbook, setWorkbook]   = useState(null);
  const [sheetName, setSheetName] = useState('');
  const [rows, setRows]           = useState([]);
  const [headers, setHeaders]     = useState([]);

  // columnas visibles disponibles para elegir (mostrar label, enviar db)
  const visibleColumns = VISIBLE_TO_DB;
  const [mapping, setMapping]     = useState({});
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  // Autodetección inteligente usando visibles + sinónimos
  const autoDetectDbField = (xlsxHeader) => {
    const h = normalize(xlsxHeader);

    // 1) Match directo con labels visibles
    for (const { label, db } of visibleColumns) {
      if (normalize(label) === h) return db;
    }

    // 2) Match por sinónimos
    for (const [db, syns] of Object.entries(FIELD_SYNONYMS)) {
      if (syns.some(s => normalize(s) === h)) return db;
    }

    // 3) Heurística por iguales (ej. "first_name")
    for (const { db } of visibleColumns) {
      if (normalize(db) === h) return db;
    }

    // 4) Sin match → crear columna
    return '';
  };

  const handleFile = async (file) => {
    setError('');
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      setWorkbook(wb);
      const firstSheet = wb.SheetNames[0];
      setSheetName(firstSheet);
      const sheet = wb.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      setRows(json);
      const hdrs = Object.keys(json[0] || {});
      setHeaders(hdrs);

      const auto = {};
      hdrs.forEach(h => {
        const detected = autoDetectDbField(h);
        auto[h] = detected
          ? { mode: 'existing', dbField: detected, createName: '', createType: 'VARCHAR(255)' }
          : { mode: 'create',   dbField: '',       createName: normalize(h).replace(/\s+/g, '_'), createType: 'VARCHAR(255)' };
      });
      setMapping(auto);
    } catch (e) {
      console.error(e);
      setError('No se pudo leer el archivo. Verifica que sea un XLSX válido.');
    }
  };

  const handleSheetChange = (name) => {
    setSheetName(name);
    const sheet = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    setRows(json);
    const hdrs = Object.keys(json[0] || {});
    setHeaders(hdrs);
  };

  const patch = (h, p) => setMapping(prev => ({ ...prev, [h]: { ...prev[h], ...p }}));

  const submitImport = async (e) => {
    e.preventDefault();
    if (!rows.length) { setError('No hay filas para importar.'); return; }
    setError(''); setLoading(true);

    try {
      // Construir columnsMap para el backend usando SOLO columnas visibles
      const columnsMap = headers.map(h => {
        const m = mapping[h] || {};
        const useExisting = m.mode === 'existing' && m.dbField;
        return {
          sourceHeader: h,
          dbField: useExisting ? m.dbField : '',
          createIfMissing: m.mode === 'create',
          createType: m.createType || 'VARCHAR(255)',
          newName: m.mode === 'create' ? (m.createName || '') : ''
        };
      });

      const res = await fetch('/api/leads/importLeads.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnsMap, rows })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error al importar');

      onImported?.(data);
      onClose?.();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitImport} className="entity-form">
      {onClose && (
        <button type="button" onClick={onClose} className="btn-close-form">X</button>
      )}

      <h3 className="form-title">Importar Leads (.xlsx)</h3>

      <div className="form-group">
        <label htmlFor="file" className="form-label">Subir archivo XLSX</label>
        <input
          id="file"
          type="file"
          accept=".xlsx"
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
        />
      </div>

      {workbook && (
        <div className="form-group">
          <label htmlFor="sheet" className="form-label">Hoja</label>
          <select
            className="form-control"
            id="sheet"
            value={sheetName}
            onChange={e => handleSheetChange(e.target.value)}
          >
            {workbook.SheetNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      {!!headers.length && (
        <>
          <h4 className="import-identificadas">Columnas identificadas</h4>
          <ul className="form-list">
            {headers.map(h => (<li key={h} style={{ opacity: 0.9 }}>{h}</li>))}
          </ul>

          <h4 className="import-asignacion">Asignación</h4>
          <p className="form-help">
            El sistema intentó mapear automáticamente usando tus encabezados visibles. Revisa y ajusta:
          </p>

          {headers.map(h => {
            const m = mapping[h] || {};
            const useExisting = m.mode === 'existing';

            return (
              <div key={h} className="import-form-group">
                <label className="form-label">{h}</label>

                <div className="import-form-radio">
                  {/* Opción A: usar columna EXISTENTE (basada en tus <th>) */}
                  <div>
                    <label className="import-form-label">
                      <input
                        type="radio"
                        name={`mode-${h}`}
                        checked={useExisting}
                        onChange={() => patch(h, { mode: 'existing' })}
                        style={{ marginRight: 6 }}
                      />
                      Usar columna existente
                    </label>
                    <select
                      className="form-control"
                      disabled={!useExisting}
                      value={m.dbField || ''}
                      onChange={e => patch(h, { dbField: e.target.value })}
                      style={{ width: '100%' }} 
                    >
                      <option value="" disabled>- Selecciona columna -</option>
                      {visibleColumns.map(c => (
                        <option key={c.db} value={c.db}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Opción B: CREAR columna nueva */}
                  <div>
                    <label className='import-form-label'>
                      <input
                        type="radio"
                        name={`mode-${h}`}
                        checked={!useExisting}
                        onChange={() => patch(h, { mode: 'create' })}
                        style={{ marginRight: 6 }}
                      />
                      Crear columna nueva
                    </label>
                    <div className="import-form-radio">
                      <input
                        type="text"
                        placeholder="Título de la columna"
                        className="form-control"
                        value={m.createName || ''}
                        onChange={e => patch(h, { createName: e.target.value })}
                        disabled={useExisting}
                        style={{ flex: 1 }}
                      />
                      <select
                        className="form-control"
                        value={m.createType || 'VARCHAR(255)'}
                        onChange={e => patch(h, { createType: e.target.value })}
                        disabled={useExisting}
                      >
                        {SQL_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <h4 className="import-preview-title">Previsualización (primeras 5 filas)</h4>
          <div className="import-preview">
            <table className="entity-table">
              <thead>
                <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.map((r, idx) => (
                  <tr key={idx}>
                    {headers.map(h => <td key={h}>{String(r[h] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}

      <button type="submit" disabled={loading || !rows.length} className="btn">
        {loading ? 'Importando…' : 'Importar'}
      </button>
    </form>
  );
}
