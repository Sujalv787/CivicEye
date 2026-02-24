const express = require('express');
const router = express.Router();
const { createComplaint, getComplaintByTrackingId } = require('../controllers/complaintController');
const { updateStatusByTrackingId } = require('../controllers/authorityController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { complaintLimiter } = require('../middleware/rateLimiter');

// POST /api/reports/create — submit a new report (citizen)
router.post('/create', complaintLimiter, protect, upload.single('evidence'), createComplaint);

// PUT /api/reports/update-status/:trackingId — admin updates status by tracking ID
router.put('/update-status/:trackingId', protect, authorize('traffic_admin', 'railway_admin'), updateStatusByTrackingId);

// GET /api/reports/track/:trackingId — public tracking
router.get('/track/:trackingId', getComplaintByTrackingId);

module.exports = router;
