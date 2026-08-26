$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$FrontendDir = (Get-Item $ScriptDir).Parent.FullName
$RootDir = (Get-Item $FrontendDir).Parent.FullName

function Stop-Port {
    param ([int]$Port)
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            if ($conn.State -eq 'Listen') {
                $pidToKill = $conn.OwningProcess
                if ($pidToKill) {
                    Write-Host "Killing process $pidToKill on port $Port..." -ForegroundColor Yellow
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {}
}

Write-Host "Stopping existing Backend and Frontend servers..." -ForegroundColor Green
Stop-Port 3001 # Backend port
Stop-Port 3000 # Frontend port

Write-Host "Stopping and restarting MySQL container..." -ForegroundColor Green
Set-Location "$ScriptDir"
docker compose down
docker compose up -d

Write-Host "Starting Backend server in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:ENV_FILE='.env.local'; cd '$RootDir\spotengine-backend'; npm run start:dev"

Write-Host "Starting Frontend server in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"

Write-Host "All services started successfully!" -ForegroundColor Green
