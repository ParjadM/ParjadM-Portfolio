import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useTranslation } from 'react-i18next';
import { LandmarkLabel } from './LandmarkLabel.jsx';

/**
 * Placeholder building: box + roof + floating label + fixed collider.
 */
export function Building({ location }) {
  const { t } = useTranslation();
  const [w, h, d] = location.size;
  const [x, , z] = location.position;
  const label = t(location.titleKey);
  const roofY = h + 0.35;

  const materialProps = useMemo(
    () => ({ color: location.color, roughness: 0.55, metalness: 0.08 }),
    [location.color],
  );

  return (
    <group position={[x, 0, z]}>
      <RigidBody type="fixed" colliders={false} position={[0, h / 2, 0]}>
        <CuboidCollider args={[w / 2, h / 2, d / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </RigidBody>

      <mesh position={[0, roofY, 0]} castShadow>
        <boxGeometry args={[w * 1.08, 0.35, d * 1.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.05} />
      </mesh>

      <LandmarkLabel position={[0, h + 1.35, 0]} lookAt={[-x, h + 1.35, -z]}>
        {label}
      </LandmarkLabel>
    </group>
  );
}
