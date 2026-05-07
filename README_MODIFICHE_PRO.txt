MODIFICHE AGGIUNTE SENZA CAMBIARE LA LOGICA BASE

1) Menu iniziale
- Pulsante PLAY.
- Scelta livello/evoluzione di partenza.
- Se il livello scelto è <= livello account: gratis.
- Se è superiore: costa livello * 5 gemme.

2) Account salvato
- Salvataggio automatico in localStorage.
- Livello account parte da 1.
- Dal livello 1 al 2 servono 80 * 20 = 1600 Account XP.
- Poi serve 1600 * livello corrente.
- L'Account XP sale con l'XP guadagnata in partita.
- Ogni 1000 XP guadagni 10 monete d'oro.

3) Shop
- Codice bonus: Kraken = 300 gemme, una sola volta.
- Offerte monete -> gemme:
  1000 monete = 50 gemme
  2000 monete = 100 gemme
  5000 monete = 300 gemme
  10000 monete = 750 gemme
  15000 monete = 1000 gemme
- Arcade Shop: Dev Console costa 25000 monete o 1500 gemme.
- Se sbloccata, in partita appaiono i pulsanti +500 XP, +1000 XP, +2000 XP.

4) Mappa, cibo, nemici modificabili
Apri questo file:
engine/game_config.js

Da lì puoi modificare:
- sprite sfondo mappa
- sprite terreno/piattaforme
- collisioni mappa: x, y, w, h
- spawn del cibo: quantità, posizione, distanza, XP, tempo respawn, sprite PNG
- spawn dei nemici: quantità, posizione, livello, HP, tempo respawn, sprite PNG

5) Sprite PNG modificabili
- Creature/evoluzioni: assets/evolutions/*.png
- Cibo: assets/food/*.png
- Nemici: assets/enemies/*.png
- Mappa: assets/map/*.png

IMPORTANTE
Non servono file .bin per modificare le nuove parti. Usa PNG normali.
