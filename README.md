# OCAC Worship Chords

Free, online, searchable version of the church chord notebooks. Built with Jekyll,
hosted free on GitHub Pages.

## Folder structure

```
OCAC Chord Sheet/
├── builder/                  private transcription tool (not deployed)
│   └── chord-sheet-builder.html
├── _config.yml               site settings
├── _layouts/                 page templates
├── _songs/                   one .md file per song
├── assets/                   styling and search script
├── index.html                homepage / song list
└── docs/                     project notes (not deployed)
```

## First-time setup

1. Create a new GitHub repo and push everything in this folder to it.
2. In the repo, go to Settings > Pages > set Source to "Deploy from a branch",
   branch = main, folder = / (root).
3. Wait a minute or two. Your site will be live at
   `https://<your-username>.github.io/<repo-name>/`.

The `builder/` and `docs/` folders are excluded from the site build.

## Adding a new song

1. Open `builder/chord-sheet-builder.html` in your browser.
2. Fill in the song and click **Download .md**.
3. Drop that file into `_songs/`.
4. Commit and push. The live site updates automatically within about a minute.

You can also add a song directly on GitHub: open `_songs`, click "Add file",
paste in the same format as `amazing-grace.md`, and commit.

## Section numerals

Roman numerals are consistent across all songs:

| Numeral | Section |
|---------|---------|
| I | Intro |
| II | Verse |
| III | Chorus |
| IV | Bridge |
| V | Outro |

A numeral alone (no chord lines under it) means replay that section.

Edit the legend in `_config.yml` under `section_legend` if labels ever change.

## File format

Every song is one file in `_songs`, named anything ending in `.md`. The three
fields up top (title, notebook, page) are required. Everything inside the
triple-backtick block is displayed exactly as written, so beat/chord alignment
is preserved.
