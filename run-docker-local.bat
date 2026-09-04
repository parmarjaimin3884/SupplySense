@echo off
echo =======================================================
echo         SupplySense - Running Locally with Docker
echo =======================================================

echo [1/2] Building and starting local containers...
docker compose up -d --build

echo.
echo [2/2] Checking running containers...
docker compose ps

echo.
echo =======================================================
echo  SupplySense is running locally!
echo.
echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:8000/health
echo =======================================================
echo.
echo To view logs:  docker compose logs -f
echo To stop:       docker compose down
echo.
pause
