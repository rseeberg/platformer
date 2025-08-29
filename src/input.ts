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

        // Add movement direction indicator
        const movementIndicator = document.createElement('div');
        movementIndicator.id = 'movement-indicator';
        movementIndicator.innerHTML = '→';
        movementIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(movementIndicator);

        // Add hint text for new control scheme
        const hintText = document.createElement('div');
        hintText.id = 'touch-hint';
        hintText.innerHTML = `
            <div style="color: white; text-align: center; padding: 10px; background: rgba(0,0,0,0.7); border-radius: 10px;">
                <div>🖱️ Drag anywhere to move left/right</div>
                <div style="margin-top: 5px;">👆 Tap or swipe up to jump</div>
                <div style="margin-top: 3px; font-size: 12px; opacity: 0.8;">Movement continues during jumps</div>
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
        document.body.appendChild(hintText);

        // Hide hints after first meaningful interaction
        let hintsVisible = true;
        const hideHints = () => {
            if (hintsVisible) {
                hintsVisible = false;
                hintText.style.opacity = '0';
                setTimeout(() => {
                    hintText.remove();
                }, 300);
            }
        };

        // Show movement direction indicator
        const showMovementIndicator = (direction: 'left' | 'right' | 'none') => {
            if (direction === 'none') {
                movementIndicator.style.opacity = '0';
            } else {
                movementIndicator.innerHTML = direction === 'left' ? '←' : '→';
                movementIndicator.style.opacity = '1';
            }
        };

        // Variables for momentum-based touch tracking
        const activeTouches = new Map();
        let movementTouchId: number | null = null; // Track which touch controls movement
        
        const SWIPE_THRESHOLD = 25; // minimum distance for jump swipe
        const SWIPE_TIME_THRESHOLD = 400; // maximum time for swipe (ms)
        const DRAG_THRESHOLD = 5; // minimum drag distance to start movement

        // Attach touch handlers directly to document for iOS Safari compatibility
        const handleTouchStart = (e: TouchEvent) => {
            hideHints();
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const touchData = {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentX: touch.clientX,
                    currentY: touch.clientY,
                    startTime: Date.now(),
                    isMovementTouch: false,
                    lastMoveX: touch.clientX
                };
                
                activeTouches.set(touch.identifier, touchData);

                // If no movement touch is active, this becomes the movement controller
                if (movementTouchId === null) {
                    movementTouchId = touch.identifier;
                    touchData.isMovementTouch = true;
                }
            }
        };

        // Touch move handler for drag-based movement and jump detection
        const handleTouchMove = (e: TouchEvent) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const touchData = activeTouches.get(touch.identifier);
                
                if (touchData) {
                    touchData.currentX = touch.clientX;
                    touchData.currentY = touch.clientY;
                    
                    // Handle movement for the designated movement touch
                    if (touch.identifier === movementTouchId && touchData.isMovementTouch) {
                        const deltaX = touch.clientX - touchData.lastMoveX;
                        const totalDragX = touch.clientX - touchData.startX;
                        
                        // Only start movement after minimum drag threshold
                        if (Math.abs(totalDragX) > DRAG_THRESHOLD) {
                            if (deltaX < -2) { // Moving left
                                this.inputs.left = true;
                                this.inputs.right = false;
                                showMovementIndicator('left');
                            } else if (deltaX > 2) { // Moving right
                                this.inputs.right = true;
                                this.inputs.left = false;
                                showMovementIndicator('right');
                            }
                            // Don't update lastMoveX continuously to avoid jitter
                            touchData.lastMoveX = touch.clientX;
                        }
                    } else {
                        // Non-movement touches: check for upward swipe (jump)
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
            }
        };

        // Touch end handler with movement persistence
        const handleTouchEnd = (e: TouchEvent) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const touchData = activeTouches.get(touch.identifier);
                
                if (touchData) {
                    // Check for quick tap (jump) - for touches that didn't move much
                    const deltaY = touchData.startY - touchData.currentY;
                    const deltaX = Math.abs(touchData.startX - touchData.currentX);
                    const deltaTime = Date.now() - touchData.startTime;
                    
                    // Quick tap or upward swipe = jump
                    if ((deltaTime < 200 && deltaX < 20) || // Quick tap
                        (deltaY > SWIPE_THRESHOLD && deltaTime < SWIPE_TIME_THRESHOLD)) { // Upward swipe
                        if (!this.inputs.jump) {
                            this.inputs.jump = true;
                            setTimeout(() => {
                                this.inputs.jump = false;
                            }, 100);
                        }
                    }
                    
                    // Handle movement touch ending
                    if (touch.identifier === movementTouchId) {
                        movementTouchId = null;
                        // Stop movement only when the movement finger is lifted
                        this.inputs.left = false;
                        this.inputs.right = false;
                        showMovementIndicator('none');
                        
                        // Check if another touch can become the movement controller
                        const remainingTouches = Array.from(activeTouches.entries())
                            .filter(([id]) => id !== touch.identifier);
                        
                        if (remainingTouches.length > 0) {
                            const [newMovementId, newTouchData] = remainingTouches[0];
                            movementTouchId = newMovementId;
                            newTouchData.isMovementTouch = true;
                            newTouchData.lastMoveX = newTouchData.currentX;
                        }
                    }
                    
                    activeTouches.delete(touch.identifier);
                }
            }
        };

        // Touch cancel handler
        const handleTouchCancel = (e: TouchEvent) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                
                // Handle movement touch being cancelled
                if (touch.identifier === movementTouchId) {
                    movementTouchId = null;
                    this.inputs.left = false;
                    this.inputs.right = false;
                    showMovementIndicator('none');
                }
                
                activeTouches.delete(touch.identifier);
            }
            
            // Try to assign a new movement touch if any remain
            if (movementTouchId === null && activeTouches.size > 0) {
                const firstTouch = activeTouches.entries().next();
                if (firstTouch.value) {
                    const [newMovementId, newTouchData] = firstTouch.value;
                    movementTouchId = newMovementId;
                    newTouchData.isMovementTouch = true;
                    newTouchData.lastMoveX = newTouchData.currentX;
                }
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