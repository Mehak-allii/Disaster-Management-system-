// middleware/errorHandler.js
// ─────────────────────────────────────────────────────────────
// Global error handler + asyncHandler wrapper so we don't
// need try/catch in every controller function.
// ─────────────────────────────────────────────────────────────

// Wrap any async route handler — catches errors and passes to next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Central error handler — must be registered LAST in server.js
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // SQL Server specific error codes
  if (err.number === 2627 || err.number === 2601)
    return res.status(409).json({ success: false, message: 'Duplicate entry — record already exists.' });

  if (err.number === 547)
    return res.status(400).json({ success: false, message: 'Foreign key constraint failed.' });

  // Custom THROW from triggers/procedures
  if (err.number === 50001)
    return res.status(400).json({ success: false, message: err.message });

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { asyncHandler, errorHandler };
