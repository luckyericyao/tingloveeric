# 2.5D Cats And Butterfly Design QA

## Evidence

- Source visual truth:
  - `/Users/ericyao/.codex/attachments/50d4cb8a-b0ac-4dfd-bcb7-8f3f3ad13c7b/image-2.jpeg` (Nono: white coat, dark seal ears and eye mask, blue-grey eyes)
  - `/Users/ericyao/.codex/attachments/50d4cb8a-b0ac-4dfd-bcb7-8f3f3ad13c7b/image-1.jpeg` (Xiaoyi: silver-white coat, pale forehead markings, round grey-green eyes)
- Browser-rendered implementation:
  - `/tmp/ting-3d-story-desktop.png`
  - `/tmp/ting-3d-story-desktop-closed.png`
  - `/tmp/ting-3d-story-mobile.png`
  - `/tmp/ting-3d-story-mobile-closed.png`
  - `/tmp/ting-3d-shanghai-desktop.png`
- Desktop viewport: `1440 x 900`, local `/`, story entered with narration open.
- Mobile viewport: `390 x 844`, local `/`, story entered with narration open.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Nono is fixed on the left and reads immediately as a seal-bicolor ragdoll: white inverted-V face, dark ears and eye mask, pink nose, and blue-grey eyes.
- Xiaoyi is fixed on the right and reads immediately as a silver-white longhair: rounder face, silver crown and ears, pink nose, and grey-green eyes.
- The desktop pair now frames the story from the foreground: Xiaoyi on the lower left and Nono on the lower right, both turned slightly inward.
- Mobile uses independent open/closed scales and positions. Open narration keeps both faces above the reading surface; closing narration lets both cats settle larger into the lower corners.
- The butterfly is now a restrained pearl-white and pale-gold textured form with independent wings, a small 3D body, and no strong bloom.

## Required Fidelity Surfaces

- Fonts and typography: unchanged; the 3D model replacement does not alter the existing editorial type hierarchy or wrapping.
- Spacing and layout rhythm: the pair uses balanced left/right placement around one shared center and does not collide with the chapter rail or persistent controls.
- Colors and visual tokens: coat and marking colors are sampled by visual comparison from the references, then moderated for the existing dark moonlit scene.
- Image quality and asset fidelity: supplied photos were used as identity references for generated transparent sprites. Each cat has consistent front, left, right, and blink variants; no online stock imagery is used.
- Copy and content: unchanged; no new labels or explanatory UI were added to the cinematic scene.

## Comparison History

1. Replaced the basic-geometry cats entirely with curved textured planes and separate identity assets.
2. Added camera-relative dominant-view crossfades, asynchronous blinking, breathing, tiny head movement, restrained billboard limits, and contact shadows.
3. Removed the separate head-depth crop after foreground scaling exposed a visible double-face offset; the curved main plane and low-opacity rear layer retain subtle depth without ghosting.
4. Added a 1.02-second rise/fade/overshoot entrance with a 150ms stagger and initialized the cat group directly at the active chapter instead of letting it travel from the world origin.
5. Added separate desktop/mobile and narration-open/closed stage layouts, plus render culling for inactive transparent views.

## Interaction And Runtime Checks

- Enter-story flow, chapter advance, narration collapse, audio controls, quality mode, desktop canvas, mobile canvas, and reduced-motion canvas were exercised.
- `pnpm qa:visual` verifies all nine generated WebP assets, desktop/mobile/reduced-motion canvas output, routes, controls, console errors, failed requests, and horizontal overflow.

## Follow-up Polish

- P3: Fully groomed fur meshes would exceed the intended mobile budget; the enlarged 2.5D treatment prioritizes the fixed cinematic camera, face clarity, and identity fidelity.

## Implementation Checklist

- [x] Remove the sphere/cone/capsule cat construction.
- [x] Replace it with two generated, textured 2.5D cats.
- [x] Place Nono on the left and Xiaoyi on the right.
- [x] Match each reference's defining coat, mask, ear, eye, and face characteristics across view and blink variants.
- [x] Replace the old glowing butterfly with textured pearl wings and a curved flight path.
- [x] Preserve hover/click guidance and reduced-motion behavior.
- [x] Verify desktop and mobile composition.
- [x] Verify lint, build, routes, canvas rendering, and browser errors.

final result: passed
