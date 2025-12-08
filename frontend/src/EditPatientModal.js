// src/EditPatientModal.js
import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiFileText,
  FiPhone,
  FiHome,
  FiMail,
  FiCalendar,
  FiX,
} from "react-icons/fi";

const EditPatientModal = ({ patient, onClose, onEditPatient }) => {
  const [formData, setFormData] = useState({
    name: "",
    dossier: "",
    phone: "",
    address: "",
    email: "",
    birthday: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // 🔹 Pré-remplir le formulaire avec les infos du patient
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        dossier: patient.dossier || "",
        phone: patient.phone || "",
        address: patient.address || "",
        email: patient.email || "",
        birthday: patient.birthday
          ? new Date(patient.birthday).toISOString().slice(0, 10)
          : "",
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return;

    setSubmitting(true);
    try {
      await onEditPatient({
        ...patient,              // garde _id, photo, dossier, etc.
        name: formData.name,
        dossier: formData.dossier, // reste identique, non modifiable dans l’UI
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        birthday: formData.birthday,
      });
      onClose();
    } catch (err) {
      console.error("Erreur lors de la modification du patient :", err);
      alert("Impossible de sauvegarder les modifications (voir console).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-6 pb-4 border-b border-slate-200/80">
          <h2 className="text-2xl font-bold text-indigo-600">
            Modifier Patient
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                <FiUser className="inline mr-2 text-indigo-500" />
                Nom complet
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-sm"
              />
            </div>

            {/* Numéro de dossier (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                <FiFileText className="inline mr-2 text-indigo-500" />
                Numéro de dossier
              </label>
              <input
                name="dossier"
                value={formData.dossier}
                readOnly
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed shadow-sm"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                <FiPhone className="inline mr-2 text-indigo-500" />
                Téléphone
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-sm"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                <FiHome className="inline mr-2 text-indigo-500" />
                Adresse
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                <FiMail className="inline mr-2 text-indigo-500" />
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-sm"
              />
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                <FiCalendar className="inline mr-2 text-indigo-500" />
                Date de naissance
              </label>
              <input
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200/70 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-violet-600 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
