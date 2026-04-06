import api from './api';
import { featuredProjects } from '../data/portfolioData';

const normalizeProject = (project) => ({
  ...project,
  tech_stack: Array.isArray(project.tech_stack)
    ? project.tech_stack
    : typeof project.tech_stack === 'string'
      ? project.tech_stack
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
});

const getFallbackProjects = () => featuredProjects.map(normalizeProject);

export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    const projects = response?.data?.projects;

    if (!Array.isArray(projects) || projects.length === 0) {
      return getFallbackProjects();
    }

    return projects.map(normalizeProject);
  } catch (error) {
    return getFallbackProjects();
  }
};

export const getProjectBySlug = async (slug) => {
  const fallbackProject = getFallbackProjects().find((project) => project.slug === slug);

  try {
    const response = await api.get(`/projects/${slug}`);
    const project = response?.data?.project;

    return project ? normalizeProject(project) : fallbackProject || null;
  } catch (error) {
    return fallbackProject || null;
  }
};

export const submitServiceRequest = async (payload) => {
  try {
    const response = await api.post('/requests', payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send request';
    throw new Error(message);
  }
};
