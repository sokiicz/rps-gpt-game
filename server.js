function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializeMinions(width, height, countPerTeam) {
    const minions = [];
    for (const team of TEAMS) {
        for (let i = 0; i < countPerTeam; i++) {
            const x = getRandomInt(0, width - 1);
            const y = getRandomInt(0, height - 1);
            minions.push(new Minion(team, x, y));
        }
    }
    return minions;
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
let players = [];
let games = [];
function initializeGameState(gameId) {
    let game = games.find(g => g.id === gameId);
    if (game) {
        game.minions = [];
        for (const team of TEAMS) {
            for (let i = 0; i < 10; i++) {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                game.minions.push({ team, x, y });
            }
        }
    }
}
function updateAndSyncGameState(gameId) {
    let game = games.find(g => g.id === gameId);
    if (game) {
        // For simplicity, just randomize the minion positions for now
        for (let minion of game.minions) {
            const direction = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
            if (direction === "up" && minion.y > 0) minion.y--;
            else if (direction === "down" && minion.y < 9) minion.y++;
            else if (direction === "left" && minion.x > 0) minion.x--;
            else if (direction === "right" && minion.x < 9) minion.x++;
        }
        io.emit('updateGameState', game.minions);
    }
}
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
        socket.on('startGame', () => {
            const minions = initializeMinions(width, height, 10);
            socket.emit('gameData', minions);
            setInterval(() => updateAndSyncGameState(newGame.id), 100);
        });    
    
    console.log('A user connected');
    let player = {
        id: socket.id,
        team: null
    };
    players.push(player);    
   
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        players = players.filter(p => p.id !== socket.id);
    });
    socket.on('selectTeam', (team) => {
        let player = players.find(p => p.id === socket.id);
        if (player) {
            player.team = team;
            // Check if we have three players with different teams
            let rockPlayer = players.find(p => p.team === "rock");
            let paperPlayer = players.find(p => p.team === "paper");
            let scissorsPlayer = players.find(p => p.team === "scissors");
            if (rockPlayer && paperPlayer && scissorsPlayer) {
                // Start a new game
                let newGame = {
                    id: Date.now(),
                    players: [rockPlayer, paperPlayer, scissorsPlayer]
                };
                games.push(newGame);
                io.emit('startGame', newGame.id);
                initializeGameState(newGame.id);
            }
        }
    });
    socket.on('requestGameState', (gameId) => {
        let game = games.find(g => g.id === gameId);
        if (game) {
            socket.emit('updateGameState', game.minions);
        }
    });
    
    
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
});

app.use(limiter);
