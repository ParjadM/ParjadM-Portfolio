import { getLocationById } from '../../data/worldLocations.js';

/** Explore World scene areas (Phase 4). */
export const AREA_TOWN = 'town';
export const AREA_PROJECTS = 'projects';

export const CAMERA_PRESETS = {
  outdoor: {
    offset: [0, 5.5, 10],
    lookOffset: [0, 0.95, 0],
  },
  // Interior third-person: wider than Phase 4B close-up, still shorter than outdoor.
  // Boom length stays inside entrance wall (~z+6) for spawn near z≈0.8 facing −Z.
  interior: {
    offset: [0, 2.9, 4.6],
    lookOffset: [0, 1.0, 0],
  },
};

/**
 * Spawn facing project displays (−Z) with open floor ahead and camera clearance
 * behind before the entrance wall at z≈+6.
 */
export const PROJECTS_INTERIOR_SPAWN = { x: 0, y: 1.2, z: 0.8, yaw: Math.PI };

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
