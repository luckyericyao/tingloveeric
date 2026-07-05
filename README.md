# 我俩

A private romantic relationship record website for Ting and Eric, built with Next.js App Router, TypeScript, and Tailwind CSS.

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

## Edit the content

Most relationship content is in one file:

```text
src/data/love.ts
```

Edit these exports to update the site:

- `coupleInfo`: names, site line, hero image path
- `importantDates`: dates used for relationship stats
- `stats`: homepage stat cards
- `profileHer`: `/her`, how he sees her
- `profileHim`: `/him`, how she sees him
- `timelineEvents`: `/story`, relationship timeline entries
- `frictionRecords`: `/story`, growth and understanding records
- `achievements`: `/achievements`, romantic badge collection
- `seedNotes`: initial note cards
- `futureLetters`: future letters section on `/notes`

The generated hero artwork is stored at:

```text
public/images/romantic-scrapbook-hero.png
```

## Notes behavior

The `/notes` page lets visitors add new notes in the browser. New notes are saved only in `localStorage`; no database or backend is used.

## Project structure

```text
src/app             App Router pages
src/components      Reusable UI components
src/data/love.ts    Editable relationship data
public/images       Site images
```

## Build

```bash
npm run build
```

If you use pnpm:

```bash
pnpm build
```
