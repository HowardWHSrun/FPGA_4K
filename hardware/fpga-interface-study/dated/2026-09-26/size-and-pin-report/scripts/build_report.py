"""Build an auditable LaTeX report from the final native-board readback."""
import json,re,shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'data/Pin_Component_Audit.json').read_text())
E=D['endpoints']; C=D['component_ledger']; covered=set()
assert D['board_mm']==[33.0,36.0]
assert D['board_sha256']=='e2aa37d7b569608729ed44e2d7946d30d108c2124e244e9707d49e6ca25df3de'
def esc(v):
 s=str(v).replace('—',' -- ').replace('×',r'$\times$')
 return ''.join({'&':r'\&','%':r'\%','$':r'\$','#':r'\#','_':r'\_','{':r'\{','}':r'\}','~':r'\textasciitilde{}','^':r'\textasciicircum{}','\\':r'\textbackslash{}'}.get(c,c) for c in s)
def code(v):return r'\nolinkurl{'+str(v).replace('—','-')+'}'
def cellnet(e):return code(e['net']) if e['state']=='assigned' else r'\textcolor{muted}{'+esc(e['state'])+'}'
def mark(e):
 k=(e['ref'],e['pin']);assert k not in covered,k;covered.add(k)
def table(headers,widths,rows):
 def safecell(s):
  pieces=re.split(r'(\\(?:nolinkurl|url)\{[^}]*\})',s)
  return ''.join(x if i%2 else re.sub(r'(?<!\\)_',r'\\_',x) for i,x in enumerate(pieces))
 rows=[[safecell(s) for s in row] for row in rows]
 spec='@{}'+''.join('P{'+str(w)+'mm}' for w in widths)+'@{}'
 head=' & '.join(r'\textbf{'+h+'}' for h in headers)+r' \\ \midrule'
 return r'\begingroup\fontsize{9}{11.5}\selectfont\setlength{\tabcolsep}{2.8pt}\renewcommand{\arraystretch}{1.14}'+'\n'+r'\begin{longtable}{'+spec+'}\n'+r'\toprule '+head+'\n'+r'\endfirsthead\toprule '+head+'\n'+r'\endhead\midrule\multicolumn{'+str(len(headers))+r'}{r}{\small Continued on the next page}\endfoot\bottomrule\endlastfoot'+'\n'+'\n'.join(' & '.join(row)+r' \\' for row in rows)+'\n'+r'\end{longtable}\endgroup'+'\n'
out=[r'''\documentclass[11pt,a4paper]{article}
\usepackage[margin=18mm,headheight=15pt]{geometry}
\usepackage[T1]{fontenc}
\usepackage{mathpazo}
\usepackage{microtype,graphicx,booktabs,array,longtable,xcolor,xurl,fancyhdr,enumitem}
\usepackage[colorlinks=true,linkcolor=navy,urlcolor=teal,pdftitle={FPGA 100T - 33 x 36 mm placement and complete pin report},pdfauthor={FPGA 4K engineering review}]{hyperref}
\definecolor{navy}{HTML}{183047}\definecolor{teal}{HTML}{206676}\definecolor{muted}{HTML}{586775}
\newcolumntype{P}[1]{>{\raggedright\arraybackslash}p{#1}}
\urlstyle{same}
\setlength{\parindent}{0pt}\setlength{\parskip}{6pt}
\setlist{nosep,leftmargin=5mm}
\pagestyle{fancy}\fancyhf{}\fancyhead[L]{\small\textcolor{navy}{FPGA 4K / 100T}}
\fancyhead[R]{\small\textcolor{muted}{26 September 2026 / Placement revision 2}}
\fancyfoot[L]{\footnotesize Placement and net assignments only -- not for fabrication}
\fancyfoot[R]{\thepage}
\renewcommand{\headrulewidth}{0.3pt}\renewcommand{\footrulewidth}{0pt}
\setlength{\emergencystretch}{2em}
\begin{document}
{\color{teal}\large DESIGN REVIEW / 2026-09-26}\par
{\color{navy}\fontsize{29}{33}\selectfont Smaller FPGA PCB\\[3pt]Components and every pin}\par
{\large XC7A100T, CSG324 / 15 $\times$ 15 mm package}\par
\vspace{3mm}
\textbf{Result: a 33 $\times$ 36 mm native KiCad placement, retaining all 128 components and both 60-contact mezzanine connectors.} This removes 162 mm$^2$ (12\%) from the earlier 37.5 $\times$ 36 mm study, and 252 mm$^2$ (17.5\%) from the original 40 $\times$ 36 mm outline.

\textbf{Electrical status: unfinished.} This revision has no tracks, vias or copper zones. It preserves 47 assigned nets and has 383 unconnected items in KiCad. All 120 mezzanine signal contacts are still unassigned in the PCB. The proposed allocation of 117 ASIC signals plus three spare contacts is documented separately; it has not been wired to FPGA balls.

The report explains the reason for every retained component, lists every electrical endpoint, and identifies which connections exist only as CAD assignments. It does not certify that these values, the power system or the complete board are ready to manufacture.
''']
out.append(table(['Revision','Outline / area','Meaning'],[34,47,87],[
 ['Original study','40 $\\times$ 36 mm / 1,440 mm$^2$','Baseline connector-inclusive placement.'],
 ['Earlier compact','37.5 $\\times$ 36 mm / 1,350 mm$^2$','Preserved for comparison; 6.25\\% below baseline.'],
 ['This revision','33 $\\times$ 36 mm / 1,188 mm$^2$','All 128 parts retained; 39 front and 89 back.'],
 ['Native DRC','0 physical violations','383 unconnected items; no integrated-schematic parity check.']]))
out.append(r'''\textbf{How to use the report.} Read the design overview first. Appendix A explains every component; B lists all 324 FPGA balls; C lists the cable and mezzanine contacts; D lists the converter, flash and oscillator pins; E expands every assigned net into its complete list of connected endpoints. A matching CSV set preserves exact raw KiCad names and every physical pad.
\clearpage\tableofcontents\clearpage
\section{Smaller layout and the remaining empty space}
\IfFileExists{figures/Compact_Placement.png}{\includegraphics[width=\linewidth]{figures/Compact_Placement.png}}{\textbf{Native placement overview pending.}}

\textbf{Figure 1.} Native 33 $\times$ 36 mm placement, front and mirrored back. Only component geometry is shown; no connecting copper is present. The PCB rectangle is not the complete plug or mating-board envelope.

The reduction comes from repacking both faces and moving J5, J4, the back-side power groups, the clock group and selected support parts inward. U1 and J6 stay fixed. The existing converter groups retain their internal geometry. No decoupling capacitor, connector, flash, oscillator, strap or regulator was removed to obtain the smaller outline. There are no added debug headers, user LEDs or standalone test points in this candidate.

The front openings in the earlier core-only image are occupied by the two required mezzanine connectors in the complete placement study. The long back-side opening is mirrored relative to the front and can overlap a regulator or its required routing area on the opposite face. Empty drawing space therefore does not directly equal removable board area.

This is a demonstrated smaller placement, not proof of the smallest functional board. BGA escape, the power return paths, connector mating height, cable strain, protection components and thermal copper may require space that is currently blank. Assembly tolerances must be checked in addition to the saved CAD rules.
\textbf{Measured limits.} The smallest same-face courtyard-box gap is about 0.010 mm; the smallest fabrication-body-box gap is 0.360 mm. The nearest opposite-face courtyard-to-through-pad-box gap is 0.090 mm. The minimum copper-pad edge margin is 0.500 mm. These are native-geometry measurements, not approved assembly allowances.

J4's drawn body extends 0.65 mm beyond the PCB edge, giving a board-plus-drawn-body envelope of approximately \textbf{33.65 $\times$ 36 mm}; its courtyard extends 1.125 mm. The full mated assembly and plug envelope remain unverified. The earlier 37.5 mm and intermediate 34 mm candidates are preserved if routing or assembly needs more space.
\clearpage
\section{How the intended circuit works}
The following paths describe \emph{logical net assignments}. Every arrow still requires real copper in this placement. Parts and rails belong to the inherited 3.3 V boot/configuration version. The separate 1.8 V configuration / 2.5 V link-bank proposal is not integrated here.
\subsection{Power and sequencing}
J4.19 is assigned to \nolinkurl{LINK_12V}. It feeds the input capacitors and all four converters. This is a proposed custom power connection, not proof that an XEM8310 carrier or an ordinary micro-HDMI cable can safely supply it.
''')
out.append(table(['Path','Assigned circuit','Why it exists'],[23,86,59],[
 ['Core','U2.2 $\\rightarrow$ L1 $\\rightarrow$ '+code('VCORE_REG_1V025')+' $\\rightarrow$ R9 $\\rightarrow$ '+code('VCCINT_1V0'),'Powers FPGA logic and block RAM. R9 is a 15 milliohm series element.'],
 ['Auxiliary','U3.2 $\\rightarrow$ L2 $\\rightarrow$ '+code('VCCAUX_1V8'),'Powers FPGA auxiliary and analog supply domains.'],
 ['Boot / config','U4.2 $\\rightarrow$ L3 $\\rightarrow$ '+code('VCC_CFG_3V3'),'Supplies configuration I/O, flash, oscillator and pull-ups.'],
 ['ASIC-facing I/O','U5.2 $\\rightarrow$ L4 $\\rightarrow$ '+code('VCC_ASIC_1V5'),'Supplies selected FPGA I/O banks; external ASIC power delivery is not established.'],
 ['Enable chain',code('LINK_12V')+' enables U2; '+code('PG_CORE')+' enables U3; '+code('PG_AUX')+' enables U4 and U5.','Power-good sequencing intent. Startup and discharge behaviour still require validation.']]))
out.append(r'''The four TPS62135 converters use a local inductor, input and output capacitors, feedback divider and soft-start capacitor. Pin 11 is \textbf{VSEL}, tied to ground; it must not be mistaken for a second ground pin. Pin 3 is the ground pin. Pin 4 (FB2) is intentionally left open in this configuration. The pin roles were checked against TI's datasheet [1].

U2 senses the output \emph{before} R9. The nominal core voltage after R9 changes with current: a 1 A load produces about 15 mV drop and 15 mW dissipation in a 15 milliohm element. That arithmetic is not a load or thermal validation. FPGA activity, converter limits, capacitor bias loss and the actual supply tolerance still need analysis.

\subsection{Configuration, clock and programming}
U6 is the proposed 3.3 V configuration flash. U1.E9 drives its clock through R103; DQ0--DQ3 use R104--R107; U1.L13 controls chip select. The complete endpoint lists are in Appendices B--E. U6.7 is RESET/SIO3 for the stated Macronix part, not an assumed HOLD input [4].

R111--R113 encode M[2:0] = 001; R108--R110 pull up PROGRAM\_B, INIT\_B and DONE. R114 pulls PUDC\_B high. These inherited assignments document the master-SPI boot intent; compatible firmware, boot settings, reset recovery and a power-up test are not yet demonstrated [2].

Y1 provides a separate 32 MHz user clock. Y1.3 passes through R119 to U1.P17. Y1.1 is tied high to enable the oscillator; pins 2 and 4 are ground and supply [5]. JTAG uses J4.2/15/17/18 and dedicated FPGA pins, with R118 in the TDO path. J4.1 is a 3.3 V target-reference assignment, not an independently qualified power output.
\clearpage
\section{Pin budget, terminology and completeness}
The team correction is \textbf{117 ASIC-related signals}: 88 ASIC output/interface signals, 12 SPI data/control streams, nine shared controls, four board clocks and four additional SPI clocks. This is an interface budget, not a complete FPGA package pin count.
''')
out.append(table(['Group','Count','Interpretation'],[53,17,98],[
 ['ASIC output/interface','88','Eight groups of 11: 64 DATA1--8 lines plus eight each of CLK32MHz_Out, READ and SYNC.'],
 ['SPI data','12','Four stimulation SPI L, four stimulation SPI R, two non-stimulation SPI L and two non-stimulation SPI R.'],
 ['Shared controls','9',code('CHIP_RESET, AC_IN, IMP_TST, FE_RESET, SPI_LATCH, STIM_CLK, STIM_START, STIM_EN, STIM_CHB')],
 ['Board clocks','4','One board clock per board in the supplied requirement.'],
 ['SPI clocks','4','The four SPI_CLK connections added in the team correction.'],
 ['Total','117','Proposed across 120 mezzanine contacts, with three contacts spare.']]))
out.append(r'''AC\_IN and IMP\_TST remain electrically unresolved: their names and tutorial diagrams alone do not establish safe direct FPGA voltage limits or whether conditioning is required. The full ASIC pad specification and timing contract are needed before allocating FPGA balls. The XEM8310 is an FPGA module used as the downstream endpoint; the required carrier, protocol, clocking and supply connection remain separate design work.

\textbf{Assigned} means that KiCad places endpoints on the same named logical net. \textbf{Unrouted} means no copper path has been built in this revision. \textbf{Unassigned} means no functional net has been allocated. \textbf{Intentional NC} marks a pin deliberately left open in the inherited core design; it is not a spare signal.
''')
out.append(table(['Coverage','Count','Meaning'],[53,17,98],[
 ['Physical components','128','82 capacitors, 32 resistors, four inductors, six ICs, three connectors and one oscillator.'],
 ['Unique electrical endpoints','758','421 assigned, 331 unassigned, six intentional NC. Every endpoint is listed in the appendices.'],
 ['Numbered physical pads','767','Includes four shell pads sharing J4.SH, four ground lands sharing J5.G and four sharing J6.G.'],
 ['Unnumbered records','40','36 solder-paste-only apertures and four non-plated connector locating holes; these are not extra electrical pins.'],
 ['All physical pad records','807','767 numbered plus 40 unnumbered; preserved from the earlier placement.'],
 ['Functional nets','47','KiCad placeholder unconnected names are excluded. The full peer list of each real net appears in Appendix E.'],
 ['Unassigned breakdown','331','203 FPGA user-I/O balls, eight reserved cable contacts, 120 mezzanine signal contacts.'],
 ['Intentional NC','6','U1.L9 / L10 (DXN / DXP) and U2--U5 pin 4 (FB2).']]))
out.append(r'''\clearpage\section{What must be resolved before release}
The 33 $\times$ 36 mm result improves placement. It does not close the earlier system uncertainties. The following issues directly affect whether this size can become a functioning board.
''')
out.append(table(['Open item','Required next evidence / proposed owner'],[50,122],[
 ['ASIC electrical contract','ASIC design owner / Gerald: confirm all pad types, levels, drive strengths, reset states and setup/hold limits, especially AC_IN and IMP_TST.'],
 ['FPGA assignment and bank rails','FPGA engineering: select all 117 FPGA balls and compatible banks/standards, then generate the schematic and XDC from one checked pin table.'],
 ['Downstream link and power','FPGA + carrier engineering: define a realizable XEM8310 carrier connection, data protocol, clocking, cable pinout, current limit, length and protection.'],
 ['One integrated circuit','PCB engineering: reconcile this 3.3 V core-derived layout with the separate rail revision, including C92/R122 and any selected replacement flash/oscillator.'],
 ['Routing and stackup','PCB engineering + fabricator: route all power, ground, boot, clock, JTAG, ASIC and link nets; agree BGA escape rules, stackup and impedance.'],
 ['Mechanical assembly','PCB engineering + assembler: approve the connector body overhang, mating-board offsets, height, retention, courtyard tolerances and dual-side assembly access.'],
 ['Part values and procurement','PCB engineering: finish all TBD order codes, check footprint/part matches and qualify capacitor effective values and the required decoupling count.'],
 ['Measured acceptance','FPGA + lab team: cold boot, brownout/recovery, all-channel capture, sustained transfer, error rate, power and thermal tests on actual hardware.']]))
out.append(r'''The current complete-board design has no manufacturing release. A DRC pass does not demonstrate signal integrity, power integrity, thermal margin, assembler acceptance or working firmware. It also does not check the 117 signals that have no assigned PCB net yet.

\textbf{Further reduction path.} The next useful size decision is an integrated routing trial with the required protection and bank-voltage choices. A changed connector orientation or a smaller power architecture may reduce size further, but cannot be approved by deleting components or trimming blank drawing space alone.
\clearpage\appendix
\section{Every component: purpose and connections}
All 128 physical components appear below. Values and order codes describe the saved candidate; TBD is preserved wherever selection is incomplete. The table is a design ledger, not an approved purchase BOM. For two-terminal components, both pins are listed here. Larger devices refer to their complete pin tables later in this report.
''')
rows=[]
for c in C:
 eps=[e for e in E if e['ref']==c['ref']]
 if len(eps)==2:
  for e in eps:mark(e)
  pins=r'\newline '.join(code(e['pin'])+': '+cellnet(e) for e in eps)
 else:pins={'U1':'All 324 balls: Appendix B.','J4':'All cable contacts: Appendix C.','J5':'All mezzanine contacts: Appendix C.','J6':'All mezzanine contacts: Appendix C.'}.get(c['ref'],'Every IC / oscillator pin: Appendix D.')
 order= 'TBD - manufacturer/order code not selected' if 'TBD' in c['mpn'] and c['ref'] not in ['U1'] else c['mpn']
 rows.append([r'\textbf{'+esc(c['ref'])+r'}\newline '+esc(c['value'])+r'\newline {\color{muted}'+esc(c['side'])+'}',esc(c['purpose'])+r'\newline {\color{muted}Order: '+(esc(order) if ' ' in order else code(order))+'}',pins])
out.append(table(['Ref. / value / face','Why it is here / saved order code','Actual pin-to-net assignment'],[27,84,57],rows))
out.append(r'''\clearpage\section{All 324 FPGA balls}
The manufacturer function and bank come from the AMD XC7A100T CSG324 package table. The net/state comes from this exact native PCB. No proposed ASIC FPGA ball has been silently filled in. Assigned rows remain unrouted. Bank ``NA'' denotes a package field without an I/O-bank number, not an available signal.
''')
rows=[]
for e in E:
 if e['ref']!='U1':continue
 mark(e);rows.append([code(e['pin']),esc(e['bank']),code(e['function']),cellnet(e)])
out.append(table(['Ball','Bank','AMD function','Actual assigned net / state'],[13,13,78,62],rows))
out.append(r'''\clearpage\section{External connector contacts}
\subsection{J4: custom power, JTAG and reserved link}
This uses a micro-HDMI-style receptacle mechanically, but the proposed pin map is custom. J4.19 is assigned 12 V; it must not be connected to ordinary HDMI equipment. No cable, connector current rating, receiver/carrier or input protection has been qualified for this assignment. The eight reserved data contacts have no functional PCB nets.
''')
rows=[]
for e in E:
 if e['ref']!='J4':continue
 mark(e);rows.append([code(e['pin']),code(e['function']),cellnet(e),str(e['physical_pad_count'])])
out.append(table(['Pin','Function','Actual assigned net / state','Physical pads'],[14,63,67,22],rows))
out.append(r'''\subsection{J5 and J6: actual state versus 117-signal proposal}
Each QSH-030 connector has 60 numbered signal contacts. All of these are \textbf{unassigned in the PCB}. The separate proposal below is included so the intended destination is visible; it is not a completed electrical pinout. No proposal has an implemented FPGA-ball connection. The signal-direction column is the proposal's direction relative to the FPGA, not a verified ASIC electrical classification.

Both connectors also have four physical ground-blade lands sharing pad number G. Those lands are assigned to GND, but there is no ground copper in this revision. Two unnumbered non-plated locating holes per connector provide no electrical connection.
''')
rows=[]
for e in E:
 if e['ref'] not in ['J5','J6']:continue
 mark(e);rows.append([code(e['ref']+'.'+e['pin']),cellnet(e),code(e['proposal']) if e['proposal'] else 'Ground blade (4 lands)',esc(e['proposal_direction']) if e['proposal_direction'] else '--'])
out.append(table(['Contact','Actual PCB state','Separate proposed signal','Proposed direction'],[19,36,78,33],rows))
out.append(r'''\clearpage\section{All converter, flash and oscillator pins}
These rows complete the non-FPGA IC and oscillator pin coverage. FB2 pins are intentional NC; every other assigned row is still unrouted. Grounded VSEL and powered EN remain distinct pin functions. Flash and oscillator functions follow the selected part interpretation; exact assembly order codes must still be qualified with their footprints.
''')
rows=[]
for e in E:
 if e['ref'] not in ['U2','U3','U4','U5','U6','Y1']:continue
 mark(e);fn=re.sub(r'~\{([^}]+)\}',r'\1 (active low)',e['function'])
 rows.append([code(e['ref']+'.'+e['pin']),esc(fn),cellnet(e)])
out.append(table(['Endpoint','Pin function','Actual assigned net / state'],[25,62,83],rows))
out.append(r'''\clearpage\section{Every assigned net and its complete peer list}
Endpoints in the same row have the same assigned KiCad net name. They are \emph{not connected by copper} in this placement. Series components intentionally create different nets on their two ends: for example, R119 joins OSC\_32M\_RAW and CLK\_32MHZ once its pads are routed and it is populated. ``x4'' means four physical lands share that endpoint name.
''')
# Split large power-net memberships into bounded continuation rows so longtable can break pages.
rows=[]
for n,members in D['net_members'].items():
 for i in range(0,len(members),18):
  rows.append([code(n)+(r'\newline (continued)' if i else ''),', '.join(code(p) for p in members[i:i+18])])
out.append(table(['Assigned net','Every endpoint on this net'],[49,123],rows))
out.append(r'''\clearpage\section{Evidence, reproducibility and sources}
\subsection{Native extraction and completeness checks}
The native board was reopened in KiCad's Python interface after it was saved. All assigned pins were compared with the inherited core component ledger. The final placement was also checked by the KiCad command-line DRC engine using the copied project rules. There are zero physical DRC violations, 383 unconnected items and no ignored/excluded findings in the delivered report. No integrated schematic exists for this placement, so a schematic/ERC or full schematic-to-PCB parity pass is not claimed.

Appendix A covers 236 endpoints on 118 two-terminal components; B covers 324 FPGA balls; C covers 142 distinct connector endpoints; D covers 56 other IC/oscillator pins. Together these are \textbf{758 unique electrical endpoints}, with no duplicate or missing endpoint. The raw physical-pad CSV additionally retains all 807 pad records, including duplicate numbered lands, paste-only apertures and locating holes.

\textbf{Native board SHA-256:}\par
'''+code(D['board_sha256'])+r'''

The source bundle includes the editable LaTeX, the native placement figure, four CSV ledgers, the exact JSON readback, independent DRC output and report-generation instructions. The native KiCad ZIP includes the project and custom libraries. The earlier 37.5 $\times$ 36 mm revision is preserved separately.

\subsection{Primary references and local design evidence}
\begin{enumerate}[label={[\arabic*]},leftmargin=8mm,itemsep=7pt]
\item Texas Instruments, \emph{TPS62135 / TPS621351 datasheet}, pin table and layout guidance. \url{https://www.ti.com/lit/ds/symlink/tps62135.pdf}
\item AMD, \emph{7 Series FPGAs Configuration User Guide (UG470)}. \url{https://docs.amd.com/v/u/en-US/ug470_7Series_Config}
\item AMD, \emph{7 Series Packaging and Pinout (UG475)} and the saved \nolinkurl{xc7a100tcsg324pkg.csv} package table. \url{https://docs.amd.com/v/u/en-US/ug475_7Series_Pkg_Pinout}
\item Macronix, \emph{MX25L12833F datasheet}, PM2517, selected-device pin functions; manufacturer-authored copy. \url{https://www.mouser.com/datasheet/2/819/MX25L12833F_2c_3V_2c_128Mb_2c_v1_0-3371013.pdf}
\item Abracon, \emph{ASE series datasheet}, pin layout and supply/enable functions. \url{https://abracon.com/Oscillators/ASEseries.pdf}
\item Samtec, QSH suggested footprint drawing. Exact mating height, companion connector and assembly envelope remain open. \url{https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xx-footprint.pdf}
\item Local core design: \nolinkurl{component_manifest_resolved.json}, \nolinkurl{FPGA100T_Minimal.net}; actual revised board: \nolinkurl{FPGA100T_33x36_Placement.kicad_pcb}. These establish saved assignments, not measured hardware behaviour.
\item Local interface proposal: \nolinkurl{Mezzanine_Contact_Proposal.csv}; team correction from 113 to 117 includes four additional SPI clocks. Earlier ASIC-slide reviews and the full open-uncertainty register remain in the dated review folder and on the project review site.
\end{enumerate}
\end{document}
''')
expected={(e['ref'],e['pin']) for e in E}
assert covered==expected,(len(covered),len(expected))
(ROOT/'report/FPGA100T_Size_Components_Pinout.tex').write_text('\n'.join(out))
(ROOT/'data/Report_Coverage.json').write_text(json.dumps({'board_sha256':D['board_sha256'],'components':len(C),'electrical_endpoints_expected':len(expected),'electrical_endpoints_documented':len(covered),'missing':sorted(expected-covered),'duplicate':0,'physical_pad_records_csv':len(D['raw_pad_records']),'functional_nets_documented':len(D['net_members'])},indent=2)+'\n')
print('Wrote LaTeX;128 components,758 endpoints,47 nets covered exactly.')
