# Chronograph construction baseline

The chronograph lesson now uses **Seiko 6139A** control topology. It supersedes
the former educational horizontal-clutch/rack-and-crosshead mechanism.

Primary reference: [Seiko 6139A Technical Guide](https://seikoserviceusa.com/uploads/datasheets/6139A.pdf).
Page numbers below are the printed service-guide numbers, not PDF sheet numbers.

## Why this reference

Patek CH 29-535 and Lange L951.5 manufacturer descriptions were useful comparisons,
but did not document every actuator and contact needed here. The 6139A guide
includes exploded parts, start/stop/reset states, clutch sections, finger adjustment,
and hammer-contact checks. One reference supplies the complete control topology.
The module therefore uses a vertical clutch; it does not retain a horizontal
coupling wheel, independent brake, reset rack, crank, or sliding crosshead.

## Source-to-model map

- pp. 3–4, fig. 6: fourth wheel, clutch ring and clutch spring on the central
  chronograph arbor. The continuously rotating green input and red measuring
  arbor remain concentric; the ring separates axially.
- p. 5, figs. 7–8: first pusher, operating lever/pawl, pillar-wheel ratchet,
  first coupling lever and second coupling lever. Pillars and the lower
  ratchet are separate working levels. A return spring and holding jumper
  retain the selection after the button returns.
- p. 5, fig. 9: second pusher, fly-back lever (the guide's part name), one
  pivoted hammer, two heart pieces, and a pillar/hammer reset interlock.
  This is stopped-only reset, not a running flyback complication.
- pp. 7–8, figs. 12–16: coupling levers raise the clutch ring; the minute
  jumper locates the minute recording wheel.
- pp. 9–10, figs. 21–24: elastic chronograph finger, intermediate minute wheel,
  and separate second/minute hammer faces. The finger and indexing star are
  below the transmission gears; hearts/hammer are above them.

## Explicit educational choices

The service guide is not dimensioned manufacturing CAD. The model uses inferred,
enlarged outlines, pivot coordinates, tooth counts, clutch travel, spring forms,
and clearances. Flat lever branches replace intricate stamped outlines while
retaining the referenced body/joint roles. The leaf finger bends by a
constant-length, quasistatic clearance model; material stress is not simulated.
The clutch's engagement transition is kinematic, not a friction/torque solver.

The base lessons retain their earlier watch. Its one-minute central input drives
this module through the green input tube. This is a teaching integration, not
a reconstruction of the entire 6139A gear train. The real 6139A does not have
the separate ordinary seconds hand retained here for comparison.

## Verification scope

### Axial and pusher follow-up

The intermediate arbor now overlaps the lower index star rather than ending above it. The upper coupling shoe has a rigid upright web to its lever. The shoes use inferred continuous lifting profiles, with the same fixed-body transform as their lever; the lower input wheel has a stepped coaxial friction seat so that its teeth do not cut through those profiles. These dimensions and shoe contours are educational reconstructions, not traced manufacturing sections.

The dished clutch spring has its inner rim against the measuring-arbor collar and its outer rim against the clutch ring. Curved return springs have explicit fixed anchors and working ends on lever surfaces. A skeleton support frame makes the otherwise omitted fixed pivot support visible. It represents the structural role of the bridge, not the outline of Seiko's actual bridge.

Start and reset pushers now translate along parallel case-side guide axes, with
the crown between them. The former perpendicular arrangement was an integration
error: internally consistent pad contacts did not establish correct placement
relative to the watch case. Both mounted and inspection assemblies use the same
orientation; the inspection includes a transform-matched copy of the real crown.
Their finite-width pads contact the rotated lever polygons. The reset lever
calculation includes both the heel radius and lever half-width; omitting that
width caused penetration. Guide bores clear the square rod diagonals and retain
the rods throughout the stroke.

### Case layout and rigid-body cleanup

`chronograph-layout.js` separates fixed case layout and contact calculations from
rendering. The operating, reset, coupling and hammer bodies are single extruded
union outlines, with fixed thickness and pivot bores. Overlapping box seams are
removed. Only the defined springs deform; plate vertices and unit scales are
checked through the input cycle. The first coupling plate is below its working
follower level so its body does not substitute for the pillar contact.

Rotating the control layout required relocating the minute counter and its
intermediate wheel: its shaft must clear the base watch's barrel and going train.
The counter remains driven through the same intermediate wheel and one rigid
arbor to its heart and hand. Hand orientation is compensated separately so zero
does not rotate with the module. These locations and stamped outlines are fitted
teaching geometry, not the factory's 6139A counter placement or dimensions.

The hammer's connecting arm routes outside both heart envelopes. Overwide faces
were reduced to the measured required contact footprint. Tests sweep exported
rendered hammer/heart contours over 2,050 angle combinations, check the finite
pad width, and retain the live stroke contact checks. A flat-face gap alone had
missed collisions with the connecting arm and with the other hammer pad.

`node tests/chronograph-linkages.cjs [render-samples.json]` checks the new contact records, guide axes, intermediate shaft overlap, lifting-face clearances, and a deliberately invalid sample. These augment the earlier tests rather than replacing the source checks above.

`node tests/seiko-chronograph.cjs` checks column-follower clearance through
24 indexes, both coupling levers, the reset-blocking pillar, both pivoted-hammer
faces over many starting angles, the spring finger's return clearance and
neutral-axis length, minute indexing, and start/stop/reset state boundaries.

`?audit=1` exposes `#advancedPanel.dataset.chrono`. The renderer measures heart
vertices against the actual transformed hammer faces, axial bounds of the
finger/transfer gear/heart, rigid lever lengths, and mounted/inspection copy
transforms. Both views include the same hands, shafts, pushers and geometry.
The old independent chronograph geometry and explainer have been removed.

These are named contact and kinematic checks. They do not constitute whole-body
collision detection, exact tooth-flank/backlash analysis, spring-force analysis,
or a manufacturing-accuracy certification. Additional measured geometry is
needed before making any of those claims.
