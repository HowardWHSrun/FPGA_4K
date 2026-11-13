
(function(){
  var buttons=document.querySelectorAll('.filters button');
  function apply(f){
    buttons.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f));});
    document.querySelectorAll('.finding').forEach(function(x){x.hidden=!(f==='all'||x.dataset.sev===f||(f==='new'&&x.dataset.origin==='new')||(f==='upd'&&x.dataset.upd));});
    document.querySelectorAll('.catsec').forEach(function(s){s.hidden=!s.querySelector('.finding:not([hidden])');});
  }
  buttons.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.f);});});
  function openTarget(){var id=decodeURIComponent(location.hash.slice(1)); if(!id) return; var el=document.getElementById(id); if(!el) return; var p=el.closest('details'); while(p){p.open=true; p=p.parentElement&&p.parentElement.closest('details');} el.querySelectorAll('details').forEach(function(d){d.open=true;}); var s=el.closest('.catsec'); if(s) s.hidden=false; el.hidden=false; try{el.scrollIntoView({behavior:'instant',block:'start'});}catch(x){el.scrollIntoView();}}
  window.addEventListener('hashchange',openTarget); openTarget();
})();
