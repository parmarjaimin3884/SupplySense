@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo         SupplySense - Deploy Update to EC2
echo =======================================================

set EC2_IP=3.109.208.147
set KEY_FILE=supplysense-key.pem

if not exist "%KEY_FILE%" (
    echo [ERROR] %KEY_FILE% not found in current directory!
    pause
    exit /b 1
)

echo [1/4] Packaging local code changes (excluding secrets and cache)...
tar -czf update.tar.gz --exclude=".claude" --exclude=".git" --exclude="node_modules" --exclude=".next" --exclude="venv" --exclude="__pycache__" --exclude="*.pem" --exclude=".env" --exclude=".env.*" SupplySense_Backend SupplySense_Frontend docker-compose.yml
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to package code.
    pause
    exit /b 1
)

echo [2/4] Uploading package to EC2 (%EC2_IP%)...
scp -i "%KEY_FILE%" -o StrictHostKeyChecking=no update.tar.gz ubuntu@%EC2_IP%:~/SupplySense/
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to upload code to EC2.
    del /f /q update.tar.gz 2>nul
    pause
    exit /b 1
)

del /f /q update.tar.gz 2>nul

echo [3/4] Extracting code on EC2...
ssh -i "%KEY_FILE%" -o StrictHostKeyChecking=no ubuntu@%EC2_IP% "cd ~/SupplySense && tar -xzf update.tar.gz && rm -f update.tar.gz"

echo [4/4] Rebuilding and restarting containers on EC2...
echo (This will take ~1-3 minutes if frontend changed)...
ssh -i "%KEY_FILE%" -o StrictHostKeyChecking=no ubuntu@%EC2_IP% "cd ~/SupplySense && export NEXT_PUBLIC_API_URL=\"http://%EC2_IP%:8000/api/v1\" && sudo docker compose build --build-arg NEXT_PUBLIC_API_URL=\"http://%EC2_IP%:8000/api/v1\" && sudo docker compose up -d"

echo.
echo =======================================================
echo  DEPLOYMENT COMPLETE! 
echo.
echo  Frontend : http://%EC2_IP%:3000
echo  Backend  : http://%EC2_IP%:8000/health
echo =======================================================
echo.
pause
