import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';

const PATH_W = 2.35;
const BORDER = 0.22;

function PathStrip({ length, position, rotation = [0, 0, 0], width = PATH_W }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
        <planeGeometry args={[width + BORDER * 2, length]} />
        <meshStandardMaterial color={TOWN_COLORS.pathBorder} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial {...TOWN_MAT.path} />
      </mesh>
    </group>
  );
}

/**
 * Narrow pedestrian paths — cross spines plus short orthogonal stubs
 * (no wide diagonal spokes that form large triangles).
 */
export function Paths() {
  return (
    <group>
      {/* N–S spine to Education / Experience */}
      <PathStrip length={28} position={[0, 0, 0]} />
      {/* E–W spine to Projects / Blog */}
      <PathStrip length={28} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Short branch toward Skills Workshop */}
      <PathStrip length={8} position={[6, 0, 10]} rotation={[0, Math.PI / 2, 0]} width={2.1} />
      <PathStrip length={4} position={[10, 0, 8]} width={2.1} />

      {/* Short branch toward About pavilion */}
      <PathStrip length={5} position={[-4, 0, 6.5]} rotation={[0, Math.PI / 2, 0]} width={2.0} />
    </group>
  );
}
