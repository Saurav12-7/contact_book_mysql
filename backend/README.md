# Contact Book Application

A full-stack web application for managing contacts with authentication, search, import/export functionality, and email integration.

## Features

- 🔐 **User Authentication** - Secure login/signup with JWT tokens
- 📇 **Contact Management** - Add, edit, delete, and view contacts
- 🔍 **Advanced Search** - Search contacts by name, phone, or email
- 📊 **Import/Export** - CSV import and export functionality
- 📧 **Email Integration** - Send emails to contacts directly
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔄 **Real-time Updates** - Auto-refresh contact list
- 🛡️ **Rate Limiting** - API protection against abuse

## Technology Stack

### Backend
- **Flask** - Python web framework
- **MySQL** - Database for storing contacts and users
- **JWT** - Authentication tokens
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Limiter** - Rate limiting
- **Gunicorn** - Production WSGI server

### Frontend
- **React** - User interface framework
- **CSS3** - Styling and responsive design
- **Modern UI** - Clean, intuitive design

## Deployment Instructions

### Deploy to Render

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and create an account
   - Connect your GitHub account

2. **Set up Database**
   - In Render Dashboard, click "New +"
   - Select "PostgreSQL" or use external MySQL service
   - For MySQL, you can use services like:
     - [PlanetScale](https://planetscale.com) (MySQL-compatible)
     - [Railway](https://railway.app) (MySQL support)
     - [AWS RDS](https://aws.amazon.com/rds/) (MySQL)

3. **Deploy Application**
   - Push your code to GitHub repository
   - In Render Dashboard, click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: contact-book-app
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Instance Type**: Free (or higher for production)

4. **Environment Variables**
   Set these environment variables in Render:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=contact_book_db
   JWT_SECRET_KEY=your_secure_secret_key
   FLASK_ENV=production
   ```

   Optional email service variables:
   ```
   GMAIL_SERVICE_EMAIL=your_email@gmail.com
   GMAIL_SERVICE_PASSWORD=your_app_password
   GMAIL_SERVICE_NAME=Contact Book Service
   ```

5. **Database Setup**
   Create the required tables in your MySQL database:

   ```sql
   -- Users table
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(80) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       role VARCHAR(20) DEFAULT 'user'
   );

   -- Contacts table
   CREATE TABLE contacts (
       contact_id INT AUTO_INCREMENT PRIMARY KEY,
       first_name VARCHAR(50) NOT NULL,
       last_name VARCHAR(50) NOT NULL,
       phone_number VARCHAR(15) NOT NULL,
       email_address VARCHAR(100),
       address TEXT,
       user_id INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       INDEX idx_user_id (user_id),
       INDEX idx_phone (phone_number),
       INDEX idx_name (first_name, last_name)
   );
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your app will be available at: `https://your-service-name.onrender.com`

### Local Development

1. **Prerequisites**
   - Python 3.8+
   - MySQL 5.7+
   - Node.js 14+ (for frontend development)

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create a `.env` file in the backend directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=contact_book_db
   JWT_SECRET_KEY=your_secret_key
   ```

4. **Setup Database**
   - Create MySQL database named `contact_book_db`
   - Run the SQL commands above to create tables

5. **Run Application**
   ```bash
   python app.py
   ```

### Frontend Development

1. **Setup**
   ```bash
   cd frontend
   npm install
   ```

2. **Development**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/refresh` - Refresh JWT token

### Contacts
- `GET /api/contacts` - Get contacts (paginated)
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/export` - Export contacts to CSV
- `POST /api/contacts/import` - Import contacts from CSV
- `POST /api/contacts/:id/send_email` - Send email to contact

### Health Check
- `GET /api/health` - Application health status

## Features Overview

### User Authentication
- Secure user registration and login
- JWT-based authentication
- Token refresh mechanism
- Session management

### Contact Management
- Add contacts with validation
- Edit existing contacts
- Delete contacts
- Search and filter contacts
- Pagination support

### Import/Export
- CSV import with validation
- CSV export functionality
- Duplicate detection
- Error reporting

### Email Integration
- Send emails to contacts
- Gmail SMTP integration
- Email templates

## Security Features

- Input validation and sanitization
- SQL injection prevention
- Rate limiting on API endpoints
- Secure password hashing
- JWT token expiration
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.
