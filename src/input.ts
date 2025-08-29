// Input Handler Module

import { InputState } from './types.js';

export class InputHandler {
    private inputs: InputState;
    private onResetCallback?: () => void;
    private onPauseCallback?: () => void;
    private onNextLevelCallback?: () => void;

    constructor() {
        this.inputs = {
            left: false,
            right: false,
            jump: false
        };
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
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
}