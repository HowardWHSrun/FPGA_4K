const assets={
 'carrier-schematic':['assets/Carrier_V41_Schematic.svg','Carrier V41 · complete schematic'],
 'combined-schematic':['assets/Combined_FPGA_Shared_LDO_V7_Schematic.svg','Combined FPGA + shared LDO V7 · complete schematic'],
 'combined-layout':['assets/Combined_FPGA_Shared_LDO_V7_Layout_Front.svg','Combined V7 · native placement · unrouted'],
 'fpga-schematic':['../meetings/2026-10-14-v16/fpga_viewer/schematic/FPGA_V41_Schematic.svg','FPGA V41 · complete schematic'],
 'ldo-schematic':['assets/Separate_LDO_V5_Schematic.svg','Separate ASIC LDO V5 · complete schematic']
};
const stage=document.getElementById('stage'),drawing=document.getElementById('drawing'),status=document.getElementById('status'),picker=document.getElementById('drawing-picker');
let scale=1,x=0,y=0,drag=null,activeAsset='',loadTimer;
function paint(){drawing.style.transform=`translate(${x}px,${y}px) scale(${scale})`;window.drawingState={ready:drawing.complete&&drawing.naturalWidth>0,scale,x,y,source:drawing.getAttribute('src'),asset:activeAsset};}
function zoom(factor){scale=Math.max(.5,Math.min(25,scale*factor));paint();}
function message(text){status.replaceChildren(document.createTextNode(text+' '));const link=document.createElement('a');link.href=activeAsset==='carrier-schematic'?'https://howardwhsrun.github.io/FPGA_4K/?approach=direct#overview':'https://howardwhsrun.github.io/FPGA_4K/#fpga';link.target='_top';link.textContent='Return to overview';status.append(link);status.hidden=false;}
function reset(){scale=1;x=y=0;paint();}
function showAsset(key,updateAddress=false){
 activeAsset=Object.hasOwn(assets,key)?key:'fpga-schematic';const selected=assets[activeAsset];clearTimeout(loadTimer);
 document.querySelector('.overview-link').href=activeAsset==='carrier-schematic'?'https://howardwhsrun.github.io/FPGA_4K/?approach=direct#overview':'https://howardwhsrun.github.io/FPGA_4K/#fpga';
 picker.value=activeAsset;document.getElementById('title').textContent=selected[1];document.title=selected[1];drawing.alt=selected[1];drawing.hidden=false;document.getElementById('sides').hidden=activeAsset!=='combined-layout';
 document.querySelectorAll('[data-side]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.side==='front')));
 message('Loading drawing…');drawing.onload=()=>{clearTimeout(loadTimer);status.hidden=true;paint();};drawing.onerror=()=>{clearTimeout(loadTimer);drawing.hidden=true;message('Drawing unavailable. Choose another drawing above or');paint();};drawing.src=selected[0];reset();
 loadTimer=setTimeout(()=>{if(!drawing.complete)message('This drawing is taking longer to load. Choose another drawing above or');},15000);
 if(updateAddress&&/^https?:$/.test(location.protocol)){const url=new URL(location.href);url.searchParams.set('asset',activeAsset);history.replaceState(null,'',url);}
}
for(const [id,action] of [['in',()=>zoom(1.4)],['out',()=>zoom(1/1.4)],['fit',reset]])document.getElementById(id).onclick=action;
 picker.onchange=()=>showAsset(picker.value,true);
 stage.addEventListener('wheel',event=>{event.preventDefault();zoom(Math.exp(-event.deltaY*.0015));},{passive:false});
 stage.addEventListener('pointerdown',event=>{if(event.target.closest('a'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');});
 stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;x+=event.clientX-drag.x;y+=event.clientY-drag.y;drag.x=event.clientX;drag.y=event.clientY;paint();});
 function stop(){drag=null;stage.classList.remove('dragging');}stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
 stage.addEventListener('keydown',event=>{if(['+','=','-','r','R'].includes(event.key)){event.preventDefault();if(event.key==='-')zoom(1/1.4);else if(event.key.toLowerCase()==='r')reset();else zoom(1.4);}});
 document.querySelectorAll('[data-side]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-side]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));drawing.src='assets/Combined_FPGA_Shared_LDO_V7_Layout_'+(button.dataset.side==='back'?'Back':'Front')+'.svg';drawing.alt='Combined V7 · '+button.dataset.side+' native placement · unrouted';reset();});
 showAsset(new URLSearchParams(location.search).get('asset'));
