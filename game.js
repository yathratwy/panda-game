// ==================== GAME SETUP ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('gameOverlay');
const timeDisplay = document.getElementById('timeDisplay');
const bambooCountDisplay = document.getElementById('bambooCount');
const currentLevelDisplay = document.getElementById('currentLevel');
const totalStarsDisplay = document.getElementById('totalStars');
const levelIndicator = document.getElementById('levelIndicator');
const goalIndicator = document.getElementById('goalIndicator');
const controlsHint = document.getElementById('controlsHint');
const debugKeys = document.getElementById('debugKeys');

// Game modes
const MODE_MAP = 'map';
const MODE_PLAYING = 'playing';
let currentMode = MODE_MAP;

// Game state
let gameRunning = false;
let gameTime = 0;
let lastTime = 0;
let jaguarSpawnTimer = 0;
let bambooCollected = 0;
let currentLevelIndex = -1;
let selectedLevelIndex = 0;

// Keyboard state - track which keys are currently pressed
const keysPressed = {
    up: false,
    down: false,
    left: false,
    right: false
};

// ==================== LEVEL DATA ====================
const levels = [
    {
        id: 1, name: "Bamboo Forest", icon: "🎋",
        x: 150, y: 280, unlocked: true, completed: false, stars: 0,
        bambooGoal: 5, maxJaguars: 2, jaguarSpeed: 1.5, spawnInterval: 15000,
        theme: { bg1: '#c8e6c9', bg2: '#a5d6a7', bg3: '#81c784', grassColor: '#4a7c4f' },
        obstacles: [
            { type: 'tree', x: 120, y: 100 }, { type: 'tree', x: 680, y: 120 },
            { type: 'tree', x: 150, y: 380 }, { type: 'tree', x: 650, y: 400 },
            { type: 'rock', x: 250, y: 150 },
            { type: 'bridge', x: 400, y: 420, width: 120, height: 30 }
        ]
    },
    {
        id: 2, name: "Mountain Peak", icon: "⛰️",
        x: 300, y: 120, unlocked: false, completed: false, stars: 0,
        bambooGoal: 7, maxJaguars: 2, jaguarSpeed: 1.8, spawnInterval: 12000,
        theme: { bg1: '#b0bec5', bg2: '#90a4ae', bg3: '#78909c', grassColor: '#607d8b' },
        obstacles: [
            { type: 'rock', x: 150, y: 150 }, { type: 'rock', x: 650, y: 150 },
            { type: 'rock', x: 550, y: 100 }, { type: 'rock', x: 200, y: 350 },
            { type: 'rock', x: 600, y: 350 },
            { type: 'bridge', x: 400, y: 180, width: 150, height: 30 }
        ]
    },
    {
        id: 3, name: "Desert Oasis", icon: "🏜️",
        x: 500, y: 350, unlocked: false, completed: false, stars: 0,
        bambooGoal: 8, maxJaguars: 3, jaguarSpeed: 2.0, spawnInterval: 10000,
        theme: { bg1: '#ffe0b2', bg2: '#ffcc80', bg3: '#ffb74d', grassColor: '#8d6e63' },
        obstacles: [
            { type: 'rock', x: 150, y: 200 }, { type: 'rock', x: 650, y: 300 },
            { type: 'rock', x: 550, y: 150 }, { type: 'rock', x: 250, y: 350 },
            { type: 'bridge', x: 400, y: 400, width: 100, height: 30 }
        ]
    },
    {
        id: 4, name: "Snowy Tundra", icon: "❄️",
        x: 650, y: 150, unlocked: false, completed: false, stars: 0,
        bambooGoal: 10, maxJaguars: 3, jaguarSpeed: 1.6, spawnInterval: 10000,
        theme: { bg1: '#e3f2fd', bg2: '#bbdefb', bg3: '#90caf9', grassColor: '#b3e5fc' },
        obstacles: [
            { type: 'tree', x: 150, y: 120 }, { type: 'tree', x: 650, y: 120 },
            { type: 'tree', x: 550, y: 380 }, { type: 'rock', x: 200, y: 350 },
            { type: 'rock', x: 600, y: 180 }
        ]
    },
    {
        id: 5, name: "Jungle Temple", icon: "🛕",
        x: 400, y: 420, unlocked: false, completed: false, stars: 0,
        bambooGoal: 12, maxJaguars: 3, jaguarSpeed: 2.2, spawnInterval: 8000,
        theme: { bg1: '#a5d6a7', bg2: '#81c784', bg3: '#66bb6a', grassColor: '#2e7d32' },
        obstacles: [
            { type: 'rock', x: 250, y: 120 }, { type: 'tree', x: 100, y: 200 },
            { type: 'tree', x: 700, y: 200 }, { type: 'tree', x: 150, y: 400 },
            { type: 'tree', x: 650, y: 400 }, { type: 'rock', x: 200, y: 300 },
            { type: 'rock', x: 600, y: 300 }
        ]
    }
];

// Game objects
const panda = { x: 400, y: 250, size: 45, speed: 4.5 };
let jaguars = [];
let obstacles = [];
let bambooPickups = [];
let grass = [];

// ==================== SAVE/LOAD ====================
function loadProgress() {
    const saved = localStorage.getItem('pandaProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        levels.forEach((level, i) => {
            if (progress[i]) {
                level.unlocked = progress[i].unlocked;
                level.completed = progress[i].completed;
                level.stars = progress[i].stars;
            }
        });
    }
    updateTotalStars();
}

function saveProgress() {
    const progress = levels.map(l => ({
        unlocked: l.unlocked,
        completed: l.completed,
        stars: l.stars
    }));
    localStorage.setItem('pandaProgress', JSON.stringify(progress));
}

function updateTotalStars() {
    const total = levels.reduce((sum, l) => sum + l.stars, 0);
    totalStarsDisplay.textContent = total;
}

// ==================== KEYBOARD CONTROLS ====================
function setupKeyboardControls() {
    // Use both keydown and keyup to track key state
    document.addEventListener('keydown', function(e) {
        handleKeyDown(e);
    }, true);
    
    document.addEventListener('keyup', function(e) {
        handleKeyUp(e);
    }, true);
}

function handleKeyDown(e) {
    const key = e.key;
    const code = e.code;
    
    // Track arrow keys for movement - check both key and code
    if (key === 'ArrowUp' || code === 'ArrowUp' || key === 'w' || key === 'W' || code === 'KeyW') {
        keysPressed.up = true;
    }
    if (key === 'ArrowDown' || code === 'ArrowDown' || key === 's' || key === 'S' || code === 'KeyS') {
        keysPressed.down = true;
    }
    if (key === 'ArrowLeft' || code === 'ArrowLeft' || key === 'a' || key === 'A' || code === 'KeyA') {
        keysPressed.left = true;
    }
    if (key === 'ArrowRight' || code === 'ArrowRight' || key === 'd' || key === 'D' || code === 'KeyD') {
        keysPressed.right = true;
    }
    
    // Update debug display
    if (debugKeys) {
        debugKeys.textContent = `Key: ${key} Code: ${code} | Mode: ${currentMode} | Keys: U:${keysPressed.up} D:${keysPressed.down} L:${keysPressed.left} R:${keysPressed.right}`;
    }
    
    // Prevent default for arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault();
    }
    
    // Handle different game states
    if (overlay.classList.contains('visible')) {
        handleOverlayKeys(key);
    } else if (currentMode === MODE_MAP) {
        handleMapKeys(key);
    } else if (currentMode === MODE_PLAYING) {
        handleGameKeys(key);
    }
}

function handleKeyUp(e) {
    const key = e.key;
    const code = e.code;
    
    if (key === 'ArrowUp' || code === 'ArrowUp' || key === 'w' || key === 'W' || code === 'KeyW') {
        keysPressed.up = false;
    }
    if (key === 'ArrowDown' || code === 'ArrowDown' || key === 's' || key === 'S' || code === 'KeyS') {
        keysPressed.down = false;
    }
    if (key === 'ArrowLeft' || code === 'ArrowLeft' || key === 'a' || key === 'A' || code === 'KeyA') {
        keysPressed.left = false;
    }
    if (key === 'ArrowRight' || code === 'ArrowRight' || key === 'd' || key === 'D' || code === 'KeyD') {
        keysPressed.right = false;
    }
}

function handleOverlayKeys(key) {
    if (key === 'Enter' || key === ' ') {
        const btn = document.getElementById('startBtn') || 
                    document.getElementById('nextBtn') || 
                    document.getElementById('retryBtn');
        if (btn) btn.click();
    }
    if (key === 'r' || key === 'R') {
        const btn = document.getElementById('retryBtn');
        if (btn) btn.click();
    }
    if (key === 'm' || key === 'M' || key === 'Escape') {
        const btn = document.getElementById('mapBtn');
        if (btn) btn.click();
    }
}

function handleMapKeys(key) {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        selectedLevelIndex = (selectedLevelIndex - 1 + levels.length) % levels.length;
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        selectedLevelIndex = (selectedLevelIndex + 1) % levels.length;
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        selectedLevelIndex = findNearestLevel('up');
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
        selectedLevelIndex = findNearestLevel('down');
    }
    if (key === 'Enter' || key === ' ') {
        if (levels[selectedLevelIndex].unlocked) {
            startLevel(selectedLevelIndex);
        }
    }
    if (key >= '1' && key <= '5') {
        const levelNum = parseInt(key) - 1;
        if (levels[levelNum] && levels[levelNum].unlocked) {
            selectedLevelIndex = levelNum;
            startLevel(levelNum);
        }
    }
}

function handleGameKeys(key) {
    if (key === 'm' || key === 'M' || key === 'Escape') {
        showMap();
    }
}

function findNearestLevel(direction) {
    const current = levels[selectedLevelIndex];
    let bestIndex = selectedLevelIndex;
    let bestDist = Infinity;
    
    levels.forEach((level, index) => {
        if (index === selectedLevelIndex) return;
        
        const dx = level.x - current.x;
        const dy = level.y - current.y;
        
        const isCorrectDirection = 
            (direction === 'up' && dy < -20) ||
            (direction === 'down' && dy > 20);
        
        if (isCorrectDirection) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist) {
                bestDist = dist;
                bestIndex = index;
            }
        }
    });
    
    return bestIndex;
}

// ==================== DRAWING FUNCTIONS ====================
function drawPanda(x, y, size) {
    // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.45, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y - size * 0.4, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.35, y - size * 0.4, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eye patches
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.18, y - size * 0.08, size * 0.14, size * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.18, y - size * 0.08, size * 0.14, size * 0.18, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x - size * 0.13, y - size * 0.08, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.17, y - size * 0.08, size * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.3, y + size * 0.1, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y + size * 0.1, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawJaguar(x, y, size) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.5, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y - size * 0.3);
    ctx.lineTo(x - size * 0.25, y - size * 0.5);
    ctx.lineTo(x - size * 0.15, y - size * 0.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.35, y - size * 0.3);
    ctx.lineTo(x + size * 0.25, y - size * 0.5);
    ctx.lineTo(x + size * 0.15, y - size * 0.3);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.18, y - size * 0.1, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.18, y - size * 0.1, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.18, y - size * 0.1, size * 0.03, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.18, y - size * 0.1, size * 0.03, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.05, y + size * 0.15);
    ctx.lineTo(x - size * 0.03, y + size * 0.25);
    ctx.lineTo(x - size * 0.01, y + size * 0.15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.05, y + size * 0.15);
    ctx.lineTo(x + size * 0.03, y + size * 0.25);
    ctx.lineTo(x + size * 0.01, y + size * 0.15);
    ctx.fill();
}

function drawTree(x, y, size) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 8, y + 10, 16, 25);
    
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, y - 5, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(x + 10, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawRock(x, y, width, height) {
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.ellipse(x, y, (width || 60) * 0.5, (height || 45) * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 8, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBridge(x, y, width, height) {
    ctx.fillStyle = 'rgba(100, 149, 237, 0.4)';
    ctx.fillRect(x - width/2 - 10, y - 5, width + 20, height + 15);
    
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x - width/2, y, width, height);
}

function drawBambooPickup(bamboo) {
    const wobbleOffset = Math.sin(bamboo.wobble) * 2;
    const x = bamboo.x;
    const y = bamboo.y + wobbleOffset;
    const size = bamboo.size;
    
    ctx.fillStyle = 'rgba(144, 238, 144, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#7ab37e';
    ctx.fillRect(x - 5, y - size * 0.6, 10, size * 1.2);
    
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(x + 12, y - 10, 12, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
}

// ==================== MAP ====================
function drawMap() {
    // Ocean
    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land
    ctx.fillStyle = '#a5d6a7';
    ctx.beginPath();
    ctx.ellipse(400, 300, 350, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paths
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    ctx.moveTo(levels[0].x, levels[0].y);
    ctx.lineTo(levels[1].x, levels[1].y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(levels[1].x, levels[1].y);
    ctx.lineTo(levels[2].x, levels[2].y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(levels[1].x, levels[1].y);
    ctx.lineTo(levels[3].x, levels[3].y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(levels[2].x, levels[2].y);
    ctx.lineTo(levels[4].x, levels[4].y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Level markers
    levels.forEach((level, index) => {
        drawLevelMarker(level, index === selectedLevelIndex);
    });

    // Panda on selected level
    const sel = levels[selectedLevelIndex];
    drawPanda(sel.x, sel.y - 50, 35);

    // Title
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 28px Bangers, cursive';
    ctx.textAlign = 'center';
    ctx.fillText('WORLD MAP', canvas.width / 2, 40);

    // Instructions
    ctx.font = '16px Quicksand, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('Arrow keys to select, ENTER to play', canvas.width / 2, canvas.height - 20);
}

function drawLevelMarker(level, isSelected) {
    const x = level.x;
    const y = level.y;
    const radius = isSelected ? 42 : 35;

    // Selection glow
    if (isSelected) {
        ctx.strokeStyle = '#ff5722';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Circle
    ctx.fillStyle = !level.unlocked ? '#9e9e9e' : (level.completed ? '#ffd54f' : '#fff');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = isSelected ? '#ff5722' : '#5d4037';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Icon
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(level.unlocked ? level.icon : '🔒', x, y);

    // Level name
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 12px Quicksand, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(level.name, x, y + radius + 10);
}

// ==================== GAME LOGIC ====================
function generateGrass() {
    grass = [];
    for (let i = 0; i < 40; i++) {
        grass.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
    }
}

function generateObstacles(level) {
    obstacles = [];
    level.obstacles.forEach(obs => {
        obstacles.push({
            ...obs,
            width: obs.width || 70,
            height: obs.height || 70,
            radius: (obs.type === 'bridge') ? null : 30
        });
    });
}

function spawnBamboo() {
    for (let attempts = 0; attempts < 50; attempts++) {
        const x = 60 + Math.random() * (canvas.width - 120);
        const y = 60 + Math.random() * (canvas.height - 120);
        
        let overlapping = false;
        for (const obs of obstacles) {
            const dx = x - obs.x;
            const dy = y - obs.y;
            if (Math.sqrt(dx*dx + dy*dy) < 60) {
                overlapping = true;
                break;
            }
        }
        
        if (!overlapping) {
            bambooPickups.push({ x, y, size: 30, wobble: Math.random() * Math.PI * 2 });
            return;
        }
    }
}

function spawnJaguar() {
    const level = levels[currentLevelIndex];
    if (jaguars.length >= level.maxJaguars) return;
    
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    if (side === 0) { x = Math.random() * canvas.width; y = -40; }
    else if (side === 1) { x = canvas.width + 40; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 40; }
    else { x = -40; y = Math.random() * canvas.height; }

    jaguars.push({ x, y, size: 42, speed: level.jaguarSpeed });
}

function checkObstacleCollision(x, y, radius) {
    for (const obs of obstacles) {
        if (obs.type === 'bridge') continue;
        const dx = x - obs.x;
        const dy = y - obs.y;
        if (Math.sqrt(dx*dx + dy*dy) < (obs.radius || 30) + radius) {
            return true;
        }
    }
    return false;
}

function updatePanda() {
    let vx = 0, vy = 0;
    
    // Check keys and move
    if (keysPressed.up) vy = -panda.speed;
    if (keysPressed.down) vy = panda.speed;
    if (keysPressed.left) vx = -panda.speed;
    if (keysPressed.right) vx = panda.speed;

    // Skip if no movement
    if (vx === 0 && vy === 0) return;

    // Diagonal movement normalization
    if (vx !== 0 && vy !== 0) {
        vx *= 0.707;
        vy *= 0.707;
    }

    // Calculate new position
    let newX = panda.x + vx;
    let newY = panda.y + vy;
    
    // Keep in bounds
    newX = Math.max(25, Math.min(canvas.width - 25, newX));
    newY = Math.max(25, Math.min(canvas.height - 25, newY));
    
    // Check obstacle collision
    if (!checkObstacleCollision(newX, newY, 15)) {
        panda.x = newX;
        panda.y = newY;
    } else if (!checkObstacleCollision(newX, panda.y, 15)) {
        panda.x = newX;
    } else if (!checkObstacleCollision(panda.x, newY, 15)) {
        panda.y = newY;
    }
}

function updateJaguars() {
    jaguars.forEach(jaguar => {
        const dx = panda.x - jaguar.x;
        const dy = panda.y - jaguar.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0) {
            jaguar.x += (dx / dist) * jaguar.speed;
            jaguar.y += (dy / dist) * jaguar.speed;
        }
    });
}

function checkCollisions() {
    // Jaguar collision
    for (const jaguar of jaguars) {
        const dx = panda.x - jaguar.x;
        const dy = panda.y - jaguar.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
            return 'death';
        }
    }
    
    // Bamboo collection
    const level = levels[currentLevelIndex];
    for (let i = bambooPickups.length - 1; i >= 0; i--) {
        const bamboo = bambooPickups[i];
        const dx = panda.x - bamboo.x;
        const dy = panda.y - bamboo.y;
        if (Math.sqrt(dx*dx + dy*dy) < 35) {
            bambooPickups.splice(i, 1);
            bambooCollected++;
            bambooCountDisplay.textContent = bambooCollected;
            goalIndicator.textContent = `🎯 Goal: ${bambooCollected}/${level.bambooGoal} 🎋`;
            
            if (bambooCollected >= level.bambooGoal) {
                return 'win';
            }
            spawnBamboo();
        }
    }
    
    return null;
}

// ==================== GAME STATES ====================
function showMap() {
    currentMode = MODE_MAP;
    gameRunning = false;
    overlay.classList.remove('visible');
    levelIndicator.style.display = 'none';
    goalIndicator.style.display = 'none';
    currentLevelDisplay.textContent = '-';
    controlsHint.innerHTML = 'Use <span class="key">←</span> <span class="key">→</span> <span class="key">↑</span> <span class="key">↓</span> to select | <span class="key">ENTER</span> to play';
    
    drawMap();
    requestAnimationFrame(mapLoop);
}

function mapLoop() {
    if (currentMode !== MODE_MAP || overlay.classList.contains('visible')) return;
    
    // Update debug in map mode
    if (debugKeys) {
        debugKeys.textContent = `MODE: ${currentMode} | Selected: Level ${selectedLevelIndex + 1} | Press ENTER to start`;
    }
    
    drawMap();
    requestAnimationFrame(mapLoop);
}

function startLevel(levelIndex) {
    console.log('startLevel called with index:', levelIndex);
    
    if (!levels[levelIndex].unlocked) {
        console.log('Level is locked!');
        return;
    }
    
    currentLevelIndex = levelIndex;
    const level = levels[levelIndex];
    
    currentMode = MODE_PLAYING;
    gameRunning = true;
    
    console.log('Mode set to:', currentMode, 'gameRunning:', gameRunning);
    gameTime = 0;
    jaguarSpawnTimer = 0;
    bambooCollected = 0;
    bambooCountDisplay.textContent = 0;
    currentLevelDisplay.textContent = level.id;
    
    panda.x = canvas.width / 2;
    panda.y = canvas.height / 2;
    jaguars = [];
    bambooPickups = [];
    
    // Reset key states
    keysPressed.up = false;
    keysPressed.down = false;
    keysPressed.left = false;
    keysPressed.right = false;
    
    generateGrass();
    generateObstacles(level);
    
    for (let i = 0; i < 3; i++) spawnBamboo();
    
    setTimeout(() => { if (gameRunning) spawnJaguar(); }, 3000);
    
    overlay.classList.remove('visible');
    levelIndicator.style.display = 'block';
    levelIndicator.textContent = `📍 Level ${level.id}: ${level.name}`;
    goalIndicator.style.display = 'block';
    goalIndicator.textContent = `🎯 Goal: 0/${level.bambooGoal} 🎋`;
    controlsHint.innerHTML = 'Use <span class="key">↑</span> <span class="key">↓</span> <span class="key">←</span> <span class="key">→</span> to move';
    
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function levelComplete() {
    gameRunning = false;
    const level = levels[currentLevelIndex];
    
    level.completed = true;
    let stars = gameTime < 60 ? 3 : (gameTime < 90 ? 2 : 1);
    if (stars > level.stars) level.stars = stars;
    
    if (currentLevelIndex < levels.length - 1) {
        levels[currentLevelIndex + 1].unlocked = true;
    }
    
    saveProgress();
    updateTotalStars();

    let starsDisplay = '';
    for (let i = 0; i < 3; i++) starsDisplay += i < stars ? '⭐' : '☆';

    overlay.innerHTML = `
        <h2 class="success">Level Complete!</h2>
        <p style="font-size: 2rem;">${starsDisplay}</p>
        <p>🎋 Bamboo: ${bambooCollected} | ⏱️ Time: ${gameTime}s</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="mapBtn">MAP (M)</button>
            ${currentLevelIndex < levels.length - 1 ? '<button class="game-btn" id="nextBtn">NEXT (ENTER)</button>' : ''}
        </div>
    `;
    overlay.classList.add('visible');
    
    document.getElementById('mapBtn').onclick = showMap;
    if (currentLevelIndex < levels.length - 1) {
        document.getElementById('nextBtn').onclick = () => startLevel(currentLevelIndex + 1);
    }
}

function gameOver() {
    gameRunning = false;

    overlay.innerHTML = `
        <h2>Game Over!</h2>
        <p>🎋 Bamboo: ${bambooCollected}/${levels[currentLevelIndex].bambooGoal}</p>
        <p>⏱️ Time: ${gameTime}s</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="mapBtn">MAP (M)</button>
            <button class="game-btn" id="retryBtn">RETRY (R)</button>
        </div>
    `;
    overlay.classList.add('visible');
    
    document.getElementById('mapBtn').onclick = showMap;
    document.getElementById('retryBtn').onclick = () => startLevel(currentLevelIndex);
}

// ==================== GAME LOOP ====================
function gameLoop(timestamp) {
    if (!gameRunning || currentMode !== MODE_PLAYING) return;
    
    const level = levels[currentLevelIndex];

    // Update
    updatePanda();
    updateJaguars();
    
    // Animate bamboo
    bambooPickups.forEach(b => b.wobble += 0.05);
    
    // Spawn jaguars
    jaguarSpawnTimer++;
    if (jaguarSpawnTimer > level.spawnInterval / 16 && jaguars.length < level.maxJaguars) {
        spawnJaguar();
        jaguarSpawnTimer = 0;
    }
    
    // Check collisions
    const result = checkCollisions();
    if (result === 'death') { gameOver(); return; }
    if (result === 'win') { levelComplete(); return; }
    
    // Update time
    gameTime = Math.floor((performance.now() - lastTime) / 1000);
    timeDisplay.textContent = gameTime;

    // Draw
    const theme = level.theme;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg3);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grass
    ctx.fillStyle = theme.grassColor;
    grass.forEach(g => {
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x - 3, g.y - 15);
        ctx.lineTo(g.x + 3, g.y - 15);
        ctx.fill();
    });

    // Bamboo pickups
    bambooPickups.forEach(drawBambooPickup);

    // Obstacles
    obstacles.forEach(obs => {
        if (obs.type === 'tree') drawTree(obs.x, obs.y, 70);
        else if (obs.type === 'rock') drawRock(obs.x, obs.y, obs.width, obs.height);
        else if (obs.type === 'bridge') drawBridge(obs.x, obs.y, obs.width, obs.height);
    });

    // Jaguars
    jaguars.forEach(j => drawJaguar(j.x, j.y, j.size));

    // Panda
    drawPanda(panda.x, panda.y, panda.size);

    requestAnimationFrame(gameLoop);
}

// ==================== INIT ====================
function init() {
    loadProgress();
    setupKeyboardControls();
    
    // Start button
    document.getElementById('startBtn').onclick = showMap;
    
    // Click handler for map
    canvas.onclick = function(e) {
        if (currentMode !== MODE_MAP || overlay.classList.contains('visible')) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const dx = x - level.x;
            const dy = y - level.y;
            if (Math.sqrt(dx*dx + dy*dy) < 40 && level.unlocked) {
                startLevel(i);
                return;
            }
        }
    };
    
    // Initial draw
    drawMap();
    
    console.log('Panda Escape initialized! Keyboard controls ready.');
}

// Start the game
init();

