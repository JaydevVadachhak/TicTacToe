const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// Log startup info
console.log(`Starting server in ${NODE_ENV} mode`);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const rooms = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create or join a room
    socket.on('joinRoom', (roomId) => {
        // Create room if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                currentPlayer: null,
                board: Array(9).fill(''),
                gameOver: false
            };
        }

        // Check if room is full
        if (rooms[roomId].players.length >= 2) {
            socket.emit('roomFull');
            return;
        }

        // Join the room
        socket.join(roomId);

        // Add player to the room
        const player = {
            id: socket.id,
            symbol: rooms[roomId].players.length === 0 ? 'X' : 'O'
        };

        rooms[roomId].players.push(player);
        socket.emit('playerAssigned', player.symbol);

        // If this is the first player, they start
        if (rooms[roomId].players.length === 1) {
            rooms[roomId].currentPlayer = player.id;
        }

        // If room now has 2 players, start the game
        if (rooms[roomId].players.length === 2) {
            io.to(roomId).emit('gameStart', {
                board: rooms[roomId].board,
                currentPlayer: rooms[roomId].currentPlayer
            });
        }

        // Send room status to the client
        socket.emit('roomStatus', {
            playersCount: rooms[roomId].players.length,
            roomId: roomId
        });
    });

    // Handle player moves
    socket.on('makeMove', ({ roomId, index }) => {
        const room = rooms[roomId];

        // Check if it's a valid move
        if (!room ||
            room.gameOver ||
            room.currentPlayer !== socket.id ||
            room.board[index] !== '' ||
            index < 0 ||
            index >= 9) {
            return;
        }

        // Get player symbol
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // Update the board
        room.board[index] = player.symbol;

        // Check for win or draw
        const winner = checkWinner(room.board);
        if (winner || !room.board.includes('')) {
            room.gameOver = true;
            io.to(roomId).emit('gameOver', {
                board: room.board,
                winner: winner,
                winningPlayer: winner ? socket.id : null
            });
        } else {
            // Switch to the other player
            room.currentPlayer = room.players.find(p => p.id !== socket.id).id;

            // Broadcast the updated board
            io.to(roomId).emit('boardUpdate', {
                board: room.board,
                currentPlayer: room.currentPlayer
            });
        }
    });

    // Handle restart game request
    socket.on('restartGame', (roomId) => {
        const room = rooms[roomId];
        if (!room) return;

        // Reset the game state
        room.board = Array(9).fill('');
        room.gameOver = false;
        room.currentPlayer = room.players[0].id;

        // Notify clients
        io.to(roomId).emit('gameRestart', {
            board: room.board,
            currentPlayer: room.currentPlayer
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Find and clean up any rooms the player was in
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                // Remove player from the room
                room.players.splice(playerIndex, 1);

                // Notify remaining player
                if (room.players.length > 0) {
                    io.to(roomId).emit('opponentLeft');
                } else {
                    // Delete empty room
                    delete rooms[roomId];
                }
            }
        }
    });
});

// Check for a winner
function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return the winning symbol (X or O)
        }
    }

    return null; // No winner
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
}); 