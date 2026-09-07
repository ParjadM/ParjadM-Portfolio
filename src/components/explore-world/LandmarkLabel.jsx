import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';

/**
 * Stable landmark nameplate for Explore World.
 * Faces a fixed look-at point (default: town square) and draws a second
 * back-facing copy so the name stays readable from either approach without
 * billboard flipping as the camera moves.
 */
export function LandmarkLabel({
  children,
  position = [0, 0, 0],
  lookAt = [0, 0, 0],
  fontSize = 0.55,
  color = '#f8fafc',
  maxWidth = 6,
}) {
  const yaw = useMemo(() => {
    const dx = lookAt[0] - position[0];
    const dz = lookAt[2] - position[2];
    if (dx === 0 && dz === 0) return 0;
    return Math.atan2(dx, dz);
  }, [lookAt, position]);

  const textProps = {
    fontSize,
    color,
    anchorX: 'center',
    anchorY: 'middle',
    outlineWidth: 0.035,
    outlineColor: '#020617',
    maxWidth,
    textAlign: 'center',
  };

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <Text {...textProps}>{children}</Text>
      <Text {...textProps} rotation={[0, Math.PI, 0]}>{children}</Text>
    </group>
  );
}
