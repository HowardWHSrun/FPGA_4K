'use strict';
const $=id=>document.getElementById(id), params=new URLSearchParams(location.search);
let board,nativeElement,nativeViewer,boardApp,selectedNet='';
const diagnostics=window.pcbViewerDiagnostics={ready:false,error:null,sourceHash:null,nativeCounts:null};
function inside(root,selector){const match=root?.querySelector(selector);if(match)return match;for(const el of root?.querySelectorAll('*')||[]){if(el.shadowRoot){const found=inside(el.shadowRoot,selector);if(found)return found;}}return null;}
function status(text){$('load-status').textContent=text;}
let initialFitPending=true,initialFitFrame=0,stableFitFrames=0,lastFitSize='';
function nativeFit(){if(nativeViewer){nativeViewer.zoom_to_board();nativeViewer.draw();}}
function cancelInitialFit(){initialFitPending=false;if(initialFitFrame)cancelAnimationFrame(initialFitFrame);initialFitFrame=0;}
function fit(){cancelInitialFit();nativeFit();}
function initialFitTick(){
 initialFitFrame=0;if(!initialFitPending||!nativeViewer)return;
 const canvas=nativeViewer.renderer?.gl?.canvas,rect=canvas?.getBoundingClientRect();
 if(!rect||rect.width<100||rect.height<100){stableFitFrames=0;return;}
 const same=(a,b)=>Math.abs(a-b)<2,ratio=devicePixelRatio||1;
 const backingMatches=(same(canvas.width,rect.width)&&same(canvas.height,rect.height))||(same(canvas.width,rect.width*ratio)&&same(canvas.height,rect.height*ratio));
 const size=[Math.round(rect.width),Math.round(rect.height),canvas.width,canvas.height].join(',');
 stableFitFrames=backingMatches&&size===lastFitSize?stableFitFrames+1:0;lastFitSize=size;
 if(stableFitFrames>=3){initialFitPending=false;nativeFit();return;}
 initialFitFrame=requestAnimationFrame(initialFitTick);
}
function requestInitialFit(){if(initialFitPending&&!initialFitFrame)initialFitFrame=requestAnimationFrame(initialFitTick);}
new ResizeObserver(requestInitialFit).observe($('canvas-host'));
for(const name of ['pointerdown','wheel','keydown'])$('canvas-host').addEventListener(name,cancelInitialFit,{capture:true});
document.querySelector('.toolbar').addEventListener('pointerdown',cancelInitialFit,{capture:true});

function zoom(factor){if(nativeViewer){nativeViewer.viewport.camera.zoom*=factor;nativeViewer.draw();}}
function updatePanel(){inside($('canvas-host'),'kc-board-layers-panel')?.update_item_states();nativeViewer?.draw();}
function setLayers(names){if(!nativeViewer)return;for(const layer of nativeViewer.layers.in_ui_order()){layer.visible=names.includes(layer.name)||layer.name==='Edge.Cuts'||($('references').checked&&['F.SilkS','B.SilkS'].includes(layer.name));}updatePanel();updatePresets();}
function getLayers(){return nativeViewer?[...nativeViewer.layers.in_ui_order()].filter(l=>l.visible&&l.name.endsWith('.Cu')).map(l=>l.name):[];}
function updatePresets(){const layers=getLayers();for(const b of document.querySelectorAll('[data-preset]')){const expected=b.dataset.preset==='routes'?board.defaults:b.dataset.preset==='front'?['F.Cu']:b.dataset.preset==='back'?['B.Cu']:[...nativeViewer.document.layers].filter(l=>l.canonical_name.endsWith('.Cu')).map(l=>l.canonical_name);b.classList.toggle('active',layers.length===expected.length&&layers.every(l=>expected.includes(l)));}}
function choosePreset(name){if(!nativeViewer)return;const layers=name==='routes'?board.defaults:name==='front'?['F.Cu']:name==='back'?['B.Cu']:nativeViewer.document.layers.filter(l=>l.canonical_name.endsWith('.Cu')).map(l=>l.canonical_name);setLayers(layers);}
function planes(value){$('planes').checked=Boolean(value);if(nativeViewer){nativeViewer.zone_opacity=value?.38:0;nativeViewer.draw();}}
function clearNet(){selectedNet='';if(nativeViewer){nativeViewer.layers.overlay.clear();nativeViewer.draw();}$('clear-net').hidden=true;status(board.title+' · native KiCad file');}
function highlight(net){if(!nativeViewer)return;if(!net){clearNet();return;}const found=nativeViewer.document.nets.find(n=>n.name===net);if(found)nativeViewer.highlight_net(found.number);}
function reset(){clearNet();if(nativeViewer.viewport.camera.flipped)nativeViewer.flip_view();$('references').checked=true;planes(Boolean(board.initialPlanes));choosePreset('routes');fit();}
function state(){return {loaded:diagnostics.ready,ready:diagnostics.ready,renderer:'KiCanvas native KiCad',theme:'kicad',canvasBackground:'#101b2b',revision:board?.revision,sourceSHA256:diagnostics.sourceHash,visibleLayers:getLayers(),layers:getLayers(),planes:$('planes').checked,references:$('references').checked,selectedNet,counts:diagnostics.nativeCounts,zoom:nativeViewer?.viewport.camera.zoom,flipped:nativeViewer?.viewport.camera.flipped};}
const api=window.nativePcbViewer={getState:state,setLayers,choosePreset,planes,highlight,selectNet:highlight,clearNet,zoom,fit,reset,flip:()=>nativeViewer?.flip_view(),activity:name=>boardApp?.change_activity(name)};
window.fpgaViewer=api;
async function load(){
 const r=await fetch('board.json?v=V23-20261021a');if(!r.ok)throw Error('Board identity unavailable');board=await r.json();document.title=board.title+' · native KiCad view';$('board-title').textContent=board.title;diagnostics.board=board.revision;
 if(board.defaults.length===1){$('routes').hidden=true;}
 const response=await fetch(board.native);if(!response.ok)throw Error('Native board unavailable');const bytes=await response.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==board.sha256)throw Error('Native source hash changed');diagnostics.sourceHash=hash;
 const fonts=document.createElement('link');fonts.rel='stylesheet';fonts.href=board.vendor+'fonts.css';document.head.append(fonts);
 await import(new URL(board.vendor+'kicanvas.js',location.href));customElements.get('kc-ui-icon').sprites_url=new URL(board.vendor+'sprites.svg',location.href).href;
 const embed=document.createElement('kicanvas-embed');embed.setAttribute('src',board.native);embed.setAttribute('controls','full');embed.setAttribute('controlslist','nooverlay nodownload nofullscreen noflipview');$('canvas-host').replaceChildren(embed);
 const deadline=performance.now()+45000;while(performance.now()<deadline){nativeElement=inside(embed.shadowRoot||embed,'kc-board-viewer');if(nativeElement?.loaded&&nativeElement.viewer?.document&&nativeElement.viewer?.viewport?.camera)break;await new Promise(r=>setTimeout(r,100));}if(!nativeElement?.loaded)throw Error('Native renderer timed out');
 nativeViewer=nativeElement.viewer;boardApp=inside(embed.shadowRoot,'kc-board-app');const doc=nativeViewer.document;const counts={footprints:doc.footprints.length,pads:doc.footprints.reduce((n,f)=>n+f.pads.length,0),segments:doc.segments.length,vias:doc.vias.length,zones:doc.zones.length,copperLayers:doc.layers.filter(l=>l.canonical_name.endsWith('.Cu')).length,nets:doc.nets.length};diagnostics.nativeCounts=counts;for(const [key,value]of Object.entries(board.expected)){if(counts[key]!==value)throw Error('Native '+key+' count changed: '+counts[key]+' vs '+value);}
 // Keep KiCad's native layer palette; only soften the canvas background.
 // The pinned WebGL renderer sets clearColor at setup, so update it explicitly.
 const updateNativeTheme=nativeElement.update_theme.bind(nativeElement);
 nativeElement.update_theme=()=>{updateNativeTheme();const background=nativeViewer.theme.background.constructor.from_css('#101b2b');nativeViewer.theme={...nativeViewer.theme,background};nativeViewer.renderer.background_color=background;if(nativeViewer.renderer.gl)nativeViewer.renderer.gl.clearColor(...background.to_array());};
 nativeElement.theme='kicad';nativeElement.update_theme();nativeViewer.paint();nativeViewer.page_opacity=0;nativeViewer.grid_opacity=.18;planes(Boolean(board.initialPlanes));choosePreset('routes');
 const sidebar=inside(embed.shadowRoot,'kc-ui-activity-side-bar');if(sidebar)sidebar.collapsed=true;await document.fonts.ready;requestInitialFit();
 const originalHighlight=nativeViewer.highlight_net.bind(nativeViewer);nativeViewer.highlight_net=number=>{selectedNet=doc.nets[number]?.name||'';originalHighlight(number);$('clear-net').hidden=!selectedNet;status(selectedNet||board.title+' · native KiCad file');};
 $('canvas-host').setAttribute('aria-busy','false');status(board.title+' · native KiCad file');diagnostics.ready=true;document.documentElement.dataset.viewerReady='true';window.dispatchEvent(new Event('fpga-viewer-ready'));document.dispatchEvent(new CustomEvent('pcbviewer:ready',{detail:diagnostics}));parent.postMessage({type:'native-pcb-ready',revision:board.revision,state:state()},location.origin);
}
for(const b of document.querySelectorAll('[data-preset]'))b.onclick=()=>choosePreset(b.dataset.preset);
$('planes').onchange=()=>planes($('planes').checked);$('references').onchange=()=>setLayers(getLayers());$('fit').onclick=fit;$('zoom-in').onclick=()=>zoom(1.35);$('zoom-out').onclick=()=>zoom(1/1.35);$('flip').onclick=()=>nativeViewer?.flip_view();$('clear-net').onclick=clearNet;for(const [id,activity]of [['layers','layers'],['parts','footprints'],['nets','nets']])$(id).onclick=()=>boardApp?.change_activity(activity);
window.addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='native-pcb')return;const {command,value}=event.data;if(command==='layers')api.setLayers(value);else if(command==='net')api.highlight(value);else if(command==='planes')api.planes(value);else if(command==='fit')api.fit();else if(command==='zoom')api.zoom(Number(value));else if(command==='reset')api.reset();else if(command==='preset')api.choosePreset(value);});
window.addEventListener('resize',requestInitialFit);
load().catch(error=>{diagnostics.error=String(error.message);$('load-error').hidden=false;$('load-error').textContent='The native board could not load. Reload this view.';status('Native viewer unavailable');console.error(error);});
