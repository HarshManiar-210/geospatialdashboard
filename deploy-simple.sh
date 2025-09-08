#!/bin/bash

# Simple One-Command Deployment Script
# This script makes deployment super easy with just one command

set -e

echo "🚀 Starting Geospatial Dashboard Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓ SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_info "Docker is not running. Starting Docker..."
    if command -v systemctl > /dev/null 2>&1; then
        sudo systemctl start docker
    elif command -v service > /dev/null 2>&1; then
        sudo service docker start
    else
        echo "Please start Docker manually and run this script again."
        exit 1
    fi
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
print_status "Building and starting the application..."
docker-compose up -d --build

# Wait for the application to be ready
print_status "Waiting for application to start..."
sleep 10

# Check if the application is running
if docker-compose ps | grep -q "Up"; then
    print_success "Application deployed successfully!"
    echo ""
    echo "🌐 Access your dashboard at:"
    echo "   Local:  http://localhost"
    echo "   External: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop app:     docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo "   Update:       docker-compose up -d --build"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi
