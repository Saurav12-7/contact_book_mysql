# Contact Book Application Starter Script
# This script starts both backend and frontend services

Write-Host "🚀 Starting Contact Book Application..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Function to check if MySQL is running
function Test-MySQLConnection {
    try {
        $result = mysql -u root -proot -e "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Check MySQL connection
Write-Host "🔍 Checking MySQL connection..." -ForegroundColor Yellow
if (-not (Test-MySQLConnection)) {
    Write-Host "❌ MySQL connection failed!" -ForegroundColor Red
    Write-Host "Please ensure MySQL is running and accessible with:" -ForegroundColor Yellow
    Write-Host "   Username: root" -ForegroundColor White
    Write-Host "   Password: root" -ForegroundColor White
    Write-Host "   Database: contact_book_db" -ForegroundColor White
    Write-Host ""
    Write-Host "Start MySQL service and run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ MySQL connection successful!" -ForegroundColor Green

# Start Backend in a new PowerShell window
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Blue
$backendScript = @'
cd "D:\contact_book_mysql\backend"
& "venv\Scripts\activate.ps1"
Write-Host "🔧 Backend server starting on http://localhost:5000" -ForegroundColor Cyan
python app.py
'@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a moment for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend in a new PowerShell window
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Blue
$frontendScript = @'
cd "D:\contact_book_mysql\frontend"
Write-Host "🎨 Frontend server starting on http://localhost:3000" -ForegroundColor Cyan
npm start
'@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Final instructions
Write-Host ""
Write-Host "🎉 Contact Book Application Started Successfully!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Features available:" -ForegroundColor Yellow
Write-Host "   ✅ User Registration & Login" -ForegroundColor White
Write-Host "   ✅ Add, Edit, Delete Contacts" -ForegroundColor White
Write-Host "   ✅ Search & Filter Contacts" -ForegroundColor White
Write-Host "   ✅ Import/Export CSV" -ForegroundColor White
Write-Host "   ✅ Send Emails to Contacts" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To stop the application:" -ForegroundColor Red
Write-Host "   Close both PowerShell windows or press Ctrl+C in each" -ForegroundColor White
Write-Host ""
Write-Host "Happy Contact Managing! 📞" -ForegroundColor Green

# Keep this window open
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
