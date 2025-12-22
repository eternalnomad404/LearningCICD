#!/bin/bash
# ==============================================================================
# DOCKER DEPLOYMENT SCRIPT - Todo Application
# ==============================================================================
# This script helps with building and running the containerized application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if .env file exists
check_env() {
    if [ ! -f "docker/.env" ]; then
        print_warning "Environment file not found. Creating from template..."
        cp docker/.env.template docker/.env
        print_warning "Please edit docker/.env with your actual values before running the application"
        exit 1
    fi
    print_success "Environment file found"
}

# Build images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend
    print_status "Building backend image..."
    docker build -f docker/Dockerfile.backend -t todo-backend .
    
    # Build frontend  
    print_status "Building frontend image..."
    docker build -f docker/Dockerfile.frontend -t todo-frontend .
    
    print_success "All images built successfully"
}

# Start application
start_app() {
    print_status "Starting Todo application..."
    cd docker && docker-compose up -d
    print_success "Application started successfully"
    
    print_status "Application URLs:"
    echo "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "Backend API: http://localhost:${BACKEND_PORT:-5000}"
    echo "Backend Health: http://localhost:${BACKEND_PORT:-5000}/api/health"
}

# Stop application
stop_app() {
    print_status "Stopping Todo application..."
    cd docker && docker-compose down
    print_success "Application stopped"
}

# Show logs
show_logs() {
    cd docker && docker-compose logs -f
}

# Show application status
show_status() {
    print_status "Application Status:"
    cd docker && docker-compose ps
    
    print_status "\nService Health Checks:"
    
    # Check backend health
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT:-5000}/api/health | grep -q "200"; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Check frontend health  
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT:-3000}/health | grep -q "200"; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Cleanup (remove containers and images)
cleanup() {
    print_status "Cleaning up Docker resources..."
    cd docker && docker-compose down --rmi all --volumes --remove-orphans
    print_success "Cleanup completed"
}

# Main script logic
case "$1" in
    "build")
        check_docker
        build_images
        ;;
    "start")
        check_docker
        check_env
        start_app
        ;;
    "stop")
        stop_app
        ;;
    "restart")
        check_docker
        check_env
        stop_app
        start_app
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "deploy")
        check_docker
        check_env
        build_images
        start_app
        show_status
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|cleanup|deploy}"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker images"
        echo "  start    - Start the application"
        echo "  stop     - Stop the application"  
        echo "  restart  - Restart the application"
        echo "  logs     - Show application logs"
        echo "  status   - Show application status"
        echo "  cleanup  - Remove all containers and images"
        echo "  deploy   - Full deployment (build + start + status)"
        exit 1
        ;;
esac