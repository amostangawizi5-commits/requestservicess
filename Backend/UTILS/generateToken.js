const { randomUUID } = require('crypto');

const generateToken = () => randomUUID();

module.exports = generateToken;
