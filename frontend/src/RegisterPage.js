import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield, FiBriefcase, FiStar, FiAward } from 'react-icons/fi';

// Import des images
import logo from './assets/neohealth-logo.jpg';
import medicalImage from './assets/hero2.jpg';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name: fullName, email, password, specialty }
      );

      localStorage.setItem('authToken', response.data.token);
      navigate('/home');

    } catch (err) {
      const serverError = err.response?.data?.message;
      setError(serverError || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-auth-page">
      {/* Côté gauche - Formulaire */}
      <div className="split-form-side">
        <div className="split-form-container">
          {/* Logo */}
          <div className="split-logo">
            <img src={logo} alt="NeoHealth Logo" className="split-logo-img" />
            <h1>Clinique NeoHealth</h1>
          </div>

          {/* En-tête */}
          <div className="split-header">
            <h2>Join Our Team</h2>
            <p>Create your professional account</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="split-error-message">
              <FiShield className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleRegister} className="split-form">
            <div className="split-form-group">
              <label className="split-form-label">
                <FiUser className="icon" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="split-form-input"
                placeholder="Dr. Jean Dupont"
                required
              />
            </div>

            <div className="split-form-group">
              <label className="split-form-label">
                <FiBriefcase className="icon" />
                Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="split-form-input"
                required
              >
                <option value="">Select your specialty</option>
                <option value="medecin_generaliste">General Practitioner</option>
                <option value="cardiologue">Cardiologist</option>
                <option value="pediatre">Pediatrician</option>
                <option value="chirurgien">Surgeon</option>
                <option value="radiologue">Radiologist</option>
                <option value="infirmier">Nurse</option>
                <option value="administratif">Administrative Staff</option>
                <option value="technicien">Medical Technician</option>
              </select>
            </div>

            <div className="split-form-group">
              <label className="split-form-label">
                <FiMail className="icon" />
                Professional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="split-form-input"
                placeholder="your.email@clinique.com"
                required
              />
            </div>

            <div className="split-form-group">
              <label className="split-form-label">
                <FiLock className="icon" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="split-form-input"
                placeholder="Minimum 8 characters"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="split-submit-button"
            >
              <FiUser className="button-icon" />
              <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
              <FiArrowRight className="arrow-icon" />
            </button>
          </form>

          {/* Lien de connexion */}
          <div className="split-auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="split-auth-link">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Features list */}
          <div className="split-features">
            <div className="split-feature-item">
              <FiAward className="feature-icon" />
              <span>Professional Certification</span>
            </div>
            <div className="split-feature-item">
              <span>Advanced Medical Tools</span>
            </div>
            <div className="split-feature-item">
              <FiShield className="feature-icon" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Côté droit - Image */}
      <div className="split-image-side">
        <div 
          className="split-image-container"
          style={{ backgroundImage: `url(${medicalImage})` }}
        >
          <div className="split-image-overlay">
            <div className="split-image-content">
              <h3>Join Medical Excellence</h3>
              <p>Become part of our innovative healthcare community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;