# Usage on supported Vivado host: vivado -mode batch -source run_clock_proof.tcl
# OFFLINE CLOCK/PIN PLACEMENT PROOF ONLY. No bitstream is emitted.
set here [file normalize [file dirname [info script]]]
set out [file join $here output]
file mkdir $out
create_project -in_memory -part xc7a100tcsg324-1
read_verilog [file join $here clock_pin_proof.v]
read_xdc [file join $here clock_pin_proof.xdc]
synth_design -top clock_pin_proof -part xc7a100tcsg324-1
set bg [get_cells -hier -filter {REF_NAME == BUFG}]
if {[llength $bg] != 8} {error "Expected eight preserved BUFG cells, found [llength $bg]"}
set capt [get_cells -hier -regexp {.*sample[1-8]_reg\[[0-9]+\]}]
if {[llength $capt] != 80} {error "Expected80preservedcaptureflipflops, found [llength $capt]"}
opt_design
place_design
route_design
report_io -file [file join $out io.rpt]
report_clock_utilization -file [file join $out clock_utilization.rpt]
report_route_status -file [file join $out route_status.rpt]
report_drc -file [file join $out drc.rpt]
report_timing_summary -report_unconstrained -file [file join $out timing_NOT_SIGNOFF.rpt]
write_checkpoint -force [file join $out clock_pin_proof_routed.dcp]
set f [open [file join $out pin_clock_sites.tsv] w]
puts $f "port\tball\tsite\tiobank\tclock_region"
foreach port [get_ports -filter {DIRECTION == IN}] {
 set ball [get_property PACKAGE_PIN $port]
 set pp [get_package_pins $ball]
 puts $f "$port\t$ball\t[get_sites -of_objects $pp]\t[get_iobanks -of_objects $pp]\t[get_clock_regions -of_objects [get_sites -of_objects $pp]]"
}
close $f
set bad [get_drc_violations -filter {SEVERITY == Error || SEVERITY == {Critical Warning}}]
if {[llength $bad]} {error "Inspect unsuppressed DRC findings: $bad"}
puts "CLOCK/PIN PLACE-AND-ROUTE FINISHED. External timing remains unqualified. No bitstream generated."
