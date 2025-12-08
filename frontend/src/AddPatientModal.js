// src/AddPatientModal.js
import axios from "axios";
import React, { useState } from "react";
import {
  FiUser,
  FiPhone,
  FiHome,
  FiCamera,
  FiMail,
  FiCalendar,
  FiX,
} from "react-icons/fi";

function AddPatientModal({ onClose, onAddPatient }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    birthday: "",
    photo: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("authToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("phone", formData.phone);
    formPayload.append("address", formData.address);
    if (formData.email) formPayload.append("email", formData.email);
    if (formData.birthday) formPayload.append("birthday", formData.birthday);
    if (formData.photo) formPayload.append("photo", formData.photo);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/patients",
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onAddPatient(response.data);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient", error);
      alert("Impossible d'ajouter le patient (voir console).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-indigo-600">
            Nouveau Patient
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-indigo-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm mb-2">
                <FiUser className="inline mr-2" />
                Nom complet
              </label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:border-indigo-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-2">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:border-indigo-400"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm mb-2">
                <FiPhone className="inline mr-2" />
                Téléphone
              </label>
              <input
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:border-indigo-400"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm mb-2">
                <FiHome className="inline mr-2" />
                Adresse
              </label>
              <input
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:border-indigo-400"
              />
            </div>

            {/* Date naissance */}
            <div>
              <label className="block text-sm mb-2">
                <FiCalendar className="inline mr-2" />
                Date de naissance
              </label>
              <input
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:border-indigo-400"
              />
            </div>

            {/* Photo */}
            <div className="col-span-full">
              <label className="block text-sm mb-2">
                <FiCamera className="inline mr-2" />
                Photo d'identité
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              {submitting ? "Ajout en cours..." : "Ajouter le Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPatientModal;
