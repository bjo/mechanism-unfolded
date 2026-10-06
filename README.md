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

Eight foundation chapters with eleven interactive experiments: crank/four-stroke, valve timing/four cylinders, air/fuel/ignition, lubrication/cooling, clutch/manual transmission, open differential, steering/suspension, and hydraulic braking/a guided drive. The engine experiments are preserved as chapter steps. Advanced modules remain a clearly labeled plan.

Run `node tests/car-mechanics.cjs`, `node tests/car-systems.cjs`, and `node tests/car-foundations.cjs`. For actual Three.js assembly verification, pass the path to the official Three.js 0.160.1 CommonJS build to the last test, optionally followed by a browser snapshot JSON. `car.html?chapter=5&audit=1` exposes read-only `data-audit` on the canvas. See [CAR-FOUNDATIONS.md](CAR-FOUNDATIONS.md) for sources, constraints and explicit simplifications; [CAR-DESIGN.md](CAR-DESIGN.md) records the original engine development.

The watch chapter map continues to use its own curriculum catalog; this release does not change watch lessons or camera controls.
