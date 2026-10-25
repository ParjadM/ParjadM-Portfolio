import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Reusable proximity + E interaction (outdoor landmarks, stations, exits).
 * Prompt/interact are reported to the page shell — no per-feature key listeners.
 */
export function ProximityInteract({
  position = [0, 0, 0],
  radius = 2.4,
  enabled = true,
  playerPoseRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
  payload = null,
}) {
  const lastPrompt = useRef(false);

  useEffect(() => () => {
    onPromptChange?.(false, null);
  }, [onPromptChange]);

  useFrame(() => {
    if (!enabled || !playerPoseRef?.current) return;

    if (inputLocked) {
      if (interactRequestedRef) interactRequestedRef.current = false;
      if (lastPrompt.current) {
        lastPrompt.current = false;
        onPromptChange?.(false, null);
      }
      return;
    }

    const pose = playerPoseRef.current;
    const dx = pose.x - position[0];
    const dz = pose.z - position[2];
    const inRange = Math.hypot(dx, dz) <= radius;

    if (inRange !== lastPrompt.current) {
      lastPrompt.current = inRange;
      onPromptChange?.(inRange, inRange ? payload : null);
    }

    if (inRange && interactRequestedRef?.current) {
      interactRequestedRef.current = false;
      onInteract?.(payload);
    } else if (!inRange && interactRequestedRef) {
      interactRequestedRef.current = false;
    }
  });

  return null;
}
