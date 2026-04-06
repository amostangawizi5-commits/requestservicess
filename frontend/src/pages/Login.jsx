import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import BackgroundParticles from '../components/common/BackgroundParticles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <BackgroundParticles />
      <div className="login-container">
        <div className="login-card fade-in-up">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Login to your account</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <button type="submit" className="login-btn" disabled={loading}>
              <FaSignInAlt /> {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          overflow: hidden;
          padding: 2rem;
        }
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
        }
        .login-card {
          background: rgba(241, 248, 255, 0.96);
          border: 1px solid rgba(95, 131, 177, 0.18);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(52, 89, 130, 0.14);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h2 {
          color: #24324d;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .login-header p {
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
        .login-btn {
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
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: #64748f;
        }
        .login-footer a {
          color: #445574;
          text-decoration: none;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
