import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { World } from './World.jsx';

function LoadingFallback({ label }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 text-slate-100">
      <div className="text-center px-6">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-500 border-t-emerald-400" />
        <p className="text-sm font-medium tracking-wide">{label}</p>
      </div>
    </div>
  );
}

/**
 * Lazy-friendly canvas host. Keeps Rapier/Three isolated from the rest of the app shell.
 */
export function WorldCanvas({
  loadingLabel,
  playerPoseRef,
  onPromptChange,
  interactRequestedRef,
  onInteract,
  inputLocked = false,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) {
    return <LoadingFallback label={loadingLabel} />;
  }

  return (
    <div className="absolute inset-0">
      <Suspense fallback={<LoadingFallback label={loadingLabel} />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ fov: 50, near: 0.1, far: 120, position: [0, 6, 12] }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#87b5d9');
          }}
        >
          <Physics gravity={[0, -18, 0]} timeStep="vary">
            <World
              playerPoseRef={playerPoseRef}
              onPromptChange={onPromptChange}
              interactRequestedRef={interactRequestedRef}
              onInteract={onInteract}
              inputLocked={inputLocked}
            />
          </Physics>
        </Canvas>
      </Suspense>
    </div>
  );
}
