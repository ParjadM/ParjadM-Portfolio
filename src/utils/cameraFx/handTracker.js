/**
 * Dual-hand landmark tracker via MediaPipe Hand Landmarker.
 * Loads WASM + model from CDN; inference stays on-device.
 */

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

export const FINGER_CHAINS = [
  { id: 'thumb', points: [1, 2, 3, 4], tip: 4, hue: 48 },
  { id: 'index', points: [5, 6, 7, 8], tip: 8, hue: 168 },
  { id: 'middle', points: [9, 10, 11, 12], tip: 12, hue: 198 },
  { id: 'ring', points: [13, 14, 15, 16], tip: 16, hue: 280 },
  { id: 'pinky', points: [17, 18, 19, 20], tip: 20, hue: 320 },
]

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z || 0) - (b.z || 0)
  return Math.hypot(dx, dy, dz)
}

function fingerExtended(landmarks, tipIdx, pipIdx) {
  const wrist = landmarks[0]
  return dist(landmarks[tipIdx], wrist) > dist(landmarks[pipIdx], wrist) * 1.12
}

export function classifyHandGesture(landmarks) {
  if (!landmarks?.length) return 'none'

  const thumbUp = fingerExtended(landmarks, 4, 3)
  const indexUp = fingerExtended(landmarks, 8, 6)
  const middleUp = fingerExtended(landmarks, 12, 10)
  const ringUp = fingerExtended(landmarks, 16, 14)
  const pinkyUp = fingerExtended(landmarks, 20, 18)
  const pinch = dist(landmarks[4], landmarks[8]) < 0.055

  // Fist before pinch: curled tips can sit close together without a real pinch.
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 'fist'
  if (pinch) return 'pinch'
  if (indexUp && middleUp && !ringUp && !pinkyUp) return 'peace'
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return 'point'
  if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) return 'thumbsUp'
  if (indexUp && middleUp && ringUp && pinkyUp) return 'open'
  return 'hand'
}

/**
 * @returns {Promise<{
 *   ready: boolean,
 *   detect: (video: HTMLVideoElement, ts: number) => object,
 *   close: () => void,
 * }>}
 */
export async function createHandTracker() {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision')
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT)
  const landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  let lastTs = -1

  return {
    ready: true,
    detect(video, timestampMs) {
      if (!video?.videoWidth) {
        return { hands: [], handCount: 0 }
      }
      // MediaPipe requires strictly increasing timestamps.
      let ts = timestampMs
      if (ts <= lastTs) ts = lastTs + 1
      lastTs = ts

      const result = landmarker.detectForVideo(video, ts)
      const landmarks = result.landmarks || []
      const handedness = result.handedness || []

      const hands = landmarks.map((lms, i) => {
        const label = handedness[i]?.[0]?.categoryName || 'Unknown'
        // Selfie-mirror: swap displayed Left/Right for natural UX.
        const side = label === 'Left' ? 'Right' : label === 'Right' ? 'Left' : label
        return {
          landmarks: lms,
          side,
          gesture: classifyHandGesture(lms),
          score: handedness[i]?.[0]?.score ?? 0,
        }
      })

      return { hands, handCount: hands.length }
    },
    close() {
      try {
        landmarker.close()
      } catch {
        // ignore double-close
      }
    },
  }
}
