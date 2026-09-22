/* Read-only drill-down. Native CAD is fetched for inspection, never edited or executed. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), slides=window.FPGA_SLIDES||[];
  const root=new URL('../../',location.href), boardPath='hardware/fpga-board/hardware/';
  const stem='Howard_FPGA_Connected_42x40';
  const repo='https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/';
  const current={slide:0,mode:'front',zoom:1,x:0,y:0,nativeReady:false};
  let files=[],modulePromise=null,loadToken=0,disposed=false;
  const viewport=$('viewport'),image=$('board-image'),transform=$('board-transform');
  function safePath(name){return /^[a-zA-Z0-9_.-]+\.kicad_(pcb|sch|pro)$/.test(name);}
  function sourceURL(name){if(!safePath(name))throw new Error('Invalid document name');return new URL(boardPath+name,root).href;}
  const c=()=>slides[current.slide];
  const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
  function setSlide(value,historyWrite=true){
    const idx=typeof value==='number'?value:slides.findIndex(s=>s.id===value);
    current.slide=Math.max(0,Math.min(slides.length-1,idx));
    const slide=c();$('title').textContent=slide.title;$('subtitle').textContent=slide.subtitle;
    $('crumb').textContent=slide.name;$('kicker').textContent=String(current.slide+1).padStart(2,'0')+' / '+slide.name;
    $('description').textContent=slide.description;$('note-label').textContent=slide.noteLabel;$('note').textContent=slide.note;
    $('facts').replaceChildren();slide.facts.forEach(([v,l])=>{const e=document.createElement('div');e.append(node('strong',v),node('small',l));$('facts').append(e);});
    $('points').replaceChildren();slide.points.forEach(([t,p])=>{const e=document.createElement('div');e.className='pcb-point';e.append(node('strong',t),node('p',p));$('points').append(e);});
    $('inspect').textContent=slide.document.endsWith('.kicad_pcb')?'Inspect native PCB ↗':'Inspect related schematic ↗';
    $('previous').disabled=current.slide===0;$('next').disabled=current.slide===slides.length-1;
    $('page').textContent=String(current.slide+1).padStart(2,'0');$('pages').textContent=String(slides.length).padStart(2,'0');
    document.querySelectorAll('[data-chapter]').forEach(b=>{if(b.dataset.chapter===slide.id)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    if(historyWrite&&location.hash!=='#'+slide.id)history.pushState(null,'','#'+slide.id);
    setMode(slide.side);document.title=slide.title+' | FPGA PCB Review';
  }
  slides.forEach((s,i)=>{const b=document.createElement('button');b.dataset.chapter=s.id;b.append(node('span',String(i+1).padStart(2,'0')),node('strong',s.name));b.onclick=()=>setSlide(i);$('chapters').append(b);});
  function updateTransform(){transform.style.transform=`translate(${current.x}px,${current.y}px) scale(${current.zoom})`;$('zoom-value').textContent=Math.round(current.zoom*100)+'%';}
  function fit(){current.zoom=1;current.x=current.y=0;updateTransform();}
  function zoom(factor){current.zoom=Math.max(.6,Math.min(6,current.zoom*factor));updateTransform();}
  function setMode(mode){
    current.mode=mode;
    for(const k of ['front','back','native'])$(k).setAttribute('aria-pressed',String(k===mode));
    viewport.hidden=mode==='native';$('native-panel').hidden=mode!=='native';
    $('view-help').textContent=mode==='native'?'Read-only native documents':'Drag to pan · scroll to zoom';
    if(mode==='native'){$('view-caption').textContent='KiCanvas · native PCB / schematic inspection';return;}
    loadToken++;current.nativeReady=false;$('native-mount').replaceChildren();
    $('image-state').textContent='Loading KiCad layout…';$('image-state').hidden=false;
    const url=new URL('hardware/fpga-board/previews/'+mode+'.svg',root).href;
    image.alt=(mode==='back'?'Mirrored back':'Front')+' copper and fabrication export from the FPGA KiCad board';
    image.onload=()=>{$('image-state').hidden=true;image.dataset.loaded='true';};
    image.onerror=()=>{$('image-state').textContent='The layout export could not load. Use KiCad files to open the native project.';image.dataset.loaded='false';};
    image.src=url;
    $('view-caption').textContent='KiCad export · '+(mode==='back'?'back view mirrored':'front copper + fabrication')+' · inner layers omitted';fit();
    if(image.complete&&image.naturalWidth>0){$('image-state').hidden=true;image.dataset.loaded='true';}
  }
  function loadModule(){
    if(customElements.get('kicanvas-embed'))return Promise.resolve();
    if(modulePromise)return modulePromise;
    modulePromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.type='module';s.src='https://kicanvas.org/kicanvas.js';
      const timer=setTimeout(()=>reject(new Error('Native viewer did not initialize; front/back layouts remain available.')),20000);
      s.onload=()=>customElements.whenDefined('kicanvas-embed').then(()=>{clearTimeout(timer);resolve();});
      s.onerror=()=>{clearTimeout(timer);modulePromise=null;reject(new Error('KiCanvas could not load. Use the front/back layouts or open the native files in desktop KiCad.'));};
      document.head.append(s);
    });return modulePromise;
  }
  async function loadSheetIndex(){
    try{
      const response=await fetch(sourceURL(stem+'.kicad_sch'));
      if(!response.ok)throw new Error('Schematic index HTTP '+response.status);
      const text=await response.text();
      files=[...new Set([...text.matchAll(/\(property\s+"Sheetfile"\s+"([^"]+)"/g)].map(m=>m[1]).filter(safePath))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
      files.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent='Schematic · '+name.replace('.kicad_sch','').replaceAll('_',' ');$('document').append(o);});
      document.body.dataset.sheets=String(files.length+1);
    }catch(error){console.warn('Schematic index unavailable:',error.message);}
  }
  const indexPromise=loadSheetIndex();
  function canvasesBelow(e){const found=[];const walk=n=>{if(n instanceof HTMLCanvasElement)found.push(n);if(n.shadowRoot)walk(n.shadowRoot);for(const k of n.children||[])walk(k);};walk(e);return found;}
  async function openNative(name=stem+'.kicad_pcb'){
    if(!safePath(name))return;
    setMode('native');const token=++loadToken;current.nativeReady=false;
    const status=$('native-status');status.hidden=false;status.textContent='Opening read-only KiCad document…';$('native-mount').replaceChildren();
    try{
      await Promise.all([loadModule(),indexPromise]);if(token!==loadToken||disposed)return;
      if(![...$('document').options].some(o=>o.value===name)){$('document').append(new Option('Schematic · '+name,name));}
      $('document').value=name;$('native-source').href=repo+boardPath+name;
      const viewer=document.createElement('kicanvas-embed');viewer.setAttribute('controls','full');viewer.setAttribute('controlslist','nooverlay');
      if(name===stem+'.kicad_sch'&&files.length){
        [name,...files].forEach(f=>{const child=document.createElement('kicanvas-source');child.setAttribute('src',sourceURL(f));viewer.append(child);});
      }else viewer.setAttribute('src',sourceURL(name));
      $('native-mount').append(viewer);
      let tries=0;const probe=()=>{
        if(token!==loadToken||disposed)return;
        const canvas=canvasesBelow(viewer).find(x=>x.width>0&&x.height>0);
        if(canvas){current.nativeReady=true;status.hidden=true;document.body.dataset.nativeReady='true';}
        else if(tries++<70)setTimeout(probe,250);
        else status.textContent='The native document is still loading or this KiCad version is unsupported. Front/back layouts and original source files remain available.';
      };setTimeout(probe,500);
    }catch(error){if(token===loadToken){status.hidden=false;status.textContent=error.message;}}
  }
  $('front').onclick=()=>setMode('front');$('back').onclick=()=>setMode('back');$('native').onclick=()=>openNative();
  $('inspect').onclick=()=>openNative(c().document);$('document').onchange=e=>openNative(e.target.value);
  $('zoom-in').onclick=()=>zoom(1.25);$('zoom-out').onclick=()=>zoom(.8);$('fit').onclick=fit;
  const touches=new Map();let start=null,pinch=0;
  viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;if(e.button!==0)return;touches.set(e.pointerId,[e.clientX,e.clientY]);viewport.setPointerCapture(e.pointerId);start=[e.clientX,e.clientY];pinch=0;viewport.classList.add('dragging');});
  viewport.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){const p=[...touches.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch)zoom(d/pinch);pinch=d;}else if(start){current.x+=e.clientX-start[0];current.y+=e.clientY-start[1];updateTransform();}start=[e.clientX,e.clientY];});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>viewport.addEventListener(type,e=>{touches.delete(e.pointerId);start=null;pinch=0;viewport.classList.remove('dragging');}));
  viewport.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.0015));},{passive:false});
  const dialog=$('details');function showDialog(title){$('dialog-title').textContent=title;$('dialog-content').replaceChildren();dialog.showModal();}
  function appendLink(where,label,url){const a=document.createElement('a');a.textContent=label+' ↗';a.href=url;a.target='_blank';a.rel='noopener';where.append(a);}
  $('evidence').onclick=()=>{showDialog(c().title);c().notes.forEach(t=>$('dialog-content').append(node('p',t)));const links=document.createElement('div');links.className='native-sources';c().sources.forEach(([u,l])=>appendLink(links,l,u));$('dialog-content').append(links);};
  $('files-button').onclick=()=>{
    showDialog('Open the complete KiCad project');
    $('dialog-content').append(node('p','For desktop editing, keep the FPGA hardware folder, all child schematic sheets and the custom libraries together. Open Howard_FPGA_Connected_42x40.kicad_pro through KiCad Project Manager. The repository specifies KiCad 10.0.6 for this handoff.'));
    const links=document.createElement('div');links.className='files-links';
    appendLink(links,'Download repository ZIP · includes project and libraries','https://github.com/HowardWHSrun/FPGA_4K/archive/refs/heads/presentation.zip');
    appendLink(links,'Native PCB file',repo+boardPath+stem+'.kicad_pcb');
    appendLink(links,'Top-level schematic',repo+boardPath+stem+'.kicad_sch');
    appendLink(links,'KiCad project',repo+boardPath+stem+'.kicad_pro');
    appendLink(links,'FPGA working-design guide',repo+'hardware/fpga-board/README.md');
    $('dialog-content').append(links,node('p','The browser viewer is read-only and loaded from kicanvas.org on request. It is an early-stage viewer; rendering limitations do not change the original CAD. Use the original files for design verification.','dialog-detail'));
  };
  $('close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}}
  $('fullscreen').onclick=fullscreen;$('previous').onclick=()=>setSlide(current.slide-1);$('next').onclick=()=>setSlide(current.slide+1);
  document.addEventListener('keydown',e=>{if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.composedPath().some(n=>n.tagName==='KICANVAS-EMBED'))return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();setSlide(current.slide+1);}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();setSlide(current.slide-1);}else if(e.key.toLowerCase()==='f')fullscreen();else if(e.key.toLowerCase()==='r')fit();else if(/^[1-5]$/.test(e.key))setSlide(Number(e.key)-1);});
  function fromHash(){const i=slides.findIndex(s=>'#'+s.id===location.hash);setSlide(i<0?0:i,false);}
  addEventListener('popstate',fromHash);addEventListener('hashchange',fromHash);addEventListener('pagehide',()=>{disposed=true;});fromHash();
  window.FPGA_REVIEW={getState:()=>({...current,slideId:c().id,sheets:files.length+1,document:$('document').value}),setSlide,openNative};
})();
