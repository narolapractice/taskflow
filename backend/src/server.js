// ─────────────────────────────────────
// TaskFlow — server.js (Entry Point)
// ─────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes  = require('./routes/auth');
const taskRoutes  = require('./routes/tasks');
const boardRoutes = require('./routes/boards');
const userRoutes  = require('./routes/users');

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ──
app.use('/api/auth',   authRoutes);
app.use('/api/tasks',  taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/users',  userRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TaskFlow API is running', timestamp: new Date() });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── DB + Server Start ──
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Starting server without DB (demo mode)...');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} (no DB)`));
  });

module.exports = app;
