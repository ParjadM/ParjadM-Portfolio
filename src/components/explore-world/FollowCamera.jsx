import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const OFFSET = new THREE.Vector3(0, 5.2, 8.5);
const LOOK_OFFSET = new THREE.Vector3(0, 1.1, 0);
const LERP = 6;

/**
 * Smooth third-person camera behind and above the player.
 * Reads player pose from a shared ref to avoid React re-renders each frame.
 */
export function FollowCamera({ playerPoseRef }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const offset = useRef(OFFSET.clone());

  useFrame((_, delta) => {
    const pose = playerPoseRef.current;
    if (!pose) return;

    const yaw = pose.yaw || 0;
    offset.current.set(
      Math.sin(yaw) * -OFFSET.z,
      OFFSET.y,
      Math.cos(yaw) * -OFFSET.z,
    );

    desired.current.set(pose.x, pose.y, pose.z).add(offset.current);
    lookAt.current.set(pose.x, pose.y, pose.z).add(LOOK_OFFSET);

    const t = 1 - Math.exp(-LERP * delta);
    camera.position.lerp(desired.current, t);
    camera.lookAt(lookAt.current);
  });

  return null;
}
