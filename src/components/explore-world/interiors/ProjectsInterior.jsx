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
      {/* Floor — brighter for readability */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.2, 0]}>
        <CuboidCollider args={[w / 2, 0.2, d / 2]} />
        <mesh receiveShadow>
          <boxGeometry args={[w, 0.4, d]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} metalness={0.06} />
        </mesh>
      </RigidBody>

      {/* Implied ceiling: perimeter soffit only — keeps third-person camera free */}
      {[
        [0, h - 0.15, -d / 2 + 0.4, w, 0.3, 0.8],
        [0, h - 0.15, d / 2 - 0.4, w, 0.3, 0.8],
        [-w / 2 + 0.4, h - 0.15, 0, 0.8, 0.3, d - 1.6],
        [w / 2 - 0.4, h - 0.15, 0, 0.8, 0.3, d - 1.6],
      ].map((args, i) => (
        <mesh key={`soffit-${i}`} position={[args[0], args[1], args[2]]}>
          <boxGeometry args={[args[3], args[4], args[5]]} />
          <meshStandardMaterial color="#64748b" roughness={0.75} metalness={0.1} />
        </mesh>
      ))}

      {/* Walls — slightly lighter materials; collisions unchanged */}
      {[
        { pos: [0, h / 2, -d / 2], args: [w, h, t] },
        { pos: [-w / 2, h / 2, 0], args: [t, h, d] },
        { pos: [w / 2, h / 2, 0], args: [t, h, d] },
        { pos: [-w / 4 - 1.2, h / 2, d / 2], args: [w / 2 - 1.6, h, t] },
        { pos: [w / 4 + 1.2, h / 2, d / 2], args: [w / 2 - 1.6, h, t] },
        { pos: [0, h * 0.75, d / 2], args: [2.6, h / 2, t] },
      ].map((wall, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={wall.pos}>
          <CuboidCollider args={[wall.args[0] / 2, wall.args[1] / 2, wall.args[2] / 2]} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={wall.args} />
            <meshStandardMaterial color="#6b7a8f" roughness={0.65} metalness={0.1} />
          </mesh>
        </RigidBody>
      ))}

      {/* Door frame */}
      <mesh position={[0, 1.3, d / 2 - 0.05]}>
        <boxGeometry args={[2.4, 2.6, 0.12]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

function LabProps() {
  return (
    <group>
      <mesh position={[-6.2, 0.6, -4.5]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.6]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[6.2, 0.45, -4.2]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.9, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.45} metalness={0.3} />
      </mesh>
      {/* Overhead light panels (emissive fill) */}
      <mesh position={[0, 3.85, -1.5]}>
        <boxGeometry args={[4, 0.08, 1.2]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#f8fafc" emissiveIntensity={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.85, 2]}>
        <boxGeometry args={[4, 0.08, 1.2]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#f8fafc" emissiveIntensity={0.45} roughness={0.4} />
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
      <color attach="background" args={['#8fa3b8']} />
      <fog attach="fog" args={['#9aadc0', 22, 40]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight args={['#e8eef6', '#5a6575', 0.55]} />
      <directionalLight
        castShadow
        position={[3, 7, 4]}
        intensity={0.95}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={24}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 3.4, 0]} intensity={1.15} distance={20} color="#f1f5f9" />
      <pointLight position={[-4, 3.0, -2]} intensity={0.55} distance={12} color="#dbeafe" />
      <pointLight position={[4, 3.0, -2]} intensity={0.55} distance={12} color="#dbeafe" />

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
