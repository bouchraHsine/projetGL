// backend/routes/appointmentRoutes.js
const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/patientModel');

const router = express.Router();

const {
  getMoroccanHolidays,
  getVariableIslamicHolidays,
} = require('../utils/holidays');

/* -----------------------------------------
   🔎 Vérifier si une date est un jour interdit
--------------------------------------------*/
function isForbiddenDate(date) {
  const day = date.getDay();

  // 🔴 Week-end (dimanche = 0, samedi = 6)
  if (day === 0 || day === 6) return true;

  const year = date.getFullYear();

  // 🔵 Jours fériés fixes
  const fixed = getMoroccanHolidays(year);

  // 🟣 Jours islamiques
  const islamic = getVariableIslamicHolidays();

  const formatted = date.toISOString().split('T')[0];

  return fixed.includes(formatted) || islamic.includes(formatted);
}

/* -----------------------------------------
   🟢 1) CRÉATION RENDEZ-VOUS  (POST /api/appointments)
   Body attendu depuis le frontend :
   {
     patientId: "id du patient",
     date: "2025-12-04T08:00",
     motif: "texte..."   // optionnel
   }
--------------------------------------------*/
router.post('/', async (req, res) => {
  try {
    const { patientId, date, motif } = req.body;

    if (!patientId || !date) {
      return res
        .status(400)
        .json({ message: 'patientId et date sont obligatoires.' });
    }

    const finalDate = new Date(date);

    // ❌ Interdire week-ends & jours fériés
    if (isForbiddenDate(finalDate)) {
      return res.status(400).json({
        message:
          "Impossible de prendre un rendez-vous ce jour-là (week-end ou jour férié).",
      });
    }

    // 🔎 Vérifier que le patient existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé.' });
    }

    // 🔑 Récupérer l'utilisateur connecté pour le champ "medecin"
    // (suivant ton authMiddleware, ça peut être id, _id ou userId)
    const currentUserId =
      req.user?.id || req.user?._id || req.user?.userId || null;

    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Utilisateur non authentifié (token invalide)." });
    }

    // 🔎 Vérifier si ce médecin a déjà un RDV à cette heure exacte
    const conflict = await Appointment.findOne({
      medecin: currentUserId,
      date: finalDate,
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Ce médecin a déjà un rendez-vous à cette heure-là.',
      });
    }

    // 💾 Enregistrer le rendez-vous
    const rdv = new Appointment({
      patient: patient._id,
      medecin: currentUserId,
      date: finalDate,
      duration: 30, // par défaut
      notes: motif || '',
    });

    const saved = await rdv.save();

    // 🔙 On renvoie un format simple que le frontend utilise
    return res.status(201).json({
      _id: saved._id,
      patientId: patient._id,
      patientName: patient.name,
      date: saved.date,
      motif: saved.notes,
      status: saved.status,
    });
  } catch (error) {
    console.error('Erreur création RDV :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* -----------------------------------------
   🟦 2) LISTE DES RENDEZ-VOUS (GET /api/appointments)
   -> renvoie un tableau :
   [
     {
       _id,
       patientId,
       patientName,
       date,
       motif,
       status
     },
     ...
   ]
--------------------------------------------*/
router.get('/', async (req, res) => {
  try {
    const rdv = await Appointment.find()
      .populate('patient', 'name')
      .populate('medecin', 'name specialty')
      .sort({ date: 1 });

    const formatted = rdv.map((a) => ({
      _id: a._id,
      patientId: a.patient?._id || null,
      patientName: a.patient?.name || 'Patient inconnu',
      date: a.date,
      motif: a.notes || '',
      status: a.status,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur récupération RDV :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* -----------------------------------------
   🟨 3) SUPPRESSION (DELETE /api/appointments/:id)
--------------------------------------------*/
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rendez-vous supprimé.' });
  } catch (error) {
    console.error('Erreur suppression RDV :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
