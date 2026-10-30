const $=id=>document.getElementById(id);
const diagnostics=window.schematicViewerDiagnostics={ready:false,error:null,sourceHash:null,counts:null,compatibility:'Whitespace around parentheses outside quoted strings; native source remains unchanged.'};
let viewer,app;
function inside(root,selector){const match=root?.querySelector(selector);if(match)return match;for(const el of root?.querySelectorAll('*')||[])if(el.shadowRoot){const found=inside(el.shadowRoot,selector);if(found)return found;}return null;}
// The pinned alpha tokenizer requires whitespace between adjacent expressions.
// Normalize only lexically insignificant delimiters, in memory after SHA check.
function compatibleWhitespace(text){let result='',quoted=false,escaped=false;for(const char of text){if(quoted){result+=char;if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;}else if(char==='"'){quoted=true;result+=char;}else if(char==='('||char===')')result+=' '+char+' ';else result+=char;}return result;}
function fit(){if(viewer){viewer.zoom_to_page();viewer.draw();}}
function zoom(factor){if(viewer){viewer.viewport.camera.zoom*=factor;viewer.draw();}}
window.nativeSchematicViewer={getState:()=>({ready:diagnostics.ready,error:diagnostics.error,revision:'V3',renderer:'KiCanvas native KiCad',sourceSHA256:diagnostics.sourceHash,counts:diagnostics.counts,zoom:viewer?.viewport.camera.zoom}),fit,zoom,activity:name=>app?.change_activity(name)};
async function load(){
 const config=await fetch('board.json').then(response=>{if(!response.ok)throw Error('Direct LDO Carrier identity unavailable');return response.json();});
 const source=config.schematic;const response=await fetch(source.native);if(!response.ok)throw Error('Native schematic unavailable');
 const bytes=await response.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==source.sha256)throw Error('Native schematic source hash changed');diagnostics.sourceHash=hash;$('download-native').href=source.native;
 const fonts=document.createElement('link');fonts.rel='stylesheet';fonts.href=config.vendor+'fonts.css';document.head.append(fonts);
 await import(new URL(config.vendor+'kicanvas.js',location.href));customElements.get('kc-ui-icon').sprites_url=new URL(config.vendor+'sprites.svg',location.href).href;
 const embed=document.createElement('kicanvas-embed');embed.setAttribute('controls','full');embed.setAttribute('controlslist','nooverlay nodownload nofullscreen');
 const native=document.createElement('kicanvas-source');native.setAttribute('name','Carrier_V1.kicad_sch');native.setAttribute('type','schematic');native.textContent=compatibleWhitespace(new TextDecoder().decode(bytes));embed.append(native);$('canvas-host').replaceChildren(embed);
 const deadline=performance.now()+45000;let element;
 while(performance.now()<deadline){element=inside(embed.shadowRoot||embed,'kc-schematic-viewer');if(element?.loaded&&element.viewer?.document&&element.viewer?.viewport?.camera)break;await new Promise(resolve=>setTimeout(resolve,100));}
 if(!element?.loaded)throw Error('Native schematic renderer timed out');viewer=element.viewer;app=inside(embed.shadowRoot,'kc-schematic-app');
 const doc=viewer.document,counts={symbols:doc.symbols.size,wires:doc.wires.length,junctions:doc.junctions.length,labels:doc.net_labels.length,globalLabels:doc.global_labels.length,sheets:doc.sheets.length};
 for(const[key,value]of Object.entries(source.expected))if(counts[key]!==value)throw Error('Native schematic '+key+' count changed');
 diagnostics.counts=counts;element.theme='kicad';element.update_theme();viewer.paint();const sidebar=inside(embed.shadowRoot,'kc-ui-activity-side-bar');if(sidebar)sidebar.collapsed=true;
 await document.fonts.ready;requestAnimationFrame(()=>requestAnimationFrame(fit));new ResizeObserver(()=>{if(diagnostics.ready)viewer.draw();}).observe($('canvas-host'));
 $('canvas-host').setAttribute('aria-busy','false');$('load-status').textContent='Direct LDO Carrier · native KiCad schematic';diagnostics.ready=true;document.documentElement.dataset.viewerReady='true';
 parent.postMessage({type:'native-schematic-ready',revision:'V3',state:window.nativeSchematicViewer.getState()},location.origin);
}
$('fit').onclick=fit;$('zoom-in').onclick=()=>zoom(1.35);$('zoom-out').onclick=()=>zoom(1/1.35);$('parts').onclick=()=>app?.change_activity('symbols');
load().catch(error=>{diagnostics.error=error.message;$('load-error').hidden=false;$('load-error').textContent='Unable to load the native schematic. Reload this view or download the KiCad file.';$('load-status').textContent='Native schematic unavailable';console.error(error);});
