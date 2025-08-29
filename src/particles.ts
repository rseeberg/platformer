// Particle System Module

import { Particle } from './types.js';

export class ParticleSystem {
    private particles: Particle[] = [];

    constructor() {}

    public createJumpParticles(x: number, y: number): void {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -2,
                life: 1,
                color: '#AED6F1',
                size: Math.random() * 4 + 2
            });
        }
    }

    public createCoinParticles(x: number, y: number): void {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: '#F1C40F',
                size: Math.random() * 3 + 2
            });
        }
    }

    public createDeathParticles(x: number, y: number): void {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: '#E74C3C',
                size: Math.random() * 5 + 3
            });
        }
    }

    public update(): void {
        // Filter out dead particles
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Update remaining particles
        for (const particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.vx *= 0.98; // Friction
            particle.life -= 0.02;
            particle.size *= 0.98;
        }
    }

    public render(ctx: CanvasRenderingContext2D, cameraY: number): void {
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2 - cameraY,
                particle.size,
                particle.size
            );
        }
        ctx.globalAlpha = 1;
    }

    public clear(): void {
        this.particles = [];
    }

    public getParticles(): Particle[] {
        return this.particles;
    }
}