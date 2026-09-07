import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getLocationById } from '../../data/worldLocations.js';

const INTERACT_RADIUS = 4.5;

/**
 * Detects proximity to a landmark and reports prompt / interact events.
 * Interaction itself is handled outside the canvas (HTML overlay).
 */
export function InteractionZone({
  locationId = 'projects',
  playerPoseRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
}) {
  const location = getLocationById(locationId);
  const inRangeRef = useRef(false);
  const lastPrompt = useRef(false);

  useEffect(() => () => {
    onPromptChange?.(false);
  }, [onPromptChange]);

  useFrame(() => {
    if (!location || !playerPoseRef.current) return;
    if (inputLocked) {
      if (interactRequestedRef) interactRequestedRef.current = false;
      if (lastPrompt.current) {
        lastPrompt.current = false;
        inRangeRef.current = false;
        onPromptChange?.(false);
      }
      return;
    }

    const pose = playerPoseRef.current;
    const [lx, , lz] = location.position;
    const dx = pose.x - lx;
    const dz = pose.z - lz;
    const dist = Math.hypot(dx, dz);
    const inRange = dist <= INTERACT_RADIUS;

    if (inRange !== lastPrompt.current) {
      lastPrompt.current = inRange;
      inRangeRef.current = inRange;
      onPromptChange?.(inRange);
    }

    if (inRange && interactRequestedRef?.current) {
      interactRequestedRef.current = false;
      onInteract?.(location);
    } else if (!inRange && interactRequestedRef) {
      interactRequestedRef.current = false;
    }
  });

  return null;
}
