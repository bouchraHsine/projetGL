// backend/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // Patient concerné
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },

    // Médecin (ou utilisateur) qui gère le rendez-vous
    medecin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Date + heure du rendez-vous
    date: {
      type: Date,
      required: true,
    },

    // Durée (en minutes)
    duration: {
      type: Number,
      default: 30, // minutes
    },

    // Motif / notes
    notes: { type: String },

    // Statut du rendez-vous
    status: {
      type: String,
      enum: ['planifié', 'en cours', 'terminé', 'annulé'],
      default: 'planifié',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
