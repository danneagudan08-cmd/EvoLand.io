import {GAME_CONFIG} from './game_config.js';

export class World{
 constructor(seed=1337,config=GAME_CONFIG){
  this.seed=seed;this.config=config;this.minX=config.map.minX;this.maxX=config.map.maxX;this.minY=config.map.minY;this.maxY=config.map.maxY;
  this.food=[];this.enemies=[];this.homes=[];this.trees=[];this.ponds=[];this.blackHoles=[];this.projectiles=[];this.collisions=config.map.collisions||[];
  this.secondary=false;this.boss=null;this.spawn();
 }
 noise(x){return Math.sin(x*.0017+this.seed)*180+Math.sin(x*.0061)*75+Math.sin(x*.00037)*420;}
 proceduralGroundAt(x){
  if(this.secondary){return {y:1280+Math.sin(x*.0021+this.seed)*120+Math.sin(x*.009)*55,type:'voidgrass'};}
  return {y:1380+Math.sin(x*.0012+this.seed)*110+Math.sin(x*.0035)*52+Math.sin(x*.00022)*180,type:'soft_hill'};
 }
 groundAt(x){
  let g=this.proceduralGroundAt(x);
  if(!this.secondary){
   // Pozze scavate: dentro la larghezza della pozza il pavimento scende, creando un ingresso reale nell'acqua.
   for(const p of this.ponds||[]){
    if(Math.abs(x-p.x)<p.w*.5){
     const base=this.proceduralGroundAt(x).y;
     g={y:base+(p.depth||48),type:'water_cut',pond:p};
    }
   }
   for(const c of this.collisions){if(x>=c.x && x<=c.x+c.w && c.y<g.y)g={y:c.y,type:c.type||'platform',collision:c};}
  }
  return g;
 }
 spawn(){
  this.food=[];this.enemies=[];this.homes=[];this.trees=[];this.ponds=[];this.blackHoles=[];this.projectiles=[];this.boss=null;
  this.spawnMapObjects();
  this.spawnTreeFood();
  this.spawnEnemies();
 }
 spawnMapObjects(){
  const tc=this.config.map.trees;
  if(tc){for(let i=0;i<tc.count;i++){const x=tc.startX+i*tc.stepX+Math.sin(i*7.13+this.seed)*85;const g=this.proceduralGroundAt(x);this.trees.push({x,bottomY:g.y+42,w:tc.w,h:tc.h,sprite:tc.sprite,slots:tc.foodSlots||[]});}}
  const hc=this.config.map.houses;
  if(hc){for(let i=0;i<hc.count;i++){const x=hc.startX+i*hc.stepX+Math.sin(i*3.7)*120;const g=this.proceduralGroundAt(x);this.homes.push({x,bottomY:g.y+38,w:hc.w,h:hc.h,sprite:hc.sprite,owner:null});}}
  for(const p of this.config.map.ponds||[]){const g=this.proceduralGroundAt(p.x);this.ponds.push({...p,y:g.y+(p.depth||48)-10,groundY:g.y,sprite:this.config.map.waterSprite});}
  for(const b of this.config.map.blackHoles||[]){const g=this.groundAt(b.x);this.blackHoles.push({...b,y:g.y-(b.yOffset||300),sprite:this.config.map.blackHoleSprite});}
 }
 spawnTreeFood(){
  const foods=this.config.food.treeFoods||[]; if(!foods.length)return;
  let n=0;
  for(const t of this.trees){
   for(const slot of t.slots){
    const def=foods[n%foods.length];
    const safeDx=Math.max(-t.w*.34,Math.min(t.w*.34,slot.dx));
    const safeDy=Math.max(-t.h*.72,Math.min(-t.h*.38,slot.dy));
    const x=t.x+safeDx; const y=t.bottomY+safeDy;
    this.food.push({x,y,homeX:x,homeY:y,r:def.r??10,xp:def.xp??4,kind:def.kind??0,eaten:false,respawn:0,respawnMax:0,sprite:def.sprite,group:def.name,tree:true});
    n++;
   }
  }
 }
 spawnEnemies(){
  let idx=0;
  for(const group of this.config.enemies.groups||[]){
   for(let i=0;i<group.count;i++){
    const x=group.startX+i*group.stepX+Math.sin((i+idx)*.77)*160;
    const g=this.groundAt(x);
    const y=group.fly?g.y-(group.yOffset??520)-Math.abs(Math.sin(i*1.3))*260:g.y-(group.r??24)+22;
    this.enemies.push({x,y,spawnX:x,spawnY:y,vx:Math.sin(i+idx)*60,vy:0,r:group.r??24,level:group.level??1,baseHp:group.hp??25,hp:(group.hp??25)*3,maxHp:(group.hp??25)*3,fly:!!group.fly,slowFly:!!group.slowFly,screenChase:!!group.screenChase,poisonShooter:!!group.poisonShooter,poisonCooldown:group.poisonCooldown||0,poisonTimer:1+Math.random()*2,space:!!group.space,killForm:group.killForm,xpBonus:group.xpBonus||0,sprite:group.sprite,group:group.name,dead:false,respawn:0,burning:0,playerHits:0,nextPlayerTouch:0,attackAnim:0});
   }
   idx+=51;
  }
 }
 consumeFood(food,delay=this.config.food.respawnSeconds??20){if(food.eaten)return;food.eaten=true;food.respawn=delay;food.respawnMax=delay;}
 respawnFood(food){food.eaten=false;food.respawn=0;food.x=food.homeX;food.y=food.homeY;}
 killEnemy(enemy,delay=this.config.enemies.respawnSeconds??35){if(enemy.dead)return;enemy.dead=true;enemy.respawn=delay;}
 respawnEnemy(enemy){enemy.dead=false;enemy.respawn=0;enemy.hp=enemy.maxHp||((enemy.baseHp||enemy.hp||30)*3);enemy.burning=0;enemy.playerHits=0;enemy.nextPlayerTouch=0;enemy.attackAnim=0;enemy.poisonTimer=1+Math.random()*2;enemy.x=enemy.spawnX;enemy.y=enemy.spawnY;enemy.vx=0;enemy.vy=0;}
 enterBossMap(player){
  if(this.secondary)return true;
  this.secondary=true;this.minX=this.config.map.secondary.minX;this.maxX=this.config.map.secondary.maxX;
  this.food=[];this.enemies=[];this.homes=[];this.trees=[];this.ponds=[];this.blackHoles=[];this.projectiles=[];this.collisions=[];
  const sc=this.config.map.secondary;
  player.x=sc.spawnX;player.y=sc.spawnY;player.vx=0;player.vy=0;
  const bd=this.config.enemies.boss;
  this.boss={x:sc.bossX,y:sc.bossY,spawnX:sc.bossX,spawnY:sc.bossY,vx:-50,vy:0,r:bd.r,level:bd.level,baseHp:bd.hp,hp:bd.hp*3,maxHp:bd.hp*3,damage:bd.damage,fireTimer:bd.fireballCooldown||10,sprite:bd.sprite,dead:false,burning:0,name:bd.name,boss:true,attackAnim:0};
  this.enemies=[this.boss];
  return true;
 }
 exitBossMap(player){this.secondary=false;this.minX=this.config.map.minX;this.maxX=this.config.map.maxX;this.collisions=this.config.map.collisions||[];this.spawn();player.x=180;player.y=800;player.vx=0;player.vy=0;}
 damageEnemy(e,damage,source='normal'){if(!e||e.dead)return false;const special=['scythe','fire','griffin'].includes(source);if(!special)return false;if(e.boss && source!=='scythe')return false;e.hp-=damage;if(e.hp<=0){this.killEnemy(e,e.boss?999999:(this.config.enemies.respawnSeconds??35));return true;}return false;}
 igniteEnemies(cx,cy,radius,duration){for(const e of this.enemies){if(e.dead)continue;const d=Math.hypot(e.x-cx,e.y-cy);if(d<radius+e.r)e.burning=Math.max(e.burning||0,duration);}}

 spawnBossFireballs(boss,player){
  const cfg=this.config.enemies.boss||{};
  const base=Math.atan2(player.y-boss.y,player.x-boss.x);
  const spreads=[0,-0.22,0.22,-0.42,0.42];
  for(const a of spreads){
   const ang=base+a; const sp=cfg.fireballSpeed||520;
   this.projectiles.push({x:boss.x,y:boss.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r:cfg.fireballRadius||18,damage:cfg.fireballDamage||18,sprite:this.config.map.bossFireballSprite,life:5,from:'boss'});
  }
 }
 spawnPoison(enemy,player){
  const cfg=this.config.enemies||{};const ang=Math.atan2(player.y-enemy.y,player.x-enemy.x);const sp=360;
  this.projectiles.push({x:enemy.x,y:enemy.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r:14,damage:0,poison:true,sprite:this.config.map.poisonSprite,life:3.5,from:'poison'});
 }
 updateProjectiles(dt,player){
  for(let i=this.projectiles.length-1;i>=0;i--){
   const p=this.projectiles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.life<=0){this.projectiles.splice(i,1);continue;}
   if(Math.hypot(player.x-p.x,player.y-p.y)<player.r+p.r){
    if(p.poison){player.poisonTimer=Math.max(player.poisonTimer||0,3);}else{player.health=Math.max(0,(player.health||100)-p.damage);player.lastDamageTime=performance.now()/1000;}
    this.projectiles.splice(i,1);
   }
  }
 }
 update(dt,player){
  this.updateProjectiles(dt,player);
  for(const f of this.food){if(f.eaten){f.respawn-=dt;if(f.respawn<=0)this.respawnFood(f);}}
  for(const e of this.enemies){
   e.attackAnim=Math.max(0,(e.attackAnim||0)-dt);
   if(e.dead){if(!e.boss){e.respawn-=dt;if(e.respawn<=0)this.respawnEnemy(e);}continue;}
   if(e.burning){
    e.burning=Math.max(0,e.burning-dt);
    let inWater=false; for(const p of this.ponds){if(Math.abs(e.x-p.x)<p.w*.55 && Math.abs(e.y-p.y)<p.h)inWater=true;}
    if(inWater)e.burning=0; else this.damageEnemy(e,(this.config.powers.fireDamagePerSecond||30)*dt,'fire');
   }
   const dx=player.x-e.x,dy=player.y-e.y;const dist=Math.hypot(dx,dy)||1;if(dist<(player.r||20)+(e.r||20)*2.2)e.attackAnim=Math.max(e.attackAnim||0,.22);
   let speedMul=(e.fly||e.boss)?(this.config.enemies.flyingSpeedMultiplier||1):(this.config.enemies.groundSpeedMultiplier||1);
   const visual=this.config.enemies.visualChaseRadius||900;
   const onScreen=Math.abs(dx)<900&&Math.abs(dy)<540;
   if(e.slowFly)speedMul=.30;
   if(e.space)speedMul=.42;
   if(e.boss){
    e.fireTimer=(e.fireTimer??(this.config.enemies.boss.fireballCooldown||10))-dt;
    if(e.fireTimer<=0){e.fireTimer=this.config.enemies.boss.fireballCooldown||10;this.spawnBossFireballs(e,player);}
   }
   if(e.poisonShooter&&!e.dead&&onScreen&&dist<760){
    e.poisonTimer=(e.poisonTimer||1)-dt;
    if(e.poisonTimer<=0){e.poisonTimer=e.poisonCooldown||3.2;this.spawnPoison(e,player);e.attackAnim=.35;}
   }
   if(e.fly||e.boss){
    const chase=e.boss||((e.screenChase?onScreen:dist<visual) && (!e.space||player.y<(this.config.map.space?.y||-1450)+520));
    if(chase){e.vx+=(dx/dist)*(80+e.level*6)*speedMul*dt;e.vy+=(dy/dist)*(70+e.level*5)*speedMul*dt;}
    else{e.vx+=(-dx/dist)*(95+e.level*7)*speedMul*dt;e.vy+=(-dy/dist)*(55+e.level*4)*speedMul*dt;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.982;e.vy*=.982;
    if(e.space&&e.y>(this.config.map.space?.y||-1450)+260){e.y=(this.config.map.space?.y||-1450)+260;e.vy=-Math.abs(e.vy);}
   }else{
    if(dist<visual){e.vx+=Math.sign(dx)*(18+e.level*4)*speedMul*dt;}else{e.vx+=-Math.sign(dx||1)*(24+e.level*2)*speedMul*dt;}
    e.vy+=280*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.985;
    const g=this.groundAt(e.x);if(e.y+e.r>g.y+10){e.y=g.y-e.r+22;e.vy=-Math.abs(e.vy)*.18;}
   }
  }
 }
}
