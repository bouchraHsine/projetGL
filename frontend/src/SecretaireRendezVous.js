// src/SecretaireRendezVous.js
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./SecretaireRendezVous.css";

// 🔹 Images de fond (mets-les dans src/assets)
import bg1 from "./assets/hero2.jpg";
import bg2 from "./assets/hero4.jpg";
import bg3 from "./assets/hero5.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// tableau des backgrounds pour le slideshow
const BACKGROUNDS = [bg1, bg2, bg3];

export default function SecretaireRendezVous() {
  const [patients, setPatients] = useState([]);
  const [events, setEvents] = useState([]);

  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState(""); // HH:MM
  const [selectedPatient, setSelectedPatient] = useState("");
  const [motif, setMotif] = useState("");

  const [bgIndex, setBgIndex] = useState(0); // index de l'image de fond

  const token = localStorage.getItem("authToken");

  /* ==========================
     SLIDESHOW BACKGROUND
  ========================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 3000); // ⏱️ change d'image toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  /* ==========================
     CHARGEMENT DES PATIENTS
  ========================== */
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setPatients(data);
        } else if (Array.isArray(data.patients)) {
          setPatients(data.patients);
        } else {
          console.warn("Réponse patients inattendue :", data);
          setPatients([]);
        }
      } catch (err) {
        console.error("Erreur chargement patients :", err);
        setPatients([]);
      }
    };

    fetchPatients();
  }, [token]);

  /* ==========================
     CHARGEMENT DES RENDEZ-VOUS
  ========================== */
  useEffect(() => {
    const fetchRdv = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/appointments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();

        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.appointments)) {
          list = data.appointments;
        } else {
          console.warn("Réponse RDV inattendue :", data);
          list = [];
        }

        // On formate pour FullCalendar
        const mapped = list.map((rdv) => {
          const d = new Date(rdv.date);
          const heures = d.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            id: rdv._id,
            title: `${rdv.patientName || "RDV"} • ${heures}`,
            start: rdv.date, // Date ISO fournie par le backend
          };
        });

        setEvents(mapped);
      } catch (err) {
        console.error("Erreur chargement RDV :", err);
        setEvents([]);
      }
    };

    fetchRdv();
  }, [token]);

  /* ==========================
     ENREGISTRER UN RDV
  ========================== */
  const submitRdv = async () => {
    if (!selectedPatient || !selectedDate || !selectedTime) {
      alert("Veuillez choisir un patient, une date et une heure.");
      return;
    }

    // Ex : "2025-12-01T10:30"
    const dateTimeIso = `${selectedDate}T${selectedTime}`;

    const body = {
      patientId: selectedPatient,
      date: dateTimeIso, // le backend stocke en type Date
      motif,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Réponse non OK :", res.status);
        alert("Erreur lors de l'enregistrement du rendez-vous");
        return;
      }

      const newRdv = await res.json();
      const d = new Date(newRdv.date);
      const heures = d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setEvents((prev) => [
        ...prev,
        {
          id: newRdv._id,
          title: `${newRdv.patientName || "RDV"} • ${heures}`,
          start: newRdv.date,
        },
      ]);

      alert("Rendez-vous enregistré !");
      setMotif("");
      // optionnel : reset complet du formulaire
      // setSelectedPatient("");
      // setSelectedTime("");
      // setSelectedDate("");
    } catch (error) {
      console.error("Erreur submit RDV :", error);
      alert("Erreur lors de l'enregistrement du rendez-vous");
    }
  };

  /* ==========================
     RENDU
  ========================== */
  return (
    <div className="rdv-page">
      {/* 🔥 Background dynamique */}
      <div
        className="rdv-background"
        style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
      />

      {/* Contenu principal */}
      <div className="rdv-container">
        {/* ========= CALENDRIER ========= */}
        <div className="rdv-calendar-card">
          <h2 className="rdv-title">Gestion des Rendez-vous</h2>

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            events={events}
            dateClick={(info) => {
              // quand on clique sur un jour, on pré-remplit la date du formulaire
              setSelectedDate(info.dateStr);
            }}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
          />
        </div>

        {/* ========= FORMULAIRE ========= */}
        <div className="rdv-form-card">
          <h3 className="rdv-form-title">Nouveau rendez-vous</h3>

          {/* Patient */}
          <label className="rdv-label">Patient</label>
          <select
            className="rdv-input"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="">— Sélectionner un patient —</option>
            {Array.isArray(patients) &&
              patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
          </select>

          {/* Date */}
          <label className="rdv-label">Date</label>
          <input
            type="date"
            className="rdv-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {/* Heure */}
          <label className="rdv-label">Heure</label>
          <input
            type="time"
            className="rdv-input"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />

          {/* Motif */}
          <label className="rdv-label">Motif (optionnel)</label>
          <textarea
            className="rdv-textarea"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : Consultation de contrôle, douleur thoracique, etc."
          />

          <button onClick={submitRdv} className="rdv-btn">
            + Enregistrer le rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
}
