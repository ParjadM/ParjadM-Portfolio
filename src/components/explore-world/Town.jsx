import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { WORLD_BOUNDS, WORLD_LOCATIONS } from '../../data/worldLocations.js';
import { Building } from './Building.jsx';

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
        <meshStandardMaterial color="#1e293b" transparent opacity={0.25} />
      </mesh>
    </RigidBody>
  ));
}

function Paths() {
  // Cross roads through town square — simple flat planes, no colliders.
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[4.5, 30]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
        <planeGeometry args={[30, 4.5]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[3.2, 24]} />
        <meshStandardMaterial color="#64748b" roughness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Ground, paths, buildings, and world bounds.
 */
export function Town() {
  const groundSize = WORLD_BOUNDS.halfSize * 2;

  return (
    <group>
      <RigidBody type="fixed" colliders={false} position={[0, -0.25, 0]}>
        <CuboidCollider args={[groundSize / 2, 0.25, groundSize / 2]} />
        <mesh receiveShadow>
          <boxGeometry args={[groundSize, 0.5, groundSize]} />
          <meshStandardMaterial color="#1a3a2f" roughness={0.95} />
        </mesh>
      </RigidBody>

      <Paths />
      <BoundaryWalls />

      {WORLD_LOCATIONS.map((location) => (
        <Building key={location.id} location={location} />
      ))}
    </group>
  );
}
