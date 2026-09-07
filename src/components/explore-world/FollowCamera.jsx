import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Behind + above the player; pulled back so the character has breathing room. */
const OFFSET = new THREE.Vector3(0, 6.4, 12);
/** Look near chest height so the player sits mid-lower frame, not glued to the bottom edge. */
const LOOK_OFFSET = new THREE.Vector3(0, 0.85, 0);
const LERP = 5.2;

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
