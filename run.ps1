# Contact Book Application Runner
Write-Host "🚀 Starting Contact Book Application..." -ForegroundColor Green

# Build frontend first (if needed)
Write-Host "📦 Building frontend..." -ForegroundColor Blue
cd frontend
npm run build
cd ..

# Start the backend (which will serve the frontend)
Write-Host "🔧 Starting server on http://localhost:5000..." -ForegroundColor Cyan
cd backend
& "venv\Scripts\activate.ps1"
python app.py
