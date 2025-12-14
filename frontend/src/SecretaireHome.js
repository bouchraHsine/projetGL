// src/SecretaireHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SecretaireHome.css";
import neohealthLogo from "./assets/neohealth-logo.jpg";

// 📊 Recharts
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
import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarCheck,
  LuBuilding2,
  LuBadgeCheck,
  LuSettings,
  LuLogOut
} from "react-icons/lu";

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

  const [rdvToday, setRdvToday] = useState([]);
  const [nombrePatients, setNombrePatients] = useState(0);
  const [nombreRdvAujourdHui, setNombreRdvAujourdHui] = useState(0);
  const [rdvParMois, setRdvParMois] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/secretaire/dashboard`, {
          credentials: "include",
        });
        const data = await response.json();

        setNombrePatients(data.nombrePatients || 0);
        setNombreRdvAujourdHui(data.nombreRdvAujourdHui || 0);
        setRdvToday(data.rdvToday || []);
        setRdvParMois(data.rdvParMois || []);
      } catch (error) {
        console.error("Erreur dashboard secrétaire :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Total RDV du mois (selon tes data rdvParMois)
  const totalRdvMois = rdvParMois.reduce((sum, m) => sum + (m.rdv || 0), 0);

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
            <span className="sec-logo-sub">Medical Suite</span>
          </div>
        </div>

        <nav className="sec-nav">
  <div className="sec-nav-item" onClick={goToHome}>
    <LuLayoutDashboard className="sec-nav-icon" />
    <span className="sec-nav-label">Tableau de Bord</span>
  </div>

  <div className="sec-nav-item" onClick={goToPatients}>
    <LuUsers className="sec-nav-icon" />
    <span className="sec-nav-label">Gestion Patients</span>
  </div>

  <div className="sec-nav-item" onClick={goToAgenda}>
<LuBadgeCheck className="sec-nav-icon" />
    <span className="sec-nav-label">Rendez-vous</span>
  </div>

  <div className="sec-nav-item" onClick={goToSalles}>
    <LuBuilding2 className="sec-nav-icon" />
    <span className="sec-nav-label">Salles & Blocs</span>
  </div>

  <div className="sec-nav-item" onClick={goToValidations}>
<LuBadgeCheck className="sec-nav-icon" />
    <span className="sec-nav-label">Validations</span>
  </div>

  <div className="sec-nav-item" onClick={goToSettings}>
    <LuSettings className="sec-nav-icon" />
    <span className="sec-nav-label">Paramètres</span>
  </div>

  <div className="sec-nav-item sec-nav-logout" onClick={logout}>
    <LuLogOut className="sec-nav-icon" />
    <span className="sec-nav-label">Déconnexion</span>
  </div>
</nav>

      </aside>

      {/* ===== MAIN ===== */}
      <main className="sec-main">
        {/* Header */}
        <header className="sec-header">
          <div>
            <h1 className="sec-main-title">Tableau de Bord Médical</h1>
            <p className="sec-main-subtitle">
              NeoHealth – Vue d’ensemble en temps réel
            </p>
          </div>

          <div className="sec-header-right">
            <div className="sec-date-pill">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="sec-online">
              <span className="sec-online-dot" />
              <span>Système en ligne</span>
            </div>
          </div>
        </header>

        {/* KPI cards (3 cartes seulement) */}
        <section className="sec-kpis sec-kpis-3">
          {/* 1) Patients */}
          <div className="sec-kpi-card">
            <div className="sec-kpi-top">
              {/* icone carrée arrondie comme sur la capture */}
              <div className="sec-kpi-icon icon-blue">
                {/* silhouette utilisateurs */}
                <span className="sec-ico">👤</span>
              </div>
              <div className="sec-kpi-pill pill-green">+12.5%</div>
            </div>

            <div className="sec-kpi-value">
              {loading ? "..." : nombrePatients}
            </div>
            <div className="sec-kpi-label">PATIENTS</div>
            <div className="sec-kpi-sub">Mise à jour temps réel</div>
          </div>

          {/* 2) RDV aujourd'hui */}
          <div className="sec-kpi-card">
            <div className="sec-kpi-top">
              <div className="sec-kpi-icon icon-orange">
                {/* calendrier */}
                <span className="sec-ico">📅</span>
              </div>
              <div className="sec-kpi-pill pill-green">+8.2%</div>
            </div>

            <div className="sec-kpi-value">
              {loading ? "..." : nombreRdvAujourdHui}
            </div>
            <div className="sec-kpi-label">RENDEZ-VOUS AUJOURD’HUI</div>
            <div className="sec-kpi-sub">Prochain RDV: 08:30</div>
          </div>

          {/* 3) Total du mois (comme ta 3e carte avant) */}
          <div className="sec-kpi-card">
            <div className="sec-kpi-top">
              <div className="sec-kpi-icon icon-purple">
                {/* graphique */}
                <span className="sec-ico">📈</span>
              </div>
              <div className="sec-kpi-pill pill-gray">Mois</div>
            </div>

            <div className="sec-kpi-value">{loading ? "..." : totalRdvMois}</div>
            <div className="sec-kpi-label">TOTAL RENDEZ-VOUS (MOIS)</div>
            <div className="sec-kpi-sub">Somme des rendez-vous mensuels</div>
          </div>
        </section>

        {/* Zone charts */}
        <section className="sec-grid">
          {/* Gauche: graphique principal */}
          <div className="sec-card">
            <div className="sec-card-head">
              <h2 className="sec-card-title">Admissions / Activité Patients</h2>

              <div className="sec-tabs">
                <button className="sec-tab active" type="button">
                  Mensuel
                </button>
                <button className="sec-tab" type="button">
                  Trimestriel
                </button>
                <button className="sec-tab" type="button">
                  Annuel
                </button>
              </div>
            </div>

            <div className="sec-card-body">
              {rdvParMois.length === 0 ? (
                <p className="sec-chart-empty">
                  Aucune donnée statistique pour le moment.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
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
          </div>

          {/* Droite: carte activité hebdo (UI seulement) */}
          <div className="sec-card">
            <div className="sec-card-head sec-card-head-split">
              <h2 className="sec-card-title">Activité Hebdomadaire</h2>
              <span className="sec-muted">Semaine en cours</span>
            </div>

            <div className="sec-card-body">
              <div className="sec-mini-grid">
                <div className="sec-mini-card">
                  <div className="sec-mini-title">Rendez-vous par jour</div>
                  <div className="sec-mini-placeholder" />
                </div>

                <div className="sec-mini-card">
                  <div className="sec-mini-title">Répartition</div>
                  <div className="sec-mini-placeholder circle" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Table RDV aujourd’hui */}
        <div className="sec-card">
          <div className="sec-card-head">
            <h2 className="sec-card-title">Rendez-vous d&apos;aujourd&apos;hui</h2>
          </div>

          <div className="sec-card-body">
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
        </div>
      </main>
    </div>
  );
};

export default SecretaireHome;
