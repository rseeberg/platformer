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
    private initialPlayerState: Player;
    private camera: Camera;
    private levelHeight: number = 1200;

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
            color: '#3498db',
            velocityX: 0,
            velocityY: 0,
            isGrounded: false,
            jumpPower: -14
        };

        this.inputs = {
            left: false,
            right: false,
            jump: false
        };

        this.initialPlayerState = { ...this.player };

        this.platforms = [
            // Bottom section (ground level)
            { x: 100, y: 1100, width: 120, height: 20, color: '#2ecc71' },
            { x: 600, y: 1100, width: 100, height: 20, color: '#2ecc71' },
            { x: 350, y: 1030, width: 100, height: 20, color: '#2ecc71' },
            
            // Lower middle section
            { x: 150, y: 950, width: 100, height: 20, color: '#2ecc71' },
            { x: 550, y: 950, width: 100, height: 20, color: '#2ecc71' },
            { x: 350, y: 880, width: 120, height: 20, color: '#2ecc71' },
            
            // Middle section
            { x: 100, y: 800, width: 80, height: 20, color: '#2ecc71' },
            { x: 620, y: 800, width: 80, height: 20, color: '#2ecc71' },
            { x: 250, y: 730, width: 100, height: 20, color: '#2ecc71' },
            { x: 450, y: 730, width: 100, height: 20, color: '#2ecc71' },
            
            // Upper middle section  
            { x: 350, y: 650, width: 100, height: 20, color: '#2ecc71' },
            { x: 150, y: 580, width: 80, height: 20, color: '#2ecc71' },
            { x: 570, y: 580, width: 80, height: 20, color: '#2ecc71' },
            
            // Higher section
            { x: 350, y: 500, width: 120, height: 20, color: '#2ecc71' },
            { x: 100, y: 430, width: 100, height: 20, color: '#2ecc71' },
            { x: 600, y: 430, width: 100, height: 20, color: '#2ecc71' },
            
            // Top section
            { x: 250, y: 350, width: 80, height: 20, color: '#2ecc71' },
            { x: 470, y: 350, width: 80, height: 20, color: '#2ecc71' },
            { x: 350, y: 280, width: 100, height: 20, color: '#2ecc71' },
            
            // Near goal
            { x: 200, y: 200, width: 80, height: 20, color: '#2ecc71' },
            { x: 520, y: 200, width: 80, height: 20, color: '#2ecc71' },
            { x: 350, y: 130, width: 120, height: 20, color: '#2ecc71' }
        ];

        this.goal = {
            x: 365,
            y: 60,
            width: 70,
            height: 50,
            color: '#f39c12'
        };

        this.setupInputHandlers();
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

    private checkPlatformCollision(platform: Platform): boolean {
        return this.player.x < platform.x + platform.width &&
               this.player.x + this.player.width > platform.x &&
               this.player.y < platform.y + platform.height &&
               this.player.y + this.player.height > platform.y;
    }

    private reset(): void {
        this.player = { ...this.initialPlayerState };
        this.hasWon = false;
        this.camera.y = 0;
        this.camera.targetY = 0;
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
        if (this.hasWon) {
            return;
        }

        if (this.checkGoalCollision()) {
            this.hasWon = true;
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

        let onPlatform = false;
        
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
    }

    private render(): void {
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);

        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.levelHeight - this.groundY);

        for (const platform of this.platforms) {
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
            
            this.ctx.strokeStyle = '#27ae60';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
        }

        this.ctx.fillStyle = this.goal.color;
        this.ctx.fillRect(
            this.goal.x,
            this.goal.y,
            this.goal.width,
            this.goal.height
        );
        
        this.ctx.strokeStyle = '#e67e22';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            this.goal.x,
            this.goal.y,
            this.goal.width,
            this.goal.height
        );
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('GOAL', this.goal.x + 13, this.goal.y + 30);

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(
            Math.round(this.player.x),
            Math.round(this.player.y),
            this.player.width,
            this.player.height
        );
        
        this.ctx.restore();

        if (this.hasWon) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.textAlign = 'left';
        }

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Phase 5: Camera & Larger Level', 10, 20);
        this.ctx.fillText('Climb to the top! Camera follows you vertically', 10, 40);
        
        const altitude = Math.max(0, Math.round(this.levelHeight - this.player.y - 150));
        this.ctx.fillText(`Altitude: ${altitude}m`, 10, 60);
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