import React from 'react';
import { aboutCompany, portfolioProfile } from '../../data/portfolioData';

const About = () => {
  return (
    <section className="section section-alt" id="about">
      <div className="shell">
        <div className="two-column-grid about-grid">
          <div className="section-heading section-heading-left">
            <p className="eyebrow">{aboutCompany.eyebrow}</p>
            <h2>{aboutCompany.title}</h2>
            <p>{aboutCompany.description}</p>
            <p>{aboutCompany.mission}</p>
          </div>

          <div className="about-panel">
            <article className="about-card about-card-feature">
              <p className="hero-card-label">Company</p>
              <h3>{portfolioProfile.companyName}</h3>
              <p>
                Based in {portfolioProfile.location}, {portfolioProfile.companyName} helps clients
                move from idea to launch and ongoing product support with practical development
                work.
              </p>
            </article>

            <div className="about-highlights">
              {aboutCompany.highlights.map((item) => (
                <article className="about-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
