// Logica deterministica futura lato server locale/autoritativa. Non modifica il gameplay attuale.
export class ServerFutureCore{
 constructor(seed=2026){this.seed=seed;this.tick=0;this.snapshots=[];}
 hashState(player,world){let h=this.seed|0;h=((h*31)+(player.x|0))|0;h=((h*31)+(player.y|0))|0;h=((h*31)+(player.form|0))|0;h=((h*31)+((player.xp||0)|0))|0;h=((h*31)+((world.enemies?.length||0)))|0;return (h>>>0).toString(16);}
 validateInput(input){return {x:Math.max(-1,Math.min(1,Number(input.x)||0)),holdFlap:!!input.holdFlap,dashPressed:!!input.dashPressed,firePressed:!!input.firePressed,scytheHeld:!!input.scytheHeld};}
 snapshot(player,world){this.tick++;const sig=this.hashState(player,world);this.snapshots.push({tick:this.tick,t:Date.now(),sig});if(this.snapshots.length>120)this.snapshots.shift();return sig;}
}
