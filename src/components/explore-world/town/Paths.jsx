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

function SoftSquareEntry({ position }) {
  // Rounded collar softens spine → plaza joins (less wedge-like).
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.027, 0]} receiveShadow>
        <circleGeometry args={[1.55, 24]} />
        <meshStandardMaterial color={TOWN_COLORS.pathBorder} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]} receiveShadow>
        <circleGeometry args={[1.35, 24]} />
        <meshStandardMaterial {...TOWN_MAT.path} />
      </mesh>
    </group>
  );
}

/**
 * Narrow pedestrian paths with softened plaza entries.
 */
export function Paths() {
  return (
    <group>
      <PathStrip length={28} position={[0, 0, 0]} />
      <PathStrip length={28} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Soften cross entries into Town Square */}
      <SoftSquareEntry position={[0, 0, 4.6]} />
      <SoftSquareEntry position={[0, 0, -4.6]} />
      <SoftSquareEntry position={[4.6, 0, 0]} />
      <SoftSquareEntry position={[-4.6, 0, 0]} />

      {/* Orthogonal stubs — meet spines at T-junctions */}
      <PathStrip length={7.5} position={[6.2, 0, 10]} rotation={[0, Math.PI / 2, 0]} width={2.1} />
      <PathStrip length={3.6} position={[10, 0, 8.2]} width={2.1} />
      <SoftSquareEntry position={[2.2, 0, 10]} />

      <PathStrip length={4.5} position={[-4.2, 0, 6.5]} rotation={[0, Math.PI / 2, 0]} width={2.0} />
      <SoftSquareEntry position={[-2.2, 0, 6.5]} />
    </group>
  );
}
