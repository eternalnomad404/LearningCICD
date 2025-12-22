#!/bin/sh
# ==============================================================================
# Frontend Environment Variable Injection Script
# ==============================================================================
# This script runs at container startup to inject runtime environment 
# variables into the React build

set -e

echo "🔧 Injecting runtime environment variables into React build..."

# Default values if not provided
REACT_APP_API_URL=${REACT_APP_API_URL:-"http://localhost:5000"}
BACKEND_URL=${BACKEND_URL:-"http://backend:5000"}

echo "📡 API URL: $REACT_APP_API_URL"
echo "🔗 Backend URL: $BACKEND_URL"

# Create environment configuration for React
cat > /usr/share/nginx/html/env-config.js << EOF
window._env_ = {
  REACT_APP_API_URL: "$REACT_APP_API_URL"
};
EOF

# Substitute environment variables in nginx configuration
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "✅ Environment variables injected successfully"