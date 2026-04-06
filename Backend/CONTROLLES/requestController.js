const { createRequest, getAllRequests } = require('../MODELS/Request');

const listRequests = async (req, res) => {
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

const addRequest = async (req, res) => {
  const { name, email, phone, serviceType, message } = req.body;

  if (!name || !email || !phone || !serviceType || !message) {
    return res.status(400).json({
      success: false,
      message: 'name, email, phone, serviceType, and message are required',
    });
  }

  try {
    const request = await createRequest(req.body, req.user || null);

    return res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      request,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create service request',
    });
  }
};

module.exports = {
  listRequests,
  addRequest,
};
