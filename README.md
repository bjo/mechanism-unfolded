# Mechanism Unfolded

Interactive explorations that break down complex machines and technologies, one part at a time.

[Open the collection](https://bjo.github.io/mechanism-unfolded/) · [Mechanical watch](https://bjo.github.io/mechanism-unfolded/watch.html) · [Internal combustion car](https://bjo.github.io/mechanism-unfolded/car.html)

The first post explores a mechanical watch across 12 chapters, from its mainspring to automatic winding, date, GMT, moon phase and chronograph.

## Development

Run `python -m http.server 8765` from this Git checkout. Open `http://localhost:8765/`.

The site is static HTML, CSS and JavaScript; no build step is required. The watch loads Three.js from jsDelivr. Its geometry is an educational model, not manufacturing CAD.

## Publishing

Review and commit changes, then push to `main`. GitHub Pages deploys the repository root automatically. Keep all updates in Git.

## Mechanical regression checks

Apply `skills/mechanism-audit/SKILL.md` when changing mechanism geometry or motion.

- `node tests/mechanics.cjs`: timing, indexing contacts, ratios, ratchets and state boundaries.
- `node tests/seiko-chronograph.cjs`: reference-based vertical clutch, column followers, reset interlock, pivoted hammer and elastic minute-finger regressions.
- `python tests/audit_faults.py`: verify the reusable auditor detects six deliberately injected faults.
- Open `watch.html?lesson=1&audit=1` to enable read-only DOM diagnostics. The main canvas exposes `data-mesh-audit`, `data-timing` and `data-keyless`; `#advancedPanel` exposes contact and full/inspection copy checks. These are calculated from actual rendered gear transforms, not just the design constants.

The October 2026 audit covered all 12 chapters, 39 registered spur-gear connections (40 with the chronograph clutch engaged), full/inspection transform equality, date 31-to-1, quickset direction, moon/minute indexing, automatic winding and reset interlocks. Re-run affected browser interactions after every mechanism change. Pitch-plane checks do not prove tooth-flank clearance, face-gear contact, friction, material deformation or manufacturing feasibility. Flexible fingers and quickset couplings remain explicitly simplified teaching models.

The chronograph has since been rebuilt around Seiko 6139A's vertical clutch and pivoted hammer. See [the source map and verification limits](CHRONOGRAPH-REFERENCE.md). Its old horizontal clutch, rack/crank/crosshead and separate sliding hammers were removed. The earlier 39/40 connection count describes the historical audit, not the rebuilt module. `data-forbidden-contacts` reports named pairs, not a whole-model collision certificate.

## Internal-combustion car

Six interactive chapters are available: slider crank, four-stroke cycle, timing belt/cams, inline-four, air/fuel/ignition, and oil/coolant circuits. Six later powertrain/chassis chapters are explicitly planned, not released. See [the construction contract](CAR-DESIGN.md).

Run `node tests/car-mechanics.cjs` and `node tests/car-systems.cjs`. Both accept a rendered snapshot JSON as an optional argument. `car.html?chapter=4&audit=1` exposes read-only `data-audit` on the canvas, derived from actual mesh transforms/vertices.

The watch chapter map uses the existing curriculum catalog. Its new keyless emphasis is presentation only: it preserves positions and camera during crown switching. Setting-jumper contact geometry is explicitly omitted, not invented from a reference screenshot.
