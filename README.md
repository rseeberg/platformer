# Platform Jumping Game

A simple browser-based platform jumping game built with TypeScript and HTML5 Canvas, without any external frameworks.

## Current Status: Phase 1 - Basic Movement ✅

The game currently implements basic horizontal movement with a player rectangle that can be controlled using the keyboard.

### Features Implemented
- **Game Loop**: Smooth 60fps rendering using `requestAnimationFrame`
- **Player Character**: Blue rectangle (50x50px) that represents the player
- **Keyboard Controls**: Arrow keys for left/right movement
- **Boundary Detection**: Player cannot move outside the canvas boundaries
- **Visual Feedback**: Clean rendering with a light gray background

## How to Play

1. Open `index.html` in a modern web browser
2. Use the **Left Arrow** and **Right Arrow** keys to move the player horizontally

## Project Structure

```
platformer/
├── src/
│   └── game.ts         # Main game logic in TypeScript
├── dist/
│   ├── game.js         # Compiled JavaScript
│   └── game.js.map     # Source map for debugging
├── index.html          # Game canvas and HTML structure
├── tsconfig.json       # TypeScript configuration
├── tasks.md            # Development roadmap and tasks
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Development Setup

### Prerequisites
- Node.js and npm installed
- A modern web browser

### Installation
```bash
# Install TypeScript compiler
npm install

# Compile TypeScript to JavaScript
npx tsc

# Or watch for changes during development
npx tsc --watch
```

### Running the Game
Simply open `index.html` in your web browser after compilation.

## Technical Details

- **Language**: TypeScript (compiled to JavaScript)
- **Rendering**: HTML5 Canvas 2D Context
- **Canvas Size**: 800x600 pixels
- **Frame Rate**: 60 FPS
- **No External Dependencies**: Pure TypeScript/JavaScript implementation

## Next Steps (Phase 2)

The next phase will add:
- Gravity system
- Jumping mechanics
- Ground collision
- Physics-based movement

See `tasks.md` for the complete development roadmap.

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES2020 JavaScript
- RequestAnimationFrame API