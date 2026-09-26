# Full-system interface studies — not a release

This folder supplements the current core snapshot; it does not replace its native CAD. [The full-system development proposal](Full_System_Interface_Proposal.md) describes the proposed receiver, cable and power contract.

[The mezzanine view](mezzanine/Mezzanine_Fit.svg) depicts an intentionally unrouted 128-part placement study within 40 × 36 mm. The current core and this layout are different native revisions. All 120 new signal pads are unassigned. [The contact CSV](mezzanine/Mezzanine_Contact_Proposal.csv) proposes 117 named signals and three reserved contacts; all FPGA balls are TBD. [The independent review](mezzanine/Independent_Mezzanine_Review.md) records geometry, source-drawing ambiguity and mating-orientation limits. C92/R122, cable damping/protection and the full-system routing are not included in this fit study.

[AC_IN / IMP_TST source research](research/AC_IN_IMP_TST_Primary_Source_Review.md) explains why their electrical classification remains unresolved. [The power audit](Power_Electrical_Release_Audit.md) is dated design-review evidence: it identified the input-capacitor deficiency. The current core and fit study have adopted the corrected 1206 capacitors; later bank-rail and protection changes remain separate work.

Source: FPGA_100T_CSG324 local engineering development, 2026-09-26. Native files were inspected read-only; this web folder publishes selected evidence, not a fabrication package. Manufacturer PDFs remain linked at their primary sources. Private conversations/audio, experimental scripts and caches are excluded. The manifest records byte hashes; Markdown link destinations alone are adjusted for portability.
