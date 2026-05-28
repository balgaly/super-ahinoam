# SUPER AHINOAM

Career-as-platformer. Side-scrolling resume game.

## Status: P0+P1 (scaffold + physics calibration)

Placeholder rectangles, no sprites yet. Goal of this build: judge feel.
If physics not 85%+ Mario-like, kill the project.

## Run

```
pnpm install
pnpm dev
```

Or with npm: `npm install && npm run dev`. Opens on http://localhost:5173.

## Controls

- Arrows: move
- Space: jump (hold for higher)
- Shift: run

## Physics tuning knobs

All in `src/scenes/World1Scene.ts` top of file:

- `WALK_MAX` / `RUN_MAX` — top speeds
- `WALK_ACCEL` / `AIR_ACCEL` — how fast to reach top speed
- `GROUND_DRAG` — friction on stop
- `JUMP_VEL` — initial impulse
- `JUMP_HOLD_BOOST` / `JUMP_HOLD_FRAMES` — variable-jump (hold space = higher)
- `COYOTE_FRAMES` — grace frames after walking off ledge
- `JUMP_BUFFER_FRAMES` — grace frames for early jump press

Tune these by gut feel. Real SMB1 ballpark: walk 25 px/frame, run 40 px/frame, jump apex 4 tiles for short / 5.5 tiles for full hold.
