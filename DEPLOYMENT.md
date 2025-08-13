# 🚀 Contact Book Deployment Guide

This guide provides comprehensive instructions for deploying the Contact Book application in various environments.

## 📋 Prerequisites

Before deploying, ensure you have:
- **Docker & Docker Compose** (for Docker deployment)
- **Python 3.11+** (for local deployment)
- **Node.js 18+** (for local deployment)
- **MySQL 8.0+** (for local deployment)

## 🐳 Docker Deployment (Recommended)

### Quick Start

1. **Clone and configure:**
   ```bash
   git clone <your-repo>
   cd contact_book_mysql
   cp env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   MYSQL_HOST=db
   MYSQL_USER=root
   MYSQL_PASSWORD=your_secure_password
   MYSQL_DB=contact_book_db
   SECRET_KEY=your_super_secret_key_here
   FLASK_ENV=production
   ```

3. **Deploy:**
   ```bash
   # For Windows
   docker-compose -f docker-compose.prod.yml up -d

   # For Linux/Mac
   ./deploy.sh
   ```

4. **Access your application:**
   - **Frontend:** http://localhost
   - **Backend API:** http://localhost:5000
   - **Database:** localhost:3307

### Docker Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 💻 Local Development Deployment

### Setup Steps

1. **Database Setup:**
   ```bash
   # Install MySQL and start the service
   mysql -u root -p
   CREATE DATABASE contact_book_db;
   exit;
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration:**
   Create `backend/.env`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DB=contact_book_db
   SECRET_KEY=your_secret_key
   FLASK_ENV=development
   ```

5. **Initialize Database:**
   ```bash
   python init_database.py
   ```

6. **Start Services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## ☁️ Cloud Deployment Options

### 1. 🌊 DigitalOcean App Platform

1. **Create new app** from GitHub repository
2. **Configure services:**
   - **Web Service:** `frontend/`
     - Build Command: `npm run build`
     - Run Command: `npx serve -s build -l 3000`
   - **Web Service:** `backend/`
     - Build Command: `pip install -r requirements.txt`
     - Run Command: `python app.py`
   - **Database:** Managed MySQL

3. **Environment Variables:**
   ```
   MYSQL_HOST=<db-host>
   MYSQL_USER=<db-user>
   MYSQL_PASSWORD=<db-password>
   MYSQL_DB=contact_book_db
   SECRET_KEY=<secret-key>
   FLASK_ENV=production
   ```

### 2. ☁️ AWS Deployment

#### Using AWS ECS + RDS

1. **Create RDS MySQL instance**
2. **Build and push Docker images:**
   ```bash
   # Build images
   docker build -f Dockerfile.prod -t contact-book-backend .
   docker build -f frontend/Dockerfile.prod -t contact-book-frontend ./frontend
   
   # Tag and push to ECR
   docker tag contact-book-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/contact-book-backend:latest
   docker tag contact-book-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/contact-book-frontend:latest
   
   docker push <account>.dkr.ecr.<region>.amazonaws.com/contact-book-backend:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/contact-book-frontend:latest
   ```

3. **Create ECS tasks and services**
4. **Configure Application Load Balancer**

### 3. 🔵 Azure Container Instances

1. **Create Azure Container Registry (ACR)**
2. **Push images to ACR**
3. **Create Azure Database for MySQL**
4. **Deploy container groups:**
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name contact-book \
     --image myregistry.azurecr.io/contact-book-frontend:latest \
     --ports 80 \
     --environment-variables MYSQL_HOST=<db-host> MYSQL_USER=<user> \
     --secure-environment-variables MYSQL_PASSWORD=<password>
   ```

### 4. 🌐 Google Cloud Run

1. **Build and push to Container Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/contact-book-backend
   gcloud builds submit --tag gcr.io/PROJECT-ID/contact-book-frontend ./frontend
   ```

2. **Deploy services:**
   ```bash
   gcloud run deploy contact-book-backend \
     --image gcr.io/PROJECT-ID/contact-book-backend \
     --platform managed \
     --set-env-vars MYSQL_HOST=<db-host>,MYSQL_USER=<user> \
     --set-env-vars MYSQL_PASSWORD=<password>
   ```

3. **Create Cloud SQL MySQL instance**

### 5. 🐳 Docker Hub + VPS

1. **Build and push images:**
   ```bash
   docker build -f Dockerfile.prod -t username/contact-book-backend .
   docker build -f frontend/Dockerfile.prod -t username/contact-book-frontend ./frontend
   
   docker push username/contact-book-backend
   docker push username/contact-book-frontend
   ```

2. **Update docker-compose.prod.yml** with your images:
   ```yaml
   backend:
     image: username/contact-book-backend:latest
   frontend:
     image: username/contact-book-frontend:latest
   ```

3. **Deploy on VPS:**
   ```bash
   scp docker-compose.prod.yml user@your-server:/home/user/
   ssh user@your-server
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🔒 Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable monitoring and logging
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## 🔧 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MYSQL_HOST` | Database host | `localhost` | Yes |
| `MYSQL_USER` | Database user | `root` | Yes |
| `MYSQL_PASSWORD` | Database password | - | Yes |
| `MYSQL_DB` | Database name | `contact_book_db` | Yes |
| `SECRET_KEY` | JWT secret key | - | Yes |
| `FLASK_ENV` | Flask environment | `development` | No |
| `PORT` | Backend port | `5000` | No |

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check MySQL is running
   - Verify credentials in .env
   - Ensure database exists

2. **Frontend can't reach backend:**
   - Check backend is running on port 5000
   - Verify CORS configuration
   - Check proxy settings

3. **Docker build fails:**
   - Check Dockerfile syntax
   - Ensure all files exist
   - Try building without cache: `docker build --no-cache`

4. **Permission denied errors:**
   - On Linux/Mac: `chmod +x deploy.sh`
   - Check file ownership and permissions

### Health Checks

- **Backend health:** http://localhost:5000/api/health
- **Frontend:** http://localhost/ should load the app
- **Database:** Connect via MySQL client

## 📈 Monitoring and Maintenance

### Docker Monitoring
```bash
# Check resource usage
docker stats

# View container logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Check service health
docker-compose -f docker-compose.prod.yml ps
```

### Database Maintenance
```bash
# Backup database
docker exec <mysql-container> mysqldump -u root -p contact_book_db > backup.sql

# Restore database
docker exec -i <mysql-container> mysql -u root -p contact_book_db < backup.sql
```

### Updates
```bash
# Update application
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Support

If you encounter issues:
1. Check the logs first
2. Verify environment configuration
3. Test individual components
4. Check network connectivity
5. Review security settings

For development questions, refer to the main README.md file.
