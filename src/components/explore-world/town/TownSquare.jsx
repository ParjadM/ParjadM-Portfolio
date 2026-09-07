import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';
import { Bench, Planter, StreetLamp, Tree } from './props.jsx';

function PlazaRing() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]} receiveShadow>
        <circleGeometry args={[5.1, 40]} />
        <meshStandardMaterial color={TOWN_COLORS.plazaBorder} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[4.65, 40]} />
        <meshStandardMaterial {...TOWN_MAT.plaza} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]} receiveShadow>
        <ringGeometry args={[1.55, 1.72, 32]} />
        <meshStandardMaterial color={TOWN_COLORS.stone} roughness={0.75} metalness={0.1} />
      </mesh>
    </group>
  );
}

/**
 * Compact abstract code/data sculpture — brackets + stacked nodes.
 * Intentional software motif without flashy scale.
 */
function CodeSculpture() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.22, 8]} />
        <meshStandardMaterial {...TOWN_MAT.stone} />
      </mesh>

      {/* Left / right "angle brackets" */}
      <mesh position={[-0.55, 0.85, 0]} castShadow rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.14, 1.15, 0.35]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[0.55, 0.85, 0]} castShadow rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.14, 1.15, 0.35]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.4} metalness={0.45} />
      </mesh>

      {/* Stacked data nodes */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.55, 0.18, 0.55]} />
        <meshStandardMaterial color={TOWN_COLORS.glassDark} roughness={0.3} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.42, 0.18, 0.42]} />
        <meshStandardMaterial color={TOWN_COLORS.glass} roughness={0.25} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.3, 0.18, 0.3]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={TOWN_COLORS.copper} roughness={0.35} metalness={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Central town square: plaza, sculpture, seating, lamps, planters.
 */
export function TownSquare() {
  return (
    <group>
      <PlazaRing />
      <CodeSculpture />

      <Bench position={[-2.6, 0, 1.8]} rotation={[0, 0.35, 0]} />
      <Bench position={[2.6, 0, 1.8]} rotation={[0, -0.35, 0]} />
      <Bench position={[0, 0, -2.9]} />

      {/* Two lamps only — quieter square */}
      <StreetLamp position={[-3.4, 0, -2.6]} />
      <StreetLamp position={[3.4, 0, -2.6]} />

      <Planter position={[-4.0, 0, 0.2]} />
      <Planter position={[4.0, 0, 0.2]} />
      <Planter position={[0, 0, 4.0]} scale={0.9} />

      <Tree position={[-6.0, 0, -5.0]} scale={0.95} />
      <Tree position={[6.0, 0, -5.0]} scale={1.0} />
    </group>
  );
}
