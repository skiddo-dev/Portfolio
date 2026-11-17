# bobbice.dev

Bob Bice's portfolio: a single static page served by GitHub Pages at [bobbice.dev](https://bobbice.dev).
No build step, no framework, no trackers.

## The idea

The site reads like a working spec. Light mode is spec paper; dark mode is a cyanotype blueprint.
Its one moving part is the results mapper: each row wires a business need to what was delivered and
what it changed, the way a data-mapping tool wires source fields to targets.

Type is a single variable family, Archivo (self-hosted, SIL Open Font License), where width
encodes role: expanded for headings, regular for reading, condensed for numbers.

## Files

```
index.html               the page
styles.css               tokens (light + dark), layout and components, in cascade layers
script.js                theme toggle, mapper wiring, screenshot viewer, section highlighting
fonts/                   Archivo variable font (latin subset) and its license
assets/                  product screenshots and design-lab captures
og.png                   1200x630 social preview
favicon.svg              the mark: two ports and a wire
Bob-Bice-Resume-BA.pdf   senior business analyst résumé (linked from the page)
Bob-Bice-Resume-AI.pdf   applied AI engineer résumé (linked from the page)
Bob-Bice-Resume.pdf      earlier one-page résumé (kept so existing links keep working)
CNAME                    custom domain for GitHub Pages
```

## Run locally

```bash
python3 -m http.server 8777
# then open http://localhost:8777
```

## Editing notes

- Mapper rows live in the `#mapper` table in `index.html`. Keep each row to a need, what was
  delivered, where and when, and one measured result. The wires are drawn by `script.js` from the
  rendered text positions, so rows can be added or removed without touching the script.
- When `styles.css` or `script.js` changes, bump the `?v=` query on their links in `index.html` so
  browsers don't serve a stale copy.
- The page honors `prefers-reduced-motion` and `prefers-color-scheme`; a chosen theme persists in
  `localStorage` under `bb-theme`.
