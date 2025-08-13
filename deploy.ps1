# Contact Book Deployment Script for Windows PowerShell
# This script helps deploy the Contact Book application on Windows

Write-Host "Contact Book Deployment Script (Windows)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to deploy with Docker
function Deploy-Docker {
    Write-Host "Deploying with Docker..." -ForegroundColor Blue
    
    # Check if Docker is installed
    if (-not (Test-Command "docker")) {
        Write-Host "Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
        Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    
    if (-not (Test-Command "docker-compose")) {
        Write-Host "Docker Compose is not installed. Please install Docker Desktop with Compose." -ForegroundColor Red
        exit 1
    }
    
    # Check if .env file exists
    if (-not (Test-Path ".env")) {
        Write-Host ".env file not found. Creating from example..." -ForegroundColor Yellow
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Host "Please edit .env file with your configuration before continuing." -ForegroundColor Yellow
            Write-Host "Required variables: MYSQL_PASSWORD, SECRET_KEY" -ForegroundColor Yellow
            exit 1
        } else {
            Write-Host "env.example file not found. Please create .env file manually." -ForegroundColor Red
            exit 1
        }
    }
    
    # Build and start services
    Write-Host "Building Docker images..." -ForegroundColor Blue
    docker-compose -f docker-compose.prod.yml build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker build failed. Check the error messages above." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Starting services..." -ForegroundColor Blue
    docker-compose -f docker-compose.prod.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start services. Check the error messages above." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Check if services are running
    $services = docker-compose -f docker-compose.prod.yml ps
    if ($services -match "Up") {
        Write-Host "Deployment successful!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost" -ForegroundColor Cyan
        Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "Database: localhost:3307" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To view logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
        Write-Host "To stop: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
    } else {
        Write-Host "Deployment failed. Check logs:" -ForegroundColor Red
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    }
}

# Function to deploy locally
function Deploy-Local {
    Write-Host "Setting up for local development..." -ForegroundColor Blue
    
    # Check Python
    if (-not (Test-Command "python")) {
        Write-Host "Python is not installed. Please install Python 3.11+ first." -ForegroundColor Red
        Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
        exit 1
    }
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Host "Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # Check MySQL
    if (-not (Test-Command "mysql")) {
        Write-Host "MySQL client not found. Please ensure MySQL is installed and running." -ForegroundColor Yellow
        Write-Host "Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    }
    
    # Setup backend
    Write-Host "Setting up backend..." -ForegroundColor Blue
    Set-Location "backend"
    
    if (-not (Test-Path "venv")) {
        Write-Host "Creating virtual environment..." -ForegroundColor Yellow
        python -m venv venv
    }
    
    & "venv\Scripts\activate.ps1"
    pip install -r requirements.txt
    
    Set-Location ".."
    
    # Setup frontend
    Write-Host "Setting up frontend..." -ForegroundColor Blue
    Set-Location "frontend"
    npm install
    Set-Location ".."
    
    # Initialize database
    Write-Host "Initializing database..." -ForegroundColor Blue
    python init_database.py
    
    Write-Host "Local setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the application:" -ForegroundColor Cyan
    Write-Host "Backend: cd backend; venv\Scripts\activate.ps1; python app.py" -ForegroundColor Yellow
    Write-Host "Frontend: cd frontend; npm start" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Access the app at: http://localhost:3000" -ForegroundColor Cyan
}

# Function to show cloud deployment guide
function Show-CloudGuide {
    Write-Host "Cloud deployment options:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1. Docker Hub + VPS" -ForegroundColor Cyan
    Write-Host "   - Push images to Docker Hub" -ForegroundColor White
    Write-Host "   - Deploy on any VPS with docker-compose" -ForegroundColor White
    Write-Host ""
    Write-Host "2. DigitalOcean" -ForegroundColor Cyan
    Write-Host "   - Use App Platform with this repository" -ForegroundColor White
    Write-Host "   - Automatic builds and deployments" -ForegroundColor White
    Write-Host ""
    Write-Host "3. AWS" -ForegroundColor Cyan
    Write-Host "   - ECS with Docker images" -ForegroundColor White
    Write-Host "   - RDS for MySQL database" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Azure" -ForegroundColor Cyan
    Write-Host "   - Container Instances" -ForegroundColor White
    Write-Host "   - Azure Database for MySQL" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Google Cloud" -ForegroundColor Cyan
    Write-Host "   - Cloud Run for containers" -ForegroundColor White
    Write-Host "   - Cloud SQL for MySQL" -ForegroundColor White
    Write-Host ""
    Write-Host "See DEPLOYMENT.md for detailed cloud deployment guides." -ForegroundColor Yellow
}

# Main menu
Write-Host "Please choose deployment option:" -ForegroundColor Yellow
Write-Host "1) Docker (Recommended for production)" -ForegroundColor White
Write-Host "2) Local development setup" -ForegroundColor White
Write-Host "3) Cloud deployment guide" -ForegroundColor White
Write-Host "4) Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Deploy-Docker
    }
    "2" {
        Deploy-Local
    }
    "3" {
        Show-CloudGuide
    }
    "4" {
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}
