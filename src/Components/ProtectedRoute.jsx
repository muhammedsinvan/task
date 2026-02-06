import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }
    
    // Optional: Check token expiry
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (tokenExpiry) {
      try {
        const expiryDate = new Date(tokenExpiry);
        if (expiryDate < new Date()) {
          console.log('Token expired');
          // Don't clear all localStorage, just auth items
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('token_expiry');
          return false;
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    }
    
    return true;
  };

  if (!isAuthenticated()) {
    // Don't clear everything, just redirect
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;