interface Player {
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

interface InputState {
    left: boolean;
    right: boolean;
    jump: boolean;
}

interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

interface Goal {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

interface Camera {
    x: number;
    y: number;
    targetY: number;
    smoothing: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

interface GameStats {
    timer: number;
    score: number;
    coinsCollected: number;
    deaths: number;
    startTime: number;
    bestTime: number;
    currentLevel: number;
    levelsCompleted: number;
}

interface LevelData {
    platforms: Platform[];
    movingPlatforms: MovingPlatform[];
    coins: Coin[];
    goal: Goal;
    playerStart: { x: number; y: number };
    levelHeight: number;
    name: string;
}

interface Coin {
    x: number;
    y: number;
    width: number;
    height: number;
    collected: boolean;
    animation: number;
}

interface MovingPlatform extends Platform {
    startX: number;
    endX: number;
    speed: number;
    direction: number;
}

enum GameState {
    PLAYING,
    PAUSED,
    GAME_OVER,
    WON,
    DEAD,
    LEVEL_COMPLETE
}

class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private platforms: Platform[];
    private goal: Goal;
    private inputs: InputState;
    private animationId: number | null = null;
    private gravity: number = 0.5;
    private friction: number = 0.8;
    private groundY: number;
    private hasWon: boolean = false;
    private camera: Camera;
    private levelHeight: number = 1200;
    private particles: Particle[] = [];
    private goalAnimation: number = 0;
    private playerSquish: number = 0;
    private gameStats: GameStats;
    private coins: Coin[] = [];
    private movingPlatforms: MovingPlatform[] = [];
    private gameState: GameState = GameState.PLAYING;
    private deathTimer: number = 0;
    private audioContext: AudioContext | null = null;
    private levels: LevelData[] = [];
    private currentLevel: number = 0;
    private levelCompleteTimer: number = 0;
    private gameCompleted: boolean = false;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = ctx;

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

        this.inputs = {
            left: false,
            right: false,
            jump: false
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

        this.initializeLevels();

        const platformColors = ['#52BE80', '#58D68D', '#45B39D', '#48C9B0', '#5DADE2'];
        
        this.platforms = [
            // Bottom section (ground level)
            { x: 100, y: 1100, width: 120, height: 20, color: platformColors[0] },
            { x: 600, y: 1100, width: 100, height: 20, color: platformColors[1] },
            { x: 350, y: 1030, width: 100, height: 20, color: platformColors[2] },
            
            // Lower middle section
            { x: 150, y: 950, width: 100, height: 20, color: platformColors[3] },
            { x: 550, y: 950, width: 100, height: 20, color: platformColors[4] },
            { x: 350, y: 880, width: 120, height: 20, color: platformColors[0] },
            
            // Middle section
            { x: 100, y: 800, width: 80, height: 20, color: platformColors[1] },
            { x: 620, y: 800, width: 80, height: 20, color: platformColors[2] },
            { x: 250, y: 730, width: 100, height: 20, color: platformColors[3] },
            { x: 450, y: 730, width: 100, height: 20, color: platformColors[4] },
            
            // Upper middle section  
            { x: 350, y: 650, width: 100, height: 20, color: platformColors[0] },
            { x: 150, y: 580, width: 80, height: 20, color: platformColors[1] },
            { x: 570, y: 580, width: 80, height: 20, color: platformColors[2] },
            
            // Higher section
            { x: 350, y: 500, width: 120, height: 20, color: platformColors[3] },
            { x: 100, y: 430, width: 100, height: 20, color: platformColors[4] },
            { x: 600, y: 430, width: 100, height: 20, color: platformColors[0] },
            
            // Top section
            { x: 250, y: 350, width: 80, height: 20, color: platformColors[1] },
            { x: 470, y: 350, width: 80, height: 20, color: platformColors[2] },
            { x: 350, y: 280, width: 100, height: 20, color: platformColors[3] },
            
            // Near goal
            { x: 200, y: 200, width: 80, height: 20, color: platformColors[4] },
            { x: 520, y: 200, width: 80, height: 20, color: platformColors[0] },
            { x: 350, y: 130, width: 120, height: 20, color: platformColors[1] }
        ];

        this.goal = {
            x: 365,
            y: 60,
            width: 70,
            height: 50,
            color: '#F39C12'
        };

        this.loadLevel(0);
        this.initializeAudio();
        this.setupInputHandlers();
    }

    private initializeAudio(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.warn('Audio not supported');
        }
    }

    private playSound(frequency: number, duration: number, type: OscillatorType = 'square'): void {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }


    private initializeLevels(): void {
        const platformColors = ['#52BE80', '#58D68D', '#45B39D', '#48C9B0', '#5DADE2'];
        
        // Level 1: Tutorial Level
        this.levels.push({
            name: 'Tutorial Valley',
            levelHeight: 800,
            playerStart: { x: 100, y: 650 },
            platforms: [
                { x: 50, y: 700, width: 150, height: 20, color: platformColors[0] },
                { x: 300, y: 650, width: 100, height: 20, color: platformColors[1] },
                { x: 500, y: 600, width: 100, height: 20, color: platformColors[2] },
                { x: 650, y: 550, width: 100, height: 20, color: platformColors[3] },
                { x: 400, y: 450, width: 150, height: 20, color: platformColors[4] },
                { x: 200, y: 350, width: 100, height: 20, color: platformColors[0] },
                { x: 550, y: 300, width: 100, height: 20, color: platformColors[1] },
                { x: 350, y: 200, width: 120, height: 20, color: platformColors[2] }
            ],
            movingPlatforms: [],
            coins: [
                { x: 320, y: 620, width: 20, height: 20, collected: false, animation: 0 },
                { x: 520, y: 570, width: 20, height: 20, collected: false, animation: 0 },
                { x: 420, y: 420, width: 20, height: 20, collected: false, animation: 0 },
                { x: 220, y: 320, width: 20, height: 20, collected: false, animation: 0 },
                { x: 570, y: 270, width: 20, height: 20, collected: false, animation: 0 }
            ],
            goal: { x: 375, y: 150, width: 70, height: 50, color: '#F39C12' }
        });
        
        // Level 2: The Original Challenge
        this.levels.push({
            name: 'Mountain Climb',
            levelHeight: 1200,
            playerStart: { x: this.canvas.width / 2 - 25, y: 1050 },
            platforms: [
                // Bottom section
                { x: 100, y: 1100, width: 120, height: 20, color: platformColors[0] },
                { x: 600, y: 1100, width: 100, height: 20, color: platformColors[1] },
                { x: 350, y: 1030, width: 100, height: 20, color: platformColors[2] },
                
                // Lower middle section
                { x: 150, y: 950, width: 100, height: 20, color: platformColors[3] },
                { x: 550, y: 950, width: 100, height: 20, color: platformColors[4] },
                { x: 350, y: 880, width: 120, height: 20, color: platformColors[0] },
                
                // Middle section
                { x: 100, y: 800, width: 80, height: 20, color: platformColors[1] },
                { x: 620, y: 800, width: 80, height: 20, color: platformColors[2] },
                { x: 250, y: 730, width: 100, height: 20, color: platformColors[3] },
                { x: 450, y: 730, width: 100, height: 20, color: platformColors[4] },
                
                // Upper middle section
                { x: 350, y: 650, width: 100, height: 20, color: platformColors[0] },
                { x: 150, y: 580, width: 80, height: 20, color: platformColors[1] },
                { x: 570, y: 580, width: 80, height: 20, color: platformColors[2] },
                
                // Higher section
                { x: 350, y: 500, width: 120, height: 20, color: platformColors[3] },
                { x: 100, y: 430, width: 100, height: 20, color: platformColors[4] },
                { x: 600, y: 430, width: 100, height: 20, color: platformColors[0] },
                
                // Top section
                { x: 250, y: 350, width: 80, height: 20, color: platformColors[1] },
                { x: 470, y: 350, width: 80, height: 20, color: platformColors[2] },
                { x: 350, y: 280, width: 100, height: 20, color: platformColors[3] },
                
                // Near goal
                { x: 200, y: 200, width: 80, height: 20, color: platformColors[4] },
                { x: 520, y: 200, width: 80, height: 20, color: platformColors[0] },
                { x: 350, y: 130, width: 120, height: 20, color: platformColors[1] }
            ],
            movingPlatforms: [
                {
                    x: 200, y: 850, width: 100, height: 20, color: '#E74C3C',
                    startX: 200, endX: 500, speed: 1, direction: 1
                },
                {
                    x: 100, y: 650, width: 80, height: 20, color: '#E74C3C',
                    startX: 100, endX: 600, speed: 0.8, direction: 1
                },
                {
                    x: 300, y: 450, width: 120, height: 20, color: '#E74C3C',
                    startX: 150, endX: 550, speed: 1.2, direction: 1
                }
            ],
            coins: [
                { x: 125, y: 1070, width: 20, height: 20, collected: false, animation: 0 },
                { x: 625, y: 1070, width: 20, height: 20, collected: false, animation: 0 },
                { x: 375, y: 1000, width: 20, height: 20, collected: false, animation: 0 },
                { x: 175, y: 920, width: 20, height: 20, collected: false, animation: 0 },
                { x: 575, y: 920, width: 20, height: 20, collected: false, animation: 0 },
                { x: 375, y: 850, width: 20, height: 20, collected: false, animation: 0 },
                { x: 125, y: 770, width: 20, height: 20, collected: false, animation: 0 },
                { x: 645, y: 770, width: 20, height: 20, collected: false, animation: 0 },
                { x: 275, y: 700, width: 20, height: 20, collected: false, animation: 0 },
                { x: 475, y: 700, width: 20, height: 20, collected: false, animation: 0 },
                { x: 375, y: 620, width: 20, height: 20, collected: false, animation: 0 },
                { x: 175, y: 550, width: 20, height: 20, collected: false, animation: 0 },
                { x: 595, y: 550, width: 20, height: 20, collected: false, animation: 0 },
                { x: 375, y: 470, width: 20, height: 20, collected: false, animation: 0 },
                { x: 125, y: 400, width: 20, height: 20, collected: false, animation: 0 },
                { x: 625, y: 400, width: 20, height: 20, collected: false, animation: 0 },
                { x: 275, y: 320, width: 20, height: 20, collected: false, animation: 0 },
                { x: 495, y: 320, width: 20, height: 20, collected: false, animation: 0 },
                { x: 225, y: 170, width: 20, height: 20, collected: false, animation: 0 },
                { x: 545, y: 170, width: 20, height: 20, collected: false, animation: 0 }
            ],
            goal: { x: 365, y: 60, width: 70, height: 50, color: '#F39C12' }
        });
        
        // Level 3: Advanced Challenge
        this.levels.push({
            name: 'Sky Fortress',
            levelHeight: 1000,
            playerStart: { x: 400, y: 850 },
            platforms: [
                { x: 350, y: 900, width: 100, height: 20, color: platformColors[0] },
                { x: 100, y: 800, width: 80, height: 20, color: platformColors[1] },
                { x: 620, y: 800, width: 80, height: 20, color: platformColors[2] },
                { x: 200, y: 650, width: 60, height: 20, color: platformColors[3] },
                { x: 540, y: 650, width: 60, height: 20, color: platformColors[4] },
                { x: 350, y: 500, width: 100, height: 20, color: platformColors[0] },
                { x: 100, y: 400, width: 80, height: 20, color: platformColors[1] },
                { x: 620, y: 400, width: 80, height: 20, color: platformColors[2] },
                { x: 350, y: 250, width: 120, height: 20, color: platformColors[3] }
            ],
            movingPlatforms: [
                {
                    x: 300, y: 700, width: 80, height: 20, color: '#E74C3C',
                    startX: 280, endX: 440, speed: 1.5, direction: 1
                },
                {
                    x: 150, y: 550, width: 100, height: 20, color: '#E74C3C',
                    startX: 150, endX: 550, speed: 2, direction: 1
                },
                {
                    x: 200, y: 300, width: 80, height: 20, color: '#E74C3C',
                    startX: 150, endX: 470, speed: 1.8, direction: 1
                }
            ],
            coins: [
                { x: 120, y: 770, width: 20, height: 20, collected: false, animation: 0 },
                { x: 640, y: 770, width: 20, height: 20, collected: false, animation: 0 },
                { x: 220, y: 620, width: 20, height: 20, collected: false, animation: 0 },
                { x: 560, y: 620, width: 20, height: 20, collected: false, animation: 0 },
                { x: 370, y: 470, width: 20, height: 20, collected: false, animation: 0 },
                { x: 120, y: 370, width: 20, height: 20, collected: false, animation: 0 },
                { x: 640, y: 370, width: 20, height: 20, collected: false, animation: 0 },
                { x: 390, y: 220, width: 20, height: 20, collected: false, animation: 0 }
            ],
            goal: { x: 375, y: 180, width: 70, height: 50, color: '#F39C12' }
        });
    }
    
    private loadLevel(levelIndex: number): void {
        if (levelIndex >= this.levels.length) {
            // All levels completed
            this.gameState = GameState.WON;
            this.hasWon = true;
            return;
        }
        
        const level = this.levels[levelIndex];
        this.currentLevel = levelIndex;
        this.gameStats.currentLevel = levelIndex;
        
        // Load level data
        this.platforms = [...level.platforms];
        this.movingPlatforms = [...level.movingPlatforms];
        this.coins = level.coins.map(coin => ({ ...coin, collected: false, animation: 0 }));
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
        this.particles = [];
        
        // Reset game stats for this level
        this.gameStats.coinsCollected = 0;
        this.gameStats.timer = 0;
        this.gameStats.startTime = Date.now();
        this.gameState = GameState.PLAYING;
    }
    
    private nextLevel(): void {
        this.gameStats.levelsCompleted++;
        this.gameStats.score += 1000; // Level completion bonus
        
        if (this.currentLevel + 1 >= this.levels.length) {
            // All levels completed!
            this.gameState = GameState.WON;
            this.hasWon = true;
        } else {
            this.hasWon = false; // Reset for next level
            this.loadLevel(this.currentLevel + 1);
        }
    }

    private setupInputHandlers(): void {
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.inputs.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.inputs.right = true;
                    e.preventDefault();
                    break;
                case ' ':
                case 'ArrowUp':
                    this.inputs.jump = true;
                    e.preventDefault();
                    break;
                case 'r':
                case 'R':
                    this.reset();
                    e.preventDefault();
                    break;
                case 'n':
                case 'N':
                    if (this.hasWon && this.currentLevel + 1 < this.levels.length) {
                        this.nextLevel();
                    }
                    e.preventDefault();
                    break;
                case 'Escape':
                    this.gameState = this.gameState === GameState.PAUSED ? GameState.PLAYING : GameState.PAUSED;
                    e.preventDefault();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.inputs.left = false;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.inputs.right = false;
                    e.preventDefault();
                    break;
                case ' ':
                case 'ArrowUp':
                    this.inputs.jump = false;
                    e.preventDefault();
                    break;
            }
        });
    }

    private checkPlatformCollision(platform: Platform | MovingPlatform): boolean {
        return this.player.x < platform.x + platform.width &&
               this.player.x + this.player.width > platform.x &&
               this.player.y < platform.y + platform.height &&
               this.player.y + this.player.height > platform.y;
    }

    private checkCoinCollision(coin: Coin): boolean {
        if (coin.collected) return false;
        return this.player.x < coin.x + coin.width &&
               this.player.x + this.player.width > coin.x &&
               this.player.y < coin.y + coin.height &&
               this.player.y + this.player.height > coin.y;
    }

    private collectCoin(coin: Coin): void {
        coin.collected = true;
        this.gameStats.coinsCollected++;
        this.gameStats.score += 100;
        this.playSound(800, 0.1);
        
        // Create coin collection particles
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: coin.x + coin.width / 2,
                y: coin.y + coin.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: '#F1C40F',
                size: Math.random() * 3 + 2
            });
        }
    }

    private checkDeath(): boolean {
        return this.player.y > this.levelHeight + 100;
    }

    private handleDeath(): void {
        this.gameStats.deaths++;
        this.player.lives--;
        this.playSound(200, 0.3);
        
        if (this.player.lives <= 0) {
            this.gameState = GameState.GAME_OVER;
        } else {
            this.gameState = GameState.DEAD;
            this.deathTimer = 120; // 2 seconds at 60fps
        }
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

    private reset(): void {
        this.player.lives = 3;
        this.hasWon = false;
        this.goalAnimation = 0;
        this.playerSquish = 0;
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
        
        // Reload first level
        this.loadLevel(0);
    }

    private createJumpParticles(): void {
        if (!this.player.isGrounded) return;
        
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -2,
                life: 1,
                color: '#AED6F1',
                size: Math.random() * 4 + 2
            });
        }
    }

    private updateParticles(): void {
        this.particles = this.particles.filter(p => p.life > 0);
        
        for (const particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.vx *= 0.98;
            particle.life -= 0.02;
            particle.size *= 0.98;
        }
    }

    private checkGoalCollision(): boolean {
        return this.player.x < this.goal.x + this.goal.width &&
               this.player.x + this.player.width > this.goal.x &&
               this.player.y < this.goal.y + this.goal.height &&
               this.player.y + this.player.height > this.goal.y;
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

        if (this.checkGoalCollision()) {
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
            
            this.playSound(400, 0.5);
            
            // Check if this is the last level
            if (this.currentLevel + 1 >= this.levels.length) {
                this.gameState = GameState.WON;
                this.hasWon = true;
                this.gameCompleted = true; // Stop the timer
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
            }
            return;
        }
        
        // Check for death
        if (this.checkDeath()) {
            this.handleDeath();
            return;
        }
        
        if (this.inputs.left) {
            this.player.velocityX = -this.player.speed;
        } else if (this.inputs.right) {
            this.player.velocityX = this.player.speed;
        } else {
            this.player.velocityX *= this.friction;
        }

        if (this.inputs.jump && this.player.isGrounded) {
            this.player.velocityY = this.player.jumpPower;
            this.player.isGrounded = false;
            this.createJumpParticles();
            this.playerSquish = 0.8;
            this.playSound(300, 0.1);
        }

        this.player.velocityY += this.gravity;

        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;

        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.velocityX = 0;
        }
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
            this.player.velocityX = 0;
        }

        // Update moving platforms
        for (const platform of this.movingPlatforms) {
            platform.x += platform.speed * platform.direction;
            
            if (platform.x <= platform.startX) {
                platform.x = platform.startX;
                platform.direction = 1;
            } else if (platform.x >= platform.endX) {
                platform.x = platform.endX;
                platform.direction = -1;
            }
        }
        
        // Check coin collisions
        for (const coin of this.coins) {
            if (this.checkCoinCollision(coin)) {
                this.collectCoin(coin);
            }
            coin.animation += 0.1;
        }

        let onPlatform = false;
        
        // Check static platform collisions
        for (const platform of this.platforms) {
            if (this.checkPlatformCollision(platform)) {
                const playerBottom = this.player.y + this.player.height;
                const playerTop = this.player.y;
                const playerPrevBottom = playerBottom - this.player.velocityY;
                
                if (playerPrevBottom <= platform.y && this.player.velocityY >= 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isGrounded = true;
                    onPlatform = true;
                }
                else if (playerTop < platform.y + platform.height && 
                         this.player.y > platform.y && 
                         this.player.velocityY < 0) {
                    this.player.y = platform.y + platform.height;
                    this.player.velocityY = 0;
                }
                else if (this.player.x < platform.x + platform.width / 2) {
                    this.player.x = platform.x - this.player.width;
                    this.player.velocityX = 0;
                } else {
                    this.player.x = platform.x + platform.width;
                    this.player.velocityX = 0;
                }
            }
        }
        
        // Check moving platform collisions
        for (const platform of this.movingPlatforms) {
            if (this.checkPlatformCollision(platform)) {
                const playerBottom = this.player.y + this.player.height;
                const playerTop = this.player.y;
                const playerPrevBottom = playerBottom - this.player.velocityY;
                
                if (playerPrevBottom <= platform.y && this.player.velocityY >= 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isGrounded = true;
                    onPlatform = true;
                    // Move with platform
                    this.player.x += platform.speed * platform.direction;
                }
                else if (playerTop < platform.y + platform.height && 
                         this.player.y > platform.y && 
                         this.player.velocityY < 0) {
                    this.player.y = platform.y + platform.height;
                    this.player.velocityY = 0;
                }
                else if (this.player.x < platform.x + platform.width / 2) {
                    this.player.x = platform.x - this.player.width;
                    this.player.velocityX = 0;
                } else {
                    this.player.x = platform.x + platform.width;
                    this.player.velocityX = 0;
                }
            }
        }
        
        if (!onPlatform) {
            if (this.player.y + this.player.height > this.groundY) {
                this.player.y = this.groundY - this.player.height;
                this.player.velocityY = 0;
                this.player.isGrounded = true;
            } else {
                this.player.isGrounded = false;
            }
        }
        
        this.updateCamera();
        this.updateParticles();
        this.goalAnimation += 0.05;
        
        if (this.playerSquish < 1) {
            this.playerSquish += 0.05;
        }
    }

    private render(): void {
        // Background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(0.5, '#34495E');
        gradient.addColorStop(1, '#2C3E50');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);

        // Draw background elements
        this.ctx.fillStyle = 'rgba(52, 73, 94, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = (i * 100 + this.camera.y * 0.1) % this.canvas.width;
            const y = (i * 150) % this.levelHeight;
            this.ctx.fillRect(x, y, 30, 30);
        }
        
        // Ground
        const groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.levelHeight);
        groundGradient.addColorStop(0, '#7F8C8D');
        groundGradient.addColorStop(1, '#95A5A6');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.levelHeight - this.groundY);

        // Static platforms with shadows
        for (const platform of this.platforms) {
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(
                platform.x + 3,
                platform.y + 3,
                platform.width,
                platform.height
            );
            
            // Platform
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
            
            // Highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(
                platform.x,
                platform.y,
                platform.width,
                4
            );
        }

        // Moving platforms with arrows
        for (const platform of this.movingPlatforms) {
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(
                platform.x + 3,
                platform.y + 3,
                platform.width,
                platform.height
            );
            
            // Platform
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
            
            // Arrow indicating direction
            this.ctx.fillStyle = '#fff';
            const arrowX = platform.x + platform.width / 2;
            const arrowY = platform.y + platform.height / 2;
            const arrowSize = 5;
            
            if (platform.direction === 1) {
                // Right arrow
                this.ctx.fillRect(arrowX - arrowSize, arrowY - 1, arrowSize * 2, 2);
                this.ctx.fillRect(arrowX + arrowSize - 3, arrowY - 3, 3, 6);
            } else {
                // Left arrow  
                this.ctx.fillRect(arrowX - arrowSize, arrowY - 1, arrowSize * 2, 2);
                this.ctx.fillRect(arrowX - arrowSize, arrowY - 3, 3, 6);
            }
        }

        // Coins
        for (const coin of this.coins) {
            if (coin.collected) continue;
            
            const pulse = Math.sin(coin.animation) * 2;
            const rotation = coin.animation * 2;
            
            this.ctx.save();
            this.ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
            this.ctx.rotate(rotation);
            
            // Coin glow
            this.ctx.shadowColor = '#F1C40F';
            this.ctx.shadowBlur = 10 + pulse;
            
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.fillRect(-coin.width / 2, -coin.height / 2, coin.width, coin.height);
            
            this.ctx.shadowBlur = 0;
            
            // Coin highlight
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(-coin.width / 4, -coin.height / 2, coin.width / 2, coin.height / 4);
            
            this.ctx.restore();
        }

        // Particles
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
        }
        this.ctx.globalAlpha = 1;

        // Animated goal
        const goalPulse = Math.sin(this.goalAnimation) * 5;
        
        // Goal glow
        this.ctx.shadowColor = '#F39C12';
        this.ctx.shadowBlur = 20 + goalPulse;
        
        this.ctx.fillStyle = this.goal.color;
        this.ctx.fillRect(
            this.goal.x - goalPulse / 2,
            this.goal.y - goalPulse / 2,
            this.goal.width + goalPulse,
            this.goal.height + goalPulse
        );
        
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = '#E67E22';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            this.goal.x - goalPulse / 2,
            this.goal.y - goalPulse / 2,
            this.goal.width + goalPulse,
            this.goal.height + goalPulse
        );
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('GOAL', this.goal.x + 13, this.goal.y + 30);

        // Player with squish animation
        const squishY = 1 / this.playerSquish;
        
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height);
        this.ctx.scale(this.playerSquish, squishY);
        
        // Player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(
            -this.player.width / 2 + 2,
            -this.player.height + 2,
            this.player.width,
            this.player.height
        );
        
        // Player body
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(
            -this.player.width / 2,
            -this.player.height,
            this.player.width,
            this.player.height
        );
        
        // Player eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(-15, -this.player.height + 10, 8, 8);
        this.ctx.fillRect(7, -this.player.height + 10, 8, 8);
        
        this.ctx.fillStyle = '#000';
        const eyeOffset = this.inputs.left ? -2 : this.inputs.right ? 2 : 0;
        this.ctx.fillRect(-13 + eyeOffset, -this.player.height + 12, 4, 4);
        this.ctx.fillRect(9 + eyeOffset, -this.player.height + 12, 4, 4);
        
        this.ctx.restore();
        
        this.ctx.restore();

        // UI Elements
        this.renderUI();
    }

    private renderUI(): void {
        // Game stats background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 120);
        
        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`Level ${this.currentLevel + 1}: ${this.levels[this.currentLevel].name}`, 20, 30);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Time: ${this.gameStats.timer.toFixed(1)}s`, 20, 50);
        this.ctx.fillText(`Score: ${this.gameStats.score}`, 20, 70);
        this.ctx.fillText(`Coins: ${this.gameStats.coinsCollected}/${this.coins.length}`, 20, 90);
        this.ctx.fillText(`Lives: ${'❤️'.repeat(this.player.lives)}`, 20, 110);
        
        const levelBestKey = `level${this.currentLevel}BestTime`;
        const levelBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
        if (levelBest < 999) {
            this.ctx.fillText(`Best: ${levelBest.toFixed(1)}s`, 160, 50);
        }
        
        const altitude = Math.max(0, Math.round(this.levelHeight - this.player.y - 150));
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#F39C12';
        this.ctx.fillText(`⬆ ${altitude}m`, 20, 140);

        // Game state overlays
        if (this.gameState === GameState.PAUSED) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.textAlign = 'left';
        } else if (this.gameState === GameState.DEAD) {
            this.ctx.fillStyle = 'rgba(139, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('RESPAWNING...', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        } else if (this.gameState === GameState.GAME_OVER) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.gameStats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillText(`Coins Collected: ${this.gameStats.coinsCollected}/${this.coins.length}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.textAlign = 'left';
        } else if (this.gameState === GameState.LEVEL_COMPLETE) {
            this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 80);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Time: ${this.gameStats.timer.toFixed(1)}s`, this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.fillText(`Score: ${this.gameStats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
            this.ctx.fillText(`Coins: ${this.gameStats.coinsCollected}/${this.coins.length}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            const levelBestKey = `level${this.currentLevel}BestTime`;
            const currentBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
            if (this.gameStats.timer === currentBest && currentBest < 999) {
                this.ctx.fillStyle = '#F1C40F';
                this.ctx.fillText('NEW LEVEL RECORD!', this.canvas.width / 2, this.canvas.height / 2 + 50);
                this.ctx.fillStyle = '#fff';
            }
            
            const countdown = Math.ceil(this.levelCompleteTimer / 60);
            this.ctx.fillText(`Next level in ${countdown}...`, this.canvas.width / 2, this.canvas.height / 2 + 80);
            this.ctx.textAlign = 'left';
        } else if (this.hasWon) {
            this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.currentLevel + 1 >= this.levels.length) {
                this.ctx.fillText('ALL LEVELS COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 80);
            } else {
                this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 80);
            }
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Time: ${this.gameStats.timer.toFixed(1)}s`, this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.fillText(`Score: ${this.gameStats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
            this.ctx.fillText(`Coins: ${this.gameStats.coinsCollected}/${this.coins.length}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            const levelBestKey = `level${this.currentLevel}BestTime`;
            const currentBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
            if (this.gameStats.timer === currentBest && currentBest < 999) {
                this.ctx.fillStyle = '#F1C40F';
                this.ctx.fillText('NEW LEVEL RECORD!', this.canvas.width / 2, this.canvas.height / 2 + 50);
                this.ctx.fillStyle = '#fff';
            }
            
            if (this.currentLevel + 1 >= this.levels.length) {
                this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
            } else {
                this.ctx.fillText('Next level starting...', this.canvas.width / 2, this.canvas.height / 2 + 80);
            }
            this.ctx.textAlign = 'left';
        }
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

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
});