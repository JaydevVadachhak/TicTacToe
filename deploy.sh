#!/bin/bash

# Exit on error
set -e

echo "Deploying Tic-Tac-Toe application..."

# Build the Docker image
echo "Building Docker image..."
docker build -t tictactoe-app .

# Stop and remove any existing container
echo "Cleaning up existing containers..."
docker stop tictactoe-container 2>/dev/null || true
docker rm tictactoe-container 2>/dev/null || true

# Run the new container
echo "Starting new container..."
docker run -d -p 3000:3000 --name tictactoe-container --restart unless-stopped tictactoe-app

echo "Deployment complete! Application is running at http://localhost:3000" 