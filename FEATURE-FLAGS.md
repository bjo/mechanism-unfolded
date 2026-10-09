# Release flags

`site-features.js` holds the shared `defaults.firearms` switch, currently false.

- Normal homepage: firearm story hidden, collection count 02.
- Normal `firearms.html` URLs: development notice, no application initialization.
- Preview: append `?preview=firearms` (or `&preview=firearms` when there is a chapter query). Same-site home and firearms links preserve this preview parameter. Nothing is stored in browser storage.
- Publish again by setting `defaults.firearms` to true and bumping the script version on both HTML pages.

This is a feature/release flag, not access control. Static source files remain accessible on the public GitHub Pages host and repository.
