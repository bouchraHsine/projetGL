// src/PatientsList.js
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiEdit,
  FiTrash2,
  FiUser,
  FiSearch,
  FiPlus,
  FiFilter,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

import EditPatientModal from "./EditPatientModal";
import AddPatientModal from "./AddPatientModal";

import "./PatientsList.css";

/* 🔹 IMPORTS DES IMAGES DE FOND (dossier src/assets) */
import bg1 from "./assets/hero2.jpg";
import bg2 from "./assets/hero4.jpg";
import bg3 from "./assets/hero5.jpg";

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // 🔄 Slideshow background
  const backgroundImages = [bg1, bg2, bg3];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 3000); // 3 secondes
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // 🔹 Récupérer patients
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPatients(res.data))
      .catch((err) => {
        console.error("Erreur lors de la récupération des patients:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  // 🔹 Supprimer patient
  const deletePatient = (id) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setPatients((prev) => prev.filter((p) => p._id !== id));
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression du patient:", err);
        alert("Impossible de supprimer le patient (voir console).");
      });
  };

  // 🔹 Ouvrir modal édition
  const handleEditPatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  // 🔹 Mise à jour patient (appelé depuis EditPatientModal)
  // Dans PatientsList.js
const handleUpdatePatient = async (updated) => {
  if (!token) {
    navigate("/login");
    return;
  }

  const id = updated._id;
  const payload = {
    name: updated.name,
    dossier: updated.dossier,
    phone: updated.phone,
    address: updated.address,
    lastAppointment: updated.lastAppointment,
    nextAppointment: updated.nextAppointment,
    email: updated.email,
    birthday: updated.birthday,        // 🔹 nouveau
    status: updated.status || "active",
  };

  const response = await axios.put(
    `http://localhost:5000/api/patients/${id}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const saved = response.data;
  setPatients((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
};


  // 🔹 Ajout patient (appelé depuis AddPatientModal)
  const handleAddPatient = (newPatient) => {
    // newPatient doit être l’objet renvoyé par l’API
    setPatients((prev) => [...prev, newPatient]);
  };

  // 🔍 Filtre recherche
  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dossier?.toString().includes(searchTerm)
  );

  return (
    <div
      className="patients-page"
      style={{ backgroundImage: `url(${backgroundImages[bgIndex]})` }}
    >
      <div className="patients-overlay">
        <div className="patients-management">
          {/* ===== HEADER ===== */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <FiUser className="title-icon" />
                Gestion des Patients
              </h1>
              <p className="page-subtitle">
                {patients.length} patient(s) au total
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus className="btn-icon" />
              Nouveau Patient
            </button>
          </div>

          {/* ===== TOOLBAR ===== */}
          <div className="toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un patient (nom, email, dossier)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="toolbar-actions">
              <button className="toolbar-btn">
                <FiFilter className="btn-icon" /> Filtres
              </button>
              <button className="toolbar-btn">
                <FiDownload className="btn-icon" /> Exporter
              </button>
              <button
                className="toolbar-btn"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="btn-icon" /> Actualiser
              </button>
            </div>
          </div>

          {/* ===== CONTENU PRINCIPAL : CARTES ===== */}
          {loading ? (
            <div className="cards-loading">
              <FiRefreshCw className="loading-spinner" />
              <p>Chargement des patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="cards-empty">
              <FiUser className="empty-icon" />
              <p>Aucun patient trouvé.</p>
            </div>
          ) : (
            <div className="patients-grid">
              {filteredPatients.map((patient) => (
                <div key={patient._id} className="patient-card">
                  <div className="card-header">
                   <div className="card-avatar">
  {patient.photo ? (
    <img
      src={`http://localhost:5000${patient.photo}`}
      alt={patient.name}
      className="avatar-img"
    />
  ) : (
    <FiUser />
  )}
</div>

                    <div className="card-header-info">
                      <h3 className="card-name">{patient.name}</h3>
                      <p className="card-id">
                        ID: {patient._id?.substring(0, 8)} • Dossier #
                        {patient.dossier || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="card-section">
                      <span className="card-label">Contact</span>
                      <span className="card-value">
                        {patient.email || "Email non renseigné"}
                      </span>
                      <span className="card-value secondary">
                        {patient.phone || "Téléphone non renseigné"}
                      </span>
                    </div>

                    <div className="card-section">
                      <span className="card-label">Adresse</span>
                      <span className="card-value">
                        {patient.address || "Non renseignée"}
                      </span>
                    </div>

                    <div className="card-section">
                      <span className="card-label">Date de naissance</span>
                      <span className="card-value">
                        {patient.birthday
                          ? new Date(patient.birthday).toLocaleDateString()
                          : "Non renseignée"}
                      </span>
                    </div>
                  </div>

                  {/* Boutons en bas de la carte */}
                  <div className="card-actions-row">
  <button
    className="card-btn edit"
    onClick={() => handleEditPatientClick(patient)}
    title="Modifier"
  >
    <FiEdit />
  </button>

  <button
    className="card-btn delete"
    onClick={() => deletePatient(patient._id)}
    title="Supprimer"
  >
    <FiTrash2 />
  </button>
</div>

                </div>
              ))}
            </div>
          )}

          {/* ===== MODALS ===== */}
          {showEditModal && selectedPatient && (
            <EditPatientModal
              patient={selectedPatient}
              onClose={() => setShowEditModal(false)}
              onEditPatient={handleUpdatePatient}
            />
          )}

          {showAddModal && (
            <AddPatientModal
              onClose={() => setShowAddModal(false)}
              onAddPatient={handleAddPatient}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsList;
