import { getLocationById } from '../../data/worldLocations.js';

/** Explore World scene areas (Phase 4). */
export const AREA_TOWN = 'town';
export const AREA_PROJECTS = 'projects';

export const CAMERA_PRESETS = {
  outdoor: {
    offset: [0, 5.5, 10],
    lookOffset: [0, 0.95, 0],
  },
  // Keep camera inside the lab: lower than ceiling (~4.2) and short enough
  // to stay in front of the entrance wall when facing into the room.
  interior: {
    offset: [0, 2.35, 3.6],
    lookOffset: [0, 0.95, 0],
  },
};

/**
 * Spawn inside the room with open space ahead (−Z) and enough room behind
 * for the interior camera (+Z) before the entrance wall at z≈+6.
 */
export const PROJECTS_INTERIOR_SPAWN = { x: 0, y: 1.2, z: 1.8, yaw: Math.PI };

/** Spawn outside Projects Lab door after exiting. */
export function getProjectsExteriorSpawn() {
  const lab = getLocationById('projects');
  const [x, , z] = lab?.position || [12, 0, -2];
  const [, , d] = lab?.size || [5, 3.4, 4];
  return {
    x,
    y: 1.2,
    z: z + d / 2 + 2.2,
    yaw: Math.PI,
  };
}

export const PROJECTS_API = '/api/projects?page=1&limit=4';
