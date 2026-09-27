(async()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  window.addEventListener('message',event=>{
    const frame=$('#pin-frame');
    if(event.origin!==location.origin||event.source!==frame?.contentWindow||event.data?.type!=='fpga-pin-map-height')return;
    const height=Number(event.data.height);
    if(Number.isFinite(height)&&height>=200&&height<=5000)frame.style.height=Math.ceil(height+2)+'px';
  });
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const descriptions={fpga:'Collect data and generate timing.',power:'Convert cable power into four rails.',decoupling:'Supply brief current pulses near the FPGA.',boot:'Store the image for independent startup.',clock:'Provide the 32 MHz reference.',configuration:'Set startup states and allow programming.',connectors:'Connect the routing board and powered cable.'};
  const say={fpga:'U1 collects the ASIC outputs, generates timing and control signals, and organizes data for the downstream FPGA module.',power:'Four converters create the voltages needed by the FPGA core and I/O. Their surrounding parts store energy, set voltage and control startup.',decoupling:'These capacitors are local energy reserves. They supply brief current pulses close to the chip while the regulator and power planes respond.',boot:'U6 stores the FPGA configuration image so this board can start by itself. Removing it would require another device to configure the FPGA at every power-up.',clock:'Y1 supplies the 32 MHz reference. Its resistor shapes the clock edge, and the nearby capacitors support its supply.',configuration:'These parts tell the FPGA how to start and let us program it. Required logic states must remain even where resistor footprints could become copper ties.',connectors:'J4 combines cable power and JTAG, with data contacts awaiting assignment. J5 and J6 allocate 116 candidate FPGA signals plus one external analog AC_IN contact across the two 60-contact interfaces; three contacts remain reserved.'};
  try{
    const responses=await Promise.all(['data/Component_Necessity.json','review-data.json'].map(u=>fetch(u,{cache:'no-cache'})));
    if(responses.some(r=>!r.ok))throw Error('Component evidence could not be loaded');
    const [data,board]=await Promise.all(responses.map(r=>r.json()));
    if(data.boardSha256!==board.boardSha256||data.components.length!==board.components||data.components.reduce((n,c)=>n+c.pins.length,0)!==board.canonicalPins||data.fabricationReady||data.cadModified)throw Error('Audit does not match the saved board');
    const refs=new Set(data.components.map(c=>c.reference));
    if(refs.size!==data.components.length)throw Error('Duplicate component references');
    const removed=['R12','R106','R107','R113'].filter(ref=>!refs.has(ref));
    const removalSummary=removed.length?`${removed.join(', ')} already removed. `:'';
    const remainingSimplification='Further reductions require preserving each circuit function; capacitor removal needs power-integrity evidence.';
    $('#simplification-summary').innerHTML=`${removalSummary?`<strong>${esc(removalSummary)}</strong>`:''}${esc(remainingSimplification)}`;
    let group='fpga',page=0,selected='U1';const pageSize=10;
    const sourceById=Object.fromEntries(data.sources.map(s=>[s.id,s]));
    function renderGroups(){
      $('#component-groups').innerHTML=data.groups.map(g=>`<button type="button" data-component-group="${esc(g.id)}" aria-pressed="${group===g.id}"><strong>${esc(g.title)} <span>${g.count}</span></strong><small>${esc(descriptions[g.id])}</small></button>`).join('')+`<button type="button" data-component-group="all" aria-pressed="${group==='all'}"><strong>All components <span>${data.components.length}</span></strong><small>Search the complete population.</small></button>`;
      $('#component-groups').querySelectorAll('button').forEach(b=>b.onclick=()=>{group=b.dataset.componentGroup;page=0;$('#component-search').value='';$('#component-necessity').value='all';render();});
    }
    function renderDetail(){
      const c=data.components.find(c=>c.reference===selected);if(!c){$('#component-detail').innerHTML='<p>No matching component. Clear the search or change the filter.</p>';return;}
      const finding=data.newFindings.filter(f=>f.endpoints.some(e=>e.startsWith(c.reference+'.')));
      const sources=c.sourceIds.map(id=>sourceById[id]).filter(s=>s?.url).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ');
      $('#component-detail').innerHTML=`<p class="panel-kicker">${esc(c.groupLabel)} · ${esc(c.side)}</p><div class="part-title"><h3>${esc(c.reference)}</h3><span class="necessity-badge ${esc(c.status)}">${esc(data.statusLegend[c.status].label)}</span></div><p class="part-value">${esc(c.value)}</p><h4>${esc(c.shortRole)}</h4><p class="part-summary">${esc(c.whyNeeded)}</p>${finding.map(f=>`<p class="part-finding"><strong>${f.severity==='assignment-corrected'?'Assignment corrected':f.severity==='correction-required'?'Correction required':'Pin review'}:</strong> ${esc(f.summary)}</p>`).join('')}<details id="component-depth"><summary>Removal decision + every pin connection</summary><dl><dt>If removed</dt><dd>${esc(c.ifRemoved)}</dd><dt>Decision</dt><dd>${esc(c.reviewDecision)}</dd><dt>Part number</dt><dd class="part-mpn">${esc(c.mpn||'Not finalized')}</dd></dl><p class="small">${esc(data.statusLegend[c.status].meaning)}</p><div class="table-wrap pin-connection-table"><table><thead><tr><th>Pin</th><th>Function</th><th>Net</th><th>Saved status</th></tr></thead><tbody>${c.pins.map(p=>`<tr><td>${esc(p.pin)}</td><td>${esc(p.function||'—')}</td><td>${esc(p.net||'—')}</td><td>${esc(p.status)}</td></tr>`).join('')}</tbody></table></div>${sources?`<p class="small">Sources: ${sources}</p>`:''}</details><p class="part-actions"><a href="pins/?component=${encodeURIComponent(c.reference)}">Show labeled pins ↗</a><a href="viewer/?board=compact-routed">Inspect board ↗</a></p>`;
    }
    function render(){
      const q=$('#component-search').value.trim().toLowerCase(),status=$('#component-necessity').value;
      const match=data.components.filter(c=>(group==='all'||c.group===group)&&(status==='all'||c.status===status)&&(!q||[c.reference,c.value,c.shortRole,c.whyNeeded,c.groupLabel,...c.pins.map(p=>p.net)].join(' ').toLowerCase().includes(q)));
      const pages=Math.max(1,Math.ceil(match.length/pageSize));page=Math.min(page,pages-1);
      const shown=match.slice(page*pageSize,(page+1)*pageSize);if(!shown.some(c=>c.reference===selected))selected=shown[0]?.reference;
      $('#component-count').textContent=`${match.length} of ${data.components.length} components`;
      $('#component-list').innerHTML=shown.map(c=>`<button type="button" data-part="${esc(c.reference)}" aria-pressed="${c.reference===selected}"><b>${esc(c.reference)}</b><span>${esc(c.shortRole)}</span></button>`).join('');
      $('#component-list').querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.part;render();});
      $('#parts-prev').disabled=page===0;$('#parts-next').disabled=page===pages-1;$('#parts-page').textContent=`${page+1} / ${pages}`;
      renderGroups();renderDetail();
    }
    $('#component-search').oninput=()=>{group='all';page=0;render();};
    $('#component-necessity').onchange=()=>{group='all';page=0;render();};
    $('#parts-prev').onclick=()=>{page--;render();};$('#parts-next').onclick=()=>{page++;render();};
    $('#speaking-notes').innerHTML=data.groups.map(g=>`<h3>${esc(g.title)} · ${g.count} ${g.count===1?'part':'parts'}</h3><p>${esc(say[g.id])}</p>`).join('')+`<p><strong>When asked whether every part is necessary:</strong> ${esc(removalSummary+remainingSimplification)} We have documented the function of every part; we have not demonstrated the smallest working implementation.</p>`;
    render();document.documentElement.dataset.teachingReady='true';
    window.FPGA_TEACHING=Object.freeze({data,getState:()=>({boardSha256:data.boardSha256,components:data.components.length,pins:data.counts.pins,group,selected})});
  }catch(error){$('#component-error').hidden=false;console.error(error);}
})();
