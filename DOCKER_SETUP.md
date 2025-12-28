# 🐳 Docker Hub + GitHub Actions Setup Guide

## Overview

This guide will help you set up the complete CI/CD pipeline:

```
Developer → GitHub → CI Tests → Docker Build → Docker Hub → Render
                        ↓            ↓             ↓          ↓
                    Pass/Fail    Build Image   Store Image  Deploy
```

---

## Step 1: Create Docker Hub Account

1. **Go to Docker Hub**
   - Visit: https://hub.docker.com/signup
   - Sign up for free account

2. **Verify Your Email**
   - Check your email inbox
   - Click verification link

3. **Login to Docker Hub**
   - Visit: https://hub.docker.com
   - Login with your credentials

---

## Step 2: Create Docker Hub Repository

1. **Create Repository**
   - Click **"Create Repository"** button
   - Repository Name: `todo-backend`
   - Visibility: **Public** (or Private if you have Pro)
   - Click **"Create"**

2. **Note Your Docker Hub Username**
   - You'll see it at the top: `https://hub.docker.com/u/YOUR_USERNAME`
   - Example: If username is `johndoe`, repository will be `johndoe/todo-backend`

---

## Step 3: Generate Docker Hub Access Token

1. **Go to Account Settings**
   - Click your profile icon (top right)
   - Click **"Account Settings"**

2. **Navigate to Security**
   - Click **"Security"** in left sidebar
   - Scroll to **"Access Tokens"** section

3. **Create New Access Token**
   - Click **"New Access Token"**
   - Description: `GitHub Actions CI/CD`
   - Access permissions: **Read, Write, Delete**
   - Click **"Generate"**

4. **COPY THE TOKEN**
   - ⚠️ **IMPORTANT**: Copy the token NOW
   - You won't be able to see it again!
   - Example: `dckr_pat_abc123xyz...`

---

## Step 4: Add Secrets to GitHub

1. **Go to Your GitHub Repository**
   - Visit: `https://github.com/YOUR_USERNAME/LearningCICD`

2. **Navigate to Settings → Secrets**
   - Click **"Settings"** tab (top menu)
   - Click **"Secrets and variables"** → **"Actions"** (left sidebar)

3. **Add DOCKER_USERNAME**
   - Click **"New repository secret"**
   - Name: `DOCKER_USERNAME`
   - Secret: Your Docker Hub username (e.g., `johndoe`)
   - Click **"Add secret"**

4. **Add DOCKER_PASSWORD**
   - Click **"New repository secret"**
   - Name: `DOCKER_PASSWORD`
   - Secret: Paste the access token you copied earlier
   - Click **"Add secret"**

5. **Verify Secrets Added**
   - You should see:
     - `DOCKER_USERNAME`
     - `DOCKER_PASSWORD`

---

## Step 5: Update GitHub Workflow (Already Done!)

The workflow file `.github/workflows/ci.yml` is already configured to:
- Run tests first
- Build Docker image (only if tests pass)
- Push to Docker Hub with tags:
  - `latest` (for main branch)
  - `main-<commit-sha>` (for traceability)

---

## Step 6: Test the Complete Pipeline

### A. Push Code to GitHub

```bash
cd G:\coding\LEARNING_CICD\to-do-list
git add .
git commit -m "feat: add Docker Hub integration"
git push origin main
```

### B. Watch CI/CD Pipeline

1. **GitHub Actions**
   - Go to: `https://github.com/YOUR_USERNAME/LearningCICD/actions`
   - Click on the latest workflow run
   - Watch the jobs:
     - ✅ **Run Tests** (should pass all 18 tests)
     - ✅ **Build & Push Docker Image** (runs after tests pass)

2. **Expected Output**
   ```
   ✓ Run Tests (2m 30s)
     - Setup Node.js
     - Install dependencies
     - Run 18 tests → All pass ✅
   
   ✓ Build & Push Docker Image (3m 15s)
     - Login to Docker Hub
     - Build image from Dockerfile
     - Push to johndoe/todo-backend:latest
     - Push to johndoe/todo-backend:main-abc123
   ```

3. **Verify on Docker Hub**
   - Go to: `https://hub.docker.com/r/YOUR_USERNAME/todo-backend`
   - You should see:
     - Tag: `latest`
     - Tag: `main-<commit-sha>`
     - Image size: ~100-150 MB
     - Last pushed: Just now

---

## Step 7: Configure Render to Use Docker

### Option A: Use Dockerfile from Repo (Recommended - Simpler)

✅ **Already configured in `render.yaml`**

Render will:
1. Detect push to main
2. Build Docker image from `./docker/Dockerfile.backend`
3. Deploy the container

**No additional setup needed!**

---

### Option B: Use Pre-built Image from Docker Hub (Advanced)

If you want Render to pull from Docker Hub instead of building:

1. **Update `render.yaml`**
   ```yaml
   services:
     - type: web
       name: todo-backend
       runtime: image
       image:
         url: docker.io/YOUR_USERNAME/todo-backend:latest
       # ... rest of config
   ```

2. **Push changes to GitHub**

**Note**: Free Render accounts may have limitations with private Docker images.

---

## Step 8: Deploy to Render

### A. Create Web Service on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select: `LearningCICD`

3. **Configure Service**
   - **Name**: `todo-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Runtime**: Detect Dockerfile ✅ (should auto-detect)
   - **Dockerfile Path**: `./docker/Dockerfile.backend`
   - **Docker Context**: `.` (root)
   - **Instance Type**: `Free`

4. **Set Environment Variables**
   - Click **"Advanced"**
   - Add:
     - `NODE_ENV` = `production`
     - `MONGODB_URI` = `mongodb+srv://...` (your MongoDB Atlas URI)

5. **Create Web Service**
   - Click **"Create Web Service"**
   - Wait for build (3-5 minutes)

---

## Step 9: Verify Deployment

### A. Check Render Logs

1. **Build Logs**
   ```
   Building Dockerfile at ./docker/Dockerfile.backend
   ✓ Building image
   ✓ Running npm ci
   ✓ Starting application
   ```

2. **Runtime Logs**
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running in production mode on port 10000
   ```

### B. Test Your API

```bash
# Health check
curl https://todo-backend.onrender.com/api/health

# Expected response:
{
  "success": true,
  "message": "Server is healthy",
  "database": "connected",
  ...
}
```

---

## Complete Pipeline Flow

### Day-to-Day Workflow

1. **Developer makes changes**
   ```bash
   git checkout -b feature/new-feature
   # ... write code ...
   npm test  # Test locally
   git commit -am "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Create Pull Request**
   - GitHub Actions runs tests on PR
   - ✅ Green = Ready to merge
   - ❌ Red = Fix code

3. **Merge to Main**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

4. **Automated Pipeline Triggers**
   ```
   ┌─────────────────────────────────────────────────┐
   │ 1. GitHub Actions: Run Tests                    │
   │    ✓ 18 tests passed                            │
   └─────────────────┬───────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────────────┐
   │ 2. GitHub Actions: Build Docker Image           │
   │    ✓ Build from Dockerfile.backend              │
   │    ✓ Tag: latest & main-abc123                  │
   └─────────────────┬───────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────────────┐
   │ 3. GitHub Actions: Push to Docker Hub           │
   │    ✓ Pushed to johndoe/todo-backend             │
   └─────────────────┬───────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────────────┐
   │ 4. Render: Detect New Commit                    │
   │    ✓ Pull code from GitHub                      │
   │    ✓ Build Docker image                         │
   └─────────────────┬───────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────────────┐
   │ 5. Render: Deploy Container                     │
   │    ✓ Health check passed                        │
   │    ✓ Traffic switched to new version            │
   └─────────────────────────────────────────────────┘
   ```

---

## Troubleshooting

### Docker Hub Push Fails

**Error**: `denied: requested access to the resource is denied`

**Solution**:
- Check `DOCKER_USERNAME` is correct (no typos)
- Check `DOCKER_PASSWORD` is the access token (not your password)
- Verify repository exists on Docker Hub
- Ensure access token has **Read, Write** permissions

---

### Render Build Fails

**Error**: `Error loading Dockerfile`

**Solution**:
- Verify `dockerfilePath: ./docker/Dockerfile.backend` is correct
- Check Dockerfile exists in repository
- Ensure Docker context is set to `.` (root)

---

### Image Size Too Large

**Warning**: Image is > 500 MB

**Solution**:
- Use `node:18-alpine` (already done ✅)
- Ensure `.dockerignore` excludes `node_modules`, tests
- Use multi-stage builds (already done ✅)

---

## Security Best Practices

✅ **DO:**
- Use access tokens (not passwords)
- Mark `DOCKER_PASSWORD` as secret in GitHub
- Use specific image tags (not just `latest`)
- Scan images for vulnerabilities (optional: add Snyk)

❌ **DON'T:**
- Commit Docker credentials to Git
- Use your Docker Hub password directly
- Share access tokens
- Use `latest` tag in production (use commit SHAs)

---

## Next Steps

After setup is complete:

1. ✅ Test the pipeline by making a small change
2. ✅ Watch GitHub Actions build and push to Docker Hub
3. ✅ Verify image appears on Docker Hub
4. ✅ Confirm Render deploys successfully
5. ✅ Set up monitoring and alerts

---

## Quick Commands Reference

```bash
# Test locally
npm test

# Build Docker image locally (optional)
docker build -f docker/Dockerfile.backend -t todo-backend .

# Run container locally (optional)
docker run -p 5000:5000 -e MONGODB_URI="mongodb://..." todo-backend

# Push changes
git add .
git commit -m "feat: your message"
git push origin main

# Check Docker Hub
https://hub.docker.com/r/YOUR_USERNAME/todo-backend

# Check GitHub Actions
https://github.com/YOUR_USERNAME/LearningCICD/actions

# Check Render
https://dashboard.render.com
```

---

**You're all set!** Follow the steps in order, and your pipeline will be live. 🚀
