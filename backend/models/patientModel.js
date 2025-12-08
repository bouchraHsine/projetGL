// backend/models/patientModel.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    // 🔢 Numéro de dossier généré automatiquement (ex: 1001, 1002, ...)
    dossier: {
      type: Number,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    // ✅ Nouveaux champs
    email: {
      type: String,
      default: null,
    },

    birthday: {
      type: Date,
      default: null,
      index: true,
    },

    lastAppointment: { type: Date, index: true },
    nextAppointment: { type: Date, index: true },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    medicalRecords: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // chemin de la photo sur le serveur
    photo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
