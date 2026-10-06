# Mechanism Unfolded

Interactive explorations that break down complex machines and technologies, one part at a time.

[Open the collection](https://bjo.github.io/mechanism-unfolded/) · [Mechanical watch](https://bjo.github.io/mechanism-unfolded/watch.html)

The first post explores a mechanical watch across 12 chapters, from its mainspring to automatic winding, date, GMT, moon phase and chronograph.

## Development

Run `python -m http.server 8765` from this Git checkout. Open `http://localhost:8765/`.

The site is static HTML, CSS and JavaScript; no build step is required. The watch loads Three.js from jsDelivr. Its geometry is an educational model, not manufacturing CAD.

## Publishing

Review and commit changes, then push to `main`. GitHub Pages deploys the repository root automatically. Keep all updates in Git.

## Mechanical regression checks

Apply `skills/mechanism-audit/SKILL.md` when changing mechanism geometry or motion.

- `node tests/mechanics.cjs`: timing, indexing contacts, ratios, reset cams, ratchets and state boundaries.
- `python tests/audit_faults.py`: verify the reusable auditor detects six deliberately injected faults.
- Open `watch.html?lesson=1&audit=1` to enable read-only DOM diagnostics. The main canvas exposes `data-mesh-audit`, `data-timing` and `data-keyless`; `#advancedPanel` exposes contact and full/inspection copy checks. These are calculated from actual rendered gear transforms, not just the design constants.

The October 2026 audit covered all 12 chapters, 39 registered spur-gear connections (40 with the chronograph clutch engaged), full/inspection transform equality, date 31-to-1, quickset direction, moon/minute indexing, automatic winding and reset interlocks. Re-run affected browser interactions after every mechanism change. Pitch-plane checks do not prove tooth-flank clearance, face-gear contact, friction, material deformation or manufacturing feasibility. Flexible fingers and quickset couplings remain explicitly simplified teaching models.

The chronograph control audit additionally samples the fixed-length operating pawl and column followers through start/stop, and checks actual rendered axial bounds for the minute finger against the return gear, both hearts and the chronograph wheel. The lower indexing star is joined by an arbor to the upper return gear. Reset uses an explicitly educational rack/crank/crosshead with separately sprung, guided hammers; it is not a replica of a particular calibre. `data-forbidden-contacts` reports only these named pairs, not a whole-model collision certificate.
