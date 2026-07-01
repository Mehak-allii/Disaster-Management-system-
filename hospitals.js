// routes/hospitals.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/hospitalController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler }            = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/',                        asyncHandler(ctrl.getAllHospitals));          // v_hospital_capacity view
router.get('/best-available',          asyncHandler(ctrl.getBestHospital));
router.get('/:id/patients',            asyncHandler(ctrl.getHospitalPatients));

// Operators and Admins manage patients
router.post('/admit',                  authorize('ASSIGN_TEAM'),        asyncHandler(ctrl.admitPatient));
router.patch('/patient/:id/status',    authorize('VIEW_ALL_REPORTS'),   asyncHandler(ctrl.updatePatientStatus));

module.exports = router;
