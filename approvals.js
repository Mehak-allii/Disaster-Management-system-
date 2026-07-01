// routes/approvals.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/approvalController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler }            = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/',                     asyncHandler(ctrl.getAllApprovals));
router.get('/:id/history',          asyncHandler(ctrl.getApprovalHistory));

// Any logged-in user can submit for approval
router.post('/',                    asyncHandler(ctrl.submitApproval));

// Only Operators and Admins can approve or reject
router.patch('/:id/approve',        authorize('APPROVE_RESOURCE_REQ'),  asyncHandler(ctrl.approveRequest));
router.patch('/:id/reject',         authorize('APPROVE_RESOURCE_REQ'),  asyncHandler(ctrl.rejectRequest));

module.exports = router;
