const express = require('express');
const { listRequests, addRequest } = require('../CONTROLLES/requestController');
const { attachUser, protect, adminOnly } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, listRequests);
router.post('/', attachUser, addRequest);

module.exports = router;
