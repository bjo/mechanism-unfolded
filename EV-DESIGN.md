# Electric vehicle: first release

## Curriculum
Seven basic chapters and five advanced chapters are listed in `ev-data.js`. Only 1–3 are released; planned chapters have no working-lesson links. Homepage adds EV as story 03; the firearms preview flag stays off.

## Reference and scope
- DOE architecture: https://afdc.energy.gov/vehicles/how-do-all-electric-cars-work
- Volkswagen APP310 topology (PSM, inverter, two-stage single-speed reduction): https://www.volkswagen-group.com/en/press-releases/in-brief-the-all-rounder-the-1-speed-gearbox-17030
- Motor principle: https://www.volkswagen-group.com/en/press-releases/in-brief-more-than-200-horses-in-a-sports-bag-the-electric-drive-in-the-volkswagen-id3-16799

This is a teaching reconstruction of the connection topology, not an APP310 CAD reproduction or performance predictor. Four parallel-axis spur gears substitute for production gearing; 20:60 and 20:60 produce 9:1. The intermediate pair is rigidly joined by one arbor in two axial layers. The output drives a closed differential representation; only straight-line equal wheel speeds are represented. No claims about differential internal contact geometry. Support bearings are illustrative, not a vehicle housing reconstruction.

Motor: one pole pair, six illustrative winding groups. Rotor N axis is local +X; requested positive torque places the resultant field at +90 degrees in the XY plane. The three normalized current bars and six opposed winding groups derive from one phase. Both sides of the rotor show its poles; the field arrow is at the rear inspection face. Wire paths connect inverter casing to winding rear faces. PWM, detailed winding ends and internal inverter semiconductors are omitted. These are not Maxwell field or torque calculations.

Battery: 3.7 V / 50 Ah teaching cells with selectable series/parallel counts. Twelve visible boxes are symbolic cell groups, not a changing cell-count reconstruction. SOC and thermal dynamics are not simulated. The bench holds RPM independently of pedal torque; no implied vehicle acceleration. DC power assumes 92% inverter/motor efficiency plus 0.3 kW auxiliaries, reduction efficiency 96%, tire radius 0.31 m. Limits: 180 Nm and 60 kW. All are illustrative and distinct from APP310 ratings.

## Mechanical contract
Input: pedal requests torque, test stand sets RPM. Battery DC supplies inverter, three-phase winding field applies rotor torque. Rotor/input gear share phase; first driven gear and second driver share phase; final gear, differential case and both wheels share phase under the stated straight-line condition. All are on one clock with a disclosed 1/600 time scale, including pause, single-step and speed selection. Cameras change only on explicit navigation. Full and close views are the same model, not rebuilt copies.

## Validation
`node tests/ev.cjs ../ev-snapshots.json` uses the actual Three.js model via a local Three 0.160.1 CJS installation (`../three-0.160.1.cjs`; not distributed). It checks 121 phase samples of rendered centers, working planes, scale and arbors, and 91 tooth-boundary samples for intrusion. Known center-gap and axial-layer faults must fail. Sampled tooth vertices are not an exhaustive continuous surface/contact solver.

`python skills/mechanism-audit/scripts/audit_snapshots.py ../ev-snapshots.json` checks the resulting transforms (2,057 checks). It does not discover collisions. Shaft-to-gear axial overlap, separation of intermediate gear layers and rotor/coupled phases are independently asserted. Unchecked: whole-vehicle collision sweep, dynamic bearing loads, real bevel differential, tooth stress, thermal/electrical transients.

UI review covers all three chapters, sizing controls, torque/power limit, playback and pause, explicit camera presets, part selection, homepage entry, planned chapter state and narrow viewport. The rendering dependency follows the existing site CDN convention; a WebGL/dependency failure displays a readable fallback.
