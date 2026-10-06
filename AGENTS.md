# Website workflow

This Git checkout is the source of truth. Make site changes here, review git diff, commit, and push authorized releases through Git. Do not upload replacement files through the GitHub browser UI.

- index.html, home.css, home.js: library homepage; home.js preserves legacy ?lesson= links.
- watch.html: mechanical-watch post. Keep its chapter links and homepage navigation working.
- No build step; GitHub Pages publishes main at the repository root.
- Verify changed navigation and desktop/mobile layout before publishing.
- Never add credentials or local authentication files to the repository.

Local Windows toolchain: if system Git fails in HTTPS transport, use `python ../git-tools/git-safe.py <git arguments>` in this checkout. This local wrapper uses official MinGit with explicit executable paths and the existing GitHub CLI credential helper. Do not copy authentication files into the repository.

For changes to moving 3D mechanisms, contact geometry, timing, or inspection views, read and apply `skills/mechanism-audit/SKILL.md`. Run the relevant mechanical regressions and browser contact-cycle verification before publishing. Purely editorial changes do not require a full mechanism audit.
