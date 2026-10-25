import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Behind + above the player; pulled back so the character has breathing room. */
const OFFSET = new THREE.Vector3(0, 6.4, 12);
/** Look near chest height so the player sits mid-lower frame, not glued to the bottom edge. */
const LOOK_OFFSET = new THREE.Vector3(0, 0.85, 0);
const POSITION_LERP = 5.2;
/** Slower than player turn so the mesh rotates on-screen before the camera catches up. */
const YAW_LERP = 3.4;

function shortestAngleDelta(from, to) {
  let delta = to - from;
  delta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI;
  return delta;
}

/**
 * Smooth third-person camera behind and above the player.
 * Reads player pose from a shared ref to avoid React re-renders each frame.
 */
export function FollowCamera({ playerPoseRef }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const cameraYawRef = useRef(0);
  const yawReady = useRef(false);

  useFrame((_, delta) => {
    const pose = playerPoseRef.current;
    if (!pose) return;

    if (!yawReady.current) {
      cameraYawRef.current = pose.yaw || 0;
      yawReady.current = true;
    } else {
      const yawT = 1 - Math.exp(-YAW_LERP * delta);
      cameraYawRef.current += shortestAngleDelta(cameraYawRef.current, pose.yaw || 0) * yawT;
    }

    const yaw = cameraYawRef.current;
    desired.current.set(
      pose.x + Math.sin(yaw) * -OFFSET.z,
      pose.y + OFFSET.y,
      pose.z + Math.cos(yaw) * -OFFSET.z,
    );
    lookAt.current.set(pose.x, pose.y, pose.z).add(LOOK_OFFSET);

    const t = 1 - Math.exp(-POSITION_LERP * delta);
    camera.position.lerp(desired.current, t);
    camera.lookAt(lookAt.current);
  });

  return null;
}
