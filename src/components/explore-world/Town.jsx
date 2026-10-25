import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { WORLD_BOUNDS, WORLD_LOCATIONS } from '../../data/worldLocations.js';
import { Building } from './Building.jsx';
import { Paths } from './town/Paths.jsx';
import { TownSquare } from './town/TownSquare.jsx';
import { Rock, Shrub, StreetLamp, Tree } from './town/props.jsx';
import { TOWN_COLORS, TOWN_MAT } from './town/townPalette.js';

function BoundaryColliders() {
  const { halfSize, wallHeight, wallThickness } = WORLD_BOUNDS;
  const mid = halfSize;
  const walls = useMemo(
    () => [
      { position: [0, wallHeight / 2, -mid], args: [mid * 2 + wallThickness, wallHeight, wallThickness] },
      { position: [0, wallHeight / 2, mid], args: [mid * 2 + wallThickness, wallHeight, wallThickness] },
      { position: [-mid, wallHeight / 2, 0], args: [wallThickness, wallHeight, mid * 2] },
      { position: [mid, wallHeight / 2, 0], args: [wallThickness, wallHeight, mid * 2] },
    ],
    [halfSize, mid, wallHeight, wallThickness],
  );

  // Gameplay boundary only — no prototype wall mesh.
  return walls.map((wall, index) => (
    <RigidBody key={index} type="fixed" colliders={false} position={wall.position}>
      <CuboidCollider args={[wall.args[0] / 2, wall.args[1] / 2, wall.args[2] / 2]} />
    </RigidBody>
  ));
}

/** Soft distant hills / horizon — visual only, outside playable area. */
function DistantHorizon() {
  const r = WORLD_BOUNDS.halfSize + 6;
  const hills = [
    { pos: [0, 1.2, -r], scale: [22, 3.2, 6] },
    { pos: [18, 0.9, -r + 2], scale: [12, 2.4, 5] },
    { pos: [-16, 1.0, -r + 1], scale: [14, 2.8, 5] },
    { pos: [r, 1.1, 4], scale: [6, 3.0, 18] },
    { pos: [-r, 1.0, -2], scale: [6, 2.6, 16] },
    { pos: [8, 0.85, r], scale: [16, 2.2, 5] },
    { pos: [-10, 0.95, r], scale: [14, 2.5, 5] },
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[r + 10, 48]} />
        <meshStandardMaterial color="#4a6d55" roughness={0.97} />
      </mesh>
      {hills.map((hill, i) => (
        <mesh key={i} position={hill.pos} scale={hill.scale} castShadow={false}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#5a7d66' : '#4f705c'}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function EnvironmentProps() {
  return (
    <group>
      <Tree position={[16, 0, 6]} scale={1.1} />
      <Tree position={[15, 0, -8]} scale={0.95} />
      <Tree position={[-16, 0, 4]} scale={1.05} />
      <Tree position={[-14, 0, -9]} scale={0.9} />
      <Tree position={[7, 0, 16]} scale={1} />
      <Tree position={[-8, 0, 16]} scale={1.05} />
      <Tree position={[8, 0, -16]} scale={0.95} />
      <Tree position={[-7, 0, -16]} scale={1} />

      <Shrub position={[9, 0.2, -5]} />
      <Shrub position={[-9, 0.2, -6]} scale={1.1} />
      <Shrub position={[4, 0.2, 11]} />
      <Shrub position={[-3, 0.2, -11]} scale={0.9} />

      {/* Sparse path lamps — not every junction */}
      <StreetLamp position={[7.5, 0, 0]} />
      <StreetLamp position={[-7.5, 0, 0]} />

      <Rock position={[18, 0.1, -3]} scale={1.2} />
      <Rock position={[-17, 0.1, 8]} scale={0.9} />
      <Rock position={[3, 0.1, 18]} />
    </group>
  );
}

/**
 * Stylized RPG portfolio town: ground, paths, square, landmarks, light props.
 */
export function Town() {
  const groundSize = WORLD_BOUNDS.halfSize * 2;

  return (
    <group>
      <DistantHorizon />

      <RigidBody type="fixed" colliders={false} position={[0, -0.25, 0]}>
        <CuboidCollider args={[groundSize / 2, 0.25, groundSize / 2]} />
        <mesh receiveShadow>
          <boxGeometry args={[groundSize, 0.5, groundSize]} />
          <meshStandardMaterial {...TOWN_MAT.grass} />
        </mesh>
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.01, 16]} receiveShadow>
        <circleGeometry args={[4, 16]} />
        <meshStandardMaterial color={TOWN_COLORS.grassDeep} roughness={0.96} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, 0.01, -14]} receiveShadow>
        <circleGeometry args={[5, 16]} />
        <meshStandardMaterial color={TOWN_COLORS.grassDeep} roughness={0.96} />
      </mesh>

      <Paths />
      <TownSquare />
      <EnvironmentProps />
      <BoundaryColliders />

      {WORLD_LOCATIONS.map((location) => (
        <Building key={location.id} location={location} />
      ))}
    </group>
  );
}
