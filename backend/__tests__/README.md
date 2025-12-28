# Backend API Testing Setup

## What You Have

✅ **Jest** - Test framework,  
✅ **Supertest** - HTTP request testing without starting a server  
✅ **MongoDB Memory Server** - In-memory database that doesn't touch production  
✅ **18 practical tests** - Real-world scenarios, not toy examples  

---

## File Structure

```
backend/
├── __tests__/                    # All test files go here
│   ├── setup.js                  # Database setup/teardown (runs before/after tests)
│   └── tasks.test.js             # Task API tests
├── app.js                        # Express app WITHOUT server (for testing)
├── server.js                     # Server startup (connects DB, starts port)
├── jest.config.js                # Jest configuration
├── package.json                  # Test scripts added
└── .gitignore                    # Test artifacts ignored
```

---

## Why This Structure Works

### 1. **app.js vs server.js Split**
```javascript
// app.js - JUST the Express app
module.exports = app;  // Export, don't start server

// server.js - JUST the server
const app = require('./app');
app.listen(PORT);  // Start server
```
**Why:** Tests import `app.js` to test routes WITHOUT starting a real server. Your production code uses `server.js` normally.

### 2. **MongoDB Memory Server**
```javascript
// setup.js
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();  // Fake database
  await mongoose.connect(mongoServer.getUri());    // Connect to it
});
```
**Why:** 
- Tests run against a REAL MongoDB instance (not mocks)
- It's created in RAM (fast, doesn't touch disk)
- Automatically destroyed after tests (no cleanup needed)
- Safe: Production database is NEVER touched

### 3. **Database Cleanup Between Tests**
```javascript
afterEach(async () => {
  // Delete ALL data after each test
  await Task.deleteMany({});
});
```
**Why:** Each test starts with a clean database. Test order doesn't matter.

---

## How to Run Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

---

## What The Tests Cover

### ✅ **Happy Paths** (things that should work)
- Creating tasks with valid data
- Listing all tasks
- Getting a single task
- Updating tasks
- Deleting tasks

### ✅ **Error Cases** (things that should fail gracefully)
- Missing required fields (no title)
- Invalid data (title too long)
- Non-existent resources (404 errors)
- Malformed requests (bad JSON)
- Invalid MongoDB IDs

### ✅ **Real-World Scenarios**
- **Concurrent requests**: Multiple users creating tasks simultaneously
- **Concurrent updates**: Two users editing the same task
- **Database verification**: Tests check the database, not just API responses

---

## Test Example Explained

```javascript
it('should create a new task with valid data', async () => {
  // 1. Prepare test data
  const taskData = {
    title: 'Buy groceries',
    priority: 'High'
  };

  // 2. Make HTTP request to API (without starting real server)
  const response = await request(app)
    .post('/api/tasks')
    .send(taskData)
    .expect(201);  // Expect HTTP 201 Created

  // 3. Verify API response
  expect(response.body.success).toBe(true);
  expect(response.body.data.title).toBe('Buy groceries');

  // 4. Verify it's ACTUALLY in the database (not just API lying)
  const savedTask = await Task.findById(response.body.data._id);
  expect(savedTask).toBeTruthy();
});
```

**Key Points:**
- `request(app)` - Supertest makes HTTP requests to your app
- `.expect(201)` - Assert HTTP status code
- `await Task.findById()` - Verify database state directly
- No server needed - Tests are fast and isolated

---

## How It Works Under The Hood

### Test Execution Flow:
1. **beforeAll** (setup.js) → Create in-memory MongoDB
2. **Test 1** runs → Database has data
3. **afterEach** (setup.js) → Clean database
4. **Test 2** runs → Fresh database
5. **afterEach** → Clean database again
6. ... repeat for all tests ...
7. **afterAll** (setup.js) → Destroy in-memory MongoDB

### Why `--runInBand`?
```json
"test": "jest --runInBand"
```
Runs tests **one at a time** instead of parallel. Prevents database conflicts.

---

## Adding New Tests

### 1. Create a new test file in `__tests__/`
```javascript
// __tests__/users.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('User API', () => {
  it('should create a user', async () => {
    // Your test here
  });
});
```

### 2. Jest automatically finds files matching:
- `**/__tests__/**/*.test.js`
- `**/__tests__/**/*.spec.js`

### 3. Run tests:
```bash
npm test
```

---

## Common Patterns

### Testing POST requests
```javascript
const response = await request(app)
  .post('/api/tasks')
  .send({ title: 'New task' })
  .expect(201);
```

### Testing GET requests
```javascript
const response = await request(app)
  .get('/api/tasks')
  .expect(200);
```

### Testing with URL parameters
```javascript
const response = await request(app)
  .get(`/api/tasks/${taskId}`)
  .expect(200);
```

### Testing concurrent operations
```javascript
const promises = Array.from({ length: 10 }, (_, i) => 
  request(app).post('/api/tasks').send({ title: `Task ${i}` })
);
const responses = await Promise.all(promises);
```

---

## Troubleshooting

### Tests take too long?
- MongoDB Memory Server downloads binary on first run (normal)
- Subsequent runs are fast (binary is cached)

### "Cannot find module" errors?
```bash
npm install
```

### Tests fail with "Connection refused"?
- You're trying to connect to a real database
- Check that `setup.js` is running (it should show "✓ Test database connected")

### Port already in use?
- Tests DON'T start a server, so this shouldn't happen
- Make sure you're testing `app.js`, not `server.js`

---

## Production Safety Checklist

✅ Tests use in-memory database (never touch production)  
✅ Each test is isolated (cleanup between tests)  
✅ No manual server startup needed  
✅ Tests can run in CI/CD pipelines  
✅ Coverage report shows what's tested  

---

## Coverage Report Explained

```
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
tasks.js  |   74    |   55.55  |  85.71  |   75    |
```

- **% Stmts**: Percentage of code statements executed
- **% Branch**: Percentage of if/else paths tested
- **% Funcs**: Percentage of functions called
- **% Lines**: Percentage of lines executed

**Goal:** Aim for >80% coverage on controllers

---

## Next Steps

1. **Run your tests**: `npm test`
2. **Add more tests** as you add features
3. **Check coverage**: `npm run test:coverage`
4. **Keep tests fast**: Avoid testing implementation details
5. **Test behavior, not internals**: "Does it work?" not "How does it work?"

---

## Questions?

- Tests failing? Check console output for specific errors
- Need to test authentication? Add JWT token to requests
- Need to test file uploads? Use `.attach()` with Supertest
- Need to test WebSockets? Switch to `socket.io-client`

Remember: **Tests should help you ship with confidence, not slow you down.**
