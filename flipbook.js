(() => {
'use strict';
const $ = id => document.getElementById(id), total = 71;
const sheet=$('sheet'), book=$('book'), turn=$('turn'), stage=$('stage');
let current=1, busy=false, startX=0, startY=0;
const src=n=>`assets/catalogue/pages/${String(n).padStart(2,'0')}.webp`;
const preload=n=>{if(n>0&&n<=total){const image=new Image();image.src=src(n);}};
function controls(){ $('previous').disabled=busy||current===1; $('next').disabled=busy||current===total; $('page').value=current; }
async function go(n){
 n=Math.max(1,Math.min(total,Math.round(Number(n))));if(!Number.isFinite(n)||n===current||busy)return;
 busy=true;controls();$('status').textContent=`Loading page ${n}…`;
 const image=new Image();image.src=src(n);
 try{await image.decode();}catch(e){$('status').textContent='This page could not load. Please try again or download the PDF.';busy=false;controls();return;}
 const forward=n>current;
 turn.style.backgroundImage=`url("${forward?src(current):src(n)}")`;
 if(forward)sheet.src=src(n);
 book.classList.add(forward?'forward':'backward');
 await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:550));
 sheet.src=src(n);sheet.alt=`Catalogue page ${n} of ${total}`;current=n;
 book.classList.remove('forward','backward');busy=false;controls();$('status').textContent=`Page ${n} of ${total}`;
 history.replaceState(null,'',`#page=${n}`);preload(n+1);preload(n-1);
}
$('previous').onclick=()=>go(current-1);$('next').onclick=()=>go(current+1);
$('jump').onsubmit=e=>{e.preventDefault();go($('page').value);};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowRight'){e.preventDefault();go(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(current-1);}});
stage.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;},{passive:true});
stage.addEventListener('touchend',e=>{if(stage.classList.contains('zoomed'))return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));},{passive:true});
$('zoom').onclick=()=>{const active=stage.classList.toggle('zoomed');$('zoom').textContent=active?'Zoom out':'Zoom in';$('zoom').setAttribute('aria-pressed',String(active));};
if(!document.fullscreenEnabled)$('fullscreen').hidden=true;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('reader').requestFullscreen();}catch(e){$('status').textContent='Full screen is unavailable in this browser.';}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
controls();preload(2);const initial=location.hash.match(/^#page=(\d+)$/);if(initial)go(initial[1]);
})();