// routes/admin.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/adminController');
const { authenticate, authorize, requireRole } = require('../middleware/auth');
const { asyncHandler }                         = require('../middleware/errorHandler');

router.use(authenticate);

// Notifications — any logged-in user can see their own
router.get('/notifications',              asyncHandler(ctrl.getNotifications));
router.patch('/notifications/:id/read',   asyncHandler(ctrl.markNotificationRead));

// Admin-only routes below
router.use(requireRole('Administrator'));

router.get('/users',                      asyncHandler(ctrl.getAllUsers));           // v_user_roles view
router.get('/users/:id',                  asyncHandler(ctrl.getUserById));
router.patch('/users/:id/status',         asyncHandler(ctrl.updateUserStatus));

router.get('/roles',                      asyncHandler(ctrl.getRoles));
router.get('/audit-logs',                 authorize('VIEW_AUDIT_LOG'), asyncHandler(ctrl.getAuditLogs));
router.get('/mis-report',                 asyncHandler(ctrl.getMISReport));

module.exports = router;
