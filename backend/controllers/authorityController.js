const Complaint = require('../models/Complaint');

const VALID_STATUSES = ['Under Review', 'Investigating', 'Action Taken', 'Resolved', 'Rejected'];

// Fields that admin is ALLOWED to see (strict whitelist — no PNR)
const ADMIN_SELECT = 'ticketId sourceStation destinationStation evidence complaintCategory complaintDegree complaintCategoryOther status statusHistory remarks createdAt type isAnonymous anonymousAlias';

// @desc    List all complaints (filtered by status / search by ticketId)
// @route   GET /api/authority/complaints
// @access  Private (admin)
exports.listComplaints = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const query = {};

        // Role-based type filter
        if (req.user.role === 'railway_admin') {
            query.type = 'railway';
        } else if (req.user.role === 'traffic_admin') {
            query.type = 'traffic';
        }

        if (status && VALID_STATUSES.includes(status)) query.status = status;
        if (search) {
            query.ticketId = { $regex: search.toUpperCase(), $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [complaints, total] = await Promise.all([
            Complaint.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select(ADMIN_SELECT),
            Complaint.countDocuments(query),
        ]);

        res.json({ success: true, total, page: parseInt(page), complaints });
    } catch (err) {
        console.error('listComplaints error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Get single complaint detail (for authority) — no PNR ever
// @route   GET /api/authority/complaints/:id
// @access  Private (admin)
exports.getComplaintDetail = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .select(ADMIN_SELECT + ' remarks')
            .populate('remarks.addedBy', 'name role');
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }
        res.json({ success: true, complaint });
    } catch (err) {
        console.error('getComplaintDetail error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Update complaint status + optional remark (by Mongo _id)
// @route   PATCH /api/authority/complaints/:id/status
// @access  Private (admin)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, remark } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }

        complaint.status = status;
        complaint.statusHistory.push({ status, changedBy: req.user._id, remark: remark || '' });

        if (remark) {
            complaint.remarks.push({ text: remark, addedBy: req.user._id });
        }

        await complaint.save();

        res.json({
            success: true,
            message: 'Status updated.',
            ticketId: complaint.ticketId,
            status: complaint.status,
        });
    } catch (err) {
        console.error('updateComplaintStatus error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Update complaint status by CIV Ticket ID
// @route   PUT /api/reports/update-status/:ticketId
// @access  Private (admin)
exports.updateStatusByTicketId = async (req, res) => {
    try {
        const { status, remark } = req.body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing status value.' });
        }

        const complaint = await Complaint.findOne({ ticketId: req.params.ticketId });
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }

        complaint.status = status;
        complaint.statusHistory.push({ status, changedBy: req.user._id, remark: remark || '' });

        if (remark) {
            complaint.remarks.push({ text: remark, addedBy: req.user._id });
        }

        await complaint.save();

        res.json({
            success: true,
            message: 'Status updated successfully.',
            ticketId: complaint.ticketId,
            status: complaint.status,
        });
    } catch (err) {
        console.error('updateStatusByTicketId error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Analytics summary
// @route   GET /api/authority/analytics
// @access  Private (admin)
exports.getAnalytics = async (req, res) => {
    try {
        const typeFilter =
            req.user.role === 'traffic_admin'
                ? { type: 'traffic' }
                : req.user.role === 'railway_admin'
                    ? { type: 'railway' }
                    : {};

        const [total, underReview, investigating, actionTaken, resolved, rejected] =
            await Promise.all([
                Complaint.countDocuments(typeFilter),
                Complaint.countDocuments({ ...typeFilter, status: 'Under Review' }),
                Complaint.countDocuments({ ...typeFilter, status: 'Investigating' }),
                Complaint.countDocuments({ ...typeFilter, status: 'Action Taken' }),
                Complaint.countDocuments({ ...typeFilter, status: 'Resolved' }),
                Complaint.countDocuments({ ...typeFilter, status: 'Rejected' }),
            ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTrend = await Complaint.aggregate([
            { $match: { ...typeFilter, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            stats: { total, underReview, investigating, actionTaken, resolved, rejected },
            dailyTrend,
        });
    } catch (err) {
        console.error('getAnalytics error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
