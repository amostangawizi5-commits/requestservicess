import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import myBrandLogo from '../../assets/images/mybrand.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="shell nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <img src={myBrandLogo} alt="My Brand logo" className="nav-logo-image" />
        </Link>

        <button className="menu-icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <a href="/#home" className="nav-link" onClick={() => setIsOpen(false)}>Home</a>
          <a href="/#about" className="nav-link" onClick={() => setIsOpen(false)}>About Us</a>
          <a href="/#services" className="nav-link" onClick={() => setIsOpen(false)}>Services</a>
          <Link to="/projects" className="nav-link" onClick={() => setIsOpen(false)}>Projects</Link>
          <a href="/#contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact</a>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>Admin</Link>
              )}
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="nav-btn" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
