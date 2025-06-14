@echo off
echo Deploying Tic-Tac-Toe application...

REM Build the Docker image
echo Building Docker image...
docker build -t tictactoe-app .

REM Stop and remove any existing container
echo Cleaning up existing containers...
docker stop tictactoe-container 2>nul || echo Container not running
docker rm tictactoe-container 2>nul || echo Container not found

REM Run the new container
echo Starting new container...
docker run -d -p 3000:3000 --name tictactoe-container --restart unless-stopped tictactoe-app

echo Deployment complete! Application is running at http://localhost:3000 