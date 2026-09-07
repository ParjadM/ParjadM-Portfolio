import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useTranslation } from 'react-i18next';
import { LandmarkLabel } from './LandmarkLabel.jsx';
import {
  AboutPavilionVisual,
  BlogLibraryVisual,
  EducationCampusVisual,
  ExperienceOfficeVisual,
  ProjectsLabVisual,
  SkillsWorkshopVisual,
} from './town/buildings.jsx';

const VISUALS = {
  projects: ProjectsLabVisual,
  blog: BlogLibraryVisual,
  experience: ExperienceOfficeVisual,
  education: EducationCampusVisual,
  skills: SkillsWorkshopVisual,
  about: AboutPavilionVisual,
};

/**
 * Landmark building: Rapier collider + distinct low-poly visual + billboard label.
 */
export function Building({ location }) {
  const { t } = useTranslation();
  const [w, h, d] = location.size;
  const [x, , z] = location.position;
  const label = t(location.titleKey);
  const Visual = VISUALS[location.id] || VISUALS[location.type] || ProjectsLabVisual;

  // Collider stays a simple box matching gameplay footprint (visual may overhang slightly).
  const colliderH = Math.max(h * 0.85, 2.2);

  return (
    <group position={[x, 0, z]}>
      <RigidBody type="fixed" colliders={false} position={[0, colliderH / 2, 0]}>
        <CuboidCollider args={[w / 2, colliderH / 2, d / 2]} />
      </RigidBody>

      <Visual size={location.size} />

      <LandmarkLabel position={[0, Math.max(h, colliderH) + 0.55, 0]}>
        {label}
      </LandmarkLabel>
    </group>
  );
}
