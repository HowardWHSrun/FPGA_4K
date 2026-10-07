const slides=[...document.querySelectorAll('.slide')];
let active=Math.max(0,slides.findIndex(s=>s.id===location.hash.slice(1)));
const count=document.querySelector('#slide-count');
function show(index){active=Math.max(0,Math.min(slides.length-1,index));slides.forEach((s,i)=>{s.classList.toggle('active',i===active);if(document.body.classList.contains('presenting'))s.setAttribute('aria-hidden',String(i!==active));else s.removeAttribute('aria-hidden')});count.textContent=`${active+1} / ${slides.length}`;history.replaceState(null,'',`#${slides[active].id}`);if(document.body.classList.contains('presenting'))window.scrollTo(0,0);window.dispatchEvent(new Event('meeting-slide-change'));}
function present(){document.body.classList.toggle('presenting');document.querySelector('#present').textContent=document.body.classList.contains('presenting')?'Exit presentation':'Present';show(active);if(!document.body.classList.contains('presenting'))slides[active].scrollIntoView();}
document.querySelector('#present').addEventListener('click',present);
document.querySelector('#previous').addEventListener('click',()=>show(active-1));
document.querySelector('#next').addEventListener('click',()=>show(active+1));
document.querySelector('#notes').addEventListener('click',()=>{document.body.classList.toggle('notes-visible');document.querySelector('#notes').setAttribute('aria-pressed',String(document.body.classList.contains('notes-visible')))});
document.querySelector('#fullscreen').addEventListener('click',async()=>{if(!document.body.classList.contains('presenting'))present();try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}});
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,canvas'))return;if(e.key===' '&&e.target.closest('button,a'))return;const presenting=document.body.classList.contains('presenting');if(e.key.toLowerCase()==='p'){present();e.preventDefault()}else if(e.key.toLowerCase()==='n'){document.querySelector('#notes').click();e.preventDefault()}else if(presenting&&['ArrowRight','PageDown',' '].includes(e.key)){show(active+1);e.preventDefault()}else if(presenting&&['ArrowLeft','PageUp'].includes(e.key)){show(active-1);e.preventDefault()}else if(presenting&&e.key==='Home'){show(0);e.preventDefault()}else if(presenting&&e.key==='End'){show(slides.length-1);e.preventDefault()}else if(presenting&&e.key==='Escape')present()});
window.addEventListener('hashchange',()=>{const index=slides.findIndex(s=>s.id===location.hash.slice(1));if(index>=0)show(index)});
show(active);
window.meetingDeck={show,slides:slides.length,get active(){return active},present};

document.querySelectorAll('a[href="#files"]').forEach(a=>a.addEventListener('click',()=>{if(document.body.classList.contains('presenting'))present()}));
