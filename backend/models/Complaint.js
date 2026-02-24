const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ['Under Review', 'Investigating', 'Action Taken', 'Resolved', 'Rejected'],
        },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remark: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

/**
 * Generates a unique CIV-YYYY-XXXX Ticket ID.
 * Checks DB to ensure no collision.
 */
async function generateUniqueTicketId() {
    const Complaint = mongoose.model('Complaint');
    const year = new Date().getFullYear();
    let attempts = 0;
    while (attempts < 20) {
        const rand = String(Math.floor(1000 + Math.random() * 9000));
        const ticketId = `CIV-${year}-${rand}`;
        const exists = await Complaint.findOne({ ticketId }).lean();
        if (!exists) return ticketId;
        attempts++;
    }
    // Fallback: use timestamp-based suffix for guaranteed uniqueness
    const ts = Date.now().toString(36).slice(-4).toUpperCase();
    return `CIV-${year}-${ts}`;
}

const ComplaintSchema = new mongoose.Schema(
    {
        // ── Ticket ID ──
        ticketId: {
            type: String,
            unique: true,
        },

        // ── Railway Q&A fields ──
        reporterName: { type: String, default: '' },
        sourceStation: { type: String, default: '' },
        destinationStation: { type: String, default: '' },
        dateOfTravel: { type: Date, default: null },
        timeOfIncident: { type: String, default: '' },
        complaintCategory: {
            type: String,
            enum: ['Overcharging', 'Misbehavior', 'Hygiene Issue', 'Other', ''],
            default: '',
        },
        complaintCategoryOther: { type: String, default: '' },
        complaintDegree: {
            type: String,
            enum: ['Minor', 'Moderate', 'Serious', ''],
            default: '',
        },

        // ── PNR – never stored, only verification result ──
        pnrVerified: { type: Boolean, default: false },

        // ── Evidence ──
        evidence: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' },
            mimetype: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
        },

        // ── Status ──
        status: {
            type: String,
            enum: ['Under Review', 'Investigating', 'Action Taken', 'Resolved', 'Rejected'],
            default: 'Under Review',
        },
        statusHistory: [StatusHistorySchema],

        remarks: [
            {
                text: String,
                addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                createdAt: { type: Date, default: Date.now },
            },
        ],

        // ── Submitter ──
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        isAnonymous: { type: Boolean, default: false },
        anonymousAlias: { type: String, default: '' },

        // ── Legacy / compat fields ──
        type: {
            type: String,
            enum: ['traffic', 'railway', ''],
            default: 'railway',
        },
        subCategory: { type: String, default: '' },
        description: { type: String, default: '' },
        location: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            address: { type: String, default: '' },
        },
        incidentDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Generate unique ticketId + push initial status before save
ComplaintSchema.pre('save', async function () {
    if (this.isNew) {
        if (!this.ticketId) {
            this.ticketId = await generateUniqueTicketId();
        }
        this.statusHistory.push({ status: this.status });
    }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
