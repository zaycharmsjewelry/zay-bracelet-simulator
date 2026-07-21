
const canvas = document.getElementById('braceletCanvas');
const ctx = canvas.getContext('2d');
const braceletSelect = document.getElementById('braceletSelect');
const grid = document.getElementById('charmGrid');
const search = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const selectedList = document.getElementById('selectedList');

const braceletImages = {};
const charmImages = {};
let selected = [];
let dragging = -1;

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=src;
  });
}
async function preload(){
  braceletImages[1]=await loadImage('assets/bracelet-1.png');
  braceletImages[2]=await loadImage('assets/bracelet-2.png');
  await Promise.all(CHARMS.map(async c => charmImages[c.id]=await loadImage(c.src)));
  render();
  renderGrid();
}
const categories=[...new Set(CHARMS.map(c=>c.category))];
categories.forEach(c=>{
  const o=document.createElement('option');o.value=c;o.textContent=c;categoryFilter.appendChild(o);
});

function defaultPosition(i){
  const type=braceletSelect.value;
  const total=Math.max(selected.length,1);
  const t=(i+1)/(total+1);
  // Tuned to the supplied diagonal bracelet images.
  if(type==='1') return {x:105+t*690, y:565-t*470};
  return {x:105+t*680, y:585-t*490};
}
function ensurePositions(){
  selected.forEach((s,i)=>{
    if(!Number.isFinite(s.x)||!Number.isFinite(s.y)){
      const p=defaultPosition(i); s.x=p.x;s.y=p.y;
    }
  });
}

function drawCoverImage(img){
  const scale=Math.min(canvas.width/img.width,canvas.height/img.height)*0.95;
  const w=img.width*scale,h=img.height*scale;
  ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
}
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#fffdf9';ctx.fillRect(0,0,canvas.width,canvas.height);
  const b=braceletImages[braceletSelect.value];
  if(b) drawCoverImage(b);
  ensurePositions();
  selected.forEach((s,i)=>{
    const img=charmImages[s.id];
    if(!img) return;
    const target=92;
    const ratio=Math.min(target/img.width,target/img.height);
    const w=img.width*ratio,h=img.height*ratio;
    s.w=w;s.h=h;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.15)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
    ctx.drawImage(img,s.x-w/2,s.y-h/2,w,h);
    ctx.restore();
  });
  selectedList.textContent = selected.length ? `${selected.length} charm${selected.length>1?'s':''} selected` : 'No charms selected yet';
  updateBadges();
}

function renderGrid(){
  const q=search.value.trim().toLowerCase();
  const cat=categoryFilter.value;
  const filtered=CHARMS.filter(c=>(cat==='all'||c.category===cat)&&(!q||c.name.toLowerCase().includes(q)||c.category.toLowerCase().includes(q)));
  grid.innerHTML='';
  filtered.forEach(c=>{
    const card=document.createElement('button');
    card.className='charm-card'; card.type='button'; card.dataset.id=c.id;
    card.innerHTML=`<img src="${c.src}" alt="${c.name}"><span>${c.name}</span><i class="badge" style="display:none">0</i>`;
    card.addEventListener('click',()=>addCharm(c.id));
    grid.appendChild(card);
  });
  updateBadges();
}
function updateBadges(){
  document.querySelectorAll('.charm-card').forEach(card=>{
    const count=selected.filter(s=>s.id===card.dataset.id).length;
    const badge=card.querySelector('.badge');
    badge.textContent=count;badge.style.display=count?'grid':'none';
  });
}
function addCharm(id){
  selected.push({id,x:null,y:null});
  // Re-space only items that have not been manually dragged.
  selected.forEach((s,i)=>{ const p=defaultPosition(i); if(!s.moved){s.x=p.x;s.y=p.y;} });
  render();
}
document.getElementById('undoBtn').onclick=()=>{selected.pop();render();};
document.getElementById('clearBtn').onclick=()=>{selected=[];render();};
braceletSelect.onchange=()=>{
  selected.forEach((s,i)=>{if(!s.moved){const p=defaultPosition(i);s.x=p.x;s.y=p.y;}});
  render();
};
search.oninput=renderGrid;categoryFilter.onchange=renderGrid;

function pointFromEvent(e){
  const rect=canvas.getBoundingClientRect();
  const touch=e.touches?.[0]||e.changedTouches?.[0];
  const clientX=touch?touch.clientX:e.clientX;
  const clientY=touch?touch.clientY:e.clientY;
  return {x:(clientX-rect.left)*canvas.width/rect.width,y:(clientY-rect.top)*canvas.height/rect.height};
}
function hitTest(p){
  for(let i=selected.length-1;i>=0;i--){
    const s=selected[i];
    if(Math.abs(p.x-s.x)<(s.w||90)/2+10 && Math.abs(p.y-s.y)<(s.h||90)/2+10) return i;
  }
  return -1;
}
function startDrag(e){const p=pointFromEvent(e);dragging=hitTest(p);if(dragging>=0)e.preventDefault();}
function moveDrag(e){
  if(dragging<0)return;
  e.preventDefault();
  const p=pointFromEvent(e);
  selected[dragging].x=Math.max(45,Math.min(canvas.width-45,p.x));
  selected[dragging].y=Math.max(45,Math.min(canvas.height-45,p.y));
  selected[dragging].moved=true;
  render();
}
function endDrag(){dragging=-1;}
canvas.addEventListener('mousedown',startDrag);
canvas.addEventListener('mousemove',moveDrag);
window.addEventListener('mouseup',endDrag);
canvas.addEventListener('touchstart',startDrag,{passive:false});
canvas.addEventListener('touchmove',moveDrag,{passive:false});
canvas.addEventListener('touchend',endDrag);

document.getElementById('saveBtn').onclick=()=>{
  render();
  const a=document.createElement('a');
  a.download='zay-bracelet-design.png';
  a.href=canvas.toDataURL('image/png');
  a.click();
};

preload().catch(err=>{
  console.error(err);
  alert('Some images could not load. Make sure the assets folder was uploaded with the HTML files.');
});
