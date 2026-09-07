/** Data-driven landmarks for Explore World (Phase 1 placeholders). */

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
    size: [5, 3.2, 4],
    color: '#38bdf8',
    route: '/projects',
    interactive: true,
  },
  {
    id: 'blog',
    titleKey: 'exploreWorld.locations.blog',
    type: 'blog',
    position: [-12, 0, -2],
    size: [4.5, 3.4, 4],
    color: '#34d399',
    route: '/blog',
    interactive: false,
  },
  {
    id: 'experience',
    titleKey: 'exploreWorld.locations.experience',
    type: 'experience',
    position: [0, 0, -14],
    size: [5, 3.6, 4],
    color: '#a78bfa',
    route: '/about',
    interactive: false,
  },
  {
    id: 'education',
    titleKey: 'exploreWorld.locations.education',
    type: 'education',
    position: [0, 0, 14],
    size: [5.2, 3.2, 4.2],
    color: '#fbbf24',
    route: '/about',
    interactive: false,
  },
  {
    id: 'skills',
    titleKey: 'exploreWorld.locations.skills',
    type: 'skills',
    position: [10, 0, 10],
    size: [4, 2.8, 3.6],
    color: '#fb7185',
    route: '/about',
    interactive: false,
  },
  {
    id: 'about',
    titleKey: 'exploreWorld.locations.about',
    type: 'about',
    position: [-10, 0, 10],
    size: [4.2, 2.6, 3.8],
    color: '#94a3b8',
    route: '/about',
    interactive: false,
  },
];

export function getLocationById(id) {
  return WORLD_LOCATIONS.find((loc) => loc.id === id) || null;
}
