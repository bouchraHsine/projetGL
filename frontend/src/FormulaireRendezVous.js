// src/FormulaireRendezVous.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiClock,
  FiCalendar,
  FiFileText,
  FiPlus,
} from "react-icons/fi";
import "./RV.css";

function FormulaireRendezVous({ selectedDate, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [patient, setPatient] = useState("");
  const [medecin, setMedecin] = useState("");
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pRes, mRes] = await Promise.all([
          axios.get("http://localhost:5000/api/patients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/auth/users?role=medecin", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPatients(pRes.data || []);
        setMedecins(mRes.data || []);
      } catch (err) {
        console.error("Erreur chargement données RDV:", err.response?.data || err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadData();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError("Veuillez d'abord sélectionner une date sur le calendrier.");
      return;
    }
    if (!heure) {
      setError("Veuillez choisir une heure.");
      return;
    }
    if (!patient || !medecin) {
      setError("Veuillez choisir un patient et un médecin.");
      return;
    }

    const finalDate = new Date(selectedDate);
    const [h, m] = heure.split(":");
    finalDate.setHours(h, m, 0, 0);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/appointments",
        {
          patient,
          medecin,
          date: finalDate,
          motif,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("RDV créé:", res.data);

      setHeure("");
      setMotif("");
      setPatient("");
      setMedecin("");

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Erreur création RDV:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rdv-form">
      <form onSubmit={handleSubmit} className="modern-form">
        {error && (
          <div className="form-error">
            <FiUser className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="form-grid">
          {/* PATIENT */}
          <div className="form-group">
            <label className="form-label">
              <FiUser className="label-icon" />
              Patient
            </label>
            <select
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              required
              className="form-select"
              disabled={loading}
            >
              <option value="">Sélectionner un patient</option>
              {(patients || [])
                .filter((p) => p && p._id && p.name)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.dossier ? `(Dossier #${p.dossier})` : ""}
                  </option>
                ))}
            </select>
          </div>

          {/* MÉDECIN */}
          <div className="form-group">
            <label className="form-label">
              <FiUser className="label-icon" />
              Médecin
            </label>
            <select
              value={medecin}
              onChange={(e) => setMedecin(e.target.value)}
              required
              className="form-select"
              disabled={loading}
            >
              <option value="">Sélectionner un médecin</option>
              {(medecins || [])
                .filter((m) => m && m._id && m.name)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m.specialty ? `- ${m.specialty}` : ""}
                  </option>
                ))}
            </select>
          </div>

          {/* DATE */}
          <div className="form-group">
            <label className="form-label">
              <FiCalendar className="label-icon" />
              Date sélectionnée
            </label>
            <div className="date-display">
              {selectedDate
                ? selectedDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Aucune date sélectionnée"}
            </div>
          </div>

          {/* HEURE */}
          <div className="form-group">
            <label className="form-label">
              <FiClock className="label-icon" />
              Heure
            </label>
            <input
              type="time"
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              required
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        {/* MOTIF */}
        <div className="form-group full-width">
          <label className="form-label">
            <FiFileText className="label-icon" />
            Motif (optionnel)
          </label>
          <textarea
            rows={3}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : Consultation de contrôle, douleur thoracique, etc."
            className="form-textarea"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`submit-btn ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          <FiPlus className="btn-icon" />
          {loading ? "Création en cours..." : "Enregistrer le rendez-vous"}
        </button>
      </form>
    </div>
  );
}

export default FormulaireRendezVous;
