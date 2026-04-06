const { countProjects } = require('../MODELS/Project');
const { countRequests, getRecentRequests, getRequests } = require('../MODELS/Request');

const getDashboardStats = async (req, res) => {
  try {
    const [projects, requests] = await Promise.all([
      countProjects(),
      countRequests(req.user.id),
    ]);

    return res.json({
      projects,
      requests,
      messages: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats',
    });
  }
};

const getRecentDashboardRequests = async (req, res) => {
  try {
    const requests = await getRecentRequests({ userId: req.user.id, limit: 5 });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load recent requests',
    });
  }
};

const getDashboardRequests = async (req, res) => {
  try {
    const requests = await getRequests({ userId: req.user.id });

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

module.exports = {
  getDashboardStats,
  getRecentDashboardRequests,
  getDashboardRequests,
};
