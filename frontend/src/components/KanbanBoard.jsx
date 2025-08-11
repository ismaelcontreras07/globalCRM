// src/components/KanbanBoard.jsx
import React, { useState, useEffect } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd'

import '../assets/css/KanbanStyles.css'

const STATUS = [
  { key: 'no_iniciada', title: 'No iniciada' },
  { key: 'pendiente',   title: 'Pendiente'   },
  { key: 'aplazada',    title: 'Aplazada'    },
  { key: 'completada',  title: 'Completada'  }
]

export default function KanbanBoard({ onCardMove }) {
  const [lanes, setLanes]       = useState([])
  const [users, setUsers]       = useState([])
  const [leads, setLeads]       = useState([])
  const [contacts, setContacts] = useState([])

  // Carga inicial: actividades, usuarios, leads y contactos
  useEffect(() => {
    fetch('/api/activities/listActivities.php', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        const activities = json?.data ?? []
        setLanes(STATUS.map(s => ({
          ...s,
          items: activities.filter(a => a.status === s.key)
        })))
      })
      .catch(console.error)

    fetch('/api/users/listUsers.php', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setUsers(json.users || json.data || []))
      .catch(console.error)

    fetch('/api/leads/listLeads.php', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setLeads(json.leads || []))
      .catch(console.error)

    fetch('/api/contacts/listContacts.php', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setContacts(json.contacts || []))
      .catch(console.error)
  }, [])

  // Mapas de id → nombre (fallback si el backend no manda los nombres)
  const userMap    = Object.fromEntries(users.map(u => [u.id, u.name]))
  const leadMap    = Object.fromEntries(leads.map(l => [l.id, `${l.first_name} ${l.last_name}`]))
  const contactMap = Object.fromEntries(contacts.map(c => [c.id, `${c.first_name} ${c.last_name}`]))

  function onDragEnd(result) {
    const { source, destination, draggableId } = result
    if (!destination || source.droppableId === destination.droppableId) return

    // Actualiza backend
    fetch('/api/activities/updateActivities.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Number(draggableId),
        status: destination.droppableId
      })
    })
      .then(r => r.json())
      .then(res => {
        if (!res.success) throw new Error(res.message)

        // Actualiza localmente
        setLanes(prev => {
          const srcIdx   = prev.findIndex(l => l.key === source.droppableId)
          const dstIdx   = prev.findIndex(l => l.key === destination.droppableId)
          const srcItems = Array.from(prev[srcIdx].items)
          const [moved]  = srcItems.splice(source.index, 1)
          moved.status   = destination.droppableId
          const dstItems = Array.from(prev[dstIdx].items)
          dstItems.splice(destination.index, 0, moved)
          const next = [...prev]
          next[srcIdx] = { ...next[srcIdx], items: srcItems }
          next[dstIdx] = { ...next[dstIdx], items: dstItems }
          return next
        })

        onCardMove?.(draggableId, source.droppableId, destination.droppableId)
      })
      .catch(console.error)
  }

  const renderReferenceLine = (card) => {
    // Si es actividad interna, no hay referencia
    if (card.activity_type === 'interno') return null

    // Etiqueta de tipo
    const label =
      (card.activity_type === 'lead' || card.activity_type === 'leads')
        ? 'Lead:'
        : (card.activity_type === 'contacto' ? 'Contacto:' : 'Referencia:')

    // Nombre de referencia: preferimos lo que ya manda el backend
    const refName =
      card.reference_name ||
      ((card.activity_type === 'lead' || card.activity_type === 'leads')
        ? leadMap[card.reference_id]
        : contactMap[card.reference_id]) ||
      '—'

    return (
      <p className="kanban-card-activity">
        <strong>{label}</strong> {refName}
      </p>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-container">
        {lanes.map(lane => (
          <Droppable droppableId={lane.key} key={lane.key}>
            {(provided, snap) => (
              <div
                className={`kanban-column ${snap.isDraggingOver ? 'drag-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3 className="column-title">{lane.title}</h3>

                {lane.items.map((card, idx) => (
                  <Draggable
                    key={card.id}
                    draggableId={String(card.id)}
                    index={idx}
                  >
                    {(prov, snapCard) => (
                      <div
                        className={`kanban-card ${snapCard.isDragging ? 'dragging' : ''}`}
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                      >
                        <p className="kanban-card-description">{card.description}</p>

                        <p className="kanban-card-encargado">
                          <strong>Encargado:</strong> {card.assigned_name || userMap[card.assigned_to] || '—'}
                        </p>

                        {renderReferenceLine(card)}

                        <p className="kanban-card-date">
                          <strong>Fecha:</strong> {card.due_date}
                        </p>
                        <p className="kanban-card-status">
                          <strong>Estado:</strong> {card.status}
                        </p>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
