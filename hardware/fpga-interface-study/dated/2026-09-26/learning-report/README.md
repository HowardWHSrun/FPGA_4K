# Learn and present the 33 × 36 mm FPGA board

26 September 2026 · 130 components · 762 electrical endpoints · native CAD unchanged.

[Read the 33-page learning PDF](FPGA100T_Learning_And_Professor_Review.pdf) · [Editable LaTeX and source ledgers · ZIP](FPGA100T_Learning_Report_Source.zip) · [Standalone LaTeX](FPGA100T_Learning_And_Professor_Review.tex) · [Coverage](Report_Coverage.json).

Read pages 3–8 for the visual explanations, pages 9–11 for the pin maps, and page 14 for the professor briefing and questions. Pages 16–33 are the complete lookup reference. The appendices list the purpose of every component and the saved connection for every numbered electrical endpoint. The FPGA and connector maps label assigned, unfinished, unassigned and correction/review states explicitly.

This report uses the [current routing snapshot](../routing-33x36/README.md) and [later component/pin audit](../presentation-and-pin-labels/README.md). It records two required ground corrections at U1.L9/L10 and four FB2 grounding reviews at U2–U5 pin 4; it does not change the saved schematic or PCB. The native snapshot still has 146 unfinished assigned-net connections and 331 unassigned endpoints. The 117 ASIC assignments and proposed downstream data link remain unfinished. It is not a fabrication release.

The [earlier 26-page component/pin PDF](../routing-33x36/report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) is preserved as a historical record; its six NC markers are not six approved unused pins. The new learning report carries the subsequent corrections.

The drawings and pin coordinates derive from the saved native board. Front/back board views and connector maps are labeled with their viewing direction; connector maps are not mating-face instructions. Manufacturer references and Gerald’s original ASIC slides are cited in the report. Source identity and publication checksums are recorded in [the manifest](manifest.json).

[Final report verification](Report_Verification.json) and the [independent review](Independent_Final_Review.md) record 33 rendered pages, 130 component references and all 762 endpoint rows checked. All 21 independent checks passed. This checks document fidelity and readability, not electrical operation. The source ZIP includes the complete standalone TeX, portable source ledgers, coverage and verification records; it contains no native CAD changes.
