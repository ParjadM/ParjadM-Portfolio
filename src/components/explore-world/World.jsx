import React from 'react';
import { Sky } from '@react-three/drei';
import { Town } from './Town.jsx';
import { Player } from './Player.jsx';
import { FollowCamera } from './FollowCamera.jsx';
import { InteractionZone } from './InteractionZone.jsx';

/**
 * Full scene graph for Explore World.
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
      <color attach="background" args={['#b7d4ea']} />
      <fog attach="fog" args={['#c5dceb', 32, 62]} />
      <ambientLight intensity={0.48} />
      <directionalLight
        castShadow
        position={[14, 20, 10]}
        intensity={1.15}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <hemisphereLight args={['#dceeff', '#4a6b52', 0.42]} />
      <Sky sunPosition={[45, 24, 28]} turbidity={5} rayleigh={1.05} mieCoefficient={0.008} />

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
