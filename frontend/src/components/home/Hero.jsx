import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { portfolioProfile, serviceOptions } from '../../data/portfolioData';
import myPhoto from '../../assets/images/myphoto.png';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-orb hero-orb-one"></div>
      <div className="hero-orb hero-orb-two"></div>
      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Portfolio and Services</p>
          <h1>
            Helping businesses launch better <span>websites and mobile apps</span>.
          </h1>
          <p className="hero-lead">{portfolioProfile.tagline}</p>
          <p className="hero-text">{portfolioProfile.intro}</p>
          <div className="hero-actions">
            <a href="#contact" className="button">
              Request a project <FaArrowRight />
            </a>
            <a href="#projects" className="button button-secondary">
              See completed work
            </a>
          </div>
          <div className="hero-service-tags">
            {serviceOptions.map((service) => (
              <span key={service.id}>{service.title}</span>
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-card hero-card-primary">
            <div className="hero-profile">
              <div className="hero-profile-copy">
                <p className="hero-card-label">Developer</p>
                <h2>{portfolioProfile.name}</h2>
                <p>{portfolioProfile.role}</p>
              </div>
              <div className="hero-profile-photo-wrap">
                <img src={myPhoto} alt={portfolioProfile.name} className="hero-profile-photo" />
              </div>
            </div>
          </div>
          <div className="hero-metrics">
            {portfolioProfile.heroMetrics.map((metric) => (
              <div className="hero-card" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-card hero-card-note">
            <p className="hero-card-label">Availability</p>
            <p>{portfolioProfile.availability}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
