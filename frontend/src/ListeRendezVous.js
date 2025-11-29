// src/ListeRendezVous.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RendezVous.css";

function ListeRendezVous({ refresh }) {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchRdv = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRdv(res.data || []);
      } catch (err) {
        console.error("Erreur chargement RDV :", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRdv();
    }
  }, [token, refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression du rendez-vous ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRdv((prev) => prev.filter((item) => item && item._id !== id));
    } catch (err) {
      console.error("Erreur suppression RDV :", err);
      alert("Erreur lors de la suppression du rendez-vous.");
    }
  };

  return (
    <div className="rdv-list">
      <h2>📝 Liste des rendez-vous</h2>

      {loading ? (
        <p>Chargement des rendez-vous...</p>
      ) : !rdv || rdv.length === 0 ? (
        <p>Aucun rendez-vous trouvé.</p>
      ) : (
        <table className="rdv-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Date & heure</th>
              <th>Durée</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rdv || []).filter(Boolean).map((item) => {
              const patientName =
                item.patient && item.patient.name
                  ? item.patient.name
                  : "Patient supprimé / inconnu";

              const medecinName =
                item.medecin && item.medecin.name
                  ? item.medecin.name
                  : "Médecin supprimé / inconnu";

              return (
                <tr key={item._id}>
                  <td>{patientName}</td>
                  <td>{medecinName}</td>
                  <td>
                    {item.date
                      ? new Date(item.date).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td>{item.duration ? `${item.duration} min` : "-"}</td>
                  <td>{item.notes || "-"}</td>
                  <td>
                    <button
                      className="btn-delete-rdv"
                      onClick={() => handleDelete(item._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListeRendezVous;
