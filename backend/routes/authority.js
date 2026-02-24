const express = require('express');
const router = express.Router();
const {
    listComplaints,
    getComplaintDetail,
    updateComplaintStatus,
    updateStatusByTrackingId,
    getAnalytics,
} = require('../controllers/authorityController');
const { protect, authorize } = require('../middleware/auth');

const adminGuard = [protect, authorize('traffic_admin', 'railway_admin')];

router.get('/complaints', ...adminGuard, listComplaints);
router.get('/complaints/:id', ...adminGuard, getComplaintDetail);
router.patch('/complaints/:id/status', ...adminGuard, updateComplaintStatus);
router.get('/analytics', ...adminGuard, getAnalytics);

module.exports = router;
