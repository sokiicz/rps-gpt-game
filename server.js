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
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    io.on('connection', (socket) => {
        socket.on('startGame', () => {
            const minions = initializeMinions(width, height, 10);
            socket.emit('gameData', minions);
        });
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
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
