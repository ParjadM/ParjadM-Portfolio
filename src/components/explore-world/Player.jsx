import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { PLAYER_SPAWN } from '../../data/worldLocations.js';

const MOVE_SPEED = 5.5;
const RUN_SPEED = 9;
const TURN_SPEED = 2.4;

/**
 * Capsule player with keyboard movement (WASD / arrows + Shift run).
 * Rotation is yaw-only; physics body stays upright.
 */
export function Player({ onPositionChange, inputLocked = false }) {
  const bodyRef = useRef(null);
  const keysRef = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
  });
  const yawRef = useRef(0);
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
    body.setRotation({ x: 0, y: Math.sin(yawRef.current / 2), z: 0, w: Math.cos(yawRef.current / 2) }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

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
      enabledRotations={[false, true, false]}
      linearDamping={0.6}
      angularDamping={1}
      canSleep={false}
    >
      <CapsuleCollider args={[0.45, 0.35]} position={[0, 0.8, 0]} />
      <group>
        <mesh position={[0, 0.8, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.9, 6, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.45} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.45, 0.22]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
      </group>
    </RigidBody>
  );
}
