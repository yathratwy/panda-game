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
const MODE_PARTY = 'party';
const MODE_PARTY_HUB = 'party_hub';
const MODE_MINIGAME_CATCH = 'minigame_catch';
const MODE_MINIGAME_DANCE = 'minigame_dance';
const MODE_MINIGAME_MEMORY = 'minigame_memory';
const MODE_MINIGAME_RUNNER = 'minigame_runner';
const MODE_MINIGAME_BALLOON = 'minigame_balloon';
const MODE_MINIGAME_PONG = 'minigame_pong';
const MODE_MINIGAME_WHACK = 'minigame_whack';
const MODE_MINIGAME_STACK = 'minigame_stack';
const MODE_MINIGAME_CAKE = 'minigame_cake';
const MODE_MINIGAME_DANCEFLOOR = 'minigame_dancefloor';
// Bundle 2 games
const MODE_MINIGAME_SNAKE = 'minigame_snake';
const MODE_MINIGAME_BRICK = 'minigame_brick';
const MODE_MINIGAME_SPACE = 'minigame_space';
const MODE_MINIGAME_PUZZLE = 'minigame_puzzle';
// Bundle 3 games
const MODE_MINIGAME_FLAPPY = 'minigame_flappy';
const MODE_MINIGAME_TETRIS = 'minigame_tetris';
const MODE_MINIGAME_FISHING = 'minigame_fishing';
const MODE_MINIGAME_RACING = 'minigame_racing';
let currentMode = MODE_MAP;

// Party/Confetti system
let confetti = [];
let partyStartTime = 0;
let levelPartyActive = false;
let levelPartyStars = 0;

// Mini-game states
let miniGameScore = 0;
let miniGameTimer = 0;
let miniGameData = {};
let selectedMiniGame = 0;
let miniGameLevel = 1; // Current difficulty level (1-3)
let currentBundle = 1; // Which bundle of games (1 or 2)

// Mini-game completion tracking
let miniGameProgress = {
    // Bundle 1
    catch: { completed: false, bestLevel: 0 },
    dance: { completed: false, bestLevel: 0 },
    memory: { completed: false, bestLevel: 0 },
    runner: { completed: false, bestLevel: 0 },
    balloon: { completed: false, bestLevel: 0 },
    pong: { completed: false, bestLevel: 0 },
    whack: { completed: false, bestLevel: 0 },
    stack: { completed: false, bestLevel: 0 },
    cake: { completed: false, bestLevel: 0 },
    dancefloor: { completed: false, bestLevel: 0 },
    // Bundle 2
    snake: { completed: false, bestLevel: 0 },
    brick: { completed: false, bestLevel: 0 },
    space: { completed: false, bestLevel: 0 },
    puzzle: { completed: false, bestLevel: 0 }
};

// Bundle 2 games (unlocked after completing bundle 1)
let bundle2Unlocked = false;
// Bundle 3 games (unlocked after completing bundle 2)
let bundle3Unlocked = false;

// Bundle 2 completion tracking
let bundle2Progress = {
    snake: { completed: false, bestLevel: 0 },
    brick: { completed: false, bestLevel: 0 },
    space: { completed: false, bestLevel: 0 },
    puzzle: { completed: false, bestLevel: 0 }
};

// Bundle 3 completion tracking
let bundle3Progress = {
    flappy: { completed: false, bestLevel: 0 },
    tetris: { completed: false, bestLevel: 0 },
    fishing: { completed: false, bestLevel: 0 },
    racing: { completed: false, bestLevel: 0 }
};

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
        x: 100, y: 200, unlocked: true, completed: false, stars: 0,
        bambooGoal: 3, maxJaguars: 1, jaguarSpeed: 1.0, spawnInterval: 20000,
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
        x: 200, y: 100, unlocked: false, completed: false, stars: 0,
        bambooGoal: 4, maxJaguars: 1, jaguarSpeed: 1.2, spawnInterval: 18000,
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
        x: 350, y: 180, unlocked: false, completed: false, stars: 0,
        bambooGoal: 5, maxJaguars: 2, jaguarSpeed: 1.3, spawnInterval: 15000,
        theme: { bg1: '#ffe0b2', bg2: '#ffcc80', bg3: '#ffb74d', grassColor: '#8d6e63' },
        obstacles: [
            { type: 'rock', x: 150, y: 200 }, { type: 'rock', x: 650, y: 300 },
            { type: 'rock', x: 550, y: 150 }, { type: 'rock', x: 250, y: 350 },
            { type: 'bridge', x: 400, y: 400, width: 100, height: 30 }
        ]
    },
    {
        id: 4, name: "Snowy Tundra", icon: "❄️",
        x: 500, y: 100, unlocked: false, completed: false, stars: 0,
        bambooGoal: 6, maxJaguars: 2, jaguarSpeed: 1.2, spawnInterval: 15000,
        theme: { bg1: '#e3f2fd', bg2: '#bbdefb', bg3: '#90caf9', grassColor: '#b3e5fc' },
        obstacles: [
            { type: 'tree', x: 150, y: 120 }, { type: 'tree', x: 650, y: 120 },
            { type: 'tree', x: 550, y: 380 }, { type: 'rock', x: 200, y: 350 },
            { type: 'rock', x: 600, y: 180 }
        ]
    },
    {
        id: 5, name: "Jungle Temple", icon: "🛕",
        x: 650, y: 180, unlocked: false, completed: false, stars: 0,
        bambooGoal: 7, maxJaguars: 2, jaguarSpeed: 1.5, spawnInterval: 12000,
        theme: { bg1: '#a5d6a7', bg2: '#81c784', bg3: '#66bb6a', grassColor: '#2e7d32' },
        obstacles: [
            { type: 'rock', x: 250, y: 120 }, { type: 'tree', x: 100, y: 200 },
            { type: 'tree', x: 700, y: 200 }, { type: 'tree', x: 150, y: 400 },
            { type: 'tree', x: 650, y: 400 }, { type: 'rock', x: 200, y: 300 },
            { type: 'rock', x: 600, y: 300 }
        ]
    },
    {
        id: 6, name: "Saitra", icon: "🌸",
        x: 150, y: 350, unlocked: false, completed: false, stars: 0,
        bambooGoal: 5, maxJaguars: 1, jaguarSpeed: 1.3, spawnInterval: 16000,
        theme: { bg1: '#fce4ec', bg2: '#f8bbd9', bg3: '#f48fb1', grassColor: '#ec407a' },
        obstacles: [
            { type: 'tree', x: 200, y: 150 }, { type: 'tree', x: 600, y: 150 },
            { type: 'tree', x: 200, y: 350 }, { type: 'tree', x: 600, y: 350 },
            { type: 'rock', x: 400, y: 150 }, { type: 'rock', x: 400, y: 350 }
        ]
    },
    {
        id: 7, name: "Sunset Beach", icon: "🌅",
        x: 300, y: 400, unlocked: false, completed: false, stars: 0,
        bambooGoal: 6, maxJaguars: 2, jaguarSpeed: 1.4, spawnInterval: 14000,
        theme: { bg1: '#ffccbc', bg2: '#ffab91', bg3: '#ff8a65', grassColor: '#ff7043' },
        obstacles: [
            { type: 'rock', x: 150, y: 130 }, { type: 'rock', x: 650, y: 130 },
            { type: 'tree', x: 300, y: 380 }, { type: 'tree', x: 500, y: 380 },
            { type: 'bridge', x: 400, y: 200, width: 140, height: 30 }
        ]
    },
    {
        id: 8, name: "Mystic Cave", icon: "🦇",
        x: 500, y: 320, unlocked: false, completed: false, stars: 0,
        bambooGoal: 7, maxJaguars: 2, jaguarSpeed: 1.4, spawnInterval: 13000,
        theme: { bg1: '#4a4a6a', bg2: '#3d3d5c', bg3: '#2d2d4a', grassColor: '#5c5c8a' },
        obstacles: [
            { type: 'rock', x: 200, y: 150 }, { type: 'rock', x: 600, y: 150 },
            { type: 'rock', x: 200, y: 300 }, { type: 'rock', x: 600, y: 300 },
            { type: 'rock', x: 400, y: 400 }
        ]
    },
    {
        id: 9, name: "Rainbow Valley", icon: "🌈",
        x: 700, y: 350, unlocked: false, completed: false, stars: 0,
        bambooGoal: 8, maxJaguars: 2, jaguarSpeed: 1.5, spawnInterval: 12000,
        theme: { bg1: '#e1bee7', bg2: '#ce93d8', bg3: '#ba68c8', grassColor: '#9c27b0' },
        obstacles: [
            { type: 'tree', x: 150, y: 100 }, { type: 'tree', x: 650, y: 100 },
            { type: 'tree', x: 150, y: 400 }, { type: 'tree', x: 650, y: 400 },
            { type: 'rock', x: 300, y: 200 }, { type: 'rock', x: 500, y: 300 }
        ]
    },
    {
        id: 10, name: "Panda Paradise", icon: "🐼",
        x: 400, y: 450, unlocked: false, completed: false, stars: 0,
        bambooGoal: 10, maxJaguars: 2, jaguarSpeed: 1.6, spawnInterval: 10000,
        theme: { bg1: '#b2dfdb', bg2: '#80cbc4', bg3: '#4db6ac', grassColor: '#26a69a' },
        obstacles: [
            { type: 'tree', x: 100, y: 150 }, { type: 'tree', x: 700, y: 150 },
            { type: 'tree', x: 100, y: 350 }, { type: 'tree', x: 700, y: 350 },
            { type: 'rock', x: 250, y: 250 }, { type: 'rock', x: 550, y: 250 },
            { type: 'bridge', x: 400, y: 150, width: 120, height: 30 }
        ]
    },
    // NEW LEVELS 11-14
    {
        id: 11, name: "Sunset Beach", icon: "🌅",
        x: 700, y: 320, unlocked: false, completed: false, stars: 0,
        bambooGoal: 9, maxJaguars: 2, jaguarSpeed: 1.6, spawnInterval: 11000,
        theme: { bg1: '#ffccbc', bg2: '#ffab91', bg3: '#ff8a65', grassColor: '#bf360c' },
        obstacles: [
            { type: 'tree', x: 200, y: 150 }, { type: 'tree', x: 600, y: 150 },
            { type: 'rock', x: 350, y: 300 }, { type: 'rock', x: 450, y: 300 },
            { type: 'bridge', x: 400, y: 400, width: 150, height: 30 }
        ]
    },
    {
        id: 12, name: "Starlight Valley", icon: "✨",
        x: 250, y: 420, unlocked: false, completed: false, stars: 0,
        bambooGoal: 10, maxJaguars: 2, jaguarSpeed: 1.7, spawnInterval: 10000,
        theme: { bg1: '#303f9f', bg2: '#283593', bg3: '#1a237e', grassColor: '#3f51b5' },
        obstacles: [
            { type: 'tree', x: 120, y: 180 }, { type: 'tree', x: 680, y: 180 },
            { type: 'tree', x: 120, y: 320 }, { type: 'tree', x: 680, y: 320 },
            { type: 'rock', x: 300, y: 250 }, { type: 'rock', x: 500, y: 250 },
            { type: 'bridge', x: 400, y: 120, width: 120, height: 30 }
        ]
    },
    {
        id: 13, name: "Rainbow Falls", icon: "🌈",
        x: 550, y: 450, unlocked: false, completed: false, stars: 0,
        bambooGoal: 11, maxJaguars: 3, jaguarSpeed: 1.6, spawnInterval: 10000,
        theme: { bg1: '#e8f5e9', bg2: '#c8e6c9', bg3: '#a5d6a7', grassColor: '#43a047' },
        obstacles: [
            { type: 'tree', x: 150, y: 130 }, { type: 'tree', x: 650, y: 130 },
            { type: 'tree', x: 150, y: 370 }, { type: 'tree', x: 650, y: 370 },
            { type: 'rock', x: 280, y: 200 }, { type: 'rock', x: 520, y: 200 },
            { type: 'rock', x: 400, y: 350 },
            { type: 'bridge', x: 400, y: 250, width: 140, height: 30 }
        ]
    },
    {
        id: 14, name: "Dragon's Peak", icon: "🐉",
        x: 700, y: 420, unlocked: false, completed: false, stars: 0,
        bambooGoal: 12, maxJaguars: 3, jaguarSpeed: 1.8, spawnInterval: 9000,
        theme: { bg1: '#ffcdd2', bg2: '#ef9a9a', bg3: '#e57373', grassColor: '#c62828' },
        obstacles: [
            { type: 'rock', x: 150, y: 150 }, { type: 'rock', x: 650, y: 150 },
            { type: 'rock', x: 150, y: 350 }, { type: 'rock', x: 650, y: 350 },
            { type: 'rock', x: 300, y: 250 }, { type: 'rock', x: 500, y: 250 },
            { type: 'tree', x: 400, y: 150 }, { type: 'tree', x: 400, y: 350 },
            { type: 'bridge', x: 400, y: 420, width: 120, height: 30 }
        ]
    },
    // NEW LEVELS 16-20
    {
        id: 15, name: "Candy Kingdom", icon: "🍭",
        x: 150, y: 480, unlocked: false, completed: false, stars: 0,
        bambooGoal: 10, maxJaguars: 2, jaguarSpeed: 1.6, spawnInterval: 11000,
        theme: { bg1: '#f8bbd9', bg2: '#f48fb1', bg3: '#ec407a', grassColor: '#d81b60' },
        obstacles: [
            { type: 'tree', x: 180, y: 150 }, { type: 'tree', x: 620, y: 150 },
            { type: 'rock', x: 300, y: 280 }, { type: 'rock', x: 500, y: 280 },
            { type: 'bridge', x: 400, y: 380, width: 130, height: 30 }
        ]
    },
    {
        id: 16, name: "Frozen Tundra", icon: "❄️",
        x: 300, y: 510, unlocked: false, completed: false, stars: 0,
        bambooGoal: 11, maxJaguars: 2, jaguarSpeed: 1.7, spawnInterval: 10000,
        theme: { bg1: '#e3f2fd', bg2: '#bbdefb', bg3: '#90caf9', grassColor: '#1976d2' },
        obstacles: [
            { type: 'rock', x: 150, y: 130 }, { type: 'rock', x: 650, y: 130 },
            { type: 'rock', x: 150, y: 370 }, { type: 'rock', x: 650, y: 370 },
            { type: 'tree', x: 400, y: 200 },
            { type: 'bridge', x: 250, y: 300, width: 100, height: 30 },
            { type: 'bridge', x: 550, y: 300, width: 100, height: 30 }
        ]
    },
    {
        id: 17, name: "Cloud Castle", icon: "☁️",
        x: 650, y: 500, unlocked: false, completed: false, stars: 0,
        bambooGoal: 13, maxJaguars: 3, jaguarSpeed: 1.7, spawnInterval: 9500,
        theme: { bg1: '#e8eaf6', bg2: '#c5cae9', bg3: '#9fa8da', grassColor: '#5c6bc0' },
        obstacles: [
            { type: 'bridge', x: 200, y: 150, width: 120, height: 30 },
            { type: 'bridge', x: 600, y: 150, width: 120, height: 30 },
            { type: 'bridge', x: 400, y: 250, width: 150, height: 30 },
            { type: 'bridge', x: 200, y: 350, width: 120, height: 30 },
            { type: 'bridge', x: 600, y: 350, width: 120, height: 30 },
            { type: 'rock', x: 400, y: 400 }
        ]
    },
    {
        id: 18, name: "Panda Temple", icon: "🏯",
        x: 400, y: 540, unlocked: false, completed: false, stars: 0,
        bambooGoal: 15, maxJaguars: 3, jaguarSpeed: 1.9, spawnInterval: 8500,
        theme: { bg1: '#fff8e1', bg2: '#ffecb3', bg3: '#ffe082', grassColor: '#ffc107' },
        obstacles: [
            { type: 'tree', x: 120, y: 120 }, { type: 'tree', x: 680, y: 120 },
            { type: 'tree', x: 120, y: 380 }, { type: 'tree', x: 680, y: 380 },
            { type: 'rock', x: 280, y: 200 }, { type: 'rock', x: 520, y: 200 },
            { type: 'rock', x: 280, y: 300 }, { type: 'rock', x: 520, y: 300 },
            { type: 'bridge', x: 400, y: 250, width: 160, height: 30 }
        ]
    },
    // NEW LEVELS 19-22
    {
        id: 19, name: "Honey Hive", icon: "🍯",
        x: 650, y: 540, unlocked: false, completed: false, stars: 0,
        bambooGoal: 11, maxJaguars: 2, jaguarSpeed: 1.7, spawnInterval: 10000,
        theme: { bg1: '#ffecb3', bg2: '#ffd54f', bg3: '#ffca28', grassColor: '#ff8f00' },
        obstacles: [
            { type: 'rock', x: 150, y: 180 }, { type: 'rock', x: 650, y: 180 },
            { type: 'tree', x: 300, y: 300 }, { type: 'tree', x: 500, y: 300 },
            { type: 'bridge', x: 400, y: 150, width: 120, height: 30 },
            { type: 'bridge', x: 400, y: 380, width: 120, height: 30 }
        ]
    },
    {
        id: 20, name: "Aurora Sky", icon: "🌌",
        x: 250, y: 580, unlocked: false, completed: false, stars: 0,
        bambooGoal: 12, maxJaguars: 2, jaguarSpeed: 1.8, spawnInterval: 9500,
        theme: { bg1: '#1a237e', bg2: '#283593', bg3: '#3949ab', grassColor: '#5c6bc0' },
        obstacles: [
            { type: 'rock', x: 180, y: 150 }, { type: 'rock', x: 620, y: 150 },
            { type: 'rock', x: 180, y: 350 }, { type: 'rock', x: 620, y: 350 },
            { type: 'tree', x: 400, y: 200 }, { type: 'tree', x: 400, y: 300 },
            { type: 'bridge', x: 280, y: 250, width: 100, height: 30 },
            { type: 'bridge', x: 520, y: 250, width: 100, height: 30 }
        ]
    },
    {
        id: 21, name: "Coral Reef", icon: "🐚",
        x: 550, y: 580, unlocked: false, completed: false, stars: 0,
        bambooGoal: 13, maxJaguars: 3, jaguarSpeed: 1.7, spawnInterval: 9000,
        theme: { bg1: '#e0f7fa', bg2: '#80deea', bg3: '#26c6da', grassColor: '#00acc1' },
        obstacles: [
            { type: 'rock', x: 200, y: 180 }, { type: 'rock', x: 600, y: 180 },
            { type: 'rock', x: 300, y: 320 }, { type: 'rock', x: 500, y: 320 },
            { type: 'tree', x: 400, y: 150 },
            { type: 'bridge', x: 400, y: 400, width: 140, height: 30 }
        ]
    },
    {
        id: 22, name: "Golden Summit", icon: "🏆",
        x: 400, y: 620, unlocked: false, completed: false, stars: 0,
        bambooGoal: 15, maxJaguars: 3, jaguarSpeed: 1.9, spawnInterval: 8000,
        theme: { bg1: '#fff59d', bg2: '#ffee58', bg3: '#fdd835', grassColor: '#f9a825' },
        obstacles: [
            { type: 'tree', x: 150, y: 130 }, { type: 'tree', x: 650, y: 130 },
            { type: 'tree', x: 150, y: 370 }, { type: 'tree', x: 650, y: 370 },
            { type: 'rock', x: 300, y: 200 }, { type: 'rock', x: 500, y: 200 },
            { type: 'rock', x: 300, y: 300 }, { type: 'rock', x: 500, y: 300 },
            { type: 'bridge', x: 400, y: 250, width: 140, height: 30 }
        ]
    },
    // NEW LEVELS 23-27
    {
        id: 23, name: "Moonlight Garden", icon: "🌙",
        x: 180, y: 620, unlocked: false, completed: false, stars: 0,
        bambooGoal: 11, maxJaguars: 2, jaguarSpeed: 1.7, spawnInterval: 10000,
        theme: { bg1: '#311b92', bg2: '#4527a0', bg3: '#512da8', grassColor: '#7c4dff' },
        obstacles: [
            { type: 'tree', x: 200, y: 180 }, { type: 'tree', x: 600, y: 180 },
            { type: 'rock', x: 350, y: 300 }, { type: 'rock', x: 450, y: 300 },
            { type: 'bridge', x: 400, y: 150, width: 120, height: 30 }
        ]
    },
    {
        id: 24, name: "Firefly Forest", icon: "✨",
        x: 620, y: 620, unlocked: false, completed: false, stars: 0,
        bambooGoal: 12, maxJaguars: 2, jaguarSpeed: 1.8, spawnInterval: 9500,
        theme: { bg1: '#1b5e20', bg2: '#2e7d32', bg3: '#388e3c', grassColor: '#4caf50' },
        obstacles: [
            { type: 'tree', x: 150, y: 150 }, { type: 'tree', x: 650, y: 150 },
            { type: 'tree', x: 150, y: 350 }, { type: 'tree', x: 650, y: 350 },
            { type: 'tree', x: 400, y: 250 },
            { type: 'bridge', x: 280, y: 200, width: 100, height: 30 }
        ]
    },
    {
        id: 25, name: "Diamond Mine", icon: "💎",
        x: 280, y: 680, unlocked: false, completed: false, stars: 0,
        bambooGoal: 13, maxJaguars: 3, jaguarSpeed: 1.8, spawnInterval: 9000,
        theme: { bg1: '#37474f', bg2: '#455a64', bg3: '#546e7a', grassColor: '#78909c' },
        obstacles: [
            { type: 'rock', x: 180, y: 150 }, { type: 'rock', x: 620, y: 150 },
            { type: 'rock', x: 180, y: 350 }, { type: 'rock', x: 620, y: 350 },
            { type: 'rock', x: 400, y: 250 },
            { type: 'bridge', x: 300, y: 300, width: 100, height: 30 },
            { type: 'bridge', x: 500, y: 300, width: 100, height: 30 }
        ]
    },
    {
        id: 26, name: "Butterfly Valley", icon: "🦋",
        x: 520, y: 680, unlocked: false, completed: false, stars: 0,
        bambooGoal: 14, maxJaguars: 3, jaguarSpeed: 1.8, spawnInterval: 8500,
        theme: { bg1: '#fce4ec', bg2: '#f8bbd9', bg3: '#f48fb1', grassColor: '#e91e63' },
        obstacles: [
            { type: 'tree', x: 200, y: 150 }, { type: 'tree', x: 600, y: 150 },
            { type: 'tree', x: 200, y: 350 }, { type: 'tree', x: 600, y: 350 },
            { type: 'rock', x: 400, y: 200 }, { type: 'rock', x: 400, y: 300 },
            { type: 'bridge', x: 400, y: 400, width: 130, height: 30 }
        ]
    },
    {
        id: 27, name: "Panda Legend", icon: "👑",
        x: 400, y: 720, unlocked: false, completed: false, stars: 0,
        bambooGoal: 18, maxJaguars: 3, jaguarSpeed: 2.0, spawnInterval: 7500,
        theme: { bg1: '#b71c1c', bg2: '#c62828', bg3: '#d32f2f', grassColor: '#ff5722' },
        obstacles: [
            { type: 'tree', x: 120, y: 120 }, { type: 'tree', x: 680, y: 120 },
            { type: 'tree', x: 120, y: 380 }, { type: 'tree', x: 680, y: 380 },
            { type: 'rock', x: 250, y: 180 }, { type: 'rock', x: 550, y: 180 },
            { type: 'rock', x: 250, y: 320 }, { type: 'rock', x: 550, y: 320 },
            { type: 'rock', x: 400, y: 250 },
            { type: 'bridge', x: 400, y: 400, width: 150, height: 30 }
        ]
    },
    // NEW LEVELS 28-32
    {
        id: 28, name: "Cotton Candy Clouds", icon: "☁️",
        x: 180, y: 720, unlocked: false, completed: false, stars: 0,
        bambooGoal: 12, maxJaguars: 2, jaguarSpeed: 1.7, spawnInterval: 10000,
        theme: { bg1: '#f3e5f5', bg2: '#e1bee7', bg3: '#ce93d8', grassColor: '#ab47bc' },
        obstacles: [
            { type: 'bridge', x: 200, y: 150, width: 100, height: 30 },
            { type: 'bridge', x: 600, y: 150, width: 100, height: 30 },
            { type: 'bridge', x: 400, y: 250, width: 120, height: 30 },
            { type: 'bridge', x: 200, y: 350, width: 100, height: 30 },
            { type: 'bridge', x: 600, y: 350, width: 100, height: 30 }
        ]
    },
    {
        id: 29, name: "Pirate Cove", icon: "🏴‍☠️",
        x: 620, y: 720, unlocked: false, completed: false, stars: 0,
        bambooGoal: 13, maxJaguars: 2, jaguarSpeed: 1.8, spawnInterval: 9500,
        theme: { bg1: '#5d4037', bg2: '#6d4c41', bg3: '#795548', grassColor: '#a1887f' },
        obstacles: [
            { type: 'rock', x: 200, y: 180 }, { type: 'rock', x: 600, y: 180 },
            { type: 'tree', x: 300, y: 300 }, { type: 'tree', x: 500, y: 300 },
            { type: 'bridge', x: 400, y: 380, width: 140, height: 30 }
        ]
    },
    {
        id: 30, name: "Neon City", icon: "🌃",
        x: 280, y: 780, unlocked: false, completed: false, stars: 0,
        bambooGoal: 14, maxJaguars: 3, jaguarSpeed: 1.9, spawnInterval: 9000,
        theme: { bg1: '#0d47a1', bg2: '#1565c0', bg3: '#1976d2', grassColor: '#42a5f5' },
        obstacles: [
            { type: 'rock', x: 150, y: 150 }, { type: 'rock', x: 650, y: 150 },
            { type: 'rock', x: 150, y: 350 }, { type: 'rock', x: 650, y: 350 },
            { type: 'rock', x: 300, y: 250 }, { type: 'rock', x: 500, y: 250 },
            { type: 'bridge', x: 400, y: 180, width: 100, height: 30 }
        ]
    },
    {
        id: 31, name: "Sakura Springs", icon: "🌸",
        x: 520, y: 780, unlocked: false, completed: false, stars: 0,
        bambooGoal: 15, maxJaguars: 3, jaguarSpeed: 1.9, spawnInterval: 8500,
        theme: { bg1: '#fce4ec', bg2: '#f8bbd9', bg3: '#f48fb1', grassColor: '#ec407a' },
        obstacles: [
            { type: 'tree', x: 180, y: 150 }, { type: 'tree', x: 620, y: 150 },
            { type: 'tree', x: 180, y: 350 }, { type: 'tree', x: 620, y: 350 },
            { type: 'tree', x: 400, y: 250 },
            { type: 'bridge', x: 280, y: 280, width: 80, height: 30 },
            { type: 'bridge', x: 520, y: 280, width: 80, height: 30 }
        ]
    },
    {
        id: 32, name: "Infinity Peak", icon: "♾️",
        x: 400, y: 820, unlocked: false, completed: false, stars: 0,
        bambooGoal: 20, maxJaguars: 3, jaguarSpeed: 2.1, spawnInterval: 7000,
        theme: { bg1: '#263238', bg2: '#37474f', bg3: '#455a64', grassColor: '#607d8b' },
        obstacles: [
            { type: 'tree', x: 120, y: 120 }, { type: 'tree', x: 680, y: 120 },
            { type: 'tree', x: 120, y: 380 }, { type: 'tree', x: 680, y: 380 },
            { type: 'rock', x: 280, y: 180 }, { type: 'rock', x: 520, y: 180 },
            { type: 'rock', x: 280, y: 320 }, { type: 'rock', x: 520, y: 320 },
            { type: 'rock', x: 400, y: 250 },
            { type: 'bridge', x: 400, y: 400, width: 160, height: 30 }
        ]
    },
    // LEVELS 33-48: THE ULTIMATE CHALLENGE
    {
        id: 33, name: "Firefly Forest", icon: "✨",
        x: 180, y: 880, unlocked: false, completed: false, stars: 0,
        bambooGoal: 12, maxJaguars: 2, jaguarSpeed: 1.7, spawnInterval: 10000,
        theme: { bg1: '#1a237e', bg2: '#283593', bg3: '#303f9f', grassColor: '#3949ab' },
        obstacles: [
            { type: 'tree', x: 200, y: 150 }, { type: 'tree', x: 600, y: 150 },
            { type: 'tree', x: 300, y: 300 }, { type: 'tree', x: 500, y: 300 },
            { type: 'bridge', x: 400, y: 200, width: 100, height: 30 }
        ]
    },
    {
        id: 34, name: "Candy Kingdom", icon: "🍬",
        x: 620, y: 880, unlocked: false, completed: false, stars: 0,
        bambooGoal: 13, maxJaguars: 2, jaguarSpeed: 1.8, spawnInterval: 9500,
        theme: { bg1: '#e91e63', bg2: '#f06292', bg3: '#f48fb1', grassColor: '#f8bbd9' },
        obstacles: [
            { type: 'rock', x: 180, y: 180 }, { type: 'rock', x: 620, y: 180 },
            { type: 'rock', x: 180, y: 320 }, { type: 'rock', x: 620, y: 320 },
            { type: 'bridge', x: 400, y: 250, width: 120, height: 30 }
        ]
    },
    {
        id: 35, name: "Thunderstorm", icon: "⛈️",
        x: 280, y: 940, unlocked: false, completed: false, stars: 0,
        bambooGoal: 14, maxJaguars: 2, jaguarSpeed: 1.9, spawnInterval: 9000,
        theme: { bg1: '#37474f', bg2: '#455a64', bg3: '#546e7a', grassColor: '#78909c' },
        obstacles: [
            { type: 'tree', x: 150, y: 150 }, { type: 'tree', x: 650, y: 150 },
            { type: 'rock', x: 300, y: 250 }, { type: 'rock', x: 500, y: 250 },
            { type: 'tree', x: 150, y: 350 }, { type: 'tree', x: 650, y: 350 }
        ]
    },
    {
        id: 36, name: "Honeycomb Hive", icon: "🍯",
        x: 520, y: 940, unlocked: false, completed: false, stars: 0,
        bambooGoal: 14, maxJaguars: 2, jaguarSpeed: 1.9, spawnInterval: 9000,
        theme: { bg1: '#ff8f00', bg2: '#ffa000', bg3: '#ffb300', grassColor: '#ffc107' },
        obstacles: [
            { type: 'rock', x: 200, y: 200 }, { type: 'rock', x: 400, y: 200 }, { type: 'rock', x: 600, y: 200 },
            { type: 'rock', x: 300, y: 300 }, { type: 'rock', x: 500, y: 300 }
        ]
    },
    {
        id: 37, name: "Coral Reef", icon: "🐠",
        x: 180, y: 1000, unlocked: false, completed: false, stars: 0,
        bambooGoal: 15, maxJaguars: 3, jaguarSpeed: 1.8, spawnInterval: 8500,
        theme: { bg1: '#006064', bg2: '#00838f', bg3: '#0097a7', grassColor: '#00acc1' },
        obstacles: [
            { type: 'rock', x: 180, y: 150 }, { type: 'rock', x: 620, y: 150 },
            { type: 'tree', x: 300, y: 280 }, { type: 'tree', x: 500, y: 280 },
            { type: 'bridge', x: 400, y: 380, width: 140, height: 30 }
        ]
    },
    {
        id: 38, name: "Galaxy Swirl", icon: "🌀",
        x: 620, y: 1000, unlocked: false, completed: false, stars: 0,
        bambooGoal: 15, maxJaguars: 3, jaguarSpeed: 1.9, spawnInterval: 8500,
        theme: { bg1: '#4a148c', bg2: '#6a1b9a', bg3: '#7b1fa2', grassColor: '#8e24aa' },
        obstacles: [
            { type: 'tree', x: 200, y: 180 }, { type: 'tree', x: 600, y: 180 },
            { type: 'rock', x: 350, y: 280 }, { type: 'rock', x: 450, y: 280 },
            { type: 'tree', x: 200, y: 380 }, { type: 'tree', x: 600, y: 380 }
        ]
    },
    {
        id: 39, name: "Mint Garden", icon: "🌿",
        x: 400, y: 1000, unlocked: false, completed: false, stars: 0,
        bambooGoal: 16, maxJaguars: 3, jaguarSpeed: 1.9, spawnInterval: 8000,
        theme: { bg1: '#00695c', bg2: '#00796b', bg3: '#00897b', grassColor: '#009688' },
        obstacles: [
            { type: 'tree', x: 150, y: 150 }, { type: 'tree', x: 650, y: 150 },
            { type: 'tree', x: 150, y: 350 }, { type: 'tree', x: 650, y: 350 },
            { type: 'rock', x: 400, y: 250 },
            { type: 'bridge', x: 280, y: 250, width: 80, height: 30 },
            { type: 'bridge', x: 520, y: 250, width: 80, height: 30 }
        ]
    },
    {
        id: 40, name: "Lava Mountain", icon: "🌋",
        x: 280, y: 1060, unlocked: false, completed: false, stars: 0,
        bambooGoal: 16, maxJaguars: 3, jaguarSpeed: 2.0, spawnInterval: 8000,
        theme: { bg1: '#bf360c', bg2: '#d84315', bg3: '#e64a19', grassColor: '#ff5722' },
        obstacles: [
            { type: 'rock', x: 200, y: 150 }, { type: 'rock', x: 600, y: 150 },
            { type: 'rock', x: 200, y: 350 }, { type: 'rock', x: 600, y: 350 },
            { type: 'rock', x: 300, y: 250 }, { type: 'rock', x: 400, y: 250 }, { type: 'rock', x: 500, y: 250 }
        ]
    },
    {
        id: 41, name: "Blueberry Hills", icon: "🫐",
        x: 520, y: 1060, unlocked: false, completed: false, stars: 0,
        bambooGoal: 17, maxJaguars: 3, jaguarSpeed: 2.0, spawnInterval: 7500,
        theme: { bg1: '#311b92', bg2: '#4527a0', bg3: '#512da8', grassColor: '#5e35b1' },
        obstacles: [
            { type: 'tree', x: 180, y: 180 }, { type: 'tree', x: 620, y: 180 },
            { type: 'tree', x: 180, y: 320 }, { type: 'tree', x: 620, y: 320 },
            { type: 'bridge', x: 400, y: 250, width: 150, height: 30 }
        ]
    },
    {
        id: 42, name: "Starlight Path", icon: "🌟",
        x: 180, y: 1120, unlocked: false, completed: false, stars: 0,
        bambooGoal: 17, maxJaguars: 3, jaguarSpeed: 2.0, spawnInterval: 7500,
        theme: { bg1: '#0d47a1', bg2: '#1565c0', bg3: '#1976d2', grassColor: '#1e88e5' },
        obstacles: [
            { type: 'rock', x: 150, y: 150 }, { type: 'rock', x: 650, y: 150 },
            { type: 'tree', x: 300, y: 250 }, { type: 'tree', x: 500, y: 250 },
            { type: 'rock', x: 150, y: 350 }, { type: 'rock', x: 650, y: 350 },
            { type: 'bridge', x: 400, y: 180, width: 100, height: 30 }
        ]
    },
    {
        id: 43, name: "Peach Paradise", icon: "🍑",
        x: 620, y: 1120, unlocked: false, completed: false, stars: 0,
        bambooGoal: 18, maxJaguars: 3, jaguarSpeed: 2.0, spawnInterval: 7500,
        theme: { bg1: '#ff6f00', bg2: '#ff8f00', bg3: '#ffa000', grassColor: '#ffb300' },
        obstacles: [
            { type: 'tree', x: 200, y: 150 }, { type: 'tree', x: 600, y: 150 },
            { type: 'rock', x: 280, y: 250 }, { type: 'rock', x: 400, y: 250 }, { type: 'rock', x: 520, y: 250 },
            { type: 'tree', x: 200, y: 350 }, { type: 'tree', x: 600, y: 350 }
        ]
    },
    {
        id: 44, name: "Mystic Ruins", icon: "🏛️",
        x: 400, y: 1120, unlocked: false, completed: false, stars: 0,
        bambooGoal: 18, maxJaguars: 3, jaguarSpeed: 2.1, spawnInterval: 7000,
        theme: { bg1: '#3e2723', bg2: '#4e342e', bg3: '#5d4037', grassColor: '#6d4c41' },
        obstacles: [
            { type: 'rock', x: 180, y: 150 }, { type: 'rock', x: 400, y: 150 }, { type: 'rock', x: 620, y: 150 },
            { type: 'rock', x: 180, y: 350 }, { type: 'rock', x: 400, y: 350 }, { type: 'rock', x: 620, y: 350 },
            { type: 'bridge', x: 400, y: 250, width: 160, height: 30 }
        ]
    },
    {
        id: 45, name: "Electric Storm", icon: "⚡",
        x: 280, y: 1180, unlocked: false, completed: false, stars: 0,
        bambooGoal: 19, maxJaguars: 3, jaguarSpeed: 2.1, spawnInterval: 7000,
        theme: { bg1: '#212121', bg2: '#424242', bg3: '#616161', grassColor: '#ffc107' },
        obstacles: [
            { type: 'tree', x: 150, y: 150 }, { type: 'tree', x: 650, y: 150 },
            { type: 'tree', x: 150, y: 350 }, { type: 'tree', x: 650, y: 350 },
            { type: 'rock', x: 280, y: 250 }, { type: 'rock', x: 520, y: 250 },
            { type: 'rock', x: 400, y: 180 }, { type: 'rock', x: 400, y: 320 }
        ]
    },
    {
        id: 46, name: "Rainbow Bridge", icon: "🌈",
        x: 520, y: 1180, unlocked: false, completed: false, stars: 0,
        bambooGoal: 19, maxJaguars: 3, jaguarSpeed: 2.1, spawnInterval: 7000,
        theme: { bg1: '#e91e63', bg2: '#9c27b0', bg3: '#3f51b5', grassColor: '#4caf50' },
        obstacles: [
            { type: 'bridge', x: 200, y: 180, width: 100, height: 30 },
            { type: 'bridge', x: 600, y: 180, width: 100, height: 30 },
            { type: 'bridge', x: 400, y: 250, width: 120, height: 30 },
            { type: 'bridge', x: 200, y: 320, width: 100, height: 30 },
            { type: 'bridge', x: 600, y: 320, width: 100, height: 30 },
            { type: 'rock', x: 400, y: 380 }
        ]
    },
    {
        id: 47, name: "Frozen Tundra", icon: "🥶",
        x: 180, y: 1240, unlocked: false, completed: false, stars: 0,
        bambooGoal: 20, maxJaguars: 3, jaguarSpeed: 2.2, spawnInterval: 6500,
        theme: { bg1: '#b3e5fc', bg2: '#81d4fa', bg3: '#4fc3f7', grassColor: '#29b6f6' },
        obstacles: [
            { type: 'rock', x: 150, y: 150 }, { type: 'rock', x: 400, y: 150 }, { type: 'rock', x: 650, y: 150 },
            { type: 'tree', x: 250, y: 280 }, { type: 'tree', x: 550, y: 280 },
            { type: 'rock', x: 150, y: 380 }, { type: 'rock', x: 400, y: 380 }, { type: 'rock', x: 650, y: 380 }
        ]
    },
    {
        id: 48, name: "Panda Paradise", icon: "🐼",
        x: 400, y: 1280, unlocked: false, completed: false, stars: 0,
        bambooGoal: 25, maxJaguars: 3, jaguarSpeed: 2.3, spawnInterval: 6000,
        theme: { bg1: '#1b5e20', bg2: '#2e7d32', bg3: '#388e3c', grassColor: '#43a047' },
        obstacles: [
            { type: 'tree', x: 120, y: 120 }, { type: 'tree', x: 680, y: 120 },
            { type: 'tree', x: 120, y: 380 }, { type: 'tree', x: 680, y: 380 },
            { type: 'rock', x: 250, y: 180 }, { type: 'rock', x: 550, y: 180 },
            { type: 'rock', x: 250, y: 320 }, { type: 'rock', x: 550, y: 320 },
            { type: 'rock', x: 400, y: 250 },
            { type: 'bridge', x: 400, y: 400, width: 180, height: 30 }
        ]
    }
];

// Game objects
const panda = { x: 400, y: 250, size: 45, speed: 5.5 };
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
    if (currentMode === MODE_PARTY) {
        // Party celebration - wait for it to finish
        return;
    }
    
    if (currentMode === MODE_PARTY_HUB) {
        handlePartyHubKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_DANCE) {
        handleDanceKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_MEMORY) {
        handleMemoryKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_CATCH) {
        handleCatchKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_RUNNER) {
        handleRunnerKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_BALLOON) {
        handleBalloonKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_PONG) {
        handlePongKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_WHACK) {
        handleWhackKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_STACK) {
        handleStackKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_CAKE) {
        handleCakeKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_DANCEFLOOR) {
        handleDanceFloorKeys(key);
        return;
    }
    
    // Bundle 2 games
    if (currentMode === MODE_MINIGAME_SNAKE) {
        handleSnakeKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_BRICK) {
        handleBrickKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_SPACE) {
        handleSpaceKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_PUZZLE) {
        handlePuzzleKeys(key);
        return;
    }
    
    // Bundle 3 games
    if (currentMode === MODE_MINIGAME_FLAPPY) {
        handleFlappyKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_TETRIS) {
        handleTetrisKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_FISHING) {
        handleFishingKeys(key);
        return;
    }
    
    if (currentMode === MODE_MINIGAME_RACING) {
        handleRacingKeys(key);
        return;
    }
    
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
    // Number keys 1-9 for levels 1-9, 0 for level 10
    if (key >= '1' && key <= '9') {
        const levelNum = parseInt(key) - 1;
        if (levels[levelNum] && levels[levelNum].unlocked) {
            selectedLevelIndex = levelNum;
            startLevel(levelNum);
        }
    }
    if (key === '0') {
        // Level 10
        if (levels[9] && levels[9].unlocked) {
            selectedLevelIndex = 9;
            startLevel(9);
        }
    }
    // P for Party!
    if (key === 'p' || key === 'P') {
        startPartyHub();
    }
}

function handleGameKeys(key) {
    if (key === 'm' || key === 'M' || key === 'Escape') {
        showMap();
    }
}

function handlePartyHubKeys(key) {
    if (overlay.classList.contains('visible')) {
        // Handle overlay buttons in party hub
        if (key === 'Enter' || key === ' ') {
            const btn = document.getElementById('retryMiniBtn');
            if (btn) btn.click();
        }
        if (key === 'Escape') {
            const btn = document.getElementById('backBtn');
            if (btn) btn.click();
        }
        return;
    }
    
    // Tab to switch bundles
    if (key === 'Tab') {
        if (bundle3Unlocked) {
            currentBundle = currentBundle === 1 ? 2 : (currentBundle === 2 ? 3 : 1);
        } else if (bundle2Unlocked) {
            currentBundle = currentBundle === 1 ? 2 : 1;
        }
        miniGames = currentBundle === 1 ? miniGamesBundle1 : (currentBundle === 2 ? miniGamesBundle2 : miniGamesBundle3);
        selectedMiniGame = 0;
        miniGameLevel = 1;
    }
    
    // Q/E to change level
    const selectedGame = miniGames[selectedMiniGame];
    if (selectedGame && selectedGame.levels > 1) {
        if (key === 'q' || key === 'Q') {
            miniGameLevel = Math.max(1, miniGameLevel - 1);
        }
        if (key === 'e' || key === 'E') {
            miniGameLevel = Math.min(selectedGame.levels, miniGameLevel + 1);
        }
    }
    
    // Navigation for grid layout
    const cols = currentBundle === 1 ? 5 : 4;
    if (key === 'ArrowLeft') {
        selectedMiniGame = (selectedMiniGame - 1 + miniGames.length) % miniGames.length;
        miniGameLevel = 1;
    }
    if (key === 'ArrowRight') {
        selectedMiniGame = (selectedMiniGame + 1) % miniGames.length;
        miniGameLevel = 1;
    }
    if (key === 'ArrowUp') {
        if (selectedMiniGame >= cols) {
            selectedMiniGame -= cols;
            miniGameLevel = 1;
        }
    }
    if (key === 'ArrowDown') {
        if (selectedMiniGame < miniGames.length - cols) {
            selectedMiniGame += cols;
            miniGameLevel = 1;
        }
    }
    if (key === 'Enter' || key === ' ') {
        launchSelectedMiniGame();
    }
    if (key === '1') {
        selectedMiniGame = 0;
        launchSelectedMiniGame();
    }
    if (key === '2') {
        selectedMiniGame = 1;
        launchSelectedMiniGame();
    }
    if (key === '3') {
        selectedMiniGame = 2;
        launchSelectedMiniGame();
    }
    if (key === '4') {
        selectedMiniGame = 3;
        launchSelectedMiniGame();
    }
    if (key === '5') {
        selectedMiniGame = 4;
        launchSelectedMiniGame();
    }
    if (key === '6') {
        selectedMiniGame = 5;
        launchSelectedMiniGame();
    }
    if (key === '7') {
        selectedMiniGame = 6;
        launchSelectedMiniGame();
    }
    if (key === '8') {
        selectedMiniGame = 7;
        launchSelectedMiniGame();
    }
    if (key === '9') {
        selectedMiniGame = 8;
        launchSelectedMiniGame();
    }
    if (key === '0') {
        selectedMiniGame = 9;
        launchSelectedMiniGame();
    }
    if (key === 'Escape' || key === 'm' || key === 'M') {
        exitParty();
    }
}

function launchSelectedMiniGame() {
    if (currentBundle === 1) {
        // Bundle 1 games
        switch (selectedMiniGame) {
            case 0: startBambooCatch(); break;
            case 1: startPandaDance(); break;
            case 2: startMemoryMatch(); break;
            case 3: startPandaRunner(); break;
            case 4: startBalloonPop(); break;
            case 5: startPandaPong(); break;
            case 6: startWhackAJaguar(); break;
            case 7: startPandaStack(); break;
            case 8: startCakeMaker(); break;
            case 9: startDanceFloor(); break;
        }
    } else if (currentBundle === 2) {
        // Bundle 2 games
        switch (selectedMiniGame) {
            case 0: startPandaSnake(); break;
            case 1: startBrickBreaker(); break;
            case 2: startSpacePanda(); break;
            case 3: startSlidePuzzle(); break;
        }
    } else {
        // Bundle 3 games
        switch (selectedMiniGame) {
            case 0: startFlappyPanda(); break;
            case 1: startPandaBlocks(); break;
            case 2: startPandaFishing(); break;
            case 3: startPandaRacer(); break;
        }
    }
}

function handleDanceKeys(key) {
    if (key === 'Escape') {
        endPandaDance();
        return;
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        checkDanceHit('up');
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
        checkDanceHit('down');
    }
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        checkDanceHit('left');
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        checkDanceHit('right');
    }
}

function handleMemoryKeys(key) {
    if (key === 'Escape') {
        currentMode = MODE_PARTY_HUB;
        startPartyHub();
        return;
    }
    
    const data = miniGameData;
    const cols = 4;
    
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        if (data.selectedIndex % cols > 0) {
            data.selectedIndex--;
        }
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        if (data.selectedIndex % cols < cols - 1) {
            data.selectedIndex++;
        }
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (data.selectedIndex >= cols) {
            data.selectedIndex -= cols;
        }
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
        if (data.selectedIndex < data.cards.length - cols) {
            data.selectedIndex += cols;
        }
    }
    if (key === 'Enter' || key === ' ') {
        flipMemoryCard();
    }
}

function handleCatchKeys(key) {
    if (key === 'Escape') {
        endBambooCatch();
        return;
    }
    // Movement is handled in the game loop via keysPressed
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

    // Land - larger to fit more levels
    ctx.fillStyle = '#a5d6a7';
    ctx.beginPath();
    ctx.ellipse(400, 320, 390, 290, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Extra land area
    ctx.fillStyle = '#81c784';
    ctx.beginPath();
    ctx.ellipse(200, 350, 160, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(600, 320, 160, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bottom land extension for levels 16-23
    ctx.beginPath();
    ctx.ellipse(400, 520, 350, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    // Extra bottom area for levels 22-27
    ctx.beginPath();
    ctx.ellipse(400, 650, 320, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    // Area for levels 27-29
    ctx.beginPath();
    ctx.ellipse(400, 720, 300, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    // Area for levels 30-32
    ctx.beginPath();
    ctx.ellipse(400, 800, 280, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    // Area for levels 33-36
    ctx.beginPath();
    ctx.ellipse(400, 920, 320, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    // Area for levels 37-41
    ctx.beginPath();
    ctx.ellipse(400, 1040, 320, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    // Area for levels 42-46
    ctx.beginPath();
    ctx.ellipse(400, 1150, 320, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    // Final area for levels 47-48
    ctx.beginPath();
    ctx.ellipse(300, 1260, 200, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paths between levels
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    
    // Level 1 -> 2
    ctx.beginPath();
    ctx.moveTo(levels[0].x, levels[0].y);
    ctx.lineTo(levels[1].x, levels[1].y);
    ctx.stroke();
    
    // Level 2 -> 3
    ctx.beginPath();
    ctx.moveTo(levels[1].x, levels[1].y);
    ctx.lineTo(levels[2].x, levels[2].y);
    ctx.stroke();
    
    // Level 3 -> 4
    ctx.beginPath();
    ctx.moveTo(levels[2].x, levels[2].y);
    ctx.lineTo(levels[3].x, levels[3].y);
    ctx.stroke();
    
    // Level 4 -> 5
    ctx.beginPath();
    ctx.moveTo(levels[3].x, levels[3].y);
    ctx.lineTo(levels[4].x, levels[4].y);
    ctx.stroke();
    
    // Level 1 -> 6 (Saitra)
    ctx.beginPath();
    ctx.moveTo(levels[0].x, levels[0].y);
    ctx.lineTo(levels[5].x, levels[5].y);
    ctx.stroke();
    
    // Level 6 -> 7
    ctx.beginPath();
    ctx.moveTo(levels[5].x, levels[5].y);
    ctx.lineTo(levels[6].x, levels[6].y);
    ctx.stroke();
    
    // Level 7 -> 8
    ctx.beginPath();
    ctx.moveTo(levels[6].x, levels[6].y);
    ctx.lineTo(levels[7].x, levels[7].y);
    ctx.stroke();
    
    // Level 5 -> 8
    ctx.beginPath();
    ctx.moveTo(levels[4].x, levels[4].y);
    ctx.lineTo(levels[7].x, levels[7].y);
    ctx.stroke();
    
    // Level 8 -> 9
    ctx.beginPath();
    ctx.moveTo(levels[7].x, levels[7].y);
    ctx.lineTo(levels[8].x, levels[8].y);
    ctx.stroke();
    
    // Level 9 -> 10
    ctx.beginPath();
    ctx.moveTo(levels[8].x, levels[8].y);
    ctx.lineTo(levels[9].x, levels[9].y);
    ctx.stroke();
    
    // Level 7 -> 10
    ctx.beginPath();
    ctx.moveTo(levels[6].x, levels[6].y);
    ctx.lineTo(levels[9].x, levels[9].y);
    ctx.stroke();
    
    // Level 10 -> 11 (Sunset Beach)
    ctx.beginPath();
    ctx.moveTo(levels[9].x, levels[9].y);
    ctx.lineTo(levels[10].x, levels[10].y);
    ctx.stroke();
    
    // Level 11 -> 12 (Starlight Valley)
    ctx.beginPath();
    ctx.moveTo(levels[10].x, levels[10].y);
    ctx.lineTo(levels[11].x, levels[11].y);
    ctx.stroke();
    
    // Level 12 -> 13 (Rainbow Falls)
    ctx.beginPath();
    ctx.moveTo(levels[11].x, levels[11].y);
    ctx.lineTo(levels[12].x, levels[12].y);
    ctx.stroke();
    
    // Level 13 -> 14 (Dragon's Peak)
    ctx.beginPath();
    ctx.moveTo(levels[12].x, levels[12].y);
    ctx.lineTo(levels[13].x, levels[13].y);
    ctx.stroke();
    
    // Level 12 -> 15 (Starlight Valley to Candy Kingdom)
    ctx.beginPath();
    ctx.moveTo(levels[11].x, levels[11].y);
    ctx.lineTo(levels[14].x, levels[14].y);
    ctx.stroke();
    
    // Level 15 -> 16 (Candy Kingdom to Frozen Tundra)
    ctx.beginPath();
    ctx.moveTo(levels[14].x, levels[14].y);
    ctx.lineTo(levels[15].x, levels[15].y);
    ctx.stroke();
    
    // Level 16 -> 17 (Frozen Tundra to Cloud Castle)
    ctx.beginPath();
    ctx.moveTo(levels[15].x, levels[15].y);
    ctx.lineTo(levels[16].x, levels[16].y);
    ctx.stroke();
    
    // Level 14 -> 17 (Dragon's Peak to Cloud Castle)
    ctx.beginPath();
    ctx.moveTo(levels[13].x, levels[13].y);
    ctx.lineTo(levels[16].x, levels[16].y);
    ctx.stroke();
    
    // Level 17 -> 18 (Cloud Castle to Panda Temple)
    ctx.beginPath();
    ctx.moveTo(levels[16].x, levels[16].y);
    ctx.lineTo(levels[17].x, levels[17].y);
    ctx.stroke();
    
    // Level 16 -> 18 (Frozen Tundra to Panda Temple)
    ctx.beginPath();
    ctx.moveTo(levels[15].x, levels[15].y);
    ctx.lineTo(levels[17].x, levels[17].y);
    ctx.stroke();
    
    // Level 18 -> 19 (Panda Temple to Honey Hive)
    ctx.beginPath();
    ctx.moveTo(levels[17].x, levels[17].y);
    ctx.lineTo(levels[18].x, levels[18].y);
    ctx.stroke();
    
    // Level 19 -> 20 (Honey Hive to Aurora Sky)
    ctx.beginPath();
    ctx.moveTo(levels[18].x, levels[18].y);
    ctx.lineTo(levels[19].x, levels[19].y);
    ctx.stroke();
    
    // Level 19 -> 21 (Honey Hive to Coral Reef)
    ctx.beginPath();
    ctx.moveTo(levels[18].x, levels[18].y);
    ctx.lineTo(levels[20].x, levels[20].y);
    ctx.stroke();
    
    // Level 20 -> 22 (Aurora Sky to Golden Summit)
    ctx.beginPath();
    ctx.moveTo(levels[19].x, levels[19].y);
    ctx.lineTo(levels[21].x, levels[21].y);
    ctx.stroke();
    
    // Level 21 -> 22 (Coral Reef to Golden Summit)
    ctx.beginPath();
    ctx.moveTo(levels[20].x, levels[20].y);
    ctx.lineTo(levels[21].x, levels[21].y);
    ctx.stroke();
    
    // Level 20 -> 23 (Aurora Sky to Moonlight Garden)
    ctx.beginPath();
    ctx.moveTo(levels[19].x, levels[19].y);
    ctx.lineTo(levels[22].x, levels[22].y);
    ctx.stroke();
    
    // Level 22 -> 23 (Golden Summit to Moonlight Garden)
    ctx.beginPath();
    ctx.moveTo(levels[21].x, levels[21].y);
    ctx.lineTo(levels[22].x, levels[22].y);
    ctx.stroke();
    
    // Level 22 -> 24 (Golden Summit to Firefly Forest)
    ctx.beginPath();
    ctx.moveTo(levels[21].x, levels[21].y);
    ctx.lineTo(levels[23].x, levels[23].y);
    ctx.stroke();
    
    // Level 21 -> 24 (Coral Reef to Firefly Forest)
    ctx.beginPath();
    ctx.moveTo(levels[20].x, levels[20].y);
    ctx.lineTo(levels[23].x, levels[23].y);
    ctx.stroke();
    
    // Level 23 -> 25 (Moonlight Garden to Diamond Mine)
    ctx.beginPath();
    ctx.moveTo(levels[22].x, levels[22].y);
    ctx.lineTo(levels[24].x, levels[24].y);
    ctx.stroke();
    
    // Level 24 -> 26 (Firefly Forest to Butterfly Valley)
    ctx.beginPath();
    ctx.moveTo(levels[23].x, levels[23].y);
    ctx.lineTo(levels[25].x, levels[25].y);
    ctx.stroke();
    
    // Level 25 -> 27 (Diamond Mine to Panda Legend)
    ctx.beginPath();
    ctx.moveTo(levels[24].x, levels[24].y);
    ctx.lineTo(levels[26].x, levels[26].y);
    ctx.stroke();
    
    // Level 26 -> 27 (Butterfly Valley to Panda Legend)
    ctx.beginPath();
    ctx.moveTo(levels[25].x, levels[25].y);
    ctx.lineTo(levels[26].x, levels[26].y);
    ctx.stroke();
    
    // Level 25 -> 28 (Diamond Mine to Cotton Candy Clouds)
    ctx.beginPath();
    ctx.moveTo(levels[24].x, levels[24].y);
    ctx.lineTo(levels[27].x, levels[27].y);
    ctx.stroke();
    
    // Level 27 -> 28 (Panda Legend to Cotton Candy Clouds)
    ctx.beginPath();
    ctx.moveTo(levels[26].x, levels[26].y);
    ctx.lineTo(levels[27].x, levels[27].y);
    ctx.stroke();
    
    // Level 27 -> 29 (Panda Legend to Pirate Cove)
    ctx.beginPath();
    ctx.moveTo(levels[26].x, levels[26].y);
    ctx.lineTo(levels[28].x, levels[28].y);
    ctx.stroke();
    
    // Level 26 -> 29 (Butterfly Valley to Pirate Cove)
    ctx.beginPath();
    ctx.moveTo(levels[25].x, levels[25].y);
    ctx.lineTo(levels[28].x, levels[28].y);
    ctx.stroke();
    
    // Level 28 -> 30 (Cotton Candy Clouds to Neon City)
    ctx.beginPath();
    ctx.moveTo(levels[27].x, levels[27].y);
    ctx.lineTo(levels[29].x, levels[29].y);
    ctx.stroke();
    
    // Level 29 -> 31 (Pirate Cove to Sakura Springs)
    ctx.beginPath();
    ctx.moveTo(levels[28].x, levels[28].y);
    ctx.lineTo(levels[30].x, levels[30].y);
    ctx.stroke();
    
    // Level 30 -> 32 (Neon City to Infinity Peak)
    ctx.beginPath();
    ctx.moveTo(levels[29].x, levels[29].y);
    ctx.lineTo(levels[31].x, levels[31].y);
    ctx.stroke();
    
    // Level 31 -> 32 (Sakura Springs to Infinity Peak)
    ctx.beginPath();
    ctx.moveTo(levels[30].x, levels[30].y);
    ctx.lineTo(levels[31].x, levels[31].y);
    ctx.stroke();
    
    // Level 30 -> 33 (Neon City to Firefly Forest)
    ctx.beginPath();
    ctx.moveTo(levels[29].x, levels[29].y);
    ctx.lineTo(levels[32].x, levels[32].y);
    ctx.stroke();
    
    // Level 32 -> 33 (Infinity Peak to Firefly Forest)
    ctx.beginPath();
    ctx.moveTo(levels[31].x, levels[31].y);
    ctx.lineTo(levels[32].x, levels[32].y);
    ctx.stroke();
    
    // Level 32 -> 34 (Infinity Peak to Candy Kingdom)
    ctx.beginPath();
    ctx.moveTo(levels[31].x, levels[31].y);
    ctx.lineTo(levels[33].x, levels[33].y);
    ctx.stroke();
    
    // Level 31 -> 34 (Sakura Springs to Candy Kingdom)
    ctx.beginPath();
    ctx.moveTo(levels[30].x, levels[30].y);
    ctx.lineTo(levels[33].x, levels[33].y);
    ctx.stroke();
    
    // Level 33 -> 35 (Firefly Forest to Thunderstorm)
    ctx.beginPath();
    ctx.moveTo(levels[32].x, levels[32].y);
    ctx.lineTo(levels[34].x, levels[34].y);
    ctx.stroke();
    
    // Level 34 -> 36 (Candy Kingdom to Honeycomb Hive)
    ctx.beginPath();
    ctx.moveTo(levels[33].x, levels[33].y);
    ctx.lineTo(levels[35].x, levels[35].y);
    ctx.stroke();
    
    // Level 35 -> 37 (Thunderstorm to Coral Reef)
    ctx.beginPath();
    ctx.moveTo(levels[34].x, levels[34].y);
    ctx.lineTo(levels[36].x, levels[36].y);
    ctx.stroke();
    
    // Level 36 -> 38 (Honeycomb Hive to Galaxy Swirl)
    ctx.beginPath();
    ctx.moveTo(levels[35].x, levels[35].y);
    ctx.lineTo(levels[37].x, levels[37].y);
    ctx.stroke();
    
    // Level 35 -> 39 (Thunderstorm to Mint Garden)
    ctx.beginPath();
    ctx.moveTo(levels[34].x, levels[34].y);
    ctx.lineTo(levels[38].x, levels[38].y);
    ctx.stroke();
    
    // Level 36 -> 39 (Honeycomb Hive to Mint Garden)
    ctx.beginPath();
    ctx.moveTo(levels[35].x, levels[35].y);
    ctx.lineTo(levels[38].x, levels[38].y);
    ctx.stroke();
    
    // Level 37 -> 39 (Coral Reef to Mint Garden)
    ctx.beginPath();
    ctx.moveTo(levels[36].x, levels[36].y);
    ctx.lineTo(levels[38].x, levels[38].y);
    ctx.stroke();
    
    // Level 38 -> 39 (Galaxy Swirl to Mint Garden)
    ctx.beginPath();
    ctx.moveTo(levels[37].x, levels[37].y);
    ctx.lineTo(levels[38].x, levels[38].y);
    ctx.stroke();
    
    // Level 39 -> 40 (Mint Garden to Lava Mountain)
    ctx.beginPath();
    ctx.moveTo(levels[38].x, levels[38].y);
    ctx.lineTo(levels[39].x, levels[39].y);
    ctx.stroke();
    
    // Level 39 -> 41 (Mint Garden to Blueberry Hills)
    ctx.beginPath();
    ctx.moveTo(levels[38].x, levels[38].y);
    ctx.lineTo(levels[40].x, levels[40].y);
    ctx.stroke();
    
    // Level 40 -> 42 (Lava Mountain to Starlight Path)
    ctx.beginPath();
    ctx.moveTo(levels[39].x, levels[39].y);
    ctx.lineTo(levels[41].x, levels[41].y);
    ctx.stroke();
    
    // Level 41 -> 43 (Blueberry Hills to Peach Paradise)
    ctx.beginPath();
    ctx.moveTo(levels[40].x, levels[40].y);
    ctx.lineTo(levels[42].x, levels[42].y);
    ctx.stroke();
    
    // Level 40 -> 44 (Lava Mountain to Mystic Ruins)
    ctx.beginPath();
    ctx.moveTo(levels[39].x, levels[39].y);
    ctx.lineTo(levels[43].x, levels[43].y);
    ctx.stroke();
    
    // Level 41 -> 44 (Blueberry Hills to Mystic Ruins)
    ctx.beginPath();
    ctx.moveTo(levels[40].x, levels[40].y);
    ctx.lineTo(levels[43].x, levels[43].y);
    ctx.stroke();
    
    // Level 42 -> 44 (Starlight Path to Mystic Ruins)
    ctx.beginPath();
    ctx.moveTo(levels[41].x, levels[41].y);
    ctx.lineTo(levels[43].x, levels[43].y);
    ctx.stroke();
    
    // Level 43 -> 44 (Peach Paradise to Mystic Ruins)
    ctx.beginPath();
    ctx.moveTo(levels[42].x, levels[42].y);
    ctx.lineTo(levels[43].x, levels[43].y);
    ctx.stroke();
    
    // Level 44 -> 45 (Mystic Ruins to Electric Storm)
    ctx.beginPath();
    ctx.moveTo(levels[43].x, levels[43].y);
    ctx.lineTo(levels[44].x, levels[44].y);
    ctx.stroke();
    
    // Level 44 -> 46 (Mystic Ruins to Rainbow Bridge)
    ctx.beginPath();
    ctx.moveTo(levels[43].x, levels[43].y);
    ctx.lineTo(levels[45].x, levels[45].y);
    ctx.stroke();
    
    // Level 45 -> 47 (Electric Storm to Frozen Tundra)
    ctx.beginPath();
    ctx.moveTo(levels[44].x, levels[44].y);
    ctx.lineTo(levels[46].x, levels[46].y);
    ctx.stroke();
    
    // Level 42 -> 47 (Starlight Path to Frozen Tundra)
    ctx.beginPath();
    ctx.moveTo(levels[41].x, levels[41].y);
    ctx.lineTo(levels[46].x, levels[46].y);
    ctx.stroke();
    
    // Level 47 -> 48 (Frozen Tundra to Panda Paradise)
    ctx.beginPath();
    ctx.moveTo(levels[46].x, levels[46].y);
    ctx.lineTo(levels[47].x, levels[47].y);
    ctx.stroke();
    
    // Level 46 -> 48 (Rainbow Bridge to Panda Paradise)
    ctx.beginPath();
    ctx.moveTo(levels[45].x, levels[45].y);
    ctx.lineTo(levels[47].x, levels[47].y);
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

    // Party button in corner
    const partyBtnX = canvas.width - 70;
    const partyBtnY = 45;
    
    // Button background
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.roundRect(partyBtnX - 50, partyBtnY - 20, 100, 40, 10);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Button text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 PARTY', partyBtnX, partyBtnY + 5);
    
    // Key hint
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#ffcdd2';
    ctx.fillText('Press P', partyBtnX, partyBtnY + 22);

    // Instructions
    ctx.font = '16px Quicksand, sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow keys to select, ENTER to play, P for Party!', canvas.width / 2, canvas.height - 20);
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
    controlsHint.innerHTML = 'Use <span class="key">←</span> <span class="key">→</span> <span class="key">↑</span> <span class="key">↓</span> to select | <span class="key">ENTER</span> to play | <span class="key">P</span> for PARTY 🎉';
    
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
    
    setTimeout(() => { if (gameRunning) spawnJaguar(); }, 5000);
    
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

    // Check if ALL levels are completed!
    const allCompleted = levels.every(lvl => lvl.completed);
    
    if (allCompleted) {
        // BIG PARTY TIME! 🎉
        startParty();
        return;
    }

    // Start mini level party celebration!
    startLevelParty(stars);
}

function startLevelParty(stars) {
    levelPartyActive = true;
    levelPartyStars = stars;
    partyStartTime = performance.now() / 1000;
    confetti = [];
    
    // Create confetti burst
    createLevelConfetti();
    
    // Hide overlay during party
    overlay.classList.remove('visible');
    
    // Run the level party animation
    requestAnimationFrame(levelPartyLoop);
    
    // After 3 seconds, show the level complete overlay
    setTimeout(() => {
        levelPartyActive = false;
        confetti = [];
        showLevelCompleteOverlay();
    }, 3000);
}

function createLevelConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fff', '#a855f7', '#22d3ee', '#fb923c'];
    const shapes = ['circle', 'square', 'star'];
    
    // Create confetti bursting from center
    for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80;
        const speed = Math.random() * 8 + 4;
        confetti.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            speedY: Math.sin(angle) * speed - 2,
            speedX: Math.cos(angle) * speed,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            gravity: 0.15,
            life: 1
        });
    }
}

function levelPartyLoop(timestamp) {
    if (!levelPartyActive) return;
    
    const time = timestamp / 1000 - partyStartTime;
    const level = levels[currentLevelIndex];
    
    // Draw game background (keep the level visible)
    const theme = level.theme;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg3);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grass
    ctx.fillStyle = theme.grassColor;
    grass.forEach(g => {
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x - 3, g.y - 15);
        ctx.lineTo(g.x + 3, g.y - 15);
        ctx.fill();
    });
    
    // Draw obstacles
    obstacles.forEach(obs => {
        if (obs.type === 'tree') drawTree(obs.x, obs.y);
        else if (obs.type === 'rock') drawRock(obs.x, obs.y);
        else if (obs.type === 'bridge') drawBridge(obs.x, obs.y, obs.width, obs.height);
    });
    
    // Draw celebrating panda in center
    drawCelebratingPanda(panda.x, panda.y, time);
    
    // Update and draw confetti
    confetti.forEach(piece => {
        piece.x += piece.speedX;
        piece.y += piece.speedY;
        piece.speedY += piece.gravity;
        piece.speedX *= 0.99;
        piece.rotation += piece.rotationSpeed;
        piece.life -= 0.008;
        
        if (piece.life > 0) {
            ctx.save();
            ctx.globalAlpha = piece.life;
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            
            if (piece.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (piece.shape === 'square') {
                ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            } else if (piece.shape === 'star') {
                drawStar(0, 0, 5, piece.size / 2, piece.size / 4);
            }
            ctx.restore();
        }
    });
    
    // Draw celebration text
    const bounce = Math.sin(time * 8) * 5;
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 42px "Fredoka One", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.strokeText('🎉 AWESOME! 🎉', canvas.width / 2, 80 + bounce);
    ctx.fillText('🎉 AWESOME! 🎉', canvas.width / 2, 80 + bounce);
    
    // Draw stars earned
    let starsText = '';
    for (let i = 0; i < 3; i++) starsText += i < levelPartyStars ? '⭐' : '☆';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(starsText, canvas.width / 2, 140 + bounce);
    ctx.restore();
    
    // Level name
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeText(`${level.icon} ${level.name} Complete!`, canvas.width / 2, canvas.height - 60);
    ctx.fillText(`${level.icon} ${level.name} Complete!`, canvas.width / 2, canvas.height - 60);
    
    requestAnimationFrame(levelPartyLoop);
}

function drawCelebratingPanda(x, y, time) {
    ctx.save();
    
    // Jumping animation
    const jump = Math.abs(Math.sin(time * 6)) * 20;
    ctx.translate(x, y - jump);
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, 10, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -15, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-14, -28, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, -28, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(-8, -18, 7, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -18, 7, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Happy closed eyes
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-8, -17, 4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(8, -17, 4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Big smile
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -8, 8, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // Arms up in celebration!
    const armWave = Math.sin(time * 12) * 0.3;
    ctx.fillStyle = 'black';
    
    // Left arm up
    ctx.save();
    ctx.translate(-18, 0);
    ctx.rotate(-1.2 + armWave);
    ctx.beginPath();
    ctx.ellipse(0, -12, 6, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Right arm up
    ctx.save();
    ctx.translate(18, 0);
    ctx.rotate(1.2 - armWave);
    ctx.beginPath();
    ctx.ellipse(0, -12, 6, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Legs
    ctx.beginPath();
    ctx.ellipse(-10, 28, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 28, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function showLevelCompleteOverlay() {
    let starsDisplay = '';
    for (let i = 0; i < 3; i++) starsDisplay += i < levelPartyStars ? '⭐' : '☆';

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

// ==================== PARTY CELEBRATION ====================
function createConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fff', '#a855f7', '#22d3ee', '#fb923c'];
    const shapes = ['circle', 'square', 'star', 'heart'];
    
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 12 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            oscillation: Math.random() * Math.PI * 2
        });
    }
}

function drawConfettiPiece(piece) {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation * Math.PI / 180);
    ctx.fillStyle = piece.color;
    
    switch (piece.shape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            break;
        case 'star':
            drawStar(0, 0, 5, piece.size / 2, piece.size / 4);
            break;
        case 'heart':
            drawHeart(0, 0, piece.size / 2);
            break;
    }
    ctx.restore();
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawHeart(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y - size / 2, x - size, y - size / 2, x - size, y + size / 4);
    ctx.bezierCurveTo(x - size, y + size, x, y + size * 1.5, x, y + size * 1.5);
    ctx.bezierCurveTo(x, y + size * 1.5, x + size, y + size, x + size, y + size / 4);
    ctx.bezierCurveTo(x + size, y - size / 2, x, y - size / 2, x, y + size / 4);
    ctx.fill();
}

function updateConfetti() {
    confetti.forEach(piece => {
        piece.y += piece.speedY;
        piece.x += piece.speedX + Math.sin(piece.oscillation) * 0.5;
        piece.oscillation += 0.05;
        piece.rotation += piece.rotationSpeed;
        
        // Reset confetti that falls off screen
        if (piece.y > canvas.height + 20) {
            piece.y = -20;
            piece.x = Math.random() * canvas.width;
        }
    });
}

function drawPartyPanda(x, y, time) {
    // Dancing panda - bounces and sways!
    const bounce = Math.sin(time * 8) * 10;
    const sway = Math.sin(time * 4) * 5;
    
    ctx.save();
    ctx.translate(x + sway, y + bounce);
    
    // Draw big happy panda
    const scale = 2;
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, 15 * scale, 18 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -15 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-14 * scale, -28 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14 * scale, -28 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(-8 * scale, -18 * scale, 7 * scale, 9 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8 * scale, -18 * scale, 7 * scale, 9 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Happy eyes (closed arcs for smiling)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-8 * scale, -17 * scale, 4 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(8 * scale, -17 * scale, 4 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Big happy smile
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -8 * scale, 8 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // Party hat!
    const hatColors = ['#ff6b6b', '#ffd93d', '#6bcb77'];
    ctx.fillStyle = hatColors[Math.floor(time * 2) % 3];
    ctx.beginPath();
    ctx.moveTo(0, -50 * scale);
    ctx.lineTo(-12 * scale, -25 * scale);
    ctx.lineTo(12 * scale, -25 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Pom pom on hat
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -52 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms waving!
    const armWave = Math.sin(time * 10) * 0.5;
    ctx.fillStyle = 'black';
    
    // Left arm
    ctx.save();
    ctx.translate(-20 * scale, 5 * scale);
    ctx.rotate(-0.8 + armWave);
    ctx.beginPath();
    ctx.ellipse(0, 15 * scale, 6 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Right arm
    ctx.save();
    ctx.translate(20 * scale, 5 * scale);
    ctx.rotate(0.8 - armWave);
    ctx.beginPath();
    ctx.ellipse(0, 15 * scale, 6 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
}

function drawPartyText(time) {
    // Rainbow animated text
    const messages = ['🎉 YOU WIN! 🎉', '🏆 CHAMPION! 🏆', '🐼 PANDA MASTER! 🐼'];
    const msgIndex = Math.floor(time) % messages.length;
    
    ctx.save();
    
    // Glowing effect
    ctx.shadowColor = `hsl(${(time * 100) % 360}, 100%, 50%)`;
    ctx.shadowBlur = 30;
    
    // Main text
    ctx.font = 'bold 48px "Fredoka One", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Rainbow gradient
    const gradient = ctx.createLinearGradient(canvas.width / 2 - 200, 0, canvas.width / 2 + 200, 0);
    const hue1 = (time * 50) % 360;
    gradient.addColorStop(0, `hsl(${hue1}, 100%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${(hue1 + 120) % 360}, 100%, 50%)`);
    gradient.addColorStop(1, `hsl(${(hue1 + 240) % 360}, 100%, 50%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillText(messages[msgIndex], canvas.width / 2, 80 + Math.sin(time * 3) * 10);
    
    // Sub text
    ctx.shadowBlur = 0;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('All 10 Levels Complete! Amazing!', canvas.width / 2, 140);
    
    // Stars count
    const totalStars = levels.reduce((sum, lvl) => sum + lvl.stars, 0);
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Total Stars: ${totalStars} / 144 ⭐`, canvas.width / 2, canvas.height - 120);
    
    ctx.restore();
}

function drawPartyBackground(time) {
    // Animated gradient background
    const hue = (time * 30) % 360;
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, `hsl(${hue}, 70%, 40%)`);
    gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 60%, 30%)`);
    gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 50%, 20%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sparkles
    for (let i = 0; i < 20; i++) {
        const sparkleX = (Math.sin(time * 2 + i) * 0.5 + 0.5) * canvas.width;
        const sparkleY = (Math.cos(time * 1.5 + i * 0.7) * 0.5 + 0.5) * canvas.height;
        const sparkleSize = Math.sin(time * 5 + i) * 3 + 4;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 8 + i) * 0.5})`;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function startParty() {
    currentMode = MODE_PARTY;
    gameRunning = false;
    partyStartTime = performance.now() / 1000;
    confetti = [];
    createConfetti();
    selectedMiniGame = 0;
    
    overlay.classList.remove('visible');
    overlay.style.background = 'transparent';
    overlay.style.boxShadow = 'none';
    
    // Show party for 4 seconds then go to party hub
    setTimeout(() => {
        if (currentMode === MODE_PARTY) {
            startPartyHub();
        }
    }, 4000);
    
    requestAnimationFrame(partyLoop);
}

function partyLoop(timestamp) {
    if (currentMode !== MODE_PARTY) return;
    
    const time = timestamp / 1000 - partyStartTime;
    
    // Draw party!
    drawPartyBackground(time);
    updateConfetti();
    confetti.forEach(piece => drawConfettiPiece(piece));
    drawPartyPanda(canvas.width / 2, canvas.height / 2 + 30, time);
    drawPartyText(time);
    
    // Instructions at bottom
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText('🎮 Party games loading... 🎮', canvas.width / 2, canvas.height - 60);
    
    requestAnimationFrame(partyLoop);
}

// ==================== PARTY HUB - MINI GAME SELECTION ====================
// Bundle 1 - Original party games
const miniGamesBundle1 = [
    { id: 'catch', name: 'Bamboo Catch', icon: '🎋', desc: 'Catch falling bamboo!', color: '#4ade80', levels: 3 },
    { id: 'dance', name: 'Panda Dance', icon: '💃', desc: 'Match the arrows!', color: '#f472b6', levels: 3 },
    { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Find the pairs!', color: '#60a5fa', levels: 3 },
    { id: 'runner', name: 'Panda Run', icon: '🏃', desc: 'Jump over obstacles!', color: '#fbbf24', levels: 3 },
    { id: 'balloon', name: 'Balloon Pop', icon: '🎈', desc: 'Pop the balloons!', color: '#ef4444', levels: 3 },
    { id: 'pong', name: 'Panda Pong', icon: '🏓', desc: 'Beat the computer!', color: '#8b5cf6', levels: 3 },
    { id: 'whack', name: 'Whack-a-Jaguar', icon: '🔨', desc: 'Bonk the jaguars!', color: '#f97316', levels: 3 },
    { id: 'stack', name: 'Panda Stack', icon: '🐼', desc: 'Stack the pandas!', color: '#10b981', levels: 3 },
    { id: 'cake', name: 'Cake Maker', icon: '🎂', desc: 'Decorate a cake!', color: '#ec4899', levels: 1 },
    { id: 'dancefloor', name: 'Dance Floor', icon: '🕺', desc: 'Control the party!', color: '#06b6d4', levels: 3 }
];

// Bundle 2 - Unlocked after completing Bundle 1
const miniGamesBundle2 = [
    { id: 'snake', name: 'Panda Snake', icon: '🐍', desc: 'Eat bamboo & grow!', color: '#22c55e', levels: 3 },
    { id: 'brick', name: 'Brick Breaker', icon: '🧱', desc: 'Break all bricks!', color: '#f59e0b', levels: 3 },
    { id: 'space', name: 'Space Panda', icon: '🚀', desc: 'Shoot the asteroids!', color: '#3b82f6', levels: 3 },
    { id: 'puzzle', name: 'Slide Puzzle', icon: '🧩', desc: 'Solve the puzzle!', color: '#a855f7', levels: 3 }
];

// Bundle 3 - Unlocked after completing Bundle 2
const miniGamesBundle3 = [
    { id: 'flappy', name: 'Flappy Panda', icon: '🐦', desc: 'Fly through pipes!', color: '#14b8a6', levels: 3 },
    { id: 'tetris', name: 'Panda Blocks', icon: '🟦', desc: 'Stack the blocks!', color: '#6366f1', levels: 3 },
    { id: 'fishing', name: 'Panda Fishing', icon: '🎣', desc: 'Catch the fish!', color: '#0ea5e9', levels: 3 },
    { id: 'racing', name: 'Panda Racer', icon: '🏎️', desc: 'Win the race!', color: '#dc2626', levels: 3 }
];

// Current active games based on bundle
let miniGames = miniGamesBundle1;

function startPartyHub() {
    currentMode = MODE_PARTY_HUB;
    confetti = [];
    createConfetti();
    partyStartTime = performance.now() / 1000;
    selectedMiniGame = 0;
    miniGameLevel = 1;
    
    // Check if bundle 2 should be unlocked
    checkBundle2Unlock();
    
    // Load saved progress
    loadMiniGameProgress();
    
    // Set current games based on bundle
    miniGames = currentBundle === 1 ? miniGamesBundle1 : miniGamesBundle2;
    
    overlay.classList.remove('visible');
    requestAnimationFrame(partyHubLoop);
}

function checkBundle2Unlock() {
    // Check Bundle 1 completion for Bundle 2 unlock
    const bundle1Games = ['catch', 'dance', 'memory', 'runner', 'balloon', 'pong', 'whack', 'stack', 'cake', 'dancefloor'];
    const bundle1Completed = bundle1Games.every(id => miniGameProgress[id]?.completed);
    if (bundle1Completed && !bundle2Unlocked) {
        bundle2Unlocked = true;
        localStorage.setItem('bundle2Unlocked', 'true');
    }
    
    // Check Bundle 2 completion for Bundle 3 unlock
    const bundle2Completed = Object.values(bundle2Progress).every(p => p.completed);
    if (bundle2Completed && bundle2Unlocked && !bundle3Unlocked) {
        bundle3Unlocked = true;
        localStorage.setItem('bundle3Unlocked', 'true');
    }
    
    // Load saved bundle unlock states
    if (localStorage.getItem('bundle2Unlocked') === 'true') {
        bundle2Unlocked = true;
    }
    if (localStorage.getItem('bundle3Unlocked') === 'true') {
        bundle3Unlocked = true;
    }
}

function loadMiniGameProgress() {
    const saved = localStorage.getItem('miniGameProgress');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                if (miniGameProgress[key]) {
                    miniGameProgress[key] = parsed[key];
                }
            });
        } catch(e) {}
    }
}

function saveMiniGameProgress() {
    localStorage.setItem('miniGameProgress', JSON.stringify(miniGameProgress));
}

function markGameCompleted(gameId, level) {
    if (miniGameProgress[gameId]) {
        miniGameProgress[gameId].completed = true;
        if (level > miniGameProgress[gameId].bestLevel) {
            miniGameProgress[gameId].bestLevel = level;
        }
        saveMiniGameProgress();
        checkBundle2Unlock();
    }
}

function partyHubLoop(timestamp) {
    if (currentMode !== MODE_PARTY_HUB) return;
    
    const time = timestamp / 1000 - partyStartTime;
    
    // Background
    drawPartyBackground(time);
    updateConfetti();
    confetti.forEach(piece => drawConfettiPiece(piece));
    
    // Bundle indicator at top
    const bundleName = currentBundle === 1 ? '🎮 BUNDLE 1' : '🌟 BUNDLE 2';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, 35);
    
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(bundleName, 20, 25);
    
    // Completion count
    const completed = Object.values(miniGameProgress).filter(p => p.completed).length;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`✓ ${completed}/10 Complete`, canvas.width - 20, 25);
    
    // Bundle switch button (if bundle 2 unlocked)
    if (bundle2Unlocked) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('Press TAB to switch bundles', canvas.width / 2, 25);
    } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.fillText(`Complete all 10 to unlock Bundle 2!`, canvas.width / 2, 25);
    }
    
    // Title
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 36px "Fredoka One", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('🎉 PANDA PARTY! 🎉', canvas.width / 2, 65);
    ctx.restore();
    
    // Level selector for selected game
    const selectedGame = miniGames[selectedMiniGame];
    if (selectedGame && selectedGame.levels > 1) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`Level ${miniGameLevel}/${selectedGame.levels} (Q/E to change)`, canvas.width / 2, 90);
    } else {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Select a game!', canvas.width / 2, 90);
    }
    
    // Draw mini-game cards
    const cardWidth = currentBundle === 1 ? 120 : 140;
    const cardHeight = currentBundle === 1 ? 125 : 140;
    const gap = 12;
    const startY = 105;
    const rowGap = 10;
    const cols = currentBundle === 1 ? 5 : 4;
    
    miniGames.forEach((game, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const totalRowWidth = Math.min(cols, miniGames.length - row * cols) * cardWidth + (Math.min(cols, miniGames.length - row * cols) - 1) * gap;
        const rowStartX = (canvas.width - totalRowWidth) / 2;
        const cardX = rowStartX + col * (cardWidth + gap);
        const cardY = startY + row * (cardHeight + rowGap);
        const isSelected = index === selectedMiniGame;
        const hoverBounce = isSelected ? Math.sin(time * 6) * 5 : 0;
        
        // Check completion status
        const progress = miniGameProgress[game.id];
        const isCompleted = progress ? progress.completed : false;
        const bestLevel = progress ? progress.bestLevel : 0;
        
        // Card shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(cardX + 4, cardY + 4 - hoverBounce, cardWidth, cardHeight);
        
        // Card background
        const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
        cardGradient.addColorStop(0, isSelected ? game.color : '#444');
        cardGradient.addColorStop(1, isSelected ? shadeColor(game.color, -30) : '#222');
        ctx.fillStyle = cardGradient;
        ctx.fillRect(cardX, cardY - hoverBounce, cardWidth, cardHeight);
        
        // Completion checkmark
        if (isCompleted) {
            ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.fillRect(cardX, cardY - hoverBounce, cardWidth, cardHeight);
        }
        
        // Card border
        ctx.strokeStyle = isSelected ? '#fff' : (isCompleted ? '#4ade80' : '#666');
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.strokeRect(cardX, cardY - hoverBounce, cardWidth, cardHeight);
        
        // Completion badge
        if (isCompleted) {
            ctx.font = '16px sans-serif';
            ctx.fillText('✓', cardX + cardWidth - 15, cardY + 18 - hoverBounce);
        }
        
        // Icon
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(game.icon, cardX + cardWidth / 2, cardY + 48 - hoverBounce);
        
        // Name
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(game.name, cardX + cardWidth / 2, cardY + 72 - hoverBounce);
        
        // Best level stars
        if (game.levels > 1) {
            let stars = '';
            for (let i = 1; i <= game.levels; i++) {
                stars += i <= bestLevel ? '⭐' : '☆';
            }
            ctx.font = '12px sans-serif';
            ctx.fillText(stars, cardX + cardWidth / 2, cardY + 90 - hoverBounce);
        }
        
        // Key hint
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = isSelected ? '#ffd700' : '#888';
        const keyHint = index < 9 ? `[${index + 1}]` : '[0]';
        ctx.fillText(keyHint, cardX + cardWidth / 2, cardY + cardHeight - 10 - hoverBounce);
    });
    
    // Instructions
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('← → ↑ ↓ select | Q/E level | ENTER play | ESC map', canvas.width / 2, canvas.height - 45);
    
    // Draw small dancing panda
    drawSmallDancingPanda(50, canvas.height - 60, time);
    drawSmallDancingPanda(canvas.width - 50, canvas.height - 60, time);
    
    requestAnimationFrame(partyHubLoop);
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + 
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

function drawSmallDancingPanda(x, y, time) {
    const bounce = Math.sin(time * 8) * 5;
    const sway = Math.sin(time * 4) * 3;
    
    ctx.save();
    ctx.translate(x + sway, y + bounce);
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, 8, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-9, -18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(9, -18, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(-5, -10, 4, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -10, 4, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-5, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function exitParty() {
    currentMode = MODE_MAP;
    confetti = [];
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    overlay.classList.remove('visible');
    showMap();
}

// ==================== MINI GAME: BAMBOO CATCH ====================
function startBambooCatch() {
    currentMode = MODE_MINIGAME_CATCH;
    miniGameScore = 0;
    miniGameTimer = 30;
    partyStartTime = performance.now() / 1000;
    miniGameData = {
        pandaX: canvas.width / 2,
        bamboos: [],
        lastSpawn: 0,
        highScore: parseInt(localStorage.getItem('bambooCatchHigh') || '0')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(bambooCatchLoop);
    
    // Timer countdown
    const timerInterval = setInterval(() => {
        if (currentMode !== MODE_MINIGAME_CATCH) {
            clearInterval(timerInterval);
            return;
        }
        miniGameTimer--;
        if (miniGameTimer <= 0) {
            clearInterval(timerInterval);
            endBambooCatch();
        }
    }, 1000);
}

function bambooCatchLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_CATCH) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    // Move panda with keys
    if (keysPressed.left) data.pandaX -= 8;
    if (keysPressed.right) data.pandaX += 8;
    data.pandaX = Math.max(30, Math.min(canvas.width - 30, data.pandaX));
    
    // Spawn bamboo
    if (time - data.lastSpawn > 0.5) {
        data.bamboos.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: -20,
            speed: Math.random() * 3 + 2,
            rotation: 0
        });
        data.lastSpawn = time;
    }
    
    // Update bamboos
    data.bamboos.forEach(b => {
        b.y += b.speed;
        b.rotation += 0.1;
    });
    
    // Check catches
    for (let i = data.bamboos.length - 1; i >= 0; i--) {
        const b = data.bamboos[i];
        if (b.y > canvas.height - 60 && Math.abs(b.x - data.pandaX) < 40) {
            data.bamboos.splice(i, 1);
            miniGameScore++;
        } else if (b.y > canvas.height + 20) {
            data.bamboos.splice(i, 1);
        }
    }
    
    // Draw
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a472a');
    gradient.addColorStop(1, '#0d2818');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#2d5a3d';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    
    // Bamboos
    data.bamboos.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        drawBambooItem(0, 0, 30);
        ctx.restore();
    });
    
    // Panda
    drawCatchingPanda(data.pandaX, canvas.height - 60);
    
    // UI
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`🎋 Score: ${miniGameScore}`, 20, 40);
    ctx.fillText(`⏱️ Time: ${miniGameTimer}s`, 20, 70);
    ctx.textAlign = 'right';
    ctx.fillText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 40);
    
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('🎋 BAMBOO CATCH 🎋', canvas.width / 2, 50);
    
    requestAnimationFrame(bambooCatchLoop);
}

function drawBambooItem(x, y, size) {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x - 5, y - size/2, 10, size);
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(x - 3, y - size/2, 6, size);
    // Leaves
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.ellipse(x + 8, y - size/3, 8, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 8, y + size/4, 8, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawCatchingPanda(x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, 15, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -15, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-17, -32, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(17, -32, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(-9, -18, 8, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, -18, 8, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes looking up
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-9, -20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(9, -20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-9, -21, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(9, -21, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms up to catch
    ctx.fillStyle = 'black';
    ctx.save();
    ctx.translate(-25, 0);
    ctx.rotate(-0.8);
    ctx.beginPath();
    ctx.ellipse(0, -15, 8, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(25, 0);
    ctx.rotate(0.8);
    ctx.beginPath();
    ctx.ellipse(0, -15, 8, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
}

function endBambooCatch() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('bambooCatchHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #4ade80;">🎋 Bamboo Catch Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startBambooCatch;
}

// ==================== MINI GAME: PANDA DANCE ====================
function startPandaDance() {
    currentMode = MODE_MINIGAME_DANCE;
    miniGameScore = 0;
    miniGameTimer = 30;
    partyStartTime = performance.now() / 1000;
    miniGameData = {
        arrows: [],
        lastSpawn: 0,
        combo: 0,
        maxCombo: 0,
        hitZoneY: canvas.height - 100,
        highScore: parseInt(localStorage.getItem('pandaDanceHigh') || '0'),
        lastHit: '',
        hitTime: 0
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(pandaDanceLoop);
    
    const timerInterval = setInterval(() => {
        if (currentMode !== MODE_MINIGAME_DANCE) {
            clearInterval(timerInterval);
            return;
        }
        miniGameTimer--;
        if (miniGameTimer <= 0) {
            clearInterval(timerInterval);
            endPandaDance();
        }
    }, 1000);
}

function pandaDanceLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_DANCE) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    // Spawn arrows
    if (time - data.lastSpawn > 0.8) {
        const directions = ['up', 'down', 'left', 'right'];
        const dir = directions[Math.floor(Math.random() * 4)];
        data.arrows.push({
            direction: dir,
            y: -50,
            speed: 4,
            hit: false
        });
        data.lastSpawn = time;
    }
    
    // Update arrows
    data.arrows.forEach(a => {
        if (!a.hit) a.y += a.speed;
    });
    
    // Remove off-screen arrows (missed)
    for (let i = data.arrows.length - 1; i >= 0; i--) {
        if (data.arrows[i].y > canvas.height + 50 && !data.arrows[i].hit) {
            data.arrows.splice(i, 1);
            data.combo = 0;
        } else if (data.arrows[i].hit && data.arrows[i].y > canvas.height + 50) {
            data.arrows.splice(i, 1);
        }
    }
    
    // Draw
    // Background - disco style
    const hue = (time * 50) % 360;
    ctx.fillStyle = `hsl(${hue}, 30%, 15%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dance floor pattern
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
            const tileHue = (hue + i * 20 + j * 30) % 360;
            ctx.fillStyle = `hsla(${tileHue}, 50%, 30%, 0.3)`;
            ctx.fillRect(i * 100, j * 80, 100, 80);
        }
    }
    
    // Hit zone
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, data.hitZoneY - 30, canvas.width, 60);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, data.hitZoneY - 30, canvas.width, 60);
    
    // Target arrows
    const arrowColors = { up: '#ff6b6b', down: '#4ecdc4', left: '#ffe66d', right: '#95e1d3' };
    const arrowSymbols = { up: '↑', down: '↓', left: '←', right: '→' };
    const laneX = { left: 150, down: 300, up: 450, right: 600 };
    
    // Draw lane guides
    Object.keys(laneX).forEach(dir => {
        ctx.strokeStyle = arrowColors[dir];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(laneX[dir], 0);
        ctx.lineTo(laneX[dir], canvas.height);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Target zone indicators
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText(arrowSymbols[dir], laneX[dir], data.hitZoneY + 10);
    });
    
    // Draw falling arrows
    data.arrows.forEach(a => {
        if (!a.hit) {
            ctx.font = 'bold 50px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = arrowColors[a.direction];
            ctx.fillText(arrowSymbols[a.direction], laneX[a.direction], a.y);
        }
    });
    
    // Hit feedback
    if (time - data.hitTime < 0.3 && data.lastHit) {
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = data.lastHit === 'PERFECT!' ? '#ffd700' : (data.lastHit === 'GOOD!' ? '#4ade80' : '#ff6b6b');
        ctx.fillText(data.lastHit, canvas.width / 2, data.hitZoneY - 50);
    }
    
    // Dancing panda
    const bounce = Math.sin(time * 8) * 10;
    drawSmallDancingPanda(canvas.width / 2, canvas.height - 50 + bounce, time);
    
    // UI
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`⭐ Score: ${miniGameScore}`, 20, 40);
    ctx.fillText(`🔥 Combo: ${data.combo}`, 20, 70);
    ctx.textAlign = 'right';
    ctx.fillText(`⏱️ ${miniGameTimer}s`, canvas.width - 20, 40);
    ctx.fillText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 70);
    
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f472b6';
    ctx.fillText('💃 PANDA DANCE 💃', canvas.width / 2, 50);
    
    requestAnimationFrame(pandaDanceLoop);
}

function checkDanceHit(direction) {
    if (currentMode !== MODE_MINIGAME_DANCE) return;
    
    const data = miniGameData;
    const time = performance.now() / 1000;
    
    for (let i = 0; i < data.arrows.length; i++) {
        const a = data.arrows[i];
        if (a.direction === direction && !a.hit) {
            const dist = Math.abs(a.y - data.hitZoneY);
            if (dist < 20) {
                // Perfect hit
                a.hit = true;
                miniGameScore += 100 + data.combo * 10;
                data.combo++;
                data.maxCombo = Math.max(data.maxCombo, data.combo);
                data.lastHit = 'PERFECT!';
                data.hitTime = time;
                return;
            } else if (dist < 50) {
                // Good hit
                a.hit = true;
                miniGameScore += 50 + data.combo * 5;
                data.combo++;
                data.maxCombo = Math.max(data.maxCombo, data.combo);
                data.lastHit = 'GOOD!';
                data.hitTime = time;
                return;
            }
        }
    }
    // Miss
    data.combo = 0;
    data.lastHit = 'MISS!';
    data.hitTime = time;
}

function endPandaDance() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('pandaDanceHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #f472b6;">💃 Panda Dance Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>🔥 Max Combo: ${data.maxCombo} | 🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startPandaDance;
}

// ==================== MINI GAME: MEMORY MATCH ====================
function startMemoryMatch() {
    currentMode = MODE_MINIGAME_MEMORY;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    // Create card pairs
    const emojis = ['🐼', '🎋', '🌸', '⭐', '🎉', '💎', '🌈', '🍀'];
    const cards = [...emojis, ...emojis];
    
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    miniGameData = {
        cards: cards.map((emoji, i) => ({ emoji, flipped: false, matched: false, index: i })),
        selected: [],
        moves: 0,
        matches: 0,
        canClick: true,
        highScore: parseInt(localStorage.getItem('memoryMatchHigh') || '999'),
        selectedIndex: 0
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(memoryMatchLoop);
}

function memoryMatchLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_MEMORY) return;
    
    const time = timestamp / 1000 - partyStartTime;
    const data = miniGameData;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars background
    for (let i = 0; i < 30; i++) {
        const starX = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
        const starY = (Math.cos(i * 789.123) * 0.5 + 0.5) * canvas.height;
        const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.5})`;
        ctx.beginPath();
        ctx.arc(starX, starY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Title
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('🧠 MEMORY MATCH 🧠', canvas.width / 2, 45);
    
    // Draw cards
    const cols = 4;
    const rows = 4;
    const cardWidth = 90;
    const cardHeight = 100;
    const gap = 15;
    const startX = (canvas.width - (cols * cardWidth + (cols - 1) * gap)) / 2;
    const startY = 80;
    
    data.cards.forEach((card, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardWidth + gap);
        const y = startY + row * (cardHeight + gap);
        
        const isSelected = i === data.selectedIndex;
        const bounce = (card.flipped || card.matched) ? Math.sin(time * 5) * 2 : 0;
        
        // Card shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 3, y + 3 + bounce, cardWidth, cardHeight);
        
        // Card
        if (card.flipped || card.matched) {
            ctx.fillStyle = card.matched ? '#4ade80' : '#fff';
            ctx.fillRect(x, y + bounce, cardWidth, cardHeight);
            
            // Emoji
            ctx.font = '40px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(card.emoji, x + cardWidth / 2, y + cardHeight / 2 + 15 + bounce);
        } else {
            // Card back
            const cardGradient = ctx.createLinearGradient(x, y, x + cardWidth, y + cardHeight);
            cardGradient.addColorStop(0, '#6366f1');
            cardGradient.addColorStop(1, '#4338ca');
            ctx.fillStyle = cardGradient;
            ctx.fillRect(x, y, cardWidth, cardHeight);
            
            // Pattern
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.font = '30px sans-serif';
            ctx.fillText('?', x + cardWidth / 2, y + cardHeight / 2 + 10);
        }
        
        // Selection highlight
        if (isSelected) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.strokeRect(x - 2, y - 2 + bounce, cardWidth + 4, cardHeight + 4);
        }
    });
    
    // UI
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`🎯 Moves: ${data.moves}`, 20, canvas.height - 40);
    ctx.fillText(`✨ Matches: ${data.matches}/8`, 20, canvas.height - 15);
    ctx.textAlign = 'right';
    ctx.fillText(`🏆 Best: ${data.highScore === 999 ? '-' : data.highScore} moves`, canvas.width - 20, canvas.height - 40);
    
    ctx.textAlign = 'center';
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Arrow keys to select | ENTER to flip', canvas.width / 2, canvas.height - 15);
    
    requestAnimationFrame(memoryMatchLoop);
}

function flipMemoryCard() {
    if (currentMode !== MODE_MINIGAME_MEMORY) return;
    
    const data = miniGameData;
    if (!data.canClick) return;
    
    const card = data.cards[data.selectedIndex];
    if (card.flipped || card.matched) return;
    
    card.flipped = true;
    data.selected.push(data.selectedIndex);
    
    if (data.selected.length === 2) {
        data.moves++;
        data.canClick = false;
        
        const card1 = data.cards[data.selected[0]];
        const card2 = data.cards[data.selected[1]];
        
        if (card1.emoji === card2.emoji) {
            // Match!
            card1.matched = true;
            card2.matched = true;
            data.matches++;
            data.selected = [];
            data.canClick = true;
            
            if (data.matches === 8) {
                setTimeout(() => endMemoryMatch(), 500);
            }
        } else {
            // No match - flip back
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                data.selected = [];
                data.canClick = true;
            }, 1000);
        }
    }
}

function endMemoryMatch() {
    const data = miniGameData;
    if (data.moves < data.highScore) {
        localStorage.setItem('memoryMatchHigh', data.moves.toString());
        data.highScore = data.moves;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #60a5fa;">🧠 Memory Match Complete!</h2>
        <p style="font-size: 2rem;">Moves: ${data.moves}</p>
        <p>🏆 Best: ${data.highScore} moves</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startMemoryMatch;
}

// ==================== MINI GAME: PANDA RUNNER ====================
function startPandaRunner() {
    currentMode = MODE_MINIGAME_RUNNER;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    miniGameData = {
        pandaY: canvas.height - 100,
        pandaVelY: 0,
        isJumping: false,
        obstacles: [],
        lastSpawn: 0,
        speed: 5,
        groundY: canvas.height - 60,
        gameOver: false,
        highScore: parseInt(localStorage.getItem('pandaRunnerHigh') || '0'),
        distance: 0
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(pandaRunnerLoop);
}

function pandaRunnerLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_RUNNER) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    if (data.gameOver) {
        requestAnimationFrame(pandaRunnerLoop);
        return;
    }
    
    // Gravity and jumping
    if (data.isJumping) {
        data.pandaVelY += 0.8; // gravity
        data.pandaY += data.pandaVelY;
        
        if (data.pandaY >= data.groundY) {
            data.pandaY = data.groundY;
            data.isJumping = false;
            data.pandaVelY = 0;
        }
    }
    
    // Spawn obstacles
    if (time - data.lastSpawn > 1.5 - Math.min(data.distance / 2000, 0.8)) {
        const types = ['rock', 'cactus', 'bird'];
        const type = types[Math.floor(Math.random() * types.length)];
        data.obstacles.push({
            x: canvas.width + 50,
            y: type === 'bird' ? data.groundY - 60 - Math.random() * 40 : data.groundY,
            type: type,
            width: type === 'bird' ? 40 : 50,
            height: type === 'bird' ? 30 : 50
        });
        data.lastSpawn = time;
    }
    
    // Update obstacles
    const currentSpeed = data.speed + data.distance / 500;
    data.obstacles.forEach(obs => {
        obs.x -= currentSpeed;
    });
    
    // Remove off-screen obstacles and add score
    for (let i = data.obstacles.length - 1; i >= 0; i--) {
        if (data.obstacles[i].x < -50) {
            data.obstacles.splice(i, 1);
            miniGameScore += 10;
        }
    }
    
    // Collision detection
    const pandaBox = { x: 80, y: data.pandaY - 50, width: 40, height: 50 };
    for (const obs of data.obstacles) {
        const obsBox = { x: obs.x, y: obs.y - obs.height, width: obs.width, height: obs.height };
        if (pandaBox.x < obsBox.x + obsBox.width &&
            pandaBox.x + pandaBox.width > obsBox.x &&
            pandaBox.y < obsBox.y + obsBox.height &&
            pandaBox.y + pandaBox.height > obsBox.y) {
            data.gameOver = true;
            endPandaRunner();
            return;
        }
    }
    
    data.distance += currentSpeed;
    miniGameScore = Math.floor(data.distance / 10);
    
    // Draw
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#E0F6FF');
    gradient.addColorStop(1, '#98D982');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 5; i++) {
        const cloudX = ((i * 200 - data.distance * 0.2) % (canvas.width + 100)) - 50;
        ctx.beginPath();
        ctx.arc(cloudX, 80 + i * 20, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 85 + i * 20, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, 80 + i * 20, 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, data.groundY, canvas.width, 60);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, data.groundY - 5, canvas.width, 10);
    
    // Draw obstacles
    data.obstacles.forEach(obs => {
        if (obs.type === 'rock') {
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + 25, obs.y - 50);
            ctx.lineTo(obs.x + 50, obs.y);
            ctx.fill();
            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.moveTo(obs.x + 10, obs.y);
            ctx.lineTo(obs.x + 25, obs.y - 35);
            ctx.lineTo(obs.x + 40, obs.y);
            ctx.fill();
        } else if (obs.type === 'cactus') {
            ctx.fillStyle = '#228B22';
            ctx.fillRect(obs.x + 15, obs.y - 50, 20, 50);
            ctx.fillRect(obs.x, obs.y - 35, 15, 10);
            ctx.fillRect(obs.x + 35, obs.y - 40, 15, 10);
            ctx.fillRect(obs.x, obs.y - 35, 10, -15);
            ctx.fillRect(obs.x + 40, obs.y - 40, 10, -15);
        } else if (obs.type === 'bird') {
            ctx.fillStyle = '#4A4A4A';
            const wingFlap = Math.sin(time * 15) * 10;
            ctx.beginPath();
            ctx.ellipse(obs.x + 20, obs.y, 20, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            // Wings
            ctx.beginPath();
            ctx.moveTo(obs.x + 10, obs.y);
            ctx.lineTo(obs.x, obs.y - 15 + wingFlap);
            ctx.lineTo(obs.x + 20, obs.y);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(obs.x + 30, obs.y);
            ctx.lineTo(obs.x + 40, obs.y - 15 - wingFlap);
            ctx.lineTo(obs.x + 20, obs.y);
            ctx.fill();
            // Beak
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.moveTo(obs.x + 40, obs.y);
            ctx.lineTo(obs.x + 50, obs.y);
            ctx.lineTo(obs.x + 40, obs.y + 5);
            ctx.fill();
        }
    });
    
    // Draw running panda
    drawRunningPanda(80, data.pandaY, time, data.isJumping);
    
    // UI
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(`🏃 Score: ${miniGameScore}`, 20, 40);
    ctx.textAlign = 'right';
    ctx.fillText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 40);
    
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeText('🏃 PANDA RUN 🏃', canvas.width / 2, 45);
    ctx.fillText('🏃 PANDA RUN 🏃', canvas.width / 2, 45);
    
    // Jump instruction
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Press SPACE or ↑ to jump!', canvas.width / 2, canvas.height - 20);
    
    requestAnimationFrame(pandaRunnerLoop);
}

function drawRunningPanda(x, y, time, isJumping) {
    ctx.save();
    ctx.translate(x, y);
    
    const legMove = isJumping ? 0 : Math.sin(time * 20) * 0.3;
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, -25, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(15, -45, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(5, -60, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(25, -60, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(10, -48, 6, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, -48, 6, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(11, -48, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(21, -48, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Legs running
    ctx.fillStyle = 'black';
    ctx.save();
    ctx.translate(-10, 0);
    ctx.rotate(legMove);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(10, 0);
    ctx.rotate(-legMove);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
}

function handleRunnerKeys(key) {
    if (key === 'Escape') {
        endPandaRunner();
        return;
    }
    if ((key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') && !miniGameData.isJumping) {
        miniGameData.isJumping = true;
        miniGameData.pandaVelY = -15;
    }
}

function endPandaRunner() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('pandaRunnerHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #fbbf24;">🏃 Panda Run Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startPandaRunner;
}

// ==================== MINI GAME: BALLOON POP ====================
function startBalloonPop() {
    currentMode = MODE_MINIGAME_BALLOON;
    miniGameScore = 0;
    miniGameTimer = 30;
    partyStartTime = performance.now() / 1000;
    miniGameData = {
        balloons: [],
        lastSpawn: 0,
        popped: 0,
        missed: 0,
        selectedBalloon: 0,
        highScore: parseInt(localStorage.getItem('balloonPopHigh') || '0')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(balloonPopLoop);
    
    const timerInterval = setInterval(() => {
        if (currentMode !== MODE_MINIGAME_BALLOON) {
            clearInterval(timerInterval);
            return;
        }
        miniGameTimer--;
        if (miniGameTimer <= 0) {
            clearInterval(timerInterval);
            endBalloonPop();
        }
    }, 1000);
}

function balloonPopLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_BALLOON) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    // Spawn balloons
    if (time - data.lastSpawn > 0.6) {
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fff', '#a855f7'];
        data.balloons.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: canvas.height + 50,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 2 + 2,
            size: Math.random() * 20 + 30,
            wobble: Math.random() * Math.PI * 2,
            points: Math.floor(Math.random() * 3 + 1) * 10 // 10, 20, or 30 points
        });
        data.lastSpawn = time;
    }
    
    // Update balloons
    data.balloons.forEach(b => {
        b.y -= b.speed;
        b.wobble += 0.1;
        b.x += Math.sin(b.wobble) * 0.5;
    });
    
    // Remove escaped balloons
    for (let i = data.balloons.length - 1; i >= 0; i--) {
        if (data.balloons[i].y < -60) {
            data.balloons.splice(i, 1);
            data.missed++;
        }
    }
    
    // Adjust selected balloon index
    if (data.selectedBalloon >= data.balloons.length) {
        data.selectedBalloon = Math.max(0, data.balloons.length - 1);
    }
    
    // Draw
    // Party background
    const hue = (time * 20) % 360;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${hue}, 60%, 70%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 60%, 50%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw balloons
    data.balloons.forEach((b, index) => {
        const isSelected = index === data.selectedBalloon;
        
        // String
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.size);
        ctx.quadraticCurveTo(b.x + Math.sin(b.wobble) * 10, b.y + b.size + 30, b.x, b.y + b.size + 50);
        ctx.stroke();
        
        // Balloon
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.size * 0.8, b.size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, b.size * 0.3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Tie
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(b.x - 5, b.y + b.size);
        ctx.lineTo(b.x + 5, b.y + b.size);
        ctx.lineTo(b.x, b.y + b.size + 10);
        ctx.fill();
        
        // Points indicator
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${b.points}`, b.x, b.y + 5);
        
        // Selection indicator
        if (isSelected) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size + 10, 0, Math.PI * 2);
            ctx.stroke();
            
            // Arrow pointing at selected balloon
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('👆', b.x, b.y + b.size + 80);
        }
    });
    
    // UI
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`🎈 Score: ${miniGameScore}`, 20, 40);
    ctx.fillText(`⏱️ Time: ${miniGameTimer}s`, 20, 70);
    ctx.textAlign = 'right';
    ctx.fillText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 40);
    ctx.fillText(`💨 Missed: ${data.missed}`, canvas.width - 20, 70);
    
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeText('🎈 BALLOON POP 🎈', canvas.width / 2, 45);
    ctx.fillText('🎈 BALLOON POP 🎈', canvas.width / 2, 45);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('← → to select | SPACE to pop!', canvas.width / 2, canvas.height - 20);
    
    requestAnimationFrame(balloonPopLoop);
}

function handleBalloonKeys(key) {
    if (key === 'Escape') {
        endBalloonPop();
        return;
    }
    
    const data = miniGameData;
    
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        data.selectedBalloon = Math.max(0, data.selectedBalloon - 1);
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        data.selectedBalloon = Math.min(data.balloons.length - 1, data.selectedBalloon + 1);
    }
    if ((key === ' ' || key === 'Enter') && data.balloons.length > 0) {
        // Pop the selected balloon!
        const balloon = data.balloons[data.selectedBalloon];
        if (balloon) {
            miniGameScore += balloon.points;
            data.popped++;
            data.balloons.splice(data.selectedBalloon, 1);
        }
    }
}

function endBalloonPop() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('balloonPopHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #ef4444;">🎈 Balloon Pop Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>🎈 Popped: ${data.popped} | 💨 Missed: ${data.missed}</p>
        <p>🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startBalloonPop;
}

// ==================== MINI GAME: PANDA PONG ====================
function startPandaPong() {
    currentMode = MODE_MINIGAME_PONG;
    partyStartTime = performance.now() / 1000;
    miniGameData = {
        playerY: canvas.height / 2,
        cpuY: canvas.height / 2,
        ballX: canvas.width / 2,
        ballY: canvas.height / 2,
        ballVelX: 5,
        ballVelY: 3,
        playerScore: 0,
        cpuScore: 0,
        paddleHeight: 80,
        paddleWidth: 15,
        ballSize: 12,
        winScore: 5,
        gameOver: false
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(pandaPongLoop);
}

function pandaPongLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_PONG) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    if (data.gameOver) {
        requestAnimationFrame(pandaPongLoop);
        return;
    }
    
    // Player movement
    if (keysPressed.up) data.playerY -= 7;
    if (keysPressed.down) data.playerY += 7;
    data.playerY = Math.max(data.paddleHeight / 2, Math.min(canvas.height - data.paddleHeight / 2, data.playerY));
    
    // CPU AI
    const cpuSpeed = 4;
    if (data.ballY < data.cpuY - 20) {
        data.cpuY -= cpuSpeed;
    } else if (data.ballY > data.cpuY + 20) {
        data.cpuY += cpuSpeed;
    }
    data.cpuY = Math.max(data.paddleHeight / 2, Math.min(canvas.height - data.paddleHeight / 2, data.cpuY));
    
    // Ball movement
    data.ballX += data.ballVelX;
    data.ballY += data.ballVelY;
    
    // Ball collision with top/bottom
    if (data.ballY <= data.ballSize || data.ballY >= canvas.height - data.ballSize) {
        data.ballVelY *= -1;
    }
    
    // Ball collision with paddles
    // Player paddle (left)
    if (data.ballX <= 40 + data.paddleWidth && 
        data.ballY >= data.playerY - data.paddleHeight / 2 && 
        data.ballY <= data.playerY + data.paddleHeight / 2 &&
        data.ballVelX < 0) {
        data.ballVelX *= -1.1;
        data.ballVelY += (data.ballY - data.playerY) * 0.1;
    }
    
    // CPU paddle (right)
    if (data.ballX >= canvas.width - 40 - data.paddleWidth && 
        data.ballY >= data.cpuY - data.paddleHeight / 2 && 
        data.ballY <= data.cpuY + data.paddleHeight / 2 &&
        data.ballVelX > 0) {
        data.ballVelX *= -1.1;
        data.ballVelY += (data.ballY - data.cpuY) * 0.1;
    }
    
    // Limit ball speed
    const maxSpeed = 12;
    data.ballVelX = Math.max(-maxSpeed, Math.min(maxSpeed, data.ballVelX));
    data.ballVelY = Math.max(-maxSpeed, Math.min(maxSpeed, data.ballVelY));
    
    // Scoring
    if (data.ballX < 0) {
        data.cpuScore++;
        resetPongBall(data, 1);
    } else if (data.ballX > canvas.width) {
        data.playerScore++;
        resetPongBall(data, -1);
    }
    
    // Check win
    if (data.playerScore >= data.winScore || data.cpuScore >= data.winScore) {
        data.gameOver = true;
        endPandaPong();
        return;
    }
    
    // Draw
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Player paddle (panda themed)
    ctx.fillStyle = '#fff';
    ctx.fillRect(30, data.playerY - data.paddleHeight / 2, data.paddleWidth, data.paddleHeight);
    ctx.fillStyle = '#000';
    ctx.fillRect(30, data.playerY - data.paddleHeight / 2, data.paddleWidth, 15);
    ctx.fillRect(30, data.playerY + data.paddleHeight / 2 - 15, data.paddleWidth, 15);
    
    // CPU paddle
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(canvas.width - 30 - data.paddleWidth, data.cpuY - data.paddleHeight / 2, data.paddleWidth, data.paddleHeight);
    
    // Ball (panda face!)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(data.ballX, data.ballY, data.ballSize, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(data.ballX - 8, data.ballY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(data.ballX + 8, data.ballY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.beginPath();
    ctx.arc(data.ballX - 4, data.ballY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(data.ballX + 4, data.ballY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Scores
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'center';
    ctx.fillText(data.playerScore, canvas.width / 4, 80);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(data.cpuScore, canvas.width * 3 / 4, 80);
    
    // Labels
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('YOU', canvas.width / 4, 110);
    ctx.fillText('CPU', canvas.width * 3 / 4, 110);
    
    // Title
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('🏓 PANDA PONG 🏓', canvas.width / 2, 40);
    
    // Instructions
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(`First to ${data.winScore} wins! | ↑↓ to move`, canvas.width / 2, canvas.height - 20);
    
    requestAnimationFrame(pandaPongLoop);
}

function resetPongBall(data, direction) {
    data.ballX = canvas.width / 2;
    data.ballY = canvas.height / 2;
    data.ballVelX = 5 * direction;
    data.ballVelY = (Math.random() - 0.5) * 6;
}

function handlePongKeys(key) {
    if (key === 'Escape') {
        endPandaPong();
        return;
    }
    // Movement handled in game loop via keysPressed
}

function endPandaPong() {
    const data = miniGameData;
    const playerWon = data.playerScore >= data.winScore;
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #8b5cf6;">🏓 Panda Pong Complete!</h2>
        <p style="font-size: 2rem;">${playerWon ? '🎉 YOU WIN! 🎉' : '😢 CPU Wins'}</p>
        <p style="font-size: 1.5rem;">You ${data.playerScore} - ${data.cpuScore} CPU</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startPandaPong;
}

// ==================== MINI GAME: WHACK-A-JAGUAR ====================
function startWhackAJaguar() {
    currentMode = MODE_MINIGAME_WHACK;
    miniGameScore = 0;
    miniGameTimer = 30;
    partyStartTime = performance.now() / 1000;
    
    // Create 9 holes in a 3x3 grid
    const holes = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            holes.push({
                x: 180 + col * 180,
                y: 150 + row * 120,
                hasJaguar: false,
                jaguarTimer: 0,
                whacked: false,
                whackTimer: 0
            });
        }
    }
    
    miniGameData = {
        holes: holes,
        selectedHole: 4, // Center hole
        lastSpawn: 0,
        whacks: 0,
        misses: 0,
        highScore: parseInt(localStorage.getItem('whackJaguarHigh') || '0'),
        combo: 0,
        maxCombo: 0
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(whackAJaguarLoop);
    
    const timerInterval = setInterval(() => {
        if (currentMode !== MODE_MINIGAME_WHACK) {
            clearInterval(timerInterval);
            return;
        }
        miniGameTimer--;
        if (miniGameTimer <= 0) {
            clearInterval(timerInterval);
            endWhackAJaguar();
        }
    }, 1000);
}

function whackAJaguarLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_WHACK) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    // Spawn jaguars randomly
    if (time - data.lastSpawn > 0.8 - Math.min(miniGameScore / 200, 0.4)) {
        // Find empty holes
        const emptyHoles = data.holes.filter(h => !h.hasJaguar && !h.whacked);
        if (emptyHoles.length > 0) {
            const hole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
            hole.hasJaguar = true;
            hole.jaguarTimer = time;
            hole.popHeight = 0;
        }
        data.lastSpawn = time;
    }
    
    // Update jaguars
    data.holes.forEach(hole => {
        if (hole.hasJaguar) {
            // Pop up animation
            const timeSinceSpawn = time - hole.jaguarTimer;
            if (timeSinceSpawn < 0.2) {
                hole.popHeight = (timeSinceSpawn / 0.2) * 50;
            } else {
                hole.popHeight = 50;
            }
            
            // Jaguar disappears after a while
            if (timeSinceSpawn > 1.5) {
                hole.hasJaguar = false;
                hole.popHeight = 0;
                data.combo = 0; // Reset combo on miss
            }
        }
        
        // Whack animation
        if (hole.whacked) {
            if (time - hole.whackTimer > 0.3) {
                hole.whacked = false;
            }
        }
    });
    
    // Draw
    // Background - grassy field
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.3, '#90EE90');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw dirt mounds
    ctx.fillStyle = '#8B4513';
    data.holes.forEach(hole => {
        // Dirt mound
        ctx.beginPath();
        ctx.ellipse(hole.x, hole.y + 30, 60, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hole
        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.ellipse(hole.x, hole.y + 20, 45, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
    });
    
    // Draw jaguars and selection
    data.holes.forEach((hole, index) => {
        const isSelected = index === data.selectedHole;
        
        // Draw jaguar if present
        if (hole.hasJaguar && !hole.whacked) {
            drawWhackJaguar(hole.x, hole.y - hole.popHeight + 20, time);
        }
        
        // Whack effect
        if (hole.whacked) {
            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.fillText('💥', hole.x, hole.y - 30);
            ctx.fillText(`+${10 + data.combo * 5}`, hole.x, hole.y - 60);
        }
        
        // Selection indicator
        if (isSelected) {
            // Hammer cursor
            ctx.save();
            ctx.translate(hole.x + 30, hole.y - 20);
            ctx.rotate(-0.3 + Math.sin(time * 10) * 0.1);
            ctx.font = '40px sans-serif';
            ctx.fillText('🔨', -20, 0);
            ctx.restore();
            
            // Selection ring
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.ellipse(hole.x, hole.y + 20, 50, 25, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });
    
    // Draw grass tufts on top
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 20; i++) {
        const gx = (i * 47 + 30) % canvas.width;
        const gy = 100 + (i * 23) % 300;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - 5, gy - 15);
        ctx.lineTo(gx + 5, gy - 15);
        ctx.fill();
    }
    
    // UI
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.textAlign = 'left';
    ctx.strokeText(`🎯 Score: ${miniGameScore}`, 20, 40);
    ctx.fillText(`🎯 Score: ${miniGameScore}`, 20, 40);
    ctx.strokeText(`⏱️ ${miniGameTimer}s`, 20, 75);
    ctx.fillText(`⏱️ ${miniGameTimer}s`, 20, 75);
    
    ctx.textAlign = 'right';
    ctx.strokeText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 40);
    ctx.fillText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 40);
    ctx.strokeText(`🔥 Combo: ${data.combo}`, canvas.width - 20, 75);
    ctx.fillText(`🔥 Combo: ${data.combo}`, canvas.width - 20, 75);
    
    // Title
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeText('🔨 WHACK-A-JAGUAR 🐆', canvas.width / 2, 45);
    ctx.fillText('🔨 WHACK-A-JAGUAR 🐆', canvas.width / 2, 45);
    
    // Instructions
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeText('Arrow keys to move | SPACE to whack!', canvas.width / 2, canvas.height - 20);
    ctx.fillText('Arrow keys to move | SPACE to whack!', canvas.width / 2, canvas.height - 20);
    
    requestAnimationFrame(whackAJaguarLoop);
}

function drawWhackJaguar(x, y, time) {
    ctx.save();
    ctx.translate(x, y);
    
    // Body/head
    ctx.fillStyle = '#D4A017';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots
    ctx.fillStyle = '#8B4513';
    const spots = [[-15, -10], [10, -15], [-10, 10], [15, 5], [0, -5]];
    spots.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Ears
    ctx.fillStyle = '#D4A017';
    ctx.beginPath();
    ctx.ellipse(-20, -25, 10, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(20, -25, 10, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner ears
    ctx.fillStyle = '#FFC0CB';
    ctx.beginPath();
    ctx.ellipse(-20, -25, 5, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(20, -25, 5, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (angry!)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-10, -8, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, -8, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-10, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Angry eyebrows
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(-5, -15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -18);
    ctx.lineTo(5, -15);
    ctx.stroke();
    
    // Nose
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 5, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mean grin
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 10, 12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // Teeth
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-8, 15);
    ctx.lineTo(-5, 22);
    ctx.lineTo(-2, 15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 15);
    ctx.lineTo(5, 22);
    ctx.lineTo(8, 15);
    ctx.fill();
    
    ctx.restore();
}

function handleWhackKeys(key) {
    if (key === 'Escape') {
        endWhackAJaguar();
        return;
    }
    
    const data = miniGameData;
    const cols = 3;
    
    // Movement in 3x3 grid
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        if (data.selectedHole % cols > 0) data.selectedHole--;
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        if (data.selectedHole % cols < cols - 1) data.selectedHole++;
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (data.selectedHole >= cols) data.selectedHole -= cols;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
        if (data.selectedHole < 6) data.selectedHole += cols;
    }
    
    // Whack!
    if (key === ' ' || key === 'Enter') {
        const hole = data.holes[data.selectedHole];
        if (hole.hasJaguar && !hole.whacked) {
            // Hit!
            hole.hasJaguar = false;
            hole.whacked = true;
            hole.whackTimer = performance.now() / 1000;
            hole.popHeight = 0;
            data.whacks++;
            data.combo++;
            data.maxCombo = Math.max(data.maxCombo, data.combo);
            miniGameScore += 10 + data.combo * 5;
        } else {
            // Miss!
            data.misses++;
            data.combo = 0;
        }
    }
}

function endWhackAJaguar() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('whackJaguarHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #f97316;">🔨 Whack-a-Jaguar Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>🎯 Whacks: ${data.whacks} | 🔥 Max Combo: ${data.maxCombo}</p>
        <p>🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startWhackAJaguar;
}

// ==================== MINI GAME: PANDA STACK ====================
function startPandaStack() {
    currentMode = MODE_MINIGAME_STACK;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        stackedPandas: [{ x: canvas.width / 2, y: canvas.height - 60, width: 60, landed: true }],
        currentPanda: null,
        swingX: 0,
        swingDirection: 1,
        swingSpeed: 3,
        dropSpeed: 0,
        isDropping: false,
        gameOver: false,
        highScore: parseInt(localStorage.getItem('pandaStackHigh') || '0'),
        perfectStreak: 0
    };
    
    spawnStackPanda();
    
    overlay.classList.remove('visible');
    requestAnimationFrame(pandaStackLoop);
}

function spawnStackPanda() {
    const data = miniGameData;
    const topPanda = data.stackedPandas[data.stackedPandas.length - 1];
    
    data.currentPanda = {
        x: 0,
        y: topPanda.y - 55,
        width: Math.max(30, topPanda.width - 2), // Slightly smaller each time
        swingOffset: 0
    };
    data.swingX = 0;
    data.isDropping = false;
    data.dropSpeed = 0;
    
    // Speed up as stack grows
    data.swingSpeed = 3 + data.stackedPandas.length * 0.3;
}

function pandaStackLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_STACK) return;
    
    const time = timestamp / 1000 - partyStartTime;
    const data = miniGameData;
    
    if (!data.gameOver) {
        if (!data.isDropping && data.currentPanda) {
            // Swing the panda
            data.swingX += data.swingSpeed * data.swingDirection;
            if (data.swingX > 250 || data.swingX < -250) {
                data.swingDirection *= -1;
            }
            data.currentPanda.x = canvas.width / 2 + data.swingX;
        } else if (data.isDropping && data.currentPanda) {
            // Drop the panda
            data.dropSpeed += 0.5;
            data.currentPanda.y += data.dropSpeed;
            
            const topPanda = data.stackedPandas[data.stackedPandas.length - 1];
            
            // Check if landed
            if (data.currentPanda.y >= topPanda.y - 50) {
                data.currentPanda.y = topPanda.y - 50;
                
                // Check overlap
                const overlap = calculateOverlap(data.currentPanda, topPanda);
                
                if (overlap > 10) {
                    // Successful stack!
                    const newWidth = overlap;
                    const newX = Math.max(data.currentPanda.x, topPanda.x - topPanda.width/2 + newWidth/2);
                    
                    data.stackedPandas.push({
                        x: (data.currentPanda.x + topPanda.x) / 2,
                        y: data.currentPanda.y,
                        width: newWidth,
                        landed: true
                    });
                    
                    // Perfect bonus
                    if (overlap >= topPanda.width * 0.9) {
                        data.perfectStreak++;
                        miniGameScore += 50 + data.perfectStreak * 20;
                    } else {
                        data.perfectStreak = 0;
                        miniGameScore += Math.floor(overlap);
                    }
                    
                    spawnStackPanda();
                } else {
                    // Missed! Game over
                    data.gameOver = true;
                    setTimeout(() => endPandaStack(), 1000);
                }
            }
        }
    }
    
    // Draw
    // Sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(0.5, '#4a2c7a');
    gradient.addColorStop(1, '#ff6b8a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars
    for (let i = 0; i < 50; i++) {
        const starX = (i * 97) % canvas.width;
        const starY = (i * 53) % (canvas.height / 2);
        const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(starX, starY, 1 + twinkle, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ground
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    
    // Draw stacked pandas
    data.stackedPandas.forEach((panda, index) => {
        drawStackedPanda(panda.x, panda.y, panda.width, index, time);
    });
    
    // Draw current (swinging/dropping) panda
    if (data.currentPanda && !data.gameOver) {
        // Draw rope/line
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(data.currentPanda.x, 0);
        ctx.lineTo(data.currentPanda.x, data.currentPanda.y - 25);
        ctx.stroke();
        
        drawStackedPanda(data.currentPanda.x, data.currentPanda.y, data.currentPanda.width, data.stackedPandas.length, time);
    }
    
    // UI
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`🐼 Stack: ${data.stackedPandas.length}`, 20, 40);
    ctx.fillText(`⭐ Score: ${miniGameScore}`, 20, 75);
    
    ctx.textAlign = 'right';
    ctx.fillText(`🏆 Best: ${data.highScore}`, canvas.width - 20, 40);
    if (data.perfectStreak > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`🔥 Perfect x${data.perfectStreak}!`, canvas.width - 20, 75);
    }
    
    // Title
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeText('🐼 PANDA STACK 🐼', canvas.width / 2, 45);
    ctx.fillText('🐼 PANDA STACK 🐼', canvas.width / 2, 45);
    
    // Instructions
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Press SPACE to drop!', canvas.width / 2, canvas.height - 10);
    
    // Game over message
    if (data.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('CRASH! 💥', canvas.width / 2, canvas.height / 2);
    }
    
    requestAnimationFrame(pandaStackLoop);
}

function calculateOverlap(current, target) {
    const currentLeft = current.x - current.width / 2;
    const currentRight = current.x + current.width / 2;
    const targetLeft = target.x - target.width / 2;
    const targetRight = target.x + target.width / 2;
    
    const overlapLeft = Math.max(currentLeft, targetLeft);
    const overlapRight = Math.min(currentRight, targetRight);
    
    return Math.max(0, overlapRight - overlapLeft);
}

function drawStackedPanda(x, y, width, index, time) {
    const scale = width / 60; // Scale based on width
    
    ctx.save();
    ctx.translate(x, y);
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, 10 * scale, 25 * scale, 20 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -12 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-13 * scale, -26 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(13 * scale, -26 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(-7 * scale, -14 * scale, 6 * scale, 8 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7 * scale, -14 * scale, 6 * scale, 8 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (blinking occasionally)
    const blink = Math.sin(time * 2 + index) > 0.95;
    ctx.fillStyle = 'white';
    if (!blink) {
        ctx.beginPath();
        ctx.arc(-7 * scale, -14 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7 * scale, -14 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-7 * scale, -13 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7 * scale, -13 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Closed eyes
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10 * scale, -14 * scale);
        ctx.lineTo(-4 * scale, -14 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4 * scale, -14 * scale);
        ctx.lineTo(10 * scale, -14 * scale);
        ctx.stroke();
    }
    
    // Nose
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -3 * scale, 5 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Arms (hugging pose)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(-22 * scale, 8 * scale, 8 * scale, 12 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22 * scale, 8 * scale, 8 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Feet
    ctx.beginPath();
    ctx.ellipse(-10 * scale, 25 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10 * scale, 25 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function handleStackKeys(key) {
    if (key === 'Escape') {
        endPandaStack();
        return;
    }
    
    const data = miniGameData;
    
    if ((key === ' ' || key === 'Enter') && !data.isDropping && !data.gameOver && data.currentPanda) {
        data.isDropping = true;
    }
}

function endPandaStack() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('pandaStackHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #10b981;">🐼 Panda Stack Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>🐼 Pandas Stacked: ${data.stackedPandas.length}</p>
        <p>🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">PLAY AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startPandaStack;
}

// ==================== MINI GAME: CAKE MAKER ====================
function startCakeMaker() {
    currentMode = MODE_MINIGAME_CAKE;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        cakeLayers: 3,
        frostingColor: '#ff9ecf',
        decorations: [],
        selectedTool: 0,
        cursorX: canvas.width / 2,
        cursorY: canvas.height / 2,
        tools: [
            { name: 'Frosting', icon: '🎨', colors: ['#ff9ecf', '#a8e6cf', '#ffd93d', '#a8d8ea', '#ffaaa5'] },
            { name: 'Sprinkles', icon: '✨' },
            { name: 'Candles', icon: '🕯️' },
            { name: 'Strawberry', icon: '🍓' },
            { name: 'Cherry', icon: '🍒' },
            { name: 'Star', icon: '⭐' },
            { name: 'Heart', icon: '❤️' },
            { name: 'Flower', icon: '🌸' }
        ],
        colorIndex: 0,
        cakeDecorated: false
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(cakeMakerLoop);
}

function cakeMakerLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_CAKE) return;
    
    const time = timestamp / 1000 - partyStartTime;
    const data = miniGameData;
    
    // Move cursor with keys
    if (keysPressed.left) data.cursorX -= 5;
    if (keysPressed.right) data.cursorX += 5;
    if (keysPressed.up) data.cursorY -= 5;
    if (keysPressed.down) data.cursorY += 5;
    data.cursorX = Math.max(50, Math.min(canvas.width - 50, data.cursorX));
    data.cursorY = Math.max(100, Math.min(canvas.height - 100, data.cursorY));
    
    // Draw
    // Kitchen background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#fff5e6');
    gradient.addColorStop(1, '#ffe4c4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Checkered floor pattern
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 2; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#ddd' : '#fff';
            ctx.fillRect(i * 50, canvas.height - 80 + j * 40, 50, 40);
        }
    }
    
    // Table
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(100, canvas.height - 100, canvas.width - 200, 20);
    
    // Draw cake
    drawDecorativeCake(canvas.width / 2, canvas.height - 180, data);
    
    // Draw decorations
    data.decorations.forEach(dec => {
        ctx.font = `${dec.size || 24}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(dec.icon, dec.x, dec.y);
    });
    
    // Tool panel on left
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(10, 80, 80, 320);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 80, 80, 320);
    
    data.tools.forEach((tool, index) => {
        const toolY = 100 + index * 38;
        const isSelected = index === data.selectedTool;
        
        if (isSelected) {
            ctx.fillStyle = '#fce7f3';
            ctx.fillRect(15, toolY - 15, 70, 35);
        }
        
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tool.icon, 50, toolY + 8);
        
        if (isSelected) {
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.strokeRect(15, toolY - 15, 70, 35);
        }
    });
    
    // Color picker for frosting
    if (data.selectedTool === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(canvas.width - 90, 80, 80, 150);
        ctx.strokeStyle = '#ec4899';
        ctx.strokeRect(canvas.width - 90, 80, 80, 150);
        
        data.tools[0].colors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(canvas.width - 50, 105 + i * 28, 12, 0, Math.PI * 2);
            ctx.fill();
            if (i === data.colorIndex) {
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }
    
    // Cursor
    const tool = data.tools[data.selectedTool];
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tool.icon, data.cursorX, data.cursorY);
    
    // Title
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ec4899';
    ctx.textAlign = 'center';
    ctx.fillText('🎂 CAKE MAKER 🎂', canvas.width / 2, 45);
    
    // Instructions
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('↑↓ select tool | ←→ change color | SPACE to place | ENTER when done!', canvas.width / 2, canvas.height - 20);
    
    // Decorations count
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#ec4899';
    ctx.textAlign = 'right';
    ctx.fillText(`Decorations: ${data.decorations.length}`, canvas.width - 20, 60);
    
    requestAnimationFrame(cakeMakerLoop);
}

function drawDecorativeCake(x, y, data) {
    // Cake plate
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x, y + 90, 140, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Bottom layer
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(x - 100, y + 20, 200, 60);
    ctx.fillStyle = data.frostingColor;
    ctx.fillRect(x - 105, y + 15, 210, 15);
    
    // Middle layer
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(x - 75, y - 30, 150, 50);
    ctx.fillStyle = data.frostingColor;
    ctx.fillRect(x - 80, y - 35, 160, 12);
    
    // Top layer
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(x - 50, y - 70, 100, 40);
    ctx.fillStyle = data.frostingColor;
    ctx.fillRect(x - 55, y - 75, 110, 12);
    
    // Frosting drips
    for (let i = 0; i < 8; i++) {
        const dripX = x - 90 + i * 25;
        ctx.fillStyle = data.frostingColor;
        ctx.beginPath();
        ctx.ellipse(dripX, y + 20, 8, 15 + Math.sin(i) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleCakeKeys(key) {
    if (key === 'Escape') {
        endCakeMaker();
        return;
    }
    
    const data = miniGameData;
    
    // Tool selection
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (!keysPressed.up) { // Only on key press, not hold
            data.selectedTool = (data.selectedTool - 1 + data.tools.length) % data.tools.length;
        }
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
        if (!keysPressed.down) {
            data.selectedTool = (data.selectedTool + 1) % data.tools.length;
        }
    }
    
    // Color selection for frosting
    if (data.selectedTool === 0) {
        if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            data.colorIndex = (data.colorIndex - 1 + data.tools[0].colors.length) % data.tools[0].colors.length;
            data.frostingColor = data.tools[0].colors[data.colorIndex];
        }
        if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            data.colorIndex = (data.colorIndex + 1) % data.tools[0].colors.length;
            data.frostingColor = data.tools[0].colors[data.colorIndex];
        }
    }
    
    // Place decoration
    if (key === ' ') {
        const tool = data.tools[data.selectedTool];
        if (data.selectedTool === 1) {
            // Sprinkles - add multiple small ones
            for (let i = 0; i < 5; i++) {
                data.decorations.push({
                    x: data.cursorX + (Math.random() - 0.5) * 30,
                    y: data.cursorY + (Math.random() - 0.5) * 30,
                    icon: ['✨', '•', '★'][Math.floor(Math.random() * 3)],
                    size: 12 + Math.random() * 8
                });
            }
        } else if (data.selectedTool > 1) {
            data.decorations.push({
                x: data.cursorX,
                y: data.cursorY,
                icon: tool.icon,
                size: 28
            });
        }
    }
    
    // Finish cake
    if (key === 'Enter') {
        data.cakeDecorated = true;
        endCakeMaker();
    }
}

function endCakeMaker() {
    const data = miniGameData;
    
    currentMode = MODE_PARTY_HUB;
    
    const decorCount = data.decorations.length;
    let rating = decorCount < 5 ? '⭐' : (decorCount < 15 ? '⭐⭐' : '⭐⭐⭐');
    
    overlay.innerHTML = `
        <h2 style="color: #ec4899;">🎂 Cake Complete!</h2>
        <p style="font-size: 2rem;">${rating}</p>
        <p>🎨 Decorations added: ${decorCount}</p>
        <p>${decorCount >= 15 ? '🌟 Beautiful cake!' : decorCount >= 5 ? '✨ Nice cake!' : '🎂 Simple but sweet!'}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">MAKE ANOTHER (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startCakeMaker;
}

// ==================== MINI GAME: DANCE FLOOR ====================
function startDanceFloor() {
    currentMode = MODE_MINIGAME_DANCEFLOOR;
    miniGameScore = 0;
    miniGameTimer = 45;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        pandaX: canvas.width / 2,
        pandaY: canvas.height / 2,
        pandaDirection: 0, // 0=down, 1=left, 2=up, 3=right
        dancing: false,
        danceMove: 0,
        stars: [],
        lastStarSpawn: 0,
        collected: 0,
        otherDancers: [
            { x: 150, y: 200, color: '#ff6b6b', phase: 0 },
            { x: 650, y: 200, color: '#4ecdc4', phase: 1 },
            { x: 150, y: 350, color: '#ffd93d', phase: 2 },
            { x: 650, y: 350, color: '#95e1d3', phase: 3 }
        ],
        highScore: parseInt(localStorage.getItem('danceFloorHigh') || '0'),
        combo: 0,
        floorHue: 0
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(danceFloorLoop);
    
    const timerInterval = setInterval(() => {
        if (currentMode !== MODE_MINIGAME_DANCEFLOOR) {
            clearInterval(timerInterval);
            return;
        }
        miniGameTimer--;
        if (miniGameTimer <= 0) {
            clearInterval(timerInterval);
            endDanceFloor();
        }
    }, 1000);
}

function danceFloorLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_DANCEFLOOR) return;
    
    const time = timestamp / 1000 - partyStartTime;
    const data = miniGameData;
    
    // Move panda
    let moving = false;
    if (keysPressed.left) { data.pandaX -= 5; data.pandaDirection = 1; moving = true; }
    if (keysPressed.right) { data.pandaX += 5; data.pandaDirection = 3; moving = true; }
    if (keysPressed.up) { data.pandaY -= 5; data.pandaDirection = 2; moving = true; }
    if (keysPressed.down) { data.pandaY += 5; data.pandaDirection = 0; moving = true; }
    
    data.pandaX = Math.max(50, Math.min(canvas.width - 50, data.pandaX));
    data.pandaY = Math.max(100, Math.min(canvas.height - 80, data.pandaY));
    
    data.dancing = moving;
    if (moving) data.danceMove = time;
    
    // Spawn stars
    if (time - data.lastStarSpawn > 1) {
        data.stars.push({
            x: 100 + Math.random() * (canvas.width - 200),
            y: 120 + Math.random() * (canvas.height - 220),
            rotation: 0,
            collected: false
        });
        data.lastStarSpawn = time;
    }
    
    // Collect stars
    for (let i = data.stars.length - 1; i >= 0; i--) {
        const star = data.stars[i];
        const dx = data.pandaX - star.x;
        const dy = data.pandaY - star.y;
        if (Math.sqrt(dx*dx + dy*dy) < 40) {
            data.stars.splice(i, 1);
            data.collected++;
            data.combo++;
            miniGameScore += 10 * data.combo;
        }
        star.rotation += 0.1;
    }
    
    // Decay combo if not moving
    if (!moving && data.combo > 0) {
        data.combo = Math.max(0, data.combo - 0.02);
    }
    
    // Update floor color
    data.floorHue = (data.floorHue + 1) % 360;
    
    // Draw
    // Disco floor
    const tileSize = 60;
    for (let i = 0; i < Math.ceil(canvas.width / tileSize); i++) {
        for (let j = 0; j < Math.ceil(canvas.height / tileSize); j++) {
            const hue = (data.floorHue + i * 20 + j * 30 + Math.sin(time * 2 + i + j) * 30) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, ${30 + Math.sin(time * 3 + i * j) * 10}%)`;
            ctx.fillRect(i * tileSize, j * tileSize, tileSize - 2, tileSize - 2);
        }
    }
    
    // Disco ball reflection
    for (let i = 0; i < 10; i++) {
        const spotX = (Math.sin(time * 2 + i) * 0.5 + 0.5) * canvas.width;
        const spotY = (Math.cos(time * 1.5 + i * 0.7) * 0.5 + 0.5) * canvas.height;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 5 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 30 + Math.sin(time * 3 + i) * 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw stars
    data.stars.forEach(star => {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rotation);
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', 0, 10);
        ctx.restore();
    });
    
    // Draw other dancers
    data.otherDancers.forEach((dancer, i) => {
        drawDancingCharacter(dancer.x, dancer.y, dancer.color, time + dancer.phase);
    });
    
    // Draw player panda
    drawDancingPanda(data.pandaX, data.pandaY, time, data.dancing, data.pandaDirection);
    
    // UI panel
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, 70);
    
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`⭐ ${miniGameScore}`, 20, 35);
    ctx.fillText(`🔥 x${Math.floor(data.combo)}`, 20, 60);
    
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🕺 DANCE FLOOR 🕺', canvas.width / 2, 40);
    
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`⏱️ ${miniGameTimer}s`, canvas.width - 20, 35);
    ctx.fillText(`🏆 ${data.highScore}`, canvas.width - 20, 60);
    
    // Instructions
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Use arrow keys to dance and collect stars! Build combos by moving!', canvas.width / 2, canvas.height - 10);
    
    requestAnimationFrame(danceFloorLoop);
}

function drawDancingCharacter(x, y, color, time) {
    const bounce = Math.sin(time * 8) * 8;
    const sway = Math.sin(time * 4) * 5;
    
    ctx.save();
    ctx.translate(x + sway, y + bounce);
    
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 10, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-5, -17, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -17, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -16, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -16, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms waving
    const armAngle = Math.sin(time * 10) * 0.5;
    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(-18, 5);
    ctx.rotate(-1 + armAngle);
    ctx.beginPath();
    ctx.ellipse(0, -10, 6, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(18, 5);
    ctx.rotate(1 - armAngle);
    ctx.beginPath();
    ctx.ellipse(0, -10, 6, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
}

function drawDancingPanda(x, y, time, isDancing, direction) {
    const bounce = isDancing ? Math.sin(time * 10) * 10 : 0;
    const sway = isDancing ? Math.sin(time * 5) * 8 : 0;
    
    ctx.save();
    ctx.translate(x + sway, y + bounce);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, 10, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -18, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-15, -35, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -35, 9, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(-8, -20, 7, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -20, 7, 9, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (happy when dancing)
    if (isDancing) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-8, -19, 4, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(8, -19, 4, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
    } else {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-8, -20, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -20, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-8, -19, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -19, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Nose
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(0, -10, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -7, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // Arms (dancing animation)
    const armWave = isDancing ? Math.sin(time * 12) * 0.8 : 0;
    ctx.fillStyle = 'black';
    
    ctx.save();
    ctx.translate(-22, 5);
    ctx.rotate(-0.8 + armWave);
    ctx.beginPath();
    ctx.ellipse(0, -12, 7, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(22, 5);
    ctx.rotate(0.8 - armWave);
    ctx.beginPath();
    ctx.ellipse(0, -12, 7, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Legs
    ctx.beginPath();
    ctx.ellipse(-10, 32, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 32, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Sunglasses if dancing
    if (isDancing) {
        ctx.fillStyle = '#333';
        ctx.fillRect(-18, -24, 14, 8);
        ctx.fillRect(4, -24, 14, 8);
        ctx.fillRect(-4, -22, 8, 3);
    }
    
    ctx.restore();
}

function handleDanceFloorKeys(key) {
    if (key === 'Escape') {
        endDanceFloor();
        return;
    }
    // Movement handled in game loop via keysPressed
}

function endDanceFloor() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('danceFloorHigh', miniGameScore.toString());
        data.highScore = miniGameScore;
    }
    
    currentMode = MODE_PARTY_HUB;
    
    overlay.innerHTML = `
        <h2 style="color: #06b6d4;">🕺 Dance Floor Complete!</h2>
        <p style="font-size: 2rem;">Score: ${miniGameScore}</p>
        <p>⭐ Stars collected: ${data.collected}</p>
        <p>🏆 Best: ${data.highScore}</p>
        <div class="overlay-buttons">
            <button class="game-btn secondary" id="backBtn">BACK (ESC)</button>
            <button class="game-btn" id="retryMiniBtn">DANCE AGAIN (ENTER)</button>
        </div>
    `;
    overlay.classList.add('visible');
    overlay.style.background = '';
    overlay.style.boxShadow = '';
    
    document.getElementById('backBtn').onclick = startPartyHub;
    document.getElementById('retryMiniBtn').onclick = startDanceFloor;
}

// ==================== BUNDLE 2: PANDA SNAKE ====================
function startPandaSnake() {
    currentMode = MODE_MINIGAME_SNAKE;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    const gridSize = 20;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor((canvas.height - 80) / gridSize);
    
    miniGameData = {
        snake: [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 0, y: 0 },
        gridSize: gridSize,
        cols: cols,
        rows: rows,
        lastMove: 0,
        speed: 150 - (miniGameLevel - 1) * 30, // Faster at higher levels
        gameOver: false,
        highScore: parseInt(localStorage.getItem('snakeHigh') || '0')
    };
    
    spawnSnakeFood();
    overlay.classList.remove('visible');
    requestAnimationFrame(snakeLoop);
}

function spawnSnakeFood() {
    const data = miniGameData;
    let validPosition = false;
    while (!validPosition) {
        data.food.x = Math.floor(Math.random() * data.cols);
        data.food.y = Math.floor(Math.random() * data.rows);
        validPosition = !data.snake.some(seg => seg.x === data.food.x && seg.y === data.food.y);
    }
}

function snakeLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_SNAKE) return;
    
    const time = timestamp;
    const data = miniGameData;
    
    if (!data.gameOver && time - data.lastMove > data.speed) {
        data.lastMove = time;
        data.direction = { ...data.nextDirection };
        
        const head = { x: data.snake[0].x + data.direction.x, y: data.snake[0].y + data.direction.y };
        
        // Check wall collision
        if (head.x < 0 || head.x >= data.cols || head.y < 0 || head.y >= data.rows) {
            data.gameOver = true;
        }
        
        // Check self collision
        if (data.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            data.gameOver = true;
        }
        
        if (!data.gameOver) {
            data.snake.unshift(head);
            
            // Check food
            if (head.x === data.food.x && head.y === data.food.y) {
                miniGameScore += 10;
                spawnSnakeFood();
            } else {
                data.snake.pop();
            }
        }
    }
    
    // Draw
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= data.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * data.gridSize, 60);
        ctx.lineTo(i * data.gridSize, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j <= data.rows; j++) {
        ctx.beginPath();
        ctx.moveTo(0, 60 + j * data.gridSize);
        ctx.lineTo(canvas.width, 60 + j * data.gridSize);
        ctx.stroke();
    }
    
    // Food (bamboo)
    ctx.font = `${data.gridSize - 4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🎋', data.food.x * data.gridSize + data.gridSize/2, 60 + data.food.y * data.gridSize + data.gridSize - 2);
    
    // Snake
    data.snake.forEach((seg, i) => {
        if (i === 0) {
            // Head
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(seg.x * data.gridSize + data.gridSize/2, 60 + seg.y * data.gridSize + data.gridSize/2, data.gridSize/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(seg.x * data.gridSize + data.gridSize/2 - 4, 60 + seg.y * data.gridSize + data.gridSize/2 - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(seg.x * data.gridSize + data.gridSize/2 + 4, 60 + seg.y * data.gridSize + data.gridSize/2 - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = i % 2 === 0 ? '#fff' : '#333';
            ctx.fillRect(seg.x * data.gridSize + 2, 60 + seg.y * data.gridSize + 2, data.gridSize - 4, data.gridSize - 4);
        }
    });
    
    // UI
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, canvas.width, 55);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`🐍 Score: ${miniGameScore}`, 20, 35);
    ctx.textAlign = 'center';
    ctx.fillText('🐼 PANDA SNAKE', canvas.width / 2, 35);
    ctx.textAlign = 'right';
    ctx.fillText(`🏆 ${data.highScore}`, canvas.width - 20, 35);
    
    if (data.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    requestAnimationFrame(snakeLoop);
}

function handleSnakeKeys(key) {
    const data = miniGameData;
    
    if (data.gameOver) {
        if (key === 'Enter') {
            endPandaSnake();
        }
        return;
    }
    
    if (key === 'Escape') {
        endPandaSnake();
        return;
    }
    
    if ((key === 'ArrowUp' || key === 'w') && data.direction.y !== 1) {
        data.nextDirection = { x: 0, y: -1 };
    }
    if ((key === 'ArrowDown' || key === 's') && data.direction.y !== -1) {
        data.nextDirection = { x: 0, y: 1 };
    }
    if ((key === 'ArrowLeft' || key === 'a') && data.direction.x !== 1) {
        data.nextDirection = { x: -1, y: 0 };
    }
    if ((key === 'ArrowRight' || key === 'd') && data.direction.x !== -1) {
        data.nextDirection = { x: 1, y: 0 };
    }
}

function endPandaSnake() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('snakeHigh', miniGameScore.toString());
    }
    
    // Mark as completed if score > 50
    if (miniGameScore >= 50) {
        markGameCompleted('snake', miniGameLevel);
    }
    
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 2: BRICK BREAKER ====================
function startBrickBreaker() {
    currentMode = MODE_MINIGAME_BRICK;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    const bricks = [];
    const rows = 4 + miniGameLevel;
    const cols = 10;
    const brickWidth = 70;
    const brickHeight = 20;
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6'];
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            bricks.push({
                x: 50 + c * (brickWidth + 5),
                y: 80 + r * (brickHeight + 5),
                width: brickWidth,
                height: brickHeight,
                color: colors[r % colors.length],
                alive: true
            });
        }
    }
    
    miniGameData = {
        paddle: { x: canvas.width / 2 - 50, y: canvas.height - 40, width: 100, height: 15 },
        ball: { x: canvas.width / 2, y: canvas.height - 60, vx: 4, vy: -4, radius: 8 },
        bricks: bricks,
        lives: 3,
        started: false,
        highScore: parseInt(localStorage.getItem('brickHigh') || '0')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(brickLoop);
}

function brickLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_BRICK) return;
    
    const data = miniGameData;
    
    // Paddle movement
    if (keysPressed.left) data.paddle.x -= 8;
    if (keysPressed.right) data.paddle.x += 8;
    data.paddle.x = Math.max(0, Math.min(canvas.width - data.paddle.width, data.paddle.x));
    
    if (data.started) {
        // Ball movement
        data.ball.x += data.ball.vx;
        data.ball.y += data.ball.vy;
        
        // Wall collision
        if (data.ball.x <= data.ball.radius || data.ball.x >= canvas.width - data.ball.radius) {
            data.ball.vx *= -1;
        }
        if (data.ball.y <= data.ball.radius) {
            data.ball.vy *= -1;
        }
        
        // Paddle collision
        if (data.ball.y + data.ball.radius >= data.paddle.y &&
            data.ball.x >= data.paddle.x &&
            data.ball.x <= data.paddle.x + data.paddle.width) {
            data.ball.vy = -Math.abs(data.ball.vy);
            const hitPos = (data.ball.x - data.paddle.x) / data.paddle.width;
            data.ball.vx = (hitPos - 0.5) * 10;
        }
        
        // Brick collision
        data.bricks.forEach(brick => {
            if (brick.alive &&
                data.ball.x >= brick.x &&
                data.ball.x <= brick.x + brick.width &&
                data.ball.y >= brick.y &&
                data.ball.y <= brick.y + brick.height) {
                brick.alive = false;
                data.ball.vy *= -1;
                miniGameScore += 10;
            }
        });
        
        // Ball lost
        if (data.ball.y > canvas.height) {
            data.lives--;
            if (data.lives <= 0) {
                endBrickBreaker();
                return;
            }
            data.ball.x = data.paddle.x + data.paddle.width / 2;
            data.ball.y = data.paddle.y - 20;
            data.ball.vx = 4;
            data.ball.vy = -4;
            data.started = false;
        }
        
        // Win check
        if (data.bricks.every(b => !b.alive)) {
            endBrickBreaker(true);
            return;
        }
    } else {
        data.ball.x = data.paddle.x + data.paddle.width / 2;
        data.ball.y = data.paddle.y - 20;
    }
    
    // Draw
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bricks
    data.bricks.forEach(brick => {
        if (brick.alive) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
    
    // Paddle (panda themed)
    ctx.fillStyle = '#fff';
    ctx.fillRect(data.paddle.x, data.paddle.y, data.paddle.width, data.paddle.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(data.paddle.x, data.paddle.y, 15, data.paddle.height);
    ctx.fillRect(data.paddle.x + data.paddle.width - 15, data.paddle.y, 15, data.paddle.height);
    
    // Ball (panda face)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(data.ball.x, data.ball.y, data.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(data.ball.x - 3, data.ball.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(data.ball.x + 3, data.ball.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // UI
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${miniGameScore}`, 20, 30);
    ctx.fillText(`Lives: ${'❤️'.repeat(data.lives)}`, 20, 55);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('🧱 BRICK BREAKER', canvas.width / 2, 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText(`🏆 ${data.highScore}`, canvas.width - 20, 30);
    
    if (!data.started) {
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to launch!', canvas.width / 2, canvas.height - 80);
    }
    
    requestAnimationFrame(brickLoop);
}

function handleBrickKeys(key) {
    if (key === 'Escape') {
        endBrickBreaker();
        return;
    }
    if (key === ' ' && !miniGameData.started) {
        miniGameData.started = true;
    }
}

function endBrickBreaker(won = false) {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('brickHigh', miniGameScore.toString());
    }
    if (won) {
        markGameCompleted('brick', miniGameLevel);
    }
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 2: SPACE PANDA ====================
function startSpacePanda() {
    currentMode = MODE_MINIGAME_SPACE;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        ship: { x: canvas.width / 2, y: canvas.height - 80 },
        bullets: [],
        asteroids: [],
        stars: [],
        lastShot: 0,
        lastAsteroid: 0,
        lives: 3,
        level: miniGameLevel,
        highScore: parseInt(localStorage.getItem('spaceHigh') || '0')
    };
    
    // Create stars
    for (let i = 0; i < 100; i++) {
        miniGameData.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 2 + 1
        });
    }
    
    overlay.classList.remove('visible');
    requestAnimationFrame(spaceLoop);
}

function spaceLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_SPACE) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    // Ship movement
    if (keysPressed.left) data.ship.x -= 6;
    if (keysPressed.right) data.ship.x += 6;
    if (keysPressed.up) data.ship.y -= 4;
    if (keysPressed.down) data.ship.y += 4;
    data.ship.x = Math.max(30, Math.min(canvas.width - 30, data.ship.x));
    data.ship.y = Math.max(100, Math.min(canvas.height - 50, data.ship.y));
    
    // Spawn asteroids
    if (time - data.lastAsteroid > 1.5 - data.level * 0.3) {
        data.asteroids.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: -40,
            speed: 2 + data.level + Math.random() * 2,
            size: 20 + Math.random() * 20,
            rotation: 0
        });
        data.lastAsteroid = time;
    }
    
    // Update bullets
    data.bullets.forEach(b => b.y -= 10);
    data.bullets = data.bullets.filter(b => b.y > 0);
    
    // Update asteroids
    data.asteroids.forEach(a => {
        a.y += a.speed;
        a.rotation += 0.05;
    });
    
    // Bullet-asteroid collision
    for (let i = data.asteroids.length - 1; i >= 0; i--) {
        const a = data.asteroids[i];
        for (let j = data.bullets.length - 1; j >= 0; j--) {
            const b = data.bullets[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            if (Math.sqrt(dx*dx + dy*dy) < a.size) {
                data.asteroids.splice(i, 1);
                data.bullets.splice(j, 1);
                miniGameScore += 10;
                break;
            }
        }
    }
    
    // Ship-asteroid collision
    for (let i = data.asteroids.length - 1; i >= 0; i--) {
        const a = data.asteroids[i];
        const dx = a.x - data.ship.x;
        const dy = a.y - data.ship.y;
        if (Math.sqrt(dx*dx + dy*dy) < a.size + 20) {
            data.asteroids.splice(i, 1);
            data.lives--;
            if (data.lives <= 0) {
                endSpacePanda();
                return;
            }
        }
    }
    
    // Remove off-screen asteroids
    data.asteroids = data.asteroids.filter(a => a.y < canvas.height + 50);
    
    // Update stars
    data.stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
    
    // Draw
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars
    data.stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Asteroids
    data.asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(0, 0, a.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(-a.size/3, -a.size/3, a.size/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    
    // Bullets
    ctx.fillStyle = '#4ade80';
    data.bullets.forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 3, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Ship (panda in rocket)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(data.ship.x, data.ship.y - 30);
    ctx.lineTo(data.ship.x - 20, data.ship.y + 20);
    ctx.lineTo(data.ship.x + 20, data.ship.y + 20);
    ctx.closePath();
    ctx.fill();
    
    // Panda face in cockpit
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(data.ship.x, data.ship.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(data.ship.x - 4, data.ship.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(data.ship.x + 4, data.ship.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Flames
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(data.ship.x - 8, data.ship.y + 20);
    ctx.lineTo(data.ship.x, data.ship.y + 35 + Math.random() * 10);
    ctx.lineTo(data.ship.x + 8, data.ship.y + 20);
    ctx.fill();
    
    // UI
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${miniGameScore}`, 20, 30);
    ctx.fillText(`Lives: ${'🚀'.repeat(data.lives)}`, 20, 55);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('🚀 SPACE PANDA', canvas.width / 2, 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText(`🏆 ${data.highScore}`, canvas.width - 20, 30);
    
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE to shoot!', canvas.width / 2, canvas.height - 20);
    
    requestAnimationFrame(spaceLoop);
}

function handleSpaceKeys(key) {
    if (key === 'Escape') {
        endSpacePanda();
        return;
    }
    const data = miniGameData;
    const time = performance.now() / 1000;
    if (key === ' ' && time - data.lastShot > 0.2) {
        data.bullets.push({ x: data.ship.x, y: data.ship.y - 30 });
        data.lastShot = time;
    }
}

function endSpacePanda() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('spaceHigh', miniGameScore.toString());
    }
    if (miniGameScore >= 100) {
        markGameCompleted('space', miniGameLevel);
    }
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 2: SLIDE PUZZLE ====================
function startSlidePuzzle() {
    currentMode = MODE_MINIGAME_PUZZLE;
    partyStartTime = performance.now() / 1000;
    
    const size = 2 + miniGameLevel; // 3x3, 4x4, 5x5
    const tiles = [];
    for (let i = 0; i < size * size - 1; i++) {
        tiles.push(i + 1);
    }
    tiles.push(0); // Empty space
    
    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    miniGameData = {
        tiles: tiles,
        size: size,
        moves: 0,
        selected: size * size - 1,
        solved: false,
        bestMoves: parseInt(localStorage.getItem(`puzzleBest${size}`) || '999')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(puzzleLoop);
}

function puzzleLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_PUZZLE) return;
    
    const time = timestamp / 1000 - partyStartTime;
    const data = miniGameData;
    const tileSize = Math.min(80, (canvas.width - 100) / data.size);
    const startX = (canvas.width - data.size * tileSize) / 2;
    const startY = 120;
    
    // Check if solved
    let solved = true;
    for (let i = 0; i < data.tiles.length - 1; i++) {
        if (data.tiles[i] !== i + 1) {
            solved = false;
            break;
        }
    }
    if (solved && !data.solved) {
        data.solved = true;
        if (data.moves < data.bestMoves) {
            localStorage.setItem(`puzzleBest${data.size}`, data.moves.toString());
            data.bestMoves = data.moves;
        }
        markGameCompleted('puzzle', miniGameLevel);
    }
    
    // Draw
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4c1d95');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.textAlign = 'center';
    ctx.fillText('🧩 SLIDE PUZZLE', canvas.width / 2, 40);
    
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Moves: ${data.moves} | Best: ${data.bestMoves === 999 ? '-' : data.bestMoves}`, canvas.width / 2, 70);
    ctx.fillText(`${data.size}x${data.size} Grid`, canvas.width / 2, 95);
    
    // Draw tiles
    data.tiles.forEach((tile, index) => {
        const row = Math.floor(index / data.size);
        const col = index % data.size;
        const x = startX + col * tileSize;
        const y = startY + row * tileSize;
        
        if (tile !== 0) {
            // Tile background
            const isAdjacent = canMoveTile(index);
            ctx.fillStyle = isAdjacent ? '#8b5cf6' : '#6366f1';
            ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            
            // Tile border
            ctx.strokeStyle = '#c4b5fd';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            
            // Number
            ctx.font = `bold ${tileSize / 2}px sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.toString(), x + tileSize / 2, y + tileSize / 2);
        }
    });
    
    // Instructions
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#c4b5fd';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Click a tile or use arrow keys to slide!', canvas.width / 2, canvas.height - 60);
    ctx.fillText('Arrange numbers 1 to ' + (data.size * data.size - 1), canvas.width / 2, canvas.height - 35);
    
    if (data.solved) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('🎉 SOLVED! 🎉', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Completed in ${data.moves} moves!`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 70);
    }
    
    requestAnimationFrame(puzzleLoop);
}

function canMoveTile(index) {
    const data = miniGameData;
    const emptyIndex = data.tiles.indexOf(0);
    const row = Math.floor(index / data.size);
    const col = index % data.size;
    const emptyRow = Math.floor(emptyIndex / data.size);
    const emptyCol = emptyIndex % data.size;
    
    return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
           (Math.abs(col - emptyCol) === 1 && row === emptyRow);
}

function moveTile(index) {
    const data = miniGameData;
    if (data.solved) return;
    
    if (canMoveTile(index)) {
        const emptyIndex = data.tiles.indexOf(0);
        [data.tiles[index], data.tiles[emptyIndex]] = [data.tiles[emptyIndex], data.tiles[index]];
        data.moves++;
    }
}

function handlePuzzleKeys(key) {
    const data = miniGameData;
    
    if (data.solved && key === 'Enter') {
        endSlidePuzzle();
        return;
    }
    
    if (key === 'Escape') {
        endSlidePuzzle();
        return;
    }
    
    const emptyIndex = data.tiles.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / data.size);
    const emptyCol = emptyIndex % data.size;
    
    if (key === 'ArrowUp' && emptyRow < data.size - 1) {
        moveTile(emptyIndex + data.size);
    }
    if (key === 'ArrowDown' && emptyRow > 0) {
        moveTile(emptyIndex - data.size);
    }
    if (key === 'ArrowLeft' && emptyCol < data.size - 1) {
        moveTile(emptyIndex + 1);
    }
    if (key === 'ArrowRight' && emptyCol > 0) {
        moveTile(emptyIndex - 1);
    }
}

function endSlidePuzzle() {
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 3: FLAPPY PANDA ====================
function startFlappyPanda() {
    currentMode = MODE_MINIGAME_FLAPPY;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        pandaY: canvas.height / 2,
        velocity: 0,
        pipes: [],
        lastPipe: 0,
        gravity: 0.4 + miniGameLevel * 0.1,
        jumpForce: -8,
        pipeGap: 180 - miniGameLevel * 20,
        pipeSpeed: 3 + miniGameLevel,
        gameOver: false,
        started: false,
        highScore: parseInt(localStorage.getItem('flappyHigh') || '0')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(flappyLoop);
}

function flappyLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_FLAPPY) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    if (data.started && !data.gameOver) {
        // Physics
        data.velocity += data.gravity;
        data.pandaY += data.velocity;
        
        // Spawn pipes
        if (time - data.lastPipe > 2) {
            const gapY = 100 + Math.random() * (canvas.height - 250);
            data.pipes.push({
                x: canvas.width,
                gapY: gapY,
                scored: false
            });
            data.lastPipe = time;
        }
        
        // Move pipes
        data.pipes.forEach(p => p.x -= data.pipeSpeed);
        
        // Score and collision
        data.pipes.forEach(pipe => {
            // Score
            if (!pipe.scored && pipe.x + 50 < 100) {
                pipe.scored = true;
                miniGameScore++;
            }
            
            // Collision
            const pandaX = 100;
            const pandaRadius = 20;
            if (pipe.x < pandaX + pandaRadius && pipe.x + 50 > pandaX - pandaRadius) {
                if (data.pandaY - pandaRadius < pipe.gapY || data.pandaY + pandaRadius > pipe.gapY + data.pipeGap) {
                    data.gameOver = true;
                }
            }
        });
        
        // Ground/ceiling collision
        if (data.pandaY > canvas.height - 30 || data.pandaY < 30) {
            data.gameOver = true;
        }
        
        // Remove off-screen pipes
        data.pipes = data.pipes.filter(p => p.x > -60);
    }
    
    // Draw
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 5; i++) {
        const cx = ((i * 180 + time * 20) % (canvas.width + 100)) - 50;
        ctx.beginPath();
        ctx.arc(cx, 60 + i * 15, 25, 0, Math.PI * 2);
        ctx.arc(cx + 20, 55 + i * 15, 30, 0, Math.PI * 2);
        ctx.arc(cx + 45, 60 + i * 15, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Pipes
    ctx.fillStyle = '#22c55e';
    data.pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, 50, pipe.gapY);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, 60, 20);
        ctx.fillStyle = '#22c55e';
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + data.pipeGap, 50, canvas.height);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(pipe.x - 5, pipe.gapY + data.pipeGap, 60, 20);
        ctx.fillStyle = '#22c55e';
    });
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    // Panda
    const pandaX = 100;
    const rotation = Math.min(Math.max(data.velocity * 0.05, -0.5), 0.5);
    ctx.save();
    ctx.translate(pandaX, data.pandaY);
    ctx.rotate(rotation);
    
    // Body
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Face
    ctx.beginPath();
    ctx.arc(10, -5, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Ears
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, -18, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(18, -15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(5, -8, 5, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, -8, 5, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(5, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.ellipse(-15, 5, 15, 8, -0.3 + Math.sin(time * 20) * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // UI
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(miniGameScore.toString(), canvas.width / 2, 60);
    ctx.fillText(miniGameScore.toString(), canvas.width / 2, 60);
    
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#14b8a6';
    ctx.fillText('🐦 FLAPPY PANDA', canvas.width / 2, 30);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Best: ${data.highScore}`, canvas.width - 20, 30);
    
    if (!data.started) {
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Tap SPACE to start!', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    if (data.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Score: ${miniGameScore}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 60);
    }
    
    requestAnimationFrame(flappyLoop);
}

function handleFlappyKeys(key) {
    const data = miniGameData;
    
    if (data.gameOver && key === 'Enter') {
        endFlappyPanda();
        return;
    }
    if (key === 'Escape') {
        endFlappyPanda();
        return;
    }
    if (key === ' ' || key === 'ArrowUp') {
        if (!data.started) data.started = true;
        if (!data.gameOver) {
            data.velocity = data.jumpForce;
        }
    }
}

function endFlappyPanda() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('flappyHigh', miniGameScore.toString());
    }
    if (miniGameScore >= 10) {
        bundle3Progress.flappy.completed = true;
        bundle3Progress.flappy.bestLevel = Math.max(bundle3Progress.flappy.bestLevel, miniGameLevel);
    }
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 3: PANDA BLOCKS (TETRIS) ====================
function startPandaBlocks() {
    currentMode = MODE_MINIGAME_TETRIS;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    const cols = 10;
    const rows = 20;
    
    miniGameData = {
        grid: Array(rows).fill(null).map(() => Array(cols).fill(0)),
        cols: cols,
        rows: rows,
        currentPiece: null,
        pieceX: 0,
        pieceY: 0,
        lastDrop: 0,
        dropSpeed: 1000 - miniGameLevel * 200,
        gameOver: false,
        lines: 0,
        highScore: parseInt(localStorage.getItem('tetrisHigh') || '0')
    };
    
    spawnTetrisPiece();
    overlay.classList.remove('visible');
    requestAnimationFrame(tetrisLoop);
}

const TETRIS_PIECES = [
    { shape: [[1,1,1,1]], color: '#06b6d4' }, // I
    { shape: [[1,1],[1,1]], color: '#fbbf24' }, // O
    { shape: [[0,1,0],[1,1,1]], color: '#a855f7' }, // T
    { shape: [[1,0,0],[1,1,1]], color: '#f97316' }, // L
    { shape: [[0,0,1],[1,1,1]], color: '#3b82f6' }, // J
    { shape: [[0,1,1],[1,1,0]], color: '#22c55e' }, // S
    { shape: [[1,1,0],[0,1,1]], color: '#ef4444' }  // Z
];

function spawnTetrisPiece() {
    const data = miniGameData;
    const piece = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    data.currentPiece = { shape: piece.shape.map(row => [...row]), color: piece.color };
    data.pieceX = Math.floor((data.cols - data.currentPiece.shape[0].length) / 2);
    data.pieceY = 0;
    
    if (!canMove(0, 0)) {
        data.gameOver = true;
    }
}

function canMove(dx, dy, newShape = null) {
    const data = miniGameData;
    const shape = newShape || data.currentPiece.shape;
    const newX = data.pieceX + dx;
    const newY = data.pieceY + dy;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const gridX = newX + x;
                const gridY = newY + y;
                if (gridX < 0 || gridX >= data.cols || gridY >= data.rows) return false;
                if (gridY >= 0 && data.grid[gridY][gridX]) return false;
            }
        }
    }
    return true;
}

function rotatePiece() {
    const data = miniGameData;
    const shape = data.currentPiece.shape;
    const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    if (canMove(0, 0, rotated)) {
        data.currentPiece.shape = rotated;
    }
}

function lockPiece() {
    const data = miniGameData;
    for (let y = 0; y < data.currentPiece.shape.length; y++) {
        for (let x = 0; x < data.currentPiece.shape[y].length; x++) {
            if (data.currentPiece.shape[y][x]) {
                const gridY = data.pieceY + y;
                if (gridY >= 0) {
                    data.grid[gridY][data.pieceX + x] = data.currentPiece.color;
                }
            }
        }
    }
    clearLines();
    spawnTetrisPiece();
}

function clearLines() {
    const data = miniGameData;
    for (let y = data.rows - 1; y >= 0; y--) {
        if (data.grid[y].every(cell => cell !== 0)) {
            data.grid.splice(y, 1);
            data.grid.unshift(Array(data.cols).fill(0));
            data.lines++;
            miniGameScore += 100;
            y++;
        }
    }
}

function tetrisLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_TETRIS) return;
    
    const time = timestamp;
    const data = miniGameData;
    
    if (!data.gameOver) {
        // Auto drop
        if (time - data.lastDrop > data.dropSpeed) {
            if (canMove(0, 1)) {
                data.pieceY++;
            } else {
                lockPiece();
            }
            data.lastDrop = time;
        }
    }
    
    // Draw
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const blockSize = 22;
    const gridX = (canvas.width - data.cols * blockSize) / 2;
    const gridY = 60;
    
    // Grid background
    ctx.fillStyle = '#16213e';
    ctx.fillRect(gridX, gridY, data.cols * blockSize, data.rows * blockSize);
    
    // Grid lines
    ctx.strokeStyle = '#1a1a3e';
    ctx.lineWidth = 1;
    for (let x = 0; x <= data.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(gridX + x * blockSize, gridY);
        ctx.lineTo(gridX + x * blockSize, gridY + data.rows * blockSize);
        ctx.stroke();
    }
    for (let y = 0; y <= data.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(gridX, gridY + y * blockSize);
        ctx.lineTo(gridX + data.cols * blockSize, gridY + y * blockSize);
        ctx.stroke();
    }
    
    // Placed blocks
    for (let y = 0; y < data.rows; y++) {
        for (let x = 0; x < data.cols; x++) {
            if (data.grid[y][x]) {
                ctx.fillStyle = data.grid[y][x];
                ctx.fillRect(gridX + x * blockSize + 1, gridY + y * blockSize + 1, blockSize - 2, blockSize - 2);
            }
        }
    }
    
    // Current piece
    if (data.currentPiece && !data.gameOver) {
        ctx.fillStyle = data.currentPiece.color;
        for (let y = 0; y < data.currentPiece.shape.length; y++) {
            for (let x = 0; x < data.currentPiece.shape[y].length; x++) {
                if (data.currentPiece.shape[y][x]) {
                    ctx.fillRect(
                        gridX + (data.pieceX + x) * blockSize + 1,
                        gridY + (data.pieceY + y) * blockSize + 1,
                        blockSize - 2, blockSize - 2
                    );
                }
            }
        }
    }
    
    // UI
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.textAlign = 'center';
    ctx.fillText('🟦 PANDA BLOCKS', canvas.width / 2, 35);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${miniGameScore}`, 20, 100);
    ctx.fillText(`Lines: ${data.lines}`, 20, 125);
    ctx.fillText(`Best: ${data.highScore}`, 20, 150);
    
    ctx.textAlign = 'right';
    ctx.fillText('↑ Rotate', canvas.width - 20, 100);
    ctx.fillText('←→ Move', canvas.width - 20, 125);
    ctx.fillText('↓ Drop', canvas.width - 20, 150);
    
    if (data.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    requestAnimationFrame(tetrisLoop);
}

function handleTetrisKeys(key) {
    const data = miniGameData;
    
    if (data.gameOver && key === 'Enter') {
        endPandaBlocks();
        return;
    }
    if (key === 'Escape') {
        endPandaBlocks();
        return;
    }
    
    if (!data.gameOver) {
        if (key === 'ArrowLeft' && canMove(-1, 0)) data.pieceX--;
        if (key === 'ArrowRight' && canMove(1, 0)) data.pieceX++;
        if (key === 'ArrowDown' && canMove(0, 1)) data.pieceY++;
        if (key === 'ArrowUp') rotatePiece();
        if (key === ' ') {
            while (canMove(0, 1)) data.pieceY++;
            lockPiece();
        }
    }
}

function endPandaBlocks() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('tetrisHigh', miniGameScore.toString());
    }
    if (data.lines >= 5) {
        bundle3Progress.tetris.completed = true;
        bundle3Progress.tetris.bestLevel = Math.max(bundle3Progress.tetris.bestLevel, miniGameLevel);
    }
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 3: PANDA FISHING ====================
function startPandaFishing() {
    currentMode = MODE_MINIGAME_FISHING;
    miniGameScore = 0;
    miniGameTimer = 60;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        hookX: canvas.width / 2,
        hookY: 150,
        hookDown: false,
        hookSpeed: 5 + miniGameLevel,
        fish: [],
        caught: 0,
        lastSpawn: 0,
        highScore: parseInt(localStorage.getItem('fishingHigh') || '0')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(fishingLoop);
    
    const timer = setInterval(() => {
        if (currentMode !== MODE_MINIGAME_FISHING) { clearInterval(timer); return; }
        miniGameTimer--;
        if (miniGameTimer <= 0) { clearInterval(timer); endPandaFishing(); }
    }, 1000);
}

function fishingLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_FISHING) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    // Hook movement
    if (!data.hookDown) {
        if (keysPressed.left) data.hookX -= 5;
        if (keysPressed.right) data.hookX += 5;
        data.hookX = Math.max(50, Math.min(canvas.width - 50, data.hookX));
    } else {
        data.hookY += data.hookSpeed;
        if (data.hookY > canvas.height - 50) {
            data.hookDown = false;
            data.hookY = 150;
        }
    }
    
    // Spawn fish
    if (time - data.lastSpawn > 1.5) {
        const types = [
            { icon: '🐟', points: 10, speed: 2 },
            { icon: '🐠', points: 20, speed: 3 },
            { icon: '🦈', points: 50, speed: 4 },
            { icon: '🐙', points: 30, speed: 2 },
            { icon: '🦀', points: 15, speed: 1 }
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        data.fish.push({
            x: Math.random() > 0.5 ? -30 : canvas.width + 30,
            y: 200 + Math.random() * 200,
            ...type,
            direction: Math.random() > 0.5 ? 1 : -1
        });
        data.lastSpawn = time;
    }
    
    // Move fish
    data.fish.forEach(f => {
        f.x += f.speed * f.direction;
    });
    data.fish = data.fish.filter(f => f.x > -50 && f.x < canvas.width + 50);
    
    // Check catch
    if (data.hookDown) {
        for (let i = data.fish.length - 1; i >= 0; i--) {
            const f = data.fish[i];
            const dx = f.x - data.hookX;
            const dy = f.y - data.hookY;
            if (Math.sqrt(dx*dx + dy*dy) < 40) {
                miniGameScore += f.points;
                data.caught++;
                data.fish.splice(i, 1);
                data.hookDown = false;
                data.hookY = 150;
                break;
            }
        }
    }
    
    // Draw
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, 150);
    
    // Water
    const waterGradient = ctx.createLinearGradient(0, 150, 0, canvas.height);
    waterGradient.addColorStop(0, '#4fc3f7');
    waterGradient.addColorStop(1, '#0277bd');
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, 150, canvas.width, canvas.height - 150);
    
    // Waves
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
            const y = 155 + i * 30 + Math.sin(x * 0.02 + time * 2 + i) * 5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Fish
    data.fish.forEach(f => {
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(f.x, f.y);
        if (f.direction < 0) ctx.scale(-1, 1);
        ctx.fillText(f.icon, 0, 10);
        ctx.restore();
    });
    
    // Fishing line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(data.hookX, 0);
    ctx.lineTo(data.hookX, data.hookY);
    ctx.stroke();
    
    // Hook
    ctx.font = '24px sans-serif';
    ctx.fillText('🪝', data.hookX, data.hookY + 10);
    
    // Panda fisherman
    ctx.font = '40px sans-serif';
    ctx.fillText('🐼', data.hookX, 50);
    ctx.font = '20px sans-serif';
    ctx.fillText('🎣', data.hookX + 25, 60);
    
    // UI
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, 40);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`🐟 ${data.caught}`, 20, 28);
    ctx.fillText(`⭐ ${miniGameScore}`, 100, 28);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('🎣 PANDA FISHING', canvas.width / 2, 28);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText(`⏱️ ${miniGameTimer}s`, canvas.width - 20, 28);
    
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('←→ Move | SPACE to cast!', canvas.width / 2, canvas.height - 15);
    
    requestAnimationFrame(fishingLoop);
}

function handleFishingKeys(key) {
    if (key === 'Escape') {
        endPandaFishing();
        return;
    }
    if (key === ' ' && !miniGameData.hookDown) {
        miniGameData.hookDown = true;
    }
}

function endPandaFishing() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('fishingHigh', miniGameScore.toString());
    }
    if (data.caught >= 5) {
        bundle3Progress.fishing.completed = true;
        bundle3Progress.fishing.bestLevel = Math.max(bundle3Progress.fishing.bestLevel, miniGameLevel);
    }
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
}

// ==================== BUNDLE 3: PANDA RACER ====================
function startPandaRacer() {
    currentMode = MODE_MINIGAME_RACING;
    miniGameScore = 0;
    partyStartTime = performance.now() / 1000;
    
    miniGameData = {
        playerX: canvas.width / 2,
        playerY: canvas.height - 100,
        speed: 0,
        maxSpeed: 8 + miniGameLevel * 2,
        roadOffset: 0,
        obstacles: [],
        coins: [],
        lastObstacle: 0,
        lastCoin: 0,
        distance: 0,
        lives: 3,
        gameOver: false,
        highScore: parseInt(localStorage.getItem('racingHigh') || '0')
    };
    
    overlay.classList.remove('visible');
    requestAnimationFrame(racingLoop);
}

function racingLoop(timestamp) {
    if (currentMode !== MODE_MINIGAME_RACING) return;
    
    const time = timestamp / 1000;
    const data = miniGameData;
    
    if (!data.gameOver) {
        // Acceleration
        if (keysPressed.up) data.speed = Math.min(data.speed + 0.2, data.maxSpeed);
        else data.speed = Math.max(data.speed - 0.1, 2);
        
        // Steering
        if (keysPressed.left) data.playerX -= 5;
        if (keysPressed.right) data.playerX += 5;
        data.playerX = Math.max(200, Math.min(canvas.width - 200, data.playerX));
        
        data.roadOffset += data.speed;
        data.distance += data.speed;
        miniGameScore = Math.floor(data.distance / 10);
        
        // Spawn obstacles
        if (time - data.lastObstacle > 1.5) {
            data.obstacles.push({
                x: 200 + Math.random() * (canvas.width - 400),
                y: -50,
                type: Math.random() > 0.5 ? '🚗' : '🚙'
            });
            data.lastObstacle = time;
        }
        
        // Spawn coins
        if (time - data.lastCoin > 0.8) {
            data.coins.push({
                x: 200 + Math.random() * (canvas.width - 400),
                y: -30
            });
            data.lastCoin = time;
        }
        
        // Move obstacles
        data.obstacles.forEach(o => o.y += data.speed * 0.8);
        data.coins.forEach(c => c.y += data.speed);
        
        // Collision with obstacles
        for (let i = data.obstacles.length - 1; i >= 0; i--) {
            const o = data.obstacles[i];
            if (Math.abs(o.x - data.playerX) < 40 && Math.abs(o.y - data.playerY) < 40) {
                data.obstacles.splice(i, 1);
                data.lives--;
                if (data.lives <= 0) data.gameOver = true;
            }
        }
        
        // Collect coins
        for (let i = data.coins.length - 1; i >= 0; i--) {
            const c = data.coins[i];
            if (Math.abs(c.x - data.playerX) < 30 && Math.abs(c.y - data.playerY) < 30) {
                data.coins.splice(i, 1);
                miniGameScore += 50;
            }
        }
        
        // Remove off-screen
        data.obstacles = data.obstacles.filter(o => o.y < canvas.height + 50);
        data.coins = data.coins.filter(c => c.y < canvas.height + 50);
    }
    
    // Draw
    // Grass
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Road
    ctx.fillStyle = '#374151';
    ctx.fillRect(180, 0, canvas.width - 360, canvas.height);
    
    // Road lines
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.setLineDash([40, 30]);
    ctx.lineDashOffset = -data.roadOffset % 70;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Road edges
    ctx.fillStyle = '#fff';
    ctx.fillRect(180, 0, 10, canvas.height);
    ctx.fillRect(canvas.width - 190, 0, 10, canvas.height);
    
    // Coins
    ctx.font = '24px sans-serif';
    data.coins.forEach(c => {
        ctx.fillText('🪙', c.x, c.y);
    });
    
    // Obstacles
    ctx.font = '40px sans-serif';
    data.obstacles.forEach(o => {
        ctx.fillText(o.type, o.x, o.y);
    });
    
    // Player car (panda mobile!)
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏎️', data.playerX, data.playerY);
    ctx.font = '20px sans-serif';
    ctx.fillText('🐼', data.playerX, data.playerY - 15);
    
    // UI
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${miniGameScore}`, 20, 32);
    ctx.fillText(`Lives: ${'❤️'.repeat(data.lives)}`, 180, 32);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('🏎️ PANDA RACER', canvas.width / 2, 32);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Best: ${data.highScore}`, canvas.width - 20, 32);
    
    if (data.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('CRASH!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Final Score: ${miniGameScore}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 80);
    }
    
    requestAnimationFrame(racingLoop);
}

function handleRacingKeys(key) {
    const data = miniGameData;
    if (data.gameOver && key === 'Enter') {
        endPandaRacer();
        return;
    }
    if (key === 'Escape') {
        endPandaRacer();
        return;
    }
}

function endPandaRacer() {
    const data = miniGameData;
    if (miniGameScore > data.highScore) {
        localStorage.setItem('racingHigh', miniGameScore.toString());
    }
    if (miniGameScore >= 500) {
        bundle3Progress.racing.completed = true;
        bundle3Progress.racing.bestLevel = Math.max(bundle3Progress.racing.bestLevel, miniGameLevel);
    }
    currentMode = MODE_PARTY_HUB;
    startPartyHub();
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

// ==================== MOBILE TOUCH CONTROLS ====================
function setupMobileControls() {
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnAction = document.getElementById('btnAction');
    
    if (!btnUp) return; // Mobile controls not present
    
    // Helper to handle touch start
    function handleTouchStart(btn, direction) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            keysPressed[direction] = true;
            btn.classList.add('pressed');
            
            // Also handle map navigation
            if (currentMode === MODE_MAP && !overlay.classList.contains('visible')) {
                if (direction === 'left') {
                    selectedLevelIndex = (selectedLevelIndex - 1 + levels.length) % levels.length;
                } else if (direction === 'right') {
                    selectedLevelIndex = (selectedLevelIndex + 1) % levels.length;
                } else if (direction === 'up') {
                    selectedLevelIndex = findNearestLevel('up');
                } else if (direction === 'down') {
                    selectedLevelIndex = findNearestLevel('down');
                }
            }
        }, { passive: false });
        
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            keysPressed[direction] = false;
            btn.classList.remove('pressed');
        }, { passive: false });
        
        btn.addEventListener('touchcancel', function(e) {
            keysPressed[direction] = false;
            btn.classList.remove('pressed');
        }, { passive: false });
    }
    
    // Setup direction buttons
    handleTouchStart(btnUp, 'up');
    handleTouchStart(btnDown, 'down');
    handleTouchStart(btnLeft, 'left');
    handleTouchStart(btnRight, 'right');
    
    // Action button (Enter/Select)
    btnAction.addEventListener('touchstart', function(e) {
        e.preventDefault();
        btnAction.classList.add('pressed');
        
        if (overlay.classList.contains('visible')) {
            // Click the main button in overlay
            const btn = document.getElementById('startBtn') || 
                        document.getElementById('nextBtn') || 
                        document.getElementById('retryBtn');
            if (btn) btn.click();
        } else if (currentMode === MODE_MAP) {
            // Start selected level
            if (levels[selectedLevelIndex].unlocked) {
                startLevel(selectedLevelIndex);
            }
        } else if (currentMode === MODE_PLAYING) {
            // Could be used for special action, for now just show map
            showMap();
        }
    }, { passive: false });
    
    btnAction.addEventListener('touchend', function(e) {
        e.preventDefault();
        btnAction.classList.remove('pressed');
    }, { passive: false });
    
    // Prevent default touch behavior on the game area
    canvas.addEventListener('touchstart', function(e) {
        // Tap anywhere during party mode exits
        if (currentMode === MODE_PARTY) {
            exitParty();
            e.preventDefault();
            return;
        }
        
        if (currentMode === MODE_MAP && !overlay.classList.contains('visible')) {
            // Handle tap on map to select level
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const touch = e.touches[0];
            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;
            
            for (let i = 0; i < levels.length; i++) {
                const level = levels[i];
                const dx = x - level.x;
                const dy = y - level.y;
                if (Math.sqrt(dx*dx + dy*dy) < 50 && level.unlocked) {
                    startLevel(i);
                    e.preventDefault();
                    return;
                }
            }
        }
    }, { passive: false });
    
    // Prevent scrolling/zooming when touching game area
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('.game-container') || e.target.closest('.mobile-controls')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    console.log('Mobile touch controls initialized!');
}

// ==================== INIT ====================
function init() {
    loadProgress();
    setupKeyboardControls();
    setupMobileControls();
    
    // Start button
    document.getElementById('startBtn').onclick = showMap;
    
    // Click handler for map (mouse)
    canvas.onclick = function(e) {
        if (currentMode !== MODE_MAP || overlay.classList.contains('visible')) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const dx = x - level.x;
            const dy = y - level.y;
            if (Math.sqrt(dx*dx + dy*dy) < 50 && level.unlocked) {
                startLevel(i);
                return;
            }
        }
    };
    
    // Initial draw
    drawMap();
    
    console.log('Panda Escape initialized! Keyboard + Touch controls ready.');
}

// Start the game
init();

