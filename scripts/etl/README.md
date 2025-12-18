# ETL Script Documentation

## Overview

This ETL (Extract, Transform, Load) script processes todo task data from MongoDB and generates clean, versioned datasets for consumption by the application.

## Architecture Flow

```
Frontend (Admin Button) 
        ↓ 
Backend API (/api/etl/trigger-etl)
        ↓ 
GitHub API (repository_dispatch)
        ↓ 
GitHub Actions Workflow (.github/workflows/etl.yml)
        ↓ 
ETL Script (scripts/etl/etl.js)
        ↓ 
Processed Dataset (scripts/etl/output/)
```

## ETL Process

### 1. Extract
- Connects to MongoDB
- Retrieves all tasks from the database
- Sorts by creation date (newest first)

### 2. Transform
- Cleans and normalizes task data
- Converts MongoDB ObjectIds to strings
- Formats dates to ISO strings
- Generates statistics (completion rate, priority breakdown, etc.)
- Creates structured dataset with metadata

### 3. Load
- Generates SHA-256 hash of task data
- Compares with previous hash to detect changes
- Only saves if data has changed
- Creates versioned backups
- Maintains configurable number of historical versions

## Output Files

- `latest.json` - Most recent dataset
- `dataset-v{version}.json` - Versioned backups
- `latest.hash` - Hash of current dataset for change detection
- `logs/etl-{date}.log` - Execution logs

## Dataset Structure

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
      "byPriority": {
        "high": 5,
        "medium": 15,
        "low": 5
      },
      "overdue": 2
    },
    "source": "mongodb-todo-collection",
    "pipeline": "github-actions-etl"
  },
  "tasks": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Complete project documentation",
      "description": "Write comprehensive docs",
      "completed": false,
      "priority": "High",
      "dueDate": "2024-01-20T00:00:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/todolist` |
| `ETL_OUTPUT_PATH` | Output directory path | `./output` |
| `ETL_BACKUP_COUNT` | Number of versions to keep | `5` |

## Usage

### Local Development
```bash
cd scripts/etl
npm install
MONGODB_URI="your-mongodb-uri" node etl.js
```

### GitHub Actions
The script runs automatically when triggered via the admin UI, which calls the backend API that triggers the GitHub workflow.

## Change Detection

The ETL uses SHA-256 hashing to detect changes:
- Only saves new files when task data actually changes
- Prevents unnecessary processing and storage
- Maintains data integrity through versioning

## Error Handling

- Comprehensive error logging
- Database connection timeout handling  
- Graceful cleanup on failures
- Detailed error messages for debugging

## Security Notes

- MongoDB URI should be stored in GitHub Secrets for production
- Admin token authentication required for triggering
- No sensitive data exposed in logs or artifacts