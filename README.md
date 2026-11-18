# Ting & Eric

A private, cinematic relationship archive built with Next.js, React Three Fiber,
and Three.js. After the passcode, the homepage plays a 60-second opening. The
visitor can then enter the six-chapter film or browse the archive.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The passcode gate requires local server settings;
see [Private features](#private-features).

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

The homepage attempts **就是爱你** and offers a play button when the browser
requires a gesture. After 60 seconds of playback, **进入故事** opens `/cinema`
and switches to **我是一只鱼**. A cold film resume loads only the film track;
the entry and rooms do not preload either song. Place properly licensed audio
in `public/audio/`, mark installed tracks as `available: true`, and see
`public/audio/README.md` for the exact filenames.
Profile-specific music can use the same optimized audio directory; Eric's
theme player is mounted on `/him` and is intentionally separate from the main
story playlist.

## Controls

- The opening cannot be scrolled or skipped in a fresh viewing session.
- Film chapters advance with the track; interacting with either cat is optional.
- The film controls pause, resume, mute, and exit. The map link appears at the end.
- Reduced motion simplifies the scene. If the 3D scene cannot load or loses its
  context, an existing still image replaces it without restarting the track.

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

## Private features

The archive and its media require a signed viewer session. Configure
`LOVE_SITE_PASSCODE` (at least 8 characters) and `LOVE_SESSION_SECRET` (at least
32 characters). A separate `LOVE_OWNER_PASSCODE` (at least 12 characters) enables
the owner room and editors. There is no built-in passcode. Keep the values in
server settings or an ignored local environment file, never in Git.

The owner can write letters in `/notes`; visitors can read only letters
explicitly shared with them. Map edits in `/world` require explicit saving and
a current revision. Failed or conflicting saves leave the current input in
place. Without Redis, the editors cannot confirm a durable save. To configure
persistent storage locally, set Vercel KV or Upstash Redis REST variables:

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

or:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

The `/world` view uses local vector data from `world-atlas` for the world map
and `us-atlas` for the United States state map. It supports drag and wheel or
touchpad zooming, zoom controls, world/US view switching, selectable markers,
and the existing place editor without loading external map tiles.

The application gate does not make files already published in a public Git
repository private. Do not add private source records, raw screenshots or
secrets to Git.

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
