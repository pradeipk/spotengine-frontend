$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$FrontendDir = (Get-Item $ScriptDir).Parent.FullName
$RootDir = (Get-Item $FrontendDir).Parent.FullName
$BackendDir = Join-Path $RootDir "spotengine-backend"
$EnvDir = Join-Path $RootDir "spotengine-env"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " SpotEngineer Dev Environment Starter   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Helper function to kill listening ports
function Stop-Port {
    param ([int]$Port)
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            if ($conn.State -eq 'Listen') {
                $pidToKill = $conn.OwningProcess
                if ($pidToKill) {
                    Write-Host "Stopping process $pidToKill on port $Port..." -ForegroundColor Yellow
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {}
}

Write-Host "`n[1/6] Stopping any existing Backend and Frontend servers..." -ForegroundColor Green
Stop-Port 3001 # Backend
Stop-Port 3000 # Frontend

# 2. Check and ensure Environment Files
Write-Host "`n[2/6] Checking environment configuration files..." -ForegroundColor Green

$backendEnv = Join-Path $BackendDir ".env"
$backendEnvLocal = Join-Path $BackendDir ".env.local"
$frontendEnvLocal = Join-Path $FrontendDir ".env.local"
$sourceEnv = Join-Path $EnvDir ".env"

if (-not (Test-Path $backendEnv) -and -not (Test-Path $backendEnvLocal)) {
    if (Test-Path $sourceEnv) {
        Write-Host "  Copying .env to backend from spotengine-env..." -ForegroundColor Yellow
        Copy-Item $sourceEnv $backendEnvLocal
        Copy-Item $sourceEnv $backendEnv
    } else {
        Write-Host "  Creating default .env.local for backend..." -ForegroundColor Yellow
        @"
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=spotengine
DB_PASSWORD=Spotengine@484774
DB_DATABASE=spotengine
JWT_SECRET=spotengineer-dev-secret-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRY=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=consistentdeveloper@gmail.com
SMTP_PASS=jcvaouqeaqewcomt
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
"@ | Out-File -FilePath $backendEnvLocal -Encoding utf8
        Copy-Item $backendEnvLocal $backendEnv
    }
}

if (-not (Test-Path $frontendEnvLocal)) {
    Write-Host "  Creating default .env.local for frontend..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" | Out-File -FilePath $frontendEnvLocal -Encoding utf8
}

# 3. Check and ensure dependencies
Write-Host "`n[3/6] Verifying Node dependencies..." -ForegroundColor Green

if (-not (Test-Path (Join-Path $BackendDir "node_modules"))) {
    Write-Host "  Backend node_modules missing. Running npm install..." -ForegroundColor Yellow
    Push-Location $BackendDir
    npm install
    Pop-Location
} else {
    Write-Host "  Backend dependencies OK." -ForegroundColor DarkGray
}

if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "  Frontend node_modules missing. Running npm install..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    npm install
    Pop-Location
} else {
    Write-Host "  Frontend dependencies OK." -ForegroundColor DarkGray
}

# 4. Start Docker MySQL
Write-Host "`n[4/6] Starting MySQL container..." -ForegroundColor Green
Push-Location $ScriptDir
docker compose down 2>$null
docker compose up -d
Pop-Location

Write-Host "  Waiting for MySQL container to be ready..." -ForegroundColor Yellow
$mysqlReady = $false
for ($i = 1; $i -le 15; $i++) {
    $status = docker exec spotengine-mysql mysqladmin ping -h localhost -uroot -proot 2>$null
    if ($status -match "mysqld is alive") {
        $mysqlReady = $true
        Write-Host "  MySQL is ready!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $mysqlReady) {
    Write-Host "  Warning: MySQL readiness check timed out, proceeding anyway..." -ForegroundColor Yellow
}

# 5. Start Backend and Frontend in separate windows
Write-Host "`n[5/6] Starting Backend and Frontend servers in separate windows..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'SpotEngine Backend (:3001)'; cd '$BackendDir'; `$env:ENV_FILE='.env.local'; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'SpotEngine Frontend (:3000)'; cd '$FrontendDir'; npm run dev"

# 6. Actively verify that services are healthy and reachable
Write-Host "`n[6/6] Verifying services health..." -ForegroundColor Yellow

function Test-Endpoint {
    param ([string]$Url, [int]$TimeoutSeconds = 30)
    $startTime = Get-Date
    while ((Get-Date) - $startTime -lt (New-TimeSpan -Seconds $TimeoutSeconds)) {
        try {
            $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($res.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    return $false
}

Write-Host "  Waiting for Backend (http://localhost:3001/api/v1/health)..." -NoNewline
$backendOk = Test-Endpoint "http://localhost:3001/api/v1/health" 35
if ($backendOk) {
    Write-Host " [ONLINE]" -ForegroundColor Green
} else {
    Write-Host " [FAILED / TIMEOUT]" -ForegroundColor Red
}

Write-Host "  Waiting for Frontend (http://localhost:3000)..." -NoNewline
$frontendOk = Test-Endpoint "http://localhost:3000" 30
if ($frontendOk) {
    Write-Host " [ONLINE]" -ForegroundColor Green
} else {
    Write-Host " [FAILED / TIMEOUT]" -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Cyan
if ($backendOk -and $frontendOk) {
    Write-Host " All services started and verified!     " -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host " Frontend:        http://localhost:3000" -ForegroundColor White
    Write-Host " Backend API:     http://localhost:3001/api/v1" -ForegroundColor White
    Write-Host " Health Check:    http://localhost:3001/api/v1/health" -ForegroundColor White
    Write-Host " Swagger Docs:    http://localhost:3001/api/docs" -ForegroundColor White
} else {
    Write-Host " Some services failed to start!          " -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host " Check the newly opened PowerShell terminal windows for compilation/runtime error logs." -ForegroundColor Yellow
}
Write-Host "=========================================`n" -ForegroundColor Cyan
