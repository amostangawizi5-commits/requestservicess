const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, ensureDatabaseSchema } = require('./CONFIG/db');
const authRoutes = require('./ROUTES/authRoutes');
const projectRoutes = require('./ROUTES/projectRoutes');
const requestRoutes = require('./ROUTES/requestRoutes');
const adminRoutes = require('./ROUTES/adminRoutes');
const dashboardRoutes = require('./ROUTES/dashboardRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Ginger Portfolio API',
        database: process.env.DB_NAME
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start server
const startServer = async () => {
  const isConnected = await testConnection();

  if (isConnected) {
    await ensureDatabaseSchema();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });
};

startServer();
