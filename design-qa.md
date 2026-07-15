# Paired 3D Cats Design QA

## Evidence

- Source visual truth:
  - `/Users/ericyao/.codex/attachments/50d4cb8a-b0ac-4dfd-bcb7-8f3f3ad13c7b/image-2.jpeg` (Nono: white coat, dark seal ears and eye mask, blue-grey eyes)
  - `/Users/ericyao/.codex/attachments/50d4cb8a-b0ac-4dfd-bcb7-8f3f3ad13c7b/image-1.jpeg` (Xiaoyi: silver-white coat, pale forehead markings, round grey-green eyes)
- Browser-rendered implementation:
  - `/tmp/ting-paired-cats-refined-desktop.png`
  - `/tmp/ting-paired-cats-refined-mobile.png`
- Full-view comparison: `/tmp/ting-paired-cats-full-comparison.png`
- Focused face and marking comparison: `/tmp/ting-paired-cats-focused-comparison.png`
- Desktop viewport: `1470 x 797`, local `/`, story entered, prologue narration open.
- Mobile viewport: `390 x 844`, local `/`, story entered, original-coordinates chapter, narration collapsed.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Nono is fixed on the left and preserves the reference's white body, dark ears, bilateral eye mask, central white blaze, pink nose, and blue-grey eyes.
- Xiaoyi is fixed on the right and preserves the reference's silver-white body, pale ears, restrained forehead stripes, pink nose, rounder face, and grey-green eyes.
- Both cats remain legible beside the active memory object on desktop and together within the unobstructed mobile 3D viewport.

## Required Fidelity Surfaces

- Fonts and typography: unchanged; the 3D model replacement does not alter the existing editorial type hierarchy or wrapping.
- Spacing and layout rhythm: the pair uses balanced left/right placement around one shared center and does not collide with the chapter rail or persistent controls.
- Colors and visual tokens: coat and marking colors are sampled by visual comparison from the references, then moderated for the existing dark moonlit scene.
- Image quality and asset fidelity: the supplied images are treated as identity references for purpose-built Three.js models. The stylized geometry is intentional because the requested destination is the existing interactive 3D world, not a photographic gallery.
- Copy and content: unchanged; no new labels or explanatory UI were added to the cinematic scene.

## Comparison History

1. Initial comparison found a P2 fidelity issue: Xiaoyi's forehead marking rendered as a heavy grey band, and both cats' eyes and white coats read too weakly in the dark scene.
2. Fixes applied: moved and reduced the silver crown, narrowed the three forehead stripes, brightened the white coats and chest ruffs, enlarged the eyes, and added cheek volume.
3. Post-fix evidence: the full and focused comparison images above show the two identities reading separately while preserving the site's sculptural 3D language.

## Interaction And Runtime Checks

- Enter-story flow, chapter advance, narration collapse, audio controls, quality mode, desktop canvas, mobile canvas, and reduced-motion canvas were exercised.
- `pnpm qa:visual` completed with zero console errors, zero failed requests, and zero horizontal overflow at desktop and mobile sizes.

## Follow-up Polish

- P3: Real fur cards or strand-based grooming could increase photorealism, but would conflict with the current low-detail sculptural world and materially increase mobile GPU cost.

## Implementation Checklist

- [x] Replace the single generic cat with two cats.
- [x] Place Nono on the left and Xiaoyi on the right.
- [x] Match each reference's defining coat, mask, ear, eye, and face characteristics.
- [x] Preserve hover/click guidance and reduced-motion behavior.
- [x] Verify desktop and mobile composition.
- [x] Verify lint, build, routes, canvas rendering, and browser errors.

final result: passed
