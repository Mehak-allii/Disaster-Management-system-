// server.js
// ─────────────────────────────────────────────────────────────
// Smart Disaster Response MIS — Express Server
// Entry point: loads env, connects DB, registers all routes.
// ─────────────────────────────────────────────────────────────

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const { getPool }        = require('./config/db');
const { errorHandler }   = require('./middleware/errorHandler');

// ── Route imports ─────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const rescueRoutes    = require('./routes/rescue');
const resourceRoutes  = require('./routes/resources');
const hospitalRoutes  = require('./routes/hospitals');
const financeRoutes   = require('./routes/finance');
const approvalRoutes  = require('./routes/approvals');
const adminRoutes     = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ───────────────────────────────────────
app.use(helmet());                         // Sets secure HTTP headers
app.use(cors({
  origin: 'http://localhost:3000',         // React dev server
  credentials: true,
}));

// ── Rate limiting — prevents brute-force on login ────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,               // 15 minutes
  max:      20,
  message:  { success: false, message: 'Too many requests. Try again in 15 minutes.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  message:  { success: false, message: 'Too many requests.' },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api',            generalLimiter);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend
app.use(express.static(path.join(__dirname, 'public')));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Disaster MIS API is running', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/emergency',  emergencyRoutes);
app.use('/api/rescue',     rescueRoutes);
app.use('/api/resources',  resourceRoutes);
app.use('/api/hospitals',  hospitalRoutes);
app.use('/api/finance',    financeRoutes);
app.use('/api/approvals',  approvalRoutes);
app.use('/api/admin',      adminRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const startServer = async () => {
  try {
    await getPool();                       // Test DB connection on startup
    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║   Smart Disaster Response MIS — API Server   ║');
      console.log(`║   Running on http://localhost:${PORT}            ║`);
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
      console.log('  Routes registered:');
      console.log('  POST   /api/auth/login');
      console.log('  GET    /api/emergency');
      console.log('  GET    /api/emergency/active-dashboard');
      console.log('  POST   /api/rescue/assign');
      console.log('  GET    /api/resources/low-stock');
      console.log('  POST   /api/resources/allocate');
      console.log('  GET    /api/hospitals');
      console.log('  POST   /api/hospitals/admit');
      console.log('  POST   /api/finance/donation');
      console.log('  PATCH  /api/approvals/:id/approve');
      console.log('  GET    /api/admin/mis-report');
      console.log('  GET    /api/admin/audit-logs');
      console.log('');
    });
  } catch (err) {
    console.error('❌  Failed to connect to SQL Server:', err.message);
    console.error('    Check your .env file — DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD');
    process.exit(1);
  }
};

startServer();
