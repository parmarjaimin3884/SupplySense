import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLayers, FiMail, FiLock, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft } from 'react-icons/fa';

export const LoginPage = () => {
  const [email, setEmail] = useState('sarah.vance@supplysense.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    await login(`${provider.toLowerCase()}@supplysense.ai`, 'oauth');
    navigate('/dashboard');
  };

  return (
    <div className="login-page-container">
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />
      
      <div className="login-card-wrapper">
        <div className="login-card-header">
          <div className="login-brand-logo">
            <FiLayers size={28} />
          </div>
          <h1 className="login-title">SupplySense AI</h1>
          <p className="login-subtitle">Enterprise Supply Chain Risk & Inventory Intelligence</p>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                className="custom-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                className="custom-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>
            <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to registered enterprise email."); }}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-loader" />
            ) : (
              <>
                Sign In to Dashboard <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="social-divider">
          <span>Or authenticate via SSO</span>
        </div>

        <div className="social-login-grid">
          <button className="social-btn" onClick={() => handleSocialLogin('Google')}>
            <FcGoogle size={18} /> Google Workspace
          </button>
          <button className="social-btn" onClick={() => handleSocialLogin('Microsoft')}>
            <FaMicrosoft size={18} color="#00a4ef" /> Microsoft Entra ID
          </button>
        </div>

        <div className="login-footer-info">
          <FiCheckCircle size={14} color="#10B981" /> 256-bit AES Encryption • SOC2 Type II Certified
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
