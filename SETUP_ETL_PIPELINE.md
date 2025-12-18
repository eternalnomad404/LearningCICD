# UI-Triggered GitHub Actions ETL Pipeline

## 🎯 Overview

This implementation creates a controlled data synchronization pipeline for your MERN stack to-do application where an admin UI button triggers a GitHub Actions workflow to process and transform task data.

## 🏗️ Architecture

```
Frontend (Admin Button)
        ↓ HTTP POST
Backend API (Node/Express) 
        ↓ GitHub API Call
GitHub Actions (repository_dispatch)
        ↓ Workflow Trigger  
ETL Script (MongoDB → JSON)
        ↓ Artifact Storage
App Consumes Updated Dataset
```

## 🔧 Setup Instructions

### 1. Environment Configuration

**Backend (.env file):**
```env
MONGODB_URI=mongodb://localhost:27017/todolist
ADMIN_TOKEN=your-secure-admin-token-here
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITHUB_REPO=your-username/to-do-list
```

**GitHub Secrets (Repository Settings > Secrets):**
```
MONGODB_URI: Your MongoDB connection string
```

### 2. GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token with these permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
3. Copy token to your backend `.env` file

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install axios

# ETL Script  
cd ../scripts/etl
npm install
```

## 🚀 Usage

### Admin Interface

1. **Access Admin Panel**: Click "🔧 Show Admin Panel" in the UI
2. **Enter Token**: Input your admin token (from .env ADMIN_TOKEN)  
3. **Trigger Sync**: Click "🚀 Sync Data" button
4. **Monitor Status**: Watch for success/error notifications

### What Happens When You Click "Sync Data"

1. **Frontend** → Calls `POST /api/etl/trigger-etl` with admin token
2. **Backend** → Validates token → Calls GitHub API with `repository_dispatch`
3. **GitHub** → Triggers workflow → Runs ETL script → Generates artifacts
4. **ETL** → Extracts from MongoDB → Transforms → Saves versioned JSON

## 📊 Data Flow Details

### Input (MongoDB Tasks)
```javascript
{
  "_id": ObjectId("..."),
  "title": "Complete project",
  "description": "Finish the todo app",
  "completed": false,
  "priority": "High", 
  "dueDate": ISODate("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Output (Processed Dataset)
```json
{
  "metadata": {
    "extractedAt": "2024-01-15T10:30:00.000Z",
    "version": "v2024.01.15.1030", 
    "count": 25,
    "dataHash": "abc123...",
    "statistics": {
      "total": 25,
      "completed": 15, 
      "pending": 10,
      "overdue": 2
    }
  },
  "tasks": [...]
}
```

## 🔒 Security Features

- ✅ **GitHub token stays server-side** (never exposed to frontend)
- ✅ **Admin authentication** required for ETL triggers  
- ✅ **Environment variable protection** for sensitive data
- ✅ **Least privilege permissions** on GitHub token
- ✅ **Request validation** and error handling

## 📁 File Structure

```
├── backend/
│   ├── routes/etlRoutes.js          # ETL trigger endpoint
│   └── .env.example                 # Environment template
├── frontend/src/
│   ├── App.tsx                      # Admin panel UI
│   └── services/taskService.ts      # ETL API calls
├── .github/workflows/
│   └── etl.yml                      # GitHub Actions workflow
└── scripts/etl/
    ├── etl.js                       # Main ETL script
    ├── package.json                 # ETL dependencies
    └── README.md                    # ETL documentation
```

## 🎮 Testing the Pipeline

1. **Start your app**: Ensure MongoDB and both frontend/backend are running
2. **Create some tasks**: Add a few tasks through the UI
3. **Open Admin Panel**: Click the admin panel toggle
4. **Enter admin token**: Use the token from your `.env` file  
5. **Trigger ETL**: Click "Sync Data" and watch the magic happen!
6. **Check GitHub**: Go to Actions tab to see the workflow running
7. **Download artifacts**: Check the ETL output files in the workflow artifacts

## ⚠️ Important Notes

### For GitHub Actions to Work:
- Push this code to your GitHub repository
- Add `MONGODB_URI` to repository secrets
- Ensure your GitHub token has proper permissions
- The workflow will only trigger on the `main` branch by default

### Change Detection:
- ETL only processes when data actually changes
- Uses SHA-256 hashing for efficient change detection  
- Maintains versioned backups automatically

### Production Considerations:
- Use proper JWT authentication instead of simple tokens
- Implement rate limiting on the ETL endpoint
- Set up monitoring and alerts for failed workflows
- Consider using MongoDB Atlas for production database

## 🐛 Troubleshooting

**"GitHub token is invalid"** → Check token permissions and expiration  
**"Repository not found"** → Verify GITHUB_REPO format: `owner/repo`  
**"Admin token required"** → Ensure ADMIN_TOKEN is set in backend .env  
**"MongoDB connection failed"** → Check MongoDB URI and database connectivity

## 🎉 Success Indicators

- ✅ Admin panel appears in UI
- ✅ ETL trigger returns success message  
- ✅ GitHub Actions workflow runs without errors
- ✅ Artifacts contain processed JSON files
- ✅ Logs show successful data transformation