/**
 * Executable risk → evidence map (QA engineering).
 * Fails CI if a tracked risk loses its automated gate.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { PUBLIC_STATIC_ROUTES } from './publicRoutes.js'
import en from '../locales/en/translation.json'
import fr from '../locales/fr/translation.json'

function resolveKey(dict, dotted) {
  return dotted.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict)
}

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '../..')
const APP_ROUTES_SRC = readFileSync(path.join(ROOT, 'src/components/layout/AppRoutes.jsx'), 'utf8')
const E2E_CRITICAL = readFileSync(path.join(ROOT, 'e2e/critical-paths.spec.js'), 'utf8')
const CI_YML = readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8')

/** Highest-trust / reputation surfaces — must stay wired. */
const SHOWCASE_PATHS = [
  '/projects/cameraFx',
  '/projects/qaLab',
  '/projects/lqftBenchmark',
]

describe('QA risk map — broken navigation / blank routes', () => {
  it('every public static route id is wired in AppRoutes ROUTE_COMPONENTS', () => {
    for (const route of PUBLIC_STATIC_ROUTES) {
      expect(
        APP_ROUTES_SRC,
        `Missing ROUTE_COMPONENTS entry for id="${route.id}" (${route.path})`,
      ).toMatch(new RegExp(`\\b${route.id}\\s*:\\s*\\w`))
    }
  })

  it('showcase paths stay in the static SEO/prerender registry', () => {
    const paths = PUBLIC_STATIC_ROUTES.map((r) => r.path)
    for (const pathName of SHOWCASE_PATHS) {
      expect(paths).toContain(pathName)
    }
  })
})

describe('QA risk map — locale gaps', () => {
  it('every route SEO key resolves in both EN and FR dictionaries', () => {
    for (const route of PUBLIC_STATIC_ROUTES) {
      expect(resolveKey(en, route.titleKey), `EN missing ${route.titleKey}`).toBeTruthy()
      expect(resolveKey(en, route.descriptionKey), `EN missing ${route.descriptionKey}`).toBeTruthy()
      expect(resolveKey(fr, route.titleKey), `FR missing ${route.titleKey}`).toBeTruthy()
      expect(resolveKey(fr, route.descriptionKey), `FR missing ${route.descriptionKey}`).toBeTruthy()
    }
  })
})

describe('QA risk map — showcase crashes / critical journeys', () => {
  it('Playwright critical-path suite covers home, projects, Camera FX, QA Lab, FR contact, 404', () => {
    for (const needle of [
      "goto('/')",
      "goto('/projects')",
      "goto('/projects/cameraFx')",
      "goto('/projects/qaLab')",
      "goto('/fr/contact')",
      'this-route-should-not-exist-qa',
    ]) {
      expect(E2E_CRITICAL, `E2E missing journey for ${needle}`).toContain(needle)
    }
  })
})

describe('QA risk map — CI quality gates', () => {
  it('CI runs the pyramid gate order: lint → i18n → unit → server → build → e2e → smoke', () => {
    const order = [
      'npm run lint',
      'npm run test:i18n',
      'npm run test:unit',
      'npm run test:server',
      'npm run build',
      'npm run test:e2e',
      'npm run test:smoke',
    ]
    let cursor = -1
    for (const step of order) {
      const idx = CI_YML.indexOf(step)
      expect(idx, `CI missing gate: ${step}`).toBeGreaterThan(-1)
      expect(idx, `CI gate out of order: ${step}`).toBeGreaterThan(cursor)
      cursor = idx
    }
  })
})
