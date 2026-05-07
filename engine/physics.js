export class FlightPhysics {
  constructor(entity){ this.e=entity; }
  step(input, world, dt){
    const e=this.e;
    const d=Math.min(dt, 1/30);
    const air=e.grounded?0.78:0.985;
    const inSpace=world?.config?.map?.space && e.y<world.config.map.space.y+520;const gravity=e.gravity * (inSpace?(world.config.map.space.gravityMultiplier||.5):1) * (input.holdFlap?0.82:1.0);
    e.flapCooldown=Math.max(0,e.flapCooldown-d);
    e.dashCooldown=Math.max(0,e.dashCooldown-d);
    e.coyote=Math.max(0,e.coyote-d);

    // horizontal steering, very smooth on mobile joystick
    const targetVX=input.x * e.maxVX;
    const accel=e.grounded?e.groundAccel:e.airAccel;
    e.vx += (targetVX-e.vx) * Math.min(1, accel*d);
    e.vx *= air;

    // real flap: impulse up, with less effect when already flying upward too fast
    if(input.flapPressed && e.flapCooldown<=0 && e.stamina>0){
      const upwardPenalty=Math.max(0, -e.vy/e.maxRise) * 0.42;
      const impulse=e.flapImpulse*(1-upwardPenalty);
      e.vy = Math.max(-e.maxRise, e.vy - impulse);
      e.stamina=Math.max(0,e.stamina-e.flapCost);
      e.flapCooldown=e.flapDelay;
      e.wingPhase+=1.8;
      e.justFlapped=1.0;
    }

    // dash usable in air, pushes in joystick direction
    if(input.dashPressed && e.dashCooldown<=0 && e.stamina>12){
      const dir=input.x || (e.facing||1);
      e.vx += dir * e.dashImpulse;
      e.vy *= .7;
      e.stamina-=12;
      e.dashCooldown=e.dashDelay;
    }

    // gravity and terminal speed
    e.vy += gravity*d;
    if(input.holdFlap && e.vy>0) e.vy *= Math.pow(e.glideDrag, d*60);
    e.vy=Math.max(-e.maxRise, Math.min(e.maxFall, e.vy));

    const oldX=e.x, oldY=e.y;
    e.x += e.vx*d;
    e.y += e.vy*d;
    e.grounded=false;

    // terrain collision via heightfield
    const ground=world.groundAt(e.x);
    if(e.y+e.r>ground.y){
      e.y=ground.y-e.r;
      if(e.vy>0) e.vy=0;
      e.grounded=true;
      e.coyote=.09;
      e.stamina=Math.min(e.maxStamina,e.stamina+e.staminaRegenGround*d);
    }else{
      e.stamina=Math.min(e.maxStamina,e.stamina+e.staminaRegenAir*d);
    }

    // wall bounds
    if(e.x<world.minX+e.r){e.x=world.minX+e.r;e.vx=Math.abs(e.vx)*.25;}
    if(e.x>world.maxX-e.r){e.x=world.maxX-e.r;e.vx=-Math.abs(e.vx)*.25;}
    const spaceCeiling=world?.config?.map?.space?.ceilingY??world.minY;if(e.y<spaceCeiling+e.r){e.y=spaceCeiling+e.r;e.vy=Math.max(0,e.vy);}
    if(e.y>world.maxY-e.r){e.y=world.maxY-e.r;e.vy=0;e.grounded=true;}
    if(Math.abs(e.vx)>5) e.facing=Math.sign(e.vx);
    e.justFlapped=Math.max(0,e.justFlapped-d);
    e.wingPhase += (Math.abs(e.vx)*0.003 + Math.abs(e.vy)*0.006 + (input.holdFlap?0.12:0.04))*d*60;
  }
}
