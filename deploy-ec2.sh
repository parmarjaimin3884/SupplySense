#!/usr/bin/env bash
# ==============================================================================
# SupplySense — 1-Click AWS EC2 Free Tier Deployment Script
# ==============================================================================
set -e

echo "=================================================="
echo " Starting SupplySense AWS EC2 Deployment Setup..."
echo "=================================================="

# 1. Configure 2GB Swap Memory (Crucial for t2.micro 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "[1/4] Allocating 2GB Swap Memory to prevent t2.micro OOM crashes..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap memory enabled successfully."
else
    echo "[1/4] Swap file already exists."
fi

# 2. Update packages and install Docker
echo "[2/4] Installing Docker and Docker Compose..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

sudo apt-get install -y docker-compose-plugin

# 3. Detect Public IP of the EC2 Instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "localhost")
echo "[3/4] Detected EC2 Public IP: ${PUBLIC_IP}"

# 4. Build and Launch Containers
echo "[4/4] Building and launching SupplySense containers..."
export NEXT_PUBLIC_API_URL="http://${PUBLIC_IP}:8000/api/v1"

sudo docker compose down || true
sudo docker compose build --build-arg NEXT_PUBLIC_API_URL="http://${PUBLIC_IP}:8000/api/v1"
sudo docker compose up -d

echo "=================================================="
echo " SupplySense is LIVE on AWS!"
echo " Frontend : http://${PUBLIC_IP}:3000"
echo " Backend  : http://${PUBLIC_IP}:8000/docs"
echo "=================================================="
