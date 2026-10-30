const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SOURCE_PCB='23cfe57498038dbdc035c78a12163ea9447021965c3071a77a1c7d70534d4b1b',SOURCE_SCH='8e3eb7a0a3b057934af413d207b3233d0cc9dd69ad593ac90a402dec3b412c98';
let data,parts=[],features=[],allParts=new Map(),selected=null,view='3d',model=null,modelPromise=null,schematic=null,schematicPromise=null,schematicView=null,schematicBase=null;
const natural=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
const smooth=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const groupNames={'port-link':'HDMI data / stimulation','pcie':'PCIe x4','pcie-support':'PCIe support','module':'XEM connectors','input-jtag-indicators':'Input / XEM JTAG','usb-programmer':'USB programmer','jtag-master-control':'JTAG master','jtag-shared':'JTAG interfaces','power-shared':'Shared 3.3 V supply','power-port':'Port protection'};
const groupLabel=p=>groupNames[p.function_group]||p.function_group_label||(p.feature_type==='mounting_hole'?'Mounting hole':p.feature_type==='fiducial'?'Fiducial':p.function_group||'PCB-only feature');
async function compressedText(gzip,fallback){
  if('DecompressionStream' in window){try{const r=await fetch(gzip,{cache:'no-cache'});if(r.ok)return await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text();}catch{}}
  const r=await fetch(fallback,{cache:'no-cache'});if(!r.ok)throw new Error('Drawing unavailable');return r.text();
}
function renderParts(){
  const query=$('#component-search').value.trim().toLowerCase(),group=$('#component-group').value,fit=$('#component-fit').value;
  const rows=parts.filter(p=>(group==='all'||p.function_group===group)&&(fit==='all'||(fit==='dnp')===p.dnp)&&[p.ref,p.value,p.mpn,p.footprint,groupLabel(p),p.port?`P${p.port}`:''].join(' ').toLowerCase().includes(query));
  $('#component-count').textContent=`${rows.length} of ${parts.length} components`;$('#clear-search').hidden=!query&&group==='all'&&fit==='all';$('#no-components').hidden=rows.length>0;
  $('#component-rows').innerHTML=rows.map(p=>`<tr data-ref="${esc(p.ref)}" class="${selected?.ref===p.ref?'selected':''}"><td><button data-ref="${esc(p.ref)}" aria-label="Inspect ${esc(p.ref)}">${esc(p.ref)}</button>${p.dnp?'<span class="dnp">DNP</span>':''}</td><td>${esc(p.value)}${p.mpn&&p.mpn!==p.value?`<span class="cell-sub">${esc(p.mpn)}</span>`:''}</td><td>${esc(groupLabel(p))}${p.port?`<span class="cell-sub">Port P${esc(p.port)}</span>`:''}</td></tr>`).join('');
  if(rows.length&&!rows.some(p=>p.ref===selected?.ref))selectPart(rows[0].ref,!!model);
  if(!rows.length){selected=null;model?.clearSelection();$('#part-detail').innerHTML='<p class="eyebrow">Component detail</p><h3>No matches</h3><p>Clear the filters or try a reference such as J101.</p>';}
}
function selectionLabel(ref){const p=allParts.get(ref);if(!p)return;$('#model-selection').hidden=false;$('#model-selection').innerHTML=`<strong>${esc(ref)}</strong>${esc(p.value)}<button data-inspect-ref="${esc(ref)}">Details ↓</button>`;}
function selectPart(ref,highlight=true){
  const p=allParts.get(ref);if(!p)return;selected=p;
  $$('#component-rows tr').forEach(row=>row.classList.toggle('selected',row.dataset.ref===ref));
  const positions=p.schematic_positions||[],isFeature=p.electrical_component===false||!positions.length;
  let sheet='';try{const u=new URL(p.datasheet);if(['http:','https:'].includes(u.protocol))sheet=`<a class="datasheet" href="${esc(u.href)}" target="_blank" rel="noopener">Datasheet ↗</a>`;}catch{}
  $('#part-detail').innerHTML=`<p class="eyebrow">${esc(groupLabel(p))}</p><h3>${esc(p.ref)}${p.dnp?'<span class="dnp">DNP</span>':''}</h3><p class="part-value">${esc(p.value)}</p><dl class="part-meta"><div><dt>MPN</dt><dd>${esc(p.mpn||(isFeature?'PCB-only feature':'Not set in schematic'))}</dd></div><div><dt>Footprint</dt><dd>${esc(p.footprint.split(':').slice(1).join(':')||p.footprint)}</dd></div><div><dt>PCB</dt><dd>${p.side==='B'?'Back':'Front'} · ${Number(p.x_mm).toFixed(2)}, ${Number(p.y_mm).toFixed(2)} mm</dd></div></dl>${positions.length>1?`<label class="unit-select">Symbol <select id="symbol-unit">${positions.map((q,i)=>`<option value="${i}">Unit ${esc(q.unit)}</option>`).join('')}</select></label>`:''}<div class="detail-actions"><button id="find-board">Show on PCB ↗</button>${!isFeature?'<button id="find-schematic">Show in circuit ↗</button>':''}</div>${sheet}`;
  $('#find-board').onclick=async()=>{await showView('3d');$('#design').scrollIntoView({behavior:smooth()});const m=await ensureModel();const pose=p.side==='B'?'bottom':'top';m?.pose(pose);$$('[data-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pose===pose)));m?.focus(ref,true);selectionLabel(ref);};
  if(!isFeature)$('#find-schematic').onclick=()=>showPartSchematic(p,Number($('#symbol-unit')?.value||0));
  if(highlight&&model){model.focus(ref,false);selectionLabel(ref);}
}
const layoutAssets={
 'front-copper':['assets/pcb-top.svg','Native front copper, fabrication and silkscreen','front copper'],
 'back-copper':['assets/pcb-bottom.svg','Native back copper, fabrication and silkscreen · mirrored view','back copper'],
 'front-render':['assets/pcb-top.png','Native KiCad render · saved V10 placement','front render'],
 'back-render':['assets/pcb-bottom.png','Native KiCad render · saved V10 placement','back render']
};
function updateCaption(){
 if(view==='3d'){$('#view-caption').textContent='HDMI Extension Board V10 · 330 nominal component bodies';$('#view-full').href='assets/pcb-top.png';$('#view-full').textContent='Open front render ↗';}
 if(view==='layout'){const [url,caption,name]=layoutAssets[$('#layout-mode').value];$('#board-image').src=url;$('#board-image').alt=`HDMI Extension Board V10 ${name}`;$('#view-caption').textContent='HDMI Extension Board V10 · '+caption;$('#view-full').href=url;$('#view-full').textContent=`Open ${name} ↗`;}
 if(view==='schematic'){$('#view-caption').textContent='HDMI Extension Board V10 · native schematic · drag to pan · scroll to zoom';$('#view-full').href='assets/schematic.svg';$('#view-full').textContent='Open full SVG ↗';}
}
async function showView(next){
 if(!['3d','layout','schematic'].includes(next))return;view=next;
 $$('[data-view]').forEach(b=>{const active=b.dataset.view===next;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 for(const name of ['3d','layout','schematic']){$('#panel-'+name).hidden=name!==next;$('#controls-'+name).hidden=name!==next;}
 updateCaption();model?.setActive(next==='3d');
 if(next==='3d')await ensureModel();
 if(next==='schematic'){await ensureSchematic();if(schematic)chooseCircuit();}
}
async function ensureModel(){
 if(modelPromise)return modelPromise;
 modelPromise=import('./board-viewer.js?v=V10-2').then(module=>module.createViewer({canvas:$('#board-canvas'),stage:$('#board-stage'),status:$('#model-status'),poster:$('.model-poster'),selection:$('#model-selection'),expectedRefs:[...allParts.keys()],expectedPCB:SOURCE_PCB,onSelect:ref=>{selectPart(ref,false);selectionLabel(ref);}})).then(m=>{model=m;m.setActive(view==='3d');return m;}).catch(error=>{$('#model-status').hidden=false;$('#model-status').innerHTML='HDMI Extension Board 3D could not load. <a href="assets/pcb-top.png" target="_blank" rel="noopener">Open the native render</a>.';console.error(error);return null;});
 return modelPromise;
}
function aspectBox(box){const s=$('#schematic-stage'),ratio=s.clientWidth/Math.max(s.clientHeight,1),cx=box[0]+box[2]/2,cy=box[1]+box[3]/2,w=Math.max(box[2],box[3]*ratio)*1.06;return[cx-w/2,cy-w/ratio/2,w,w/ratio];}
function setSchematicView(box){if(!schematic)return;schematicView=box;schematic.setAttribute('viewBox',box.join(' '));}
function frameBox(frame){const scale=data.schematic.svg_units_per_mm||[1,1];return frame.viewbox_mm.map((v,i)=>v*scale[i%2]);}
function chooseCircuit(){if(!schematic||view!=='schematic')return;const f=data.schematic.frames.find(f=>f.id===$('#circuit').value);schematicBase=f?frameBox(f):data.schematic.svg_viewBox;setSchematicView(aspectBox(schematicBase));}
function zoomSchematic(factor,point){if(!schematicView)return;const[x,y,w,h]=schematicView,c=point||[x+w/2,y+h/2],nw=Math.min(9000,Math.max(8,w*factor)),f=nw/w;setSchematicView([c[0]-(c[0]-x)*f,c[1]-(c[1]-y)*f,nw,h*f]);}
function svgPoint(e){const p=schematic.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(schematic.getScreenCTM().inverse());}
async function ensureSchematic(){
 if(schematicPromise)return schematicPromise;
 schematicPromise=(async()=>{
  const text=await compressedText('assets/schematic-web.svg.gz','assets/schematic-web.svg'),svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;if(svg.localName!=='svg')throw new Error('Invalid schematic');svg.querySelectorAll('script,foreignObject').forEach(e=>e.remove());schematic=document.importNode(svg,true);schematic.removeAttribute('width');schematic.removeAttribute('height');schematic.setAttribute('role','img');schematic.setAttribute('aria-label','Native HDMI Extension Board V10 one-page schematic');$('#schematic-stage').append(schematic);$('#schematic-status').hidden=true;
  let drag=null;const stage=$('#schematic-stage');stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=svgPoint(e);drag={id:e.pointerId,x:p.x,y:p.y};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const p=svgPoint(e);setSchematicView([schematicView[0]+drag.x-p.x,schematicView[1]+drag.y-p.y,schematicView[2],schematicView[3]]);});const stop=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);stage.addEventListener('wheel',e=>{e.preventDefault();zoomSchematic(Math.exp(Math.max(-.4,Math.min(.4,e.deltaY*.0015))),svgPoint(e));},{passive:false});stage.addEventListener('keydown',e=>{if(['+','=','-','r','R'].includes(e.key)){e.preventDefault();if(e.key==='-')zoomSchematic(1.3);else if(['+','='].includes(e.key))zoomSchematic(1/1.3);else chooseCircuit();}});return schematic;
 })().catch(error=>{$('#schematic-status').innerHTML='HDMI Extension Board schematic could not load. <a href="assets/schematic.svg" target="_blank" rel="noopener">Open the full SVG</a>.';console.error(error);return null;});return schematicPromise;
}
async function showPartSchematic(p,unit=0){
 await showView('schematic');$('#design').scrollIntoView({behavior:smooth()});if(!schematic)return;const q=p.schematic_positions?.[unit];if(!q)return;const b=p.schematic_bbox_mm,single=p.schematic_positions.length===1,scale=data.schematic.svg_units_per_mm||[1,1],w=single&&b?Math.max(100,b[2]-b[0]+85):150,h=single&&b?Math.max(80,b[3]-b[1]+65):120;setSchematicView(aspectBox([(q.x_mm-w/2)*scale[0],(q.y_mm-h/2)*scale[1],w*scale[0],h*scale[1]]));const f=data.schematic.frames.find(f=>f.id===p.schematic_frame_ids?.[0]);if(f)$('#circuit').value=f.id;
}
function collapseViewer(){const box=$('#design-viewer');box.classList.remove('expanded');$('#schematic-expand').textContent='Expand';$('#schematic-expand').setAttribute('aria-label','Expand design viewer');if(view==='schematic'&&schematicView)setSchematicView(aspectBox(schematicView));}
$$('[data-view]').forEach(b=>{b.onclick=()=>showView(b.dataset.view);b.onkeydown=e=>{const buttons=$$('[data-view]'),i=buttons.indexOf(b);let next;if(e.key==='ArrowRight')next=buttons[(i+1)%3];if(e.key==='ArrowLeft')next=buttons[(i+2)%3];if(e.key==='Home')next=buttons[0];if(e.key==='End')next=buttons[2];if(next){e.preventDefault();next.focus();showView(next.dataset.view);}};});
$$('[data-pose]').forEach(b=>b.onclick=()=>{model?.pose(b.dataset.pose);$$('[data-pose]').forEach(q=>q.setAttribute('aria-pressed',String(q===b)));});$('#board-fit').onclick=()=>model?.fit();$('#layout-mode').onchange=updateCaption;
$('#circuit').onchange=()=>ensureSchematic().then(chooseCircuit);$('#schematic-in').onclick=()=>zoomSchematic(1/1.3);$('#schematic-out').onclick=()=>zoomSchematic(1.3);$('#schematic-fit').onclick=chooseCircuit;
$('#schematic-expand').onclick=()=>{const box=$('#design-viewer');if(box.classList.contains('expanded'))collapseViewer();else{box.classList.add('expanded');$('#schematic-expand').textContent='Close';$('#schematic-expand').setAttribute('aria-label','Close expanded design viewer');if(schematicView)setSchematicView(aspectBox(schematicView));}};document.addEventListener('keydown',e=>{if(e.key==='Escape')collapseViewer();});
$('#component-rows').addEventListener('click',e=>{const row=e.target.closest('[data-ref]');if(row)selectPart(row.dataset.ref);});$('#mechanical-features').addEventListener('click',e=>{const b=e.target.closest('[data-feature-ref]');if(b){selectPart(b.dataset.featureRef);$('#part-detail').scrollIntoView({behavior:smooth(),block:'center'});}});$('#model-selection').addEventListener('click',e=>{const b=e.target.closest('[data-inspect-ref]');if(b){selectPart(b.dataset.inspectRef,false);$('#components').scrollIntoView({behavior:smooth()});}});
$('#component-search').oninput=renderParts;$('#component-group').onchange=renderParts;$('#component-fit').onchange=renderParts;$('#clear-search').onclick=()=>{$('#component-search').value='';$('#component-group').value='all';$('#component-fit').value='all';renderParts();};
async function init(){
 const r=await fetch('assets/components.json',{cache:'no-cache'});if(!r.ok)throw new Error('Component data unavailable');data=await r.json();parts=data.components.sort((a,b)=>natural(a.ref,b.ref));features=data.board_features||[];if(parts.length!==351||features.length!==15||data.source.pcb_sha256!==SOURCE_PCB||data.source.schematic_sha256!==SOURCE_SCH)throw new Error('Revision data mismatch');allParts=new Map([...parts,...features].map(p=>[p.ref,p]));
 for(const g of data.function_groups){if(!g.count)continue;const o=document.createElement('option');o.value=g.id;o.textContent=`${groupNames[g.id]||g.label} (${g.count})`;$('#component-group').append(o);}
 for(const f of [...data.schematic.frames].sort((a,b)=>natural(a.id,b.id))){const o=document.createElement('option');o.value=f.id;o.textContent=f.title.replace(/^\d+\s+/,'');$('#circuit').append(o);}$('#circuit').value='section-01';$('#mechanical-features').innerHTML=features.map(p=>`<button data-feature-ref="${esc(p.ref)}">${esc(p.ref)}</button>`).join('');selectPart('J101',false);renderParts();document.documentElement.dataset.pageReady='true';
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){ensureModel();observer.disconnect();}},{rootMargin:'200px'});observer.observe($('#design'));
 window.carrierPage={getState:()=>({components:parts.length,features:features.length,selected:selected?.ref,view,schematicReady:!!schematic,schematicView,model:model?.getState()}),selectPart,showView};
}
init().catch(error=>{$('#component-count').textContent='Data could not load. Download the CSV to inspect the saved list.';console.error(error);});
