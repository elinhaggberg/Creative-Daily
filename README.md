# Creative Daily

A daily creativity prompt and a beautiful place to log whatever you make — a word, a poem, a photo, a sketch, a piece of music to riff off of. No streaks, no pressure: just a small "Day N" counter that only moves forward on days you actually create something.

Part of the [Make It Local](https://github.com/elinhaggberg) family of small, ad-free, local-first apps: no accounts, no cloud, no subscriptions. Everything you log stays on your device.

## Features

- **A daily prompt**, pulled from a rotating bank of words, subjects, famous artworks, literary quotes, and classical music pieces.
- **Capture however you like**: a Note, Poem, Short story, Image, Gallery of photos, or a Link — with a plain, minimalist text editor that grows as you write.
- **Multiple pieces per day** stack into a masonry layout: the first piece is full-width, and each one after arranges into columns underneath.
- **Day N, not a streak.** The counter only advances the next time you create something new — skipping days never resets it.
- **My Log** — every day you've ever logged, searchable and filterable by type or date.
- **Calendar catch-up** — missed a day? Tap it on the calendar to log something for it retroactively.
- **Share a day** as a PNG image, a JSON file, or print it to PDF (choose "Save as PDF" in the browser's print dialog — also works for a whole date range as a PDF booklet, from Export & manage data).
- **Storage management** — export a full backup, then optionally clear old photos to free up space. The entries themselves (text, type, date) always stay in your log.
- **Playful / Light / Dark themes**, with a choice of accent colors in Playful mode.

## Running it

This is a dependency-free, build-free Progressive Web App — plain HTML/CSS/JS. Serve the folder with any static file server and open it in a browser, or add it to your phone's Home Screen to install it like a native app.

```
npx serve .
```

## Data & privacy

Everything is stored locally in this browser (IndexedDB for entries and photos, localStorage for preferences) — there's no account, no backend, and no analytics. Removing the app from your Home Screen deletes its data too, so back up from the menu every so often.

## License

AGPL-3.0 — see [LICENSE](LICENSE).
