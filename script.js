/* =============================================
   COLORS
   ============================================= */
const COLORS = ['#FF6B9D','#FFD93D','#6BCB77','#4ECDC4','#C77DFF','#FF9A3C','#ffffff','#FF4757','#FFA502','#A29BFE','#fd79a8','#ffeaa7'];

/* =============================================
   CURSOR
   ============================================= */
const cur = document.getElementById('cursor');
document.addEventListener('mousemove', e => { cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px'; });
document.addEventListener('mousedown', () => cur.style.transform='translate(-50%,-50%) scale(1.8)');
document.addEventListener('mouseup',   () => cur.style.transform='translate(-50%,-50%) scale(1)');

/* =============================================
   FLOATING BG DOTS
   ============================================= */
const bgEl = document.getElementById('confettiBg');
for (let i=0;i<28;i++) {
  const d=document.createElement('div'); d.className='dot';
  const s=[10,14,18,22][Math.floor(Math.random()*4)];
  d.style.cssText=`width:${s}px;height:${s}px;background:${COLORS[Math.floor(Math.random()*COLORS.length)]};left:${Math.random()*100}%;animation-duration:${9+Math.random()*12}s;animation-delay:${Math.random()*16}s;`;
  bgEl.appendChild(d);
}

/* =============================================
   CLICK BURST
   ============================================= */
document.addEventListener('click', e => {
  const b=document.createElement('div'); b.className='burst';
  b.style.left=e.clientX+'px'; b.style.top=e.clientY+'px';
  for(let i=0;i<10;i++){
    const dot=document.createElement('div'); dot.className='burst-dot';
    const ang=(i/10)*360, dist=40+Math.random()*40;
    dot.style.cssText=`background:${COLORS[Math.floor(Math.random()*COLORS.length)]};--tx:${Math.cos(ang*Math.PI/180)*dist}px;--ty:${Math.sin(ang*Math.PI/180)*dist}px;animation-delay:${Math.random()*.1}s;`;
    b.appendChild(dot);
  }
  document.body.appendChild(b);
  setTimeout(()=>b.remove(),900);
});

/* =============================================
   COUNTDOWN
   ============================================= */
// ⚠️ Ubah tanggal di sini jika perlu
const TARGET = new Date('2026-03-31T00:00:00');
let triggered = false;

function setNum(el, val) {
  const s = String(val).padStart(2,'0');
  if (el.textContent !== s) {
    el.textContent = s;
    el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
  }
}

function tick() {
  const diff = TARGET - new Date();
  if (diff <= 0) {
    if (!triggered) { triggered=true; launchBirthday(); }
    return;
  }
  const tot = Math.floor(diff/1000);
  setNum(document.getElementById('cd-hari'),  Math.floor(tot/86400));
  setNum(document.getElementById('cd-jam'),   Math.floor((tot%86400)/3600));
  setNum(document.getElementById('cd-menit'), Math.floor((tot%3600)/60));
  setNum(document.getElementById('cd-detik'), tot%60);
  // urgent pulse last 10s
  document.getElementById('cdBoxDetik').classList.toggle('urgent', diff<10000);
  // flash last 5s
  if (diff<5000) { flashScreen(0.45); }
}
tick();
setInterval(tick, 1000);

/* =============================================
   LAUNCH BIRTHDAY SEQUENCE
   ============================================= */
function flashScreen(intensity=1) {
  const fl=document.getElementById('flash');
  fl.style.transition='none'; fl.style.opacity=intensity;
  requestAnimationFrame(()=>{ fl.style.transition='opacity 0.7s ease'; fl.style.opacity='0'; });
}

function launchBirthday() {
  // Big white flash
  flashScreen(1);

  // Fade out countdown
  const cd = document.getElementById('countdown-screen');
  cd.classList.add('fade-out');
  setTimeout(()=>{ cd.style.display='none'; }, 950);

  // Show main content
  setTimeout(()=>{
    const mc = document.getElementById('main-content');
    mc.classList.add('on');
    initReveal();
    initNav();
  }, 800);

  // Start fireworks + confetti
  setTimeout(()=>{
    startFireworks();
    startConfetti();
  }, 500);
}

/* =============================================
   FIREWORKS ENGINE
   ============================================= */
const fwC   = document.getElementById('fwCanvas');
const fwCtx = fwC.getContext('2d');
let fwParts=[], fwRocks=[], fwId=null, fwOn=false, fwMs=0;
const FW_DUR = 3000;

function szFW(){ fwC.width=window.innerWidth; fwC.height=window.innerHeight; }
szFW(); window.addEventListener('resize',szFW);

class Rocket {
  constructor(){
    this.x  = 80+Math.random()*(fwC.width-160);
    this.y  = fwC.height+10;
    this.tx = 80+Math.random()*(fwC.width-160);
    this.ty = 55+Math.random()*(fwC.height*0.52);
    const sp=5+Math.random()*6, ag=Math.atan2(this.ty-this.y,this.tx-this.x);
    this.vx=Math.cos(ag)*sp; this.vy=Math.sin(ag)*sp;
    this.color=COLORS[Math.floor(Math.random()*COLORS.length)];
    this.trail=[]; this.dead=false;
  }
  update(){
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>14) this.trail.shift();
    this.x+=this.vx; this.y+=this.vy;
    if(Math.hypot(this.x-this.tx,this.y-this.ty)<18){ this.explode(); this.dead=true; }
  }
  explode(){
    const n=85+Math.floor(Math.random()*60), st=Math.random();
    for(let i=0;i<n;i++){
      const a=(i/n)*Math.PI*2;
      const sp=st<.33?2+Math.random()*4:st<.66?(i%2?3:6)+Math.random()*2:Math.random()*7.5;
      const c=Math.random()<.22?'#fff':COLORS[Math.floor(Math.random()*COLORS.length)];
      fwParts.push(new FWP(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,c));
    }
    // Gold ring
    for(let i=0;i<24;i++){
      const a=(i/24)*Math.PI*2;
      fwParts.push(new FWP(this.x,this.y,Math.cos(a)*9.5,Math.sin(a)*9.5,'#FFD93D',true));
    }
  }
  draw(){
    for(let i=0;i<this.trail.length;i++){
      fwCtx.globalAlpha=(i/this.trail.length)*0.5;
      fwCtx.fillStyle=this.color;
      fwCtx.beginPath(); fwCtx.arc(this.trail[i].x,this.trail[i].y,(i/this.trail.length)*2.5,0,Math.PI*2); fwCtx.fill();
    }
    fwCtx.globalAlpha=1; fwCtx.fillStyle='#fff';
    fwCtx.beginPath(); fwCtx.arc(this.x,this.y,3,0,Math.PI*2); fwCtx.fill();
  }
}

class FWP {
  constructor(x,y,vx,vy,c,spark=false){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.c=c;this.spark=spark;
    this.a=1; this.dec=spark?.013+Math.random()*.009:.009+Math.random()*.015;
    this.sz=spark?2:2.5+Math.random()*2; this.g=0.075;
  }
  update(){ this.vy+=this.g; this.vx*=.98; this.vy*=.98; this.x+=this.vx; this.y+=this.vy; this.a-=this.dec; }
  draw(){
    fwCtx.globalAlpha=Math.max(0,this.a);
    fwCtx.fillStyle=this.c;
    fwCtx.beginPath(); fwCtx.arc(this.x,this.y,this.sz,0,Math.PI*2); fwCtx.fill();
    if(!this.spark){
      fwCtx.globalAlpha=Math.max(0,this.a*0.22);
      fwCtx.beginPath(); fwCtx.arc(this.x,this.y,this.sz*2.8,0,Math.PI*2); fwCtx.fill();
    }
  }
}

let lastLaunch=0;
function fwLoop(ts){
  if(!fwOn) return;
  fwMs+=16;
  fwCtx.globalAlpha=0.15; fwCtx.fillStyle='#07001a'; fwCtx.fillRect(0,0,fwC.width,fwC.height);
  const intv=fwMs<4000?250:fwMs<9000?370:520;
  if(ts-lastLaunch>intv){
    const n=fwMs<4000?3:fwMs<9000?2:1;
    for(let i=0;i<n;i++) fwRocks.push(new Rocket());
    lastLaunch=ts;
  }
  fwRocks=fwRocks.filter(r=>{ if(!r.dead){r.update();r.draw();return true;} return false; });
  fwParts=fwParts.filter(p=>{ p.update();p.draw();return p.a>0; });
  fwCtx.globalAlpha=1;
  if(fwMs<FW_DUR) fwId=requestAnimationFrame(fwLoop); else stopFW();
}

function startFireworks(){
  fwOn=true; fwMs=0; fwParts=[]; fwRocks=[];
  fwC.classList.add('on');
  fwId=requestAnimationFrame(fwLoop);
  setTimeout(stopFW, FW_DUR+2000);
}
function stopFW(){
  fwOn=false; cancelAnimationFrame(fwId);
  let op=1; const iv=setInterval(()=>{
    op-=0.04; fwC.style.opacity=op;
    if(op<=0){ fwC.classList.remove('on'); fwC.style.opacity=1; fwCtx.clearRect(0,0,fwC.width,fwC.height); clearInterval(iv); }
  },40);
}

/* =============================================
   CONFETTI RAIN
   ============================================= */
const cfC   = document.getElementById('cfCanvas');
const cfCtx = cfC.getContext('2d');
let cfPs=[], cfOn=false, cfId=null;

function szCF(){ cfC.width=window.innerWidth; cfC.height=window.innerHeight; }
szCF(); window.addEventListener('resize',szCF);

const SHAPES=['circle','rect','star','triangle'];
class Confetto {
  constructor(fromTop=false,delay=0){
    this.x=Math.random()*cfC.width;
    this.y=fromTop ? -20-Math.random()*cfC.height*0.4 : -20;
    this.sz=7+Math.random()*11;
    this.c=COLORS[Math.floor(Math.random()*COLORS.length)];
    this.shape=SHAPES[Math.floor(Math.random()*SHAPES.length)];
    this.vx=(Math.random()-.5)*2.8;
    this.vy=2.2+Math.random()*3.8;
    this.rot=Math.random()*Math.PI*2;
    this.rs=(Math.random()-.5)*.16;
    this.wob=Math.random()*Math.PI*2;
    this.wobSp=.04+Math.random()*.05;
    this.delay=delay;
  }
  update(){
    if(this.delay>0){this.delay--;return;}
    this.wob+=this.wobSp; this.x+=this.vx+Math.sin(this.wob)*1.3; this.y+=this.vy; this.rot+=this.rs;
    if(this.y>cfC.height+20){ this.y=-20; this.x=Math.random()*cfC.width; }
  }
  draw(){
    if(this.delay>0) return;
    cfCtx.save(); cfCtx.globalAlpha=0.88; cfCtx.fillStyle=this.c;
    cfCtx.translate(this.x,this.y); cfCtx.rotate(this.rot);
    if(this.shape==='circle'){
      cfCtx.beginPath(); cfCtx.ellipse(0,0,this.sz/2,this.sz/3,0,0,Math.PI*2); cfCtx.fill();
    } else if(this.shape==='rect'){
      cfCtx.fillRect(-this.sz/2,-this.sz/4,this.sz,this.sz/2);
    } else if(this.shape==='triangle'){
      cfCtx.beginPath(); cfCtx.moveTo(0,-this.sz/2); cfCtx.lineTo(this.sz/2,this.sz/2); cfCtx.lineTo(-this.sz/2,this.sz/2); cfCtx.closePath(); cfCtx.fill();
    } else {
      // star
      cfCtx.beginPath();
      for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2, ia=a+Math.PI/5;
        const r1=this.sz/2, r2=this.sz/4;
        i===0?cfCtx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1):cfCtx.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);
        cfCtx.lineTo(Math.cos(ia)*r2,Math.sin(ia)*r2);
      }
      cfCtx.closePath(); cfCtx.fill();
    }
    cfCtx.restore();
  }
}

function cfLoop(){
  if(!cfOn) return;
  cfCtx.clearRect(0,0,cfC.width,cfC.height);
  cfPs.forEach(p=>{p.update();p.draw();});
  cfId=requestAnimationFrame(cfLoop);
}

function startConfetti(){
  cfC.classList.add('on'); cfOn=true;
  for(let i=0;i<180;i++) cfPs.push(new Confetto(true,Math.floor(i*1.2)));
  cfId=requestAnimationFrame(cfLoop);
  // Stop spawning new confetti after 13s, let existing fall out
  setTimeout(()=>{
    cfOn=false;
    setTimeout(()=>{
      cancelAnimationFrame(cfId);
      cfC.classList.remove('on');
      cfCtx.clearRect(0,0,cfC.width,cfC.height);
    },5000);
  },13000);
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
function initReveal(){
  const els=document.querySelectorAll('.reveal');
  const obs=new IntersectionObserver(ents=>{
    ents.forEach((e,i)=>{ if(e.isIntersecting) setTimeout(()=>e.target.classList.add('vis'),i*100); });
  },{threshold:.12});
  els.forEach(r=>obs.observe(r));
}

/* =============================================
   NAV DOTS
   ============================================= */
function initNav(){
  const secs=['hero','gallery','video-section','letter'];
  const dots=document.querySelectorAll('.nav-dot');
  dots.forEach(d=>{ d.addEventListener('click',()=>document.getElementById(d.dataset.target).scrollIntoView({behavior:'smooth'})); });
  const obs=new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if(e.isIntersecting){ const i=secs.indexOf(e.target.id); dots.forEach((d,j)=>d.classList.toggle('active',i===j)); } });
  },{threshold:.5});
  secs.forEach(s=>{ const el=document.getElementById(s); if(el) obs.observe(el); });
}

/* =============================================
   LIGHTBOX
   ============================================= */
function openLb(card){
  const img=card.querySelector('img'); if(!img) return;
  document.getElementById('lbImg').src=img.src;
  document.getElementById('lightbox').classList.add('on');
}
document.getElementById('lbClose').addEventListener('click',()=>document.getElementById('lightbox').classList.remove('on'));
document.getElementById('lightbox').addEventListener('click',e=>{ if(e.target===document.getElementById('lightbox')) document.getElementById('lightbox').classList.remove('on'); });

/* =============================================
   🔧 DEV MODE — untuk testing fireworks
   Uncomment baris di bawah, buka website, 
   tunggu 3 detik → langsung trigger.
   Comment lagi sebelum upload ke GitHub!
   ============================================= */
// setTimeout(() => { if(!triggered){ triggered=true; launchBirthday(); } }, 3000);