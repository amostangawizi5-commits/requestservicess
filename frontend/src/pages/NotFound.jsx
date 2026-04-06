import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="project-detail-page">
      <div className="shell page-intro">
        <p className="eyebrow">404</p>
        <h1>That page does not exist</h1>
        <p>The page you requested could not be found. You can return to the homepage or view the project work.</p>
        <div className="hero-actions">
          <Link className="button" to="/">
            Go home
          </Link>
          <Link className="button button-secondary" to="/projects">
            View projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
