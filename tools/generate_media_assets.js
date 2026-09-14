#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const VIDEOS_JSON = path.join(ROOT, 'medias', 'videos.json');
const THUMBS_DIR = path.join(ROOT, 'medias', 'thumbs');

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function ffmpegExtractFrame(videoPath, outPath, timeSec = 0.5){
  // nécessite que `ffmpeg` soit installé sur le système
  const cmd = `ffmpeg -y -i "${videoPath}" -ss ${timeSec} -vframes 1 -q:v 2 "${outPath}"`;
  execSync(cmd, { stdio: 'ignore' });
}

function prettifyBase(base){
  // transforme un nom de fichier en titre lisible (ex: mon_fichier -> Mon Fichier)
  return base.replace(/[_\-]+/g,' ').replace(/\b\w/g, c=>c.toUpperCase());
}

function main(){
  if(!fs.existsSync(VIDEOS_JSON)){
    console.error('Missing', VIDEOS_JSON);
    process.exit(1);
  }

  ensureDir(THUMBS_DIR);
  const videos = JSON.parse(fs.readFileSync(VIDEOS_JSON, 'utf8'));

  let changed = false;
  for(let v of videos){
    const src = path.join(ROOT, v.src);
    if(!fs.existsSync(src)){
      console.warn('Missing video:', src);
      continue;
    }
    const base = path.basename(v.src, path.extname(v.src));
    const thumbPath = path.join(THUMBS_DIR, `${base}.jpg`);

    if(!fs.existsSync(thumbPath)){
      console.log('Extracting frame for', v.src);
      try{ ffmpegExtractFrame(src, thumbPath, 0.5); }
      catch(e){ console.warn('ffmpeg failed for', v.src); continue; }
    }

    const relThumb = path.relative(ROOT, thumbPath).replace(/\\/g, '/');
    const title = v.title && v.title.trim() ? v.title : prettifyBase(base);

    if(v.thumb !== relThumb || v.title !== title){
      v.thumb = relThumb;
      v.title = title;
      changed = true;
    }
  }

  if(changed){
    fs.writeFileSync(VIDEOS_JSON, JSON.stringify(videos, null, 2), 'utf8');
    console.log('Updated', VIDEOS_JSON);
  } else {
    console.log('No changes');
  }
}

main();
