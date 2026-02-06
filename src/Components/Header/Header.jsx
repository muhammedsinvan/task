import React from 'react';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import './Header.css';

const Header = ({ toggleSidebar, sidebarOpen, isMobile }) => {
  const handleMenuClick = () => {
    toggleSidebar();
  };

  return (
    <header className={`top-navbar ${sidebarOpen && !isMobile ? 'sidebar-open' : ''}`}>
      <div className="header-left">
        <button className="menu-toggle" onClick={handleMenuClick}>
          <FaBars />
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        <div className="user-profile">
          <FaUserCircle className="user-avatar-icon" />
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;