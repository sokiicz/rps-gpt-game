const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
let players = [];
let games = [];
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
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
        }
    }
});


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
