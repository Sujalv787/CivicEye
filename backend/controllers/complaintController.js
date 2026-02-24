const Complaint = require('../models/Complaint');

// @desc    Submit a new complaint (Q&A flow)
// @route   POST /api/complaints
// @access  Private (citizen)
exports.createComplaint = async (req, res) => {
    try {
        const {
            reporterName,
            sourceStation,
            destinationStation,
            dateOfTravel,
            timeOfIncident,
            complaintCategory,
            complaintCategoryOther,
            complaintDegree,
            pnrVerified,
            isAnonymous,
            // NOTE: PNR is intentionally NOT destructured — we never store it
        } = req.body;

        // ── Required-field validation ─────────────────────────────────
        const missing = [];
        if (!sourceStation || !sourceStation.trim()) missing.push('sourceStation');
        if (!destinationStation || !destinationStation.trim()) missing.push('destinationStation');
        if (!complaintCategory || !complaintCategory.trim()) missing.push('complaintCategory');
        if (!complaintDegree || !complaintDegree.trim()) missing.push('complaintDegree');

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(', ')}`,
            });
        }

        // ── Evidence ──────────────────────────────────────────────────
        let evidence = {};
        if (req.file) {
            const isLocal = !req.file.path.startsWith('http');
            const port = process.env.PORT || 5000;
            const fileUrl = isLocal
                ? `http://localhost:${port}/uploads/${req.file.filename}`
                : req.file.path;

            evidence = {
                url: fileUrl,
                publicId: req.file.filename || '',
                mimetype: req.file.mimetype,
                thumbnail: fileUrl,
            };
        }

        // ── Create complaint ──────────────────────────────────────────
        const complaint = await Complaint.create({
            reporterName: reporterName || '',
            sourceStation: sourceStation.trim(),
            destinationStation: destinationStation.trim(),
            dateOfTravel: dateOfTravel ? new Date(dateOfTravel) : null,
            timeOfIncident: timeOfIncident || '',
            complaintCategory: complaintCategory.trim(),
            complaintCategoryOther: complaintCategory === 'Other' ? (complaintCategoryOther || '') : '',
            complaintDegree: complaintDegree.trim(),
            pnrVerified: pnrVerified === true || pnrVerified === 'true',
            evidence,
            type: 'railway',
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
            anonymousAlias: (isAnonymous === 'true' || isAnonymous === true)
                ? `Citizen-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
                : '',
            submittedBy: (isAnonymous === 'true' || isAnonymous === true) ? null : (req.user ? req.user._id : null),
            incidentDate: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully.',
            ticketId: complaint.ticketId,
            complaint: sanitizeComplaint(complaint),
        });
    } catch (err) {
        console.error('createComplaint error:', err);
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
    }
};

// @desc    Get complaints submitted by the current user
// @route   GET /api/complaints/my
// @access  Private (citizen)
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ submittedBy: req.user._id })
            .sort({ createdAt: -1 })
            .select('-statusHistory -pnrVerified');
        res.json({ success: true, count: complaints.length, complaints });
    } catch (err) {
        console.error('getMyComplaints error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Get complaint by ticketId (public tracking — CIV-YYYY-XXXX)
// @route   GET /api/complaints/track/:ticketId
// @access  Public
exports.getComplaintByTicketId = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ ticketId: req.params.ticketId })
            .select('ticketId sourceStation destinationStation status complaintCategory complaintDegree createdAt statusHistory');
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }
        res.json({ success: true, complaint });
    } catch (err) {
        console.error('getComplaintByTicketId error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Helper — strip any sensitive fields before responding
function sanitizeComplaint(c) {
    const obj = c.toObject ? c.toObject() : { ...c };
    delete obj.pnrVerified;
    delete obj.submittedBy;
    delete obj.evidence?.publicId;
    return obj;
}
