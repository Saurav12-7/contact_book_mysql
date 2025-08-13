from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta
import csv
from io import StringIO
import smtplib
from email.mime.text import MIMEText
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/')
CORS(app, resources={r"/*": {"origins": "*"}})

# Flask-Limiter setup
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per day", "800 per hour"]
)

# Detect environment and use appropriate database connector
IS_RENDER = os.environ.get('RENDER', False)  # Render sets this automatically
IS_LOCAL = os.environ.get('DB_HOST', 'localhost') == 'localhost'

print(f"Environment detected - Render: {IS_RENDER}, Local: {IS_LOCAL}")

# Database configuration
if IS_RENDER or not IS_LOCAL:
    # Use mysql-connector-python for cloud deployment
    print("Using mysql-connector-python for cloud deployment")
    import mysql.connector
    from mysql.connector import Error
    
    db_config = {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', 'root'),
        'database': os.environ.get('DB_NAME', 'contact_book_db'),
        'autocommit': True
    }
    
    def get_db_connection():
        try:
            connection = mysql.connector.connect(**db_config)
            return connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None
    
    def get_dict_cursor(connection):
        return connection.cursor(dictionary=True)
    
    def get_regular_cursor(connection):
        return connection.cursor()

else:
    # Use Flask-MySQLdb for local development
    print("Using Flask-MySQLdb for local development")
    from flask_mysqldb import MySQL
    import MySQLdb.cursors
    
    # MySQL config for local development
    app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
    app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
    app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', 'root')
    app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'contact_book_db')
    
    mysql = MySQL(app)
    
    def get_db_connection():
        return mysql.connection
    
    def get_dict_cursor(connection):
        return connection.cursor(MySQLdb.cursors.DictCursor)
    
    def get_regular_cursor(connection):
        return connection.cursor()

# Email service configuration
GMAIL_SERVICE_EMAIL = os.environ.get('GMAIL_SERVICE_EMAIL', 'your-service-email@gmail.com')
GMAIL_SERVICE_PASSWORD = os.environ.get('GMAIL_SERVICE_PASSWORD', 'your-app-password-here')
GMAIL_SERVICE_NAME = os.environ.get('GMAIL_SERVICE_NAME', 'Contact Book Service')

print(f"Database config - Host: {os.environ.get('DB_HOST', 'localhost')}, User: {os.environ.get('DB_USER', 'root')}, DB: {os.environ.get('DB_NAME', 'contact_book_db')}")

# Test database connection
try:
    if IS_RENDER or not IS_LOCAL:
        test_conn = get_db_connection()
        if test_conn:
            test_conn.close()
            print("✅ Cloud database connection successful!")
        else:
            print("❌ Cloud database connection failed")
    else:
        with app.app_context():
            mysql.connection.cursor()
            print("✅ Local database connection successful!")
except Exception as e:
    print(f"❌ Database connection failed: {str(e)}")

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', os.environ.get('SECRET_KEY', '1234'))

# JWT helper functions
def encode_auth_token(user_id, username, role):
    payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow(),
        'sub': str(user_id),
        'username': username,
        'role': role
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_auth_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'expired'}
    except jwt.InvalidTokenError:
        return {'error': 'invalid'}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        data = decode_auth_token(token)
        if not data or 'error' in data:
            if data and data.get('error') == 'expired':
                return jsonify({'error': 'Token has expired. Please log in again.'}), 401
            else:
                return jsonify({'error': 'Token is invalid!'}), 401
        request.user = data
        return f(*args, **kwargs)
    return decorated

def validate_contact(data):
    errors = {}
    if not data.get('first_name', '').strip():
        errors['first_name'] = 'First name is required'
    if not data.get('last_name', '').strip():
        errors['last_name'] = 'Last name is required'
    phone = data.get('phone_number', '').strip()
    if not phone:
        errors['phone_number'] = 'Phone number is required'
    elif not phone.isdigit() or len(phone) != 10:
        errors['phone_number'] = 'Phone number must be 10 digits'
    email = data.get('email_address', '').strip()
    if email and ('@' not in email or '.' not in email):
        errors['email_address'] = 'Invalid email address'
    return errors

@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    connection = None
    external_connection = False
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
            if not connection:
                return jsonify({'error': 'Database connection failed'}), 500
        else:
            connection = get_db_connection()
            
        cursor = get_regular_cursor(connection)
        cursor.execute('SELECT * FROM users WHERE username=%s', (username,))
        if cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Username already exists'}), 400
        
        password_hash = generate_password_hash(password)
        cursor.execute('INSERT INTO users (username, password_hash) VALUES (%s, %s)', (username, password_hash))
        
        if external_connection:
            connection.commit()
        else:
            mysql.connection.commit()
            
        cursor.close()
        return jsonify({'message': 'User registered successfully'})
    except Exception as e:
        if external_connection and connection:
            connection.rollback()
        elif not external_connection:
            mysql.connection.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    connection = None
    external_connection = False
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
            
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
            if not connection:
                return jsonify({'error': 'Database connection failed'}), 500
        else:
            connection = get_db_connection()
            
        cursor = get_regular_cursor(connection)
        cursor.execute('SELECT * FROM users WHERE username=%s', (username,))
        user = cursor.fetchone()
        cursor.close()
        
        if user and check_password_hash(user[2], password):
            token = encode_auth_token(user[0], user[1], user[4] if len(user) > 4 else 'user')
            return jsonify({
                'token': token,
                'username': user[1],
                'role': user[4] if len(user) > 4 else 'user'
            })
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/refresh', methods=['POST'])
@token_required
def refresh_token():
    try:
        user_id = request.user['sub']
        username = request.user['username']
        role = request.user['role']
        new_token = encode_auth_token(user_id, username, role)
        return jsonify({
            'token': new_token,
            'username': username,
            'role': role
        })
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

@app.route('/api/contacts', methods=['GET'])
@limiter.limit("720 per hour")
@token_required
def get_contacts():
    connection = None
    external_connection = False
    try:
        user_id = request.user['sub']
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        sort_by = request.args.get('sort_by', 'last_name')
        sort_order = request.args.get('sort_order', 'asc')
        
        allowed_sort = ['first_name', 'last_name', 'phone_number', 'email_address', 'address']
        if sort_by not in allowed_sort:
            sort_by = 'last_name'
        if sort_order not in ['asc', 'desc']:
            sort_order = 'asc'
        
        filters = []
        values = [user_id]
        for field in allowed_sort:
            val = request.args.get(field)
            if val:
                filters.append(f"{field} LIKE %s")
                values.append(f"%{val}%")
        
        where_clause = "WHERE user_id = %s" + (f" AND {' AND '.join(filters)}" if filters else '')
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
            cursor = get_dict_cursor(connection)
        else:
            connection = get_db_connection()
            cursor = get_dict_cursor(connection)
        
        # Get total count
        cursor.execute(f"SELECT COUNT(*) as total FROM contacts {where_clause}", values)
        total = cursor.fetchone()['total']
        
        # Get contacts
        query = f"SELECT * FROM contacts {where_clause} ORDER BY {sort_by} {sort_order} LIMIT %s OFFSET %s"
        cursor.execute(query, values + [limit, offset])
        contacts = cursor.fetchall()
        cursor.close()
        
        return jsonify({
            'contacts': contacts,
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/contacts', methods=['POST'])
@token_required
def add_contact():
    connection = None
    external_connection = False
    try:
        data = request.json
        errors = validate_contact(data)
        if errors:
            return jsonify({'errors': errors}), 400
            
        user_id = request.user['sub']
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
        else:
            connection = get_db_connection()
            
        cursor = get_regular_cursor(connection)
        cursor.execute(
            "INSERT INTO contacts (first_name, last_name, phone_number, email_address, address, user_id) VALUES (%s, %s, %s, %s, %s, %s)",
            (data['first_name'], data['last_name'], data['phone_number'], data['email_address'], data['address'], user_id)
        )
        
        if external_connection:
            connection.commit()
        else:
            mysql.connection.commit()
            
        cursor.close()
        return jsonify({'message': 'Contact added'}), 201
    except Exception as e:
        if external_connection and connection:
            connection.rollback()
        elif not external_connection:
            mysql.connection.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
@token_required
def update_contact(contact_id):
    connection = None
    external_connection = False
    try:
        data = request.json
        errors = validate_contact(data)
        if errors:
            return jsonify({'errors': errors}), 400
            
        user_id = request.user['sub']
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
        else:
            connection = get_db_connection()
            
        cursor = get_regular_cursor(connection)
        cursor.execute(
            "UPDATE contacts SET first_name=%s, last_name=%s, phone_number=%s, email_address=%s, address=%s WHERE contact_id=%s AND user_id=%s",
            (data['first_name'], data['last_name'], data['phone_number'], data['email_address'], data['address'], contact_id, user_id)
        )
        
        if external_connection:
            connection.commit()
        else:
            mysql.connection.commit()
            
        cursor.close()
        return jsonify({'message': 'Contact updated'})
    except Exception as e:
        if external_connection and connection:
            connection.rollback()
        elif not external_connection:
            mysql.connection.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@token_required
def delete_contact(contact_id):
    connection = None
    external_connection = False
    try:
        user_id = request.user['sub']
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
        else:
            connection = get_db_connection()
            
        cursor = get_regular_cursor(connection)
        cursor.execute("DELETE FROM contacts WHERE contact_id=%s AND user_id=%s", (contact_id, user_id))
        
        if external_connection:
            connection.commit()
        else:
            mysql.connection.commit()
            
        cursor.close()
        return jsonify({'message': 'Contact deleted'})
    except Exception as e:
        if external_connection and connection:
            connection.rollback()
        elif not external_connection:
            mysql.connection.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/contacts/export', methods=['GET'])
@token_required
def export_contacts():
    connection = None
    external_connection = False
    try:
        user_id = request.user['sub']
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
            cursor = get_dict_cursor(connection)
        else:
            connection = get_db_connection()
            cursor = get_dict_cursor(connection)
            
        cursor.execute("SELECT contact_id, first_name, last_name, phone_number, email_address, address FROM contacts WHERE user_id=%s", (user_id,))
        contacts = cursor.fetchall()
        cursor.close()
        
        si = StringIO()
        writer = csv.DictWriter(si, fieldnames=['contact_id', 'first_name', 'last_name', 'phone_number', 'email_address', 'address'])
        writer.writeheader()
        for row in contacts:
            writer.writerow(row)
        output = si.getvalue()
        return app.response_class(
            output,
            mimetype='text/csv',
            headers={
                'Content-Disposition': 'attachment; filename=contacts.csv'
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/contacts/import', methods=['POST'])
@token_required
def import_contacts():
    connection = None
    external_connection = False
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are allowed'}), 400
        
        user_id = request.user['sub']
        try:
            file_content = file.read().decode('utf-8')
            reader = csv.DictReader(StringIO(file_content))
        except UnicodeDecodeError:
            return jsonify({'error': 'File encoding error. Please use UTF-8 encoded CSV files.'}), 400
        
        imported = 0
        skipped = 0
        errors = []
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
        else:
            connection = get_db_connection()
            
        cursor = get_regular_cursor(connection)
        
        for i, row in enumerate(reader, 1):
            try:
                first_name = str(row.get('first_name', '')).strip()
                last_name = str(row.get('last_name', '')).strip()
                phone_number = str(row.get('phone_number', '')).strip()
                email_address = str(row.get('email_address', '')).strip()
                address = str(row.get('address', '')).strip()
                
                if not first_name or not last_name or not phone_number:
                    errors.append(f"Row {i}: Missing required fields")
                    skipped += 1
                    continue
                
                # Check for duplicate
                cursor.execute(
                    "SELECT COUNT(*) as count FROM contacts WHERE phone_number=%s AND user_id=%s",
                    (phone_number, user_id)
                )
                result = cursor.fetchone()
                if result[0] > 0:
                    skipped += 1
                    continue
                
                if not phone_number.isdigit() or len(phone_number) != 10:
                    errors.append(f"Row {i}: Phone number must be 10 digits")
                    skipped += 1
                    continue
                
                cursor.execute(
                    "INSERT INTO contacts (first_name, last_name, phone_number, email_address, address, user_id) VALUES (%s, %s, %s, %s, %s, %s)",
                    (first_name, last_name, phone_number, email_address, address, user_id)
                )
                imported += 1
            except Exception as e:
                errors.append(f"Row {i}: {str(e)}")
                skipped += 1
        
        if external_connection:
            connection.commit()
        else:
            mysql.connection.commit()
            
        cursor.close()
        
        return jsonify({
            'imported': imported, 
            'skipped': skipped,
            'errors': errors,
            'message': f'Import completed: {imported} contacts imported, {skipped} skipped'
        })
    except Exception as e:
        if external_connection and connection:
            connection.rollback()
        elif not external_connection:
            mysql.connection.rollback()
        return jsonify({'error': f'Import failed: {str(e)}'}), 500
    finally:
        if external_connection and connection:
            connection.close()

@app.route('/api/contacts/<int:contact_id>/send_email', methods=['POST'])
@token_required
def send_email(contact_id):
    connection = None
    external_connection = False
    try:
        data = request.json
        subject = data.get('subject')
        message = data.get('message')
        if not subject or not message:
            return jsonify({'error': 'Subject and message are required'}), 400

        user_id = request.user['sub']
        
        if IS_RENDER or not IS_LOCAL:
            connection = get_db_connection()
            external_connection = True
            cursor = get_dict_cursor(connection)
        else:
            connection = get_db_connection()
            cursor = get_dict_cursor(connection)
            
        cursor.execute("SELECT email_address, first_name FROM contacts WHERE contact_id=%s", (contact_id,))
        contact = cursor.fetchone()
        if not contact or not contact['email_address']:
            return jsonify({'error': 'Contact email not found'}), 404

        cursor.execute('SELECT username FROM users WHERE id=%s', (user_id,))
        user = cursor.fetchone()
        cursor.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = f"{GMAIL_SERVICE_NAME} <{GMAIL_SERVICE_EMAIL}>"
        msg['To'] = contact['email_address']
        msg['Reply-To'] = f"{user['username']} <{GMAIL_SERVICE_EMAIL}>"

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_SERVICE_EMAIL, GMAIL_SERVICE_PASSWORD)
            server.sendmail(GMAIL_SERVICE_EMAIL, [contact['email_address']], msg.as_string())

        return jsonify({'message': 'Email sent successfully'})
    except smtplib.SMTPAuthenticationError:
        return jsonify({'error': 'Email service authentication failed'}), 500
    except Exception as e:
        return jsonify({'error': f'Email sending failed: {str(e)}'}), 500
    finally:
        if external_connection and connection:
            connection.close()

# Health check endpoint
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.now().isoformat()}

# Serve React build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
