// routes/emergency.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/emergencyController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler }            = require('../middleware/errorHandler');

// All routes require login
router.use(authenticate);

router.get('/',                asyncHandler(ctrl.getAllReports));          // Operator sees all; Field Officer sees own
router.get('/active-dashboard',asyncHandler(ctrl.getActiveDashboard));    // v_active_emergencies view
router.get('/stats',           asyncHandler(ctrl.getStats));              // MIS analytics
router.get('/disaster-types',  asyncHandler(ctrl.getDisasterTypes));
router.get('/:id',             asyncHandler(ctrl.getReportById));

// Field Officers can submit; Operators & Admins can update status
router.post('/',               authorize('SUBMIT_REPORT'),         asyncHandler(ctrl.createReport));
router.patch('/:id/status',    authorize('VIEW_ALL_REPORTS'),      asyncHandler(ctrl.updateReportStatus));

module.exports = router;
