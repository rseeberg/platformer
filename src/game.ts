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

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
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
    private particles: Particle[] = [];
    private goalAnimation: number = 0;
    private playerSquish: number = 0;

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
            jumpPower: -14
        };

        this.inputs = {
            left: false,
            right: false,
            jump: false
        };

        this.initialPlayerState = { ...this.player };

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
        this.particles = [];
        this.goalAnimation = 0;
        this.playerSquish = 0;
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
            this.createJumpParticles();
            this.playerSquish = 0.8;
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

        // Platforms with shadows
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

        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Phase 6: Visual Polish', 10, 20);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Jump to see particles! Goal pulses with energy', 10, 40);
        
        const altitude = Math.max(0, Math.round(this.levelHeight - this.player.y - 150));
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#F39C12';
        this.ctx.fillText(`⬆ ${altitude}m`, 10, 65);
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