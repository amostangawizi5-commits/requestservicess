const { countUsers } = require('../MODELS/User');
const {
  countProjects,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../MODELS/Project');
const { getAllRequests, updateRequestWorkflow, countRequests } = require('../MODELS/Request');
const { ALLOWED_REQUEST_STATUSES } = require('../UTILS/requestWorkflow');

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getAdminStats = async (req, res) => {
  try {
    const [users, projects, requests] = await Promise.all([
      countUsers(),
      countProjects(),
      countRequests(),
    ]);

    return res.json({
      users,
      projects,
      requests,
      messages: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin stats',
    });
  }
};

const getAdminRequests = async (req, res) => {
  try {
    const requests = await getAllRequests();

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load requests',
    });
  }
};

const changeRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, progressNote, dueDate } = req.body;

  if (status && !ALLOWED_REQUEST_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request status',
    });
  }

  try {
    const request = await updateRequestWorkflow(id, {
      status,
      progressNote,
      dueDate,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    return res.json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update request status',
    });
  }
};

const getAdminProjects = async (req, res) => {
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

const createAdminProject = async (req, res) => {
  const payload = {
    ...req.body,
    slug: slugify(req.body.slug || req.body.title),
  };

  if (!payload.title || !payload.slug || !payload.description) {
    return res.status(400).json({
      success: false,
      message: 'title, slug, and description are required',
    });
  }

  try {
    const project = await createProject(payload);

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    const isDuplicateSlug = error.code === '23505';

    return res.status(isDuplicateSlug ? 400 : 500).json({
      success: false,
      message: isDuplicateSlug ? 'Project slug already exists' : 'Failed to create project',
    });
  }
};

const updateAdminProject = async (req, res) => {
  const payload = {
    ...req.body,
    slug: slugify(req.body.slug || req.body.title),
  };

  if (!payload.title || !payload.slug || !payload.description) {
    return res.status(400).json({
      success: false,
      message: 'title, slug, and description are required',
    });
  }

  try {
    const project = await updateProject(req.params.id, payload);

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
  } catch (error) {
    const isDuplicateSlug = error.code === '23505';

    return res.status(isDuplicateSlug ? 400 : 500).json({
      success: false,
      message: isDuplicateSlug ? 'Project slug already exists' : 'Failed to update project',
    });
  }
};

const deleteAdminProject = async (req, res) => {
  try {
    const project = await deleteProject(req.params.id);

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};

module.exports = {
  getAdminStats,
  getAdminRequests,
  changeRequestStatus,
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
};
