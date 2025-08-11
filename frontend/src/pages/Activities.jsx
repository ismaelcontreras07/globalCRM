// src/pages/Activities.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ActivitiesForm from '../components/ActivitiesForm'
import KanbanBoard from '../components/KanbanBoard'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import '../assets/css/Calendar.css'

import '../assets/css/Activities.css'

  /**
   * Pantalla principal de actividades.
   *
   * Renderiza un formulario para crear actividades, un tablero Kanban para
   * visualizar las actividades y un calendario para mostrar las actividades con
   * fecha límite.
   *
   * @returns {React.ReactElement} Elemento JSX de la pantalla de actividades.
   */
export default function Activities() {
  const navigate = useNavigate()

  // Control del formulario
  const [showForm, setShowForm]       = useState(false)
  // Llave para refrescar Kanban y calendario
  const [refreshKey, setRefreshKey]   = useState(0)
  // Estado de actividades para el calendario
  const [activities, setActivities]   = useState([])

  // Se dispara tras crear o mover una actividad
  const handleCreate = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Carga inicial y recarga cuando cambie refreshKey
  useEffect(() => {
    fetch('/api/activities/listActivities.php', { credentials: 'include' })
      .then(res => res.json())
      .then(json => setActivities(json.data || []))
      .catch(console.error)
  }, [refreshKey])

  // Mapea a eventos de FullCalendar
  const events = activities.map(a => ({
    id:      a.id,
    title:   a.description,
    start:   a.all_day === 1 ? a.due_date : `${a.due_date}T${a.due_time}`,
    allDay:  a.all_day === 1
  }))

  return (
    <main>
      <header>
        <div className="header-container">
          <h1 className="page-title">Actividades</h1>
        </div>
      </header>

      <div className="btn-container">
        <button onClick={() => setShowForm(true)} className="btn">
          + Nueva Actividad
        </button>
      </div>

      {showForm && (
        <ActivitiesForm
          onCancel={() => setShowForm(false)}
          onCreate={() => {
            setShowForm(false)
            handleCreate()
          }}
        />
      )}

      <section className="kanban-wrapper">
        <KanbanBoard
          key={refreshKey}
          onCardMove={() => handleCreate()}
        />
      </section>

      <section className="calendar-wrapper">
        <div className="calendar-container">
        <FullCalendar
          plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left:  'prev,next today',
            center:'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          height="auto"
          className="calendar"

        />
        </div>
      </section>
    </main>
  )
}
