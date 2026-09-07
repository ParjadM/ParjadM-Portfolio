/** Configurable transforms and animation aliases for the Explore World player. */

export const PLAYER_MODEL_PATH = '/models/explore-world/player.glb';

/**
 * Tuned for public/models/explore-world/player.glb
 * - Character mesh feet sit near y≈0; platform disc extends slightly below and is ignored for footing.
 * - Eyes sit on +Z, matching Player forward (yaw 0 → +Z).
 * - Scale 1.25 reads as adult-sized vs roads/buildings without retuning the Rapier capsule.
 */
export const PLAYER_MODEL_TRANSFORM = {
  scale: 1.25,
  /** Vertical/world offset relative to the physics body origin. */
  position: [0, 0, 0],
  /** Euler rotation offset in radians (model-facing correction). */
  rotation: [0, 0, 0],
};

/** Crossfade duration when switching Idle / Walk / Run. */
export const PLAYER_ANIM_FADE = 0.28;

/**
 * Flexible name matching for common Mixamo / custom clip names.
 * Matching is case-insensitive substring / equality against clip names.
 * Prefer exact names from this model's clips first: Idle, Walk, Run.
 */
export const PLAYER_ANIM_ALIASES = {
  idle: ['Idle', 'idle', 'standing idle', 'standing', 'stand'],
  walk: ['Walk', 'walk', 'walking', 'walk forward'],
  run: ['Run', 'run', 'running', 'sprint'],
};
