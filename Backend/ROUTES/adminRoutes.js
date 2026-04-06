const express = require('express');
const {
  getAdminStats,
  getAdminRequests,
  changeRequestStatus,
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
} = require('../CONTROLLES/adminController');
const { protect, adminOnly } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/requests', getAdminRequests);
router.put('/requests/:id', changeRequestStatus);
router.get('/projects', getAdminProjects);
router.post('/projects', createAdminProject);
router.put('/projects/:id', updateAdminProject);
router.delete('/projects/:id', deleteAdminProject);

module.exports = router;
