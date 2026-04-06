import React, { useState } from 'react';
import { FaArrowRight, FaCode, FaFileAlt, FaMobileAlt, FaPalette, FaTimes, FaWrench } from 'react-icons/fa';
import { serviceOptions } from '../../data/portfolioData';

const iconMap = {
  website: <FaCode />,
  'mobile-app': <FaMobileAlt />,
  maintenance: <FaWrench />,
  'graphics-design': <FaPalette />,
  'online-applications': <FaFileAlt />,
};

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);

  const chooseService = (service) => {
    window.dispatchEvent(
      new CustomEvent('portfolio:select-service', {
        detail: { serviceId: service.id },
      })
    );
    window.location.hash = 'contact';
    setSelectedService(null);
  };

  return (
    <>
      <section className="section" id="services">
        <div className="shell">
        <div className="section-heading">
          <p className="eyebrow">Services</p>
          <h2>Choose the service you want for your business</h2>
          <p>
            Click any service below to open a popup, review what is included, and choose the work
            you want before sending your request.
          </p>
        </div>

        <div className="service-grid">
          {serviceOptions.map((service) => (
            <button
              className="service-card service-trigger"
              key={service.id}
              type="button"
              onClick={() => setSelectedService(service)}
            >
              <div className="service-card-head">
                <div className="service-card-icon-ring">
                  <div className="service-icon">{iconMap[service.id]}</div>
                </div>
              </div>
              <div className="service-card-body">
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-description">{service.description}</p>
                <p className="service-card-includes">
                  Includes: {service.deliverables.join(', ')}
                </p>
              </div>
              <span className="service-trigger-text">
                Tap to choose <FaArrowRight />
              </span>
            </button>
          ))}
        </div>

        <div className="cta-panel">
          <div>
            <p className="eyebrow">Need ongoing support?</p>
            <h3>I also take on maintenance work for existing products.</h3>
            <p>
              If your current website or app needs fixes, improvements, or a steadier development
              partner, we can work from what you already have.
            </p>
          </div>
          <a className="button button-secondary" href="#contact">
            Request a service <FaArrowRight />
          </a>
        </div>
        </div>
      </section>

      {selectedService && (
        <div className="service-modal-backdrop" onClick={() => setSelectedService(null)} role="presentation">
          <div
            className="service-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            <button
              className="service-modal-close"
              type="button"
              onClick={() => setSelectedService(null)}
              aria-label="Close service details"
            >
              <FaTimes />
            </button>
            <div className="service-icon service-icon-large">{iconMap[selectedService.id]}</div>
            <p className="eyebrow">Selected service</p>
            <h3 id="service-modal-title">{selectedService.title}</h3>
            <p className="service-modal-copy">{selectedService.description}</p>
            <div className="service-modal-list">
              {selectedService.deliverables.map((item) => (
                <span key={item} className="tag tag-strong">
                  {item}
                </span>
              ))}
            </div>
            <button className="button" type="button" onClick={() => chooseService(selectedService)}>
              Choose This Service <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Services;
