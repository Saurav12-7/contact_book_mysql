# Use official Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc default-libmysqlclient-dev pkg-config && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY backend/ .

# Copy .env file
COPY backend/.env .

# Expose port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"] 