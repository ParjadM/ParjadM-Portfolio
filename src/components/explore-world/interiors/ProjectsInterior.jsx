import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { ProjectStation } from './ProjectStation.jsx';
import { ProximityInteract } from '../ProximityInteract.jsx';

const ROOM = { w: 16, d: 12, h: 4.2 };

function RoomShell() {
  const { w, d, h } = ROOM;
  const t = 0.35;
  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.2, 0]}>
        <CuboidCollider args={[w / 2, 0.2, d / 2]} />
        <mesh receiveShadow>
          <boxGeometry args={[w, 0.4, d]} />
          <meshStandardMaterial color="#2a3340" roughness={0.85} metalness={0.08} />
        </mesh>
      </RigidBody>

      {/* Ceiling */}
      <mesh position={[0, h, 0]} receiveShadow>
        <boxGeometry args={[w, 0.25, d]} />
        <meshStandardMaterial color="#1a222c" roughness={0.9} />
      </mesh>

      {/* Walls */}
      {[
        { pos: [0, h / 2, -d / 2], args: [w, h, t] },
        { pos: [-w / 2, h / 2, 0], args: [t, h, d] },
        { pos: [w / 2, h / 2, 0], args: [t, h, d] },
        // Back wall with doorway gap handled as two segments
        { pos: [-w / 4 - 1.2, h / 2, d / 2], args: [w / 2 - 1.6, h, t] },
        { pos: [w / 4 + 1.2, h / 2, d / 2], args: [w / 2 - 1.6, h, t] },
        { pos: [0, h * 0.75, d / 2], args: [2.6, h / 2, t] },
      ].map((wall, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={wall.pos}>
          <CuboidCollider args={[wall.args[0] / 2, wall.args[1] / 2, wall.args[2] / 2]} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={wall.args} />
            <meshStandardMaterial color="#3b4555" roughness={0.7} metalness={0.12} />
          </mesh>
        </RigidBody>
      ))}

      {/* Door frame */}
      <mesh position={[0, 1.3, d / 2 - 0.05]}>
        <boxGeometry args={[2.4, 2.6, 0.12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

function LabProps() {
  return (
    <group>
      <mesh position={[-6.2, 0.6, -4.5]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.6]} />
        <meshStandardMaterial color="#475569" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[6.2, 0.45, -4.2]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.9, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[3.5, 0.12, 0.8]} />
        <meshStandardMaterial color="#94a3b8" emissive="#38bdf8" emissiveIntensity={0.15} roughness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Small modern Projects Lab interior with featured project stations.
 */
export function ProjectsInterior({
  projects = [],
  playerPoseRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
}) {
  const stations = [
    { project: projects[0], position: [-4.5, 0, -3.2], rotationY: 0.25 },
    { project: projects[1], position: [4.5, 0, -3.2], rotationY: -0.25 },
    { project: projects[2], position: [-4.2, 0, 1.5], rotationY: Math.PI / 2 },
    { project: projects[3], position: [4.2, 0, 1.5], rotationY: -Math.PI / 2 },
  ].filter((s) => s.project);

  return (
    <group>
      <color attach="background" args={['#141a22']} />
      <fog attach="fog" args={['#141a22', 14, 28]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[4, 8, 3]}
        intensity={0.85}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 3.2, 0]} intensity={0.55} distance={18} color="#dbeafe" />

      <RoomShell />
      <LabProps />

      {stations.map((station) => (
        <ProjectStation
          key={station.project.id || station.project.title}
          project={station.project}
          position={station.position}
          rotationY={station.rotationY}
          playerPoseRef={playerPoseRef}
          onPromptChange={onPromptChange}
          interactRequestedRef={interactRequestedRef}
          onInteract={onInteract}
          inputLocked={inputLocked}
        />
      ))}

      <ProximityInteract
        position={[0, 0, ROOM.d / 2 - 1.2]}
        radius={2.4}
        playerPoseRef={playerPoseRef}
        onPromptChange={onPromptChange}
        interactRequestedRef={interactRequestedRef}
        onInteract={onInteract}
        inputLocked={inputLocked}
        payload={{ type: 'exit-projects' }}
      />
    </group>
  );
}
