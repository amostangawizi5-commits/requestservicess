import React from 'react';
import { skillGroups } from '../../data/portfolioData';

const Skills = () => {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-heading">
          <p className="eyebrow">Skills and stack</p>
          <h2>The technical range behind the project work</h2>
          <p>
            I work across interface design, application logic, APIs, and ongoing improvement so a
            product stays useful after the first release.
          </p>
        </div>

        <div className="skill-groups">
          {skillGroups.map((group) => (
            <article className="skill-group-card" key={group.title}>
              <h3>{group.title}</h3>
              <div className="tag-row">
                {group.items.map((item) => (
                  <span key={item} className="tag tag-strong">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
