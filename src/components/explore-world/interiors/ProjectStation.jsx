import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { ProximityInteract } from '../ProximityInteract.jsx';

/**
 * Single featured-project display station (visual + box collider + proximity).
 */
export function ProjectStation({
  project,
  position = [0, 0, 0],
  rotationY = 0,
  playerPoseRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
}) {
  const title = project?.title || 'Project';
  const interactWorld = [
    position[0] + Math.sin(rotationY) * 1.15,
    0,
    position[2] + Math.cos(rotationY) * 1.15,
  ];

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RigidBody type="fixed" colliders={false} position={[0, 1.1, 0]}>
        <CuboidCollider args={[0.9, 1.1, 0.55]} />
      </RigidBody>

      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#3d4654" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.35, -0.1]} castShadow>
        <boxGeometry args={[1.35, 0.95, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.35, -0.02]}>
        <boxGeometry args={[1.15, 0.75, 0.05]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow rotation={[0.4, 0.6, 0.2]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.55} transparent opacity={0.85} />
      </mesh>

      <Billboard position={[0, 2.4, 0]}>
        <Text
          fontSize={0.14}
          color="#f8fafc"
          anchorX="center"
          anchorY="bottom"
          maxWidth={2.2}
          outlineWidth={0.01}
          outlineColor="#0f172a"
        >
          {title}
        </Text>
      </Billboard>

      <ProximityInteract
        position={interactWorld}
        radius={2.2}
        playerPoseRef={playerPoseRef}
        onPromptChange={onPromptChange}
        interactRequestedRef={interactRequestedRef}
        onInteract={onInteract}
        inputLocked={inputLocked}
        payload={{ type: 'project', project }}
      />
    </group>
  );
}
