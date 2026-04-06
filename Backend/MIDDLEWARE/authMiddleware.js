const { getUserByToken } = require('../MODELS/User');
const { getTokenFromRequest } = require('../UTILS/authCookies');

const attachUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next();
    }

    const user = await getUserByToken(token);

    if (user) {
      req.user = user;
      req.authToken = token;
    }

    return next();
  } catch (error) {
    return next();
  }
};

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const user = await getUserByToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = user;
    req.authToken = token;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  return next();
};

module.exports = {
  protect,
  attachUser,
  adminOnly,
};
