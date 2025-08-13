# Quick Backend Test Script
Write-Host "🔧 Testing Backend Server..." -ForegroundColor Blue

cd "backend"
& "venv\Scripts\activate.ps1"

Write-Host "Starting backend server on http://localhost:5000..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

python app.py
