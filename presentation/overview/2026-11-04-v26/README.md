# System overview V26 · 4 November 2026

The site root (`index.html`) is rebuilt from the [4 November presentation](../../meetings/2026-11-04-v16/). The previous root is preserved as [`overview-2026-11-02-v25.html`](../../../overview-2026-11-02-v25.html).

- **Boards shown:** Frontend FPGA Board V36 (edited 4 Nov 2026, 21:37 CST), HDMI Extension Board V29 (edited 4 Nov 2026, 13:27 CST), ASIC board PCB-5, Direct LDO Carrier V6 (sent to fab). FPGA-LDO PCB keeps its earlier V5 download while it is redesigned for a one-column stack.
- **This folder:** `app.js`, `overview.js` and `style.css` are copies of the deck's code with root-relative asset paths, `?approach=custom|direct|print`, and old links (`#overview`, `#fpga`, `#adapter`, `#receiver`, `#carriers`) mapped to the matching slide.
- **HDMI V29 assets** (`assets/`): exported from `2026-11-04_FPGA_Work/09_HDMI_Extension_Board_V29/` with KiCad 10. The native board is an unmodified copy, and the downloads come from its `order/` folder. The KiCad ZIP adds the project's `models/` folder; a fresh unzip gives DRC 0 violations, 0 unconnected, 0 parity.
- **Other assets** (Frontend, ASIC, 3D overview, print models, probes) are used in place from the 4 November deck. The 3D overview and print models still use the morning's HDMI V25 and Frontend V29 geometry.
- No design was changed, and nothing here is a fabrication release.
