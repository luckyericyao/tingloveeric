# Audio

The story playlist is configured in `src/data/storyWorld.ts`. It expects these
user-supplied, properly licensed files:

- `jiu-shi-ai-ni.m4a` (installed, opening-screen theme)
- `wo-shi-yi-zhi-yu.m4a` (installed, story-entry theme)
- `ymca.m4a` (installed, Eric profile theme)
- `forever-and-ever-and-always.m4a` (awaiting user-supplied audio)

After adding the files, set the corresponding track's `available` property to
`true`. The opening screen attempts to start `jiu-shi-ai-ni.m4a` immediately.
Pressing the entry button switches to `wo-shi-yi-zhi-yu.m4a`; the in-story
player then exposes play, skip, mute, and volume controls.

Do not commit audio copied from streaming services. Only add files the site
owner has permission to publish.
