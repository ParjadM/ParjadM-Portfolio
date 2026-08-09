/**
 * Camera motion tracker + dual-hand neon FX.
 * Motion modes use frame differencing; Hands mode uses MediaPipe landmarks.
 */

import { createHandTracker, FINGER_CHAINS } from './handTracker.js'

const SAMPLE_W = 96
const SAMPLE_H = 54

export const CAMERA_FX_MODES = [
  { id: 'hands', labelKey: 'cameraFx.modes.hands' },
  { id: 'aurora', labelKey: 'cameraFx.modes.aurora' },
  { id: 'constellation', labelKey: 'cameraFx.modes.constellation' },
  { id: 'prism', labelKey: 'cameraFx.modes.prism' },
  { id: 'ember', labelKey: 'cameraFx.modes.ember' },
]

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function createParticles(count) {
  const particles = []
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      vx: 0,
      vy: 0,
      life: 0,
      hue: 170 + Math.random() * 80,
      size: 1 + Math.random() * 2.5,
    })
  }
  return particles
}

function toCanvasPoint(lm, w, h) {
  // Mirror X to match selfie preview.
  return { x: (1 - lm.x) * w, y: lm.y * h }
}

export function createCameraFxEngine({
  canvas,
  video,
  getSettings,
  onHandsUpdate,
  onHandTrackerStatus,
}) {
  const ctx = canvas.getContext('2d', { alpha: false })
  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = SAMPLE_W
  sampleCanvas.height = SAMPLE_H
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })

  let prevGray = null
  let raf = 0
  let running = false
  let particles = createParticles(160)
  let trailCanvas = document.createElement('canvas')
  let trailCtx = trailCanvas.getContext('2d')
  let lastW = 0
  let lastH = 0
  let pulse = 0
  let handTracker = null
  let handTrackerPromise = null
  let lastHandResult = { hands: [], handCount: 0 }
  let gesturePulse = 0

  const ensureHandTracker = () => {
    if (handTracker) return Promise.resolve(handTracker)
    if (handTrackerPromise) return handTrackerPromise
    onHandTrackerStatus?.('loading')
    handTrackerPromise = createHandTracker()
      .then((tracker) => {
        handTracker = tracker
        onHandTrackerStatus?.('ready')
        return tracker
      })
      .catch((err) => {
        console.error(err)
        handTrackerPromise = null
        onHandTrackerStatus?.('error')
        throw err
      })
    return handTrackerPromise
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    if (!w || !h) return
    if (w === lastW && h === lastH && canvas.width === Math.floor(w * dpr)) return
    lastW = w
    lastH = h
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    trailCanvas.width = canvas.width
    trailCanvas.height = canvas.height
    trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    trailCtx.clearRect(0, 0, w, h)
  }

  const sampleMotion = (threshold) => {
    sampleCtx.save()
    sampleCtx.scale(-1, 1)
    sampleCtx.drawImage(video, -SAMPLE_W, 0, SAMPLE_W, SAMPLE_H)
    sampleCtx.restore()
    const { data } = sampleCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H)
    const gray = new Float32Array(SAMPLE_W * SAMPLE_H)
    const hotspots = []
    let sumX = 0
    let sumY = 0
    let sum = 0
    let energy = 0

    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      gray[p] = g
      if (!prevGray) continue
      const diff = Math.abs(g - prevGray[p])
      if (diff > threshold) {
        const x = p % SAMPLE_W
        const y = (p / SAMPLE_W) | 0
        const weight = diff / 255
        sumX += x * weight
        sumY += y * weight
        sum += weight
        energy += weight
        if (hotspots.length < 80 && (p % 3 === 0)) {
          hotspots.push({
            x: x / (SAMPLE_W - 1),
            y: y / (SAMPLE_H - 1),
            w: weight,
          })
        }
      }
    }

    prevGray = gray
    return {
      centroid: sum > 0.01
        ? { x: sumX / sum / (SAMPLE_W - 1), y: sumY / sum / (SAMPLE_H - 1) }
        : null,
      energy: energy / (SAMPLE_W * SAMPLE_H),
      hotspots,
    }
  }

  const drawMirroredVideo = (w, h, tint = null) => {
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, w, h)
    ctx.restore()
    if (tint) {
      ctx.fillStyle = tint
      ctx.fillRect(0, 0, w, h)
    }
  }

  const fadeTrails = (amount) => {
    trailCtx.globalCompositeOperation = 'destination-out'
    trailCtx.fillStyle = `rgba(0,0,0,${amount})`
    trailCtx.fillRect(0, 0, lastW, lastH)
    trailCtx.globalCompositeOperation = 'source-over'
  }

  const paintHotspots = (hotspots, intensity, mode) => {
    for (const spot of hotspots) {
      const x = spot.x * lastW
      const y = spot.y * lastH
      const r = (8 + spot.w * 28) * (0.6 + intensity)
      const hue =
        mode === 'ember' ? 18 + spot.w * 40
          : mode === 'prism' ? 280 + spot.w * 80
            : 165 + spot.w * 90
      const grad = trailCtx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, `hsla(${hue}, 95%, 65%, ${clamp(0.35 + spot.w * 0.5, 0, 0.85)})`)
      grad.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`)
      trailCtx.fillStyle = grad
      trailCtx.beginPath()
      trailCtx.arc(x, y, r, 0, Math.PI * 2)
      trailCtx.fill()
    }
  }

  const spawnAt = (nx, ny, hue, burst = 1) => {
    let spawned = 0
    for (const p of particles) {
      if (p.life > 0 || spawned >= burst) continue
      p.x = nx
      p.y = ny
      p.vx = (Math.random() - 0.5) * 0.012
      p.vy = (Math.random() - 0.5) * 0.012 - 0.002
      p.life = 0.45 + Math.random() * 0.7
      p.hue = hue
      spawned += 1
    }
  }

  const drawFingerLights = (hands, intensity, mode) => {
    if (!hands?.length) return

    const palmPoints = []

    for (const hand of hands) {
      const lms = hand.landmarks
      const wrist = toCanvasPoint(lms[0], lastW, lastH)
      const middleMcp = toCanvasPoint(lms[9], lastW, lastH)
      const palm = {
        x: (wrist.x + middleMcp.x) / 2,
        y: (wrist.y + middleMcp.y) / 2,
      }
      palmPoints.push(palm)

      const gestureBoost = hand.gesture === 'pinch' || hand.gesture === 'peace' ? 1.35 : 1
      const sideHueShift = hand.side === 'Left' ? -18 : 18

      // Palm glow
      const palmR = (34 + intensity * 28) * gestureBoost
      const palmGrad = trailCtx.createRadialGradient(palm.x, palm.y, 0, palm.x, palm.y, palmR)
      palmGrad.addColorStop(0, `hsla(${190 + sideHueShift}, 95%, 70%, ${0.28 * intensity})`)
      palmGrad.addColorStop(1, `hsla(${190 + sideHueShift}, 90%, 50%, 0)`)
      trailCtx.fillStyle = palmGrad
      trailCtx.beginPath()
      trailCtx.arc(palm.x, palm.y, palmR, 0, Math.PI * 2)
      trailCtx.fill()

      for (const finger of FINGER_CHAINS) {
        const hue = finger.hue + sideHueShift + (mode === 'ember' ? -40 : 0)
        const pts = [0, ...finger.points].map((idx) => toCanvasPoint(lms[idx], lastW, lastH))

        // Soft outer glow stroke
        trailCtx.lineCap = 'round'
        trailCtx.lineJoin = 'round'
        trailCtx.strokeStyle = `hsla(${hue}, 95%, 62%, ${0.22 * intensity * gestureBoost})`
        trailCtx.lineWidth = 14 * intensity
        trailCtx.beginPath()
        trailCtx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i += 1) trailCtx.lineTo(pts[i].x, pts[i].y)
        trailCtx.stroke()

        // Bright core
        trailCtx.strokeStyle = `hsla(${hue}, 100%, 72%, ${0.75 * intensity})`
        trailCtx.lineWidth = 3.5 + intensity * 2
        trailCtx.beginPath()
        trailCtx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i += 1) trailCtx.lineTo(pts[i].x, pts[i].y)
        trailCtx.stroke()

        // Fingertip light
        const tip = toCanvasPoint(lms[finger.tip], lastW, lastH)
        const tipR = (10 + intensity * 14) * gestureBoost
        const tipGrad = trailCtx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, tipR)
        tipGrad.addColorStop(0, `hsla(${hue}, 100%, 85%, ${0.9})`)
        tipGrad.addColorStop(0.35, `hsla(${hue}, 95%, 65%, ${0.45})`)
        tipGrad.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`)
        trailCtx.fillStyle = tipGrad
        trailCtx.beginPath()
        trailCtx.arc(tip.x, tip.y, tipR, 0, Math.PI * 2)
        trailCtx.fill()

        spawnAt(tip.x / lastW, tip.y / lastH, hue, hand.gesture === 'open' ? 2 : 1)

        if (hand.gesture === 'pinch' && finger.id === 'index') {
          const thumb = toCanvasPoint(lms[4], lastW, lastH)
          trailCtx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.85)`
          trailCtx.lineWidth = 2
          trailCtx.beginPath()
          trailCtx.moveTo(thumb.x, thumb.y)
          trailCtx.lineTo(tip.x, tip.y)
          trailCtx.stroke()
          spawnAt((thumb.x + tip.x) / 2 / lastW, (thumb.y + tip.y) / 2 / lastH, hue, 4)
        }
      }
    }

    // Light bridge across both hands
    if (palmPoints.length >= 2) {
      const [a, b] = palmPoints
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2
      trailCtx.strokeStyle = `rgba(180, 255, 240, ${0.35 + gesturePulse * 0.4})`
      trailCtx.lineWidth = 2 + intensity * 3
      trailCtx.shadowColor = 'rgba(120, 255, 230, 0.8)'
      trailCtx.shadowBlur = 18
      trailCtx.beginPath()
      trailCtx.moveTo(a.x, a.y)
      trailCtx.quadraticCurveTo(midX, midY - 40, b.x, b.y)
      trailCtx.stroke()
      trailCtx.shadowBlur = 0

      const bridgeGrad = trailCtx.createRadialGradient(midX, midY, 0, midX, midY, 40)
      bridgeGrad.addColorStop(0, `rgba(200,255,255,${0.35 + gesturePulse})`)
      bridgeGrad.addColorStop(1, 'rgba(200,255,255,0)')
      trailCtx.fillStyle = bridgeGrad
      trailCtx.beginPath()
      trailCtx.arc(midX, midY, 40, 0, Math.PI * 2)
      trailCtx.fill()
    }
  }

  const updateParticles = (motion, intensity, mode, hands) => {
    const target = motion.centroid || { x: 0.5, y: 0.45 }
    if (hands?.length) {
      const tip = hands[0].landmarks[8]
      target.x = 1 - tip.x
      target.y = tip.y
    }
    const spawnBudget = Math.floor(motion.energy * 40 * intensity)
    let spawned = 0

    for (const p of particles) {
      if (p.life <= 0 && spawned < spawnBudget && motion.hotspots.length && mode !== 'hands') {
        const spot = motion.hotspots[(Math.random() * motion.hotspots.length) | 0]
        p.x = spot.x
        p.y = spot.y
        p.vx = (Math.random() - 0.5) * 0.01
        p.vy = (Math.random() - 0.5) * 0.01 - 0.002
        p.life = 0.5 + Math.random() * 0.8
        p.hue = mode === 'ember' ? 10 + Math.random() * 40 : 160 + Math.random() * 100
        spawned += 1
      }

      if (p.life <= 0) continue
      const ax = (target.x - p.x) * 0.012 * intensity
      const ay = (target.y - p.y) * 0.012 * intensity
      p.vx = (p.vx + ax) * 0.96
      p.vy = (p.vy + ay) * 0.96
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.012
    }
  }

  const drawConstellation = (intensity) => {
    const alive = particles.filter((p) => p.life > 0)
    ctx.lineWidth = 1
    for (let i = 0; i < alive.length; i += 1) {
      const a = alive[i]
      const ax = a.x * lastW
      const ay = a.y * lastH
      ctx.beginPath()
      ctx.fillStyle = `hsla(${a.hue}, 90%, 70%, ${a.life * 0.9})`
      ctx.arc(ax, ay, a.size * (0.8 + intensity), 0, Math.PI * 2)
      ctx.fill()

      for (let j = i + 1; j < alive.length; j += 1) {
        const b = alive[j]
        const dx = (a.x - b.x) * lastW
        const dy = (a.y - b.y) * lastH
        const dist = Math.hypot(dx, dy)
        if (dist < 90) {
          ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 90%, 65%, ${(1 - dist / 90) * 0.35 * a.life})`
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(b.x * lastW, b.y * lastH)
          ctx.stroke()
        }
      }
    }
  }

  const drawPrismGhost = (motion, intensity) => {
    if (!motion.centroid) return
    const ox = (motion.centroid.x - 0.5) * 24 * intensity
    const oy = (motion.centroid.y - 0.5) * 16 * intensity
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.35 + motion.energy * 2
    ctx.translate(lastW, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, ox, oy, lastW, lastH)
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(255,80,120,0.35)'
    ctx.fillRect(0, 0, lastW, lastH)
    ctx.globalCompositeOperation = 'screen'
    ctx.drawImage(video, -ox, -oy, lastW, lastH)
    ctx.fillStyle = 'rgba(80,220,255,0.3)'
    ctx.fillRect(0, 0, lastW, lastH)
    ctx.restore()
  }

  const drawEmberAsh = (motion, intensity) => {
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = `rgba(8, 4, 12, ${0.55 - motion.energy * 0.8})`
    ctx.fillRect(0, 0, lastW, lastH)
    ctx.restore()
    paintHotspots(motion.hotspots, intensity * 1.2, 'ember')
  }

  const frame = () => {
    if (!running) return
    raf = requestAnimationFrame(frame)
    if (!video.videoWidth) return

    resize()
    const settings = getSettings()
    const intensity = clamp(settings.intensity ?? 0.7, 0.15, 1.5)
    const sensitivity = clamp(settings.sensitivity ?? 0.45, 0.1, 0.9)
    const threshold = 18 + (1 - sensitivity) * 50
    const mode = settings.mode || 'hands'
    const handLights = settings.handLights !== false
    const wantHands = mode === 'hands' || handLights

    if (wantHands && !handTracker) {
      ensureHandTracker().catch(() => {})
    }

    const motion = sampleMotion(threshold)
    pulse = pulse * 0.9 + motion.energy * 0.1

    if (handTracker && wantHands) {
      try {
        lastHandResult = handTracker.detect(video, performance.now())
        const hotGesture = lastHandResult.hands.some((h) => h.gesture === 'pinch' || h.gesture === 'peace')
        gesturePulse = gesturePulse * 0.85 + (hotGesture ? 0.15 : 0)
        onHandsUpdate?.(lastHandResult)
      } catch (err) {
        console.warn('hand detect failed', err)
      }
    } else {
      lastHandResult = { hands: [], handCount: 0 }
      onHandsUpdate?.(lastHandResult)
    }

    fadeTrails(mode === 'hands' ? 0.06 : 0.08 + (1 - intensity) * 0.1)

    if (mode === 'aurora' || mode === 'ember') {
      paintHotspots(motion.hotspots, intensity, mode)
    }

    if (mode === 'prism') {
      drawMirroredVideo(lastW, lastH, 'rgba(6,8,20,0.28)')
      drawPrismGhost(motion, intensity)
    } else if (mode === 'ember') {
      drawMirroredVideo(lastW, lastH, 'rgba(20,6,4,0.35)')
      drawEmberAsh(motion, intensity)
    } else if (mode === 'hands') {
      drawMirroredVideo(lastW, lastH, 'rgba(3,8,16,0.35)')
    } else {
      drawMirroredVideo(lastW, lastH, 'rgba(4,10,18,0.22)')
    }

    if (wantHands) {
      drawFingerLights(lastHandResult.hands, intensity, mode)
    }

    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.drawImage(trailCanvas, 0, 0, lastW, lastH)
    ctx.restore()

    updateParticles(motion, intensity, mode, lastHandResult.hands)
    if (mode === 'constellation' || mode === 'aurora' || mode === 'hands') {
      drawConstellation(intensity)
    }

    const grd = ctx.createRadialGradient(
      lastW * 0.5,
      lastH * 0.5,
      Math.min(lastW, lastH) * 0.25,
      lastW * 0.5,
      lastH * 0.5,
      Math.max(lastW, lastH) * 0.7,
    )
    grd.addColorStop(0, 'rgba(0,0,0,0)')
    grd.addColorStop(1, `rgba(0,0,0,${0.4 + pulse * 0.5})`)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, lastW, lastH)

    if (mode !== 'hands' && motion.centroid) {
      const cx = motion.centroid.x * lastW
      const cy = motion.centroid.y * lastH
      const ring = 36 + pulse * 120
      ctx.strokeStyle = mode === 'ember'
        ? `rgba(255,140,60,${0.25 + pulse})`
        : `rgba(120,255,230,${0.2 + pulse})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, ring, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  return {
    async start() {
      if (running) return
      running = true
      prevGray = null
      particles = createParticles(160)
      resize()
      // Warm the hand model in the background so Hands mode is snappy.
      ensureHandTracker().catch(() => {})
      frame()
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
      handTracker?.close?.()
      handTracker = null
      handTrackerPromise = null
    },
    capture() {
      return canvas.toDataURL('image/jpeg', 0.92)
    },
    getMotionHint() {
      return pulse
    },
  }
}
