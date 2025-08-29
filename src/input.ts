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

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'touch-controls';
        controlsContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            z-index: 1000;
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
        `;

        // Left side controls (movement)
        const leftControls = document.createElement('div');
        leftControls.style.cssText = `
            display: flex;
            gap: 15px;
            align-items: center;
        `;

        // Left arrow button
        const leftBtn = this.createTouchButton('←', 'left');
        leftControls.appendChild(leftBtn);

        // Right arrow button  
        const rightBtn = this.createTouchButton('→', 'right');
        leftControls.appendChild(rightBtn);

        // Jump button (right side)
        const jumpBtn = this.createTouchButton('↑', 'jump');
        jumpBtn.style.cssText += `
            width: 80px;
            height: 80px;
            font-size: 32px;
            border-radius: 50%;
        `;

        // Pause button
        const pauseBtn = this.createTouchButton('⏸', 'pause');
        pauseBtn.style.cssText += `
            width: 50px;
            height: 50px;
            font-size: 20px;
            position: absolute;
            top: 20px;
            right: 20px;
            bottom: unset;
        `;

        controlsContainer.appendChild(leftControls);
        controlsContainer.appendChild(jumpBtn);
        controlsContainer.appendChild(pauseBtn);
        
        document.body.appendChild(controlsContainer);
    }

    private createTouchButton(text: string, action: string): HTMLElement {
        const button = document.createElement('div');
        button.textContent = text;
        button.style.cssText = `
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.8);
            border: 2px solid #333;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #333;
            pointer-events: auto;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.1s;
        `;

        // Store reference
        this.touchControls.set(action, button);

        // Touch events for visual feedback and input
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.background = 'rgba(200, 200, 200, 0.9)';
            button.style.transform = 'scale(0.95)';
            
            if (action === 'left' || action === 'right' || action === 'jump') {
                this.inputs[action as keyof InputState] = true;
            } else if (action === 'pause' && this.onPauseCallback) {
                this.onPauseCallback();
            }
        }, { passive: false });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.background = 'rgba(255, 255, 255, 0.8)';
            button.style.transform = 'scale(1)';
            
            if (action === 'left' || action === 'right' || action === 'jump') {
                this.inputs[action as keyof InputState] = false;
            }
        }, { passive: false });

        // Handle touch cancel (when finger moves off button)
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            button.style.background = 'rgba(255, 255, 255, 0.8)';
            button.style.transform = 'scale(1)';
            
            if (action === 'left' || action === 'right' || action === 'jump') {
                this.inputs[action as keyof InputState] = false;
            }
        }, { passive: false });

        return button;
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
        const controls = document.getElementById('touch-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    public showTouchControls(): void {
        const controls = document.getElementById('touch-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }

    public isTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}