# Mechanism Unfolded

Interactive explorations that break down complex machines and technologies, one part at a time.

[Open the collection](https://bjo.github.io/mechanism-unfolded/) · [Mechanical watch](https://bjo.github.io/mechanism-unfolded/watch.html)

The first post explores a mechanical watch across 12 chapters, from its mainspring to automatic winding, date, GMT, moon phase and chronograph.

## Development

Run `python -m http.server 8765` from this Git checkout. Open `http://localhost:8765/`.

The site is static HTML, CSS and JavaScript; no build step is required. The watch loads Three.js from jsDelivr. Its geometry is an educational model, not manufacturing CAD.

## Publishing

Review and commit changes, then push to `main`. GitHub Pages deploys the repository root automatically. Keep all updates in Git.
