"use strict";
const pins = JSON.parse(document.getElementById("pin-data").textContent);
const rows = Array.from(document.querySelectorAll("tbody tr[data-signal]"));
function selectPin(index) {
  const pin = pins[index];
  rows.forEach((row, i) => {
    row.classList.toggle("selected", i === index);
    row.querySelector("button").setAttribute("aria-pressed", String(i === index));
  });
  document.getElementById("detail-title").textContent = `${pin.signal} · ${pin.direction}`;
  document.getElementById("detail-route").textContent = `Verified LDO J1.${pin.ldo_j1} ↔ ASIC J2.${pin.asic_j2.join(", ")}. Proposed cable ${pin.proposed_cable_contact} ↔ XEM MC1.${pin.proposed_xem_mc1} / FPGA ${pin.proposed_fpga_pin} (Bank ${pin.bank}).`;
  document.getElementById("detail-function").textContent = pin.function;
  document.getElementById("detail-timing").textContent = `Timing context: ${pin.timing_context}.`;
  document.getElementById("detail-evidence").textContent = `Source evidence: ${pin.direction_evidence.join("; ")}.`;
}
document.querySelectorAll("button.pin").forEach(button => button.addEventListener("click", () => selectPin(Number(button.dataset.index))));
document.getElementById("direction").addEventListener("change", event => {
  const selected = { asic_to_xem: "ASIC→XEM", xem_to_asic: "XEM→ASIC" }[event.target.value];
  rows.forEach(row => { row.hidden = event.target.value !== "all" && row.dataset.direction !== selected; });
  const first = rows.findIndex(row => !row.hidden);
  if (first !== -1) selectPin(first);
});
selectPin(pins.findIndex(pin => pin.signal === "CLK32MHZ"));
