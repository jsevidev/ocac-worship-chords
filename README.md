# OCAC Worship Chords

Free, online, searchable chord sheets from the worship notebooks. Built with Jekyll,
hosted on GitHub Pages.

**Live site:** https://jsevidev.github.io/ocac-worship-chords/  
**Repo:** https://github.com/jsevidev/ocac-worship-chords

## Project layout

```
OCAC Chord Sheet/
├── _config.yml              Site settings and GitHub publish config
├── _layouts/                Jekyll templates (default, song)
├── _songs/                    One .md file per song (site content)
├── assets/
│   ├── css/style.css          Public site styles
│   ├── images/logo.jpg        Site logo and favicon
│   └── js/
│       ├── chord-display.js   Renders chord blocks on song pages
│       ├── fit-screen.js      Fit-to-screen scaling on song pages
│       ├── song-list.js       Homepage search and pagination
│       └── theme.js           Dark / light mode toggle
├── builder/
│   └── index.html             Chord sheet builder (live at /builder/)
├── docs/                      Project notes (excluded from the site build)
└── index.html                 Homepage / song list
```

## First-time setup

1. Push this folder to a GitHub repo.
2. In the repo: **Settings → Pages → Deploy from branch**, branch `main`, folder `/ (root)`.
3. After a minute or two the site is live at `https://<username>.github.io/<repo-name>/`.

The `docs/` folder is excluded from the Jekyll build (see `_config.yml`).

## Adding a new song

1. Open the [Chord Sheet Builder](https://jsevidev.github.io/ocac-worship-chords/builder/) (also linked in the site footer).
2. Fill in the song. Use **Copy line** / **Paste line** to duplicate repetitive chord rows quickly.
3. Click **Save .md** (links your `_songs` folder once, then saves there automatically) or download the file manually.
4. Commit and push. The live site updates within about a minute.

You can also add a song on GitHub: create a file in `_songs/` using the same format as `amazing-grace.md`.

## Section labels

Section labels are whatever you type in the builder (**Numeral** field): roman numerals (`I`, `II`), names (`Intro`, `Verse 1`), or anything else. The site displays your labels as entered — there is no fixed Intro/Verse legend.

A label alone on its own line (no beat/chord rows under it) means replay that section.

## Song file format

Every song is one markdown file in `_songs/`. Front matter requires `title`, `notebook`, and `page`. The chord content lives inside a triple-backtick code block and is rendered by `chord-display.js`. See `_songs/amazing-grace.md` for a full example.

## Features

- **Fit to screen** — song pages default to showing the whole chart on one screen (toggle **Scroll mode** to scroll normally).
- **Dark mode** — persisted in the browser.
- **Builder** — drafts in localStorage, optional `_songs` folder link, GitHub publish flow.
