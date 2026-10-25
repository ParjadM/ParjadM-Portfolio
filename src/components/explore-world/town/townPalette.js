/** Shared stylized palette for Explore World Phase 3 town. */

export const TOWN_COLORS = {
  grass: '#3f6b4e',
  grassDeep: '#355a42',
  path: '#c4b5a0',
  pathBorder: '#a89078',
  plaza: '#d6cfc3',
  plazaBorder: '#b8a996',
  stone: '#8b919a',
  stoneDark: '#5c6570',
  wood: '#8b5e3c',
  woodLight: '#b07a4f',
  leaf: '#4f8f5a',
  leafDark: '#3a6e44',
  glass: '#9fd4e8',
  glassDark: '#6bb0c9',
  white: '#f2efe8',
  cream: '#ebe4d6',
  charcoal: '#2f3640',
  warmRoof: '#7a4e3a',
  coolRoof: '#4a5563',
  copper: '#b87333',
  lamp: '#e8d5a3',
  fence: '#6b7280',
};

export const TOWN_MAT = {
  grass: { color: TOWN_COLORS.grass, roughness: 0.95, metalness: 0.02 },
  path: { color: TOWN_COLORS.path, roughness: 0.88, metalness: 0.04 },
  plaza: { color: TOWN_COLORS.plaza, roughness: 0.82, metalness: 0.05 },
  stone: { color: TOWN_COLORS.stone, roughness: 0.78, metalness: 0.08 },
  wood: { color: TOWN_COLORS.wood, roughness: 0.85, metalness: 0.04 },
  leaf: { color: TOWN_COLORS.leaf, roughness: 0.9, metalness: 0.02 },
  glass: { color: TOWN_COLORS.glass, roughness: 0.2, metalness: 0.55, transparent: true, opacity: 0.72 },
};
