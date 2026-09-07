import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { PLAYER_SPAWN } from '../../data/worldLocations.js';
import { AnimatedPlayer } from './AnimatedPlayer.jsx';

const MOVE_SPEED = 5.5;
const RUN_SPEED = 9;
const TURN_SPEED = 2.4;
const VISUAL_TURN_LERP = 14;

/**
 * Rapier physics controller for Explore World.
 * Visual character (GLB or placeholder) is a child — no visual colliders.
 *
 * Architecture:
 *   RigidBody
 *   ├── CapsuleCollider
 *   └── visual yaw group
 *        └── AnimatedPlayer (model + Idle/Walk/Run)
 */
export function Player({ onPositionChange, inputLocked = false, teleportRequestRef }) {
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
  const moveStateRef = useRef({ moving: false, running: false });

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

    const teleport = teleportRequestRef?.current;
    if (teleport) {
      body.setTranslation({ x: teleport.x, y: teleport.y, z: teleport.z }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      yawRef.current = teleport.yaw ?? 0;
      visualYawRef.current = yawRef.current;
      if (visualRef.current) visualRef.current.rotation.y = visualYawRef.current;
      teleportRequestRef.current = null;
      if (onPositionChange) {
        onPositionChange({
          x: teleport.x,
          y: teleport.y,
          z: teleport.z,
          yaw: yawRef.current,
        });
      }
      return;
    }

    const keys = keysRef.current;
    const linvel = body.linvel();
    const move = tmpVec.current;
    move.set(0, 0, 0);
    let forward = 0;

    if (!inputLocked) {
      if (keys.left) yawRef.current += TURN_SPEED * delta;
      if (keys.right) yawRef.current -= TURN_SPEED * delta;

      const speed = keys.run ? RUN_SPEED : MOVE_SPEED;
      if (keys.forward) forward += 1;
      if (keys.back) forward -= 1;

      if (forward !== 0) {
        move.set(Math.sin(yawRef.current) * forward, 0, Math.cos(yawRef.current) * forward);
        move.normalize().multiplyScalar(speed);
      }
    }

    moveStateRef.current.moving = forward !== 0 && !inputLocked;
    moveStateRef.current.running = moveStateRef.current.moving && keys.run;

    body.setLinvel({ x: move.x, y: linvel.y, z: move.z }, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    let targetVisualYaw = yawRef.current;
    if (!inputLocked && keys.back && !keys.forward) {
      targetVisualYaw = yawRef.current + Math.PI;
    }
    const turnT = 1 - Math.exp(-VISUAL_TURN_LERP * delta);
    let deltaYaw = targetVisualYaw - visualYawRef.current;
    deltaYaw = ((deltaYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
    visualYawRef.current += deltaYaw * turnT;

    if (visualRef.current) {
      visualRef.current.rotation.y = visualYawRef.current;
    }

    if (onPositionChange) {
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
        <AnimatedPlayer moveStateRef={moveStateRef} />
      </group>
    </RigidBody>
  );
}
