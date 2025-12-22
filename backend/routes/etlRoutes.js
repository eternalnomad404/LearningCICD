const express = require('express');
const axios = require('axios');
const router = express.Router();

// Simple admin authentication middleware
// In production, use proper JWT or OAuth
const adminAuth = (req, res, next) => {
  const authToken = req.header('x-admin-token');
  
  if (!authToken) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Admin token required.'
    });
  }
  
  // Simple token validation - use proper JWT in production
  if (authToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin token.'
    });
  }
  
  next();
};

// POST /api/trigger-etl - Triggers GitHub Actions ETL workflow
router.post('/trigger-etl', adminAuth, async (req, res) => {
  try {
    // 🔍 COMPREHENSIVE DEBUG LOGGING
    console.log('=== ETL TRIGGER DEBUG INFO ===');
    console.log('Current working directory:', process.cwd());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('ALL GitHub related env vars:');
    console.log('- GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
    console.log('- GITHUB_TOKEN prefix:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.slice(0, 8) + '...' : 'UNDEFINED');
    console.log('- GITHUB_REPO:', process.env.GITHUB_REPO);
    console.log('- Expected token prefix: ghp_q9Xs...');
    console.log('================================');
    
    // Validate required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // format: "owner/repo"
    
    if (!githubToken) {
      return res.status(500).json({
        success: false,
        error: 'GitHub token not configured on server.'
      });
    }
    
    if (!githubRepo) {
      return res.status(500).json({
        success: false,
        error: 'GitHub repository not configured on server.'
      });
    }

    // Prepare GitHub API request
    const githubApiUrl = `https://api.github.com/repos/${githubRepo}/dispatches`;
    
    const payload = {
      event_type: 'run-etl',
      client_payload: {
        triggered_by: 'admin-ui',
        timestamp: new Date().toISOString(),
        request_id: Math.random().toString(36).substring(2, 15)
      }
    };

    console.log(`Attempting to trigger ETL for repo: ${githubRepo}`);
    console.log(`GitHub API URL: ${githubApiUrl}`);

    // Call GitHub repository dispatch API
    // 🔴 DEBUG: confirm which token is actually being used
console.log(
  "GitHub token prefix:",
  githubToken ? githubToken.slice(0, 4) : "undefined"
);

const githubResponse = await axios.post(
  githubApiUrl,
  payload,
  {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    timeout: 10000 // 10 second timeout
  }
);


    if (githubResponse.status === 204) {
      console.log(`ETL workflow triggered successfully at ${new Date().toISOString()}`);
      res.status(200).json({
        success: true,
        message: 'ETL workflow triggered successfully',
        data: {
          request_id: payload.client_payload.request_id,
          timestamp: payload.client_payload.timestamp
        }
      });
    } else {
      throw new Error(`Unexpected GitHub API response: ${githubResponse.status}`);
    }

  } catch (error) {
    console.error('ETL trigger error:', error.message);
    
    // Log more details for debugging
    if (error.response) {
      console.error('GitHub API Error Status:', error.response.status);
      console.error('GitHub API Error Data:', error.response.data);
      console.error('GitHub API Error Headers:', error.response.headers);
    }
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      return res.status(500).json({
        success: false,
        error: 'Request timeout while triggering ETL workflow.'
      });
    }
    
    if (error.response && error.response.status === 404) {
      return res.status(500).json({
        success: false,
        error: 'GitHub repository not found or token lacks permissions.'
      });
    }
    
    if (error.response && error.response.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'GitHub token is invalid or expired.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to trigger ETL workflow. Please try again.'
    });
  }
});

// GET /api/etl/status - Get ETL status (placeholder for future workflow status checking)
router.get('/status', adminAuth, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ETL status endpoint - future implementation',
    data: {
      last_triggered: null,
      status: 'ready'
    }
  });
});

module.exports = router;