# 📞 Contact Book MySQL

A full-stack web application for managing personal contacts with advanced features including user authentication, search capabilities, import/export functionality, and direct email integration.

![Contact Book Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-19.1.0-61dafb)
![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-orange)

## 🌟 Features

### 🔐 User Management
- **Secure Authentication** - JWT-based login/registration system
- **Role-based Access** - User roles and permissions
- **Session Management** - Token refresh and expiration handling

### 📇 Contact Management
- **Full CRUD Operations** - Add, view, edit, and delete contacts
- **Advanced Search** - Search by name, phone, email, or address
- **Sorting & Filtering** - Multiple sorting options with pagination
- **Data Validation** - Input validation and sanitization

### 📊 Import/Export
- **CSV Import** - Bulk import contacts with duplicate detection
- **CSV Export** - Export contacts to CSV format
- **Error Reporting** - Detailed import error messages
- **Data Integrity** - Validation during import process

### 📧 Email Integration
- **Direct Email Sending** - Send emails to contacts directly from the app
- **Contact Sharing** - Share selected contacts via email to anyone
- **Gmail SMTP Integration** - Seamless Gmail service integration
- **Custom Templates** - Personalized email templates
- **Reply-To Configuration** - Proper email routing

### 🛡️ Security & Performance
- **Rate Limiting** - API protection against abuse
- **Input Sanitization** - SQL injection prevention
- **Password Hashing** - Secure password storage
- **CORS Protection** - Cross-origin request security

## 🛠️ Technology Stack

### Backend
- **Flask** - Lightweight Python web framework
- **MySQL** - Robust relational database
- **JWT** - JSON Web Token authentication
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Limiter** - Request rate limiting
- **Gunicorn** - Production WSGI server

### Frontend
- **React** - Modern UI framework (v19.1.0)
- **Axios** - HTTP client for API requests
- **Modern CSS** - Responsive design
- **Socket.io** - Real-time communication

### Development & Deployment
- **Docker** - Containerization support
- **PowerShell Scripts** - Windows automation
- **Environment Configuration** - Flexible deployment options

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- MySQL 5.7 or higher
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/contact_book_mysql.git
cd contact_book_mysql
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE contact_book_db;
exit

# Run database initialization
python init_database.py
```

### 4. Environment Configuration
Create `.env` file in the root directory:
```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=contact_book_db

# Application Configuration
SECRET_KEY=your_secret_key
FLASK_ENV=development

# Email Service (Optional)
GMAIL_SERVICE_EMAIL=your_email@gmail.com
GMAIL_SERVICE_PASSWORD=your_app_password
GMAIL_SERVICE_NAME=Contact Book Service
```

### 5. Frontend Setup
```bash
cd frontend
npm install
```

### 6. Start the Application

#### Option 1: Development Mode
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Option 2: Production Build
```bash
# Build frontend
cd frontend
npm run build
cp -r build/* ../backend/static/

# Start backend only
cd ../backend
python app.py
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
contact_book_mysql/
├── backend/                    # Flask backend application
│   ├── static/                # Built React frontend files
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/                  # React frontend application
│   ├── src/                   # React source code
│   ├── public/                # Public assets
│   └── package.json           # Node.js dependencies
├── sql/                       # Database schema and migrations
│   ├── 01_create_table.sql    # Initial table creation
│   └── ...                    # Additional SQL files
├── docker-compose.yml         # Docker configuration
├── init_database.py          # Database initialization script
├── deploy.sh                 # Deployment script (Linux)
├── deploy.ps1                # Deployment script (Windows)
└── README.md                 # This file
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## ☁️ Cloud Deployment

### Render Deployment
1. Fork this repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Set environment variables:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=contact_book_db
   JWT_SECRET_KEY=your_secure_secret_key
   FLASK_ENV=production
   ```
5. Deploy with build command: `pip install -r backend/requirements.txt`
6. Start command: `cd backend && gunicorn app:app`

### Database Options
- **PlanetScale** - MySQL-compatible serverless database
- **Railway** - Full-stack platform with MySQL support
- **AWS RDS** - Managed MySQL service
- **DigitalOcean** - Managed databases

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/refresh` - Refresh JWT token

### Contact Endpoints
- `GET /api/contacts` - Get contacts (paginated, searchable)
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Utility Endpoints
- `GET /api/contacts/export` - Export contacts to CSV
- `POST /api/contacts/import` - Import contacts from CSV
- `POST /api/contacts/:id/send_email` - Send email to contact
- `POST /api/contacts/share` - Share selected contacts via email
- `GET /api/health` - Application health check

### Request Examples

#### Register User
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "secure123"}'
```

#### Add Contact
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Doe", 
    "phone_number": "1234567890",
    "email_address": "john@example.com",
    "address": "123 Main St"
  }'
```

#### Share Contacts
```bash
curl -X POST http://localhost:5000/api/contacts/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "contact_ids": [1, 2, 3],
    "recipient_email": "friend@example.com",
    "subject": "My Contact List",
    "message": "Hi! Here are some contacts I wanted to share with you."
  }'
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
Use the provided PowerShell scripts:
```powershell
.\test_backend.ps1    # Test backend endpoints
.\start_app.ps1       # Start full application
```

## 📊 Sample Data

Import sample contacts using the provided CSV file:
```bash
# Use the sample_contacts.csv file in the root directory
# Upload through the web interface or via API
```

## 🔒 Security Features

- **JWT Authentication** with expiration and refresh
- **Password Hashing** using Werkzeug
- **Rate Limiting** on all API endpoints
- **Input Validation** and sanitization
- **SQL Injection Prevention** through parameterized queries
- **CORS Configuration** for cross-origin security
- **Environment Variable Protection** for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for React code
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues and Support

- **Bug Reports**: [Create an issue](../../issues/new?template=bug_report.md)
- **Feature Requests**: [Create an issue](../../issues/new?template=feature_request.md)
- **Questions**: [Start a discussion](../../discussions)

## 📈 Roadmap

- [ ] **Mobile App** - React Native mobile application
- [ ] **Advanced Search** - Elasticsearch integration
- [ ] **Contact Groups** - Categorize contacts
- [ ] **Backup/Restore** - Automated backup system
- [ ] **API Rate Limiting** - Per-user rate limits
- [ ] **Advanced Email Templates** - Rich text email editor
- [ ] **Contact Sharing** - Share contacts between users
- [ ] **Integration APIs** - Google Contacts, Outlook integration

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Flask community for the excellent web framework
- React team for the powerful UI library
- MySQL for robust database capabilities
- All contributors and testers

---

⭐ **Star this repository if you found it helpful!**

📧 **Questions?** Feel free to reach out or create an issue.
