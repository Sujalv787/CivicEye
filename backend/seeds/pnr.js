/**
 * Seed script — inserts sample PNR records into MongoDB.
 * Run:  node seeds/pnr.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const PNR = require('../models/PNR');
const connectDB = require('../config/db');

const samplePNRs = [
    {
        pnr: '1234567890',
        source: 'Delhi',
        destination: 'Mumbai',
        travelDate: new Date('2026-02-21'),
        valid: true,
    },
    {
        pnr: '9876543210',
        source: 'Chennai',
        destination: 'Bangalore',
        travelDate: new Date('2026-02-20'),
        valid: true,
    },
    {
        pnr: '1111111111',
        source: 'Kolkata',
        destination: 'Patna',
        travelDate: new Date('2026-02-19'),
        valid: true,
    },
    {
        pnr: '2222222222',
        source: 'Lucknow',
        destination: 'Varanasi',
        travelDate: new Date('2026-02-18'),
        valid: true,
    },
    {
        pnr: '3333333333',
        source: 'Jaipur',
        destination: 'Ahmedabad',
        travelDate: new Date('2026-02-17'),
        valid: false, // expired / invalid example
    },
    {
        pnr: '4444444444',
        source: 'Hyderabad',
        destination: 'Pune',
        travelDate: new Date('2026-02-22'),
        valid: true,
    },
    {
        pnr: '5555555555',
        source: 'Mumbai',
        destination: 'Goa',
        travelDate: new Date('2026-02-23'),
        valid: true,
    },
];

async function seed() {
    await connectDB();
    console.log('🌱  Seeding PNR collection…');
    await PNR.deleteMany({});
    const inserted = await PNR.insertMany(samplePNRs);
    console.log(`✅  ${inserted.length} PNR records inserted.`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
});
