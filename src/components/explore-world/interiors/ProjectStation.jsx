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
        <boxGeometry args={[1.25, 0.7, 0.95]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.28} />
      </mesh>
      <mesh position={[0, 1.35, -0.1]} castShadow>
        <boxGeometry args={[1.4, 0.98, 0.14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.35, -0.02]}>
        <boxGeometry args={[1.18, 0.78, 0.05]} />
        <meshStandardMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={0.55}
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow rotation={[0.4, 0.6, 0.2]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.28} metalness={0.6} transparent opacity={0.9} />
      </mesh>

      <Billboard position={[0, 2.45, 0]}>
        <Text
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          maxWidth={2.6}
          outlineWidth={0.02}
          outlineColor="#020617"
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
