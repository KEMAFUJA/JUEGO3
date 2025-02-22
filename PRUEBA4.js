const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Variables del jugador
let playerX = canvas.width / 2;
let playerY = canvas.height - 30;
const playerSpeed = 8;

// Variables del juego
let obstacles = [];
let foods = [];
let score = 0;
let gameActive = true;
let obstaclesPerSpawn = 1; // Obstáculos por oleada (comienza en 1)
const maxObstaclesPerSpawn = 15; // Máximo de 10 obstáculos por oleada
let obstacleSpawnInterval = 1000; // Intervalo inicial: 2 segundos

// ========== BUCLE PRINCIPAL ==========
function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateObstacles();
    updateFoods();
    updateScore();
    requestAnimationFrame(gameLoop);
}

// ========== GENERAR OBJETOS ==========
function spawnRandomObject() {
    const isFood = Math.random() < 0.3; // 30% de comida, 70% de obstáculos
    
    if (isFood) {
        foods.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            speed: 2
        });
    } else {
        obstacles.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            speed: 4
        });
    }
    
    setTimeout(spawnRandomObject, 1500); // Genera cada 1.5 segundos
}
// ========== GENERAR OLEADAS DE OBSTÁCULOS ==========
function spawnObstacleWave() {
    if (!gameActive) return;
    
    // Generar múltiples obstáculos en cada oleada
    for (let i = 0; i < obstaclesPerSpawn; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            speed: 3 + Math.floor(score / 100) // Velocidad aumenta con la puntuación
        });
    }
    
    // Programar próxima oleada
    setTimeout(spawnObstacleWave, obstacleSpawnInterval);
}

// Aumentar la cantidad de obstáculos cada 10 segundos
setInterval(() => {
    if (obstaclesPerSpawn < maxObstaclesPerSpawn) {
        obstaclesPerSpawn++; // Aumentar la cantidad de obstáculos por oleada
    }
}, 10000); // Cada 10 segundos

// ========== ACTUALIZAR OBSTÁCULOS ==========
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        ctx.fillStyle = '#E74C3C'; // Rojo: peligro
        ctx.fillRect(obstacle.x, obstacle.y, 20, 20);

        // Colisión con obstáculo
        if (checkCollision(playerX, playerY, 30, 30, obstacle.x, obstacle.y, 20, 20)) {
            gameOver();
            return;
        }

        if (obstacle.y > canvas.height) obstacles.splice(index, 1);
    });
}


// Variables para la animación de color
let colorIndex = 0;
const colors = ['#0300a2', '#0f00b0', '#2b00ff']; // Colores del @keyframes
const colorscomida = ['#81ff76', '#00ff2f', '#00a21e']; // Colores del @keyframes
const colorChangeSpeed = 0.025; // Velocidad de cambio de color

// ========== ACTUALIZAR COMIDA ==========
function updateFoods() {
    foods.forEach((food, index) => {
        food.y += food.speed;
      
        colorIndex += colorChangeSpeed;
        if (colorIndex >= colorscomida.length) colorIndex = 0; // Reiniciar el índice
    
        // Obtener el color actual
        const currentColor = colorscomida[Math.floor(colorIndex)];
        ctx.fillStyle = currentColor;
    
        // Dibujar el jugador
        ctx.fillRect(food.x, food.y, 20, 20);
    
        // Colisión con comida
        if (checkCollision(playerX, playerY, 30, 30, food.x, food.y, 20, 20)) {
            score += 10; // Suma 10 puntos por comida
            foods.splice(index, 1);
        }

        if (food.y > canvas.height) foods.splice(index, 1);
    });
}

// ========== DETECCIÓN DE COLISIÓN ==========
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && 
           x1 + w1 > x2 && 
           y1 < y2 + h2 && 
           y1 + h1 > y2;
}

// ========== DIBUJAR JUGADOR ==========
function drawPlayer() {
    // Cambiar el color gradualmente
    colorIndex += colorChangeSpeed;
    if (colorIndex >= colors.length) colorIndex = 0; // Reiniciar el índice

    // Obtener el color actual
    const currentColor = colors[Math.floor(colorIndex)];
    ctx.fillStyle = currentColor;

    // Dibujar el jugador
    ctx.fillRect(playerX, playerY, 30, 30);
}

// ========== PUNTUACIÓN ==========
function updateScore() {
    score += 0.01;
    ctx.fillStyle = '#2C3E50';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntuacion: ${Math.floor(score)}`, 10, 30);
}

// ========== MANEJO DE PUNTUACIONES ==========
async function saveScore(name, score) {
    try {
        const response = await fetch('guardar_puntaje2.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: name, puntaje: Math.floor(score) })
        });
        
        const data = await response.json();
        if (data.success) loadHighScores(); // Actualizar lista después de guardar
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

async function loadHighScores() {
    try {
        const response = await fetch('obtener_puntajes2.php');
        const data = await response.json();
        updateHighScoresDisplay(data);
    } catch (error) {
        console.error('Error al cargar puntuaciones:', error);
    }
}

function updateHighScoresDisplay(top10) {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = top10.map((entry, index) => {
        return `<li>${index+1}. ${entry.nombre}: ${entry.puntaje}</li>`;
    }).join('');
}

// ========== MODIFICAR EL GAME OVER ==========
function gameOver() {
    gameActive = false;
    const name = prompt('Juego Terminado!!! Ingresa tu nombre:', 'Anonimo');
    if (name) saveScore(name, Math.floor(score));
    loadHighScores(); // Actualizar lista
    location.reload();
}

// ========== CONTROLES ==========
window.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft' && playerX > 0) playerX -= playerSpeed;
    if (e.key === 'ArrowRight' && playerX < canvas.width - 30) playerX += playerSpeed;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    playerX = e.touches[0].clientX - rect.left - 15;
    playerX = Math.max(0, Math.min(playerX, canvas.width - 30));
});

// ========== INICIAR ==========
spawnRandomObject(); // Genera primer objeto
spawnObstacleWave();
loadHighScores(); // Cargar puntuaciones al inicio
gameLoop(); // Inicia el juego