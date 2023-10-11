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

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
