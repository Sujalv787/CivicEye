const mongoose = require('mongoose');

async function fixDB() {
    await mongoose.connect('mongodb://127.0.0.1:27017/civiceye');
    const db = mongoose.connection.db;

    try {
        await db.collection('complaints').dropIndex('trackingId_1');
        console.log("Dropped trackingId_1 index");
    } catch (e) {
        console.log("Index might not exist:", e.message);
    }

    try {
        await db.collection('complaints').updateMany({}, { $rename: { trackingId: "ticketId" } });
        console.log("Renamed trackingId field to ticketId in all existing docs");
    } catch (e) {
        console.log("Rename failed:", e.message);
    }

    process.exit(0);
}

fixDB();
