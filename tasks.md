# Platform Jumping Game - Development Tasks

## Overview
Building a simple platform jumping game using TypeScript and HTML5 Canvas, without any frameworks. Each phase produces a testable, playable result.

## Phase 1: Basic Setup & Movement ✅ Testable
**Goal**: Get a colored rectangle moving on screen with keyboard controls

### Tasks
- [ ] Create `index.html` with canvas element
- [ ] Set up `tsconfig.json` for TypeScript compilation
- [ ] Create `src/game.ts` with basic game loop
- [ ] Implement player rectangle rendering
- [ ] Add keyboard input handling (left/right arrows)
- [ ] Implement horizontal movement

**Test**: Open index.html, see a rectangle that moves left/right with arrow keys

---

## Phase 2: Gravity & Jumping ✅ Testable
**Goal**: Add physics to make the player fall and jump

### Tasks
- [ ] Add velocity properties to player
- [ ] Implement gravity (constant downward acceleration)
- [ ] Add ground/floor collision
- [ ] Implement jump mechanics (spacebar)
- [ ] Add jump velocity and prevent double-jumping
- [ ] Fine-tune physics values for good game feel

**Test**: Player falls to ground, can jump with spacebar, feels responsive

---

## Phase 3: Basic Platforms ✅ Testable
**Goal**: Add platforms the player can jump on

### Tasks
- [ ] Create Platform class/interface
- [ ] Add array of platform objects
- [ ] Render platforms on screen
- [ ] Implement AABB collision detection
- [ ] Handle platform-player collisions
- [ ] Allow jumping from platforms
- [ ] Position platforms at different heights

**Test**: Player can jump between multiple platforms

---

## Phase 4: Goal & Win Condition ✅ Testable
**Goal**: Add an objective to reach

### Tasks
- [ ] Create goal area/platform (visually distinct)
- [ ] Position goal at top of level
- [ ] Detect when player reaches goal
- [ ] Display "You Win!" message
- [ ] Add restart functionality (R key)
- [ ] Create simple level layout

**Test**: Complete game loop - reach goal, see win message, restart

---

## Phase 5: Camera & Larger Level ✅ Testable
**Goal**: Add camera following for bigger levels

### Tasks
- [ ] Implement camera offset system
- [ ] Make camera follow player vertically
- [ ] Add smooth camera movement
- [ ] Create taller level with more platforms
- [ ] Ensure UI elements stay in place
- [ ] Add bounds checking

**Test**: Camera follows player smoothly as they climb

---

## Phase 6: Visual Polish ✅ Testable
**Goal**: Make the game look better

### Tasks
- [ ] Add colors to platforms
- [ ] Create player sprite/animation
- [ ] Add background gradient
- [ ] Implement simple particle effects for jumping
- [ ] Add visual feedback for goal
- [ ] Style the canvas and page

**Test**: Game looks polished and provides visual feedback

---

## Phase 7: Game Features ✅ Testable
**Goal**: Add gameplay elements

### Tasks
- [ ] Add timer/score system
- [ ] Implement death/respawn (falling off screen)
- [ ] Create multiple levels
- [ ] Add moving platforms
- [ ] Implement collectibles/coins
- [ ] Add sound effects (optional)

**Test**: Full-featured platformer with progression

---

## Phase 8: Code Organization & Optimization
**Goal**: Clean up and optimize code

### Tasks
- [ ] Refactor into multiple TypeScript modules
- [ ] Add proper TypeScript types/interfaces
- [ ] Optimize collision detection
- [ ] Add game state management
- [ ] Implement proper game loop timing
- [ ] Add build/minification process

**Test**: Code is maintainable, game runs smoothly

---

## Development Commands

```bash
# Compile TypeScript (watch mode)
tsc --watch

# Or compile once
tsc

# Open game (after compilation)
# Just open index.html in your browser
```

## Technical Notes

- **No frameworks**: Pure TypeScript/JavaScript only
- **Browser compatibility**: Modern browsers with ES6 support
- **Canvas size**: 800x600px default
- **Target FPS**: 60fps using requestAnimationFrame
- **Physics**: Simple velocity-based movement with gravity

## Current Phase
**Starting with Phase 1**