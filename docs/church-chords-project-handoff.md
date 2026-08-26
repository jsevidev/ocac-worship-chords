# Church Chords — Project Handoff

## Goal

Digitize a physical chord notebook (multiple notebooks, each with a table of
contents) into a free, online, searchable version. Must support adding new
songs going forward. Zero ongoing cost — no hosting fees, no paid tools.

## Context that shaped the decisions

- Original sheets have **no lyrics** — just chord names with a number above
  each chord indicating how many **beats** to hold it.
- Sections (Intro, Verse, Chorus, etc.) are marked with **roman numerals**
  (I, II, III...), matching the notebook's own convention.
- When a section repeats, the original notebook just writes the roman
  numeral again at the bottom with no chords under it — meaning "go play
  that section again."
- Handwriting in the notebooks isn't consistent enough for OCR to be
  reliable, so **transcription is manual**, not scanned/automated.
- Open question, not yet resolved: whether section labels (I = Intro,
  II = Verse, etc.) mean the same thing in every song, or vary song to song.
  Worth confirming before assuming a fixed legend anywhere on the site.

## Architecture: two separate things

**1. The builder (private, desktop use only)**
A standalone tool for transcribing notebook pages into the site's file
format. Not part of the public website. Only whoever is doing transcription
uses it.

**2. The Jekyll site (public, what people actually browse)**
A static website generated from files the builder produces. Free forever on
GitHub Pages. No database, no backend server.

They don't talk to each other directly — the builder's job ends when you
download a `.md` file, the site's job starts when that file is pushed to the
repo.

---

## 1. The builder tool

Delivered as a standalone HTML file: **`chord-sheet-builder.html`**
(already generated in this conversation — carry that file over as-is).

What it does:
- Fill-in-the-blanks form: song title, notebook #, page #, then add
  sections (roman numeral + beat/chord pairs), or mark a section as
  "repeat reference only" (numeral with no chords).
- **Guarantees beat numbers align exactly above their chord**, regardless
  of name length (e.g. `10` above `Bm7`, `4` above `G`) — this was a
  specific pain point since hand-aligning them by spacebar is error-prone.
  Alignment algorithm: for each beat/chord pair, pad both strings to
  `max(len(beat), len(chord))`, left-align, join columns with a
  fixed-length separator (`"  -  "` on the chord line, 5 spaces on the
  beat line) so later columns stay aligned too.
- Live preview of the exact output that will be saved.
- Saves drafts locally via the artifact's persistent storage
  (`window.storage`, private/per-user) so work isn't lost between sessions.
  Saved songs show in a list with Load/Delete.
- "Download .md" produces the exact file to drop into the Jekyll site's
  `_songs/` folder.

Known gap / possible next step: it does not push to GitHub directly — the
user manually downloads then commits. Deferred until it's confirmed to
actually be a workflow pain point (rather than added speculatively).

## 2. The file format (what the builder outputs, what the site reads)

One markdown file per song. Front matter for metadata, a fenced code block
for the chord chart so spacing/alignment survives exactly as typed:

```markdown
---
title: "Amazing Grace"
notebook: 1
page: 12
---
```
I
4      2      4      4
G  -  A  -  D  -  C

II
4      4
Em  -  C

I

III
2      2      4
D  -  C  -  G

II
```
```

Rules encoded in this format:
- A roman numeral alone (no chord lines under it) = "replay that section."
- Beats line sits directly above its chord line, same column widths.
- Blank line between chord lines within a section; blank line between
  sections.

## 3. The Jekyll site

Delivered as a full repo folder: **`church-chords-site/`** (already
generated in this conversation — carry the whole folder over).

```
church-chords-site/
  _config.yml         Jekyll settings — defines the "songs" collection
  _layouts/
    default.html       shared page wrapper (header + stylesheet link)
    song.html           renders one song's title, meta, and chord block
  _songs/
    amazing-grace.md    example song, matches the builder's output format
  assets/
    css/style.css        site styling, tuned for on-stage/phone readability
    js/search.js          client-side live search, no backend
  index.html             homepage — song list grouped by notebook, searchable
  README.md               setup + "how to add a song" instructions
```

Design choices worth knowing:
- **No database.** `site.songs` (every file in `_songs/`) is queried
  directly in Liquid templates at build time. Adding a song = adding a
  file.
- **Search is client-side JS** filtering on song title text — no server,
  no API, no cost.
- Grouped by notebook on the homepage, sorted alphabetically within each
  notebook.
- Chord blocks render in a monospace font at 16px (15px on small screens)
  — deliberately not smaller, since alignment needs to stay legible on a
  phone propped on a music stand. Worth field-testing on an actual phone
  before finalizing size.
- Visual theme: warm paper background, ink/charcoal text, brass accent —
  consistent between the builder tool and the public site so they feel
  like one product.

## 4. Deployment (free, no purchases)

1. Push `church-chords-site/` to a new GitHub repo.
2. Repo Settings > Pages > Source = Deploy from branch, branch = main,
   folder = / (root).
3. Site goes live at `https://<username>.github.io/<repo-name>/` within a
   minute or two of each push. No further cost, no renewal.

## 5. Ongoing workflow (adding a new song)

1. Open the builder tool, fill in the song, download the `.md` file.
2. Drop it into `_songs/`.
3. Commit and push (or edit directly in GitHub's web UI for non-technical
   contributors — no local setup needed for that path).
4. Site auto-rebuilds and updates live within about a minute.

## 6. Not yet done / open items for whoever picks this up

- Confirm whether roman-numeral section meanings are consistent across all
  songs (see "Context" above) — affects whether a legend/key belongs
  anywhere on the site.
- Update `_config.yml`'s `title:` field to the actual church name (still
  a placeholder).
- Field-test chord font size on a real phone in actual stage lighting.
- Bulk-transcribe the existing notebooks using the builder tool.
- Optional future feature, deliberately deferred: direct GitHub commit from
  inside the builder tool (skip the manual download-then-push step) — only
  worth building if manual transcription proves it's actually a bottleneck.
