const { pool } = require('../CONFIG/db');
const generateToken = require('../UTILS/generateToken');
const { hashPassword, comparePassword } = require('../UTILS/hashPassword');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'amostangawizi800@gmail.com').trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user.id,
  fullname: user.fullname,
  email: user.email,
  role: user.email?.trim().toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user',
  created_at: user.created_at,
});

const createUser = async ({ fullname, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [
    normalizedEmail,
  ]);

  if (existingUser.rowCount > 0) {
    return { error: 'Email already registered' };
  }

  const hashedPassword = await hashPassword(password);
  const userRole = normalizedEmail === ADMIN_EMAIL ? 'admin' : 'user';
  const { rows } = await pool.query(
    `
      INSERT INTO users (fullname, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, fullname, email, role, created_at
    `,
    [fullname.trim(), normalizedEmail, hashedPassword, userRole]
  );

  return { user: sanitizeUser(rows[0]) };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
    normalizedEmail,
  ]);
  const user = rows[0];

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    return { error: 'Invalid email or password' };
  }

  const token = generateToken();
  await pool.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [token, user.id]);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const getUserByToken = async (token) => {
  const { rows } = await pool.query(
    `
      SELECT u.id, u.fullname, u.email, u.role, u.created_at
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token = $1
      LIMIT 1
    `,
    [token]
  );

  return rows[0] ? sanitizeUser(rows[0]) : null;
};

const deleteSession = async (token) => {
  if (!token) {
    return;
  }

  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

const countUsers = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  return rows[0]?.count || 0;
};

module.exports = {
  createUser,
  loginUser,
  getUserByToken,
  deleteSession,
  countUsers,
};
