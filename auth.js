// middleware/auth.js
// ─────────────────────────────────────────────────────────────
// Two middleware functions:
//   1. authenticate  – verifies JWT and attaches user + roles to req
//   2. authorize     – checks that the user holds a required permission
// ─────────────────────────────────────────────────────────────

const jwt        = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');

// ── 1. Verify JWT ─────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data + all their permissions from DB on every request
    // This ensures revoked roles take effect immediately
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .query(`
        SELECT
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.status,
          u.is_active,
          STRING_AGG(r.role_name,   '|') AS roles,
          STRING_AGG(p.permission_name, '|') AS permissions
        FROM [user] u
        JOIN user_role       ur ON u.user_id        = ur.user_id
        JOIN [role]          r  ON ur.role_id        = r.role_id
        JOIN role_permission rp ON r.role_id         = rp.role_id
        JOIN permission      p  ON rp.permission_id  = p.permission_id
        WHERE u.user_id   = @userId
          AND u.is_active = 1
          AND u.status    = 'active'
        GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.status, u.is_active
      `);

    if (!result.recordset.length)
      return res.status(401).json({ success: false, message: 'User not found or inactive' });

    const user = result.recordset[0];
    req.user = {
      userId:      user.user_id,
      firstName:   user.first_name,
      lastName:    user.last_name,
      email:       user.email,
      roles:       user.roles       ? [...new Set(user.roles.split('|'))]       : [],
      permissions: user.permissions ? [...new Set(user.permissions.split('|'))] : [],
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired' });
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ── 2. Check permission ───────────────────────────────────────
// Usage: authorize('ASSIGN_TEAM')  or  authorize('MANAGE_FINANCE')
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ success: false, message: 'Not authenticated' });

    // Admin always passes
    if (req.user.roles.includes('Administrator')) return next();

    const hasAll = requiredPermissions.every(p => req.user.permissions.includes(p));
    if (!hasAll)
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission(s): ${requiredPermissions.join(', ')}`,
      });

    next();
  };
};

// ── 3. Role-based check (alternative to permission) ───────────
// Usage: requireRole('Finance Officer', 'Administrator')
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ success: false, message: 'Not authenticated' });

    const hasRole = roles.some(r => req.user.roles.includes(r));
    if (!hasRole)
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });

    next();
  };
};

module.exports = { authenticate, authorize, requireRole };
