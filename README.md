# Ting & Eric

A private, cinematic relationship archive built with Next.js, React Three Fiber,
and Three.js. The homepage opens directly into a sweet, scrollable editorial
timeline; the real-time 3D night garden lives at `/cinema` and can be followed
from the prologue through seven story chapters.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

This repository was scaffolded with pnpm, so these commands also work:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Edit the homepage

The scrollable archive homepage is implemented in:

```text
src/components/ArchiveHome.tsx
src/components/ArchiveHome.module.css
```

Its generated hero collage lives at
`public/images/home/hero-memory-collage.jpg`. The first three timeline moments
reuse the real records configured in `src/data/originalCoordinates.ts`.

## Edit the 3D story

The homepage chapters, dates, places, quotes, camera positions, and memory links live in:

```text
src/data/storyWorld.ts
```

The source photos and the rest of the archive content still live in:

```text
src/data/love.ts
```

The two homepage companions are textured 2.5D Three.js characters implemented in:

```text
src/components/CatSprite3D.tsx
```

Their generated front, left, right, and blink textures live in `public/assets/cats/`. In `CatSprite3D.tsx`, `CAT_LAYOUT` controls the texture-plane proportions and tint. `CAT_STAGE_LAYOUT` controls the separate desktop/mobile foreground composition: `depth`, `openY`/`closedY`, per-cat `xOpen`/`xClosed`, `y`, `z`, `scaleOpen`/`scaleClosed`, and inward `yaw`. Entrance duration and overshoot are inside `useFrame`; the two `entranceDelay` props near the bottom of the component control the stagger. Blink intervals are set by the `seededDelay(...)` calls.

The pearl-winged guide and its curved flight path are implemented in `src/components/Butterfly3D.tsx`; edit the `path` control points to change its route, and the `targetScale` values to change its size.

Add a chapter in `storyWorld.ts` to extend the 3D route. Each chapter provides its own camera target, world position, artifact type, copy, and optional archive link. The real-time scene is implemented in `src/components/StoryWorldScene.tsx`; the music and interface controls are in `src/components/LoveStoryExperience.tsx`.

The current Shanghai photo is intentionally isolated at:

```text
public/images/shanghai-night-walk.jpg
```

Replace that file with a real photo using the same filename, or update `PhotoArtifact` to point to a new image.

The real-image chapter **The Original Coordinates** lives at `/coordinates`. Its narrative data is in:

```text
src/data/originalCoordinates.ts
```

Its five optimized source images are in `public/images/coordinates/`. The first 3D memory beacon links directly to this chapter. Add future memories to the data file rather than writing copy into the component.

## Music

The homepage starts **就是爱你** and keeps the player available while the
visitor scrolls. The cinematic story playlist is configured in
`src/data/storyWorld.ts`: its opening screen attempts the same song, then
clicking **进入故事** switches to **我是一只鱼**. Place properly licensed audio
in `public/audio/`, mark installed tracks as `available: true`, and see
`public/audio/README.md` for the exact filenames.
Profile-specific music can use the same optimized audio directory; Eric's
theme player is mounted on `/him` and is intentionally separate from the main
story playlist.

## Controls

- Gently scroll, swipe up, click the empty scene, or use the next button to start a chapter timeline.
- Cat, butterfly, and memory-object clicks are optional easter eggs and never block the story.
- The top controls provide playlist playback, skip, mute, volume, and a lower-power render mode when music is installed.
- `prefers-reduced-motion` automatically disables camera drift and switches to the simplified scene.

## Archive content

Edit these exports in `src/data/love.ts` to update the supporting routes:

- `coupleInfo`: names, site line, hero image path
- `importantDates`: dates used for relationship stats
- `stats`: homepage stat cards
- `heroImages`: layered hero collage images
- `memoryImages`: homepage bento gallery images
- `profileHerImages` / `profileHimImages`: profile page collage images
- `profileHerSweetProofs` / `profileHimCuteMoments`: sweet profile detail cards
- `profileHer`: `/her`, how he sees her
- `profileHim`: `/him`, how she sees him
- `timelineEvents`: `/story`, relationship timeline entries
- `moodOptions`: note composer mood tags
- `sweetWorldCards`: homepage "给她的小世界" cards
- `worldMapPlaces`: seeded places for `/world`
- `boardMoodOptions` / `boardSeedMessages`: mood tags and starter messages for `/board`
- `noteDecorImages`: visual cards for the notes page
- `frictionRecords`: `/story`, growth and understanding records
- `achievements`: `/achievements`, romantic badge collection
- `seedNotes`: initial note cards
- `futureLetters`: future letters section on `/notes`

## Notes behavior

The `/notes` page lets the two people add personal notes, with quick prompts
for a good-night, missing-you, or hug note. New notes are mirrored to
`localStorage` and synced through the protected `/api/notes` route. With KV
configured they are shared across devices; otherwise the room explains that
the fallback is temporary.

## Private features

The `/world` page lets the two people edit visited places, add future wishes,
restore seeded records, and remove custom pins. Changes are mirrored to
`localStorage` for offline continuity and synced through `/api/world/places`.
With KV configured, both people see the same map across devices; without it,
local development falls back to temporary server memory and the page explains
that limitation.

The `/board` page uses `/api/board/messages` and mirrors custom messages to
`localStorage` as a device-level fallback, so a temporary API failure does not
silently lose a newly written sentence. For persistent production storage,
set Vercel KV or Upstash Redis REST variables:

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

or:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Without those variables, the board uses server memory during the current
process and keeps a local browser mirror for the device that wrote the
message. Cross-device persistence still requires KV.
The world map uses the same KV variables and stores its edits under a separate
key. The protected API routes require the same `love_site_unlocked` cookie as
the private pages.

The public archive homepage, `/coordinates`, and `/cinema` stay directly viewable.
The private room hub is `/private`; its child rooms (`/world`, `/board`, `/notes`,
`/achievements`, `/her`, `/him`, and `/story`) use the same passcode gate. The
local fallback passcode is `5599`; set
`LOVE_SITE_PASSCODE` in deployment to replace it without putting the value in
the client bundle.

## Project structure

```text
src/app             App Router pages
src/components      Reusable UI components
src/data/storyWorld.ts  3D story, chapters, and music
src/data/love.ts    Editable relationship data
public/audio        Original score and replacement notes
public/images       Archive photos and fallback imagery
public/assets       Generated transparent cat and butterfly textures
scripts             Audio generation and browser visual QA
```

## Build

```bash
npm run build
```

If you use pnpm:

```bash
pnpm build
```

Run the browser-based visual and interaction checks against a running dev server:

```bash
pnpm qa:visual
```
