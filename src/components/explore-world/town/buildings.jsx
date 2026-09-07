import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';

function FlatRoof({ w, d, y, color = TOWN_COLORS.coolRoof, thickness = 0.22 }) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <boxGeometry args={[w * 1.06, thickness, d * 1.06]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.08} />
    </mesh>
  );
}

/** Adult-height door (~2.0) so the player does not look miniature. */
function Door({ position, color = TOWN_COLORS.charcoal, w = 0.85, h = 2.0 }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.04]} />
        <meshStandardMaterial color={TOWN_COLORS.stoneDark} roughness={0.7} />
      </mesh>
    </group>
  );
}

function WindowPane({ position, w = 0.5, h = 0.65 }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.04]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[w, h, 0.05]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
    </group>
  );
}

function Awning({ position, w = 1.4, d = 0.45, color = TOWN_COLORS.warmRoof }) {
  return (
    <mesh position={position} castShadow rotation={[-0.15, 0, 0]}>
      <boxGeometry args={[w, 0.08, d]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}

/** Modern tech lab with glass entrance. */
export function ProjectsLabVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, h * 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.9, d]} />
        <meshStandardMaterial color="#5b8fa8" roughness={0.45} metalness={0.22} />
      </mesh>
      <mesh position={[0, h * 0.55, d * 0.42]} castShadow>
        <boxGeometry args={[w * 0.72, h * 0.72, 0.35]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <mesh position={[0, 0.12, d * 0.55]} receiveShadow>
        <boxGeometry args={[w * 0.55, 0.14, 0.9]} />
        <meshStandardMaterial color={TOWN_COLORS.stone} roughness={0.8} />
      </mesh>
      <Door position={[0, 1.05, d * 0.52]} color="#1e293b" />
      <Awning position={[0, 2.25, d * 0.62]} w={w * 0.55} color="#334155" />
      <WindowPane position={[-w * 0.28, h * 0.55, -d * 0.51]} />
      <WindowPane position={[w * 0.28, h * 0.55, -d * 0.51]} />
      <FlatRoof w={w} d={d} y={h * 0.95} color="#334155" thickness={0.28} />
      <mesh position={[0, h * 0.95 + 0.2, 0]} castShadow>
        <boxGeometry args={[w * 0.35, 0.18, d * 0.35]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[w * 0.3, h * 1.05, -d * 0.15]} castShadow>
        <boxGeometry args={[0.9, 0.35, 0.9]} />
        <meshStandardMaterial color={TOWN_COLORS.glassDark} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Warm modern library. */
export function BlogLibraryVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, h * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.84, d]} />
        <meshStandardMaterial color="#c4a484" roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[0, h * 0.95, 0]} castShadow>
        <boxGeometry args={[w * 1.08, 0.55, d * 1.08]} />
        <meshStandardMaterial color={TOWN_COLORS.warmRoof} roughness={0.8} />
      </mesh>
      <mesh position={[0, h * 1.22, d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.55, 0.35, 0.55]} />
        <meshStandardMaterial color={TOWN_COLORS.cream} roughness={0.85} />
      </mesh>
      <Door position={[0, 1.05, d * 0.51]} color={TOWN_COLORS.wood} w={0.95} />
      <Awning position={[0, 2.2, d * 0.62]} w={1.6} color={TOWN_COLORS.woodLight} />
      <WindowPane position={[-w * 0.3, h * 0.5, d * 0.51]} w={0.48} h={0.9} />
      <WindowPane position={[w * 0.3, h * 0.5, d * 0.51]} w={0.48} h={0.9} />
      <mesh position={[0, 2.2, d * 0.52]}>
        <boxGeometry args={[1.5, 0.1, 0.08]} />
        <meshStandardMaterial color={TOWN_COLORS.woodLight} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Professional office. */
export function ExperienceOfficeVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, h * 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.96, d]} />
        <meshStandardMaterial color="#d9dde3" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[-w * 0.28, h * 0.55, d * 0.51]}>
        <boxGeometry args={[w * 0.32, h * 0.55, 0.08]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <mesh position={[w * 0.28, h * 0.55, d * 0.51]}>
        <boxGeometry args={[w * 0.32, h * 0.55, 0.08]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <Door position={[0, 1.05, d * 0.51]} color="#334155" />
      <Awning position={[0, 2.2, d * 0.6]} w={1.3} color="#64748b" />
      <FlatRoof w={w} d={d} y={h} color="#475569" thickness={0.3} />
      <mesh position={[0, h + 0.25, 0]} castShadow>
        <boxGeometry args={[w * 0.4, 0.2, d * 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, h * 0.55, -d * 0.2]} castShadow>
        <boxGeometry args={[w * 0.55, h * 0.35, d * 0.45]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.18} />
      </mesh>
    </group>
  );
}

/** Compact campus building. */
export function EducationCampusVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, h * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.8, d]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.8} metalness={0.04} />
      </mesh>
      <mesh position={[0, h * 0.95, 0]} castShadow>
        <boxGeometry args={[1.15, h * 0.55, 1.15]} />
        <meshStandardMaterial color={TOWN_COLORS.cream} roughness={0.75} />
      </mesh>
      <mesh position={[0, h * 1.35, 0]} castShadow>
        <coneGeometry args={[0.9, 0.75, 4]} />
        <meshStandardMaterial color={TOWN_COLORS.copper} roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0, h * 1.05, d * 0.58]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <Door position={[0, 1.05, d * 0.51]} color={TOWN_COLORS.wood} />
      <Awning position={[0, 2.2, d * 0.62]} w={1.5} color={TOWN_COLORS.warmRoof} />
      <WindowPane position={[-w * 0.32, h * 0.48, d * 0.51]} />
      <WindowPane position={[w * 0.32, h * 0.48, d * 0.51]} />
      <FlatRoof w={w} d={d} y={h * 0.82} color="#6b5344" thickness={0.26} />
    </group>
  );
}

/** Tech workshop / studio. */
export function SkillsWorkshopVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, h * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.8, d]} />
        <meshStandardMaterial color="#7d8b99" roughness={0.65} metalness={0.2} />
      </mesh>
      <mesh position={[-w * 0.22, h * 0.98, 0]} castShadow rotation={[0, 0, 0.18]}>
        <boxGeometry args={[w * 0.48, 0.4, d * 1.04]} />
        <meshStandardMaterial color={TOWN_COLORS.coolRoof} roughness={0.7} />
      </mesh>
      <mesh position={[w * 0.22, h * 0.98, 0]} castShadow rotation={[0, 0, -0.18]}>
        <boxGeometry args={[w * 0.48, 0.4, d * 1.04]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      <mesh position={[0, h * 0.55, d * 0.45]} castShadow>
        <boxGeometry args={[w * 0.55, h * 0.45, 0.2]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <Door position={[0, 1.05, d * 0.52]} color="#1f2937" w={1.0} />
      <Awning position={[0, 2.2, d * 0.62]} w={1.4} color="#475569" />
      <mesh position={[w * 0.35, h * 1.2, -d * 0.1]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.75, 6]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Compact About pavilion near the square. */
export function AboutPavilionVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[Math.max(w, d) * 0.55, Math.max(w, d) * 0.58, 0.2, 8]} />
        <meshStandardMaterial {...TOWN_MAT.plaza} />
      </mesh>
      <mesh position={[0, h * 0.4, 0]} castShadow>
        <cylinderGeometry args={[w * 0.38, w * 0.42, h * 0.65, 8]} />
        <meshStandardMaterial color={TOWN_COLORS.white} roughness={0.7} metalness={0.08} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.cos(a) * w * 0.45, h * 0.4, Math.sin(a) * d * 0.45]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, h * 0.8, 6]} />
            <meshStandardMaterial color={TOWN_COLORS.stone} roughness={0.75} />
          </mesh>
        );
      })}
      <mesh position={[0, h * 0.85, 0]} castShadow>
        <coneGeometry args={[w * 0.58, 0.6, 8]} />
        <meshStandardMaterial color={TOWN_COLORS.copper} roughness={0.5} metalness={0.35} />
      </mesh>
      <Door position={[0, 1.05, d * 0.42]} w={0.7} h={1.9} color={TOWN_COLORS.charcoal} />
    </group>
  );
}
