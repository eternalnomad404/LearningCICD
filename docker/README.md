# Docker Deployment Guide - MERN Todo Application

## 🏗️ Architecture Overview

This application is containerized using a **multi-container architecture** with the following services:

### **Backend Container** (Node.js/Express)
- **Runtime**: Node.js 18 Alpine Linux
- **Port**: 5000
- **Features**: RESTful API, MongoDB integration, GitHub Actions ETL triggers
- **Security**: Non-root user, health checks, minimal attack surface

### **Frontend Container** (React/Nginx)
- **Build Stage**: Node.js 18 for React build
- **Runtime**: Nginx Alpine with static files
- **Port**: 3000  
- **Features**: Production optimized, gzip compression, security headers
- **Environment**: Runtime variable injection for API configuration

### **Networking**
- **Bridge Network**: `todo-network` for service communication
- **Service Discovery**: Backend accessible at `http://backend:5000` from frontend
- **External Access**: Both services exposed to host via port mapping

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0 or higher
- **Git** for cloning the repository

### Verify Installation
```bash
docker --version          # Should be 20.x or higher
docker-compose --version  # Should be 2.x or higher
```

## 🚀 Quick Start

### 1. **Clone and Setup**
```bash
git clone <your-repository-url>
cd to-do-list
```

### 2. **Configure Environment**
```bash
# Copy environment template
cp docker/.env.template docker/.env

# Edit with your actual values
nano docker/.env  # Linux/Mac
notepad docker/.env  # Windows
```

**Required Environment Variables:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
ADMIN_TOKEN=your-secure-admin-token
GITHUB_TOKEN=ghp_your_github_token
GITHUB_REPO=your-username/your-repo
```

### 3. **Deploy Application**

**Option A: Using Deployment Script (Recommended)**
```bash
# Linux/Mac
chmod +x docker/deploy.sh
./docker/deploy.sh deploy

# Windows PowerShell
.\docker\deploy.ps1 -Command deploy
```

**Option B: Manual Docker Commands**
```bash
# Build images
docker build -f docker/Dockerfile.backend -t todo-backend .
docker build -f docker/Dockerfile.frontend -t todo-frontend .

# Start services
cd docker
docker-compose up -d
```

### 4. **Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🛠️ Available Commands

### Deployment Script Commands
```bash
./docker/deploy.sh build     # Build Docker images
./docker/deploy.sh start     # Start application
./docker/deploy.sh stop      # Stop application
./docker/deploy.sh restart   # Restart application
./docker/deploy.sh logs      # View logs
./docker/deploy.sh status    # Check health
./docker/deploy.sh cleanup   # Remove everything
./docker/deploy.sh deploy    # Full deployment
```

### Manual Docker Compose Commands
```bash
cd docker

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Remove everything
docker-compose down --rmi all --volumes
```

## 🧪 Testing & Verification

### 1. **Health Checks**
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health (nginx)
curl http://localhost:3000/health

# Or use the status command
./docker/deploy.sh status
```

### 2. **Functional Testing**
1. **Open Frontend**: Navigate to http://localhost:3000
2. **Create Tasks**: Add, edit, and delete todo items
3. **Admin Panel**: Test ETL trigger functionality
4. **API Testing**: Use curl or Postman to test endpoints

### 3. **Log Monitoring**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. **Container Inspection**
```bash
# Check running containers
docker ps

# Inspect container details
docker inspect todo-backend
docker inspect todo-frontend

# Execute commands inside containers
docker exec -it todo-backend sh
docker exec -it todo-frontend sh
```

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `ADMIN_TOKEN` | Admin authentication token | - | Yes |
| `GITHUB_TOKEN` | GitHub PAT for ETL | - | Yes |
| `GITHUB_REPO` | GitHub repository (owner/repo) | - | Yes |
| `BACKEND_PORT` | Backend port mapping | 5000 | No |
| `FRONTEND_PORT` | Frontend port mapping | 3000 | No |
| `NODE_ENV` | Application environment | production | No |
| `REACT_APP_API_URL` | Frontend API URL | http://localhost:5000 | No |

### **Port Configuration**
To change default ports, edit `docker/.env`:
```env
BACKEND_PORT=8080
FRONTEND_PORT=8000
REACT_APP_API_URL=http://localhost:8080
```

### **Production Deployment**
For production environments:
```env
NODE_ENV=production
REACT_APP_API_URL=https://your-api-domain.com
```

## 🏭 Production Deployment

### **Docker Registry**
```bash
# Tag images for registry
docker tag todo-backend your-registry.com/todo-backend:latest
docker tag todo-frontend your-registry.com/todo-frontend:latest

# Push to registry
docker push your-registry.com/todo-backend:latest
docker push your-registry.com/todo-frontend:latest
```

### **Environment-Specific Overrides**
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Staging deployment
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

## 🛡️ Security Features

### **Container Security**
- ✅ Non-root user execution
- ✅ Minimal base images (Alpine Linux)
- ✅ No secrets baked into images
- ✅ Runtime environment injection
- ✅ Resource limits and health checks

### **Application Security**
- ✅ CORS configuration
- ✅ Security headers (nginx)
- ✅ Input validation and sanitization
- ✅ Environment variable isolation

### **Network Security**
- ✅ Bridge network isolation
- ✅ Service-to-service communication
- ✅ Port exposure control

## 🔍 Troubleshooting

### **Common Issues**

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Change port in docker/.env
BACKEND_PORT=5001
```

**2. MongoDB Connection Failed**
```bash
# Check MongoDB URI format
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority

# Test connection
docker exec -it todo-backend node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected'))"
```

**3. Build Failures**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f docker/Dockerfile.backend -t todo-backend .
```

**4. Service Not Starting**
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Verify environment variables
docker exec -it todo-backend env | grep MONGODB
```

### **Debug Mode**
For development debugging:
```bash
# Run with debug output
DEBUG=* docker-compose up

# Access container shell
docker exec -it todo-backend sh
docker exec -it todo-frontend sh
```

## 📊 Monitoring

### **Container Metrics**
```bash
# Resource usage
docker stats

# Container processes
docker-compose top
```

### **Application Metrics**
- **Backend Health**: http://localhost:5000/api/health
- **Frontend Health**: http://localhost:3000/health
- **Database**: Monitor via MongoDB Atlas dashboard

## 🤝 Contributing

When contributing to the Docker configuration:

1. **Test Locally**: Always test changes locally before committing
2. **Documentation**: Update this README for any configuration changes
3. **Security**: Never commit secrets or credentials
4. **Backwards Compatibility**: Maintain compatibility with existing deployments

---

## 📞 Support

For Docker-related issues:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Verify environment configuration
4. Test with minimal configuration first

**Success Indicators:**
- ✅ Both containers start without errors
- ✅ Health checks pass
- ✅ Frontend loads at http://localhost:3000
- ✅ API responds at http://localhost:5000/api/health
- ✅ Database operations work
- ✅ ETL trigger functionality works