// src/pages/Leads.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TableLeads from '../components/TableLeads';
import EntityForm from '../components/EntityForm';

export default function Leads() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <main>
        <header>
          <div className="header-container">
            <h1 className='page-title'>Leads</h1>
          </div>
        </header>

        <div className="btn-container">
        <button
          onClick={() => setShowForm(true)}
          className="btn"
        >
          + Nuevo Lead
        </button>
        </div>

        {showForm ? (
          <EntityForm
            entity="leads"
            onCancel={() => setShowForm(false)}
            requiredFields={[ // Add required field names here, e.g., 'first_name', 'email'
              // 'first_name',
              // 'email',
              // Add more required fields as needed
            ]}
          />
        ) : null}

        <div className="table-leads">
        <TableLeads />  
        </div>
    </main>
  );
}
