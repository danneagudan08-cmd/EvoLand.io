/*
  CONFIG MODIFICABILE DEL GIOCO
  Qui puoi cambiare mappa, collisioni, alberi, cibo, nemici, pozze d'acqua, città di sfondo,
  buco nero e boss senza toccare main.js/world.js/render.js.
  Tutti gli sprite sono PNG modificabili.
*/
export const GAME_CONFIG={
  map:{
    minX:-4000,
    maxX:42000,
    minY:-5000,
    maxY:2600,
    backgroundSprite:'assets/map/sky_realistic.png',
    galaxySprite:'assets/map/galaxy_realistic.png',
    meadowSprite:'assets/map/meadow_full_background.png',
    citySprite:'assets/map/city_background.png',
    groundSprite:'assets/map/ground_rich_grass.png',
    platformSprite:'assets/map/platform_wood.png',
    treeSprite:'assets/props/tree_oak_food.png',
    houseSprite:'assets/props/house_grounded.png',
    waterSprite:'assets/props/water_pond.png',
    blackHoleSprite:'assets/props/black_hole.png',
    scytheSprite:'assets/effects/scythe.png',
    scytheSprites:['assets/effects/scythe_form_1.png','assets/effects/scythe_form_2.png','assets/effects/scythe_form_3.png','assets/effects/scythe_form_4.png'],
    fireWaveSprite:'assets/effects/fire_wave.png',
    boostFartSprite:'assets/effects/boost_fart.png',
    griffinScratchSprite:'assets/effects/griffin_scratch.png',
    poisonSprite:'assets/effects/poison_blob.png',
    bossFireballSprite:'assets/effects/boss_fireball.png',
    levelUpSprite:'assets/effects/level_up_star.png',
    collisions:[],
    // Alberi: bottomY viene calcolato dal terreno, quindi non fluttuano mai.
    trees:{
      count:90,
      startX:-3300,
      stepX:520,
      sprite:'assets/props/tree_oak_food.png',
      w:260,
      h:420,
      foodSlots:[
        {dx:-58,dy:-238},{dx:-20,dy:-286},{dx:48,dy:-248},{dx:70,dy:-205},{dx:-78,dy:-190}
      ]
    },
    houses:{count:30,startX:1000,stepX:1500,sprite:'assets/props/house_grounded.png',w:250,h:320},
    // Pozze più rare e scavate sotto il profilo del terreno: World.groundAt crea il taglio di collisione.
    ponds:[
      {x:3400,w:340,h:105,depth:45},{x:8200,w:360,h:112,depth:50},{x:13200,w:350,h:108,depth:48},{x:19600,w:380,h:116,depth:52},{x:26600,w:360,h:110,depth:50},{x:33800,w:370,h:112,depth:50}
    ],
    blackHoles:[{x:36500,yOffset:360,r:120,target:'boss'}],
    secondary:{minX:-1200,maxX:6200,spawnX:350,spawnY:700,bossX:4200,bossY:720,exitX:260},
    space:{y:-1450,ceilingY:-4300,gravityMultiplier:.5,oxygenDrainMultiplier:2}
  },
  food:{
    respawnSeconds:20,
    // Il cibo viene creato SOLO sugli alberi, usando questi sprite/XP.
    treeFoods:[
      {name:'Bacca Rossa',r:12,xp:7,kind:0,sprite:'assets/food/food_tree_berry.png'},
      {name:'Frutto Oro',r:14,xp:12,kind:1,sprite:'assets/food/food_tree_gold.png'}
    ],
    groups:[]
  },
  enemies:{
    respawnSeconds:35,
    flyingSpeedMultiplier:4,
    groundSpeedMultiplier:3,
    visualChaseRadius:900,
    groups:[
      {name:'Bestia di Terra',count:42,startX:800,stepX:920,yOffset:0,r:30,level:2,hp:45,fly:false,sprite:'assets/enemies/enemy_ground_beast.png'},
      {name:'Imp Volante',count:45,startX:1200,stepX:760,yOffset:520,r:24,level:4,hp:38,fly:true,sprite:'assets/enemies/enemy_flying_imp.png'},
      {name:'Drone Alato',count:34,startX:3600,stepX:980,yOffset:760,r:28,level:7,hp:62,fly:true,sprite:'assets/enemies/enemy_flying_drone.png'},
      {name:'Nemico Tank',count:22,startX:5200,stepX:1400,yOffset:0,r:38,level:9,hp:95,fly:false,sprite:'assets/enemies/enemy_tank.png'},
      {name:'Predatore Volante Lento',count:16,startX:2600,stepX:1800,yOffset:620,r:25,level:6,hp:48,fly:true,slowFly:true,screenChase:true,sprite:'assets/enemies/enemy_flying_imp.png'},
      {name:'Vespa Velenosa',count:14,startX:3400,stepX:2100,yOffset:760,r:24,level:8,hp:58,fly:true,slowFly:true,screenChase:true,poisonShooter:true,poisonCooldown:3.2,sprite:'assets/enemies/enemy_flying_drone.png'},
      {name:'Guardiano Spaziale',count:3,startX:6200,stepX:7600,yOffset:2850,r:34,level:17,hp:140,fly:true,space:true,screenChase:true,killForm:16,xpBonus:220,sprite:'assets/enemies/enemy_flying_drone.png'}
    ],
    boss:{name:'Boss del Vuoto',sprite:'assets/enemies/boss_void_demon.png',r:90,level:22,hp:9100,damage:10,fireballDamage:18,fireballCooldown:10,fireballSpeed:520,fireballRadius:18}
  },
  survival:{maxWater:100,drainPerSecond:100/300,refillPerSecond:48,damagePerSecondWhenEmpty:18,maxHealth:100,healthRegenDelay:10,healthRegenPerSecond:5},
  powers:{
    scytheForms:[20,21,22,23],
    scytheDamagePerSecond:260,
    scytheRange:190,
    phoenixForm:17,
    fireCooldown:4.5,
    fireRadius:360,
    fireDamagePerSecond:32,
    fireDuration:5.5,
    griffinDiveForm:13,
    griffinDiveDuration:.5,
    griffinDiveSpeedMultiplier:1.5,
    griffinScratchDamage:190
  },
  sounds:{scythe:'assets/sounds/scythe.wav',griffin:'assets/sounds/griffin_scratch.wav',boost:'assets/sounds/boost_fart.wav',fire:'assets/sounds/fire.wav',poison:'assets/sounds/poison.wav',levelUp:'assets/sounds/level_up.wav'},
  account:{
    baseAccountXP:80,
    levelMultiplier:20,
    maxLevel:24,
    freeGemsBonusCode:'Kraken',
    bonusCodeGems:300,
    devConsoleBonusCode:'Devil_Kraken_Pro',
    devConsoleBonusDays:3,
    goldPerXPBlock:10,
    xpBlock:1000
  }
};
