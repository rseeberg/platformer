# TypeScript Platformer Game 🎮

A complete 2D platformer game built with TypeScript and HTML5 Canvas, featuring 3 challenging levels, moving platforms, particle effects, and Web Audio API sound system.

## 🌟 Features

### Core Gameplay
- **Smooth Physics Engine**: Custom gravity, friction, and jump mechanics with AABB collision detection
- **Responsive Controls**: Arrow keys or WASD for movement, Space/Up for jumping
- **Camera System**: Smooth-following camera for large multi-screen levels
- **Lives & Respawn**: 3-life system with checkpoint respawning

### 3 Unique Levels
1. **Tutorial Valley**: Introduction level with basic platforming
2. **Mountain Climb**: Moving platforms essential for crossing large gaps
3. **Sky Fortress**: Expert challenge with vertical elevators and synchronized timing

### Advanced Features
- **Moving Platforms**: Both horizontal and vertical platforms with directional indicators
- **Collectible System**: Animated coins with particle collection effects (20+ per level)
- **Sound System**: Web Audio API with jump, coin, death, and victory sounds
- **Particle Effects**: Jump trails, coin sparkles, and death explosions
- **Game States**: Playing, paused, game over, level complete, and victory screens
- **Statistics**: Timer, score, best times (stored locally), coins collected, deaths

### Visual Polish
- **Smooth Animations**: Player squash/stretch, rotating coins, pulsing goal
- **Dynamic Camera**: Follows player with smooth interpolation
- **UI Overlay**: Real-time stats with semi-transparent backgrounds
- **Gradient Backgrounds**: Color-coded level themes

## 🎮 How to Play

### Controls
- **Movement**: Arrow Keys or WASD
- **Jump**: Space or Up Arrow
- **Pause**: ESC key
- **Restart**: R key (restart entire game)

### Objective
1. Navigate through 3 increasingly challenging levels
2. Collect coins for points and best score
3. Use moving platforms to cross gaps and reach higher areas
4. Avoid falling off the screen (costs a life)
5. Reach the golden "GOAL" block to complete each level

### Tips
- Red platforms with arrows are moving platforms that will carry you
- Purple platforms move vertically - use them as elevators
- Time your jumps carefully on moving platforms
- Collect all coins for maximum score and bragging rights

## 🚀 Quick Start

### Play Online
**[🎮 Play the Game](https://yourusername.github.io/platformer)** *(GitHub Pages - Coming Soon)*

### Local Development

#### Prerequisites
- Node.js (v14+)
- Modern web browser with ES6 module support

#### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/platformer.git
cd platformer

# Install dependencies
npm install

# Build and serve
npm run dev
```

The game will be available at `http://localhost:8080`

#### Development Commands
```bash
npm run build      # Compile TypeScript
npm run watch      # Watch mode for development
npm run serve      # Start HTTP server
npm run dev        # Build + serve (recommended)
```

## 🏗️ Architecture

### Modular Design
The codebase is organized into focused modules for maintainability:

```
src/
├── game.ts          # Main game orchestrator
├── types.ts         # TypeScript interfaces and enums
├── physics.ts       # Physics engine & collision detection
├── renderer.ts      # All rendering logic with camera system
├── input.ts         # Keyboard input handling
├── particles.ts     # Particle effect system
├── audio.ts         # Web Audio API wrapper
└── levels.ts        # Level definitions and management
```

### Key Systems
- **Physics Engine**: Custom AABB collision with moving platform support
- **Rendering Pipeline**: Canvas 2D with camera transforms and layered rendering
- **State Management**: Comprehensive game states (PLAYING, PAUSED, DEAD, etc.)
- **Audio System**: Web Audio API with procedurally generated sounds
- **Level System**: Data-driven level definitions with progressive difficulty

## 🛠️ Technical Details

- **Language**: TypeScript with ES6 modules
- **Rendering**: HTML5 Canvas 2D Context
- **Audio**: Web Audio API (no external audio files)
- **Storage**: LocalStorage for best times persistence
- **Architecture**: Modular design with dependency injection
- **Build System**: TypeScript compiler with npm scripts
- **Serving**: http-server for proper CORS and module loading

### Browser Requirements
- ES6 module support
- HTML5 Canvas 2D Context
- Web Audio API
- LocalStorage
- RequestAnimationFrame

### Performance
- 60 FPS target framerate
- Efficient collision detection with early exits
- Particle system with automatic cleanup
- Camera culling for off-screen elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Test thoroughly across different browsers
5. Submit a pull request

## 📄 License

MIT License - feel free to use this code for learning or your own projects!