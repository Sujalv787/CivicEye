const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  // If MONGO_URI points to localhost and we can't reach it, fall back to in-memory MongoDB
  const isLocalhost = uri && (uri.includes('localhost') || uri.includes('127.0.0.1'));

  if (isLocalhost) {
    // Try to connect to local MongoDB first
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️  Local MongoDB unavailable (${err.message})`);
      console.log('📦  Falling back to in-memory MongoDB (data will not persist across restarts)...');
    }

    // Fall back to in-memory MongoDB
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅  In-memory MongoDB started successfully.');
      console.log('');
      console.log('💡  NOTE: Data is stored in-memory and will be lost on server restart.');
      console.log('    To persist data, install MongoDB locally or use MongoDB Atlas.');
      console.log('    Set MONGO_URI in .env to a real MongoDB connection string.');
      console.log('');
    } catch (memErr) {
      console.error(`❌  Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  } else {
    // Non-localhost URI (Atlas etc.) — connect directly
    try {
      await mongoose.connect(uri);
      console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
    } catch (err) {
      console.error(`❌  MongoDB connection error: ${err.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
