// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import Dashboard from "./Dashboard";
import Home from "./Home"; // Gestion des patients (admin)
import RendezVousPage from "./RendezVousPage";
import DossierPatient from "./DossierPatient";
import StaffPage from "./staff/StaffPage";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

import DoctorsList from "./doctors/DoctorsList";
import DoctorDetail from "./doctors/DoctorDetail";
import AddDoctor from "./doctors/AddDoctor";
import EditDoctor from "./doctors/EditDoctor";
import SallesBlocs from "./SallesBlocs";

/* ============================
   Composants pour chaque rôle
   ============================ */

const PatientHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Patient</h1>
    <p>Bienvenue sur votre espace patient. (Interface en cours de développement)</p>
  </div>
);

const MedecinHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Médecin</h1>
    <p>Tableau de bord médecin. (Fonctionnalités à ajouter plus tard)</p>
  </div>
);

const SecretaireHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Secrétaire</h1>
    <p>Gestion des rendez-vous et des patients. (Interface à compléter)</p>
  </div>
);

/* ============================
   Routes principales
   ============================ */

function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ADMIN */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Home /> {/* gestion patients avec sidebar */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:patientId/dossier"
          element={
            <ProtectedRoute roles={["admin", "medecin"]}>
              <DossierPatient />
            </ProtectedRoute>
          }
        />

        {/* RDV : admin + medecin + secretaire */}
        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <RendezVousPage />
            </ProtectedRoute>
          }
        />

        {/* ESPACES PAR RÔLE */}
        <Route
          path="/patient/home"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PatientHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medecin/home"
          element={
            <ProtectedRoute roles={["medecin"]}>
              <MedecinHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretaire/home"
          element={
            <ProtectedRoute roles={["secretaire"]}>
              <SecretaireHome />
            </ProtectedRoute>
          }
        />

        {/* Personnel (admin) */}
        <Route
          path="/personnel"
          element={
            <ProtectedRoute roles={["admin"]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />

        {/* Médecins → ADMIN UNIQUEMENT */}
        <Route
          path="/docteurs"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DoctorsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs/ajouter"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AddDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs/:id"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DoctorDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs/:id/edit"
          element={
            <ProtectedRoute roles={["admin"]}>
              <EditDoctor />
            </ProtectedRoute>
          }
        />

        {/* Salles & Blocs (admin) */}
        <Route
          path="/salles"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SallesBlocs />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default AppContent;
