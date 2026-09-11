const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const timerVal = document.getElementById('timer-val');
const scoreVal = document.getElementById('score-val');
const startScreen = document.getElementById('start-screen');
const winScreen = document.getElementById('win-screen');
const loseScreen = document.getElementById('lose-screen');

const negativeWords = ['DEPRESSION', 'ANXIETY', 'DOUBT', 'FEAR', 'STRESS', 'FAILURE', 'LONELINESS', 'GUILT', 'ANGER', 'SADNESS'];
const positiveWords = ['HOPE', 'JOY', 'PEACE', 'LOVE', 'STRENGTH', 'HEAL', 'FAITH', 'CALM', 'GRACE', 'LIGHT'];

let gameActive = false;
let score = 0;
let timeLeft = 60;
let playerX;
const playerYOffset = 40; 
const playerWidth = 50;
const playerHeight = 25;
let enemies = [];
let bullets = [];
let particles = [];
let lastSpawnTime = 0;
let spawnInterval = 1500;
let gameTimerInterval;

let moveLeft = false;
let moveRight = false;

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (!gameActive) {
        playerX = canvas.width / 2 - playerWidth / 2;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Universal pointer handlers for hybrid mobile/desktop inputs
document.getElementById('left-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); moveLeft = true; });
document.getElementById('left-btn').addEventListener('pointerup', (e) => { e.preventDefault(); moveLeft = false; });
document.getElementById('left-btn').addEventListener('pointerleave', (e) => { e.preventDefault(); moveLeft = false; });

document.getElementById('right-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); moveRight = true; });
document.getElementById('right-btn').addEventListener('pointerup', (e) => { e.preventDefault(); moveRight = false; });
document.getElementById('right-btn').addEventListener('pointerleave', (e) => { e.preventDefault(); moveRight = false; });

document.getElementById('fire-btn').addEventListener('pointerdown', (e) => { 
    e.preventDefault(); 
    fireBullet(); 
});

// Keyboard configurations
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = true;
    if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); fireBullet(); }
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-win-btn').addEventListener('click', startGame);
document.getElementById('restart-lose-btn').addEventListener('click', startGame);

function startGame() {
    startScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    loseScreen.classList.add('hidden');
    
    score = 0;
    timeLeft = 60;
    enemies = [];
    bullets = [];
    particles = [];
    scoreVal.textContent = score;
    timerVal.textContent = timeLeft;
    resizeCanvas();
    gameActive = true;
    lastSpawnTime = performance.now();

    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        if (!gameActive) return;
        timeLeft--;
        timerVal.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame(true);
        }
    }, 1000);

    requestAnimationFrame(gameLoop);
}

function endGame(isWin) {
    gameActive = false;
    clearInterval(gameTimerInterval);
    if (isWin) {
        winScreen.classList.remove('hidden');
    } else {
        loseScreen.classList.remove('hidden');
    }
}

function fireBullet() {
    if (!gameActive) return;
    
    const text = positiveWords[Math.floor(Math.random() * positiveWords.length)];
    ctx.font = 'bold 14px Arial';
    const textWidth = ctx.measureText(text).width;

    bullets.push({
        x: (playerX + playerWidth / 2) - (textWidth / 2), // Center the word over the ship
        y: canvas.height - playerYOffset - playerHeight,
        text: text,
        width: textWidth,
        height: 14,
        speed: 6
    });
}

function spawnEnemy() {
    const text = negativeWords[Math.floor(Math.random() * negativeWords.length)];
    ctx.font = 'bold 16px Arial';
    const textWidth = ctx.measureText(text).width;
    
    const x = Math.random() * (canvas.width - textWidth - 20) + 10;
    enemies.push({
        x: x,
        y: -20,
        text: text,
        width: textWidth,
        height: 16,
        speed: 1.2 + (60 - timeLeft) * 0.02
    });
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            radius: Math.random() * 3 + 1,
            alpha: 1,
            color: `hsl(${Math.random() * 40 + 190}, 100%, 75%)` // Beautiful bright blues/cyans
        });
    }
}

function gameLoop(timestamp) {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const playerSpeed = 6;
    if (moveLeft && playerX > 0) playerX -= playerSpeed;
    if (moveRight && playerX < canvas.width - playerWidth) playerX += playerSpeed;

    // Draw ship (Now pure white to complement the blues)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const py = canvas.height - playerYOffset;
    ctx.moveTo(playerX + playerWidth / 2, py - playerHeight);
    ctx.lineTo(playerX, py);
    ctx.lineTo(playerX + playerWidth, py);
    ctx.closePath();
    ctx.fill();

    if (timestamp - lastSpawnTime > spawnInterval) {
        spawnEnemy();
        lastSpawnTime = timestamp;
        spawnInterval = Math.max(600, 1500 - (60 - timeLeft) * 15);
    }

    // Update & Draw Positive Word Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.y -= b.speed;
        
        ctx.fillStyle = '#58a6ff'; // Positive Blue
        ctx.font = 'bold 14px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(b.text, b.x, b.y);

        if (b.y < -20) bullets.splice(i, 1);
    }

    // Update & Draw Negative Word Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;

        ctx.fillStyle = '#ff7b72'; // Negative Red/Pink
        ctx.font = 'bold 16px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(e.text, e.x, e.y);

        if (e.y + e.height >= canvas.height - playerYOffset) {
            endGame(false);
            return;
        }

        // AABB (Bounding Box) Collision between Word Bullet and Word Enemy
        for (let j = bullets.length - 1; j >= 0; j--) {
            let b = bullets[j];
            
            if (b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {
                
                createExplosion(e.x + e.width / 2, e.y + e.height / 2);
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                scoreVal.textContent = score;
                break;
            }
        }
    }

    // Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    }

    requestAnimationFrame(gameLoop);
}
