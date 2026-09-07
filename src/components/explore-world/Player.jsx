import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { PLAYER_SPAWN } from '../../data/worldLocations.js';

const MOVE_SPEED = 5.5;
const RUN_SPEED = 9;
const TURN_SPEED = 2.4;
const VISUAL_TURN_LERP = 14;

/**
 * Capsule player with keyboard movement (WASD / arrows + Shift run).
 * Physics body stays upright; a visible mesh yaw-smoothes to face movement.
 */
export function Player({ onPositionChange, inputLocked = false }) {
  const bodyRef = useRef(null);
  const visualRef = useRef(null);
  const keysRef = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
  });
  const yawRef = useRef(0);
  const visualYawRef = useRef(0);
  const tmpVec = useRef(new THREE.Vector3());
  const lastReport = useRef(0);

  useEffect(() => {
    const setKey = (code, pressed) => {
      const keys = keysRef.current;
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = pressed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.back = pressed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = pressed;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = pressed;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.run = pressed;
          break;
        default:
          break;
      }
    };

    const onDown = (e) => {
      if (e.repeat) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      setKey(e.code, true);
    };
    const onUp = (e) => setKey(e.code, false);
    const onBlur = () => {
      keysRef.current = {
        forward: false,
        back: false,
        left: false,
        right: false,
        run: false,
      };
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const keys = keysRef.current;
    const linvel = body.linvel();
    const move = tmpVec.current;
    move.set(0, 0, 0);

    if (!inputLocked) {
      if (keys.left) yawRef.current += TURN_SPEED * delta;
      if (keys.right) yawRef.current -= TURN_SPEED * delta;

      const speed = keys.run ? RUN_SPEED : MOVE_SPEED;
      let forward = 0;
      if (keys.forward) forward += 1;
      if (keys.back) forward -= 1;

      if (forward !== 0) {
        move.set(Math.sin(yawRef.current) * forward, 0, Math.cos(yawRef.current) * forward);
        move.normalize().multiplyScalar(speed);
      }
    }

    body.setLinvel({ x: move.x, y: linvel.y, z: move.z }, true);
    // Keep the rigid body upright; facing is applied on the visual mesh.
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    // Smooth visual yaw so left/right turns and direction changes read clearly.
    let targetVisualYaw = yawRef.current;
    if (!inputLocked && keys.back && !keys.forward) {
      // Walking backward: face the reverse heading so the "nose" still leads the motion.
      targetVisualYaw = yawRef.current + Math.PI;
    }
    const turnT = 1 - Math.exp(-VISUAL_TURN_LERP * delta);
    let deltaYaw = targetVisualYaw - visualYawRef.current;
    deltaYaw = ((deltaYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
    visualYawRef.current += deltaYaw * turnT;

    if (visualRef.current) {
      visualRef.current.rotation.y = visualYawRef.current;
    }

    const t = performance.now();
    if (onPositionChange && t - lastReport.current > 80) {
      lastReport.current = t;
      const p = body.translation();
      onPositionChange({ x: p.x, y: p.y, z: p.z, yaw: yawRef.current });
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={PLAYER_SPAWN}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={0.6}
      angularDamping={1}
      canSleep={false}
      lockRotations
    >
      <CapsuleCollider args={[0.45, 0.35]} position={[0, 0.8, 0]} />
      <group ref={visualRef}>
        {/* Body */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.9, 6, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Head — slight forward bias */}
        <mesh position={[0, 1.48, 0.08]} castShadow>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        {/* Chest plate facing cue */}
        <mesh position={[0, 1.05, 0.34]} castShadow>
          <boxGeometry args={[0.44, 0.38, 0.14]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.35} metalness={0.15} />
        </mesh>
        {/* Nose / forward cue — local +Z is forward */}
        <mesh position={[0, 1.42, 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.13, 0.4, 8]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.4} />
        </mesh>
        {/* Overhead arrow — visible while follow-camera yaw is catching up */}
        <mesh position={[0, 1.95, 0.15]} rotation={[Math.PI / 2, 0, Math.PI]} castShadow>
          <coneGeometry args={[0.2, 0.48, 3]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.4}
            roughness={0.35}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
