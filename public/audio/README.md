# Audio

The story playlist is configured in `src/data/storyWorld.ts`. It expects these
user-supplied, properly licensed files:

- `jiu-shi-ai-ni.m4a` (installed, entry theme)
- `wo-shi-yi-zhi-yu.m4a` (installed, second story track)
- `ymca.m4a` (installed, Eric profile theme)
- `forever-and-ever-and-always.m4a` (awaiting user-supplied audio)

After adding the files, set the corresponding track's `available` property to
`true`. The player starts after the visitor presses the entry button, advances
through the playlist, loops back to the first track, and exposes play, skip,
mute, and volume controls.

Do not commit audio copied from streaming services. Only add files the site
owner has permission to publish.
