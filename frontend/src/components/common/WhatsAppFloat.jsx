import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { portfolioProfile } from '../../data/portfolioData';

const WhatsAppFloat = () => {
  const whatsappNumber = `255${portfolioProfile.whatsapp.replace(/^0/, '')}`;

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat on WhatsApp at ${portfolioProfile.whatsapp}`}
      title="Chat on WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
};

export default WhatsAppFloat;
