# Boutique Vue 3 — commande par WhatsApp

Boutique en ligne statique (Vue 3 + Vite, Vue Router, Pinia, Bootstrap 5). Pas de backend ni de base de données :
catalogue dans un fichier JS, panier et favoris dans le LocalStorage, commande envoyée via WhatsApp Click to Chat.

## Lancer le projet
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # génère dist/
npm run selftest   # 15 scénarios automatiques (panier, variantes, stock, filtres, WhatsApp, persistance)
```

## À faire avant la mise en ligne
1. Ouvrir `src/config/shop.js` : nom, logo, **numéro WhatsApp** (format `221770000000`, sans `+`), vendeur, livraison, conditions.
   Tant que le numéro est vide, la fenêtre de commande affiche l'aperçu du message mais le bouton WhatsApp reste désactivé.
2. Modifier `src/data/products.js` : 56 produits de démonstration, un par ligne du tableau `rows` (prix, couleurs, descriptions). Les tailles et stocks y sont générés automatiquement pour la démo : remplacez-les par vos vraies disponibilités.
3. Remplacer les visuels de démonstration de `public/img/` par vos vraies photos (mêmes chemins que dans `images()`,
   ou adaptez les chemins). Les SVG actuels sont des illustrations générées par `npm run images`.
4. `popularity` est une valeur de démonstration : remplacez-la par des données réelles (ou retirez le tri « Popularité »).

## Design et performances
- Thème sombre : noir profond, blanc lumineux, dégradé orange électrique → rose, touches violet néon. Chaque catégorie a son couple de couleurs (`src/data/categories.js`).
- Pas de GSAP : CSS (transform/opacity), IntersectionObserver et requestAnimationFrame suffisent, pour un site léger sur téléphone d'entrée de gamme.
- Hero en parallaxe (défilement + souris), inclinaison 3D et reflets des cartes, curseur personnalisé : souris uniquement, jamais sur écran tactile.
- Sliders : défilement tactile natif, glisser à la souris, flèches, clavier. Lecture automatique (Nouveautés, Sélections) mise en pause au survol, au focus et au toucher.
- `prefers-reduced-motion` : parallaxe, curseur, défilement automatique, marquee et animations sont désactivés.
- Menu « Catégories » dans l'en-tête → pages `/categorie/<id>` (sliders + grille complète).

## Déploiement Netlify
Build : `npm run build` — dossier : `dist`. Le routage SPA est géré par `netlify.toml` et `public/_redirects`.

## Structure
```
src/config/shop.js        paramètres de la boutique
src/data/                 catalogue (products.js) et catégories
src/services/storage.js   LocalStorage : versionné, validé, tolérant aux données corrompues
src/services/whatsapp.js  génération et encodage du message, URL wa.me
src/stores/               Pinia : cart, favorites, ui (notifications, fenêtre de commande)
src/utils/                prix, validation, filtres/tri, aides produit (variantes, stock, promos)
src/components/           composants réutilisables
src/views/                Accueil, Boutique, Fiche produit, Favoris, Panier, 404
tools/                    générateur d'images de démo, tests fonctionnels
```

## Règles de fonctionnement
- Ligne de panier = produit + couleur + taille. Même variante → quantité augmentée ; variante différente → nouvelle ligne.
- Le prix est figé à l'ajout. Si le catalogue change, le panier avertit et demande d'accepter les nouveaux prix.
- « Commander maintenant » n'envoie que le produit de la fiche et ne touche pas au panier.
- Le panier n'est jamais vidé à l'ouverture de WhatsApp : la commande n'existe que si le client envoie lui-même le message.

## Limites
- Le catalogue ne se modifie qu'en éditant le projet puis en redéployant.
- Panier et favoris sont propres à chaque navigateur : ni synchronisés entre appareils, ni visibles du vendeur.
- Prix et stocks affichés sont indicatifs : le vendeur confirme les conditions finales.
