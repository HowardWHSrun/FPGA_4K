const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),frame=$('native-view');
if(params.get('embed')==='1')document.documentElement.classList.add('embedded');
const state={revision:'V3',view:'layout',ready:false,error:null,source:null,sourceSHA256:null,counts:null};
let generation=0;
function snapshot(){return JSON.parse(JSON.stringify(state));}
function setView(view,writeURL=true){
 if(!['layout','schematic'].includes(view))return;
 state.view=view;state.ready=false;state.error=null;document.body.dataset.ready='false';generation++;
 document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
 const url=view+'.html';if(frame.getAttribute('src')!==url)frame.src=url;
 frame.title='Direct LDO Carrier · native '+view;$('open-view').href=url;
 $('view-status').textContent='Loading native '+view+'…';
 if(writeURL){const next=new URL(location.href);next.searchParams.set('view',view);history.replaceState(null,'',next);}
 inspect(generation);
}
async function inspect(current){
 const deadline=performance.now()+60000;
 while(current===generation&&performance.now()<deadline){
  const child=frame.contentWindow;
  try{
   const detail=state.view==='layout'?child.nativePcbViewer?.getState():child.nativeSchematicViewer?.getState();
   const error=state.view==='layout'?child.pcbViewerDiagnostics?.error:child.schematicViewerDiagnostics?.error;
   if(error){state.error=error;$('view-status').textContent='Unable to load this view. Open it separately to retry.';return;}
   if(detail?.ready){state.ready=true;state.source=state.view+'.html';state.sourceSHA256=detail.sourceSHA256;state.counts=detail.counts;document.body.dataset.ready='true';$('view-status').textContent='Direct LDO Carrier · native '+state.view;return;}
  }catch{/* The child is still navigating. */}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 if(current===generation&&!state.ready){state.error='Viewer timed out';$('view-status').textContent='Loading is taking longer than expected. Open this view separately.';}
}
window.carrierV3Viewer={getState:snapshot,setView};
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>setView(button.dataset.view);
frame.addEventListener('load',()=>inspect(generation));
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;if(event.data?.type==='native-pcb-ready'||event.data?.type==='native-schematic-ready')inspect(generation);});
fetch('board.json').then(response=>{if(!response.ok)throw Error('Direct LDO Carrier file index unavailable');return response.json();}).then(board=>{
 for(const [key,id]of [['kicad','download-kicad'],['gerbers','download-gerbers'],['bom','download-bom'],['cpl','download-cpl'],['guide','download-guide']]){if(board.downloads?.[key]){$(id).href=board.downloads[key];$(id).hidden=false;}}
}).catch(error=>{state.error=error.message;$('view-status').textContent=error.message;});
setView(params.get('view')||'layout',false);
