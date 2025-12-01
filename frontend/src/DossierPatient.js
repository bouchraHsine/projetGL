import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiFileText, FiPhone, FiHome, FiCalendar, 
  FiUpload, FiDownload, FiTrash2, FiArrowLeft,
  FiPrinter, FiShare2, FiClock, FiEdit, FiMail,
  FiActivity, FiHeart, FiDroplet, FiThermometer
} from 'react-icons/fi';
import Sidebar from './Sidebar';

function DossierPatient() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');

  const extractDocuments = (data) => {
    if (!data) return [];
    return (
      data.medicalRecords ||
      data.documents ||
      data.dossier ||
      []
    );
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:5000/api/patients/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPatient(response.data);
        setDocuments(extractDocuments(response.data));
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.response?.data?.message || "Erreur lors de la récupération des détails du patient");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchPatientDetails();
    else {
      setError("Aucun patient spécifié");
      setLoading(false);
    }
  }, [patientId]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/patients/${patientId}/dossier`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.document) {
        setDocuments((prev) => [...prev, response.data.document]);
      } else if (response.data?.documents || response.data?.medicalRecords) {
        setDocuments(extractDocuments(response.data));
      } else if (response.data?.patient) {
        setDocuments(extractDocuments(response.data.patient));
      }

      setSelectedFile(null);
      setUploadSuccess("Document ajouté avec succès !");
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erreur lors de l'ajout du document");
      setUploadSuccess(null);
    }
  };

  const handleDeleteDocument = async (docUrlOrObj) => {
    const url = typeof docUrlOrObj === "string" ? docUrlOrObj : docUrlOrObj.url;
    if (!url) {
      setError("URL du document invalide.");
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(
          `http://localhost:5000/api/patients/${patientId}/dossier`,
          {
            data: { document: url },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.documents || response.data?.medicalRecords) {
          setDocuments(extractDocuments(response.data));
        } else if (response.data?.patient) {
          setDocuments(extractDocuments(response.data.patient));
        } else {
          setDocuments((prev) =>
            prev.filter((doc) =>
              (typeof doc === "string" ? doc : doc.url) !== url
            )
          );
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const getDocUrl = (doc) => {
    const raw = typeof doc === "string" ? doc : doc.url;
    if (!raw) return "#";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `http://localhost:5000${raw.startsWith("/") ? raw : "/" + raw}`;
  };

  const getDocName = (doc, index) => {
    if (typeof doc === "string") {
      const parts = doc.split("/");
      return parts[parts.length - 1] || `Document ${index + 1}`;
    }
    return doc.name || `Document ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800">Chargement du dossier...</h3>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-lg text-center">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Erreur</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors"
          >
            <FiArrowLeft className="inline mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="patients"
      />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
                >
                  <FiArrowLeft className="text-2xl text-white" />
                </button>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiUser className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Dossier Médical</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Patient: {patient.name} • Dossier #{patient.dossier || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-colors">
                <FiPrinter className="text-xl" />
                <span>Imprimer</span>
              </button>
              <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-colors">
                <FiShare2 className="text-xl" />
                <span>Partager</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Informations patient */}
            <div className="lg:col-span-2 space-y-8">
              {/* En-tête patient */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-start space-x-8">
                  {patient.photo ? (
                    <img
                      src={`http://localhost:5000${patient.photo}`}
                      alt={patient.name}
                      className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-6xl font-bold text-blue-900 border-4 border-white shadow-2xl">
                      {patient.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                        <p className="text-gray-600 mt-1">Dossier Médical Complet</p>
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors">
                        <FiEdit className="text-lg" />
                        <span>Modifier</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700">
                          <FiPhone className="mr-3 text-blue-900" />
                          <span className="font-medium">{patient.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FiMail className="mr-3 text-blue-900" />
                          <span className="font-medium">{patient.email || 'Non renseigné'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700">
                          <FiHome className="mr-3 text-blue-900" />
                          <span className="font-medium">{patient.address || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FiCalendar className="mr-3 text-blue-900" />
                          <span className="font-medium">
                            {patient.dateNaissance 
                              ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR')
                              : 'Date de naissance non renseignée'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onglets */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`px-8 py-4 font-medium text-lg border-b-2 transition-all ${
                        activeTab === 'documents'
                          ? 'border-blue-900 text-blue-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Documents
                    </button>
                    <button
                      onClick={() => setActiveTab('consultations')}
                      className={`px-8 py-4 font-medium text-lg border-b-2 transition-all ${
                        activeTab === 'consultations'
                          ? 'border-blue-900 text-blue-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Consultations
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-8 py-4 font-medium text-lg border-b-2 transition-all ${
                        activeTab === 'history'
                          ? 'border-blue-900 text-blue-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Historique
                    </button>
                  </div>
                </div>

                {/* Contenu des onglets */}
                <div className="p-8">
                  {activeTab === 'documents' && (
                    <div className="space-y-6">
                      {/* Upload */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <FiUpload className="mr-3 text-blue-900" />
                          Ajouter un Document
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-900 transition-colors group">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <div className="text-center">
                              <FiUpload className="text-5xl text-gray-400 group-hover:text-blue-900 mx-auto mb-4" />
                              <p className="text-lg font-medium text-gray-700">
                                {selectedFile ? selectedFile.name : 'Glissez-déposez ou cliquez pour sélectionner un fichier'}
                              </p>
                              <p className="text-gray-500 mt-2">PDF, JPG, PNG, DOC (max 10MB)</p>
                            </div>
                          </label>
                        </div>
                        <button
                          onClick={handleUploadDocument}
                          disabled={!selectedFile}
                          className="w-full py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-bold rounded-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Téléverser le Document
                        </button>
                      </div>

                      {/* Liste documents */}
                      {documents.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 flex items-center justify-between">
                            <span>Documents ({documents.length})</span>
                            <span className="text-sm font-normal text-gray-500">Trier par: Date</span>
                          </h3>
                          <div className="space-y-3">
                            {documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                                <div className="flex items-center space-x-4">
                                  <div className="p-3 bg-blue-100 rounded-lg">
                                    <FiFileText className="text-xl text-blue-900" />
                                  </div>
                                  <div>
                                    <a
                                      href={getDocUrl(doc)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-blue-900 hover:text-blue-700 flex items-center"
                                    >
                                      {getDocName(doc, index)}
                                      <FiDownload className="ml-2 text-sm" />
                                    </a>
                                    <p className="text-sm text-gray-500">
                                      Ajouté le {new Date().toLocaleDateString('fr-FR')}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteDocument(doc)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <FiTrash2 className="text-xl" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite - Stats et infos */}
            <div className="space-y-8">
              {/* Stats médicales */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Données Médicales</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FiHeart className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rythme cardiaque</p>
                        <p className="font-bold text-gray-900">72 bpm</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Normal</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiThermometer className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Température</p>
                        <p className="font-bold text-gray-900">36.8°C</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Normal</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiActivity className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pression artérielle</p>
                        <p className="font-bold text-gray-900">120/80</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Normal</span>
                  </div>
                </div>
              </div>

              {/* Dernières consultations */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Dernières Consultations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Dr. Martin</span>
                      <span className="text-sm text-gray-500">15 Nov 2024</span>
                    </div>
                    <p className="text-gray-600 text-sm">Consultation de contrôle</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">Terminé</span>
                      <FiDownload className="text-gray-400 hover:text-blue-900 cursor-pointer" />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Dr. Lefebvre</span>
                      <span className="text-sm text-gray-500">10 Nov 2024</span>
                    </div>
                    <p className="text-gray-600 text-sm">Bilan annuel</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">Terminé</span>
                      <FiDownload className="text-gray-400 hover:text-blue-900 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DossierPatient;