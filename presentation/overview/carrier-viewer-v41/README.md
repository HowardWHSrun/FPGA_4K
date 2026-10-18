# Carrier V41 assembly and native routing viewer

Updated V41 data in the preserved assembly/layout viewer structure. Full assembly uses the current carrier browser mesh and source-backed simplified XEM/LDO attachment envelopes; nominal seating and physical fit remain unqualified.

Layout renders the exact hash-checked public V41 native KiCad file with the pinned KiCanvas renderer. It includes 738 tracks, 312 vias, 651 pad records and 21 zones across six copper layers; 89 footprint records include 82 fitted parts plus mechanical/mark/DNP records. The small `native/board.json` is the identity/configuration manifest, not a reduced geometry approximation. Public PCB model omissions do not modify electrical geometry.

Shared Three.js and KiCanvas dependencies stay at their preserved V16 published paths. No historical viewer asset or engineering CAD was edited. See `Viewer_Source.json` for source hashes and limits, and `assets/Model_Provenance.json` for the current carrier mesh preparation.
