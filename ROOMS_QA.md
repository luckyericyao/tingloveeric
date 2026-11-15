# Rooms Regression

Build the current worktree before running browser checks:

```sh
npm run build
npm run qa:rooms
npm run test:access
npm run test:access:integration
npm run test:narrative
npm run lint
```

`qa:rooms` starts an isolated production build with random test credentials and
a loopback-only Redis REST fixture. It closes the server, fixture and browser
on completion or failure. Test letters never enter the production database.

## Covered Behavior

- 1440x900 desktop and 390x844 Chromium touch emulation.
- Cat portrait texture readiness, keyboard/touch response, repeated clicks,
  recovery to open eyes, and unchanged layout under reduced motion.
- Photo viewer modal state, contained keyboard focus, arrow navigation,
  mobile swipe, Escape, restored opener focus and body scrolling.
- A shared letter does not make the next letter shared by default.
- A failed or non-durable save retains the typed letter; retrying a lost
  response does not create a second letter.
- Room images decode, guest letters have no composer, no horizontal overflow.
- Map photos remain large, Boston selection works, guests have no map editor.
  `qa:local` also forces a photo failure and checks stable mobile positioning on retry.

Screenshots are written to `.audit/current-map/`. Inspect the actual images;
passing DOM assertions alone is not visual approval. The cat response lasts
650ms, so a slow screenshot may capture its restored open-eye state.

## Boundaries

These checks do not certify physical iOS Safari, live deployment, persistent
production letter storage, the first-minute audio timing or the complete film.
Use `qa:story`, `qa:story:mobile`, `qa:recovery` and `qa:visual` separately for
their corresponding checks. Do not replace the locked opening while refining
the rooms. Do not create new statements attributed to Ting or shared promises.

New UI changes remain local until a separate push/deployment is verified.

## 2026-09-23 Integration Check

After the room interactions, warmer tender-moments section and staggered film
captions were implemented, the isolated production desktop journey passed
`QA_AUDIO=1 QA_FULL_FILM=1 node scripts/map_browser_qa.mjs`:

- Fresh session, actual audio playback; no seeking.
- Entry absent at 55 seconds, available only after 60 seconds.
- Opening-to-film audio source handoff, pause/resume, reload resume and mute.
- All six chapters played automatically without memory-object clicks.
- Actual film completion, usable map exit, film audio stopped on the map.
- Desktop and mobile map selection/image/overflow checks passed.

The follow-up run with `QA_AUDIO_MOBILE=1` passed the same complete, unseeked
journey at 390x844 in Chromium touch emulation: first-minute gate, audio handoff,
pause/resume/reload/mute, all six automatic chapters, actual audio completion,
map exit and stopped film audio. Both runner processes exited successfully.

These are local production-build checks, not physical-device Safari
certification. No deployment or live-site verification was performed by them.
