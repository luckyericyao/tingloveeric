# Ting & Eric

A private, cinematic love-story archive built with Next.js, React Three Fiber, Three.js, and an original ambient score. The homepage is a real-time 3D night garden that can be followed from the prologue through seven story chapters.

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

## Edit the 3D story

The homepage chapters, dates, places, quotes, camera positions, and memory links live in:

```text
src/data/storyWorld.ts
```

The source photos and the rest of the archive content still live in:

```text
src/data/love.ts
```

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

`public/audio/our-night.m4a` is an original 64-second ambient score generated for this project. Replace it with Ting and Eric's chosen track, then update `storyWorld.music` if the filename changes. Audio begins only after the visitor clicks **进入故事**, so browser autoplay rules are respected.

The generated score can be rebuilt with:

```bash
python3 scripts/generate_ambient.py
afconvert public/audio/our-night.wav public/audio/our-night.m4a -f m4af -d aac -b 96000
```

## Controls

- Click or touch the butterfly, cat, or illuminated memory artifacts to advance.
- Use the bottom timeline, arrow keys, or horizontal swipe to move between chapters.
- The top controls provide play/pause, mute, volume, and a lower-power render mode.
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

The `/notes` page lets visitors add new notes in the browser. New notes are saved only in `localStorage`; no database or backend is used.

## Private features

The `/world` page saves newly added map pins in the browser with `localStorage`, while the seeded map pins stay in `src/data/love.ts`.

The `/board` page uses `/api/board/messages` instead of browser-only storage. For persistent production storage, set Vercel KV or Upstash Redis REST variables:

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

or:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Without those variables, the board falls back to server memory for local development.

Set `LOVE_SITE_PASSCODE` to require a simple passcode gate before entering the site. If it is not set, the site stays open.

## Project structure

```text
src/app             App Router pages
src/components      Reusable UI components
src/data/storyWorld.ts  3D story, chapters, and music
src/data/love.ts    Editable relationship data
public/audio        Original score and replacement notes
public/images       Archive photos and fallback imagery
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
