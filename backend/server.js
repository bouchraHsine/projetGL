// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboard');
const dashboardAdvanced = require('./routes/dashboardAdvanced');
const appointmentRoutes = require('./routes/appointmentRoutes');

const authMiddleware = require('./middleware/authMiddleware');
const verifyRole = require('./middleware/verifyRole');

const app = express();
const port = 5000;

// ============================
// Middlewares globaux
// ============================
app.use(bodyParser.json());
app.use(cors());

// Middleware de log simple
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// Fichiers uploads (photos, docs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// Connexion MongoDB
// ============================
const dbURL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hopital';

mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB:', err));

// ============================
// Routes AUTH (publiques)
// ============================
app.use('/api/auth', authRoutes);

// ============================
// Routes protégées (staff)
// ============================

// Patients : accès admin / medecin / secretaire
app.use(
  '/api/patients',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  patientRoutes
);

// Médecins
app.use('/api/doctors', require('./routes/doctorRoutes'));

// Rendez-vous
app.use(
  '/api/appointments',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  appointmentRoutes
);

// Dashboard analytique avancé
app.use(
  '/api/dashboard/advanced',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  dashboardAdvanced
);

// Dashboard simple
app.use(
  '/api/dashboard',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  dashboardRoutes
);

// ============================
// 404
// ============================
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ============================
// Démarrage serveur
// ============================
app.listen(port, () =>
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`)
);
