let gameInterval;

// Game constants
const ROCK = "rock";
const PAPER = "paper";
const SCISSORS = "scissors";
const TEAMS = [ROCK, PAPER, SCISSORS];
const CELL_SIZE = 50;  // size of each minion in pixels

// Winning conditions
const WINNERS = {
    [ROCK]: SCISSORS,
    [PAPER]: ROCK,
    [SCISSORS]: PAPER
};

class Minion {
    constructor(team, x, y) {
        this.team = team;
        this.x = x;
        this.y = y;
    }

    move(width, height) {
        const direction = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
        if (direction === "up" && this.y > 0) this.y--;
        else if (direction === "down" && this.y < height - 1) this.y++;
        else if (direction === "left" && this.x > 0) this.x--;
        else if (direction === "right" && this.x < width - 1) this.x++;
    }
}

let minions = [];

function initializeMinions(width, height, countPerTeam) {
    minions = [];
    for (const team of TEAMS) {
        for (let i = 0; i < countPerTeam; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            minions.push(new Minion(team, x, y));
        }
    }
}

function checkCollisions() {
    const positions = {};
    for (const minion of minions) {
        const pos = `${minion.x},${minion.y}`;
        if (positions[pos]) {
            const otherMinion = positions[pos];
            if (minion.team !== otherMinion.team) {
                if (WINNERS[minion.team] === otherMinion.team) {
                    otherMinion.team = minion.team;
                } else {
                    minion.team = otherMinion.team;
                }
            }
        } else {
            positions[pos] = minion;
        }
    }
}

function drawGame(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Clear the canvas

    ctx.font = "20px Arial";

    for (const minion of minions) {
        ctx.beginPath();
        ctx.arc(minion.x * CELL_SIZE + CELL_SIZE / 2, minion.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#e0e8f0";
        ctx.fill();
        ctx.fillStyle = "black";
        if (minion.team === ROCK) {
            ctx.fillText("🗿", minion.x * CELL_SIZE + CELL_SIZE / 4, minion.y * CELL_SIZE + CELL_SIZE / 1.5);
        } 
        else if (minion.team === PAPER) {
            ctx.fillText("🧻", minion.x * CELL_SIZE + CELL_SIZE / 4, minion.y * CELL_SIZE + CELL_SIZE / 1.5);
        } 
        else {
            ctx.fillText("✂️", minion.x * CELL_SIZE + CELL_SIZE / 4, minion.y * CELL_SIZE + CELL_SIZE / 1.5);
        }
    }
}

function gameTick(ctx, width, height) {
    for (const minion of minions) {
        minion.move(width, height);
    }

    checkCollisions();
    drawGame(ctx);

    // Check for end game condition
    const teams = new Set(minions.map(minion => minion.team));
    if (teams.size === 1) {
        document.getElementById("result").textContent = `Result: ${[...teams][0]} wins!`;
    }
}

// Event listener for the start button
document.getElementById("startButton").addEventListener("click", function() {
        if (isGameRunning) {
        return;
    }
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const width = canvas.width / CELL_SIZE;
    const height = canvas.height / CELL_SIZE;

    // Reset the game state
    minions = [];
    initializeMinions(width, height, 10);
    clearInterval(gameInterval);  // Clear any existing game interval
    gameInterval = setInterval(() => gameTick(ctx, width, height), 100);

    // Disable team buttons
    const teamButtons = document.querySelectorAll('.team-button');
    teamButtons.forEach(button => {
        button.disabled = true;
    });
    isGameRunning = true;
});

let playerTeam = null;
let wins = 0;
let losses = 0;

document.getElementById("rockButton").addEventListener("click", () => selectTeam(ROCK));
document.getElementById("paperButton").addEventListener("click", () => selectTeam(PAPER));
document.getElementById("scissorsButton").addEventListener("click", () => selectTeam(SCISSORS));

function selectTeam(team) {
    playerTeam = team;
    document.getElementById("startButton").disabled = false; // Enable the start button once a team is selected
    socket.emit('selectTeam', team);
}

function updateScoreboard() {
    document.getElementById("scoreboard").textContent = `Wins: ${wins} | Losses: ${losses}`;
}

const socket = io();

function gameTick(ctx, width, height) {
    for (const minion of minions) {
        minion.move(width, height);
    }

    checkCollisions();
    drawGame(ctx);

    // Check for end game condition
    const teams = new Set(minions.map(minion => minion.team));
    if (teams.size === 1) {
        const winningTeam = [...teams][0];
        document.getElementById("result").textContent = `Result: ${winningTeam} wins!`;
        
        if (winningTeam === playerTeam) {
            wins++;
        } else {
            losses++;
        }
        updateScoreboard();
        
        // Disable further gameTicks after the game ends
        clearInterval(gameInterval);
            
        // Re-enable team buttons
    const teamButtons = document.querySelectorAll('.team-button');
    teamButtons.forEach(button => {
        button.disabled = false;
    });
    isGameRunning = false;
}
}

function resetTeamButtons() {
    document.getElementById("rockButton").classList.remove("selected");
    document.getElementById("paperButton").classList.remove("selected");
    document.getElementById("scissorsButton").classList.remove("selected");
}

function selectTeam(team) {
    resetTeamButtons();
    playerTeam = team;
    document.getElementById(team + "Button").classList.add("selected");
    document.getElementById("startButton").disabled = false; // Enable the start button once a team is selected
}

let isGameRunning = false;

