# Website workflow

This Git checkout is the source of truth. Make site changes here, review git diff, commit, and push authorized releases through Git. Do not upload replacement files through the GitHub browser UI.

- index.html, home.css, home.js: library homepage; home.js preserves legacy ?lesson= links.
- watch.html: mechanical-watch post. Keep its chapter links and homepage navigation working.
- No build step; GitHub Pages publishes main at the repository root.
- Verify changed navigation and desktop/mobile layout before publishing.
- Never add credentials or local authentication files to the repository.
