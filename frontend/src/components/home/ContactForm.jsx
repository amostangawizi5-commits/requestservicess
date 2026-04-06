import React, { useEffect, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { portfolioProfile, serviceOptions } from '../../data/portfolioData';
import { submitServiceRequest } from '../../services/portfolio';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: 'website',
    budget: '',
    timeline: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleServiceSelection = (event) => {
      const serviceId = event.detail?.serviceId;

      if (!serviceOptions.some((service) => service.id === serviceId)) {
        return;
      }

      setFormData((current) => ({
        ...current,
        serviceType: serviceId,
      }));
      setStatus({
        type: 'success',
        message: 'Selected service updated. You can now finish the request form below.',
      });
    };

    window.addEventListener('portfolio:select-service', handleServiceSelection);
    return () => window.removeEventListener('portfolio:select-service', handleServiceSelection);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await submitServiceRequest(formData);
      setStatus({
        type: 'success',
        message: 'Your service request was sent successfully.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        serviceType: 'website',
        budget: '',
        timeline: '',
        message: '',
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to send request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section section-alt" id="contact">
      <div className="shell">
        <div className="section-heading">
          <p className="eyebrow">Request a service</p>
          <h2>Tell me what you want to build or maintain</h2>
          <p>
            Share your project idea, current product challenges, or support needs and I will have a
            clear starting point for the conversation.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-sidebar">
            <article className="contact-side-card">
              <p className="eyebrow">Direct contact</p>
              <h3>Email & WhatsApp</h3>
              <div className="contact-link-group">
                <a href={`mailto:${portfolioProfile.email}`}>{portfolioProfile.email}</a>
                <a
                  href={`https://wa.me/255${portfolioProfile.whatsapp.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp: {portfolioProfile.whatsapp}
                </a>
              </div>
            </article>
            <article className="contact-side-card">
              <p className="eyebrow">Project types</p>
              <ul className="service-list service-list-compact">
                {serviceOptions.map((service) => (
                  <li key={service.id}>{service.title}</li>
                ))}
              </ul>
            </article>
          </div>

          <form className="request-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field">
                <span>Phone Number</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Example: 0626992627"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field">
                <span>Company or brand</span>
                <input
                  type="text"
                  name="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </label>
              <label className="field">
                <span>Service needed</span>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Budget</span>
                <input
                  type="text"
                  name="budget"
                  placeholder="Example: $800 - $2,000"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </label>
              <label className="field">
                <span>Timeline</span>
                <input
                  type="text"
                  name="timeline"
                  placeholder="Example: 3 weeks"
                  value={formData.timeline}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="field">
              <span>Project details</span>
              <textarea
                name="message"
                rows="6"
                placeholder="Describe the website, mobile app, or maintenance work you need."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </label>

            {status.message && <div className={`status-message ${status.type}`}>{status.message}</div>}

            <button type="submit" className="button submit-button" disabled={loading}>
              <FaPaperPlane /> {loading ? 'Sending request...' : 'Send request'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
