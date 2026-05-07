export class MobileInput{
 constructor(){this.x=0;this.y=0;this.holdFlap=false;this.flapPressed=false;this.dashPressed=false;this.eatPressed=false;this.firePressed=false;this.griffinDivePressed=false;this.scytheHeld=false;this.leftHeld=false;this.rightHeld=false;this.mouseActive=false;this.mouseX=0;this.mouseLeftHeld=false;this._setup();}
 consume(){
  // Il movimento orizzontale dipende SOLO dai tasti sinistra/destra o tastiera.
  // Il mouse resta valido solo per FLAP con tasto sinistro e FALCE con tasto destro: così il player non parte da solo.
  const digitalX=(this.rightHeld?1:0)-(this.leftHeld?1:0);
  this.x=digitalX;
  const out={x:this.x,y:this.y,holdFlap:this.holdFlap||this.mouseLeftHeld,flapPressed:this.flapPressed,dashPressed:this.dashPressed,eatPressed:this.eatPressed,firePressed:this.firePressed,griffinDivePressed:this.griffinDivePressed,scytheHeld:this.scytheHeld};
  this.flapPressed=false;this.dashPressed=false;this.eatPressed=false;this.firePressed=false;this.griffinDivePressed=false;return out;
 }
 _bindHold(btn,onDown,onUp){if(!btn)return;const down=e=>{e.preventDefault();onDown();};const up=e=>{e.preventDefault();onUp();};btn.addEventListener('touchstart',down,{passive:false});btn.addEventListener('touchend',up,{passive:false});btn.addEventListener('touchcancel',up,{passive:false});btn.addEventListener('mousedown',down);window.addEventListener('mouseup',up);}
 _isUiTarget(target){return !!(target&&target.closest&&target.closest('button,input,select,textarea,.start-menu,.shop-menu,.menu-panel,.admin-panel'))}
 _setup(){
  this._bindHold(document.getElementById('leftBtn'),()=>{this.leftHeld=true;},()=>{this.leftHeld=false;});
  this._bindHold(document.getElementById('rightBtn'),()=>{this.rightHeld=true;},()=>{this.rightHeld=false;});
  const flap=document.getElementById('flapBtn');
  this._bindHold(flap,()=>{this.holdFlap=true;this.flapPressed=true;},()=>{this.holdFlap=false;});
  const dash=document.getElementById('dashBtn');
  if(dash){dash.addEventListener('touchstart',e=>{e.preventDefault();this.dashPressed=true;},{passive:false});dash.addEventListener('mousedown',e=>{e.preventDefault();this.dashPressed=true;});}
  const fire=document.getElementById('fireBtn');
  if(fire){fire.addEventListener('touchstart',e=>{e.preventDefault();this.firePressed=true;},{passive:false});fire.addEventListener('mousedown',e=>{e.preventDefault();this.firePressed=true;});}
  const scythe=document.getElementById('scytheBtn');
  this._bindHold(scythe,()=>{this.scytheHeld=true;},()=>{this.scytheHeld=false;});

  // PC controls: left mouse button flaps. The cursor no longer moves the player automatically.
  window.addEventListener('mousemove',e=>{this.mouseX=e.clientX;});
  window.addEventListener('mouseleave',()=>{this.mouseActive=false;this.mouseLeftHeld=false;});
  window.addEventListener('mousedown',e=>{
   if(this._isUiTarget(e.target))return;
   this.mouseActive=true;this.mouseX=e.clientX;
   if(e.button===0){e.preventDefault();this.mouseLeftHeld=true;this.flapPressed=true;}
   if(e.button===2){e.preventDefault();this.scytheHeld=true;}
  });
  window.addEventListener('mouseup',e=>{
   if(e.button===0){e.preventDefault();this.mouseLeftHeld=false;}
   if(e.button===2){e.preventDefault();this.scytheHeld=false;}
  });

  window.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('keydown',e=>{if(e.code==='Space'){this.holdFlap=true;this.flapPressed=true} if(e.code==='ArrowLeft'||e.code==='KeyA')this.leftHeld=true;if(e.code==='ArrowRight'||e.code==='KeyD')this.rightHeld=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')this.dashPressed=true;if(e.code==='KeyF')this.firePressed=true;if(e.code==='KeyG')this.griffinDivePressed=true;if(e.code==='KeyQ')this.scytheHeld=true});
  window.addEventListener('keyup',e=>{if(e.code==='Space')this.holdFlap=false;if(e.code==='ArrowLeft'||e.code==='KeyA')this.leftHeld=false;if(e.code==='ArrowRight'||e.code==='KeyD')this.rightHeld=false;if(e.code==='KeyQ')this.scytheHeld=false;});
 }
}
