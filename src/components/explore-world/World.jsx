import React from 'react';
import { Sky } from '@react-three/drei';
import { Town } from './Town.jsx';
import { Player } from './Player.jsx';
import { FollowCamera } from './FollowCamera.jsx';
import { ProximityInteract } from './ProximityInteract.jsx';
import { ProjectsInterior } from './interiors/ProjectsInterior.jsx';
import { AREA_TOWN } from './exploreWorldScene.js';
import { getLocationById as getLandmark } from '../../data/worldLocations.js';

/**
 * Explore World scene graph — outdoor town or Projects Lab interior.
 */
export function World({
  area = AREA_TOWN,
  projects = [],
  playerPoseRef,
  teleportRequestRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
  cameraPreset = 'outdoor',
}) {
  const handlePositionChange = (pose) => {
    playerPoseRef.current = pose;
  };

  const projectsLab = getLandmark('projects');
  const labPos = projectsLab?.position || [12, 0, -2];

  return (
    <>
      {area === AREA_TOWN ? (
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
          <ProximityInteract
            position={[labPos[0], 0, labPos[2]]}
            radius={5.5}
            playerPoseRef={playerPoseRef}
            onPromptChange={onPromptChange}
            interactRequestedRef={interactRequestedRef}
            onInteract={onInteract}
            inputLocked={inputLocked}
            payload={{ type: 'enter-projects' }}
          />
        </>
      ) : (
        <ProjectsInterior
          projects={projects}
          playerPoseRef={playerPoseRef}
          onPromptChange={onPromptChange}
          interactRequestedRef={interactRequestedRef}
          onInteract={onInteract}
          inputLocked={inputLocked}
        />
      )}

      <Player
        onPositionChange={handlePositionChange}
        inputLocked={inputLocked}
        teleportRequestRef={teleportRequestRef}
      />
      <FollowCamera playerPoseRef={playerPoseRef} preset={cameraPreset} />
    </>
  );
}
