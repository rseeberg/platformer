// Audio System Module

export class AudioSystem {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.warn('Audio not supported');
            this.enabled = false;
        }
    }

    public playJumpSound(): void {
        this.playSound(300, 0.1, 'square');
    }

    public playCoinSound(): void {
        this.playSound(800, 0.1, 'sine');
    }

    public playDeathSound(): void {
        this.playSound(200, 0.3, 'sawtooth');
    }

    public playVictorySound(): void {
        this.playSound(400, 0.5, 'triangle');
    }

    public playLevelCompleteSound(): void {
        // Play a simple melody
        this.playSound(523, 0.1, 'sine'); // C
        setTimeout(() => this.playSound(659, 0.1, 'sine'), 100); // E
        setTimeout(() => this.playSound(784, 0.2, 'sine'), 200); // G
    }

    private playSound(frequency: number, duration: number, type: OscillatorType = 'square'): void {
        if (!this.audioContext || !this.enabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            // Silently fail if audio playback fails
        }
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }
}