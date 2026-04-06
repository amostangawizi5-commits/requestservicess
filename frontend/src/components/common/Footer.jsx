import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { portfolioProfile } from '../../data/portfolioData';
import myBrandLogo from '../../assets/images/mybrand.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="shell footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={myBrandLogo} alt="My Brand logo" className="footer-brand-logo" />
            <h3>{portfolioProfile.name}</h3>
            <p>{portfolioProfile.role}</p>
          </div>
          <div className="footer-links">
            <a href="/#home">Home</a>
            <a href="/#services">Services</a>
            <a href="/#projects">Projects</a>
            <a href="/#contact">Request service</a>
          </div>
          <div className="footer-social">
            <a href="https://github.com/" target="_blank" rel="noreferrer"><FaGithub /></a>
            <a href="https://linkedin.com/" target="_blank" rel="noreferrer"><FaLinkedin /></a>
            <a href="https://twitter.com/" target="_blank" rel="noreferrer"><FaTwitter /></a>
            <a href={`mailto:${portfolioProfile.email}`}><FaEnvelope /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 {portfolioProfile.name}. Built to showcase services, skills, and shipped work.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
