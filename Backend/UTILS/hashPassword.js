const { randomBytes, scryptSync, timingSafeEqual } = require('crypto');

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const comparePassword = async (password, storedPassword) => {
  const [salt, originalHash] = storedPassword.split(':');

  if (!salt || !originalHash) {
    return false;
  }

  const hashBuffer = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, 'hex');

  if (hashBuffer.length !== originalBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, originalBuffer);
};

module.exports = {
  hashPassword,
  comparePassword,
};
