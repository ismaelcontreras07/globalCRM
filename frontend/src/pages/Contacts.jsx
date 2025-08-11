// src/pages/Contacts.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntityForm from '../components/EntityForm';
import TableContacts from '../components/TableContacts';  

export default function Contacts() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <main>
      <header>
        <div className="header-container">
        <h1 className='page-title'>Contactos</h1>
        </div>
      </header>

        <div className="btn-container"> 
        <button
                onClick={() => setShowForm(prev => !prev)}
                className="btn"
              >
                + Nuevo Contacto
              </button>
              </div>
      
              {showForm ? (
                <EntityForm
                  entity="contacts"
                  onCancel={() => setShowForm(false)}
                  requiredFields={[ // Add required field names here, e.g., 'first_name', 'email'
                    // 'first_name',
                    // 'email',
                    // Add more required fields as needed
                  ]}
                />
              ) : null}  

              <div className="table-contacts">
                <TableContacts />
              </div>
    </main>
  );
}

