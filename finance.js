// routes/finance.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/financeController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler }            = require('../middleware/errorHandler');

router.use(authenticate);

// Finance Officers and Admins only
router.get('/transactions',    authorize('MANAGE_FINANCE'),  asyncHandler(ctrl.getTransactions));   // v_financial_summary view
router.get('/budget',          authorize('MANAGE_FINANCE'),  asyncHandler(ctrl.getBudget));
router.get('/summary',         authorize('MANAGE_FINANCE'),  asyncHandler(ctrl.getFinancialSummary));

router.post('/donation',       authorize('MANAGE_FINANCE'),  asyncHandler(ctrl.createDonation));
router.post('/expense',        authorize('MANAGE_FINANCE'),  asyncHandler(ctrl.createExpense));
router.post('/procurement',    authorize('MANAGE_FINANCE'),  asyncHandler(ctrl.createProcurement));

module.exports = router;
