const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/etl', require('./routes/etlRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo List API is running!',
    version: '2.0.0',
    pipeline: 'CI/CD Active - Docker Hub Integration',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const healthcheck = {
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };

  const httpCode = mongoose.connection.readyState === 1 ? 200 : 503;
  
  res.status(httpCode).json(healthcheck);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Export app WITHOUT starting server (so tests can control it)
module.exports = app;
