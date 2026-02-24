const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getComplaintByTicketId,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { complaintLimiter } = require('../middleware/rateLimiter');

// Public: track by CIV-YYYY-XXXX Ticket ID
router.get('/track/:ticketId', getComplaintByTicketId);

// Private: submit and view my complaints
router.post('/', complaintLimiter, protect, upload.single('evidence'), createComplaint);
router.get('/my', protect, getMyComplaints);

module.exports = router;
