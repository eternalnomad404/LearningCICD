# 🚀 CI/CD Pipeline - Complete Documentation

**Production-grade continuous integration and deployment pipeline for the Todo List application.**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [GitHub Actions (CI)](#github-actions-ci)
4. [Render Deployment (CD)](#render-deployment-cd)
5. [Setup Guide](#setup-guide)
6. [Deployment Workflow](#deployment-workflow)
7. [Failure Modes & Debugging](#failure-modes--debugging)
8. [Code Quality Standards](#code-quality-standards)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

### What Is This?

A **production-grade Docker-based** CI/CD pipeline where:
- **GitHub Actions** runs tests (CI - Continuous Integration)
- **GitHub Actions** builds Docker image (if tests pass)
- **GitHub Actions** pushes to Docker Hub
- **Render** uses the Docker image to deploy (CD - Continuous Deployment)
- **Clean separation** - Each system has one responsibility

### Pipeline Flow

```
┌──────────┐      ┌──────────────┐      ┌────────────┐      ┌──────────┐
│Developer │─────→│GitHub Actions│─────→│ Docker Hub │─────→│  Render  │
│  (You)   │ push │ (CI + Build) │ push │  (Storage) │ pull │ (Deploy) │
└──────────┘      └──────────────┘      └────────────┘      └──────────┘
                         ↓                     ↓                  ↓
                    1. Tests               2. Store          3. Deploy
                    2. Build Image         Image             Container
```

### Key Principles

✅ **Separation of Concerns** - CI tests, builds image, CD deploys  
✅ **Fail Fast** - Tests block bad code; no image built if tests fail  
✅ **Deterministic** - Same Dockerfile = same image everywhere  
✅ **Observable** - Clear logs at every step  
✅ **Safe** - Failed deployments don't cause downtime  
✅ **Docker-based** - Container ensures consistency across environments

---

## Quick Start

### For Docker Hub Integration (Recommended)

**Full guide**: See [DOCKER_SETUP.md](DOCKER_SETUP.md)

**Quick setup**:
1. Create Docker Hub account
2. Add `DOCKER_USERNAME` and `DOCKER_PASSWORD` to GitHub Secrets
3. Push code → Tests run → Image builds → Pushed to Docker Hub
4. Render pulls and deploys the image

---

## Pipeline Architecture

### CI: GitHub Actions (Testing Only)

**Purpose**: Quality gate - ensures code works before it reaches production

**Triggers**:
- Every push to `main` branch
- Every pull request to `main`
- Only when `backend/` files change

**Process**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Start MongoDB service container
5. Run tests (`npm test`)
6. Upload coverage reports
7. ✅ Pass → Allow merge | ❌ Fail → Block merge

**Does NOT**:
- Deploy code
- Build Docker images
- Touch production infrastructure

---

### CD: Render (Deployment Only)

**Purpose**: Deploy code to production automatically

**Triggers**:
- New commits on `main` branch (only if CI passed)

**Process**:
1. Detect changes on `main`
2. Clone repository
3. Run `npm ci` (install production dependencies)
4. Start app: `npm start`
5. Health check: `GET /api/health`
6. ✅ If healthy → Switch traffic
7. ❌ If unhealthy → Abort, keep old version running

**Does NOT**:
- Run tests (that's CI's job)
- Validate code quality
- Block broken code (CI handles that)

---

## GitHub Actions (CI)

### Configuration File

**Location**: `.github/workflows/ci.yml`

### What It Does

```yaml
# Simplified view
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies (npm ci)
      - Run tests with coverage
      - Upload coverage reports
```

### Key Features

- **MongoDB Service**: Spins up MongoDB 7 container for integration tests
- **Caching**: Caches npm dependencies for faster builds
- **Coverage**: Generates and uploads test coverage reports
- **Timeout**: 10 minute timeout to prevent hung jobs
- **Concurrency**: Cancels old runs when new code is pushed

### Viewing CI Results

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. Select the workflow run
4. Click on **"Run Tests"** job
5. Expand steps to see logs

**Example output**:
```
✓ POST /api/tasks should create a task (245ms)
✓ GET /api/tasks should return all tasks (89ms)
✓ PUT /api/tasks/:id should update a task (156ms)
✓ DELETE /api/tasks/:id should delete a task (98ms)

Tests:       4 passed, 4 total
Coverage:    95.8% (Statements)
```

---

## Render Deployment (CD)

### Configuration File

**Location**: `render.yaml`

### Key Settings

```yaml
services:
  - type: web
    name: todo-backend
    env: node
    branch: main
    rootDir: backend
    buildCommand: npm ci
    startCommand: npm start
    healthCheckPath: /api/health
    autoDeploy: true
```

### Deployment Process

**Timeline** (typical deployment):
```
0:00 - Render detects new commit
0:30 - Build starts (npm ci)
1:30 - Build completes
1:35 - App starts (npm start)
1:40 - Health check passes
1:45 - Traffic switches to new version
✅ Deployment complete
```

### Health Check

Render calls `GET /api/health` to verify the app is healthy:

**Expected response**:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-12-29T10:30:00.000Z",
  "uptime": 42.5,
  "environment": "production",
  "database": "connected"
}
```

**If database is disconnected**, returns `503` status → deployment aborted.

---

## Setup Guide

### Prerequisites

- ✅ Node.js 18+
- ✅ MongoDB (local or Atlas)
- ✅ Git & GitHub account
- ✅ Render account (free tier works)

---

### Step 1: Local Setup

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/to-do-list.git
cd to-do-list/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/todolist

# Run tests
npm test

# Start development server
npm run dev
```

Verify: `http://localhost:5000/api/health` should return healthy status.

---

### Step 2: MongoDB Atlas Setup (Production Database)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   - Create a new cluster (M0 Free Tier)
   - Choose region closest to your Render region

3. **Create Database User**
   - Database Access → Add New User
   - Username: `todoapp`
   - Password: Generate strong password (save it!)

4. **Whitelist IP**
   - Network Access → Add IP Address
   - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)

5. **Get Connection String**
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string:
   ```
   mongodb+srv://todoapp:<password>@cluster0.xxxxx.mongodb.net/todolist?retryWrites=true&w=majority
   ```
   - **Replace `<password>` with your actual password**

---

### Step 3: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "feat: add CI/CD pipeline"

# Push to main
git push origin main
```

**What happens next**:
- GitHub Actions CI workflow triggers automatically
- Tests run
- Check GitHub → Actions tab for results

---

### Step 4: Deploy to Render

#### A. Create Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: `to-do-list`

#### B. Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `todo-backend` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm ci` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (or `Starter` $7/mo) |

#### C. Environment Variables

Click **"Advanced"** and add:

| Key | Value | Secret? |
|-----|-------|---------|
| `NODE_ENV` | `production` | No |
| `MONGODB_URI` | `mongodb+srv://todoapp:PASSWORD@...` | **Yes** ✅ |

⚠️ **Important**: 
- Mark `MONGODB_URI` as **Secret** (encrypted)
- Do NOT add `PORT` (Render sets this automatically)

#### D. Deploy

1. Click **"Create Web Service"**
2. Watch the build logs (2-5 minutes)
3. Wait for health check to pass

**Your app is now live** at: `https://todo-backend.onrender.com`

---

### Step 5: Verify Deployment

```bash
# Test health endpoint
curl https://todo-backend.onrender.com/api/health

# Expected response:
# {"success":true,"message":"Server is healthy",...}

# Create a test task
curl -X POST https://todo-backend.onrender.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deployment Test","priority":"High"}'

# Get all tasks
curl https://todo-backend.onrender.com/api/tasks
```

---

## Deployment Workflow

### Developer Workflow (Day-to-Day)

#### 1. Create Feature Branch

```bash
git checkout -b feature/new-feature
# ... write code ...
npm test  # Test locally
```

#### 2. Push & Create PR

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

Go to GitHub → Create Pull Request

#### 3. Automated CI

- GitHub Actions runs automatically
- Check **"Checks"** tab on PR
- ✅ Green = Tests passed → Ready to merge
- ❌ Red = Tests failed → Fix code, push again

#### 4. Merge to Main

After PR approval:
```bash
git checkout main
git pull
git merge feature/new-feature
git push
```

#### 5. Automated Deployment

- Render detects new commit on `main`
- Builds and deploys automatically
- Check Render logs for success

#### 6. Verify in Production

```bash
curl https://your-app.onrender.com/api/health
```

---

### What Happens on Each Push

```
┌─────────────────────────────────────────────────────────┐
│ 1. Developer pushes to main                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. GitHub Actions starts CI                             │
│    - Install dependencies                               │
│    - Run tests                                          │
│    - Generate coverage                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─────────────┐
                   │             │
                   ▼             ▼
           ✅ Tests Pass    ❌ Tests Fail
                   │             │
                   │             └─→ Block deployment
                   │                 Send failure email
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Render detects commit on main                        │
│    (only happens if tests passed)                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Render builds application                            │
│    - Run: npm ci                                        │
│    - Install production dependencies only               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─────────────┐
                   │             │
                   ▼             ▼
          ✅ Build Success  ❌ Build Fails
                   │             │
                   │             └─→ Abort deployment
                   │                 Keep old version
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Render starts application                            │
│    - Run: npm start                                     │
│    - Wait for server to listen                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Render performs health check                         │
│    - GET /api/health                                    │
│    - Check response is 200 OK                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─────────────┐
                   │             │
                   ▼             ▼
          ✅ Healthy        ❌ Unhealthy
                   │             │
                   │             └─→ Abort deployment
                   │                 Keep old version
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Switch traffic to new deployment                     │
│    - New version is live                                │
│    - Old version is terminated                          │
└─────────────────────────────────────────────────────────┘
```

---

## Failure Modes & Debugging

### Scenario 1: Tests Fail in CI ❌

**Symptom**: GitHub Actions shows red X

**Where to check**: GitHub → Actions → Failed workflow → Click on failed step

**Common causes**:
- Syntax error in code
- Test assertion failed
- MongoDB connection issue in tests
- Missing environment variables

**Example log**:
```
FAIL __tests__/tasks.test.js
  ● POST /api/tasks › should create task

    expect(received).toBe(expected)
    Expected: 201
    Received: 500
```

**Action**:
1. Read the error message
2. Fix the failing test locally: `npm test`
3. Commit and push again

**Impact**: ✅ Production is protected (bad code never deploys)

---

### Scenario 2: Render Build Fails 🔨

**Symptom**: Deployment shows "Build Failed"

**Where to check**: Render Dashboard → Your Service → Logs → Build Logs

**Common causes**:
- `package-lock.json` out of sync
- Missing dependency in `package.json`
- Build timeout (>15 minutes)

**Example log**:
```
npm ERR! Cannot find module 'some-package'
npm ERR! A complete log of this run can be found in:
```

**Action**:
```bash
# Fix locally
cd backend
rm -rf node_modules package-lock.json
npm install
npm test  # Ensure it works

# Commit
git add package-lock.json
git commit -m "fix: update lockfile"
git push
```

**Impact**: ✅ Old version keeps running (no downtime)

---

### Scenario 3: Health Check Fails 🏥

**Symptom**: Deployment shows "Deploy failed" after build

**Where to check**: Render Dashboard → Runtime Logs

**Common causes**:
- App crashes on startup
- `MONGODB_URI` not set or incorrect
- Database IP not whitelisted
- `/api/health` endpoint not responding

**Example log**:
```
MongoDB connection failed: MongoServerError: bad auth
Error: connect ETIMEDOUT
```

**Action**:
1. Verify `MONGODB_URI` in Render environment variables
2. Check MongoDB Atlas → Network Access (allow 0.0.0.0/0)
3. Verify health endpoint works locally:
   ```bash
   npm start
   curl http://localhost:5000/api/health
   ```

**Impact**: ✅ Old version keeps running (no downtime)

---

### Scenario 4: App Crashes Post-Deploy 💥

**Symptom**: App was healthy, then crashes repeatedly

**Where to check**: Render Dashboard → Runtime Logs (live tail)

**Common causes**:
- Unhandled promise rejection
- Database connection lost
- Memory limit exceeded (512MB on free tier)
- Uncaught exception

**Example log**:
```
UnhandledPromiseRejectionWarning: MongoNetworkError
    at Task.find (/app/controllers/taskController.js:45)
```

**Action**:
1. **Immediate**: Rollback
   - Render Dashboard → Events → Previous deployment → "Rollback"
2. **Fix**: Add error handling
3. **Test locally**: Reproduce the crash
4. **Redeploy**: Push fix to main

**Impact**: ⚠️ Service down until rollback/fix

---

### Debugging Checklist

When something goes wrong:

- [ ] Check the **most recent logs** first
- [ ] Verify **environment variables** are set correctly
- [ ] Test **locally** with same environment
- [ ] Check **database connectivity** (can you connect from outside?)
- [ ] Verify **health endpoint** returns 200
- [ ] Check for **unhandled errors** in code
- [ ] Review **recent commits** (what changed?)
- [ ] Check **MongoDB Atlas** network access
- [ ] Verify **Node.js version** matches (18)
- [ ] Check **memory usage** (Render dashboard → Metrics)

---

## Code Quality Standards

### Production-Ready Code Principles

#### 1. ❌ No Global Mutable State

**WRONG**:
```javascript
let requestCount = 0;  // Race condition!

app.get('/api/stats', (req, res) => {
  requestCount++;  // Multiple concurrent requests = data corruption
  res.json({ count: requestCount });
});
```

**CORRECT**:
```javascript
app.get('/api/stats', async (req, res) => {
  const count = await RequestLog.countDocuments();  // Read from DB
  res.json({ count });
});
```

**Why**: Node.js handles concurrent requests. Global state causes race conditions.

---

#### 2. ✅ Always Handle Errors

**WRONG**:
```javascript
app.post('/api/tasks', async (req, res) => {
  const task = await Task.create(req.body);  // Unhandled rejection!
  res.json(task);
});
```

**CORRECT**:
```javascript
app.post('/api/tasks', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Task creation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create task' 
    });
  }
});
```

---

#### 3. ✅ Use Environment Variables

**WRONG**:
```javascript
const MONGO_URI = 'mongodb://localhost:27017/todolist';  // Hardcoded!
const PORT = 5000;  // Breaks on Render
```

**CORRECT**:
```javascript
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todolist';
const PORT = process.env.PORT || 5000;
```

---

#### 4. ✅ Validate User Input

**WRONG**:
```javascript
app.post('/api/tasks', async (req, res) => {
  const task = await Task.create(req.body);  // Trust user input?!
  res.json(task);
});
```

**CORRECT**:
```javascript
app.post('/api/tasks', async (req, res) => {
  try {
    if (!req.body.title || typeof req.body.title !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required and must be a string' 
      });
    }

    const task = await Task.create({
      title: req.body.title.trim(),
      description: req.body.description?.trim() || '',
      priority: req.body.priority || 'Medium'
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
```

---

#### 5. ✅ Use Correct HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid user input |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

#### 6. ✅ Log Appropriately

**WRONG**:
```javascript
console.log('Password:', req.body.password);  // Security violation!
```

**CORRECT**:
```javascript
console.log(`[INFO] Creating task: ${req.body.title}`);
console.error(`[ERROR] Task creation failed:`, error.message);  // Not full stack in prod
```

---

#### 7. ✅ Write Meaningful Tests

**WRONG**:
```javascript
test('it works', () => {
  expect(true).toBe(true);  // Useless
});
```

**CORRECT**:
```javascript
describe('POST /api/tasks', () => {
  test('should create task with valid data', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', priority: 'High' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Task');
  });

  test('should fail with missing title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ priority: 'High' });

    expect(response.status).toBe(400);
  });
});
```

---

#### Quick Checklist Before Committing

- [ ] All promises have try/catch
- [ ] No hardcoded values (use environment variables)
- [ ] Correct HTTP status codes
- [ ] User input is validated
- [ ] Errors logged but not exposed to users
- [ ] Tests written and passing locally
- [ ] No global mutable state
- [ ] No logging of sensitive data

---

## Monitoring & Maintenance

### Render Monitoring

**Metrics** (Dashboard → Metrics):
- CPU usage
- Memory usage (512MB limit on free tier)
- Response time
- Request count

**Logs** (Dashboard → Logs):
- Build logs (npm ci output)
- Runtime logs (console.log output)
- Live tail (real-time logs)

**Events** (Dashboard → Events):
- Deployment history
- Rollback capability
- Build/deploy timeline

---

### Set Up Alerts

**Recommended alerts** (Dashboard → Notifications):
- [ ] Deployment failures
- [ ] Service down
- [ ] High error rate
- [ ] Memory usage >80%

**Notification channels**:
- Email
- Slack (via webhook)
- Discord (via webhook)

---

### Regular Maintenance

**Weekly**:
- [ ] Check Render logs for errors
- [ ] Review failed deployments
- [ ] Check test coverage trends

**Monthly**:
- [ ] Update dependencies: `npm outdated`
- [ ] Review MongoDB usage/limits
- [ ] Check Render metrics
- [ ] Test disaster recovery (rollback)

**As Needed**:
- [ ] Scale up if hitting free tier limits
- [ ] Add performance monitoring
- [ ] Implement rate limiting
- [ ] Add security headers (helmet.js)

---

### Render Free Tier Limitations

⚠️ **Be Aware**:
- Service sleeps after 15 minutes of inactivity
- First request after sleep = ~30 seconds (cold start)
- 750 hours/month free (enough for one always-on service)
- 512 MB RAM limit

**For Production**: Upgrade to Starter ($7/month)
- No sleep
- More RAM (512MB → 2GB+)
- Better performance
- Multiple instances

---

## Additional Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Render Docs](https://render.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

### Tools
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Hosted MongoDB
- [Postman](https://www.postman.com/) - API testing
- [Render Status](https://status.render.com/) - Platform status

---

## Quick Command Reference

```bash
# Local Development
npm run dev              # Start dev server with nodemon
npm test                 # Run tests
npm run test:coverage    # Tests with coverage

# Git Workflow
git checkout -b feature/name    # New feature branch
git add .
git commit -m "feat: description"
git push origin feature/name    # Triggers CI on PR
git checkout main
git pull
git merge feature/name
git push                        # Triggers CD

# Debugging
npm ci                          # Clean install (what CI does)
npm start                       # Start in production mode
curl http://localhost:5000/api/health  # Test health endpoint

# Production Testing
curl https://your-app.onrender.com/api/health
curl https://your-app.onrender.com/api/tasks
```

---

## Summary

### What We Built

✅ **GitHub Actions CI Pipeline**
- Runs tests on every push/PR
- Blocks bad code from reaching main
- Generates coverage reports

✅ **Render CD Pipeline**
- Auto-deploys from main branch
- Health checks before going live
- Zero-downtime deployments

✅ **Clean Separation**
- CI = Testing only
- CD = Deployment only
- No overlap, no confusion

✅ **Production-Grade**
- Fail-fast error handling
- Comprehensive logging
- Rollback capability
- Observable at every step

---

**Your pipeline is ready for production. Deploy with confidence.** 🚀

---

**Last Updated**: December 29, 2025
