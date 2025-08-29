// Main Game Module - Refactored Version

import { 
    Player, Platform, MovingPlatform, Coin, Goal, Camera, 
    GameStats, GameState, GameConfig 
} from './types.js';
import { InputHandler } from './input.js';
import { ParticleSystem } from './particles.js';
import { AudioSystem } from './audio.js';
import { LevelManager } from './levels.js';
import { Physics } from './physics.js';
import { Renderer } from './renderer.js';

export class Game {
    private canvas: HTMLCanvasElement;
    private player: Player;
    private platforms: Platform[] = [];
    private movingPlatforms: MovingPlatform[] = [];
    private coins: Coin[] = [];
    private goal: Goal;
    private camera: Camera;
    private gameStats: GameStats;
    private gameState: GameState = GameState.PLAYING;
    
    private currentLevel: number = 0;
    private levelHeight: number = 1200;
    private groundY: number;
    private hasWon: boolean = false;
    private deathTimer: number = 0;
    private levelCompleteTimer: number = 0;
    private gameCompleted: boolean = false;
    private animationId: number | null = null;
    
    // Modules
    private inputHandler: InputHandler;
    private particleSystem: ParticleSystem;
    private audioSystem: AudioSystem;
    private levelManager: LevelManager;
    private physics: Physics;
    private renderer: Renderer;
    
    // Configuration
    private config: GameConfig = {
        gravity: 0.5,
        friction: 0.8,
        canvasWidth: 800,
        canvasHeight: 600
    };

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Initialize modules
        this.inputHandler = new InputHandler();
        this.particleSystem = new ParticleSystem();
        this.audioSystem = new AudioSystem();
        this.levelManager = new LevelManager(this.canvas.width);
        this.physics = new Physics(this.config);
        this.renderer = new Renderer(this.canvas);

        // Initialize game objects
        this.groundY = this.levelHeight - 50;
        
        this.camera = {
            x: 0,
            y: 0,
            targetY: 0,
            smoothing: 0.1
        };
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.levelHeight - 150,
            width: 50,
            height: 50,
            speed: 5,
            color: '#5DADE2',
            velocityX: 0,
            velocityY: 0,
            isGrounded: false,
            jumpPower: -14,
            lives: 3,
            respawnX: this.canvas.width / 2 - 25,
            respawnY: this.levelHeight - 150
        };

        this.goal = {
            x: 365,
            y: 60,
            width: 70,
            height: 50,
            color: '#F39C12'
        };

        this.gameStats = {
            timer: 0,
            score: 0,
            coinsCollected: 0,
            deaths: 0,
            startTime: Date.now(),
            bestTime: parseFloat(localStorage.getItem('bestTime') || '999'),
            currentLevel: 0,
            levelsCompleted: 0
        };

        this.setupInputCallbacks();
        this.loadLevel(0);
    }

    private setupInputCallbacks(): void {
        this.inputHandler.onReset(() => this.reset());
        this.inputHandler.onPause(() => this.togglePause());
        this.inputHandler.onNextLevel(() => {
            if (this.hasWon && this.currentLevel + 1 < this.levelManager.getLevelCount()) {
                this.nextLevel();
            }
        });
    }

    private togglePause(): void {
        if (this.gameState === GameState.PAUSED) {
            this.gameState = GameState.PLAYING;
        } else if (this.gameState === GameState.PLAYING) {
            this.gameState = GameState.PAUSED;
        }
    }

    private loadLevel(levelIndex: number): void {
        if (levelIndex >= this.levelManager.getLevelCount()) {
            this.gameState = GameState.WON;
            this.hasWon = true;
            return;
        }
        
        const level = this.levelManager.getLevel(levelIndex);
        if (!level) return;
        
        this.currentLevel = levelIndex;
        this.gameStats.currentLevel = levelIndex;
        
        // Load level data
        this.platforms = [...level.platforms];
        this.movingPlatforms = [...level.movingPlatforms];
        this.coins = level.coins.map(coin => ({ ...coin }));
        this.goal = { ...level.goal };
        this.levelHeight = level.levelHeight;
        this.groundY = this.levelHeight - 50;
        
        // Reset player position
        this.player.x = level.playerStart.x;
        this.player.y = level.playerStart.y;
        this.player.respawnX = level.playerStart.x;
        this.player.respawnY = level.playerStart.y;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isGrounded = false;
        
        // Reset camera
        this.camera.y = 0;
        this.camera.targetY = 0;
        
        // Reset particles
        this.particleSystem.clear();
        
        // Reset game stats for this level
        this.gameStats.coinsCollected = 0;
        this.gameStats.timer = 0;
        this.gameStats.startTime = Date.now();
        this.gameState = GameState.PLAYING;
    }

    private nextLevel(): void {
        this.gameStats.levelsCompleted++;
        this.gameStats.score += 1000; // Level completion bonus
        
        if (this.currentLevel + 1 >= this.levelManager.getLevelCount()) {
            this.gameState = GameState.WON;
            this.hasWon = true;
        } else {
            this.hasWon = false;
            this.loadLevel(this.currentLevel + 1);
        }
    }

    private reset(): void {
        this.player.lives = 3;
        this.hasWon = false;
        this.renderer.setPlayerSquish(1);
        this.deathTimer = 0;
        this.levelCompleteTimer = 0;
        this.gameCompleted = false;
        this.gameStats = {
            timer: 0,
            score: 0,
            coinsCollected: 0,
            deaths: 0,
            startTime: Date.now(),
            bestTime: this.gameStats.bestTime,
            currentLevel: 0,
            levelsCompleted: 0
        };
        
        this.loadLevel(0);
    }

    private respawnPlayer(): void {
        this.player.x = this.player.respawnX;
        this.player.y = this.player.respawnY;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isGrounded = false;
        this.camera.y = 0;
        this.camera.targetY = 0;
        this.gameState = GameState.PLAYING;
    }

    private handleDeath(): void {
        this.gameStats.deaths++;
        this.player.lives--;
        this.audioSystem.playDeathSound();
        this.particleSystem.createDeathParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2
        );
        
        if (this.player.lives <= 0) {
            this.gameState = GameState.GAME_OVER;
        } else {
            this.gameState = GameState.DEAD;
            this.deathTimer = 120; // 2 seconds at 60fps
        }
    }

    private collectCoin(coin: Coin): void {
        coin.collected = true;
        this.gameStats.coinsCollected++;
        this.gameStats.score += 100;
        this.audioSystem.playCoinSound();
        this.particleSystem.createCoinParticles(
            coin.x + coin.width / 2,
            coin.y + coin.height / 2
        );
    }

    private updateCamera(): void {
        const screenMiddle = this.canvas.height / 2;
        const playerScreenY = this.player.y - this.camera.y;
        
        if (playerScreenY < screenMiddle - 100) {
            this.camera.targetY = this.player.y - (screenMiddle - 100);
        } else if (playerScreenY > screenMiddle + 100) {
            this.camera.targetY = this.player.y - (screenMiddle + 100);
        }
        
        this.camera.targetY = Math.max(0, Math.min(this.camera.targetY, this.levelHeight - this.canvas.height));
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
    }

    private update(): void {
        // Handle game states
        if (this.gameState === GameState.PAUSED) {
            return;
        }

        // Update timer (only if game not completed)
        if (!this.gameCompleted) {
            this.gameStats.timer = (Date.now() - this.gameStats.startTime) / 1000;
        }
        
        if (this.gameState === GameState.DEAD) {
            this.deathTimer--;
            if (this.deathTimer <= 0) {
                this.respawnPlayer();
            }
            return;
        }
        
        if (this.gameState === GameState.LEVEL_COMPLETE) {
            this.levelCompleteTimer--;
            if (this.levelCompleteTimer <= 0) {
                this.nextLevel();
            }
            return;
        }
        
        if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.WON) {
            return;
        }

        // Check goal collision
        if (this.physics.checkGoalCollision(this.player, this.goal)) {
            // Bonus points for time and lives
            const timeBonus = Math.max(0, 120 - Math.floor(this.gameStats.timer)) * 10;
            const lifeBonus = this.player.lives * 500;
            this.gameStats.score += timeBonus + lifeBonus;
            
            // Save best time for current level
            const levelBestKey = `level${this.currentLevel}BestTime`;
            const currentBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
            if (this.gameStats.timer < currentBest) {
                localStorage.setItem(levelBestKey, this.gameStats.timer.toString());
            }
            
            this.audioSystem.playVictorySound();
            
            // Check if this is the last level
            if (this.currentLevel + 1 >= this.levelManager.getLevelCount()) {
                this.gameState = GameState.WON;
                this.hasWon = true;
                this.gameCompleted = true;
                // Save overall best time
                if (this.gameStats.timer < this.gameStats.bestTime) {
                    this.gameStats.bestTime = this.gameStats.timer;
                    localStorage.setItem('bestTime', this.gameStats.bestTime.toString());
                }
            } else {
                // Move to next level after a short delay
                this.gameState = GameState.LEVEL_COMPLETE;
                this.hasWon = true;
                this.levelCompleteTimer = 120; // 2 seconds at 60fps
                this.audioSystem.playLevelCompleteSound();
            }
            return;
        }
        
        // Check for death
        if (this.physics.checkDeath(this.player, this.levelHeight)) {
            this.handleDeath();
            return;
        }

        // Get input state
        const inputs = this.inputHandler.getInputs();
        const wasGrounded = this.player.isGrounded;
        
        // Update player physics
        this.physics.updatePlayer(this.player, inputs.left, inputs.right, inputs.jump);
        this.physics.constrainPlayerToBounds(this.player, this.canvas.width);

        // Jump particles and sound
        if (inputs.jump && wasGrounded && !this.player.isGrounded) {
            this.particleSystem.createJumpParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height
            );
            this.renderer.setPlayerSquish(0.8);
            this.audioSystem.playJumpSound();
        }

        // Update moving platforms
        for (const platform of this.movingPlatforms) {
            this.physics.updateMovingPlatform(platform);
        }
        
        // Check coin collisions
        for (const coin of this.coins) {
            if (this.physics.checkCoinCollision(this.player, coin)) {
                this.collectCoin(coin);
            }
            coin.animation += 0.1;
        }

        // Check platform collisions
        let onPlatform = false;
        
        // Static platforms
        for (const platform of this.platforms) {
            if (this.physics.handlePlatformCollision(this.player, platform)) {
                onPlatform = true;
            }
        }
        
        // Moving platforms
        for (const platform of this.movingPlatforms) {
            if (this.physics.handlePlatformCollision(this.player, platform)) {
                onPlatform = true;
            }
        }
        
        // Ground collision
        if (!onPlatform) {
            if (this.physics.checkGroundCollision(this.player, this.groundY)) {
                onPlatform = true;
            } else {
                this.player.isGrounded = false;
            }
        }
        
        // Update systems
        this.updateCamera();
        this.particleSystem.update();
        this.renderer.updateAnimations();
    }

    private render(): void {
        // Render world
        this.renderer.render(
            this.player,
            this.platforms,
            this.movingPlatforms,
            this.coins,
            this.goal,
            this.camera,
            this.levelHeight,
            this.groundY,
            this.inputHandler.getInputs()
        );

        // Render particles
        const ctx = this.canvas.getContext('2d')!;
        ctx.save();
        ctx.translate(0, -this.camera.y);
        this.particleSystem.render(ctx, 0);
        ctx.restore();

        // Render UI
        this.renderer.renderUI(
            this.gameState,
            this.gameStats,
            this.player,
            this.coins,
            this.currentLevel,
            this.levelManager.getLevelName(this.currentLevel),
            this.levelCompleteTimer,
            this.hasWon
        );
    }

    private gameLoop = (): void => {
        this.update();
        this.render();
        this.animationId = requestAnimationFrame(this.gameLoop);
    }

    public start(): void {
        if (!this.animationId) {
            this.gameLoop();
        }
    }

    public stop(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
});