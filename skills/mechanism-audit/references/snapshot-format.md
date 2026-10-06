# Snapshot adapter contract

Run `python scripts/audit_snapshots.py path/to/snapshots.json`. Exit 0 means the supplied checks passed, 1 means invariant failures, 2 means invalid input. Choose tolerances in the model's units and record why; never enlarge a tolerance just to pass a fault.

The root contains `samples`. Each sample has a unique descriptive `label` (mode, time, direction and view), plus any relevant fields below. Extract these from actual rendered transforms. Do not invent measured values from desired geometry.

- `parts`: objects with `id`, `center` [x,y,z] at the gear working-plane center, unit `axis` [x,y,z], `pitchRadius`, integer `teeth`, `faceWidth`, `omega` in radians per simulation second about that axis. Radii and widths include parent scale. The script handles external/internal parallel-axis spur meshes only.
- `meshes`: objects with `a`, `b` IDs, `type` (`external` or `internal`), `distanceTolerance`, `velocityTolerance` (linear units per simulation second), `moduleTolerance`, `minimumFaceOverlap`, optional `axisTolerance`. Tooth phase/backlash still needs a profile-contact adapter or visual verification.
- `contacts`: objects with `id`, signed measured `gap`, `minGap`, `maxGap`. Positive gap means separated, negative means penetration. Measure actual working surfaces at the sampled phase; permit intentional free clearance only in dwell/overrun states. These values are not computed by this script.
- `events`: objects with `id`, `actual`, `expected`, `tolerance` (e.g. one index per midnight, zero crown turns from rotor input). Expected values must come from the mechanical contract.
- `equivalences`: objects with `id`, numeric arrays `a`, `b`, `tolerance`. Normalize mounted/inspection poses to the same model frame first. For orientations use rotation matrices or consistently signed quaternions, not unwrapped Euler angles. Also useful for rigid-shaft pose deltas. Do not equate independent coaxial parts.

A complete audit needs multiple samples, not one still. Include first/mid/last contact, release, return, full-cycle boundaries, stopped state and speed changes. Exclude irrelevant checks explicitly rather than inventing placeholder zero values. The JSON output is diagnostic evidence, not a claim of full collision or physical simulation.
