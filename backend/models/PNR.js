const mongoose = require('mongoose');

const PNRSchema = new mongoose.Schema(
    {
        pnr: {
            type: String,
            required: [true, 'PNR number is required'],
            unique: true,
            match: [/^\d{10}$/, 'PNR must be exactly 10 digits'],
        },
        source: {
            type: String,
            required: [true, 'Source station is required'],
            trim: true,
        },
        destination: {
            type: String,
            required: [true, 'Destination station is required'],
            trim: true,
        },
        travelDate: {
            type: Date,
            required: [true, 'Travel date is required'],
        },
        valid: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PNR', PNRSchema);
