#!/bin/bash

# Geospatial Dashboard Deployment Script for Hostinger VM
# This script automates the deployment process on Ubuntu server

set -e  # Exit on any error

echo "🚀 Starting Geospatial Dashboard Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for Docker group changes to take effect"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
fi

# Check if Node.js is installed (for building)
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed successfully"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not available. Please install Node.js properly."
    exit 1
fi

print_status "Installing dependencies..."
npm install

print_status "Optimizing GeoJSON files..."
npm run optimize

print_status "Building the application..."
npm run build

print_status "Building Docker image..."
docker-compose build

print_status "Starting the application..."
docker-compose up -d

# Wait for the application to start
print_status "Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:80 > /dev/null 2>&1; then
    print_success "Application is running successfully!"
    print_success "Access your dashboard at: http://your-server-ip"
else
    print_error "Application failed to start. Checking logs..."
    docker-compose logs
    exit 1
fi

# Show container status
print_status "Container status:"
docker-compose ps

# Show resource usage
print_status "Resource usage:"
docker stats --no-stream

print_success "Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain name to point to this server"
echo "2. Set up SSL certificate (recommended)"
echo "3. Configure firewall to allow ports 80 and 443"
echo ""
echo "🔧 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart: docker-compose restart"
echo "  Stop: docker-compose down"
echo "  Update: git pull && npm run build && docker-compose up -d --build"
echo ""
echo "📊 Performance monitoring:"
echo "  docker stats"
echo "  docker-compose logs --tail=100"

