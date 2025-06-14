# Multiplayer Tic-Tac-Toe

A real-time multiplayer Tic-Tac-Toe game built with Node.js, Express, and Socket.IO.

## Features

- Real-time gameplay with Socket.IO
- Room-based multiplayer system
- Visual feedback for game status
- Responsive design
- Copy-to-clipboard room sharing
- Game state management

## Installation

### Standard Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. For development with auto-restart:
   ```
   npm run dev
   ```

### Docker Deployment

#### Using Docker Compose (recommended)

1. Make sure you have Docker and Docker Compose installed
2. Run the application:
   ```
   docker-compose up -d
   ```
3. Access the application at `http://localhost:3000`
4. To stop the application:
   ```
   docker-compose down
   ```

#### Using Docker directly

1. Build the Docker image:
   ```
   docker build -t tictactoe-app .
   ```
2. Run the container:
   ```
   docker run -p 3000:3000 -d --name tictactoe-container tictactoe-app
   ```
3. Access the application at `http://localhost:3000`
4. To stop the container:
   ```
   docker stop tictactoe-container
   ```

## How to Play

1. Open the game in your browser at `http://localhost:3000`
2. Enter a room ID or leave it blank to generate a random one
3. Share the room ID with a friend
4. When your friend joins, the game will start automatically
5. Take turns placing X's and O's on the board
6. The first player to get three in a row wins!

## Technologies Used

- Node.js
- Express.js
- Socket.IO
- HTML5
- CSS3
- JavaScript (ES6+)
- Docker

## License

ISC 