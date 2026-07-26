/**
 * Morphogenetic rules for the Collaborative Garden.
 * Pure functions over mark arrays — used by both Mongo and in-memory stores.
 */

export const FIELD_SIZE = 36
export const MAX_MARKS = 1200
export const TICK_MIN_INTERVAL_MS = 45_000
export const NEIGHBOR_RADIUS = 0.085
export const MERGE_RADIUS = 0.028
export const BRANCH_RADIUS = 0.07

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n))
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Map site interaction signals → bloom DNA. */
export function buildGenome(signals = {}, visitorKey = '') {
  const paths = Array.isArray(signals.paths) ? signals.paths.map(String) : []
  const theme = String(signals.theme || 'green')
  const dwellSec = Number(signals.dwellSec) || 0
  const usedAi = !!signals.usedAi
  const usedOs = !!signals.usedOs

  const explore = clamp(paths.filter((p) => p === '/' || p.startsWith('/explore')).length / 3, 0, 1)
  const systems = clamp(
    (paths.filter((p) => p === '/os' || p === '/cli' || p === '/stats' || p.includes('lqft')).length + (usedOs ? 2 : 0)) / 5,
    0,
    1,
  )
  const content = clamp(paths.filter((p) => p.startsWith('/blog') || p === '/projects' || p === '/about').length / 4, 0, 1)
  const social = clamp((paths.filter((p) => p === '/contact' || p === '/interview').length + (usedAi ? 2 : 0)) / 4, 0, 1)
  const themeBias = theme === 'pink' ? 1 : theme === 'terminal' ? 0.35 : 0.15
  const depth = clamp(dwellSec / 180, 0, 1)

  const seed = hashStr(visitorKey || 'anon')
  return {
    explore: clamp(explore + ((seed % 17) / 100), 0, 1),
    systems: clamp(systems + (((seed >>> 5) % 13) / 100), 0, 1),
    content: clamp(content + (((seed >>> 9) % 11) / 100), 0, 1),
    social: clamp(social + (((seed >>> 13) % 9) / 100), 0, 1),
    theme: themeBias,
    depth,
  }
}

export function speciesFromGenome(g) {
  if (!g) return 'spore'
  const entries = [
    ['explorer', g.explore],
    ['systems', g.systems],
    ['scholar', g.content],
    ['connector', g.social],
  ].sort((a, b) => b[1] - a[1])
  if (g.theme > 0.7 && entries[0][1] < 0.45) return 'roseveil'
  if (g.depth > 0.65) return `${entries[0][0]}-deep`
  return entries[0][0]
}

export function phenotypeFromGenome(genome, visitorKey = '') {
  const g = genome || buildGenome({}, visitorKey)
  const seed = hashStr(visitorKey || JSON.stringify(g))
  const hue = Math.round(
    (g.systems * 150 + g.content * 200 + g.explore * 40 + g.social * 300 + g.theme * 330 + (seed % 40)) % 360,
  )
  const size = clamp(0.45 + g.depth * 0.35 + g.systems * 0.2 + ((seed >>> 8) % 20) / 100, 0.35, 1.35)
  const shape = Math.floor((g.explore * 2 + g.content * 2 + g.social + ((seed >>> 16) % 2)) % 4)
  return { hue, size, shape, species: speciesFromGenome(g), genome: g }
}

function ensureFields(mark, now) {
  return {
    ...mark,
    energy: typeof mark.energy === 'number' ? mark.energy : 0.72,
    generation: typeof mark.generation === 'number' ? mark.generation : 0,
    species: mark.species || 'spore',
    genome: mark.genome || null,
    lastTickedAt: mark.lastTickedAt || mark.createdAt || now,
  }
}

/**
 * Advance garden state by one morphogenetic tick.
 * Returns { marks, spawned, merged, decayed }.
 */
export function morphTick(rawMarks, now = Date.now()) {
  let marks = rawMarks.map((m) => ensureFields({ ...m }, now))
  let spawned = 0
  let merged = 0
  let decayed = 0

  for (const m of marks) {
    const ageHours = Math.max(0, (now - new Date(m.createdAt || now).getTime()) / 3_600_000)
    const n = marks.filter((o) => o !== m && dist(m, o) < NEIGHBOR_RADIUS).length
    let delta = -0.012 - ageHours * 0.002
    if (n >= 2 && n <= 6) delta += 0.028 + n * 0.004
    else if (n === 1) delta += 0.01
    else if (n > 8) delta -= 0.02
    if (m.genome?.depth) delta += m.genome.depth * 0.008
    m.energy = clamp(m.energy + delta, 0, 1)
    m.size = clamp((m.size || 0.8) * (0.97 + m.energy * 0.055), 0.3, 1.45)
    m.lastTickedAt = new Date(now)
  }

  const before = marks.length
  marks = marks.filter((m) => m.energy >= 0.08)
  decayed = before - marks.length

  const removed = new Set()
  for (let i = 0; i < marks.length; i++) {
    if (removed.has(i)) continue
    for (let j = i + 1; j < marks.length; j++) {
      if (removed.has(j)) continue
      if (dist(marks[i], marks[j]) >= MERGE_RADIUS) continue
      const a = marks[i]
      const b = marks[j]
      const aScore = a.energy * (a.size || 1)
      const bScore = b.energy * (b.size || 1)
      const winner = aScore >= bScore ? a : b
      const loser = aScore >= bScore ? b : a
      winner.energy = clamp(winner.energy + loser.energy * 0.4, 0, 1)
      winner.size = clamp(((winner.size || 1) + (loser.size || 1)) / 1.65, 0.35, 1.45)
      winner.hue = Math.round((winner.hue * 0.65 + loser.hue * 0.35) % 360)
      removed.add(aScore >= bScore ? j : i)
      merged += 1
      if (removed.has(i)) break
    }
  }
  marks = marks.filter((_, idx) => !removed.has(idx))

  const newcomers = []
  if (marks.length < MAX_MARKS) {
    for (const m of marks) {
      if (m.energy < 0.62 || (m.generation || 0) > 6) continue
      const local = marks.filter((o) => o !== m && dist(m, o) < BRANCH_RADIUS)
      if (local.length < 1 || local.length > 3) continue
      const chance = 0.08 + (m.genome?.explore || 0) * 0.1 + (m.genome?.systems || 0) * 0.05
      const roll = (hashStr(`${m.id || m.x}:${m.y}:${Math.floor(now / TICK_MIN_INTERVAL_MS)}`) % 1000) / 1000
      if (roll > chance) continue

      const angle = (hashStr(`${m.x}:${m.y}:branch`) % 360) * (Math.PI / 180)
      const step = 0.04 + (m.size || 0.8) * 0.03
      const child = {
        id: `branch-${now}-${newcomers.length}-${hashStr(`${m.x}${m.y}`)}`,
        x: clamp(m.x + Math.cos(angle) * step, 0.02, 0.98),
        y: clamp(m.y + Math.sin(angle) * step, 0.02, 0.98),
        hue: Math.round((m.hue + 18) % 360),
        size: clamp((m.size || 0.8) * 0.72, 0.35, 1.1),
        shape: m.shape,
        energy: clamp(m.energy * 0.55, 0.2, 0.7),
        generation: (m.generation || 0) + 1,
        species: m.species || 'spore',
        genome: m.genome,
        visitorKey: m.visitorKey || '',
        createdAt: new Date(now),
        lastTickedAt: new Date(now),
        branchedFrom: m.id || null,
        _isNew: true,
      }
      m.energy = clamp(m.energy - 0.12, 0.1, 1)
      newcomers.push(child)
      spawned += 1
      if (marks.length + newcomers.length >= MAX_MARKS) break
    }
  }
  marks = marks.concat(newcomers)

  if (marks.length > MAX_MARKS) {
    marks.sort((a, b) => b.energy * b.size - a.energy * a.size)
    const trimmed = marks.length - MAX_MARKS
    marks = marks.slice(0, MAX_MARKS)
    decayed += trimmed
  }

  return { marks, spawned, merged, decayed }
}

/** Build nutrient density field + vein segments along gradients. */
export function buildField(marks, size = FIELD_SIZE) {
  const field = new Float32Array(size * size)
  for (const m of marks) {
    const gx = clamp(Math.floor(m.x * size), 0, size - 1)
    const gy = clamp(Math.floor(m.y * size), 0, size - 1)
    const amp = (m.energy ?? 0.7) * (m.size ?? 1)
    const radius = 2 + Math.floor((m.size ?? 1) * 2)
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = gx + dx
        const y = gy + dy
        if (x < 0 || y < 0 || x >= size || y >= size) continue
        const d2 = dx * dx + dy * dy
        if (d2 > radius * radius) continue
        field[y * size + x] += amp * (1 - d2 / (radius * radius + 0.01))
      }
    }
  }

  const diffused = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0
      let count = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
          sum += field[ny * size + nx]
          count += 1
        }
      }
      diffused[y * size + x] = sum / count
    }
  }

  let max = 0.0001
  for (let i = 0; i < diffused.length; i++) max = Math.max(max, diffused[i])
  const normalized = Array.from(diffused, (v) => Number((v / max).toFixed(4)))

  const veins = []
  const step = Math.max(2, Math.floor(size / 12))
  for (let y = step; y < size - step; y += step) {
    for (let x = step; x < size - step; x += step) {
      const i = y * size + x
      if (normalized[i] < 0.35) continue
      let cx = x
      let cy = y
      const path = [{ x: (cx + 0.5) / size, y: (cy + 0.5) / size }]
      for (let s = 0; s < 6; s++) {
        let best = normalized[cy * size + cx]
        let bx = cx
        let by = cy
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue
            const nx = cx + dx
            const ny = cy + dy
            if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
            const v = normalized[ny * size + nx]
            if (v > best) {
              best = v
              bx = nx
              by = ny
            }
          }
        }
        if (bx === cx && by === cy) break
        cx = bx
        cy = by
        path.push({ x: (cx + 0.5) / size, y: (cy + 0.5) / size })
      }
      if (path.length >= 3) veins.push(path)
    }
  }

  return { size, values: normalized, veins: veins.slice(0, 48) }
}

export function serializeMark(doc) {
  return {
    id: doc._id?.toString?.() || doc.id,
    x: doc.x,
    y: doc.y,
    hue: doc.hue,
    size: doc.size,
    shape: doc.shape,
    energy: typeof doc.energy === 'number' ? doc.energy : 0.72,
    generation: doc.generation || 0,
    species: doc.species || 'spore',
    genome: doc.genome || null,
    createdAt: doc.createdAt,
  }
}
