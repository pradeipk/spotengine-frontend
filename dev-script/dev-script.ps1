$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$FrontendDir = (Get-Item $ScriptDir).Parent.FullName
$RootDir = (Get-Item $FrontendDir).Parent.FullName

Write-Host "Starting MySQL container..." -ForegroundColor Green
Set-Location "$ScriptDir"
docker compose up -d

Write-Host "Starting Backend server in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir\spotengine-backend'; npm run start:dev"

Write-Host "Starting Frontend server in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"

Write-Host "All services started successfully!" -ForegroundColor Green
