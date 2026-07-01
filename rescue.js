// routes/rescue.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/rescueController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler }            = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/teams',                       asyncHandler(ctrl.getAllTeams));
router.get('/nearest/:reportId',           asyncHandler(ctrl.getNearestTeams));
router.get('/history/:teamId',             asyncHandler(ctrl.getTeamHistory));

// Only Operators and Admins can assign teams
router.post('/assign',                     authorize('ASSIGN_TEAM'), asyncHandler(ctrl.assignTeam));
router.patch('/assignment/:id/status',     authorize('ASSIGN_TEAM'), asyncHandler(ctrl.updateAssignmentStatus));

module.exports = router;
