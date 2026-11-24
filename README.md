# Tilemap

Un éditeur de cartes en tuiles pour tes jeux 2D.

*English version: [README.en.md](README.en.md)*

## Bords automatiques (nouveau en 1.2.0)

Les sols se raccordent tout seuls : herbe sur la terre, sable sur l'eau, rives dentelées et coins fermés, aussi dans les exports PNG et Tiled.

## Ce qu’il fait

- **32 tuiles 16×16** dessinées en pixel art : herbe, terre, chemin, sable, eau, glace, neige, lave, pierre, pavés, planches, briques, murs, toit ; et des objets détourés : arbres, sapin, buisson, fleurs, rocher, coffre, tonneau, clôture, panneau, torche, cristal, porte, fenêtre…
- **Deux calques** : le sol, et les objets posés par-dessus. Choisir une tuile choisit son calque tout seul.
- **Outils** : crayon, remplissage, rectangle, gomme (ou clic droit), pipette, grille. **Ctrl+Z / Ctrl+Y** pour annuler et refaire.
- **Plusieurs cartes**, de 16×12 à 64×40 cases, enregistrées au fur et à mesure.
- **Export PNG** : l’image de la carte. **Export Tiled** : la carte au format `.tmj` et sa planche de tuiles `tuiles-neodex.png` (garde-les dans le même dossier), à ouvrir dans Tiled, Godot, Phaser, LDtk…

## Raccourcis

P crayon · F remplir · R rectangle · E gomme · I pipette · G grille · A bords auto · 1 et 2 : calque.

## Bords automatiques (1.2.0)

Le bouton **BORDS AUTO** (touche A) raccorde les sols tout seuls : l’herbe déborde sur la terre et le chemin, le sable sur l’eau, l’eau sur l’eau profonde, avec un bord dentelé et une petite ombre ; les coins se ferment aussi. Les sols bâtis (pavés, briques, murs, toit…) restent nets. Le réglage est gardé pour chaque carte. L’export PNG montre les bords, et l’export Tiled ajoute à la planche une tuile composée pour chaque case de bord : Tiled montre la même carte.

## Autorisations

- **Données** : tes cartes, sauvegardées et synchronisées par NeoDex.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Tilemap → Installer**.

## Jeux de tuiles

Au-dessus de la palette, choisis un jeu : **Nature**, **Grotte** (sol et roche de grotte, gravier, eau souterraine, stalagmite, minerai d’or, champignons lumineux, os, wagonnet), **Ville** (route, passage piéton, trottoir, carrelage, lampadaire, banc, poubelle, boîte aux lettres, pot de fleurs) ou **Neige** (neige tassée, neige et herbe, glace craquelée, bonhomme de neige, sapin enneigé, rocher enneigé, bloc de glace, feu de camp). **Tout** les montre toutes. Les nouvelles tuiles sont ajoutées à la fin de la planche : tes cartes déjà faites ne changent pas.
