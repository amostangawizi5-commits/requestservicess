const { createUser, loginUser, deleteSession } = require('../MODELS/User');
const { setAuthCookie, clearAuthCookie, getTokenFromRequest } = require('../UTILS/authCookies');

const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullname, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const result = await createUser({ fullname, email, password });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const loginResult = await loginUser({ email, password });
    setAuthCookie(res, loginResult.token);

    return res.status(201).json({
      success: true,
      token: loginResult.token,
      user: loginResult.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const result = await loginUser({ email, password });

    if (result.error) {
      return res.status(401).json({
        success: false,
        message: result.error,
      });
    }

    setAuthCookie(res, result.token);

    return res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

const me = (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

const logout = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    await deleteSession(token);
    clearAuthCookie(res);

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    clearAuthCookie(res);

    return res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

module.exports = {
  register,
  login,
  me,
  logout,
};
