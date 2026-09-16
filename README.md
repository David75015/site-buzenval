# Site Buzenval

Site consacré au territoire de Buzenval et à son histoire.

## Fonctionnement

Les vidéos du site sont référencées dans :

```text
medias/videos.json
```

Chaque vidéo contient au minimum :

* `src` : chemin vers le fichier vidéo ;
* `title` : titre affiché sur le site, renseigné manuellement ;
* `thumb` : chemin vers la miniature de la vidéo.

Exemple :

```json
{
  "src": "medias/31. Rue du 19 Janvier (150 ans).mp4",
  "title": "Rue du 19 Janvier — 150 ans",
  "thumb": "medias/thumbs/31. Rue du 19 Janvier (150 ans).jpg"
}
```

### Génération des miniatures

Le script :

```text
tools/generate_media_assets.js
```

utilise **ffmpeg** pour extraire une image de chaque vidéo et créer sa miniature dans :

```text
medias/thumbs/
```

Les miniatures sont extraites à environ **0,5 seconde** du début de la vidéo.

Le script :

* crée le dossier `medias/thumbs/` s'il n'existe pas ;
* génère les miniatures manquantes ;
* ajoute ou met à jour le champ `thumb` dans `videos.json` ;
* conserve les titres renseignés manuellement ;
* ne modifie jamais le champ `title`.

Les miniatures déjà présentes ne sont pas régénérées.

## Prérequis

Le projet nécessite :

* [Node.js](https://nodejs.org/)
* [ffmpeg](https://ffmpeg.org/)
* Git
* Git LFS pour les fichiers vidéo dépassant la limite de taille de GitHub.

## Installation

Installer les dépendances du projet :

```bash
npm install
```

Le script utilise principalement les modules Node.js intégrés au projet.

## Générer les miniatures

Pour générer les miniatures manquantes :

```bash
npm run generate-media
```

Le script parcourt `medias/videos.json`, vérifie les fichiers vidéo et crée les miniatures nécessaires.

## Ajouter une nouvelle vidéo

1. Ajouter la vidéo dans le dossier `medias/`.
2. Ajouter son entrée dans `medias/videos.json`.
3. Renseigner manuellement son titre.

Par exemple :

```json
{
  "src": "medias/ma-video.mp4",
  "title": "Le titre de ma vidéo"
}
```

4. Générer la miniature :

```bash
npm run generate-media
```

Le champ `thumb` sera automatiquement ajouté :

```json
{
  "src": "medias/ma-video.mp4",
  "title": "Le titre de ma vidéo",
  "thumb": "medias/thumbs/ma-video.jpg"
}
```

## Git LFS

Les fichiers vidéo volumineux sont stockés avec **Git LFS** afin de respecter la limite de taille des fichiers GitHub.

Après l'installation de Git LFS :

```bash
git lfs install
```

Les fichiers `.mp4` sont suivis automatiquement par la configuration du projet.

Pour vérifier les fichiers suivis par Git LFS :

```bash
git lfs ls-files
```

## Structure principale

```text
.
├── index.html
├── histoire.html
├── archive-video.html
├── medias/
│   ├── videos.json
│   ├── *.mp4
│   └── thumbs/
├── sources/
├── conception/
├── tools/
│   └── generate_media_assets.js
├── package.json
├── .gitattributes
├── .gitignore
└── README.md
```

## Commandes principales

Installer le projet :

```bash
npm install
```

Générer les miniatures :

```bash
npm run generate-media
```

Vérifier les fichiers suivis par Git LFS :

```bash
git lfs ls-files
```

Enregistrer les modifications :

```bash
git add .
git commit -m "Description de la modification"
```

Envoyer les modifications sur GitHub :

```bash
git push origin main
```
