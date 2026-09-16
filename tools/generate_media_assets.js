#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const VIDEOS_JSON = path.join(ROOT, 'medias', 'videos.json');
const THUMBS_DIR = path.join(ROOT, 'medias', 'thumbs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ffmpegExtractFrame(videoPath, outPath, timeSec = 0.5) {
  // Nécessite que ffmpeg soit installé sur le système.
  const cmd = `ffmpeg -y -i "${videoPath}" -ss ${timeSec} -vframes 1 -q:v 2 "${outPath}"`;
  execSync(cmd, { stdio: 'ignore' });
}

function main() {
  if (!fs.existsSync(VIDEOS_JSON)) {
    console.error('Missing', VIDEOS_JSON);
    process.exit(1);
  }

  ensureDir(THUMBS_DIR);

  const videos = JSON.parse(
    fs.readFileSync(VIDEOS_JSON, 'utf8')
  );

  let changed = false;

  for (const video of videos) {
    const src = path.join(ROOT, video.src);

    if (!fs.existsSync(src)) {
      console.warn('Missing video:', src);
      continue;
    }

    const base = path.basename(
      video.src,
      path.extname(video.src)
    );

    const thumbPath = path.join(
      THUMBS_DIR,
      `${base}.jpg`
    );

    if (!fs.existsSync(thumbPath)) {
      console.log('Extracting frame for', video.src);

      try {
        ffmpegExtractFrame(src, thumbPath, 0.5);
      } catch (error) {
        console.warn('ffmpeg failed for', video.src);
        continue;
      }
    }

    const relThumb = path
      .relative(ROOT, thumbPath)
      .replace(/\\/g, '/');

    if (video.thumb !== relThumb) {
      video.thumb = relThumb;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(
      VIDEOS_JSON,
      JSON.stringify(videos, null, 2),
      'utf8'
    );

    console.log('Updated', VIDEOS_JSON);
  } else {
    console.log('No changes');
  }
}

main();
```
