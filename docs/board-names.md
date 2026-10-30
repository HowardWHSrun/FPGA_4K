# Board names · V1

Updated 30 October 2026 from Howard's selected PCB names.

| Canonical name | Board role | Current website review |
|---|---|---|
| **Direct LDO Carrier** | Connects XEM8305 to the existing LDO board. | [Direct LDO Carrier](https://howardwhsrun.github.io/FPGA_4K/?approach=direct#receiver) |
| **Frontend FPGA Board** | Artix-7 35T board in the frontend path. | [Frontend FPGA Board](https://howardwhsrun.github.io/FPGA_4K/?approach=custom#fpga) |
| **FPGA-LDO PCB** | Power companion for the Artix-7 Frontend FPGA Board. | [FPGA-LDO PCB](https://howardwhsrun.github.io/FPGA_4K/?approach=custom#routing) |
| **HDMI Extension Board** | XEM8310 breakout for eight HDMI cables to Frontend FPGA Boards. | [HDMI Extension Board](https://howardwhsrun.github.io/FPGA_4K/xem8310/) |

The Direct LDO Carrier and FPGA-LDO PCB serve different hardware paths. The existing LDO board in the direct path retains its original identity. The HDMI Extension Board is the XEM8310 eight-port design; the earlier XEM8305 host interposer V4 remains a separate historical design.

These display names provide stable navigation across the current website and repository landing page. Native KiCad project identifiers, component references, source filenames, revision numbers and dated historical notes remain unchanged. Each linked review records its own placement, routing, sourcing and qualification status.

The website is served from the repository's `presentation` branch. The September working draft and reference material in this `main` checkout retain their existing content and status.
