const { getAllProjects, getProjectBySlug } = require('../MODELS/Project');

const listProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();

    return res.json({
      success: true,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load projects',
    });
  }
};

const readProject = async (req, res) => {
  const project = await getProjectBySlug(req.params.slug);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  return res.json({
    success: true,
    project,
  });
};

module.exports = {
  listProjects,
  readProject,
};
