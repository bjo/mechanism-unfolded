---
name: mechanism-audit
description: Detect, diagnose, and fix geometric, kinematic, contact, and interaction faults in educational 3D mechanisms. Use when building or changing moving mechanical models, cutaways, or linked inspection views; not for purely decorative 3D scenes.
---

# Mechanism audit

Make the depicted mechanism explainable through real connections. A plausible screenshot or a successful render is not evidence that it works. Preserve the user's chosen model and scope; do not replace it with a different mechanism to make checks pass.

## Establish the mechanical contract

Before changing geometry, identify the input, transmission, output, constraints, and source of energy. Separate rigid connections, freely rotating coaxial parts, gear meshes, friction couplings, one-way clutches, and intermittent contacts. Annotate intended simplifications and their consequences. Use authoritative technical material for uncertain mechanisms; do not infer a connection merely because objects look adjacent.

Use one parameter source for full-model and inspection geometry. Each part needs a stable ID, parent transform, axis, working surface or pitch plane, and state-driven pose. Use actual world transforms when checking the render. A second hand drawn to resemble a shaft connection does not prove that it belongs to that shaft.

Read [invariants.md](references/invariants.md) for checks relevant to gears, springs, indexing, clutches, and cloned views. For numerical runs, use [snapshot-format.md](references/snapshot-format.md) and `python scripts/audit_snapshots.py snapshots.json`. The script checks supplied measurements; it does not discover meshes, perform CAD collision detection, or validate measurements by itself.

## Ground the mechanism in an actual reference

When the purpose is to explain a real machine, select one identified model/revision as the construction baseline before repairing its topology. Compare other designs to understand alternatives, but do not silently combine their actuator, clutch, latch and reset architectures. Map every critical body, pivot, spring, contact and layer to a service drawing, manufacturer description, patent figure or clearly observable operating sequence. Record the viewing side before assigning rotation directions. Distinguish confirmed geometry, inferred dimensions and omitted detail.

A self-consistent invented mechanism is not a validated reconstruction. Formula-derived tests can prove internal consistency while preserving the original conceptual error. Require an independent source check for ratchet tooth handedness, driving/holding pawls, spring-loaded followers, interlocks and reset transmission. Do not invent replacement racks, extra gears or actuators merely because they animate easily. If evidence is insufficient, state the missing mechanism detail and leave that claim unverified; do not publish it as repaired by labeling it educational. Simplification must preserve the referenced kinematic topology and contact sequence.

## Preserve rigid-body dimensions

Declare each body rigid, articulated, or deformable. For rigid bodies, measure pairwise distances between actual rendered landmarks across the entire cycle, including release and inactive phases. Check animated scale, vertex edits and reconstructed endpoints. Comparing two equally distorted views cannot prove rigidity. Never resize a finger to force contact or clearance. A sliding/folding assembly requires separate fixed-size bodies and visible joints; a spring requires a justified deformation model, not arbitrary scaling. If clearance fails, revisit geometry and contact phase.

## Audit causality and forbidden contact

For each control, trace a complete input-to-output chain of bodies, joints, contact surfaces, latches and springs. Distinguish the control path (pusher selects a clutch) from the power path (gear train drives the hands). A button changing several independent state flags is not evidence of a mechanical connection. Show and sample the intermediate actuator and follower at press, contact, latch/index, return and blocked-input phases. Output must not change before its actuating contact or release event; include stored-energy release and overtravel accommodation explicitly. A decorative line between already animated endpoints fails this audit.

Maintain both intended-contact pairs and forbidden-contact pairs. Sweep the complete motion of long arms against nearby gears, cams, shafts and bridges, including reset/retraction phases and intermediate angles, not just detents. Check axial thickness as well as planar outlines. A finger assigned to an indexing star must clear its return gear and heart cam. If clearance requires a separate working layer, model the actual arbor connecting layers and verify the same construction in every view. Do not fix a collision by transparency, draw order or disabling depth tests. Report which pairs were checked; a spur pitch audit is not a collision audit.

## Detect before diagnosing

1. Reproduce the reported state with chapter, view, input position/direction, speed, time, and selected part. Keep a baseline. Include full model and inspection view, front/back/oblique perspectives, and relevant layers hidden/shown.
2. Run a complete input cycle. Sample immediately before contact, first contact, mid-stroke, release, and final detent; sample both directions and stop/resume. Test state boundaries such as 31→1, full spring, or reset from a nonzero position when they apply.
3. Export measurements from the actual geometry adapter or rendering pipeline, not a parallel reconstruction that repeats the intended formulas. Pure model tests complement, but cannot replace, this. Browser tools must follow their permitted interaction APIs; never reach into hidden application state through restricted evaluation. Prefer a documented, read-only DOM diagnostics surface, or a separate offline render adapter.
4. Check geometry and motion together: distance without axial plane overlap is not meshing; correct gear ratio without teeth phase can still overlap; a counter change without driver contact is not a mechanism.
5. Verify visible clarity: required connections must be visible in at least one purposeful view. Check opaque covers, transparent materials/depth ordering, clipping, labels, and controls obscuring the contact. Remove stale persistent overlays; do not force camera jumps to hide mistakes.

## Diagnose the first broken dependency

Trace input→output and stop at the first invariant violation. Classify it as coordinates/units, axis/plane, dimensions/phase, topology, timebase, state transition, transform-copy synchronization, or presentation. Check parent scale and mirrored axes before moving individual meshes. Identify whether source geometry, mounted copy, inspection copy, or all three are wrong.

Fix the shared specification or state transition first. Do not mask a bad connection with dashed arrows, arbitrary speed offsets, transparency, permanently separated parts, or extra decorative gears. For a deliberate educational simplification, show its boundary and keep the depicted input/output relationship truthful.

All coupled motion uses one simulation clock. Distinguish user input animation from powered motion and explicit demonstration time. On pause, all coupled parts freeze; on speed change, all use the same multiplier without phase jumps. At unrenderably high speeds disclose temporal aliasing and provide a readable slow mode; do not silently substitute an independent slow oscillator.

## Verify the repair and record evidence

Add a regression that would fail for the original fault, then rerun the affected cycle and connected neighbors. Inject at least one bad sample to prove the auditor can fail, not only pass. Check mounted/inspection equivalence from actual transformed poses, including dynamically changing child scales, visibility, and materials.

Use UI actions to verify controls, chapter transitions, pause/resume, and no new console errors. Save the decisive contact screenshot or short sequence; screenshots alone do not prove dynamic correctness. Report checked invariants, observed results, and specific unverified constraints separately. Do not call a kinematic educational model manufacturing-accurate or collision-tested unless it actually is.

Follow the repository's Git and release workflow. This skill does not grant publishing or external-action authorization. Finish authorized fixes; ask only for missing information that truly blocks them. Do not claim universal prevention: new mechanism types may need additional adapters and checks.
