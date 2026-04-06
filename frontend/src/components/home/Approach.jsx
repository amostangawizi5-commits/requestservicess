import React from 'react';
import { processSteps, workPrinciples } from '../../data/portfolioData';

const Approach = () => {
  return (
    <section className="section section-alt">
      <div className="shell">
        <div className="two-column-grid">
          <div className="section-heading section-heading-left">
            <p className="eyebrow">How I work</p>
            <h2>A practical process built for real client work</h2>
            <p>
              I keep projects grounded in clear communication, purposeful design, and stable
              implementation so the result is useful beyond launch day.
            </p>
            <div className="principles-list">
              {workPrinciples.map((principle) => (
                <article className="principle-card" key={principle.title}>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="process-card">
            {processSteps.map((step, index) => (
              <div className="process-step" key={step.title}>
                <div className="process-number">0{index + 1}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
