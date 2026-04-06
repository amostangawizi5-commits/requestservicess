import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { getProjectBySlug } from '../services/portfolio';

const ProjectDetails = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      const loadedProject = await getProjectBySlug(slug);
      setProject(loadedProject);
      setLoading(false);
    };

    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="shell page-intro">
          <p className="eyebrow">Project details</p>
          <h1>Loading case study...</h1>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="shell page-intro">
          <p className="eyebrow">Project details</p>
          <h1>Project not found</h1>
          <p>The case study you are looking for is not available.</p>
          <Link className="button button-secondary" to="/projects">
            <FaArrowLeft /> Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="shell page-intro">
        <Link className="back-link" to="/projects">
          <FaArrowLeft /> Back to projects
        </Link>
        <p className="eyebrow">Case study</p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
      </div>

      <div className="shell project-detail-grid">
        <div className="project-detail-main">
          <img src={project.image_url} alt={project.title} className="project-detail-image" />

          <section className="detail-card">
            <h2>The challenge</h2>
            <p>{project.challenge || project.description}</p>
          </section>

          <section className="detail-card">
            <h2>The solution</h2>
            <p>{project.solution || project.description}</p>
          </section>

          <section className="detail-card">
            <h2>Outcome</h2>
            <p>{project.impact || 'A structured product experience shaped around the client’s goals.'}</p>
          </section>
        </div>

        <aside className="project-detail-sidebar">
          <div className="detail-card">
            <h3>Project type</h3>
            <p>{project.category}</p>
          </div>
          <div className="detail-card">
            <h3>Stack</h3>
            <div className="tag-row">
              {project.tech_stack?.map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="detail-card">
            <h3>Links</h3>
            <div className="detail-links">
              {project.github_link && (
                <a href={project.github_link} target="_blank" rel="noreferrer">
                  <FaGithub /> Source code
                </a>
              )}
              {project.live_demo && (
                <a href={project.live_demo} target="_blank" rel="noreferrer">
                  <FaExternalLinkAlt /> Live demo
                </a>
              )}
              <a href="/#contact">
                <FaEnvelope /> Request similar work
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetails;
