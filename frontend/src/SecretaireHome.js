// src/SecretaireHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SecretaireHome.css";
import neohealthLogo from "./assets/neohealth-logo.jpg";

// 📊 Recharts pour le diagramme
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const SecretaireHome = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate("/secretaire/home");
  const goToPatients = () => navigate("/secretaire/patients");
const goToAgenda = () => navigate("/secretaire/rendezvous");
  const goToValidations = () => navigate("/secretaire/validations");
  const goToSalles = () => navigate("/secretaire/salles");
  const goToSettings = () => navigate("/secretaire/profil");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ---------- ÉTATS DYNAMIQUES ----------
  const [rdvToday, setRdvToday] = useState([]);
  const [nombrePatients, setNombrePatients] = useState(0);
  const [nombreRdvAujourdHui, setNombreRdvAujourdHui] = useState(0);
  const [rdvParMois, setRdvParMois] = useState([]); // [{mois:"Jan", rdv:10, patients:8}, ...]
  const [loading, setLoading] = useState(true);

  // ---------- CHARGEMENT DES DONNÉES ----------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/secretaire/dashboard`, {
          credentials: "include", // optionnel selon ton auth
        });
        const data = await response.json();

        setNombrePatients(data.nombrePatients || 0);
        setNombreRdvAujourdHui(data.nombreRdvAujourdHui || 0);
        setRdvToday(data.rdvToday || []);
        setRdvParMois(data.rdvParMois || []);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard secrétaire :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="sec-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="sec-sidebar">
        <div className="sec-logo" onClick={goToHome}>
          <img
            src={neohealthLogo}
            alt="NeoHealth logo"
            className="sec-logo-img"
          />
          <div className="sec-logo-texts">
            <span className="sec-logo-name">NeoHealth</span>
          </div>
        </div>

        <nav className="sec-nav">
          <div className="sec-nav-item" onClick={goToHome}>
            <span className="sec-nav-icon">🏠</span>
            <span className="sec-nav-label">dashboard</span>
          </div>

          <div className="sec-nav-item" onClick={goToPatients}>
            <span className="sec-nav-icon">👨‍⚕️</span>
            <span className="sec-nav-label">Gestions des patients</span>
          </div>

          <div className="sec-nav-item" onClick={goToAgenda}>
            <span className="sec-nav-icon">📝</span>
            <span className="sec-nav-label">Rendez-vous</span>
          </div>

          <div className="sec-nav-item" onClick={goToSalles}>
            <span className="sec-nav-icon">🏥</span>
            <span className="sec-nav-label">Gestions des salles </span>
          </div>

          <div className="sec-nav-item" onClick={goToSettings}>
            <span className="sec-nav-icon">⚙️</span>
            <span className="sec-nav-label">paramètres</span>
          </div>

          <div className="sec-nav-item sec-nav-logout" onClick={logout}>
            <span className="sec-nav-icon">🚪</span>
            <span className="sec-nav-label">déconnexion</span>
          </div>
        </nav>
      </aside>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <main className="sec-main">
        <h1 className="sec-main-title">Tableau de bord</h1>

        {/* Carte stats */}
        <section className="sec-stats">
          <div className="sec-stat-card">
            <div className="sec-stat-label">Patients du médecin</div>
            <div className="sec-stat-value">
              {loading ? "..." : nombrePatients}
            </div>
          </div>

          <div className="sec-stat-card">
            <div className="sec-stat-label">Rendez-vous aujourd&apos;hui</div>
            <div className="sec-stat-value">
              {loading ? "..." : nombreRdvAujourdHui}
            </div>
          </div>

          <div className="sec-stat-card">
            <div className="sec-stat-label">Mois actuel</div>
            <div className="sec-stat-value">
              {loading ? "..." : rdvParMois.reduce((sum, m) => sum + (m.rdv || 0), 0)}
            </div>
          </div>
        </section>

        {/* Diagramme RDV / Patients par mois */}
        <section className="sec-chart-section">
          <h2 className="sec-chart-title">
            Évolution des rendez-vous et des patients par mois
          </h2>
          <div className="sec-chart-wrapper">
            {rdvParMois.length === 0 ? (
              <p className="sec-chart-empty">Aucune donnée statistique pour le moment.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={rdvParMois}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rdv" name="Rendez-vous" />
                  <Bar dataKey="patients" name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Tableau des RDV d'aujourd'hui */}
        <div className="sec-table-container">
          <h2 className="sec-table-title">Rendez-vous d&apos;aujourd&apos;hui</h2>

          <table className="sec-table">
            <thead>
              <tr>
                <th>Heure</th>
                <th>Patient</th>
                <th>Motif</th>
                <th>Salle</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rdvToday.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                    Aucun rendez-vous prévu pour aujourd&apos;hui.
                  </td>
                </tr>
              )}

              {rdvToday.map((rdv) => (
                <tr key={rdv.id || rdv._id}>
                  <td>{rdv.heure}</td>
                  <td>{rdv.patient}</td>
                  <td>{rdv.motif}</td>
                  <td>{rdv.salle}</td>
                  <td>
                    <span
                      className={`sec-status-badge status-${(rdv.statut || "")
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {rdv.statut}
                    </span>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                    Chargement...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default SecretaireHome;
