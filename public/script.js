document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const waitingScreen = document.getElementById('waiting-screen');
    const gameScreen = document.getElementById('game-screen');
    const roomIdInput = document.getElementById('room-id');
    const joinBtn = document.getElementById('join-btn');
    const displayRoomId = document.getElementById('display-room-id');
    const copyBtn = document.getElementById('copy-btn');
    const gameRoomId = document.getElementById('game-room-id');
    const playerSymbol = document.getElementById('player-symbol');
    const gameStatus = document.getElementById('game-status');
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const restartBtn = document.getElementById('restart-btn');

    // Game variables
    let socket;
    let roomId;
    let symbol;
    let isMyTurn = false;
    let gameActive = false;

    // Initialize Socket.IO
    function initializeSocket() {
        socket = io();

        // Socket event listeners
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('playerAssigned', (playerSymbol) => {
            symbol = playerSymbol;
            playerSymbol.textContent = symbol;
            console.log(`You are player: ${symbol}`);
        });

        socket.on('roomStatus', (data) => {
            roomId = data.roomId;
            displayRoomId.textContent = roomId;
            gameRoomId.textContent = roomId;

            // If there's only one player, show waiting screen
            if (data.playersCount === 1) {
                showScreen(waitingScreen);
            }
        });

        socket.on('roomFull', () => {
            alert('This room is full. Please try another room.');
            showScreen(welcomeScreen);
        });

        socket.on('gameStart', (data) => {
            showScreen(gameScreen);
            updateBoard(data.board);
            isMyTurn = socket.id === data.currentPlayer;
            updateGameStatus();
            gameActive = true;
        });

        socket.on('boardUpdate', (data) => {
            updateBoard(data.board);
            isMyTurn = socket.id === data.currentPlayer;
            updateGameStatus();
        });

        socket.on('gameOver', (data) => {
            updateBoard(data.board);
            gameActive = false;

            if (data.winner) {
                const isWinner = data.winningPlayer === socket.id;
                gameStatus.textContent = isWinner ? 'You won!' : 'You lost!';
            } else {
                gameStatus.textContent = 'Game ended in a draw!';
            }

            restartBtn.classList.remove('hidden');
        });

        socket.on('gameRestart', (data) => {
            updateBoard(data.board);
            isMyTurn = socket.id === data.currentPlayer;
            updateGameStatus();
            gameActive = true;
            restartBtn.classList.add('hidden');
        });

        socket.on('opponentLeft', () => {
            gameStatus.textContent = 'Your opponent left the game.';
            gameActive = false;
            restartBtn.classList.add('hidden');

            // Show a message and option to go back to welcome screen
            setTimeout(() => {
                if (confirm('Your opponent left. Return to home screen?')) {
                    showScreen(welcomeScreen);
                }
            }, 1000);
        });
    }

    // Event listeners
    joinBtn.addEventListener('click', () => {
        // Generate a random room ID if none provided
        const room = roomIdInput.value.trim() || Math.random().toString(36).substring(2, 8);

        // Initialize socket if not already done
        if (!socket) {
            initializeSocket();
        }

        // Join the room
        socket.emit('joinRoom', room);
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(displayRoomId.textContent)
            .then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    // Add click event to all cells
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (!gameActive || !isMyTurn || cell.textContent !== '') {
                return;
            }

            const index = parseInt(cell.getAttribute('data-index'));
            socket.emit('makeMove', { roomId, index });
        });
    });

    restartBtn.addEventListener('click', () => {
        socket.emit('restartGame', roomId);
    });

    // Helper functions
    function showScreen(screen) {
        welcomeScreen.classList.add('hidden');
        waitingScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');

        screen.classList.remove('hidden');
    }

    function updateBoard(boardState) {
        cells.forEach((cell, index) => {
            cell.textContent = boardState[index];
            cell.className = 'cell'; // Reset classes

            if (boardState[index] === 'X') {
                cell.classList.add('x');
            } else if (boardState[index] === 'O') {
                cell.classList.add('o');
            }
        });
    }

    function updateGameStatus() {
        if (isMyTurn) {
            gameStatus.textContent = 'Your turn';
        } else {
            gameStatus.textContent = "Opponent's turn";
        }
    }
});