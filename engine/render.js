import {FORMS} from './evolution.js';
import {GAME_CONFIG} from './game_config.js';
export class Renderer{
 constructor(canvas,config=GAME_CONFIG){
  this.c=canvas;this.config=config;this.ctx=canvas.getContext('2d',{alpha:false});this.dpr=1;
  this.formSprites=FORMS.map(f=>{const img=new Image();img.src=f.sprite;return img;});this.cache=new Map();
  this.bg=this.load(config.map.backgroundSprite);this.galaxy=this.load(config.map.galaxySprite);this.meadow=this.load(config.map.meadowSprite);this.city=this.load(config.map.citySprite);this.groundSprite=this.load(config.map.groundSprite);
  this.platformSprite=this.load(config.map.platformSprite);this.scx=0;this.zoom=1;this.mini=document.getElementById('miniMap');this.mctx=this.mini?this.mini.getContext('2d'):null;this.resize();addEventListener('resize',()=>this.resize());
 }
 load(src){if(!src)return null;if(this.cache.has(src))return this.cache.get(src);const img=new Image();img.src=src;this.cache.set(src,img);return img;}
 resize(){this.dpr=Math.min(2,devicePixelRatio||1);this.c.width=innerWidth*this.dpr;this.c.height=innerHeight*this.dpr;this.c.style.width=innerWidth+'px';this.c.style.height=innerHeight+'px';this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);if(this.mini){this.mini.width=138*this.dpr;this.mini.height=82*this.dpr;this.mctx.setTransform(this.dpr,0,0,this.dpr,0,0);}}
 setZoom(z){this.zoom=Math.max(.65,Math.min(1.65,z||1));}
 drawSprite(src,x,y,w,h,fallback){const img=this.load(src);if(img&&img.complete&&img.naturalWidth>0){this.ctx.drawImage(img,x,y,w,h);return true;}if(fallback)fallback();return false;}
 tile(img,x0,y0,w,h,scale=1){const ctx=this.ctx;if(!img||!img.complete||!img.naturalWidth)return false;const tw=img.width*scale,th=img.height*scale;for(let x=x0%tw-tw;x<w+tw;x+=tw){for(let y=y0%th-th;y<h+th;y+=th)ctx.drawImage(img,x,y,tw,th);}return true;}
 drawCover(img,w,h,parallaxX=0,parallaxY=0){const ctx=this.ctx;if(!img||!img.complete||!img.naturalWidth)return false;const iw=img.width,ih=img.height;const sc=Math.max(w/iw,h/ih);const dw=iw*sc,dh=ih*sc;const ox=(w-dw)/2+(parallaxX%Math.max(1,dw-w));const oy=(h-dh)/2+(parallaxY%Math.max(1,dh-h));ctx.drawImage(img,ox,oy,dw,dh);return true;}
 draw(world,p,effects={}){const ctx=this.ctx,screenW=innerWidth,screenH=innerHeight,zoom=this.zoom||1;ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,screenW,screenH);ctx.fillStyle='#5aa8e8';ctx.fillRect(0,0,screenW,screenH);ctx.save();ctx.scale(zoom,zoom);const w=screenW/zoom,h=screenH/zoom;const camX=Math.round(p.x-w*.50),camY=Math.round(p.y-h*.52);
  if(!this.drawCover(this.bg,w,h,-camX*.015,-camY*.01)){const grd=ctx.createLinearGradient(0,0,0,h);grd.addColorStop(0,'#5aa8e8');grd.addColorStop(.6,'#96d5ff');grd.addColorStop(1,'#d5f0ff');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);}
  // Spazio galattico: visibile solo sopra le nuvole/parte alta del cielo, mai al posto del cielo basso.
  if(this.galaxy&&this.galaxy.complete&&this.galaxy.naturalWidth>0){
    const cloudLine=(this.config.map.space?.y||-1450)-camY;
    const visibleH=Math.max(0,Math.min(h,cloudLine));
    if(visibleH>0){
      ctx.save();
      ctx.beginPath();
      ctx.rect(0,0,w,visibleH);
      ctx.clip();
      this.drawCover(this.galaxy,w,h+260,-camX*.008,-camY*.006);
      ctx.restore();
    }
  }


  // città dietro la mappa/collisioni
  if(this.city&&this.city.complete&&this.city.naturalWidth>0){const cw=this.city.width,ch=this.city.height;for(let x=(-camX*.13)%(cw*1.2)-cw*1.2;x<w+cw;x+=cw*1.2){ctx.drawImage(this.city,x,h-260-camY*.03,cw*1.2,ch*1.2);}}
  // nuvole: usa solo lo sprite di cielo, niente duplicazione artificiale a ogni frame
  // terreno ricco
  ctx.beginPath();ctx.moveTo(0,h+80);for(let sx=-40;sx<=w+60;sx+=12){const wx=camX+sx;const g=world.proceduralGroundAt?world.proceduralGroundAt(wx):world.groundAt(wx);ctx.lineTo(sx,g.y-camY);}ctx.lineTo(w+80,h+80);ctx.closePath();ctx.save();ctx.clip();ctx.fillStyle='#2f7b42';ctx.fillRect(0,0,w,h);if(!this.tile(this.meadow||this.groundSprite,Math.round(-camX*.28),Math.round(-camY),w,h,0.55)){ctx.fillStyle='#2f7b42';ctx.fillRect(0,0,w,h);}ctx.restore();
  ctx.strokeStyle='#8be06d';ctx.lineWidth=3;ctx.beginPath();for(let sx=-20;sx<=w+40;sx+=24){const wx=camX+sx,g=world.proceduralGroundAt?world.proceduralGroundAt(wx):world.groundAt(wx);if(sx===-20)ctx.moveTo(sx,g.y-camY);else ctx.lineTo(sx,g.y-camY);}ctx.stroke();
  // collisioni piattaforme
  for(const c of world.collisions||[]){const x=c.x-camX,y=c.y-camY;if(x+c.w<-80||x>w+80||y+c.h<-80||y>h+80)continue;this.drawSprite(this.config.map.platformSprite,x,y,c.w,c.h,()=>{ctx.fillStyle='#7b4a24';ctx.fillRect(x,y,c.w,c.h);});}
  // pozze acqua
  for(const pond of world.ponds||[]){const x=pond.x-camX,y=pond.y-camY;if(x+pond.w<-160||x>w+160)continue;this.drawSprite(pond.sprite,x-pond.w/2,y-pond.h,pond.w,pond.h,()=>{ctx.fillStyle='#1f9fe8cc';ctx.beginPath();ctx.ellipse(x,y,pond.w/2,pond.h/2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.ellipse(x-pond.w*.1,y-pond.h*.18,pond.w*.28,pond.h*.10,0,0,Math.PI*2);ctx.fill();});}
  // case appiccicate al terreno
  for(const home of world.homes||[]){const x=Math.round(home.x-camX),y=Math.round((home.bottomY||(world.groundAt?world.groundAt(home.x).y:0))+36-camY);if(x<-300||x>w+300)continue;this.drawSprite(home.sprite,Math.round(x-home.w/2),Math.round(y-home.h),home.w,home.h,()=>{ctx.fillStyle='#6b3d1e';ctx.fillRect(x-home.w/2,y-home.h,home.w,home.h);ctx.fillStyle='#9d2f26';ctx.beginPath();ctx.moveTo(x-home.w/2-20,y-home.h);ctx.lineTo(x,y-home.h-82);ctx.lineTo(x+home.w/2+20,y-home.h);ctx.fill();});}
  // alberi appoggiati al terreno
  for(const t of world.trees||[]){const x=Math.round(t.x-camX),y=Math.round((t.bottomY||(world.groundAt?world.groundAt(t.x).y:0))+38-camY);if(x+t.w<-280||x-t.w>w+280)continue;this.drawSprite(t.sprite,Math.round(x-t.w/2),Math.round(y-t.h),t.w,t.h,()=>{ctx.fillStyle='#7a4a22';ctx.fillRect(x-18,y-t.h*.65,36,t.h*.65);ctx.fillStyle='#237a35';ctx.beginPath();ctx.arc(x,y-t.h*.72,t.w*.42,0,Math.PI*2);ctx.fill();});}
  // buco nero
  for(const b of world.blackHoles||[]){const x=b.x-camX,y=b.y-camY;if(x<-220||x>w+220)continue;this.drawSprite(b.sprite,x-b.r,y-b.r,b.r*2,b.r*2,()=>{ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x,y,b.r*.55,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b661ff';ctx.lineWidth=8;ctx.stroke();});}
  // cibo solo sugli alberi
  for(const f of world.food){if(f.eaten)continue;const x=f.x-camX,y=f.y-camY;if(x<-60||x>w+60||y<-60||y>h+60)continue;const s=f.r*3.2;this.drawSprite(f.sprite,x-s/2,y-s/2,s,s,()=>{ctx.fillStyle=['#d83254','#ffd45a','#6affef','#ff7ad9'][f.kind%4];ctx.beginPath();ctx.arc(x,y,f.r,0,Math.PI*2);ctx.fill();});}
  // nemici terra/volo/boss
  for(const e of world.enemies){if(e.dead)continue;const x=e.x-camX,y=e.y-camY;if(x<-220||x>w+220||y<-220||y>h+220)continue;const s=e.boss?e.r*5.4:e.r*3.2;ctx.save();ctx.translate(x,y);if(e.attackAnim>0){const a=e.attackAnim;ctx.rotate(Math.sin(performance.now()/55)*0.10*a*5);ctx.scale(1+a*.18,1-a*.06);}this.drawSprite(e.sprite,-s/2,-s/2,s,s,()=>{ctx.fillStyle=e.fly?'#8b1b77':'#8b1b35';ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();});ctx.restore();
    if(e.maxHp&&e.hp<e.maxHp){ctx.fillStyle='#000a';ctx.fillRect(x-34,y-s/2-14,68,7);ctx.fillStyle=e.burning?'#ff5a1f':'#ff4747';ctx.fillRect(x-34,y-s/2-14,68*Math.max(0,e.hp/e.maxHp),7);} if(e.burning){ctx.globalAlpha=.55;ctx.fillStyle='#ff6a00';ctx.beginPath();ctx.arc(x,y,e.r*1.6,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}
  // palle di fuoco boss / veleno: PNG modificabili in assets/effects
  for(const pr of world.projectiles||[]){const x=pr.x-camX,y=pr.y-camY;if(x<-80||x>w+80||y<-80||y>h+80)continue;ctx.save();ctx.globalAlpha=.95;const spr=pr.sprite||(pr.poison?this.config.map.poisonSprite:this.config.map.bossFireballSprite);if(!this.drawSprite(spr,x-pr.r*2.2,y-pr.r*2.2,pr.r*4.4,pr.r*4.4,()=>{const grad=ctx.createRadialGradient(x,y,2,x,y,pr.r*2.4);if(pr.poison){grad.addColorStop(0,'#dfff8a');grad.addColorStop(.35,'#7dff50');grad.addColorStop(1,'rgba(10,120,0,0)');}else{grad.addColorStop(0,'#fff7b0');grad.addColorStop(.35,'#ff7a18');grad.addColorStop(1,'rgba(180,0,0,0)');}ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,pr.r*2.4,0,Math.PI*2);ctx.fill();})){ }ctx.restore();}
  // effetti fuoco
  for(const fw of effects.fireWaves||[]){const x=fw.x-camX,y=fw.y-camY;const prog=1-fw.t/fw.life;const r=this.config.powers.fireRadius*prog;ctx.globalAlpha=Math.max(0,fw.t/fw.life);this.drawSprite(this.config.map.fireWaveSprite,x-r,y-r,r*2,r*2,()=>{ctx.strokeStyle='#ff6a00';ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;}
  this.drawPlayer(p,p.x-camX,p.y-camY,effects);
  ctx.restore();
  this.drawMiniMap(world,p);
 }
 drawMiniMap(world,p){const ctx=this.mctx;if(!ctx||!this.mini)return;const w=138,h=82;ctx.clearRect(0,0,w,h);const grd=ctx.createLinearGradient(0,0,0,h);grd.addColorStop(0,'#16264a');grd.addColorStop(.45,'#3b8fd8');grd.addColorStop(1,'#173a1f');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);ctx.strokeStyle='#ffffff99';ctx.lineWidth=2;ctx.strokeRect(1,1,w-2,h-2);const min=world.minX||0,max=world.maxX||1,range=Math.max(1,max-min);const top=world.config?.map?.space?.ceilingY||world.minY||-4300;const bottom=world.maxY||2600;function mx(x){return Math.max(2,Math.min(w-2,(x-min)/range*w));}function my(y){return Math.max(2,Math.min(h-2,(y-top)/(bottom-top)*h));}ctx.globalAlpha=.24;ctx.fillStyle='#ffffff';for(let gx=0;gx<6;gx++)ctx.fillRect(gx*w/6,0,1,h);for(let gy=0;gy<4;gy++)ctx.fillRect(0,gy*h/4,w,1);ctx.globalAlpha=1;ctx.strokeStyle='#6ee07c';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<w;i++){const wx=min+(i/w)*range;const yy=my(world.groundAt(wx).y);if(i===0)ctx.moveTo(i,yy);else ctx.lineTo(i,yy);}ctx.stroke();ctx.fillStyle='#7ed6ff';for(const pond of world.ponds||[]){ctx.fillRect(mx(pond.x)-2,my(pond.y)-1,5,2);}ctx.fillStyle='#32ff5f';for(const f of world.food||[]){if(!f.eaten)ctx.fillRect(mx(f.x),my(f.y),1.5,1.5);}ctx.fillStyle='#ff4a4a';for(const e of world.enemies||[]){if(!e.dead){ctx.beginPath();ctx.arc(mx(e.x),my(e.y),e.boss?3:2,0,Math.PI*2);ctx.fill();}}ctx.fillStyle='#111';ctx.fillRect(mx(p.x)-.5,0,1,h);ctx.fillRect(0,my(p.y)-.5,w,1);ctx.fillStyle='#47a6ff';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx(p.x),my(p.y),4,0,Math.PI*2);ctx.fill();ctx.stroke();}
 drawPlayer(p,x,y,effects={}){const ctx=this.ctx;ctx.save();ctx.translate(x,y);ctx.scale(p.facing||1,1);const flapT=Math.max(0,Math.min(1,p.justFlapped||0));if(flapT>0){ctx.rotate(-0.22*flapT);ctx.translate(0,-Math.sin((1-flapT)*Math.PI*6)*5);}const img=this.formSprites[p.form];const size=Math.max(54,p.r*3.4);if(img&&img.complete&&img.naturalWidth>0){ctx.drawImage(img,-size/2,-size/2,size,size);if(flapT>0){ctx.save();ctx.globalAlpha=.28*flapT;ctx.scale(1.08,0.82+Math.sin(performance.now()/55)*.08);ctx.drawImage(img,-size/2,-size/2,size,size);ctx.restore();}}else{const flap=Math.sin(p.wingPhase)*(.55+p.justFlapped*3);ctx.fillStyle=['#f4f4f4','#8dff8d','#71bdff','#d683ff','#ffdf5a'][p.form%5];ctx.beginPath();ctx.ellipse(0,0,p.r*1.15,p.r*.86,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff9';ctx.beginPath();ctx.ellipse(-p.r*.45,-4,p.r*.9,p.r*.28-flap*5,-.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(p.r*.25,-4,p.r*.78,p.r*.24+flap*5,.45,0,Math.PI*2);ctx.fill();}
  if(effects.boostFartTimer>0){ctx.save();ctx.globalAlpha=Math.min(1,effects.boostFartTimer*5);ctx.translate(-size*.70, size*.10);this.drawSprite(this.config.map.boostFartSprite,-42,-42,84,84,()=>{});ctx.restore();}if(effects.griffinScratchTimer>0){ctx.save();ctx.globalAlpha=Math.min(1,effects.griffinScratchTimer*6);this.drawSprite(this.config.map.griffinScratchSprite,size*.05,-size*.35,size*1.05,size*.75,()=>{ctx.strokeStyle='#fff6b5';ctx.lineWidth=5;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(size*.15,-size*.15+i*14);ctx.lineTo(size*.95,size*.05+i*14);ctx.stroke();}});ctx.restore();}if(effects.scytheActive){const ang=-Math.PI/2+Math.sin(performance.now()/80)*1.25;ctx.save();ctx.translate(size*.25,-size*.18);ctx.rotate(ang);const scythes=this.config.map.scytheSprites||[];const idx=Math.max(0,Math.min(3,(p.form||0)-(this.config.powers.scytheForms?.[0]||20)));this.drawSprite(scythes[idx]||this.config.map.scytheSprite,-12,-118,140,140,()=>{});ctx.restore();}
  ctx.restore();}
}
