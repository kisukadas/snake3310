const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
// The canvas is 400x240 (defined in HTML). 
// Let's make grid size 20px, so 20x12 grid.
const GRID_SIZE = 20; 
const TILE_COUNT_X = canvas.width / GRID_SIZE;
const TILE_COUNT_Y = canvas.height / GRID_SIZE;

// Colors
const COLOR_BG = '#C7F0D8';
const COLOR_FG = '#43523D';

// Game State
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let speed = 100; // ms per frame
let isGameRunning = false;

// Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highscore');

// Initialize
function init() {
    highScoreEl.textContent = `HI: ${highScore}`;
    resetGame();
    // Start the loop
    gameLoop = setInterval(update, speed);
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dx = 1; // Start moving right
    dy = 0;
    score = 0;
    scoreEl.textContent = `SCORE: ${score}`;
    spawnFood();
    isGameRunning = true;
}

function spawnFood() {
    // Random position
    food.x = Math.floor(Math.random() * TILE_COUNT_X);
    food.y = Math.floor(Math.random() * TILE_COUNT_Y);

    // Check if food spawned on snake body
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            spawnFood(); // Try again
            break;
        }
    }
}

function update() {
    if (!isGameRunning) return;

    // Move Snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Collision with walls (Die)
    if (head.x < 0 || head.x >= TILE_COUNT_X || head.y < 0 || head.y >= TILE_COUNT_Y) {
        gameOver();
        return;
    }

    // Collision with self
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = `SCORE: ${score}`;
        spawnFood();
        // Speed up slightly?
        // clearInterval(gameLoop);
        // speed = Math.max(50, speed - 2);
        // gameLoop = setInterval(update, speed);
    } else {
        snake.pop(); // Remove tail
    }

    draw();
}

function draw() {
    // Clear screen
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = COLOR_FG;
    // Draw food as a circle or block? Classic was blocky.
    // Let's do a slightly smaller block to look like a pixel
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

    // Draw Snake
    ctx.fillStyle = COLOR_FG;
    snake.forEach(part => {
        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        // Optional: small gap between segments for "pixel" look
        ctx.fillStyle = COLOR_BG;
        ctx.strokeRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.fillStyle = COLOR_FG;
    });
}

function gameOver() {
    isGameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = `HI: ${highScore}`;
    }
    
    // Flash screen
    ctx.fillStyle = COLOR_FG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setTimeout(() => {
        alert(`GAME OVER\nScore: ${score}`);
        resetGame();
    }, 100);
}

// Controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } break;
        case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } break;
        case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } break;
        case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } break;
    }
});

// Button controls
document.getElementById('up').addEventListener('click', () => { if (dy !== 1) { dx = 0; dy = -1; } });
document.getElementById('down').addEventListener('click', () => { if (dy !== -1) { dx = 0; dy = 1; } });
document.getElementById('left').addEventListener('click', () => { if (dx !== 1) { dx = -1; dy = 0; } });
document.getElementById('right').addEventListener('click', () => { if (dx !== -1) { dx = 1; dy = 0; } });

// Start
init();
