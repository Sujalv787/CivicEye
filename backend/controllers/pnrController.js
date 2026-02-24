const PNR = require('../models/PNR');

// @desc    Verify a PNR number against the manual DB
// @route   POST /api/pnr/verify
// @access  Private (citizen)
exports.verifyPNR = async (req, res) => {
    try {
        const { pnr } = req.body;

        // ── Validation ────────────────────────────────────────────────
        if (!pnr || !/^\d{10}$/.test(pnr)) {
            return res.status(400).json({
                success: false,
                verified: false,
                message: 'PNR must be exactly 10 digits.',
            });
        }

        // ── Lookup in DB ──────────────────────────────────────────────
        const record = await PNR.findOne({ pnr });

        if (!record) {
            return res.status(404).json({
                success: false,
                verified: false,
                message: 'PNR not found in the system. Please check and try again.',
            });
        }

        if (!record.valid) {
            return res.status(200).json({
                success: true,
                verified: false,
                message: 'PNR found but marked as invalid/expired.',
            });
        }

        // PNR exists and is valid — return verification without exposing PNR details
        return res.status(200).json({
            success: true,
            verified: true,
            message: 'PNR verified successfully.',
            // Return source/destination so frontend can auto-fill (optional UX improvement)
            source: record.source,
            destination: record.destination,
            travelDate: record.travelDate,
        });
    } catch (err) {
        console.error('PNR verification error:', err);
        return res.status(500).json({
            success: false,
            verified: false,
            message: 'Server error during PNR verification.',
        });
    }
};
