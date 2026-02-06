import React, { useState, useEffect } from 'react';
import './Login.css';
import bgLogin from '../Assets/img/bglogin.gif';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ip_address: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Get user's IP address on component mount
  useEffect(() => {
    const getIPAddress = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setFormData(prev => ({
          ...prev,
          ip_address: response.data.ip
        }));
      } catch (error) {
        setFormData(prev => ({
          ...prev,
          ip_address: ''
        }));
      }
    };
    
    getIPAddress();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return validateEmail(formData.email) && formData.password.trim() !== '';
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setErrorMessage('Please enter valid email and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        'http://13.210.33.250/api/login', 
        formData,
      );

      console.log('Login response:', response.data); // Debug log

      // Check if login was successful
      if (response.data.access_token) {
        // Successful login
        const { access_token, refresh_token, expires_at, user } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(user));
        if (expires_at) {
          localStorage.setItem('token_expiry', expires_at);
        }
        
        // Handle company data
        if (response.data.companies && response.data.companies.length > 0) {
          // Store first company by default
          const company = response.data.companies[0];
          localStorage.setItem('selected_company', JSON.stringify(company));
          localStorage.setItem('company_id', company.id);
          localStorage.setItem('company_name', company.company_name);
        }
        
        // Remember me
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('saved_email', formData.email);
        } else {
          localStorage.removeItem('remember_me');
          localStorage.removeItem('saved_email');
        }

        // Navigate to dashboard
        navigate('/dashboard');

      } else if (response.data.message) {
        // Server returned error message
        setErrorMessage(response.data.message);
      } else {
        // Unexpected response
        setErrorMessage('Unexpected response from server');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error responses
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 422) {
          // Validation errors
          const errors = data.errors || {};
          const errorMessages = Object.values(errors).flat().join(', ');
          setErrorMessage(errorMessages || 'Validation failed');
        } else if (status === 401) {
          // Incorrect credentials
          setErrorMessage(data.message || 'The login credentials are incorrect.');
        } else if (status === 500) {
          // Server error
          setErrorMessage(data.message || 'Something went wrong. Please try again later.');
        } else {
          setErrorMessage(data.message || `Error ${status}: Please try again`);
        }
      } else if (error.request) {
        // Network error
        setErrorMessage('Network error. Please check your connection.');
      } else {
        // Other errors
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_email');
    const remember = localStorage.getItem('remember_me') === 'true';
    
    if (remember && savedEmail) {
      setRememberMe(true);
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }));
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background" style={{ backgroundImage: `url(${bgLogin})` }}></div>
      
      {/* LOGO outside the box */}
      <div className="logo-text">LOGO</div>
      
      <div className="login-wrapper">
        <div className="login-card">
          
          {/* Header Section */}
          <div className="form-header">
            <h1 className="form-title">Sign in</h1>
            <p className="form-subtitle">Log in to manage your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Email Field with icon inside input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon-inside" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field with icon inside input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon-inside" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>

            {/* Error Message */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Optional: Show loading indicator */}
            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Authenticating...</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;