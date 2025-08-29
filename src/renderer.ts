// Renderer Module

import { 
    Player, Platform, MovingPlatform, Coin, Goal, 
    Camera, GameStats, GameState, InputState 
} from './types.js';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private goalAnimation: number = 0;
    private playerSquish: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = ctx;
    }

    public updateAnimations(): void {
        this.goalAnimation += 0.05;
        if (this.playerSquish < 1) {
            this.playerSquish += 0.05;
        }
    }

    public setPlayerSquish(value: number): void {
        this.playerSquish = value;
    }

    public render(
        player: Player,
        platforms: Platform[],
        movingPlatforms: MovingPlatform[],
        coins: Coin[],
        goal: Goal,
        camera: Camera,
        levelHeight: number,
        groundY: number,
        inputs: InputState
    ): void {
        // Clear and draw background
        this.drawBackground();
        
        // Save context and apply camera transform
        this.ctx.save();
        this.ctx.translate(0, -camera.y);

        // Draw background elements
        this.drawBackgroundElements(camera, levelHeight);
        
        // Draw ground
        this.drawGround(groundY, levelHeight);

        // Draw static platforms
        this.drawPlatforms(platforms);

        // Draw moving platforms
        this.drawMovingPlatforms(movingPlatforms);

        // Draw coins
        this.drawCoins(coins);

        // Draw goal
        this.drawGoal(goal);

        // Draw player
        this.drawPlayer(player, inputs);
        
        // Restore context
        this.ctx.restore();
    }

    private drawBackground(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(0.5, '#34495E');
        gradient.addColorStop(1, '#2C3E50');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawBackgroundElements(camera: Camera, levelHeight: number): void {
        this.ctx.fillStyle = 'rgba(52, 73, 94, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = (i * 100 + camera.y * 0.1) % this.canvas.width;
            const y = (i * 150) % levelHeight;
            this.ctx.fillRect(x, y, 30, 30);
        }
    }

    private drawGround(groundY: number, levelHeight: number): void {
        const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, levelHeight);
        groundGradient.addColorStop(0, '#7F8C8D');
        groundGradient.addColorStop(1, '#95A5A6');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, levelHeight - groundY);
    }

    private drawPlatforms(platforms: Platform[]): void {
        for (const platform of platforms) {
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
    }

    private drawMovingPlatforms(movingPlatforms: MovingPlatform[]): void {
        for (const platform of movingPlatforms) {
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
            
            if (platform.moveVertical) {
                // Vertical arrows
                if (platform.direction === 1) {
                    // Down arrow
                    this.ctx.fillRect(arrowX - 1, arrowY - arrowSize, 2, arrowSize * 2);
                    this.ctx.fillRect(arrowX - 3, arrowY + arrowSize - 3, 6, 3);
                } else {
                    // Up arrow
                    this.ctx.fillRect(arrowX - 1, arrowY - arrowSize, 2, arrowSize * 2);
                    this.ctx.fillRect(arrowX - 3, arrowY - arrowSize, 6, 3);
                }
            } else {
                // Horizontal arrows
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
        }
    }

    private drawCoins(coins: Coin[]): void {
        for (const coin of coins) {
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
    }

    private drawGoal(goal: Goal): void {
        const goalPulse = Math.sin(this.goalAnimation) * 5;
        
        // Goal glow
        this.ctx.shadowColor = '#F39C12';
        this.ctx.shadowBlur = 20 + goalPulse;
        
        this.ctx.fillStyle = goal.color;
        this.ctx.fillRect(
            goal.x - goalPulse / 2,
            goal.y - goalPulse / 2,
            goal.width + goalPulse,
            goal.height + goalPulse
        );
        
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = '#E67E22';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            goal.x - goalPulse / 2,
            goal.y - goalPulse / 2,
            goal.width + goalPulse,
            goal.height + goalPulse
        );
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('GOAL', goal.x + 13, goal.y + 30);
    }

    private drawPlayer(player: Player, inputs: InputState): void {
        const squishY = 1 / this.playerSquish;
        
        this.ctx.save();
        this.ctx.translate(player.x + player.width / 2, player.y + player.height);
        this.ctx.scale(this.playerSquish, squishY);
        
        // Player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(
            -player.width / 2 + 2,
            -player.height + 2,
            player.width,
            player.height
        );
        
        // Player body
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(
            -player.width / 2,
            -player.height,
            player.width,
            player.height
        );
        
        // Player eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(-15, -player.height + 10, 8, 8);
        this.ctx.fillRect(7, -player.height + 10, 8, 8);
        
        this.ctx.fillStyle = '#000';
        const eyeOffset = inputs.left ? -2 : inputs.right ? 2 : 0;
        this.ctx.fillRect(-13 + eyeOffset, -player.height + 12, 4, 4);
        this.ctx.fillRect(9 + eyeOffset, -player.height + 12, 4, 4);
        
        this.ctx.restore();
    }

    public renderUI(
        gameState: GameState,
        gameStats: GameStats,
        player: Player,
        coins: Coin[],
        currentLevel: number,
        levelName: string,
        levelCompleteTimer: number,
        hasWon: boolean
    ): void {
        // Game stats background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 120);
        
        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`Level ${currentLevel + 1}: ${levelName}`, 20, 30);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Time: ${gameStats.timer.toFixed(1)}s`, 20, 50);
        this.ctx.fillText(`Score: ${gameStats.score}`, 20, 70);
        this.ctx.fillText(`Coins: ${gameStats.coinsCollected}/${coins.length}`, 20, 90);
        this.ctx.fillText(`Lives: ${'❤️'.repeat(player.lives)}`, 20, 110);
        
        const levelBestKey = `level${currentLevel}BestTime`;
        const levelBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
        if (levelBest < 999) {
            this.ctx.fillText(`Best: ${levelBest.toFixed(1)}s`, 160, 50);
        }
        
        const altitude = Math.max(0, Math.round(1200 - player.y - 150));
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#F39C12';
        this.ctx.fillText(`⬆ ${altitude}m`, 20, 140);

        // Game state overlays
        this.renderGameStateOverlay(gameState, gameStats, player, coins, currentLevel, levelCompleteTimer, hasWon);
    }

    private renderGameStateOverlay(
        gameState: GameState,
        gameStats: GameStats,
        _player: Player,
        coins: Coin[],
        currentLevel: number,
        levelCompleteTimer: number,
        hasWon: boolean
    ): void {
        if (gameState === GameState.PAUSED) {
            this.renderPausedOverlay();
        } else if (gameState === GameState.DEAD) {
            this.renderDeadOverlay();
        } else if (gameState === GameState.GAME_OVER) {
            this.renderGameOverOverlay(gameStats, coins);
        } else if (gameState === GameState.LEVEL_COMPLETE) {
            this.renderLevelCompleteOverlay(gameStats, coins, currentLevel, levelCompleteTimer);
        } else if (hasWon) {
            this.renderVictoryOverlay(gameStats, coins, currentLevel);
        }
    }

    private renderPausedOverlay(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.textAlign = 'left';
    }

    private renderDeadOverlay(): void {
        this.ctx.fillStyle = 'rgba(139, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RESPAWNING...', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left';
    }

    private renderGameOverOverlay(gameStats: GameStats, coins: Coin[]): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${gameStats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText(`Coins Collected: ${gameStats.coinsCollected}/${coins.length}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.textAlign = 'left';
    }

    private renderLevelCompleteOverlay(
        gameStats: GameStats, 
        coins: Coin[], 
        currentLevel: number, 
        levelCompleteTimer: number
    ): void {
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Time: ${gameStats.timer.toFixed(1)}s`, this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.ctx.fillText(`Score: ${gameStats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.fillText(`Coins: ${gameStats.coinsCollected}/${coins.length}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        const levelBestKey = `level${currentLevel}BestTime`;
        const currentBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
        if (gameStats.timer === currentBest && currentBest < 999) {
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.fillText('NEW LEVEL RECORD!', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.fillStyle = '#fff';
        }
        
        const countdown = Math.ceil(levelCompleteTimer / 60);
        this.ctx.fillText(`Next level in ${countdown}...`, this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.textAlign = 'left';
    }

    private renderVictoryOverlay(gameStats: GameStats, coins: Coin[], currentLevel: number): void {
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ALL LEVELS COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Time: ${gameStats.timer.toFixed(1)}s`, this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.ctx.fillText(`Score: ${gameStats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.fillText(`Coins: ${gameStats.coinsCollected}/${coins.length}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        const levelBestKey = `level${currentLevel}BestTime`;
        const currentBest = parseFloat(localStorage.getItem(levelBestKey) || '999');
        if (gameStats.timer === currentBest && currentBest < 999) {
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.fillText('NEW LEVEL RECORD!', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.fillStyle = '#fff';
        }
        
        this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.textAlign = 'left';
    }
}