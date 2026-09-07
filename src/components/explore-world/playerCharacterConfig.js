/** Configurable transforms and animation aliases for the Explore World player. */

export const PLAYER_MODEL_PATH = '/models/explore-world/player.glb';

export const PLAYER_MODEL_TRANSFORM = {
  scale: 1,
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
 */
export const PLAYER_ANIM_ALIASES = {
  idle: ['idle', 'standing idle', 'standing', 'stand'],
  walk: ['walk', 'walking', 'walk forward'],
  run: ['run', 'running', 'sprint'],
};
