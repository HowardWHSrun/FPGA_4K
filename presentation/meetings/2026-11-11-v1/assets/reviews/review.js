
(function(){
  var buttons=document.querySelectorAll('.filters button');
  function apply(f){
    buttons.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f));});
    document.querySelectorAll('.sevgroup').forEach(function(g){g.hidden=!(f==='all'||g.dataset.sev===f);});
  }
  buttons.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.f);});});
  function openTarget(){
    var id=decodeURIComponent(location.hash.slice(1)); if(!id) return;
    var el=document.getElementById(id); if(!el) return;
    if(el.classList.contains('finding')){apply('all'); var d=el.querySelector('details'); if(d) d.open=true; el.scrollIntoView();}
  }
  window.addEventListener('hashchange',openTarget); openTarget();
  window.addEventListener('beforeprint',function(){document.querySelectorAll('details').forEach(function(d){d.open=true;});});
})();
