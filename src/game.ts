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

class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private platforms: Platform[];
    private inputs: InputState;
    private animationId: number | null = null;
    private gravity: number = 0.5;
    private friction: number = 0.8;
    private groundY: number;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = ctx;

        this.groundY = this.canvas.height - 50;
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 150,
            width: 50,
            height: 50,
            speed: 5,
            color: '#3498db',
            velocityX: 0,
            velocityY: 0,
            isGrounded: false,
            jumpPower: -12
        };

        this.inputs = {
            left: false,
            right: false,
            jump: false
        };

        this.platforms = [
            { x: 100, y: 400, width: 120, height: 20, color: '#2ecc71' },
            { x: 300, y: 320, width: 100, height: 20, color: '#2ecc71' },
            { x: 500, y: 250, width: 150, height: 20, color: '#2ecc71' },
            { x: 200, y: 180, width: 80, height: 20, color: '#2ecc71' },
            { x: 400, y: 120, width: 100, height: 20, color: '#2ecc71' },
            { x: 600, y: 400, width: 100, height: 20, color: '#2ecc71' },
            { x: 50, y: 280, width: 80, height: 20, color: '#2ecc71' }
        ];

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

    private update(): void {
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
    }

    private render(): void {
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

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

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(
            Math.round(this.player.x),
            Math.round(this.player.y),
            this.player.width,
            this.player.height
        );

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Phase 3: Platforms', 10, 20);
        this.ctx.fillText('Jump between platforms to climb higher!', 10, 40);
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