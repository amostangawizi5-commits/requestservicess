import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { getProjects } from '../../services/portfolio';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section" id="projects">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Selected work</p>
            <h2>Recent projects and product work</h2>
          </div>
          <div className="loading-state">Loading projects...</div>
        </div>
      </section>
    );
  }

  const featured = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <section className="section" id="projects">
      <div className="shell">
        <div className="section-heading">
          <p className="eyebrow">Selected work</p>
          <h2>Proof that the work goes beyond a landing page</h2>
          <p>
            These projects show the kind of products I can design, build, and improve for real
            business needs.
          </p>
        </div>

        <div className="project-grid">
          {featured.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-image-wrap">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="project-image"
                />
                <span className="pill">{project.category}</span>
              </div>
              <div className="project-body">
                <h3>{project.title}</h3>
                <p>{project.short_description || project.description}</p>
                <div className="tag-row">
                  {project.tech_stack?.map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noreferrer">
                      <FaGithub /> Code
                    </a>
                  )}
                  {project.live_demo && (
                    <a href={project.live_demo} target="_blank" rel="noreferrer">
                      <FaExternalLinkAlt /> Live demo
                    </a>
                  )}
                  <Link to={`/projects/${project.slug}`}>Case study</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="section-actions">
          <Link to="/projects" className="button button-secondary">
            View all projects
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
