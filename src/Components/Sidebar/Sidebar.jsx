import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserFriends, 
  FaCog, 
  FaSignOutAlt,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (window.innerWidth <= 768 && 
          isOpen && 
          sidebar && 
          !sidebar.contains(event.target) && 
          menuToggle && 
          !menuToggle.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/dashboard'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <FaUsers />,
      path: '/user-management'
    },
    {
      id: 'team',
      label: 'Team',
      icon: <FaUserFriends />,
      path: '/team'
    }
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <FaCog />,
      path: '/settings'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && window.innerWidth <= 768 && (
        <div 
          className="mobile-overlay active" 
          onClick={onClose} 
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-text">
              <h1>LOGO</h1>
            </div>
          </div>
          {window.innerWidth <= 768 && (
            <button className="close-sidebar" onClick={onClose}>
              <FaTimes />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="section-title">MAIN MENU</h3>
            <ul className="nav-menu">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <FaChevronRight className="nav-arrow" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="section-title">SETTINGS</h3>
            <ul className="nav-menu">
              {settingsItems.map((item) => (
                <li key={item.id}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <FaChevronRight className="nav-arrow" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;