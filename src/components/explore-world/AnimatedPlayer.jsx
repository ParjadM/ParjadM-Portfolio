import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import {
  PLAYER_ANIM_ALIASES,
  PLAYER_ANIM_FADE,
  PLAYER_MODEL_PATH,
  PLAYER_MODEL_TRANSFORM,
} from './playerCharacterConfig.js';

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

/**
 * Resolve an AnimationAction from a clip map using flexible aliases.
 * Returns null when no matching clip exists (fail soft).
 */
export function resolveAnimationAction(actions, aliases) {
  if (!actions || !aliases?.length) return null;
  const entries = Object.entries(actions).filter(([, action]) => action);
  if (!entries.length) return null;

  for (const alias of aliases) {
    const needle = normalizeName(alias);
    const exact = entries.find(([name]) => normalizeName(name) === needle);
    if (exact) return exact[1];
  }

  for (const alias of aliases) {
    const needle = normalizeName(alias);
    const partial = entries.find(([name]) => normalizeName(name).includes(needle));
    if (partial) return partial[1];
  }

  return null;
}

function PlaceholderCharacter() {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.9, 6, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.48, 0.08]} castShadow>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, 0.34]} castShadow>
        <boxGeometry args={[0.44, 0.38, 0.14]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.35} metalness={0.15} />
      </mesh>
    </group>
  );
}

/**
 * GLB-backed visual with Idle / Walk / Run crossfades.
 * Animation selection is driven by moveStateRef (no React state per frame).
 */
function GltfPlayerCharacter({ moveStateRef }) {
  const group = useRef(null);
  const { scene, animations } = useGLTF(PLAYER_MODEL_PATH);
  const { actions } = useAnimations(animations, group);
  const currentStateRef = useRef(null);
  const actionMapRef = useRef({ idle: null, walk: null, run: null });

  useEffect(() => {
    actionMapRef.current = {
      idle: resolveAnimationAction(actions, PLAYER_ANIM_ALIASES.idle),
      walk: resolveAnimationAction(actions, PLAYER_ANIM_ALIASES.walk),
      run: resolveAnimationAction(actions, PLAYER_ANIM_ALIASES.run),
    };

    const idle = actionMapRef.current.idle;
    if (idle) {
      idle.reset().fadeIn(PLAYER_ANIM_FADE).play();
      currentStateRef.current = 'idle';
    }

    return () => {
      Object.values(actionMapRef.current).forEach((action) => {
        action?.fadeOut(0);
        action?.stop();
      });
      currentStateRef.current = null;
    };
  }, [actions]);

  useFrame(() => {
    const move = moveStateRef?.current;
    let next = 'idle';
    if (move?.moving) next = move.running ? 'run' : 'walk';

    if (next === currentStateRef.current) return;

    const map = actionMapRef.current;
    const nextAction = map[next] || map.idle;
    const prevAction = currentStateRef.current
      ? map[currentStateRef.current]
      : null;

    if (!nextAction) {
      currentStateRef.current = next;
      return;
    }

    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(PLAYER_ANIM_FADE);
    }
    nextAction.reset().fadeIn(PLAYER_ANIM_FADE).play();
    currentStateRef.current = next;
  });

  const { scale, position, rotation } = PLAYER_MODEL_TRANSFORM;

  return (
    <group ref={group} scale={scale} position={position} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Visual player character: GLB when available, otherwise capsule placeholder.
 * Parent (Player) owns physics; this component never adds colliders.
 */
export function AnimatedPlayer({ moveStateRef }) {
  const [modelStatus, setModelStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const mark = (ok) => {
      if (!cancelled) setModelStatus(ok ? 'ready' : 'missing');
    };

    fetch(PLAYER_MODEL_PATH, { method: 'HEAD', signal: controller.signal })
      .then((res) => {
        if (res.ok) {
          mark(true);
          return null;
        }
        // Some static hosts reject HEAD — fall back to a lightweight GET probe.
        if (res.status === 405 || res.status === 501) {
          return fetch(PLAYER_MODEL_PATH, {
            method: 'GET',
            headers: { Range: 'bytes=0-0' },
            signal: controller.signal,
          }).then((getRes) => mark(getRes.ok || getRes.status === 206));
        }
        mark(false);
        return null;
      })
      .catch(() => mark(false));

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (modelStatus !== 'ready') {
    return <PlaceholderCharacter />;
  }

  return (
    <Suspense fallback={<PlaceholderCharacter />}>
      <GltfPlayerCharacter moveStateRef={moveStateRef} />
    </Suspense>
  );
}
