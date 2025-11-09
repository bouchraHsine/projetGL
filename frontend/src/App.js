import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DossierPatient from "./DossierPatient";
import Home from "./Home";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import Dashboard from "./Dashboard";
import HomePage from "./HomePage";
import "./App.css";

function AppContent() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Routes>
        {/* 🌟 Page d'accueil générale (NeoHealth landing page) */}
        <Route path="/" element={<HomePage />} />

        {/* 🔐 Pages publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🏥 Pages internes */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients/:patientId/dossier" element={<DossierPatient />} />

        {/* 👩‍⚕️ Futures fonctionnalités */}
        <Route
          path="/personnel"
          element={<h2 className="text-xl font-semibold text-blue-700 p-6">
            👩‍⚕️ Gestion du Personnel (à venir)
          </h2>}
        />
        <Route
          path="/docteurs"
          element={<h2 className="text-xl font-semibold text-blue-700 p-6">
            🩺 Gestion des Docteurs (à venir)
          </h2>}
        />
        <Route
          path="/rendezvous"
          element={<h2 className="text-xl font-semibold text-blue-700 p-6">
            📅 Gestion des Rendez-vous (à venir)
          </h2>}
        />
        <Route
          path="/salles"
          element={<h2 className="text-xl font-semibold text-blue-700 p-6">
            🏥 Gestion des Salles et Blocs (à venir)
          </h2>}
        />
      </Routes>
    </div>
  );
}

export default AppContent;
