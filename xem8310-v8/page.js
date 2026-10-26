const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escapeText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data,parts=[],selected=null,schematic=null,schematicView=null,schematicBase=null,model=null,modelPromise=null,boardView='3d',schematicPromise=null;
const natural=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
async function assetText(compressed,fallback){
  if('DecompressionStream' in window){const response=await fetch(compressed);if(response.ok){const decoded=response.body.pipeThrough(new DecompressionStream('gzip'));return new Response(decoded).text();}}
  const response=await fetch(fallback);if(!response.ok)throw new Error('Drawing unavailable');return response.text();
}
const groupLabel=p=>p.function_group_label||p.function_group||'Other';
function renderParts(){
  const query=$('#component-search').value.trim().toLowerCase(),group=$('#component-group').value,fit=$('#component-fit').value;
  const rows=parts.filter(p=>(group==='all'||p.function_group===group)&&(fit==='all'||(fit==='dnp')===p.dnp)&&[p.ref,p.value,p.mpn,p.footprint,groupLabel(p),p.port===null?'':`P${p.port}`].join(' ').toLowerCase().includes(query));
  $('#component-count').textContent=`${rows.length} of ${parts.length} components`;
  $('#clear-search').hidden=!query&&group==='all'&&fit==='all';$('#no-components').hidden=rows.length>0;
  $('#component-rows').innerHTML=rows.map(p=>`<tr data-ref="${escapeText(p.ref)}" class="${selected?.ref===p.ref?'selected':''}"><td><button data-ref="${escapeText(p.ref)}" aria-label="Inspect ${escapeText(p.ref)}">${escapeText(p.ref)}</button>${p.dnp?'<span class="dnp">DNP</span>':''}</td><td>${escapeText(p.value)}${p.mpn&&p.mpn!==p.value?`<span class="cell-sub">${escapeText(p.mpn)}</span>`:''}</td><td>${escapeText(groupLabel(p))}${p.port!==null?`<span class="cell-sub">Port P${escapeText(p.port)}</span>`:''}</td></tr>`).join('');
  if(rows.length&&!rows.some(p=>p.ref===selected?.ref))selectPart(rows[0].ref,false);
  if(!rows.length){selected=null;$('#part-detail').innerHTML='<p class="eyebrow">Component detail</p><h3>No matches</h3><p>Clear a filter or try a different reference or part number.</p>';}
}
function selectPart(ref,highlight=true){
  const p=parts.find(p=>p.ref===ref);if(!p)return;selected=p;
  $$('#component-rows tr').forEach(row=>row.classList.toggle('selected',row.dataset.ref===ref));
  let datasheet='';try{const url=new URL(p.datasheet);if(['https:','http:'].includes(url.protocol))datasheet=`<a class="datasheet" href="${escapeText(url.href)}" target="_blank" rel="noopener">Open datasheet ↗</a>`;}catch{}
  const positions=p.schematic_positions||[];
  $('#part-detail').innerHTML=`<p class="eyebrow">${escapeText(groupLabel(p))}</p><h3>${escapeText(p.ref)} ${p.dnp?'<span class="dnp">DNP</span>':''}</h3><p class="part-value">${escapeText(p.value)}</p>${p.description?`<p>${escapeText(p.description)}</p>`:''}<dl class="part-meta"><div><dt>Part number</dt><dd>${escapeText(p.mpn||'Not specified')}</dd></div><div><dt>Footprint</dt><dd>${escapeText(p.footprint.split(':').slice(1).join(':')||p.footprint)}</dd></div><div><dt>PCB side</dt><dd>${p.side==='B'?'Back':'Front'}</dd></div><div><dt>Position</dt><dd>${Number(p.x_mm).toFixed(2)}, ${Number(p.y_mm).toFixed(2)} mm</dd></div><div><dt>Rotation</dt><dd>${Number(p.rotation_deg).toFixed(1)}°</dd></div><div><dt>Body</dt><dd>${p.model_body_present?'Nominal body in web 3D':'Copper-only feature'}</dd></div></dl>${positions.length>1?`<label class="select-label unit-select">Schematic unit <select id="symbol-unit">${positions.map((q,i)=>`<option value="${i}">Unit ${escapeText(q.unit)} (${i+1}/${positions.length})</option>`).join('')}</select></label><br>`:''}<div class="detail-actions"><button id="find-schematic">Find in schematic ↗</button><button id="find-board">Find on board ↗</button></div>${datasheet}`;
  $('#find-schematic').onclick=()=>showPartSchematic(p,Number($('#symbol-unit')?.value||0));
  $('#find-board').onclick=async()=>{$('#pcb').scrollIntoView({behavior:'smooth'});showBoard('3d');const v=await ensureModel();v?.focus(ref,true);};
  if(highlight&&model)model.focus(ref,false);
}
function aspectBox(box){const stage=$('#schematic-stage'),ratio=stage.clientWidth/Math.max(stage.clientHeight,1),cx=box[0]+box[2]/2,cy=box[1]+box[3]/2,w=Math.max(box[2],box[3]*ratio)*1.06;return[cx-w/2,cy-w/ratio/2,w,w/ratio];}
function setSchematicView(box){if(!schematic)return;schematicView=box;schematic.setAttribute('viewBox',box.join(' '));}
function frameBox(frame){const scale=data.schematic.svg_units_per_mm||[1,1];return frame.viewbox_mm.map((v,i)=>v*scale[i%2]);}
function chooseCircuit(){if(!schematic)return;const frame=data.schematic.frames.find(f=>f.id===$('#circuit').value);schematicBase=frame?frameBox(frame):data.schematic.svg_viewBox;setSchematicView(aspectBox(schematicBase));}
function zoomSchematic(factor,point){if(!schematicView)return;const [x,y,w,h]=schematicView,c=point||[x+w/2,y+h/2],nw=Math.min(9000,Math.max(8,w*factor)),f=nw/w;setSchematicView([c[0]-(c[0]-x)*f,c[1]-(c[1]-y)*f,nw,h*f]);}
function svgPoint(event){const point=schematic.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(schematic.getScreenCTM().inverse());}
async function ensureSchematic(){
  if(schematicPromise)return schematicPromise;
  schematicPromise=(async()=>{
    const text=await assetText('assets/schematic-web.svg.gz','assets/schematic-web.svg');
    const parsed=new DOMParser().parseFromString(text,'image/svg+xml'),svg=parsed.documentElement;if(svg.localName!=='svg')throw new Error('Drawing could not be read');
    svg.querySelectorAll('script,foreignObject').forEach(e=>e.remove());schematic=document.importNode(svg,true);schematic.removeAttribute('width');schematic.removeAttribute('height');schematic.setAttribute('aria-label','Native one-page XEM8310 schematic');schematic.setAttribute('role','img');$('#schematic-stage').append(schematic);$('#schematic-status').hidden=true;
    chooseCircuit();let drag=null;const stage=$('#schematic-stage');
    stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=svgPoint(e);drag={id:e.pointerId,x:p.x,y:p.y,box:schematicView.slice()};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
    stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const p=svgPoint(e);setSchematicView([schematicView[0]+drag.x-p.x,schematicView[1]+drag.y-p.y,schematicView[2],schematicView[3]]);});
    const end=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
    stage.addEventListener('wheel',e=>{e.preventDefault();const p=svgPoint(e);zoomSchematic(Math.exp(Math.max(-.4,Math.min(.4,e.deltaY*.0015))),[p.x,p.y]);},{passive:false});
    stage.addEventListener('keydown',e=>{if(['+','=','-','r','R','Escape'].includes(e.key)){e.preventDefault();if(e.key==='-')zoomSchematic(1.3);else if(['+','='].includes(e.key))zoomSchematic(1/1.3);else if(e.key==='Escape')collapseSchematic();else chooseCircuit();}});
    return schematic;
  })().catch(error=>{$('#schematic-status').hidden=false;$('#schematic-status').innerHTML='The interactive drawing could not load. <a href="assets/schematic.svg" target="_blank" rel="noopener">Open the full SVG</a>.';console.error(error);return null;});
  return schematicPromise;
}
async function showPartSchematic(p,unit=0){
  $('#schematic').scrollIntoView({behavior:'smooth'});await ensureSchematic();if(!schematic)return;
  const point=p.schematic_positions?.[unit];if(!point)return;const scale=data.schematic.svg_units_per_mm||[1,1],w=p.ref.startsWith('J')?130:85,h=65;setSchematicView(aspectBox([(point.x_mm-w/2)*scale[0],(point.y_mm-h/2)*scale[1],w*scale[0],h*scale[1]]));
  const frame=data.schematic.frames.find(f=>f.id===p.schematic_frame_ids?.[0]);if(frame)$('#circuit').value=frame.id;
}
function collapseSchematic(){const box=$('.schematic-viewer');box.classList.remove('expanded');$('#schematic-expand').textContent='Expand';if(schematicView)setSchematicView(aspectBox(schematicView));}
$('#schematic-expand').onclick=()=>{const box=$('.schematic-viewer');if(box.classList.contains('expanded'))collapseSchematic();else{box.classList.add('expanded');$('#schematic-expand').textContent='Close';if(schematicView)setSchematicView(aspectBox(schematicView));}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('.schematic-viewer').classList.contains('expanded'))collapseSchematic();});
$('#circuit').onchange=()=>ensureSchematic().then(chooseCircuit);$('#schematic-in').onclick=()=>zoomSchematic(1/1.3);$('#schematic-out').onclick=()=>zoomSchematic(1.3);$('#schematic-fit').onclick=chooseCircuit;
const boardAssets={front:['assets/pcb-top.png','Front render','Native KiCad render · saved V8 placement'],back:['assets/pcb-bottom.png','Back render','Native KiCad render · saved V8 placement'],'copper-front':['assets/pcb-top.svg','Front copper','Native front copper / fabrication / silkscreen export · historical fill retained'],'copper-back':['assets/pcb-bottom.svg','Back copper','Native back copper / fabrication / silkscreen export · mirrored back view']};
function showBoard(view){boardView=view;$$('[data-board-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.boardView===view)));$('#model-stage').hidden=view!=='3d';$('#board-image').hidden=view==='3d';$('#poses').hidden=view!=='3d';if(view==='3d'){$('#board-caption').textContent='Native PCB geometry · 399 nominal component bodies · 38 copper-only / mechanical features';$('#board-hint').textContent='Click a part to inspect · drag to rotate';$('#board-full').href='assets/pcb-top.png';$('#board-full').textContent='Open front render ↗';ensureModel();}else{const [url,label,caption]=boardAssets[view];$('#board-image').src=url;$('#board-image').alt=`V8 PCB ${label.toLowerCase()}`;$('#board-caption').textContent=caption;$('#board-hint').textContent='Open full size to inspect detail';$('#board-full').href=url;$('#board-full').textContent=`Open ${label.toLowerCase()} ↗`;}model?.setActive(view==='3d');}
async function ensureModel(){if(modelPromise)return modelPromise;modelPromise=import('./board-viewer.js').then(module=>module.createViewer({canvas:$('#board-canvas'),stage:$('#board-stage'),status:$('#model-status'),poster:$('.model-poster'),selection:$('#model-selection'),onSelect:ref=>{selectPart(ref,false);$('#model-selection').textContent=`${ref} · ${parts.find(p=>p.ref===ref)?.value||'Mechanical / copper feature'}`;}})).then(v=>{model=v;v.setActive(boardView==='3d');return v;}).catch(error=>{$('#model-status').textContent='Interactive 3D is unavailable. The front and back renders remain available.';console.error(error);return null;});return modelPromise;}
$$('[data-board-view]').forEach(b=>b.onclick=()=>showBoard(b.dataset.boardView));$$('[data-pose]').forEach(b=>b.onclick=()=>{model?.pose(b.dataset.pose);$$('[data-pose]').forEach(q=>q.setAttribute('aria-pressed',String(q===b)));});$('#board-fit').onclick=()=>model?.fit();
$('#component-rows').addEventListener('click',e=>{const row=e.target.closest('[data-ref]');if(row)selectPart(row.dataset.ref);});
$('#component-search').oninput=renderParts;$('#component-group').onchange=renderParts;$('#component-fit').onchange=renderParts;$('#clear-search').onclick=()=>{$('#component-search').value='';$('#component-group').value='all';$('#component-fit').value='all';renderParts();};
async function init(){
  const response=await fetch('assets/components.json');if(!response.ok)throw new Error('Component list unavailable');data=await response.json();parts=data.components.sort((a,b)=>natural(a.ref,b.ref));if(parts.length!==422)throw new Error('Unexpected component snapshot');
  for(const group of data.function_groups){const option=document.createElement('option');option.value=group.id;option.textContent=`${group.label} (${group.count})`;$('#component-group').append(option);}
  for(const frame of [...data.schematic.frames].sort((a,b)=>natural(a.id,b.id))){const option=document.createElement('option');option.value=frame.id;option.textContent=frame.title.replace(/^\d+\s+/,'');$('#circuit').append(option);}$('#circuit').value='section-01';selectPart('J101',false);renderParts();
  const schematicObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){ensureSchematic();schematicObserver.disconnect();}},{rootMargin:'400px'});schematicObserver.observe($('#schematic'));
  const boardObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){ensureModel();boardObserver.disconnect();}},{rootMargin:'200px'});boardObserver.observe($('#pcb'));
  window.carrierPage={getState:()=>({components:parts.length,selected:selected?.ref,visibleRows:$('#component-rows').children.length,schematicReady:!!schematic,schematicView,boardView,model:model?.getState()}),selectPart,showBoard};document.documentElement.dataset.pageReady='true';
}
init().catch(error=>{$('#component-count').textContent='Component data could not load. Download the CSV to inspect the list.';console.error(error);});
