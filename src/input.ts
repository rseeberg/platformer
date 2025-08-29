// Input Handler Module

import { InputState } from './types.js';

export class InputHandler {
    private inputs: InputState;
    private onResetCallback?: () => void;
    private onPauseCallback?: () => void;
    private onNextLevelCallback?: () => void;
    private touchControls: Map<string, HTMLElement> = new Map();

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
        // Create invisible overlay for touch detection
        const touchOverlay = document.createElement('div');
        touchOverlay.id = 'touch-overlay';
        touchOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 999;
            pointer-events: auto;
            touch-action: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        `;

        // Variables for touch tracking
        let activeTouches = new Map();
        const SWIPE_THRESHOLD = 50; // minimum distance for swipe
        const SWIPE_TIME_THRESHOLD = 300; // maximum time for swipe (ms)

        // Touch start handler
        touchOverlay.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
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
        }, { passive: false });

        // Touch move handler for swipe detection
        touchOverlay.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
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
        }, { passive: false });

        // Touch end handler
        touchOverlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            
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
        }, { passive: false });

        // Touch cancel handler
        touchOverlay.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                activeTouches.delete(touch.identifier);
            }
            
            // Stop all movement on cancel
            if (activeTouches.size === 0) {
                this.inputs.left = false;
                this.inputs.right = false;
            }
        }, { passive: false });

        document.body.appendChild(touchOverlay);
        
        // Store reference for later manipulation
        this.touchControls.set('overlay', touchOverlay);
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
        const overlay = document.getElementById('touch-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    public showTouchControls(): void {
        const overlay = document.getElementById('touch-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
    }

    public isTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}