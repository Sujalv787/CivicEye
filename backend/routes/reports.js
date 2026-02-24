const express = require('express');
const router = express.Router();
const { createComplaint, getComplaintByTicketId } = require('../controllers/complaintController');
const { updateStatusByTicketId } = require('../controllers/authorityController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { complaintLimiter } = require('../middleware/rateLimiter');

// POST /api/reports/create — submit a new report (citizen)
router.post('/create', complaintLimiter, protect, upload.single('evidence'), createComplaint);

// PUT /api/reports/update-status/:ticketId — admin updates status by Ticket ID
router.put('/update-status/:ticketId', protect, authorize('traffic_admin', 'railway_admin'), updateStatusByTicketId);

// GET /api/reports/track/:ticketId — public tracking
router.get('/track/:ticketId', getComplaintByTicketId);

module.exports = router;
