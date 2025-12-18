const mongoose = require('mongoose');
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');

// ================================
// ETL SCRIPT FOR TODO DATA
// ================================
// This script:
// 1. Extracts data from MongoDB
// 2. Transforms it into a clean JSON structure
// 3. Generates a hash of the dataset
// 4. Compares with previous hash to detect changes
// 5. Saves versioned output if data changed
// ================================

// Configuration
const CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/todolist'
  },
  output: {
    path: process.env.ETL_OUTPUT_PATH || './output',
    maxBackups: parseInt(process.env.ETL_BACKUP_COUNT) || 5
  },
  logging: {
    path: './logs',
    level: 'info'
  }
};

// Task schema (matching the main app)
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Setup logging directory
 */
async function setupDirectories() {
  try {
    await fs.mkdir(CONFIG.output.path, { recursive: true });
    await fs.mkdir(CONFIG.logging.path, { recursive: true });
    log('Directories setup completed');
  } catch (error) {
    throw new Error(`Failed to setup directories: ${error.message}`);
  }
}

/**
 * Simple logging function
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Write to log file (async, don't await to avoid blocking)
  fs.appendFile(
    path.join(CONFIG.logging.path, `etl-${new Date().toISOString().split('T')[0]}.log`),
    logMessage + '\n'
  ).catch(err => console.error('Log write failed:', err.message));
}

/**
 * Generate SHA-256 hash of data
 */
function generateDataHash(data) {
  const jsonString = JSON.stringify(data, null, 0); // Consistent formatting
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  try {
    log('Connecting to MongoDB...');
    await mongoose.connect(CONFIG.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000 // 10 second timeout
    });
    log(`MongoDB connected successfully: ${CONFIG.mongodb.uri}`);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectFromDatabase() {
  try {
    await mongoose.connection.close();
    log('MongoDB connection closed');
  } catch (error) {
    log(`Warning: MongoDB disconnect error: ${error.message}`, 'warn');
  }
}

// ================================
// ETL FUNCTIONS
// ================================

/**
 * EXTRACT: Get all tasks from MongoDB
 */
async function extractTasks() {
  try {
    log('Starting data extraction...');
    
    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();
    
    log(`Extracted ${tasks.length} tasks from database`);
    return tasks;
  } catch (error) {
    throw new Error(`Data extraction failed: ${error.message}`);
  }
}

/**
 * TRANSFORM: Clean and structure the data
 */
function transformTasks(rawTasks) {
  try {
    log('Starting data transformation...');
    
    const transformedTasks = rawTasks.map(task => ({
      id: task._id.toString(),
      title: task.title.trim(),
      description: task.description ? task.description.trim() : null,
      completed: Boolean(task.completed),
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      createdAt: new Date(task.createdAt).toISOString(),
      updatedAt: new Date(task.updatedAt).toISOString()
    }));

    // Generate statistics
    const stats = {
      total: transformedTasks.length,
      completed: transformedTasks.filter(t => t.completed).length,
      pending: transformedTasks.filter(t => !t.completed).length,
      byPriority: {
        high: transformedTasks.filter(t => t.priority === 'High').length,
        medium: transformedTasks.filter(t => t.priority === 'Medium').length,
        low: transformedTasks.filter(t => t.priority === 'Low').length
      },
      overdue: transformedTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
      ).length
    };

    // Create final dataset
    const dataset = {
      metadata: {
        extractedAt: new Date().toISOString(),
        version: generateVersion(),
        count: transformedTasks.length,
        statistics: stats,
        source: 'mongodb-todo-collection',
        pipeline: 'github-actions-etl'
      },
      tasks: transformedTasks
    };

    log(`Transformation completed: ${transformedTasks.length} tasks processed`);
    return dataset;
  } catch (error) {
    throw new Error(`Data transformation failed: ${error.message}`);
  }
}

/**
 * Generate version string
 */
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `v${year}.${month}.${day}.${hour}${minute}`;
}

/**
 * LOAD: Save the processed data
 */
async function loadDataset(dataset) {
  try {
    log('Starting data loading...');
    
    // Generate hash for change detection
    const currentHash = generateDataHash(dataset.tasks);
    
    // Check if data has changed
    const previousHashPath = path.join(CONFIG.output.path, 'latest.hash');
    let hasChanged = true;
    
    try {
      const previousHash = await fs.readFile(previousHashPath, 'utf8');
      hasChanged = previousHash.trim() !== currentHash;
    } catch (error) {
      // File doesn't exist, treat as changed
      log('No previous hash found, treating as new data');
    }

    if (!hasChanged) {
      log('Data unchanged, skipping save');
      return { saved: false, reason: 'No changes detected' };
    }

    // Add hash to dataset metadata
    dataset.metadata.dataHash = currentHash;
    dataset.metadata.changed = true;

    // Save latest version
    const latestPath = path.join(CONFIG.output.path, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(dataset, null, 2));
    
    // Save versioned backup
    const versionedPath = path.join(CONFIG.output.path, `dataset-${dataset.metadata.version}.json`);
    await fs.writeFile(versionedPath, JSON.stringify(dataset, null, 2));
    
    // Save hash file
    await fs.writeFile(previousHashPath, currentHash);
    
    // Cleanup old backups
    await cleanupOldBackups();
    
    log(`Data loaded successfully: ${dataset.metadata.count} tasks saved`);
    log(`Version: ${dataset.metadata.version}, Hash: ${currentHash.substring(0, 12)}...`);
    
    return { 
      saved: true, 
      version: dataset.metadata.version, 
      hash: currentHash,
      count: dataset.metadata.count,
      stats: dataset.metadata.statistics
    };
  } catch (error) {
    throw new Error(`Data loading failed: ${error.message}`);
  }
}

/**
 * Cleanup old backup files
 */
async function cleanupOldBackups() {
  try {
    const files = await fs.readdir(CONFIG.output.path);
    const datasetFiles = files
      .filter(file => file.startsWith('dataset-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    if (datasetFiles.length > CONFIG.output.maxBackups) {
      const filesToDelete = datasetFiles.slice(CONFIG.output.maxBackups);
      
      for (const file of filesToDelete) {
        await fs.unlink(path.join(CONFIG.output.path, file));
        log(`Cleaned up old backup: ${file}`);
      }
    }
  } catch (error) {
    log(`Warning: Cleanup failed: ${error.message}`, 'warn');
  }
}

// ================================
// MAIN ETL PROCESS
// ================================

async function runETL() {
  const startTime = Date.now();
  
  try {
    log('🚀 Starting ETL process...');
    log(`Environment: Node ${process.version}`);
    log(`MongoDB URI: ${CONFIG.mongodb.uri}`);
    log(`Output Path: ${CONFIG.output.path}`);
    
    // Setup
    await setupDirectories();
    await connectToDatabase();
    
    // ETL Steps
    const rawTasks = await extractTasks();
    const dataset = transformTasks(rawTasks);
    const result = await loadDataset(dataset);
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`✅ ETL process completed in ${duration}s`);
    
    if (result.saved) {
      log(`📊 Summary: ${result.count} tasks processed, version ${result.version}`);
      log(`📈 Stats: ${result.stats.completed} completed, ${result.stats.pending} pending, ${result.stats.overdue} overdue`);
    } else {
      log(`ℹ️ ${result.reason}`);
    }
    
    return result;
    
  } catch (error) {
    log(`❌ ETL process failed: ${error.message}`, 'error');
    throw error;
  } finally {
    await disconnectFromDatabase();
  }
}

// ================================
// EXECUTION
// ================================

// Run ETL if this script is executed directly
if (require.main === module) {
  runETL()
    .then(result => {
      log('🎉 ETL pipeline completed successfully');
      process.exit(0);
    })
    .catch(error => {
      log(`💥 ETL pipeline failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

// Export for testing
module.exports = {
  runETL,
  extractTasks,
  transformTasks,
  loadDataset
};