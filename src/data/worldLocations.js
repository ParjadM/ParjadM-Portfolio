/** Data-driven landmarks for Explore World. */

export const WORLD_BOUNDS = {
  halfSize: 28,
  wallHeight: 4,
  wallThickness: 1,
};

export const PLAYER_SPAWN = [0, 1.2, 4];

export const WORLD_LOCATIONS = [
  {
    id: 'projects',
    titleKey: 'exploreWorld.locations.projects',
    type: 'projects',
    position: [12, 0, -2],
    size: [5, 3.4, 4],
    color: '#38bdf8',
    route: '/projects',
    interactive: true,
  },
  {
    id: 'blog',
    titleKey: 'exploreWorld.locations.blog',
    type: 'blog',
    position: [-12, 0, -2],
    size: [4.6, 3.5, 4],
    color: '#34d399',
    route: '/blog',
    interactive: false,
  },
  {
    id: 'experience',
    titleKey: 'exploreWorld.locations.experience',
    type: 'experience',
    position: [0, 0, -14],
    size: [5, 3.8, 4],
    color: '#a78bfa',
    route: '/about',
    interactive: false,
  },
  {
    id: 'education',
    titleKey: 'exploreWorld.locations.education',
    type: 'education',
    position: [0, 0, 14],
    size: [5.2, 3.6, 4.2],
    color: '#fbbf24',
    route: '/about',
    interactive: false,
  },
  {
    id: 'skills',
    titleKey: 'exploreWorld.locations.skills',
    type: 'skills',
    position: [10, 0, 10],
    size: [4.2, 3.0, 3.8],
    color: '#fb7185',
    route: '/about',
    interactive: false,
  },
  {
    // Compact pavilion near the square — About is the town hub identity.
    id: 'about',
    titleKey: 'exploreWorld.locations.about',
    type: 'about',
    position: [-6.5, 0, 6.5],
    size: [3.2, 2.4, 3.2],
    color: '#94a3b8',
    route: '/about',
    interactive: false,
  },
];

export function getLocationById(id) {
  return WORLD_LOCATIONS.find((loc) => loc.id === id) || null;
}
