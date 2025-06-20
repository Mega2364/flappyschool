// Flappy Bird Game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.35; // Weniger Gravitation für leichteres Spiel
const FLAP = -7;      // Weniger starker Sprung für mehr Kontrolle
const PIPE_WIDTH = 52;
const PIPE_GAP = 150; // Größerer Abstand zwischen den Röhren
const BIRD_SIZE = 32;
const BIRD_X = 60;

let birdY, birdVelocity, pipes, score, highScore, gameActive;

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const finalScore = document.getElementById('final-score');
const highScoreSpan = document.getElementById('high-score');

// Neue Variablen für benutzerdefinierte Bilder
let birdImg = null;
let bgImg = null;

function resetGame() {
    birdY = canvas.height / 2 - BIRD_SIZE / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    gameActive = true;
    for (let i = 0; i < 3; i++) {
        pipes.push({
            x: canvas.width + i * 180,
            height: Math.floor(Math.random() * (canvas.height - PIPE_GAP - 80)) + 40
        });
    }
}

// Funktion zum Laden eines Bildes
function loadImage(src, callback) {
    const img = new window.Image();
    img.onload = () => callback(img);
    img.src = src;
}

// Funktion zum Setzen des Vogelbildes
window.setBirdImage = function(src) {
    loadImage(src, img => { birdImg = img; });
};
// Funktion zum Setzen des Hintergrundbildes
window.setBackgroundImage = function(src) {
    loadImage(src, img => { bgImg = img; });
};

function drawBackground() {
    // Flappy Bird typischer Hintergrund: Himmel, Wolken, Boden, Gras
    // Himmel
    ctx.fillStyle = '#70c1ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Wolken
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(60, 80, 18, 0, Math.PI*2); ctx.arc(80, 80, 22, 0, Math.PI*2); ctx.arc(100, 80, 16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(200, 60, 14, 0, Math.PI*2); ctx.arc(215, 60, 18, 0, Math.PI*2); ctx.arc(230, 60, 12, 0, Math.PI*2); ctx.fill();
    // Boden
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, canvas.height-60, canvas.width, 60);
    // Gras
    ctx.fillStyle = '#7ec850';
    for(let i=0; i<canvas.width; i+=16) {
        ctx.fillRect(i, canvas.height-60, 12, 12);
    }
}

function drawBird() {
    // Pixel-Art Flappy Bird (16x16 Pixel, skaliert auf BIRD_SIZE)
    const px = [
        // 16x16 Bitmap, 0=transparent, 1=gelb, 2=orange, 3=weiß, 4=schwarz, 5=rot
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
    // Schnabel und Auge
    px[7][14]=2; px[8][14]=2; px[8][13]=2; // orange Schnabel
    px[8][10]=3; // weiß Auge
    px[8][11]=4; // schwarz Pupille
    px[10][3]=5; px[10][4]=5; // roter Flügel
    // Farben
    const colors = {
        0: null,
        1: '#ffe066', // gelb
        2: '#ff9900', // orange
        3: '#fff',    // weiß
        4: '#222',    // schwarz
        5: '#e74c3c', // rot
    };
    const scale = BIRD_SIZE/16;
    for(let y=0; y<16; y++) {
        for(let x=0; x<16; x++) {
            if(px[y][x]) {
                ctx.fillStyle = colors[px[y][x]];
                ctx.fillRect(BIRD_X + x*scale, birdY + y*scale, scale, scale);
            }
        }
    }
}

function drawPipes() {
    ctx.fillStyle = '#388e3c';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.height);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.height + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.height - PIPE_GAP);
    });
}

function drawScore() {
    ctx.save();
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(score, canvas.width/2, 60);
    ctx.fillText(score, canvas.width/2, 60);
    ctx.restore();
}

function update() {
    if (!gameActive) return;
    birdVelocity += GRAVITY;
    birdY += birdVelocity;

    // Bird collision with ground or ceiling
    if (birdY + BIRD_SIZE > canvas.height || birdY < 0) {
        endGame();
        return;
    }

    // Move pipes and check for collisions
    pipes.forEach(pipe => {
        pipe.x -= 2;
        // Collision
        if (
            BIRD_X + BIRD_SIZE > pipe.x &&
            BIRD_X < pipe.x + PIPE_WIDTH &&
            (birdY < pipe.height || birdY + BIRD_SIZE > pipe.height + PIPE_GAP)
        ) {
            endGame();
        }
        // Score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
            score++;
            pipe.passed = true;
        }
    });

    // Remove off-screen pipes and add new ones
    if (pipes[0].x + PIPE_WIDTH < 0) {
        pipes.shift();
        pipes.push({
            x: pipes[pipes.length-1].x + 180,
            height: Math.floor(Math.random() * (canvas.height - PIPE_GAP - 80)) + 40
        });
    }
}

function draw() {
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
}

function gameLoop() {
    update();
    draw();
    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}

function flap() {
    if (!gameActive) return;
    birdVelocity = FLAP;
}

function endGame() {
    gameActive = false;
    finalScore.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }
    highScoreSpan.textContent = highScore;
    gameOverScreen.style.display = 'flex';
}

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    resetGame();
    gameLoop();
}

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
document.addEventListener('keydown', e => {
    if (e.code === 'Space') flap();
});
canvas.addEventListener('pointerdown', flap);

// Init
window.onload = () => {
    highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    draw();
};
