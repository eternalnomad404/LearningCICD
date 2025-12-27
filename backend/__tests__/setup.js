const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to in-memory MongoDB before ALL tests run
 * Why: Tests need a real database, but we don't want to touch production
 * MongoDB Memory Server creates a temporary database that disappears after tests
 */
beforeAll(async () => {
  try {
    // Disconnect any existing connections (in case server.js already connected)
    await mongoose.disconnect();
    
    // Create in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    console.log('✓ Test database connected');
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
});

/**
 * Clear all data between tests
 * Why: Each test should start fresh, not depend on previous test data
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * Cleanup after ALL tests finish
 * Why: Close connections and stop the in-memory server to free resources
 */
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('✓ Test database disconnected');
});
