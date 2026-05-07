import {MobileInput} from './engine/input.js';
import {FlightPhysics} from './engine/physics.js';
import {World} from './engine/world.js';
import {Renderer} from './engine/render.js';
import {biomeDifficulty} from './engine/logic_extra/procedural_brain_tables.js';
import {FORMS,applyForm,gainXP} from './engine/evolution.js';
import {GAME_CONFIG} from './engine/game_config.js';

const canvas=document.getElementById('game');
const input=new MobileInput();
const world=new World(2026,GAME_CONFIG);
const render=new Renderer(canvas,GAME_CONFIG);
const player={x:180,y:800,vx:0,vy:0,r:20,form:0,xp:0,gravity:640,groundAccel:8.5,airAccel:4.2,maxVX:260,flapImpulse:255,maxRise:520,maxFall:720,glideDrag:.972,flapDelay:.145,dashDelay:.85,dashImpulse:930,flapCooldown:0,dashCooldown:0,flapCost:6,maxStamina:70,stamina:70,staminaRegenGround:42,staminaRegenAir:10,grounded:false,coyote:0,facing:1,wingPhase:0,justFlapped:0};
applyForm(player);
player.health=GAME_CONFIG.survival.maxHealth;
player.water=GAME_CONFIG.survival.maxWater;

const ui={formName:document.getElementById('formName'),xp:document.getElementById('xp'),xpNeed:document.getElementById('xpNeed'),alt:document.getElementById('alt'),vy:document.getElementById('vy'),water:document.getElementById('waterVal'),health:document.getElementById('healthVal'),bossHud:document.getElementById('bossHud'),bossHp:document.getElementById('bossHp'),homeBtn:document.getElementById('homeBtn'),zoomBtn:document.getElementById('zoomBtn'),scytheBtn:document.getElementById('scytheBtn')};
const menu={start:document.getElementById('startMenu'),shop:document.getElementById('shopMenu'),play:document.getElementById('playBtn'),shopBtn:document.getElementById('shopBtn'),closeShop:document.getElementById('closeShop'),levelSelect:document.getElementById('levelSelect'),levelCost:document.getElementById('levelCost'),accountLevel:document.getElementById('accountLevel'),accountXp:document.getElementById('accountXp'),accountNeed:document.getElementById('accountNeed'),accountGems:document.getElementById('accountGems'),accountGold:document.getElementById('accountGold'),hudAccountLevel:document.getElementById('hudAccountLevel'),hudGems:document.getElementById('hudGems'),hudGold:document.getElementById('hudGold'),bonusCode:document.getElementById('bonusCode'),redeemCode:document.getElementById('redeemCode'),shopOffers:document.getElementById('shopOffers'),tabGems:document.getElementById('tabGems'),tabArcade:document.getElementById('tabArcade'),gemsShop:document.getElementById('gemsShop'),arcadeShop:document.getElementById('arcadeShop'),buyConsoleGold:document.getElementById('buyConsoleGold'),buyConsoleGems:document.getElementById('buyConsoleGems'),consoleStatus:document.getElementById('consoleStatus'),adminPanel:document.getElementById('adminPanel'),homeAvatarImg:document.getElementById('homeAvatarImg'),homeAvatarName:document.getElementById('homeAvatarName')};

const ACCOUNT_KEY='evoland2_account_v2';
function defaultAccount(){return {level:1,accountXP:0,gems:0,gold:0,goldXpCarry:0,bonusUsed:false,devConsole:false,devConsoleUntil:0,devConsoleBonusUsed:false};}
function loadAccount(){try{return {...defaultAccount(),...JSON.parse(localStorage.getItem(ACCOUNT_KEY)||'{}')};}catch(e){return defaultAccount();}}
let account=loadAccount();
const soundCache={};
function playSound(name){try{const src=GAME_CONFIG.sounds?.[name];if(!src)return;const a=soundCache[name]||(soundCache[name]=new Audio(src));a.currentTime=0;a.play().catch(()=>{});}catch(e){}}

function accountNeed(level=account.level){return GAME_CONFIG.account.baseAccountXP*GAME_CONFIG.account.levelMultiplier*level;}
function hasDevConsole(){return !!account.devConsole || ((account.devConsoleUntil||0)>Date.now());}
function saveAccount(){localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));refreshAccountUI();}
function addAccountXP(amount){account.accountXP+=amount;account.goldXpCarry+=amount;while(account.goldXpCarry>=GAME_CONFIG.account.xpBlock){account.goldXpCarry-=GAME_CONFIG.account.xpBlock;account.gold+=GAME_CONFIG.account.goldPerXPBlock;}while(account.level<GAME_CONFIG.account.maxLevel && account.accountXP>=accountNeed(account.level)){account.accountXP-=accountNeed(account.level);account.level++;}saveAccount();}
function awardXP(amount){const oldForm=player.form;const changed=gainXP(player,amount);addAccountXP(amount);if(changed||player.form!==oldForm)showLevelUp();}
function levelCost(level){return level<=account.level?0:level*5;}
function refreshAccountUI(){const need=account.level>=GAME_CONFIG.account.maxLevel?'MAX':accountNeed(account.level);const devActive=hasDevConsole();menu.accountLevel.textContent=account.level;menu.accountXp.textContent=Math.floor(account.accountXP);menu.accountNeed.textContent=need;menu.accountGems.textContent=account.gems;menu.accountGold.textContent=account.gold;menu.hudAccountLevel.textContent=account.level;menu.hudGems.textContent=account.gems;menu.hudGold.textContent=account.gold;if(menu.homeAvatarImg){const idx=Math.max(0,Math.min(FORMS.length-1,account.level-1));menu.homeAvatarImg.src=FORMS[idx].sprite;menu.homeAvatarName.textContent=`Livello ${idx+1} - ${FORMS[idx].name}`;}menu.consoleStatus.textContent=devActive?('Dev Console attiva'+((account.devConsoleUntil||0)>Date.now()?` fino a ${new Date(account.devConsoleUntil).toLocaleDateString()}`:'')):'Dev Console bloccata';menu.adminPanel.classList.toggle('hidden',!devActive);refreshLevelCost();}
function refreshLevelCost(){const level=Number(menu.levelSelect.value||1);const cost=levelCost(level);menu.levelCost.textContent=cost===0?'Gratis: livello account sufficiente':`Costo avvio: ${cost} gemme`;}
function buildLevelSelect(){menu.levelSelect.innerHTML='';FORMS.forEach((f,i)=>{const level=i+1;const opt=document.createElement('option');opt.value=level;opt.textContent=`Livello ${level} - ${f.name}`;menu.levelSelect.appendChild(opt);});menu.levelSelect.value='1';menu.levelSelect.addEventListener('change',refreshLevelCost);}
function buildShop(){const offers=[{gold:1000,gems:50},{gold:2000,gems:100},{gold:5000,gems:300},{gold:10000,gems:750},{gold:15000,gems:1000}];menu.shopOffers.innerHTML='';for(const o of offers){const row=document.createElement('div');row.className='offer';row.innerHTML=`<span>${o.gold} monete → <b>${o.gems}</b> gemme</span>`;const btn=document.createElement('button');btn.textContent='Compra';btn.onclick=()=>{if(account.gold<o.gold){alert('Monete insufficienti');return;}account.gold-=o.gold;account.gems+=o.gems;saveAccount();};row.appendChild(btn);menu.shopOffers.appendChild(row);}}
function setupMenu(){document.body.classList.add('menu-open');buildLevelSelect();buildShop();refreshAccountUI();menu.shopBtn.onclick=()=>menu.shop.classList.remove('hidden');menu.closeShop.onclick=()=>menu.shop.classList.add('hidden');menu.tabGems.onclick=()=>{menu.gemsShop.classList.remove('hidden');menu.arcadeShop.classList.add('hidden');};menu.tabArcade.onclick=()=>{menu.gemsShop.classList.add('hidden');menu.arcadeShop.classList.remove('hidden');};menu.redeemCode.onclick=()=>{const code=(menu.bonusCode.value||'').trim();if(code===GAME_CONFIG.account.devConsoleBonusCode){if(account.devConsoleBonusUsed){alert('Codice arcade già usato');return;}account.devConsoleUntil=Date.now()+(GAME_CONFIG.account.devConsoleBonusDays||3)*24*60*60*1000;account.devConsoleBonusUsed=true;saveAccount();alert('Dev Console attiva per 3 giorni');return;}if(code===GAME_CONFIG.account.freeGemsBonusCode && !account.bonusUsed){account.gems+=GAME_CONFIG.account.bonusCodeGems;account.bonusUsed=true;saveAccount();alert('+300 gemme ricevute');}else if(code===GAME_CONFIG.account.freeGemsBonusCode && account.bonusUsed){alert('Codice già usato');}else{alert('Codice non valido');}};menu.buyConsoleGold.onclick=()=>{if(hasDevConsole())return alert('Già sbloccata');if(account.gold<25000)return alert('Monete insufficienti');account.gold-=25000;account.devConsole=true;account.devConsoleUntil=0;saveAccount();};menu.buyConsoleGems.onclick=()=>{if(hasDevConsole())return alert('Già sbloccata');if(account.gems<1500)return alert('Gemme insufficienti');account.gems-=1500;account.devConsole=true;account.devConsoleUntil=0;saveAccount();};menu.play.onclick=startGame;ui.homeBtn.onclick=goHome;if(ui.zoomBtn){const zooms=[.75,1,1.25,1.5];let zi=1;ui.zoomBtn.onclick=()=>{zi=(zi+1)%zooms.length;render.setZoom(zooms[zi]);ui.zoomBtn.textContent='ZOOM '+zooms[zi]+'x';if(document.documentElement.requestFullscreen&&!document.fullscreenElement){document.documentElement.requestFullscreen().catch(()=>{});}};}}
function resetSurvival(){player.health=GAME_CONFIG.survival.maxHealth;player.water=GAME_CONFIG.survival.maxWater;player.lastDamageTime=-999;player.bossTouchCooldown=0;player.poisonTimer=0;fireCooldown=0;fireWaves.length=0;boostFartTimer=0;}
function startGame(){if(frameId){cancelAnimationFrame(frameId);frameId=0;}const level=Number(menu.levelSelect.value||1);const cost=levelCost(level);if(cost>0){if(account.gems<cost){alert('Gemme insufficienti per questo livello');return;}account.gems-=cost;saveAccount();}player.form=Math.max(0,Math.min(FORMS.length-1,level-1));player.x=180;player.y=800;player.vx=0;player.vy=0;player.xp=0;applyForm(player);resetSurvival();world.secondary=false;world.collisions=GAME_CONFIG.map.collisions||[];world.minX=GAME_CONFIG.map.minX;world.maxX=GAME_CONFIG.map.maxX;world.spawn();menu.start.classList.add('hidden');menu.shop.classList.add('hidden');ui.homeBtn.classList.remove('hidden');document.body.classList.remove('menu-open');running=true;last=performance.now();frameId=requestAnimationFrame(loop);}
function goHome(){running=false;if(frameId){cancelAnimationFrame(frameId);frameId=0;}if(ui.scytheBtn)ui.scytheBtn.classList.add('hidden');ui.homeBtn.classList.add('hidden');document.body.classList.add('menu-open');menu.start.classList.remove('hidden');menu.shop.classList.add('hidden');render.draw(world,player,{fireWaves,scytheActive:false,griffinScratchTimer:0,boostFartTimer:0});}
function dieAndRestart(){alert('Sei morto: devi ricominciare da capo.');goHome();}

const physics=new FlightPhysics(player);
let last=performance.now();
let running=false;
let frameId=0;
let fireCooldown=0;
let scytheActive=false;
let griffinDiveTimer=0;
let griffinDiveCooldown=0;
let griffinScratchTimer=0;
let boostFartTimer=0;
let wasPoisoned=false;
const fireWaves=[];


function playerHitRadius(){return Math.max(player.r,Math.max(54,player.r*3.4)*0.42);}
function enemyHitRadius(e){return e.boss?e.r*2.15:e.r*1.35;}
function enemyTouchNeed(e){return (e.level||0)>=5?3:2;}
function canCountEnemyTouch(e){const now=performance.now()/1000;if((e.nextPlayerTouch||0)>now)return false;e.nextPlayerTouch=now+0.45;return true;}

function eatNearby(){
 for(const f of world.food){
  if(f.eaten)continue;
  const d=Math.hypot(player.x-f.x,player.y-f.y);
  if(d<player.r+f.r+32){world.consumeFood(f,GAME_CONFIG.food.respawnSeconds);awardXP(f.xp);}
 }
}
function applyDamage(amount){player.health=Math.max(0,player.health-amount);player.lastDamageTime=performance.now()/1000;if(player.health<=0)dieAndRestart();}
function hazards(dt){if((player.poisonTimer||0)>0){player.poisonTimer=Math.max(0,player.poisonTimer-dt);applyDamage(GAME_CONFIG.survival.maxHealth*.05*dt);}const zonePressure=biomeDifficulty(player.x,player.y,player.form);player.bossTouchCooldown=Math.max(0,(player.bossTouchCooldown||0)-dt);for(const e of world.enemies){if(e.dead)continue;const d=Math.hypot(player.x-e.x,player.y-e.y);if(e.boss){if(d<player.r+e.r*.72 && player.bossTouchCooldown<=0){player.bossTouchCooldown=1.1;applyDamage(GAME_CONFIG.survival.maxHealth/10);player.vx-=Math.sign(e.x-player.x)*260;player.vy-=220;}continue;}if(d<playerHitRadius()+enemyHitRadius(e)*.72 && e.level>player.form+1){e.attackAnim=0.28;player.vx-=Math.sign(e.x-player.x)*180;player.vy-=180;player.x-=Math.sign(e.x-player.x)*30;player.xp=Math.max(0,player.xp-(4+Math.min(6,zonePressure*.25)));applyDamage((e.damage||10)*dt);}}}

function updateWater(dt){
 let refilling=false;
 for(const p of world.ponds||[]){if(Math.abs(player.x-p.x)<p.w*.55 && Math.abs(player.y-p.y)<p.h+90){refilling=true;break;}}
 const inSpace=GAME_CONFIG.map.space&&player.y<GAME_CONFIG.map.space.y+520;if(refilling)player.water=Math.min(GAME_CONFIG.survival.maxWater,player.water+GAME_CONFIG.survival.refillPerSecond*dt);else player.water=Math.max(0,player.water-GAME_CONFIG.survival.drainPerSecond*dt*(inSpace?(GAME_CONFIG.map.space.oxygenDrainMultiplier||2):1));
 if(player.water<=0){applyDamage(GAME_CONFIG.survival.damagePerSecondWhenEmpty*dt);}
 const since=(performance.now()/1000)-(player.lastDamageTime??-999);
 if(since>GAME_CONFIG.survival.healthRegenDelay){player.health=Math.min(GAME_CONFIG.survival.maxHealth,player.health+(GAME_CONFIG.survival.healthRegenPerSecond||5)*dt);}
}
function tryBlackHole(){
 if(world.secondary)return;
 for(const b of world.blackHoles||[]){const d=Math.hypot(player.x-b.x,player.y-b.y);if(d<b.r+player.r){if(player.form>=FORMS.length-4){world.enterBossMap(player);}else{player.vx=-260;player.vy=-180;alert('Il buco nero si apre solo agli ultimi 4 livelli.');}}}
}
function handlePowers(inp,dt){
 if(inp.dashPressed){boostFartTimer=.28;playSound('boost');}
 boostFartTimer=Math.max(0,boostFartTimer-dt);
 griffinDiveCooldown=Math.max(0,griffinDiveCooldown-dt);
 griffinScratchTimer=Math.max(0,griffinScratchTimer-dt);
 const isGriffin=player.form===GAME_CONFIG.powers.griffinDiveForm;
 if(isGriffin && inp.griffinDivePressed && griffinDiveCooldown<=0){
  griffinDiveTimer=GAME_CONFIG.powers.griffinDiveDuration||.5;playSound('griffin');
  griffinDiveCooldown=5;
  player.vx=(player.facing||1)*player.maxVX*(GAME_CONFIG.powers.griffinDiveSpeedMultiplier||1.5);
  player.vy=Math.max(player.vy,player.maxFall*.72);
 }
 if(griffinDiveTimer>0){
  griffinDiveTimer=Math.max(0,griffinDiveTimer-dt);
  player.vx=(player.facing||1)*player.maxVX*(GAME_CONFIG.powers.griffinDiveSpeedMultiplier||1.5);
  player.vy=Math.max(player.vy,player.maxFall*.58);
  if(griffinDiveTimer<=0){
   griffinScratchTimer=.35;
   const sx=player.x+(player.facing||1)*120,sy=player.y+20;
   for(const e of world.enemies){if(e.dead)continue;const d=Math.hypot(e.x-sx,e.y-sy);if(d<170+e.r)world.damageEnemy(e,GAME_CONFIG.powers.griffinScratchDamage||190,'griffin');}
  }
 }
 scytheActive=inp.scytheHeld && GAME_CONFIG.powers.scytheForms.includes(player.form);if(scytheActive)playSound('scythe');
 if(scytheActive){
  const range=GAME_CONFIG.powers.scytheRange;const sx=player.x+(player.facing||1)*range*.65;const sy=player.y-20;
  let mul=1;if(player.form===FORMS.length-2)mul=2;if(player.form===FORMS.length-1)mul=4;
  for(const e of world.enemies){if(e.dead)continue;const d=Math.hypot(e.x-sx,e.y-sy);if(d<range+e.r)world.damageEnemy(e,GAME_CONFIG.powers.scytheDamagePerSecond*mul*dt,'scythe');}
 }
 fireCooldown=Math.max(0,fireCooldown-dt);
 if(inp.firePressed && player.form===GAME_CONFIG.powers.phoenixForm && fireCooldown<=0){
  fireCooldown=GAME_CONFIG.powers.fireCooldown;playSound('fire');
  const x=player.x+(player.facing||1)*120,y=player.y;
  fireWaves.push({x,y,t:GAME_CONFIG.powers.fireDuration*.55,life:GAME_CONFIG.powers.fireDuration*.55});
  world.igniteEnemies(x,y,GAME_CONFIG.powers.fireRadius,GAME_CONFIG.powers.fireDuration);
 }
 for(let i=fireWaves.length-1;i>=0;i--){fireWaves[i].t-=dt;if(fireWaves[i].t<=0)fireWaves.splice(i,1);}
}

function showLevelUp(){
 playSound('levelUp');
 const el=document.createElement('div');
 el.className='levelUpToast';
 el.textContent='★ LVL UP ★';
 document.body.appendChild(el);
 setTimeout(()=>el.remove(),1300);
}

function updateHud(){ui.formName.textContent=player.name;ui.xp.textContent=Math.floor(player.xp);ui.xpNeed.textContent=FORMS[player.form]?.need??'MAX';ui.alt.textContent=Math.max(0,Math.floor((world.groundAt(player.x).y-player.y)/10));ui.vy.textContent=Math.round(player.vy);ui.water.textContent=Math.max(0,Math.round(player.water));ui.health.textContent=Math.max(0,Math.round(player.health));const boss=world.boss;if(boss&&!boss.dead){ui.bossHud.classList.remove('hidden');ui.bossHp.textContent=Math.max(0,Math.round(100*boss.hp/boss.maxHp));}else ui.bossHud.classList.add('hidden');}
function setupAdminPanel(){menu.adminPanel.querySelectorAll('button').forEach(btn=>{btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!hasDevConsole())return;awardXP(Number(btn.dataset.xp||0));updateHud();},{passive:false});});}
function loop(now){if(!running)return;let dt=(now-last)/1000;last=now;dt=Math.min(dt,.05);const inp=input.consume();physics.step(inp,world,dt);handlePowers(inp,dt);eatNearby();hazards(dt);updateWater(dt);tryBlackHole();world.update(dt,player);if(world.secondary&&world.boss&&world.boss.dead){world.exitBossMap(player);alert('Boss finale sconfitto: ritorno alla mappa iniziale.');}if((player.poisonTimer||0)>0&&!wasPoisoned){playSound('poison');wasPoisoned=true;}if((player.poisonTimer||0)<=0)wasPoisoned=false;if(player.health<=0){dieAndRestart();return;}if(ui.scytheBtn)ui.scytheBtn.classList.toggle('hidden',!GAME_CONFIG.powers.scytheForms.includes(player.form));render.draw(world,player,{fireWaves,scytheActive,griffinScratchTimer,boostFartTimer});updateHud();frameId=requestAnimationFrame(loop);}

setupMenu();
setupAdminPanel();
updateHud();
render.draw(world,player,{fireWaves,scytheActive:false,griffinScratchTimer:0,boostFartTimer:0});
