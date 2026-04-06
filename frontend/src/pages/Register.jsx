import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import BackgroundParticles from '../components/common/BackgroundParticles';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      <BackgroundParticles />
      <div className="register-container">
        <div className="register-card fade-in-up">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Join Ginger's portfolio</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className="register-btn" disabled={loading}>
              <FaUserPlus /> {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          
          <div className="register-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>

      <style>{`
        .register-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          overflow: hidden;
          padding: 2rem;
        }
        .register-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
        }
        .register-card {
          background: rgba(241, 248, 255, 0.96);
          border: 1px solid rgba(95, 131, 177, 0.18);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(52, 89, 130, 0.14);
        }
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .register-header h2 {
          color: #24324d;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .register-header p {
          color: #64748f;
        }
        .error-message {
          background: rgba(252, 231, 231, 0.92);
          color: #8b3d3d;
          padding: 0.8rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748f;
        }
        .input-group input {
          width: 100%;
          padding: 1rem 3rem 1rem 3rem;
          background: rgba(250, 253, 255, 0.95);
          border: 1px solid rgba(95, 131, 177, 0.18);
          border-radius: 10px;
          color: #24324d;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #7a8aa4;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .input-group input:focus {
          outline: none;
          border-color: #8dc2f2;
        }
        .register-btn {
          width: 100%;
          background: linear-gradient(135deg, #b8dcff, #dff0ff);
          color: #24324d;
          padding: 1rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.3s;
        }
        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .register-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: #64748f;
        }
        .register-footer a {
          color: #445574;
          text-decoration: none;
        }
        .register-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Register;
