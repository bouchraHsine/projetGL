// src/CalendrierRendezVous.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";

function CalendrierRendezVous({ onDateSelect, refresh }) {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        console.warn("Pas de token => pas de chargement des RDV");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        const formatted = data
          // on enlève les rdv complètement foireux
          .filter((app) => app && app.date)
          .map((app) => {
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
      } catch (err) {
        console.error("Erreur chargement RDV pour le calendrier :", err);
      }
    };

    fetchAppointments();
  }, [token, refresh]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale={frLocale}
      selectable={true}
      events={events}
      height="600px"
      dateClick={(info) => onDateSelect && onDateSelect(info.date)}
    />
  );
}

export default CalendrierRendezVous;
