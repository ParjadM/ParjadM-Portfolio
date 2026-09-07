import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_PRESETS } from './exploreWorldScene.js';

const POSITION_LERP = 5.2;
const YAW_LERP = 3.4;
const PRESET_LERP = 4.2;

function shortestAngleDelta(from, to) {
  let delta = to - from;
  delta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI;
  return delta;
}

/**
 * Smooth third-person camera with outdoor / interior framing presets.
 */
export function FollowCamera({ playerPoseRef, preset = 'outdoor' }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const cameraYawRef = useRef(0);
  const yawReady = useRef(false);
  const offsetRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.outdoor.offset));
  const lookOffsetRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.outdoor.lookOffset));
  const targetOffset = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const pose = playerPoseRef.current;
    if (!pose) return;

    const cfg = CAMERA_PRESETS[preset] || CAMERA_PRESETS.outdoor;
    targetOffset.current.set(...cfg.offset);
    targetLook.current.set(...cfg.lookOffset);
    const pt = 1 - Math.exp(-PRESET_LERP * delta);
    offsetRef.current.lerp(targetOffset.current, pt);
    lookOffsetRef.current.lerp(targetLook.current, pt);

    if (!yawReady.current) {
      cameraYawRef.current = pose.yaw || 0;
      yawReady.current = true;
    } else {
      const yawT = 1 - Math.exp(-YAW_LERP * delta);
      cameraYawRef.current += shortestAngleDelta(cameraYawRef.current, pose.yaw || 0) * yawT;
    }

    const yaw = cameraYawRef.current;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const oz = offsetRef.current.z;
    desired.current.set(
      pose.x + Math.sin(yaw) * -(oz) + Math.cos(yaw) * ox,
      pose.y + oy,
      pose.z + Math.cos(yaw) * -(oz) + Math.sin(yaw) * ox,
    );
    lookAt.current.set(
      pose.x + lookOffsetRef.current.x,
      pose.y + lookOffsetRef.current.y,
      pose.z + lookOffsetRef.current.z,
    );

    const t = 1 - Math.exp(-POSITION_LERP * delta);
    camera.position.lerp(desired.current, t);
    camera.lookAt(lookAt.current);
  });

  return null;
}
