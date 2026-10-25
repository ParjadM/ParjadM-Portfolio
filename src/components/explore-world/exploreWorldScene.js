import { getLocationById } from '../../data/worldLocations.js';

/** Explore World scene areas (Phase 4). */
export const AREA_TOWN = 'town';
export const AREA_PROJECTS = 'projects';

export const CAMERA_PRESETS = {
  outdoor: {
    offset: [0, 5.5, 10],
    lookOffset: [0, 0.95, 0],
  },
  interior: {
    offset: [0, 3.6, 6.2],
    lookOffset: [0, 0.9, 0],
  },
};

/** Spawn just inside the Projects Lab entrance (facing into the room, −Z). */
export const PROJECTS_INTERIOR_SPAWN = { x: 0, y: 1.2, z: 5.2, yaw: Math.PI };

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
