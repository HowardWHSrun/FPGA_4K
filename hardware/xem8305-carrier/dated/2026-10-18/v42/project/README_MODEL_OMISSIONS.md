# Model-free V42 engineering review copy

Open `CARRIER_XEM8305_V42_LED_Visibility.kicad_pro` in KiCad 10.0.6, keeping its local libraries and tables together. The single-page schematic, PCB, settings, rules, eight symbol libraries and eight footprint directories are included.

Only complete `(model ...)` and `(embedded_files ...)` source spans are removed from the PCB and footprint libraries. No geometry is redrawn or reserialized. All other tokens match authoritative V42; schematic, project, rules, tables and symbols are byte-identical. The source V42 PCB SHA-256 is `5f1c9069e03eae1fb0390e0198b944624d309b61d34292c1f078084b86564626`. The public PCB has a different hash because model payloads are omitted; see [equivalence receipt](../verification/Public_Review_Non3D_Equivalence.json).

No supplier STEP/STP/WRL bodies, vendor PDFs, account records or private correspondence are included. The source CAD remains intact. Model omissions mean this editable public copy cannot establish populated assembly clearances. The shared website's nominal component visualization is separate. This package is for review, not fabrication authorization.
