// Physics and Collision Module

import { Player, Platform, MovingPlatform, Coin, Goal, GameConfig } from './types.js';

export class Physics {
    private gravity: number;
    private friction: number;

    constructor(config: GameConfig) {
        this.gravity = config.gravity;
        this.friction = config.friction;
    }

    public updatePlayer(player: Player, inputLeft: boolean, inputRight: boolean, inputJump: boolean): void {
        // Handle horizontal movement
        if (inputLeft) {
            player.velocityX = -player.speed;
        } else if (inputRight) {
            player.velocityX = player.speed;
        } else {
            player.velocityX *= this.friction;
        }

        // Handle jumping
        if (inputJump && player.isGrounded) {
            player.velocityY = player.jumpPower;
            player.isGrounded = false;
        }

        // Apply gravity
        player.velocityY += this.gravity;

        // Update position
        player.x += player.velocityX;
        player.y += player.velocityY;
    }

    public constrainPlayerToBounds(player: Player, canvasWidth: number): void {
        if (player.x < 0) {
            player.x = 0;
            player.velocityX = 0;
        }
        if (player.x + player.width > canvasWidth) {
            player.x = canvasWidth - player.width;
            player.velocityX = 0;
        }
    }

    public checkPlatformCollision(player: Player, platform: Platform | MovingPlatform): boolean {
        return player.x < platform.x + platform.width &&
               player.x + player.width > platform.x &&
               player.y < platform.y + platform.height &&
               player.y + player.height > platform.y;
    }

    public handlePlatformCollision(player: Player, platform: Platform | MovingPlatform): boolean {
        if (!this.checkPlatformCollision(player, platform)) {
            return false;
        }

        const playerBottom = player.y + player.height;
        const playerTop = player.y;
        const playerPrevBottom = playerBottom - player.velocityY;
        
        // Landing on top of platform
        if (playerPrevBottom <= platform.y && player.velocityY >= 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isGrounded = true;
            
            // Move with moving platform
            if ('speed' in platform) {
                const movingPlatform = platform as MovingPlatform;
                if (movingPlatform.moveVertical) {
                    // Move vertically with platform
                    player.y += movingPlatform.speed * movingPlatform.direction;
                } else {
                    // Move horizontally with platform
                    player.x += movingPlatform.speed * movingPlatform.direction;
                }
            }
            return true;
        }
        // Hitting bottom of platform
        else if (playerTop < platform.y + platform.height && 
                 player.y > platform.y && 
                 player.velocityY < 0) {
            player.y = platform.y + platform.height;
            player.velocityY = 0;
        }
        // Side collisions
        else if (player.x < platform.x + platform.width / 2) {
            player.x = platform.x - player.width;
            player.velocityX = 0;
        } else {
            player.x = platform.x + platform.width;
            player.velocityX = 0;
        }
        
        return false;
    }

    public updateMovingPlatform(platform: MovingPlatform): void {
        if (platform.moveVertical) {
            // Vertical movement
            platform.y += platform.speed * platform.direction;
            
            if (platform.startY !== undefined && platform.endY !== undefined) {
                if (platform.y <= platform.startY) {
                    platform.y = platform.startY;
                    platform.direction = 1;
                } else if (platform.y >= platform.endY) {
                    platform.y = platform.endY;
                    platform.direction = -1;
                }
            }
        } else {
            // Horizontal movement
            platform.x += platform.speed * platform.direction;
            
            if (platform.x <= platform.startX) {
                platform.x = platform.startX;
                platform.direction = 1;
            } else if (platform.x >= platform.endX) {
                platform.x = platform.endX;
                platform.direction = -1;
            }
        }
    }

    public checkGroundCollision(player: Player, groundY: number): boolean {
        if (player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.velocityY = 0;
            player.isGrounded = true;
            return true;
        }
        return false;
    }

    public checkCoinCollision(player: Player, coin: Coin): boolean {
        if (coin.collected) return false;
        
        return player.x < coin.x + coin.width &&
               player.x + player.width > coin.x &&
               player.y < coin.y + coin.height &&
               player.y + player.height > coin.y;
    }

    public checkGoalCollision(player: Player, goal: Goal): boolean {
        return player.x < goal.x + goal.width &&
               player.x + player.width > goal.x &&
               player.y < goal.y + goal.height &&
               player.y + player.height > goal.y;
    }

    public checkDeath(player: Player, levelHeight: number): boolean {
        return player.y > levelHeight + 100;
    }
}