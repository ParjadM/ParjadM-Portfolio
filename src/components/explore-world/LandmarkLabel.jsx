import React from 'react';
import { Billboard, Text } from '@react-three/drei';

/**
 * Landmark nameplate that always faces the camera (never mirrored).
 * Kept small so it identifies buildings without dominating the view.
 */
export function LandmarkLabel({
  children,
  position = [0, 0, 0],
  fontSize = 0.16,
  color = '#f1f5f9',
  maxWidth = 1.9,
}) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.012}
        outlineColor="#0f172a"
        maxWidth={maxWidth}
        textAlign="center"
        overflowWrap="break-word"
        depthOffset={-2}
      >
        {children}
      </Text>
    </Billboard>
  );
}
