#!/bin/bash

# Contact Book Deployment Script
# This script helps deploy the Contact Book application

set -e

echo "🚀 Contact Book Deployment Script"
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy with Docker
deploy_docker() {
    echo "📦 Deploying with Docker..."
    
    # Check if Docker is installed
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        echo "⚠️  .env file not found. Creating from example..."
        if [ -f env.example ]; then
            cp env.example .env
            echo "📝 Please edit .env file with your configuration before continuing."
            echo "   Required variables: MYSQL_PASSWORD, SECRET_KEY"
            exit 1
        else
            echo "❌ env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
    
    # Build and start services
    echo "🔨 Building Docker images..."
    docker-compose -f docker-compose.prod.yml build
    
    echo "🚀 Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo "✅ Deployment successful!"
        echo "🌐 Frontend: http://localhost"
        echo "🔧 Backend API: http://localhost:5000"
        echo "🗄️  Database: localhost:3307"
        echo ""
        echo "📋 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
        echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
    else
        echo "❌ Deployment failed. Check logs:"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
}

# Function to deploy locally
deploy_local() {
    echo "💻 Setting up for local development..."
    
    # Check Python
    if ! command_exists python3; then
        echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
        exit 1
    fi
    
    # Check Node.js
    if ! command_exists node; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check MySQL
    if ! command_exists mysql; then
        echo "⚠️  MySQL client not found. Please ensure MySQL is installed and running."
    fi
    
    # Setup backend
    echo "🐍 Setting up backend..."
    cd backend
    
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate || source venv/Scripts/activate
    pip install -r requirements.txt
    
    cd ..
    
    # Setup frontend
    echo "⚛️  Setting up frontend..."
    cd frontend
    npm install
    cd ..
    
    # Initialize database
    echo "🗄️  Initializing database..."
    python3 init_database.py
    
    echo "✅ Local setup complete!"
    echo ""
    echo "🚀 To start the application:"
    echo "   Backend: cd backend && source venv/bin/activate && python app.py"
    echo "   Frontend: cd frontend && npm start"
    echo ""
    echo "🌐 Access the app at: http://localhost:3000"
}

# Function to deploy to cloud platforms
deploy_cloud() {
    echo "☁️  Cloud deployment options:"
    echo ""
    echo "1. 🐳 Docker Hub + VPS"
    echo "   - Push images to Docker Hub"
    echo "   - Deploy on any VPS with docker-compose"
    echo ""
    echo "2. 🌊 DigitalOcean"
    echo "   - Use App Platform with this repository"
    echo "   - Automatic builds and deployments"
    echo ""
    echo "3. ☁️  AWS"
    echo "   - ECS with Docker images"
    echo "   - RDS for MySQL database"
    echo ""
    echo "4. 🔵 Azure"
    echo "   - Container Instances"
    echo "   - Azure Database for MySQL"
    echo ""
    echo "5. 🌐 Google Cloud"
    echo "   - Cloud Run for containers"
    echo "   - Cloud SQL for MySQL"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed cloud deployment guides."
}

# Main menu
echo "Please choose deployment option:"
echo "1) 🐳 Docker (Recommended for production)"
echo "2) 💻 Local development setup"
echo "3) ☁️  Cloud deployment guide"
echo "4) 🚪 Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_docker
        ;;
    2)
        deploy_local
        ;;
    3)
        deploy_cloud
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac
