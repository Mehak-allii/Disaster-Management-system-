// routes/resources.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler }            = require('../middleware/errorHandler');

router.use(authenticate);

// Anyone logged in can view resources and warehouses
router.get('/',                asyncHandler(ctrl.getAllResources));
router.get('/inventory',       asyncHandler(ctrl.getInventory));
router.get('/low-stock',       asyncHandler(ctrl.getLowStockAlerts));        // v_low_stock_alerts view
router.get('/warehouses',      asyncHandler(ctrl.getWarehouses));
router.get('/requests',        asyncHandler(ctrl.getResourceRequests));

// Field Officers can submit requests
router.post('/requests',       authorize('SUBMIT_REPORT'),        asyncHandler(ctrl.createResourceRequest));

// Warehouse Managers can update inventory and allocate
router.patch('/inventory',     authorize('MANAGE_INVENTORY'),     asyncHandler(ctrl.updateInventory));
router.post('/allocate',       authorize('APPROVE_RESOURCE_REQ'), asyncHandler(ctrl.allocateResource));

module.exports = router;
