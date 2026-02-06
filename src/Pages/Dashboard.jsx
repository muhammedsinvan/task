import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState({
    name: 'User',
    role: 'Admin'
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(prev => ({
            ...prev,
            ...parsedUser
          }));
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, [navigate]);


  return (
      <div className="welcome-section">
        <h1>Welcome to the Dashboard!</h1>
        <p>Select a menu option from the sidebar to get started.</p>
      </div>
  );
};

export default Dashboard;