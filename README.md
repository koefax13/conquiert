# Conquête de l’Europe

Site statique, sans dépendance ni étape de build.

## Fichiers
- `index.html` : page et fenêtres (choix du pays, décisions, diplomatie, fin de partie)
- `style.css` : styles (thème clair/sombre automatique)
- `game.js` : moteur de simulation, rendu et interface
- `data.js` : données générées (grille, population, terrain, contours des pays)
- `favicon.svg` : icône

## Tester en local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000 (ouvrir `index.html` directement fonctionne aussi).

## Héberger
Déposer le dossier tel quel sur GitHub Pages, Netlify, Cloudflare Pages ou Vercel (dossier racine, aucune commande de build).

## Données
Contours, fleuves et reliefs : Natural Earth (domaine public). Population, PIB par habitant, natalité et indices de puissance : valeurs approximatives.
