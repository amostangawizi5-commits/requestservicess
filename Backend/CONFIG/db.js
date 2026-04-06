const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const sslEnabled = process.env.DB_SSL === 'true';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled
        ? {
            rejectUnauthorized: false,
          }
        : false,
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: sslEnabled
        ? {
            rejectUnauthorized: false,
          }
        : false,
    });

const ensureDatabaseSchema = async () => {
  const schemaPath = path.join(__dirname, 'database.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');

  if (!sql.trim()) {
    return;
  }

  await pool.query(sql);
};

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    console.log('📊 Database:', process.env.DB_NAME);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection, ensureDatabaseSchema };
