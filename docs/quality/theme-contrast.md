# Theme contrast fixes on main

Scope: main at 726790a, without merging the separate redesign branch. All five existing themes retain their backgrounds, accent identity, theme rotation, manual selection and cursor behavior.

## Changes

- Shared foreground, muted text, surface, form-border and focus tokens replace the conflicting inline light/terminal overrides.
- White button labels now sit on darker emerald, pink and blue gradients, including hover states. Terminal buttons use a solid deep green.
- Light mode uses dark accents and explicit dark-surface inheritance for tools/dialogs, rather than inverting their text indiscriminately.
- Legible muted labels, placeholders, QA output, statistics, interview panels, 404 text and footer branding.
- Opaque card surfaces protect readability over colorful background panels; header decoration no longer washes out language controls.
- Portal menu descriptions and the selected mobile menu link have stronger contrast.
- Python syntax uses semantic classes with distinct light/dark palettes. Comments, ghost guidance, caret and keyboard outline follow theme tokens.

## Verification

Windows, installed Microsoft Edge, local Vite app on port 5180. The companion JSON records final contrast counts per page/state. Audits cover all five themes at desktop (1440px) and phone (390px) widths. Populated project and article states use explicitly test-only intercepted API fixtures; no CMS data was changed and no messages were sent.

Checks include axe color-contrast, sampled rendered gradient backgrounds, open palette/More/mobile menus, chat, button hover, typed Python and keyboard form focus. Reduced motion is enabled for stable page audits; keyboard focus was also checked with normal motion. Screenshots were visually reviewed, including light mobile and terminal desktop.

- Unit tests: 96 passed across 23 files.
- Existing end-to-end tests: 12 passed in Edge using a temporary channel override.
- Lint: passed with `work/**` excluded. This untracked user directory has existing lint errors and was left untouched.
- Production build, 32 prerendered routes and PWA precache check: passed.
- Existing toolchain deprecation notices and i18n mixed-import warning remain; they are unrelated to contrast.

## Reproduce

Start the frontend in one terminal:

```powershell
npm run dev:client -- --port 5180 --host 127.0.0.1
```

In another terminal:

```powershell
$env:AUDIT_FIXTURES='1'
$env:AUDIT_LABEL='desktop'
node scripts/audit-theme-contrast.mjs
$env:AUDIT_WIDTH='390'
$env:AUDIT_LABEL='mobile'
node scripts/audit-theme-contrast.mjs
node scripts/audit-theme-interactions.mjs
```

Optional environment variables: `AUDIT_URL`, `AUDIT_ROUTES` (comma-separated paths), `AUDIT_STATES` (palette,navigation,chat,hover,editor,focus), `AUDIT_MOTION` (reduce or no-preference for interactions), and `PLAYWRIGHT_CHANNEL`. Audits use the installed Playwright, axe-core and sharp packages. Both audit entrypoints exit nonzero for detected contrast violations; detailed output and screenshots go to ignored `tmp/contrast/`.

## Limits

Axe cannot conclusively assess every gradient/image; its incomplete results are retained separately, never counted as passes. The supplemental sampler measures visible text against three points per rendered line with WCAG luminance ratios (4.5 normal / 3 large), allowing 0.05 rounding tolerance. It excludes disabled, hidden, clipped and occluded text and freezes transitions during its temporary foreground-hiding step. This is useful regression evidence, not a full WCAG certification or exhaustive proof for arbitrary uploaded images/content. Authenticated admin screens, camera permissions/live video, OS apps and every possible interactive state were not exhaustively audited.

No push or deployment was performed.

Final result: 200 page/state checks (75 desktop, 65 mobile, 50 interaction and 10 normal-motion keyboard-focus checks), with zero detected axe violations and zero supplemental sampled-text violations. See theme-contrast-results.json for individual coverage.
