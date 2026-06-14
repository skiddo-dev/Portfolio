# Bob Bice — Portfolio

A standalone, zero-dependency portfolio site. Hybrid focus: leads with Bob as the
maker, with a dedicated **Blueprint** product case study and a gallery of interface
explorations. Visual language echoes Blueprint's own design tokens (indigo/slate,
light + dark).

```
portfolio/
├── index.html      # single-page site
├── styles.css      # tokens + layout (light/dark via [data-theme])
├── script.js       # theme toggle, scroll reveal, count-ups, board shot toggle, lightbox
├── assets/         # product screenshots + exploration captures
└── README.md
```

## Run locally

It's plain static files — open `index.html` directly, or serve the folder:

```bash
# from repo root
python3 -m http.server 8777 --directory portfolio
# → http://localhost:8777
```

(There's also a `portfolio` entry in `.claude/launch.json` that does exactly this.)

## Deploy (free options)

No build step — point any static host at this folder.

- **GitHub Pages** — push the repo and set Pages source to `/portfolio`, or copy the
  folder to a `gh-pages` branch root.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the `portfolio/` folder, or
  connect the repo with publish directory `portfolio` and no build command.

## Content notes

- Screenshots live in `assets/` (copied from `docs/portfolio-assets/`). Swap them and
  the captions in `index.html` to refresh.
- Contact CTA points to `bob.c.bice@gmail.com` — update the `mailto:` link in
  `index.html` if needed.
- Honors `prefers-reduced-motion` and `prefers-color-scheme`; theme choice persists in
  `localStorage` (`bb-theme`).
