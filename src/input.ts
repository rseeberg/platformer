// Input Handler Module

import { InputState } from './types.js';

export class InputHandler {
    private inputs: InputState;
    private onResetCallback?: () => void;
    private onPauseCallback?: () => void;
    private onNextLevelCallback?: () => void;
    private touchControls: Map<string, HTMLElement | (() => void)> = new Map();

    constructor() {
        this.inputs = {
            left: false,
            right: false,
            jump: false
        };
        
        this.setupEventListeners();
        this.createTouchControls();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent zoom on double tap for iOS
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    private createTouchControls(): void {
        // Only create touch controls on touch devices
        if (!('ontouchstart' in window)) return;

        // Create invisible full-screen touch zones
        this.createTouchZones();
    }

    private createTouchZones(): void {
        // Get canvas element to attach touch events directly to it
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Add visual feedback zones (semi-transparent, will be hidden after first touch)
        const leftZone = document.createElement('div');
        leftZone.id = 'left-touch-zone';
        leftZone.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 50%;
            height: 100vh;
            background: linear-gradient(to right, rgba(0, 100, 255, 0.1), transparent);
            z-index: 998;
            pointer-events: none;
            transition: opacity 0.3s;
        `;

        const rightZone = document.createElement('div');
        rightZone.id = 'right-touch-zone';
        rightZone.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 50%;
            height: 100vh;
            background: linear-gradient(to left, rgba(255, 100, 0, 0.1), transparent);
            z-index: 998;
            pointer-events: none;
            transition: opacity 0.3s;
        `;

        // Add hint text
        const hintText = document.createElement('div');
        hintText.id = 'touch-hint';
        hintText.innerHTML = `
            <div style="color: white; text-align: center; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 10px;">
                <div>← Touch Left Side | Touch Right Side →</div>
                <div style="margin-top: 5px;">↑ Swipe Up to Jump ↑</div>
            </div>
        `;
        hintText.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999;
            pointer-events: none;
            transition: opacity 0.3s;
        `;

        document.body.appendChild(leftZone);
        document.body.appendChild(rightZone);
        document.body.appendChild(hintText);

        // Hide hints after first touch
        let hintsVisible = true;
        const hideHints = () => {
            if (hintsVisible) {
                hintsVisible = false;
                leftZone.style.opacity = '0';
                rightZone.style.opacity = '0';
                hintText.style.opacity = '0';
                setTimeout(() => {
                    leftZone.remove();
                    rightZone.remove();
                    hintText.remove();
                }, 300);
            }
        };

        // Variables for touch tracking
        const activeTouches = new Map();
        const SWIPE_THRESHOLD = 30; // minimum distance for swipe (lower for easier mobile jumping)
        const SWIPE_TIME_THRESHOLD = 400; // maximum time for swipe (ms)

        // Attach touch handlers directly to document for iOS Safari compatibility
        const handleTouchStart = (e: TouchEvent) => {
            // Don't prevent default to allow iOS Safari to work properly
            hideHints();
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                const screenWidth = window.innerWidth;
                
                activeTouches.set(touch.identifier, {
                    startX: touchX,
                    startY: touchY,
                    currentX: touchX,
                    currentY: touchY,
                    startTime: Date.now()
                });

                // Determine if touch is on left or right side
                if (touchX < screenWidth / 2) {
                    // Left side - move left
                    this.inputs.left = true;
                    this.inputs.right = false;
                } else {
                    // Right side - move right
                    this.inputs.right = true;
                    this.inputs.left = false;
                }
            }
        };

        // Touch move handler for swipe detection
        const handleTouchMove = (e: TouchEvent) => {
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const touchData = activeTouches.get(touch.identifier);
                
                if (touchData) {
                    touchData.currentX = touch.clientX;
                    touchData.currentY = touch.clientY;
                    
                    // Check for upward swipe (jump)
                    const deltaY = touchData.startY - touch.clientY;
                    const deltaTime = Date.now() - touchData.startTime;
                    
                    if (deltaY > SWIPE_THRESHOLD && deltaTime < SWIPE_TIME_THRESHOLD) {
                        if (!this.inputs.jump) {
                            this.inputs.jump = true;
                            // Brief jump input
                            setTimeout(() => {
                                this.inputs.jump = false;
                            }, 100);
                        }
                    }
                }
            }
        };

        // Touch end handler
        const handleTouchEnd = (e: TouchEvent) => {
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const touchData = activeTouches.get(touch.identifier);
                
                if (touchData) {
                    // Check for upward swipe on touch end
                    const deltaY = touchData.startY - touchData.currentY;
                    const deltaTime = Date.now() - touchData.startTime;
                    
                    if (deltaY > SWIPE_THRESHOLD && deltaTime < SWIPE_TIME_THRESHOLD) {
                        if (!this.inputs.jump) {
                            this.inputs.jump = true;
                            setTimeout(() => {
                                this.inputs.jump = false;
                            }, 100);
                        }
                    }
                    
                    activeTouches.delete(touch.identifier);
                }
            }
            
            // If no active touches remain, stop movement
            if (activeTouches.size === 0) {
                this.inputs.left = false;
                this.inputs.right = false;
            } else {
                // Check remaining touches to maintain movement
                let hasLeft = false;
                let hasRight = false;
                const screenWidth = window.innerWidth;
                
                activeTouches.forEach((touchData) => {
                    if (touchData.currentX < screenWidth / 2) {
                        hasLeft = true;
                    } else {
                        hasRight = true;
                    }
                });
                
                this.inputs.left = hasLeft;
                this.inputs.right = hasRight;
            }
        };

        // Touch cancel handler
        const handleTouchCancel = (e: TouchEvent) => {
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                activeTouches.delete(touch.identifier);
            }
            
            // Stop all movement on cancel
            if (activeTouches.size === 0) {
                this.inputs.left = false;
                this.inputs.right = false;
            }
        };

        // Bind event handlers with proper options for iOS Safari
        const eventOptions = { passive: false, capture: false };
        
        // Use window for better iOS Safari compatibility
        window.addEventListener('touchstart', handleTouchStart, eventOptions);
        window.addEventListener('touchmove', handleTouchMove, eventOptions);
        window.addEventListener('touchend', handleTouchEnd, eventOptions);
        window.addEventListener('touchcancel', handleTouchCancel, eventOptions);
        
        // Store cleanup function
        this.touchControls.set('cleanup', () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchCancel);
        });
    }


    private handleKeyDown(e: KeyboardEvent): void {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.inputs.left = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.inputs.right = true;
                e.preventDefault();
                break;
            case ' ':
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.inputs.jump = true;
                e.preventDefault();
                break;
            case 'r':
            case 'R':
                if (this.onResetCallback) {
                    this.onResetCallback();
                }
                e.preventDefault();
                break;
            case 'Escape':
                if (this.onPauseCallback) {
                    this.onPauseCallback();
                }
                e.preventDefault();
                break;
            case 'n':
            case 'N':
                if (this.onNextLevelCallback) {
                    this.onNextLevelCallback();
                }
                e.preventDefault();
                break;
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.inputs.left = false;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.inputs.right = false;
                e.preventDefault();
                break;
            case ' ':
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.inputs.jump = false;
                e.preventDefault();
                break;
        }
    }

    public getInputs(): InputState {
        return this.inputs;
    }

    public onReset(callback: () => void): void {
        this.onResetCallback = callback;
    }

    public onPause(callback: () => void): void {
        this.onPauseCallback = callback;
    }

    public onNextLevel(callback: () => void): void {
        this.onNextLevelCallback = callback;
    }

    public resetInputs(): void {
        this.inputs = {
            left: false,
            right: false,
            jump: false
        };
    }

    public hideTouchControls(): void {
        // Touch controls are always active when touch is available
        // This method is kept for compatibility
    }

    public showTouchControls(): void {
        // Touch controls are always active when touch is available
        // This method is kept for compatibility
    }

    public isTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}