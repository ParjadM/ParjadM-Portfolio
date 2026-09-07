import React from 'react';
import { TOWN_COLORS, TOWN_MAT } from './townPalette.js';

function FlatRoof({ w, d, y, color = TOWN_COLORS.coolRoof }) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <boxGeometry args={[w * 1.06, 0.22, d * 1.06]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.08} />
    </mesh>
  );
}

function Door({ position, color = TOWN_COLORS.charcoal, w = 0.7, h = 1.35 }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[w, h, 0.08]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} />
    </mesh>
  );
}

function WindowPane({ position, w = 0.55, h = 0.7 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[w, h, 0.06]} />
      <meshStandardMaterial {...TOWN_MAT.glass} />
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
        <boxGeometry args={[w * 0.5, 0.12, 0.8]} />
        <meshStandardMaterial color={TOWN_COLORS.stone} roughness={0.8} />
      </mesh>
      <Door position={[0, 0.75, d * 0.52]} color="#1e293b" />
      <WindowPane position={[-w * 0.28, h * 0.55, -d * 0.51]} />
      <WindowPane position={[w * 0.28, h * 0.55, -d * 0.51]} />
      <FlatRoof w={w} d={d} y={h * 0.95} color="#334155" />
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
      {/* Pediment */}
      <mesh position={[0, h * 1.25, d * 0.15]} castShadow rotation={[0, 0, 0]}>
        <coneGeometry args={[w * 0.42, 0.55, 3]} />
        <meshStandardMaterial color={TOWN_COLORS.cream} roughness={0.85} />
      </mesh>
      <Door position={[0, 0.75, d * 0.51]} color={TOWN_COLORS.wood} w={0.85} h={1.4} />
      <WindowPane position={[-w * 0.3, h * 0.5, d * 0.51]} w={0.5} h={0.85} />
      <WindowPane position={[w * 0.3, h * 0.5, d * 0.51]} w={0.5} h={0.85} />
      <mesh position={[0, 1.55, d * 0.52]}>
        <boxGeometry args={[1.4, 0.12, 0.08]} />
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
      <mesh position={[-w * 0.28, h * 0.48, d * 0.51]}>
        <boxGeometry args={[w * 0.35, h * 0.7, 0.08]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <mesh position={[w * 0.28, h * 0.48, d * 0.51]}>
        <boxGeometry args={[w * 0.35, h * 0.7, 0.08]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <Door position={[0, 0.75, d * 0.51]} color="#334155" />
      <FlatRoof w={w} d={d} y={h} color="#475569" />
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
      {/* Clock / tower */}
      <mesh position={[0, h * 0.95, 0]} castShadow>
        <boxGeometry args={[1.1, h * 0.55, 1.1]} />
        <meshStandardMaterial color={TOWN_COLORS.cream} roughness={0.75} />
      </mesh>
      <mesh position={[0, h * 1.35, 0]} castShadow>
        <coneGeometry args={[0.85, 0.7, 4]} />
        <meshStandardMaterial color={TOWN_COLORS.copper} roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0, h * 1.05, d * 0.56]}>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <Door position={[0, 0.75, d * 0.51]} color={TOWN_COLORS.wood} />
      <WindowPane position={[-w * 0.32, h * 0.45, d * 0.51]} />
      <WindowPane position={[w * 0.32, h * 0.45, d * 0.51]} />
      <FlatRoof w={w} d={d} y={h * 0.82} color="#6b5344" />
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
      {/* Sawtooth roof suggestion */}
      <mesh position={[-w * 0.22, h * 0.95, 0]} castShadow rotation={[0, 0, 0.15]}>
        <boxGeometry args={[w * 0.45, 0.35, d * 1.02]} />
        <meshStandardMaterial color={TOWN_COLORS.coolRoof} roughness={0.7} />
      </mesh>
      <mesh position={[w * 0.22, h * 0.95, 0]} castShadow rotation={[0, 0, -0.15]}>
        <boxGeometry args={[w * 0.45, 0.35, d * 1.02]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      <mesh position={[0, h * 0.55, d * 0.45]} castShadow>
        <boxGeometry args={[w * 0.55, h * 0.45, 0.2]} />
        <meshStandardMaterial {...TOWN_MAT.glass} />
      </mesh>
      <Door position={[0, 0.7, d * 0.52]} color="#1f2937" w={0.9} />
      <mesh position={[w * 0.35, h * 1.15, -d * 0.1]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.7, 6]} />
        <meshStandardMaterial color={TOWN_COLORS.charcoal} roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Compact About pavilion near the square — not a large generic block. */
export function AboutPavilionVisual({ size }) {
  const [w, h, d] = size;
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[Math.max(w, d) * 0.55, Math.max(w, d) * 0.58, 0.2, 8]} />
        <meshStandardMaterial {...TOWN_MAT.plaza} />
      </mesh>
      <mesh position={[0, h * 0.35, 0]} castShadow>
        <cylinderGeometry args={[w * 0.35, w * 0.4, h * 0.55, 8]} />
        <meshStandardMaterial color={TOWN_COLORS.white} roughness={0.7} metalness={0.08} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.cos(a) * w * 0.42, h * 0.35, Math.sin(a) * d * 0.42]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, h * 0.7, 6]} />
            <meshStandardMaterial color={TOWN_COLORS.stone} roughness={0.75} />
          </mesh>
        );
      })}
      <mesh position={[0, h * 0.75, 0]} castShadow>
        <coneGeometry args={[w * 0.55, 0.55, 8]} />
        <meshStandardMaterial color={TOWN_COLORS.copper} roughness={0.5} metalness={0.35} />
      </mesh>
      <Door position={[0, 0.55, d * 0.4]} w={0.55} h={0.95} color={TOWN_COLORS.charcoal} />
    </group>
  );
}
