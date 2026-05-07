# Evo Flap PRO Mobile
Gioco offline mobile-only originale con logica flap migliorata.

## Controlli
- Joystick sinistro: spostamento orizzontale fluido.
- FLAP: tocca per impulso verso l'alto. Tieni premuto per planare e cadere più lentamente.
- DASH: scatto orizzontale.
- EAT: mangia cibo o creature più deboli.

## Fisica flap
La logica è in `engine/physics.js`:
- impulso verticale reale verso l'alto;
- gravità costante verso il basso;
- limite di salita e caduta;
- cooldown del flap;
- stamina;
- planata quando tieni premuto;
- collisione terreno tramite heightfield;
- movimento mobile con accelerazione e inerzia.


## Modifica richiesta
- Tasto EAT rimosso: il personaggio mangia automaticamente cibo e creature vicine consentite.
- BOOST triplicato: dashImpulse 310 -> 930.
- Comandi mobile: sinistra/destra a sinistra; FLAP e BOOST x3 a destra.


Aggiornamento custom:
- Controlli movimento fissati in basso a sinistra.
- FLAP/BOOST fissati in basso a destra.
- Eat rimosso: il cibo viene mangiato automaticamente quando sei vicino.
- Ogni cibo mangiato dà XP, scompare e respawna nella stessa zona dopo 20 secondi.
- Aggiunti oltre 10 MB di moduli di logica locale avanzata in engine/advanced_logic/.
