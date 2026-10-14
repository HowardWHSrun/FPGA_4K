const assets={
 'carrier-schematic':['assets/Carrier_V17_Schematic.svg','Carrier V17 · complete schematic'],
 'combined-schematic':['assets/Combined_FPGA_Shared_LDO_V7_Schematic.svg','Combined FPGA + shared LDO V7 · complete schematic'],
 'combined-layout':['assets/Combined_FPGA_Shared_LDO_V7_Layout_Front.svg','Combined V7 · native placement · unrouted'],
 'fpga-schematic':['../meetings/2026-10-14-v16/fpga_viewer/schematic/FPGA_V41_Schematic.svg','FPGA V41 · complete schematic'],
 'ldo-schematic':['assets/Separate_LDO_V5_Schematic.svg','Separate ASIC LDO V5 · complete schematic']
};
const selected=assets[new URLSearchParams(location.search).get('asset')],stage=document.getElementById('stage'),drawing=document.getElementById('drawing'),status=document.getElementById('status');
let scale=1,x=0,y=0,drag=null;
function paint(){drawing.style.transform=`translate(${x}px,${y}px) scale(${scale})`;window.drawingState={ready:drawing.complete&&drawing.naturalWidth>0,scale,x,y,source:drawing.getAttribute('src')};}
function zoom(factor){scale=Math.max(.5,Math.min(25,scale*factor));paint();}
document.getElementById('in').onclick=()=>zoom(1.4);document.getElementById('out').onclick=()=>zoom(1/1.4);document.getElementById('fit').onclick=()=>{scale=1;x=y=0;paint();};
stage.addEventListener('wheel',event=>{event.preventDefault();zoom(Math.exp(-event.deltaY*.0015));},{passive:false});
stage.addEventListener('pointerdown',event=>{drag={id:event.pointerId,x:event.clientX,y:event.clientY};stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');});
stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;x+=event.clientX-drag.x;y+=event.clientY-drag.y;drag.x=event.clientX;drag.y=event.clientY;paint();});
function stop(){drag=null;stage.classList.remove('dragging');}stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
stage.addEventListener('keydown',event=>{if(['+','=','-','r','R'].includes(event.key)){event.preventDefault();if(event.key==='-')zoom(1/1.4);else if(event.key.toLowerCase()==='r')document.getElementById('fit').click();else zoom(1.4);}});
if(selected){document.getElementById('title').textContent=selected[1];document.title=selected[1];drawing.alt=selected[1];drawing.onload=()=>{status.hidden=true;paint();};drawing.onerror=()=>{status.textContent='Drawing unavailable. Reload this view.';};drawing.src=selected[0];}else{status.textContent='Select a drawing from the overview.';}

if(new URLSearchParams(location.search).get('asset')==='combined-layout'){
 document.getElementById('sides').hidden=false;
 document.querySelectorAll('[data-side]').forEach(button=>button.onclick=()=>{
  document.querySelectorAll('[data-side]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  drawing.src='assets/Combined_FPGA_Shared_LDO_V7_Layout_'+(button.dataset.side==='back'?'Back':'Front')+'.svg';
  drawing.alt='Combined V7 · '+button.dataset.side+' native placement · unrouted';
  scale=1;x=y=0;paint();
 });
}
