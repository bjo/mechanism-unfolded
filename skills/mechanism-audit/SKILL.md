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
