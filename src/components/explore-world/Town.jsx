import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { WORLD_BOUNDS, WORLD_LOCATIONS } from '../../data/worldLocations.js';
import { Building } from './Building.jsx';
import { Paths } from './town/Paths.jsx';
import { TownSquare } from './town/TownSquare.jsx';
import { Rock, Shrub, StreetLamp, Tree } from './town/props.jsx';
import { TOWN_COLORS, TOWN_MAT } from './town/townPalette.js';

function BoundaryWalls() {
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

  return walls.map((wall, index) => (
    <RigidBody key={index} type="fixed" colliders={false} position={wall.position}>
      <CuboidCollider args={[wall.args[0] / 2, wall.args[1] / 2, wall.args[2] / 2]} />
      <mesh>
        <boxGeometry args={wall.args} />
        <meshStandardMaterial color={TOWN_COLORS.fence} transparent opacity={0.18} />
      </mesh>
    </RigidBody>
  ));
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

      <StreetLamp position={[8, 0, 0.5]} />
      <StreetLamp position={[-8, 0, 0.5]} />
      <StreetLamp position={[0.5, 0, 8]} />
      <StreetLamp position={[0.5, 0, -8]} />

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
      <RigidBody type="fixed" colliders={false} position={[0, -0.25, 0]}>
        <CuboidCollider args={[groundSize / 2, 0.25, groundSize / 2]} />
        <mesh receiveShadow>
          <boxGeometry args={[groundSize, 0.5, groundSize]} />
          <meshStandardMaterial {...TOWN_MAT.grass} />
        </mesh>
      </RigidBody>

      {/* Soft grass variation patches (visual only) */}
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
      <BoundaryWalls />

      {WORLD_LOCATIONS.map((location) => (
        <Building key={location.id} location={location} />
      ))}
    </group>
  );
}
