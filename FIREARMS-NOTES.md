# Firearms through history — first release

12 planned chapters, chapters 1–4 published. Museum interpretation in Korean; not an operational weapon reconstruction. Chapter links use firearms.html?chapter=1 through 4. Future chapters are clearly marked as planned, with no empty workbench links.

## Sources and historical boundaries

- [The Met, Hand Cannon (Chong), 1424](https://www.metmuseum.org/art/collection/search/26591): dated Chinese bronze artifact. Date identifies this object, not the invention of firearms.
- [The Met, Chinese matchlock, ca. 1750](https://www.metmuseum.org/art/collection/search/755608): technological exchange, prolonged coexistence, hunting and court culture. Its decoration is not reproduced.
- [National Army Museum, English-lock musket, ca. 1660](https://collection.nam.ac.uk/detail.php?acc=1992-08-199--1): historical example of flint ignition. Its internal lock is not reconstructed.
- [The Met, wheellock pistol](https://www.metmuseum.org/art/collection/search/33779?searchField=All): separate wheel-based ignition tradition. Wheel and flint systems are not described as identical contacts or minerals.
- [The Met, Charles Moore pellet-lock pistols, ca. 1825](https://www.metmuseum.org/art/collection/search/33347): early percussion diversity. The text explicitly distinguishes pellet ignition from the generic cap concept; this source does not authenticate caplock geometry.

The learning sequence is not a global replacement timeline. Ignition, rifling, ammunition and feeding evolved along overlapping branches. References are linked for reading; no museum photographs were copied. Homepage illustration and 3D primitives are original.

## Visual contract and mechanism-audit scope

The 3D objects are static exterior category symbols. They are not dimensioned replicas, internal cutaways or moving firing assemblies. No trigger linkage, spring lock, chamber internals, loading procedure, real firing, ballistics, materials recipe or performance optimization is implemented. The conceptual SVG traces roles in energy conversion, not physical routes or real event timing. A single eight-second demonstration clock drives labels, diagram emphasis and exterior highlighting. It starts paused; 0.5/1/2 speeds and direct stage selection are available.

This deliberately separates historical evidence from illustrative geometry. No mesh contact, firing cycle accuracy or complete physical reconstruction claim is made. The mechanism-audit skill was used to bound the claims, avoid invented internal connections and check the timebase and view behavior. Since the meshes are static, there are no animated rigid-body dimensions or moving contact pairs to certify. Comparison uses the same builder for both category symbols; only the display scale/placement differs. Comparison and chapters retain the current camera. The reset-view button is the only automatic camera reset.

## Validation

Run `node tests/firearms.cjs`: chapter content, source URLs, 12/4 release boundaries, pause/speed/completion clock behavior, local assets and document hooks. Browser checks cover all four chapters, compare, both chapter-three variants, stage selection, playback end state, camera persistence, responsive layout, homepage navigation and console errors. These are interaction/content checks, not weapon-mechanics certification.
