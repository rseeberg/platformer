// Game Types and Interfaces

export interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    velocityX: number;
    velocityY: number;
    isGrounded: boolean;
    jumpPower: number;
    lives: number;
    respawnX: number;
    respawnY: number;
}

export interface InputState {
    left: boolean;
    right: boolean;
    jump: boolean;
}

export interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export interface Goal {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export interface Camera {
    x: number;
    y: number;
    targetY: number;
    smoothing: number;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

export interface GameStats {
    timer: number;
    score: number;
    coinsCollected: number;
    deaths: number;
    startTime: number;
    bestTime: number;
    currentLevel: number;
    levelsCompleted: number;
}

export interface Coin {
    x: number;
    y: number;
    width: number;
    height: number;
    collected: boolean;
    animation: number;
}

export interface MovingPlatform extends Platform {
    startX: number;
    endX: number;
    startY?: number;
    endY?: number;
    speed: number;
    direction: number;
    moveVertical?: boolean;
}

export interface LevelData {
    platforms: Platform[];
    movingPlatforms: MovingPlatform[];
    coins: Coin[];
    goal: Goal;
    playerStart: { x: number; y: number };
    levelHeight: number;
    name: string;
}

export enum GameState {
    PLAYING,
    PAUSED,
    GAME_OVER,
    WON,
    DEAD,
    LEVEL_COMPLETE
}

export interface GameConfig {
    gravity: number;
    friction: number;
    canvasWidth: number;
    canvasHeight: number;
}