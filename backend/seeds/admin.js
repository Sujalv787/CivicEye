const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civiceye';

const DEMO_ADMIN = {
    email: 'demo@civiceye.com',
    name: 'Demo Admin',
    role: 'railway_admin',
    isVerified: true,
    authProvider: 'local',
};
const DEMO_PASSWORD = 'demo1234';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const User = require('../models/User');
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(DEMO_PASSWORD, salt);

    const result = await User.findOneAndUpdate(
        { email: DEMO_ADMIN.email },
        { ...DEMO_ADMIN, password: hashed },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Demo admin ready: ${result.email} (${result.role})`);
    await mongoose.disconnect();
    console.log('Done.');
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
