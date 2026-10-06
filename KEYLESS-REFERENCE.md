# Three-position keyless works: reconstruction contract

Construction reference: Sellita SW220-1, technical documentation revision 06,
22 August 2025. This replaces the previous assumption that an isolated yoke and
three independently positioned face wheels explain a real three-position keyless
mechanism.

Primary source: https://sellita.ch/scripts/calibres/images/DocTec_SW220-1.pdf

## Confirmed by the manufacturer

- Page 3: pushed-in position winds; the intermediate position corrects the date
  and day; the outer position sets the time.
- Pages 6 and 11: sliding pinion 2, winding pinion 3, stem 4, double-corrector
  operating lever 5, setting lever 6, yoke 7, setting-lever jumper 8.
- Pages 6, 9 and 16: setting wheel 36, double corrector 37, minute wheel 39.
- Page 11: the yoke engages the sliding pinion's central groove; the pinion's
  working ends are outside this groove. The winding pinion is a separate body.
- Page 11: the corrector lever, setting lever, yoke and jumper occupy distinct
  axial layers. The jumper is not the lever that takes the stem's pull.

## Evidence boundary

The assembly drawing establishes identities and assembly order, but does not
dimension the working cam profiles or show all three positions in operation.
Do not present guessed cam contours, an extra rack, or a slot generated to fit
desired animation endpoints as a reconstruction of this movement.

The existing SW210-inspired going train, GMT, moon-phase and Seiko-inspired
chronograph remain separate teaching models. SW220-1 is not a reference for
their entire construction or for a moon-phase quickset.

## Required acceptance checks

1. Stem groove retains the setting-lever pin throughout pulling and pushing.
2. Setting-lever motion reaches the yoke through its actual working contact.
3. Yoke and its working shoe form one rigid body, with the shoe remaining in
   the sliding-pinion groove throughout the stroke and winding overrun.
4. Winding and setting teeth lie on opposite ends of that groove. The yoke
   must not pass through either rotating tooth set.
5. Three detents have a visible spring, fixed reaction anchor and follower;
   the spring's shape may deform, but rigid levers must retain their dimensions.
6. The corrector operating lever and setting wheel select the correction and
   time-setting outputs; independent output flags are insufficient evidence.
7. No output starts while the stem is still travelling to its selected detent.
   Queued demonstration controls must start after seating rather than be lost.
8. Inspect both directions and every intermediate pose, using actual rendered
   landmarks and axial extents. Inject disconnected, colliding and prematurely
   driven samples so that an always-passing auditor cannot satisfy acceptance.
9. Mounted and enlarged views use the same parts and state. Crown selection
   never moves the camera.

## Implemented teaching assembly

The shared assembly now includes the stem groove, setting lever and contact pin,
rigid yoke/shoe, square-bore sliding pinion with two working ends, separate
winding pinion, flexible detent jumper, return spring, and a pivoted correction
selector. Its moving setting wheel selects the correction output or the shaft
leading to the existing minute wheel. Mounted and inspection views share these
bodies. Crown input is held until the selected position is seated.

The guide rails on the setting lever are an explicitly **unverified educational
contact profile**, fitted to this site's existing output locations. They are not
a traced SW220-1 cam or a verified reconstruction of its corrector-lever contact.
Likewise the widened layout, gear counts, winding face dogs and spring outlines
are not manufacturer dimensions. The UI links the original drawing and states
these limits. This release improves the visible connections; it does not close
the manufacturer-profile verification item above. In particular the existing
weekday reverse correction remains a display demonstration with its downstream
corrector omitted, as stated in the calendar lesson.

## Verification

- `node tests/keyless.cjs`: 4,001 selection poses, 101 overrun poses, 12 injected
  faults. Rigid lengths, groove retention, output pitch clearance and contact.
- `node tests/keyless.cjs <rendered-snapshots.json>` checks actual rendered yoke,
  setting lever and carrier landmarks; stem-groove alignment; guide, jumper and
  return-spring contact; and unit scales. Browser samples include both directions.
- Existing crown-transition, calendar, weekday and chronograph tests remain
  required. Mesh diagnostics cover pitch distance, axial overlap and module;
  they do not certify tooth-flank conjugacy or whole-model collision freedom.
- The winding idler is supported from above to avoid a floor pillar passing
  through the barrel. The setting-lever body is above its yoke contact layer;
  the pin, rather than the lever body, reaches the working surface.

Status: connected educational assembly implemented; exact SW220-1 cam profiles,
full tooth contact and the downstream weekday corrector remain unverified.
