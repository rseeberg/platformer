// Level Definitions Module

import { LevelData, Coin } from './types.js';

export class LevelManager {
    private levels: LevelData[] = [];
    
    constructor(canvasWidth: number) {
        this.initializeLevels(canvasWidth);
    }

    private initializeLevels(canvasWidth: number): void {
        const platformColors = ['#52BE80', '#58D68D', '#45B39D', '#48C9B0', '#5DADE2'];
        
        // Level 1: Tutorial Valley
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
        
        // Level 2: Mountain Climb - Moving Platform Challenge
        this.levels.push({
            name: 'Mountain Climb',
            levelHeight: 1200,
            playerStart: { x: canvasWidth / 2 - 25, y: 1050 },
            platforms: [
                // Bottom section - Starting area
                { x: 350, y: 1100, width: 100, height: 20, color: platformColors[0] },
                
                // Lower section - Separated platforms requiring moving platform
                { x: 50, y: 1000, width: 80, height: 20, color: platformColors[1] },
                { x: 670, y: 1000, width: 80, height: 20, color: platformColors[2] },
                
                // Mid-lower section - Wide gaps
                { x: 100, y: 900, width: 60, height: 20, color: platformColors[3] },
                { x: 640, y: 900, width: 60, height: 20, color: platformColors[4] },
                
                // Middle section - Vertical challenge
                { x: 50, y: 750, width: 80, height: 20, color: platformColors[0] },
                { x: 670, y: 750, width: 80, height: 20, color: platformColors[1] },
                
                // Upper middle - Zigzag pattern
                { x: 150, y: 600, width: 70, height: 20, color: platformColors[2] },
                { x: 580, y: 600, width: 70, height: 20, color: platformColors[3] },
                
                // Higher section - Precision jumps needed
                { x: 50, y: 480, width: 60, height: 20, color: platformColors[4] },
                { x: 690, y: 480, width: 60, height: 20, color: platformColors[0] },
                
                // Top section - Final approach
                { x: 200, y: 350, width: 80, height: 20, color: platformColors[1] },
                { x: 520, y: 350, width: 80, height: 20, color: platformColors[2] },
                
                // Near goal - Small platforms
                { x: 100, y: 250, width: 60, height: 20, color: platformColors[3] },
                { x: 640, y: 250, width: 60, height: 20, color: platformColors[4] },
                
                // Goal platform
                { x: 350, y: 150, width: 100, height: 20, color: platformColors[0] }
            ],
            movingPlatforms: [
                // Essential for crossing the lower gap
                {
                    x: 200, y: 1000, width: 100, height: 20, color: '#E74C3C',
                    startX: 150, endX: 550, speed: 1.5, direction: 1
                },
                // Bridge for middle section - faster movement
                {
                    x: 300, y: 800, width: 90, height: 20, color: '#E74C3C',
                    startX: 200, endX: 500, speed: 2, direction: -1
                },
                // Vertical elevator platform
                {
                    x: 375, y: 650, width: 80, height: 20, color: '#9B59B6',
                    startX: 375, endX: 375, startY: 550, endY: 850,
                    speed: 1.2, direction: 1, moveVertical: true
                },
                // Top section connector - requires timing
                {
                    x: 350, y: 400, width: 100, height: 20, color: '#E74C3C',
                    startX: 250, endX: 450, speed: 1, direction: 1
                },
                // Final approach platform - tricky timing
                {
                    x: 350, y: 250, width: 80, height: 20, color: '#E74C3C',
                    startX: 200, endX: 500, speed: 1.8, direction: -1
                }
            ],
            coins: this.generateLevelTwoCoins(),
            goal: { x: 365, y: 60, width: 70, height: 50, color: '#F39C12' }
        });
        
        // Level 3: Sky Fortress - Expert Challenge
        this.levels.push({
            name: 'Sky Fortress',
            levelHeight: 1000,
            playerStart: { x: 400, y: 850 },
            platforms: [
                // Starting platform
                { x: 350, y: 900, width: 100, height: 20, color: platformColors[0] },
                
                // Isolated platforms - need moving platforms to reach
                { x: 50, y: 800, width: 60, height: 20, color: platformColors[1] },
                { x: 690, y: 800, width: 60, height: 20, color: platformColors[2] },
                
                // Checkpoint platforms - very small
                { x: 100, y: 650, width: 40, height: 20, color: platformColors[3] },
                { x: 660, y: 650, width: 40, height: 20, color: platformColors[4] },
                
                // Mid-air challenge platforms
                { x: 50, y: 500, width: 50, height: 20, color: platformColors[0] },
                { x: 700, y: 500, width: 50, height: 20, color: platformColors[1] },
                
                // Upper challenge - tiny platforms
                { x: 150, y: 350, width: 40, height: 20, color: platformColors[2] },
                { x: 610, y: 350, width: 40, height: 20, color: platformColors[3] },
                
                // Final platform before goal
                { x: 375, y: 200, width: 50, height: 20, color: platformColors[4] }
            ],
            movingPlatforms: [
                // Main traversal platform - crosses entire level
                {
                    x: 200, y: 800, width: 100, height: 20, color: '#E74C3C',
                    startX: 120, endX: 580, speed: 2.5, direction: 1
                },
                // Vertical lift - essential for middle section
                {
                    x: 400, y: 700, width: 80, height: 20, color: '#9B59B6',
                    startX: 400, endX: 400, startY: 450, endY: 750,
                    speed: 1.5, direction: -1, moveVertical: true
                },
                // Fast horizontal - requires precise timing
                {
                    x: 250, y: 550, width: 70, height: 20, color: '#E74C3C',
                    startX: 150, endX: 550, speed: 3, direction: 1
                },
                // Dual vertical lifts - synchronized challenge
                {
                    x: 200, y: 400, width: 60, height: 20, color: '#9B59B6',
                    startX: 200, endX: 200, startY: 300, endY: 500,
                    speed: 1.8, direction: 1, moveVertical: true
                },
                {
                    x: 540, y: 400, width: 60, height: 20, color: '#9B59B6',
                    startX: 540, endX: 540, startY: 300, endY: 500,
                    speed: 1.8, direction: -1, moveVertical: true
                },
                // Final approach - very fast, small platform
                {
                    x: 375, y: 250, width: 60, height: 20, color: '#E74C3C',
                    startX: 200, endX: 500, speed: 3.5, direction: 1
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

    private generateLevelTwoCoins(): Coin[] {
        return [
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
        ];
    }

    public getLevel(index: number): LevelData | null {
        if (index >= 0 && index < this.levels.length) {
            // Return a deep copy to prevent modification of the original
            const level = this.levels[index];
            return {
                ...level,
                platforms: [...level.platforms],
                movingPlatforms: level.movingPlatforms.map(p => ({ ...p })),
                coins: level.coins.map(c => ({ ...c, collected: false, animation: 0 })),
                goal: { ...level.goal }
            };
        }
        return null;
    }

    public getLevelCount(): number {
        return this.levels.length;
    }

    public getLevelName(index: number): string {
        const level = this.levels[index];
        return level ? level.name : '';
    }
}