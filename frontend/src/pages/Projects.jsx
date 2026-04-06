import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import { getProjects } from '../services/portfolio';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
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

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((project) => project.category === selectedCategory);
    }

    return filtered;
  }, [projects, searchTerm, selectedCategory]);

  const categories = ['all', ...new Set(projects.map((project) => project.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="projects-page">
        <div className="shell page-intro">
          <p className="eyebrow">Projects</p>
          <h1>Loading project work...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="shell page-intro">
        <p className="eyebrow">Projects</p>
        <h1>Completed work, product thinking, and build quality</h1>
        <p>
          Browse the kind of projects I can deliver for businesses, internal teams, and digital
          products that need steady engineering support.
        </p>
      </div>

      <div className="shell">
        <div className="project-filters">
          <div className="search-control">
            <FaSearch />
            <input
              type="text"
              placeholder="Search projects"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="project-grid">
          {filteredProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-image-wrap">
                <img src={project.image_url} alt={project.title} className="project-image" />
                {project.featured && <span className="pill">Featured</span>}
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

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <p>No projects matched your search. Try a different keyword or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
