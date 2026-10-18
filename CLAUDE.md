# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Public repo. Single-page Preact app: flip cards (cue cards) for the Goethe-Zertifikat A1 vocabulary list.

- Source list: https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf
- Card front: German word (with article/plural where the list gives them).
- Card back: meaning, sample sentence, and — only when the user chooses to reveal it — the English translation of the sentence.
- Learner marks each card known/unknown and re-reviews unknown ones. Persist this per browser (`localStorage`, keyed by word `id`); no accounts or backend.

## Design context

Read `PRODUCT.md` (users, principles, anti-references) and `DESIGN.md` (visual system) before any UI work. Phone-first, one-handed, short sessions.

Status: scaffolded and deployed. Tests not written yet.

## Stack

- Vite + Preact (`npm create vite@latest . -- --template preact`).
- Static build, deployed to GitHub Pages. Set `base` in `vite.config.js` to the repo path (`/goethe-a1-flipkards/`).
- No runtime API calls and no secrets: all vocab data is a committed static JSON file.

## Commands

- `npm install`
- `npm run dev` — dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the build locally
- Deploy: build, then force-push `dist/` (with `.nojekyll`) to the `gh-pages` branch. Live at https://games.aakkagam.com/goethe-a1-flipkards/ (org custom domain). No Actions workflow yet: the gh token lacks `workflow` scope.
- Regenerate vocab: `node scripts/merge-words.mjs <dir-of-chunk-N.json>` → `src/data/words.json`

## Data pipeline

Vocab is generated once, offline, and committed:

1. Extract entries from the Goethe PDF (word, article, plural, word class, the PDF's own example sentence where present).
2. Enrich with a **Haiku subagent** (`Agent` tool, `model: "haiku"`): English meaning, a sample sentence if the PDF lacks one, and the English translation of the sentence. Batch words per agent call; do not use the Claude API from the app.
3. Write the result to a single JSON file the app imports (e.g. `src/data/words.json`), one object per word:
   `{ id, de, article, plural, meaning, example_de, example_en }`.

Review Haiku output for wrong articles/translations before committing; the PDF is the source of truth for German forms.
