// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Ajouter Navigate ici

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import Dashboard from "./Dashboard";
import PatientsList from "./PatientsList";
import RendezVousPage from "./RendezVousPage";
import DossierPatient from "./DossierPatient";

import ProtectedRoute from "./ProtectedRoute";
import "./App.css";
import DoctorsList from "./doctors/DoctorsList";
import DoctorDetail from "./doctors/DoctorDetail";
import AddDoctor from "./doctors/AddDoctor";
import EditDoctor from "./doctors/EditDoctor";

// Petites pages placeholder pour chaque rôle
const PatientHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Patient</h1>
    <p>Bienvenue sur votre espace patient (en cours de développement).</p>
  </div>
);

const MedecinHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Médecin</h1>
    <p>Tableau de bord médecin (vous pourrez y ajouter les fonctionnalités).</p>
  </div>
);

const SecretaireHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Secrétaire</h1>
    <p>Interface de gestion des rendez-vous et patients (à compléter).</p>
  </div>
);

function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        {/* Landing page publique */}
        <Route path="/" element={<HomePage />} />

        {/* Auth publique */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔹 ADMIN UNIQUEMENT */}
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
              <PatientsList />
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

        {/* 🔹 RENDEZ-VOUS : admin + médecin + secrétaire */}
        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <RendezVousPage />
            </ProtectedRoute>
          }
        />

        {/* 🔹 ESPACE PATIENT */}
        <Route
          path="/patient/home"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PatientHome />
            </ProtectedRoute>
          }
        />

        {/* 🔹 ESPACE MÉDECIN */}
        <Route
          path="/medecin/home"
          element={
            <ProtectedRoute roles={["medecin"]}>
              <MedecinHome />
            </ProtectedRoute>
          }
        />

        {/* 🔹 ESPACE SECRÉTAIRE */}
        <Route
          path="/secretaire/home"
          element={
            <ProtectedRoute roles={["secretaire"]}>
              <SecretaireHome />
            </ProtectedRoute>
          }
        />

        {/* Tu peux garder ou adapter ces routes plus tard */}
        <Route
          path="/personnel"
          element={
            <ProtectedRoute roles={["admin"]}>
              <h2 className="text-xl font-semibold text-blue-700 p-6">
                👩‍⚕️ Gestion du Personnel (à venir)
              </h2>
            </ProtectedRoute>
          }
        />
        
        {/* Routes médecins */}
        <Route path="/docteurs" element={<DoctorsList />} />
        <Route path="/docteurs/ajouter" element={<AddDoctor />} />
        <Route path="/docteurs/:id" element={<DoctorDetail />} />
        <Route path="/docteurs/:id/edit" element={<EditDoctor />} />
        
        {/* fallback: redirect to liste */}
        <Route path="*" element={<Navigate to="/docteurs" replace />} /> 
        
        <Route
          path="/salles"
          element={
            <ProtectedRoute roles={["admin"]}>
              <h2 className="text-xl font-semibold text-blue-700 p-6">
                🏥 Gestion des Salles et Blocs (à venir)
              </h2>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default AppContent;