module.exports = {
  // Tell Jest this is a Node.js environment (not a browser)
  testEnvironment: 'node',
  
  // Where to find test files - any file ending in .test.js
  testMatch: ['**/__tests__/**/*.test.js'],
  
  // Run this file before each test suite to set up database
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Don't transform node_modules (faster tests)
  transformIgnorePatterns: ['node_modules/'],
  
  // Show test coverage when running tests
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    '!node_modules/**'
  ],
  
  // Timeout for each test (30 seconds - MongoDB Memory Server needs time to start)
  testTimeout: 30000,
  
  // Clear mocks between tests to avoid conflicts
  clearMocks: true,
  
  // Verbose output to see what's happening
  verbose: true
};
