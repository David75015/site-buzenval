# site-buzenval
Site du territoire de Buzenval

## Générer miniatures et extraire titres

Un utilitaire Node.js est fourni pour générer des miniatures (dans `medias/thumbs/`) et extraire le titre affiché au début de chaque vidéo via OCR.

Prérequis système:
- `ffmpeg` (installé sur le système)

Installation et exécution:
```bash
npm install
npm run generate-media
```

Le script mettra à jour `medias/videos.json` en ajoutant les champs `thumb` et `title`.

