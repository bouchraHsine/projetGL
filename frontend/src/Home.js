// src/Home.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';
import { FiHome, FiUsers, FiCalendar, FiUserPlus, FiSearch, FiLogOut } from 'react-icons/fi';
import "./Home.css";
// Import du logo
import logo from './assets/neohealth-logo.jpg';

function Home() {
  // États
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Navigation
  const navigate = useNavigate();

  // Récupération des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des patients:', error);
      }
    };
    fetchPatients();
  }, []);

  // Handlers
  const handleSearch = (e) => setSearch(e.target.value);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(search.toLowerCase()) ||
    patient.dossier.includes(search)
  );

  const addPatient = async (newPatient) => {
    try {
      const response = await axios.post('http://localhost:5000/api/patients', newPatient);
      setPatients([...patients, response.data]);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const editPatient = async (updatedPatient) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/patients/${updatedPatient._id}`,
        updatedPatient
      );
      setPatients(patients.map(p => p._id === updatedPatient._id ? response.data : p));
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Confirmer suppression ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/patients/${_id}`);
        setPatients(patients.filter(p => p._id !== _id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleViewDossier = (patientId) => navigate(`/patients/${patientId}/dossier`);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="NeoHealth Logo" className="logo-img" />
            <div className="logo-text">
              <h2>NeoHealth</h2>
              <p>Medical Suite</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">GÉNÉRAL</h3>
            <a href="#" className="nav-item active">
              <FiHome className="nav-icon" />
              <span>Tableau de Bord</span>
            </a>
            <a href="#" className="nav-item">
              <FiUsers className="nav-icon" />
              <span>Gestion Patients</span>
            </a>
            <a href="#" className="nav-item">
              <FiCalendar className="nav-icon" />
              <span>Rendez-vous</span>
            </a>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">ADMINISTRATION</h3>
            <a href="#" className="nav-item">
              <FiUsers className="nav-icon" />
              <span>Personnel Médical</span>
            </a>
            <a href="#" className="nav-item">
              <FiUsers className="nav-icon" />
              <span>Médecins</span>
            </a>
            <a href="#" className="nav-item">
              <FiUsers className="nav-icon" />
              <span>Salles & Blocs</span>
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'content-shifted' : ''}`}>
        {/* Header */}
        <header className="content-header">
          <div className="header-actions">
            <h1>Gestion des Patients</h1>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-number">{patients.length}</span>
                <span className="stat-label">Patients Totaux</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {patients.filter(p => p.nextAppointment).length}
                </span>
                <span className="stat-label">RDV Programmé</span>
              </div>
            </div>
          </div>

          <div className="search-section">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                className="search-input"
                placeholder="Rechercher un patient..."
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="add-patient-btn"
            >
              <FiUserPlus className="btn-icon" />
              Nouveau Patient
            </button>
          </div>
        </header>

        {/* Patients Grid */}
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-header">
                <div className="patient-info">
                  <h3 className="patient-name">{patient.name}</h3>
                  <p className="patient-dossier">Dossier #{patient.dossier}</p>
                </div>
                <div className="patient-actions">
                  <button
                    onClick={() => handleViewDossier(patient._id)}
                    className="action-btn view-btn"
                    title="Voir dossier"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}
                    className="action-btn edit-btn"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(patient._id)}
                    className="action-btn delete-btn"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="patient-details">
                <div className="detail-item">
                  <span className="detail-label">📞 Téléphone</span>
                  <span className="detail-value">{patient.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📍 Adresse</span>
                  <span className="detail-value">{patient.address}</span>
                </div>
                
                <div className="appointments-grid">
                  <div className="appointment-card">
                    <span className="appointment-label">Dernier RDV</span>
                    <span className="appointment-date past">
                      {patient.lastAppointment ? 
                        new Date(patient.lastAppointment).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="appointment-card">
                    <span className="appointment-label">Prochain RDV</span>
                    <span className="appointment-date future">
                      {patient.nextAppointment ? 
                        new Date(patient.nextAppointment).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="patient-status">
                <span className={`status-badge ${patient.nextAppointment ? 'active' : 'inactive'}`}>
                  {patient.nextAppointment ? 'Suivi en cours' : 'En attente'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Aucun patient trouvé</h3>
            <p>
              {search ? 'Aucun patient ne correspond à votre recherche.' : 'Commencez par ajouter votre premier patient.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="add-patient-btn primary"
            >
              <FiUserPlus className="btn-icon" />
              Ajouter un patient
            </button>
          </div>
        )}

        {/* Modals */}
        {isAddModalOpen && (
          <AddPatientModal 
            onClose={() => setIsAddModalOpen(false)} 
            onAddPatient={addPatient}
          />
        )}

        {isEditModalOpen && (
          <EditPatientModal 
            patient={selectedPatient}
            onClose={() => setIsEditModalOpen(false)}
            onEditPatient={editPatient}
          />
        )}
      </div>
    </div>
  );
}

export default Home;