import React from 'react';
import { Billboard, Text } from '@react-three/drei';

/**
 * Landmark nameplate that always faces the camera (never mirrored).
 */
export function LandmarkLabel({
  children,
  position = [0, 0, 0],
  fontSize = 0.55,
  color = '#f8fafc',
  maxWidth = 6,
}) {
  return (
    <Billboard position={position}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.035}
        outlineColor="#020617"
        maxWidth={maxWidth}
        textAlign="center"
      >
        {children}
      </Text>
    </Billboard>
  );
}
