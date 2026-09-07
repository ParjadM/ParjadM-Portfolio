import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';
import { Bench, Planter, StreetLamp, Tree } from './props.jsx';

function PlazaRing() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]} receiveShadow>
        <circleGeometry args={[5.4, 40]} />
        <meshStandardMaterial color={TOWN_COLORS.plazaBorder} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[4.9, 40]} />
        <meshStandardMaterial {...TOWN_MAT.plaza} />
      </mesh>
      {/* Inner accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]} receiveShadow>
        <ringGeometry args={[2.2, 2.45, 32]} />
        <meshStandardMaterial color={TOWN_COLORS.stone} roughness={0.75} metalness={0.1} />
      </mesh>
    </group>
  );
}

/** Geometric code-inspired monument / fountain core. */
function CodeMonument() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.25, 0.36, 8]} />
        <meshStandardMaterial {...TOWN_MAT.stone} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.7, 1.1, 0.7]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={TOWN_COLORS.glassDark} roughness={0.25} metalness={0.6} />
      </mesh>
      {/* Soft "fountain" discs */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 24]} />
        <meshStandardMaterial color={TOWN_COLORS.glass} transparent opacity={0.55} roughness={0.15} metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Central town square: plaza, monument, seating, lamps, planters.
 */
export function TownSquare() {
  return (
    <group>
      <PlazaRing />
      <CodeMonument />

      <Bench position={[-2.8, 0, 1.6]} rotation={[0, 0.4, 0]} />
      <Bench position={[2.8, 0, 1.6]} rotation={[0, -0.4, 0]} />
      <Bench position={[0, 0, -3.1]} rotation={[0, 0, 0]} />

      <StreetLamp position={[-3.6, 0, -2.8]} />
      <StreetLamp position={[3.6, 0, -2.8]} />
      <StreetLamp position={[-3.6, 0, 2.8]} />
      <StreetLamp position={[3.6, 0, 2.8]} />

      <Planter position={[-4.2, 0, 0]} />
      <Planter position={[4.2, 0, 0]} />
      <Planter position={[0, 0, 4.2]} scale={0.9} />
      <Planter position={[0, 0, -4.2]} scale={0.9} />

      <Tree position={[-6.2, 0, -5.2]} scale={0.95} />
      <Tree position={[6.2, 0, -5.2]} scale={1.05} />
      <Tree position={[-5.8, 0, 6.5]} scale={0.9} />
    </group>
  );
}
