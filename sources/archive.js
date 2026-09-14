document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('video-list');
  const player = document.getElementById('player');
  const playerSource = document.getElementById('player-source');
  const playerTitle = document.getElementById('player-title');
  const count = document.getElementById('count');
  let currentIndex = -1;
  // Aide : rendre un nom de fichier lisible en titre
  function prettifySrc(src){
    try{
      const parts = src.split('/');
      const base = parts[parts.length-1];
      const name = base.replace(/\.[^.]+$/, '');
      return name.replace(/[_\-]+/g, ' ').replace(/\s+/g,' ').trim();
    }catch(e){ return src; }
  }

  // Aide : générer une miniature depuis une source vidéo en utilisant
  // un élément <video> hors écran et un <canvas>
  function generateThumbnailDataURL(src, seekTime = 0.5, width = 320){
    return new Promise((resolve, reject)=>{
      try{
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';
        video.muted = true;
        video.src = src;

        const cleanup = ()=>{
          video.pause();
          video.src = '';
          video.removeAttribute('src');
        };

        const onError = (e)=>{ cleanup(); reject(e || new Error('Video load error')); };

        const timeout = setTimeout(()=>{
          onError(new Error('Thumbnail generation timeout'));
        }, 8000);

        video.addEventListener('loadeddata', ()=>{
          // se placer à un petit instant
          const seek = Math.min(seekTime, Math.max(0.1, video.duration * 0.05 || 0.5));
          const doSeek = ()=>{
            try{
              video.currentTime = seek;
            }catch(e){
              // certains navigateurs lèvent une exception si currentTime est défini trop tôt
              setTimeout(()=>{ video.currentTime = seek; }, 200);
            }
          };
          doSeek();
        });

        video.addEventListener('seeked', ()=>{
          try{
            const canvas = document.createElement('canvas');
            const ratio = video.videoWidth ? (video.videoHeight / video.videoWidth) : (9/16);
            canvas.width = width;
            canvas.height = Math.round(width * ratio);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            clearTimeout(timeout);
            cleanup();
            resolve(dataUrl);
          }catch(err){
            clearTimeout(timeout);
            cleanup();
            reject(err);
          }
        });

        video.addEventListener('error', onError);
        // commencer le chargement
        video.load();
      }catch(err){ reject(err); }
    });
  }

  fetch('medias/videos.json').then(r=>r.json()).then(videos=>{
    count.textContent = videos.length + ' vidéos';
    videos.forEach((v, i)=>{
      const item = document.createElement('div');
      item.className = 'video-item';
      item.dataset.src = v.src;
      item.dataset.index = i;

      // miniature : préférer `v.thumb`, sinon cache (localStorage), sinon générer côté client
      let thumb;
      const storageKey = 'thumb:' + v.src;
      const cached = (()=>{ try{ return localStorage.getItem(storageKey); }catch(e){ return null; } })();
      if(v.thumb){
        thumb = document.createElement('img');
        thumb.className = 'video-thumb';
        thumb.src = v.thumb;
        thumb.alt = v.title || '';
      } else if(cached){
        thumb = document.createElement('img');
        thumb.className = 'video-thumb';
        thumb.src = cached;
        thumb.alt = v.title || '';
      } else {
        thumb = document.createElement('div');
        thumb.className = 'video-thumb';
        thumb.textContent = (v.title || v.src).slice(0,18);
        // générer en arrière-plan et remplacer quand prêt
        generateThumbnailDataURL(v.src, 0.5, 320).then(dataUrl=>{
          try{ localStorage.setItem(storageKey, dataUrl); }catch(e){}
          const img = document.createElement('img');
          img.className = 'video-thumb';
          img.src = dataUrl;
          img.alt = v.title || '';
          thumb.replaceWith(img);
        }).catch(()=>{
          // keep placeholder
        });
      }

      const meta = document.createElement('div');
      meta.className = 'video-meta';
      const title = document.createElement('div');
      title.className = 'video-title';
      // simple title: prefer `v.title` then prettified filename
      title.textContent = v.title || prettifySrc(v.src);
      meta.appendChild(title);

      item.appendChild(thumb);
      item.appendChild(meta);

      item.addEventListener('click', ()=>{
        playVideo(i, v);
      });

      // pas d'OCR : les titres proviennent du JSON ou du nom de fichier

      listEl.appendChild(item);
    });

    if(videos.length>0){
      // définir la première vidéo sélectionnée mais ne pas lancer la lecture automatiquement
      const first = videos[0];
      playerSource.src = first.src;
      player.load();
      playerTitle.textContent = first.title || prettifySrc(first.src);
      // marquer le premier élément comme actif dans la liste
      const firstItem = listEl.querySelector('.video-item[data-index="0"]');
      if(firstItem) firstItem.classList.add('active');
    }
  }).catch(err=>{
    listEl.textContent = 'Impossible de charger la liste de vidéos.';
    console.error(err);
  });

  function playVideo(index, v){
    if(currentIndex===index) return;
    currentIndex = index;
    // update player
    player.pause();
    playerSource.src = v.src;
    player.load();
    player.play().catch(()=>{});
    playerTitle.textContent = v.title || v.src;

    // update active class
    document.querySelectorAll('.video-item').forEach(it=>it.classList.remove('active'));
    const active = document.querySelector('.video-item[data-index="'+index+'"]');
    if(active) active.classList.add('active');
  }

});
