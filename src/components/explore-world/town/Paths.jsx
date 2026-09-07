import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';

const PATH_W = 4.2;
const BORDER = 0.35;

function PathStrip({ length, position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
        <planeGeometry args={[PATH_W + BORDER * 2, length]} />
        <meshStandardMaterial color={TOWN_COLORS.pathBorder} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[PATH_W, length]} />
        <meshStandardMaterial {...TOWN_MAT.path} />
      </mesh>
    </group>
  );
}

/**
 * Pedestrian paths connecting the six portfolio areas through the square.
 */
export function Paths() {
  return (
    <group>
      {/* N–S spine */}
      <PathStrip length={30} position={[0, 0, 0]} />
      {/* E–W spine */}
      <PathStrip length={30} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      {/* Diagonal connectors toward Skills / About corners */}
      <PathStrip length={14} position={[5.5, 0, 5.5]} rotation={[0, Math.PI / 4, 0]} />
      <PathStrip length={10} position={[-4.5, 0, 4.5]} rotation={[0, -Math.PI / 4, 0]} />
    </group>
  );
}
