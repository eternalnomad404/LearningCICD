# ==============================================================================
# DOCKER DEPLOYMENT SCRIPT - Todo Application (PowerShell)
# ==============================================================================
# This script helps with building and running the containerized application on Windows

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "start", "stop", "restart", "logs", "status", "cleanup", "deploy")]
    [string]$Command
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "🚀 $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker first."
        return $false
    }
}

# Check if .env file exists
function Test-Environment {
    if (-not (Test-Path "docker\.env")) {
        Write-Warning "Environment file not found. Creating from template..."
        Copy-Item "docker\.env.template" "docker\.env"
        Write-Warning "Please edit docker\.env with your actual values before running the application"
        return $false
    }
    Write-Success "Environment file found"
    return $true
}

# Build images
function Build-Images {
    Write-Status "Building Docker images..."
    
    # Build backend
    Write-Status "Building backend image..."
    docker build -f docker/Dockerfile.backend -t todo-backend .
    
    # Build frontend  
    Write-Status "Building frontend image..."
    docker build -f docker/Dockerfile.frontend -t todo-frontend .
    
    Write-Success "All images built successfully"
}

# Start application
function Start-Application {
    Write-Status "Starting Todo application..."
    Set-Location docker
    docker-compose up -d
    Set-Location ..
    Write-Success "Application started successfully"
    
    Write-Status "Application URLs:"
    Write-Host "Frontend: http://localhost:3000"
    Write-Host "Backend API: http://localhost:5000"
    Write-Host "Backend Health: http://localhost:5000/api/health"
}

# Stop application
function Stop-Application {
    Write-Status "Stopping Todo application..."
    Set-Location docker
    docker-compose down
    Set-Location ..
    Write-Success "Application stopped"
}

# Show logs
function Show-Logs {
    Set-Location docker
    docker-compose logs -f
    Set-Location ..
}

# Show application status
function Show-Status {
    Write-Status "Application Status:"
    Set-Location docker
    docker-compose ps
    Set-Location ..
    
    Write-Status "Service Health Checks:"
    
    # Check backend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
    }
    catch {
        Write-Error "Backend is not responding"
    }
    
    # Check frontend health  
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is healthy"
        }
    }
    catch {
        Write-Error "Frontend is not responding"
    }
}

# Cleanup (remove containers and images)
function Remove-Application {
    Write-Status "Cleaning up Docker resources..."
    Set-Location docker
    docker-compose down --rmi all --volumes --remove-orphans
    Set-Location ..
    Write-Success "Cleanup completed"
}

# Main script logic
switch ($Command) {
    "build" {
        if (Test-Docker) {
            Build-Images
        }
    }
    "start" {
        if ((Test-Docker) -and (Test-Environment)) {
            Start-Application
        }
    }
    "stop" {
        Stop-Application
    }
    "restart" {
        if ((Test-Docker) -and (Test-Environment)) {
            Stop-Application
            Start-Application
        }
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "cleanup" {
        Remove-Application
    }
    "deploy" {
        if ((Test-Docker) -and (Test-Environment)) {
            Build-Images
            Start-Application
            Show-Status
        }
    }
}

Write-Host "`nUsage: .\deploy.ps1 -Command {build|start|stop|restart|logs|status|cleanup|deploy}"
Write-Host ""
Write-Host "Commands:"
Write-Host "  build    - Build Docker images"
Write-Host "  start    - Start the application"
Write-Host "  stop     - Stop the application"  
Write-Host "  restart  - Restart the application"
Write-Host "  logs     - Show application logs"
Write-Host "  status   - Show application status"
Write-Host "  cleanup  - Remove all containers and images"
Write-Host "  deploy   - Full deployment (build + start + status)"