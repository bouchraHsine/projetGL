// src/CalendrierRendezVous.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
// ❌ SUPPRIMER cette ligne :
// import frLocale from "@fullcalendar/core/locales/fr";

function CalendrierRendezVous({ onDateSelect, refresh }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/appointments")
      .then((res) => {
        const formatted = (res.data || []).map((app) => {
          const patientName =
            app.patient && app.patient.name
              ? app.patient.name
              : "Patient inconnu";

          const medecinName =
            app.medecin && app.medecin.name
              ? app.medecin.name
              : "Médecin inconnu";

          return {
            id: app._id,
            title: `${patientName} avec Dr. ${medecinName}`,
            date: app.date,
          };
        });

        setEvents(formatted);
      })
      .catch((err) => {
        console.error("Erreur chargement RDV calendrier :", err);
      });
  }, [refresh]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      /** ✅ on met juste la locale en string */
      locale="fr"
      selectable={true}
      events={events}
      height="600px"
      dateClick={(info) => onDateSelect(info.date)}
    />
  );
}

export default CalendrierRendezVous;
