import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';

/** Low-poly tree: trunk + stacked foliage. */
export function Tree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.1, 6]} />
        <meshStandardMaterial {...TOWN_MAT.wood} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.75, 1.1, 7]} />
        <meshStandardMaterial color={TOWN_COLORS.leafDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[0.55, 0.9, 7]} />
        <meshStandardMaterial {...TOWN_MAT.leaf} />
      </mesh>
    </group>
  );
}

export function Shrub({ position = [0, 0, 0], scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial {...TOWN_MAT.leaf} />
    </mesh>
  );
}

export function Bench({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.08, 0.4]} />
        <meshStandardMaterial {...TOWN_MAT.wood} />
      </mesh>
      <mesh position={[0, 0.45, -0.16]} castShadow>
        <boxGeometry args={[1.2, 0.28, 0.08]} />
        <meshStandardMaterial color={TOWN_COLORS.woodLight} roughness={0.85} />
      </mesh>
      <mesh position={[-0.45, 0.14, 0]} castShadow>
        <boxGeometry args={[0.08, 0.28, 0.36]} />
        <meshStandardMaterial color={TOWN_COLORS.stoneDark} roughness={0.8} />
      </mesh>
      <mesh position={[0.45, 0.14, 0]} castShadow>
        <boxGeometry args={[0.08, 0.28, 0.36]} />
        <meshStandardMaterial color={TOWN_COLORS.stoneDark} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function StreetLamp({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.2, 6]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.35]} />
        <meshStandardMaterial color={TOWN_COLORS.stoneDark} roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.12, 0]}>
        <boxGeometry args={[0.28, 0.16, 0.28]} />
        <meshStandardMaterial color={TOWN_COLORS.lamp} emissive={TOWN_COLORS.lamp} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Planter({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.44, 0.7]} />
        <meshStandardMaterial {...TOWN_MAT.stone} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial {...TOWN_MAT.leaf} />
      </mesh>
    </group>
  );
}

export function Rock({ position = [0, 0, 0], scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow rotation={[0.2, 0.4, 0.1]}>
      <dodecahedronGeometry args={[0.28, 0]} />
      <meshStandardMaterial color={TOWN_COLORS.stoneDark} roughness={0.92} metalness={0.05} />
    </mesh>
  );
}
