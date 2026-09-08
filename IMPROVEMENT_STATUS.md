# Recipient Experience Improvements

Scope: the six goals from the 2026-09-07 audit. The homepage visual and 60-second opening remain locked; cat source artwork stays unchanged.

| Goal | State | Required evidence |
| --- | --- | --- |
| One opening, one transition into the film | Implemented, browser QA pending | First visit, return, refresh, audio failure browser tests |
| Pause, mute, exit and resume | Implemented, browser QA pending | Audio, captions and camera stop together; return restores position |
| Factual, recipient-friendly story | Implemented, visual pacing QA pending | No repetitive prelude material, invented facts or production instructions |
| Unified movie composition | Pending | All chapters at 1440x900 and 390x844; cats grounded and subtitles readable |
| Focused map and rooms | In progress | Guest editor and autosave removed; large map/photo, mobile selection and distinct room content still pending |
| Honest privacy and identity | In progress | Signed session tests, guest/owner API tests, private media tests, no implicit draft upload |

## Security Configuration

- `LOVE_SITE_PASSCODE`: invited-viewer passphrase, minimum 8 characters; no hardcoded fallback.
- `LOVE_OWNER_PASSCODE`: separate owner passphrase, minimum 12 characters. Missing means owner login is unavailable.
- `LOVE_SESSION_SECRET`: server-only signing key, at least 32 characters. Generate independently of both passphrases.
- Existing Redis environment variables remain in use for stored notes.

Missing or invalid security configuration fails closed. Existing legacy login cookies will no longer unlock the archive. Configure production before release; never commit real values.

Existing device-local notes are not deleted and are no longer automatically uploaded. Stored notes without explicit shared visibility are owner-only. Guest users can read only intentionally shared notes and cannot use the owner composer.

No deployment has been performed for this goal yet. Do not infer completion from unit tests or a successful build alone.

## Verified In This Pass

- Session unit tests pass: guest/owner role signatures, expiry, tampering, missing secret and legacy cookie rejection.
- Production integration tests pass on an isolated loopback server with all external storage disabled: page and media gates, guest mutation rejection, owner-only notes, explicit sharing and guest composer exclusion.
- TypeScript and focused ESLint pass. Production webpack build passes and includes `Proxy (Middleware)`.
- The original root `middleware.ts` was not included in the production artifact. The real entry is now `src/proxy.ts`, verified by HTTP requests, not merely source inspection.
- Turbopack did not complete in this environment; the build script uses the verified Next.js webpack production compiler.
- The old story/visual QA scripts describe the superseded double-prelude/no-controls flow. They must be updated before they can count as verification.
- Narrative regression checks pass: ten ordered beats, all six chapters, one first-meeting statement and one Switzerland passage, no opening repetition or money review, and no unverified couple silhouette in the projection list.
- The visitor's original-coordinates page no longer repeats the last-meeting interpretation and self-improvement review. The original data remains preserved; `/him` is owner-only.
- The world page now derives editing permission on the server. Guest renders omit editing controls and do not read or save local map overrides. Updated TypeScript and focused lint checks pass; browser layout checks remain outstanding.
- Map layout pass: removed the duplicate visitor introduction/statistics, reduced the title and cat framing, replaced the obstructing hover overlay with a large adjacent selected photograph, matched map container to its SVG aspect ratio on mobile, and enlarged marker hit geometry. TypeScript, focused ESLint and diff checks pass. This layout has not yet received browser screenshot verification.
- Map browser verification now completed in two rounds at 1440x900 and 390x844 using isolated temporary authentication and no external storage. Actual Boston selection and image decoding pass; no guest editor, horizontal overflow or page exceptions. Screenshots inspected in `.audit/current-map/`. Round two removes the stretched gold status strip and collapses the long coordinate list. Production webpack build and focused lint pass. Film and other rooms still require their own browser verification.

## Remaining Work

1. Test the real audio handoff and refresh/resume flow in the browser; add explicit silent recovery if audio is unavailable, and verify background/pause behavior.
2. Visually validate the recipient-oriented content and its pauses: 10 beats across six camera chapters, one first-meeting statement, one Switzerland/Guangzhou passage, two travel wishes, ordinary days and an open ending. No unconfirmed first-meeting date, location or dialogue was added. Financial reflection no longer appears in the film or the visitor's original-coordinates page; `/him` is owner-only.
3. Finish cat grounding and photo/subtitle composition without changing cat artwork.
4. Redesign the map's first screen and guest-only controls; make all four rooms distinct.
5. Complete two-round desktop/mobile visual QA and current regression tests.
6. Configure strong production credentials/signing secret before release. No real secrets have been generated or committed by this pass.

## Real-Time Audio Check

- `QA_AUDIO=1 node scripts/map_browser_qa.mjs` passes in the isolated production browser. It waits for actual playback, without seeking: entry absent at 55 seconds and available after 60 seconds, then direct `/cinema` handoff with a changed audio source. Audio pause, continuation, reload resume and mute pass without page exceptions.
- Fixed unguarded mute preference storage access so blocked localStorage cannot abort initialization or mute actions. Audio errors now clear buffering state.
- This is a desktop opening and short-film functional check, not full-film or mobile audio signoff. Caption/camera pixel stability, silent recovery and full chapter playback remain unverified.
- Inspected `.audit/current-map/audio-film-paused.png`: cats still look ungrounded and the first scene's middle is too empty. The composition goal remains pending, despite functional test success.
- Cat grounding code pass: the frame callback overwrote `layout.centerY` with zero, separating the sprite from its contact plane. It now preserves that baseline; stage offsets compensate, desktop left-cat scale is increased, and the camera-relative contact ellipse is no longer edge-on. TypeScript and focused lint pass. New screenshots are still required before this adjustment is accepted.
