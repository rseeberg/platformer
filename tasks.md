# Platform Jumping Game - Development Tasks

## Overview
Building a simple platform jumping game using TypeScript and HTML5 Canvas, without any frameworks. Each phase produces a testable, playable result.

## Phase 1: Basic Setup & Movement ✅ Testable
**Goal**: Get a colored rectangle moving on screen with keyboard controls

### Tasks
- [x] Create `index.html` with canvas element
- [x] Set up `tsconfig.json` for TypeScript compilation
- [x] Create `src/game.ts` with basic game loop
- [x] Implement player rectangle rendering
- [x] Add keyboard input handling (left/right arrows)
- [x] Implement horizontal movement

**Test**: Open index.html, see a rectangle that moves left/right with arrow keys

---

## Phase 2: Gravity & Jumping ✅ Testable
**Goal**: Add physics to make the player fall and jump

### Tasks
- [x] Add velocity properties to player
- [x] Implement gravity (constant downward acceleration)
- [x] Add ground/floor collision
- [x] Implement jump mechanics (spacebar)
- [x] Add jump velocity and prevent double-jumping
- [x] Fine-tune physics values for good game feel

**Test**: Player falls to ground, can jump with spacebar, feels responsive

---

## Phase 3: Basic Platforms ✅ Testable
**Goal**: Add platforms the player can jump on

### Tasks
- [x] Create Platform class/interface
- [x] Add array of platform objects
- [x] Render platforms on screen
- [x] Implement AABB collision detection
- [x] Handle platform-player collisions
- [x] Allow jumping from platforms
- [x] Position platforms at different heights

**Test**: Player can jump between multiple platforms

---

## Phase 4: Goal & Win Condition ✅ Testable
**Goal**: Add an objective to reach

### Tasks
- [x] Create goal area/platform (visually distinct)
- [x] Position goal at top of level
- [x] Detect when player reaches goal
- [x] Display "You Win!" message
- [x] Add restart functionality (R key)
- [x] Create simple level layout

**Test**: Complete game loop - reach goal, see win message, restart

---

## Phase 5: Camera & Larger Level ✅ Testable
**Goal**: Add camera following for bigger levels

### Tasks
- [x] Implement camera offset system
- [x] Make camera follow player vertically
- [x] Add smooth camera movement
- [x] Create taller level with more platforms
- [x] Ensure UI elements stay in place
- [x] Add bounds checking

**Test**: Camera follows player smoothly as they climb

---

## Phase 6: Visual Polish ✅ Testable
**Goal**: Make the game look better

### Tasks
- [x] Add colors to platforms
- [x] Create player sprite/animation
- [x] Add background gradient
- [x] Implement simple particle effects for jumping
- [x] Add visual feedback for goal
- [x] Style the canvas and page

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
**Completed Phase 6 - Ready for Phase 7: Game Features**