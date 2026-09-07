import React from 'react';
import { Sky } from '@react-three/drei';
import { Town } from './Town.jsx';
import { Player } from './Player.jsx';
import { FollowCamera } from './FollowCamera.jsx';
import { InteractionZone } from './InteractionZone.jsx';

/**
 * Full scene graph for Explore World Phase 1.
 */
export function World({
  playerPoseRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
}) {
  const handlePositionChange = (pose) => {
    playerPoseRef.current = pose;
  };

  return (
    <>
      <color attach="background" args={['#87b5d9']} />
      <fog attach="fog" args={['#9ec5e0', 28, 55]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[12, 18, 8]}
        intensity={1.05}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight args={['#bfdbfe', '#1a3a2f', 0.35]} />
      <Sky sunPosition={[40, 20, 30]} turbidity={6} rayleigh={1.2} mieCoefficient={0.01} />

      <Town />
      <Player onPositionChange={handlePositionChange} inputLocked={inputLocked} />
      <FollowCamera playerPoseRef={playerPoseRef} />
      <InteractionZone
        locationId="projects"
        playerPoseRef={playerPoseRef}
        onPromptChange={onPromptChange}
        interactRequestedRef={interactRequestedRef}
        onInteract={onInteract}
        inputLocked={inputLocked}
      />
    </>
  );
}
