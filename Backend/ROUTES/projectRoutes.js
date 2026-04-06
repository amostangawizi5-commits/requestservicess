const express = require('express');
const { listProjects, readProject } = require('../CONTROLLES/projectController');

const router = express.Router();

router.get('/', listProjects);
router.get('/:slug', readProject);

module.exports = router;
