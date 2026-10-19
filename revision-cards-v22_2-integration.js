/* ==============================================================
   OSTÉO PRATIK — RÉVISION PROPRE + CARTES V22.2
   Version 22.2-app-12
   --------------------------------------------------------------
   - supprime les anciens déblocages de démonstration 12 / 401
   - source unique : techniques réellement visionnées
   - roue = uniquement techniques réellement vues
   - album Déjà vues = mêmes techniques
   - supprime l'ancien bouton orange C2-C6 et l'ancien texte de test
   - empêche l'ancienne carte orange de se rouvrir
   - ouvre exclusivement la carte V22.2 Premium
   - APP12 : synchronise les cartes « Déjà vues » entre appareils
   ============================================================== */
(function(){
  'use strict';

  const VERSION = '22.2-app-12';

  const CLEAN_KEY  = 'osteoPratikViewedTechniqueIdsCleanV1';
  const STRICT_KEY = 'osteoPratikStrictViewedTechniqueIdsV2';
  const LEGACY_KEY = 'osteoPratikViewedTechniqueIds';

  // IDs utilisés autrefois uniquement comme cartes de démonstration.
  const OLD_DEMO_IDS = new Set([12,401]);

  let depsPromise = null;
  let currentTechniqueId = null;
  let previousBodyOverflow = '';

  function toastSafe(message){
    try{
      if(typeof toast === 'function') return toast(message);
      if(typeof window.toast === 'function') return window.toast(message);
    }catch(_){}
    console.info('[Ostéo Pratik]',message);
  }

  function toId(value){
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function getTechniques(){
    try{
      if(typeof techniques !== 'undefined' && Array.isArray(techniques)) return techniques;
    }catch(_){}
    return Array.isArray(window.techniques) ? window.techniques : [];
  }

  function validIdSet(){
    return new Set(getTechniques().map(t=>toId(t?.id)).filter(Boolean));
  }

  function readArray(key){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    }catch(_){
      return null;
    }
  }

  function uniqueValid(values){
    const valid = validIdSet();
    const out = [];
    const seen = new Set();

    (Array.isArray(values) ? values : []).forEach(value=>{
      const id = toId(value);
      if(!id || !valid.has(id) || seen.has(id)) return;
      seen.add(id);
      out.push(id);
    });

    return out;
  }

  function writeViewed(ids){
    const clean = uniqueValid(ids);

    try{ localStorage.setItem(CLEAN_KEY,JSON.stringify(clean)); }catch(_){}
    // Les anciennes couches de l'application lisent encore ces clés :
    // on les synchronise pour qu'elles ne puissent plus réinjecter 12 / 401.
    try{ localStorage.setItem(STRICT_KEY,JSON.stringify(clean)); }catch(_){}
    try{ localStorage.setItem(LEGACY_KEY,JSON.stringify(clean)); }catch(_){}

    return clean;
  }

  function readViewed(){
    const clean = readArray(CLEAN_KEY);
    if(clean) return writeViewed(clean);

    // Première migration : on conserve les anciennes techniques éventuellement
    // réellement vues, mais on retire les deux IDs qui avaient été imposés
    // uniquement pour les démonstrations de cartes.
    const strict = readArray(STRICT_KEY) || [];
    const legacy = readArray(LEGACY_KEY) || [];
    const migrated = [...strict,...legacy]
      .map(toId)
      .filter(id=>id && !OLD_DEMO_IDS.has(id));

    return writeViewed(migrated);
  }

  function viewedSet(){
    return new Set(readViewed());
  }

  function getTechnique(id){
    const n = toId(id);
    return getTechniques().find(t=>toId(t?.id)===n) || null;
  }

  function cleanIsTechniqueUnlocked(t){
    return !!(t && viewedSet().has(toId(t.id)));
  }

  function syncTechniqueStatuses(){
    const viewed = viewedSet();

    getTechniques().forEach(t=>{
      const seen = viewed.has(toId(t?.id));
      t.status = seen ? 'vue' : 'non vue';
      t.percent = seen ? 100 : 0;
    });

    // Nettoyage de l'ancien Set global qui contenait 12 et 401 en dur.
    try{
      if(typeof unlockedTechniqueIds !== 'undefined' &&
         unlockedTechniqueIds &&
         typeof unlockedTechniqueIds.clear === 'function'){
        unlockedTechniqueIds.clear();
        viewed.forEach(id=>unlockedTechniqueIds.add(id));
      }
    }catch(_){}
  }

  function saveViewed(id){
    const n = toId(id);
    if(!n) return;

    const ids = readViewed();
    if(!ids.includes(n)) ids.push(n);
    writeViewed(ids);
    syncTechniqueStatuses();

    try{ if(typeof renderTechniques === 'function') renderTechniques(); }catch(_){}
    try{ if(typeof renderSeenCollections === 'function') renderSeenCollections(); }catch(_){}
    try{ if(typeof renderRevisionWheel === 'function') renderRevisionWheel(); }catch(_){}
    try{ if(typeof updateZoneStats === 'function') updateZoneStats(); }catch(_){}
  }

  function cleanViewedTechniquesForWheel(){
    const viewed = viewedSet();
    return getTechniques()
      .filter(t=>viewed.has(toId(t?.id)))
      .sort((a,b)=>
        String(a.zone||'').localeCompare(String(b.zone||'')) ||
        String(a.sub||'').localeCompare(String(b.sub||'')) ||
        toId(a.id)-toId(b.id)
      );
  }

  function installCleanProgressLogic(){
    syncTechniqueStatuses();

    window.readViewedTechniqueIds = readViewed;
    window.saveViewedTechniqueId = saveViewed;
    window.isTechniqueUnlocked = cleanIsTechniqueUnlocked;
    window.isTechniqueViewedForRevision = cleanIsTechniqueUnlocked;
    window.getViewedTechniquesForWheel = cleanViewedTechniquesForWheel;

    try{ readViewedTechniqueIds = readViewed; }catch(_){}
    try{ saveViewedTechniqueId = saveViewed; }catch(_){}
    try{ isTechniqueUnlocked = cleanIsTechniqueUnlocked; }catch(_){}
    try{ isTechniqueViewedForRevision = cleanIsTechniqueUnlocked; }catch(_){}
    try{ getViewedTechniquesForWheel = cleanViewedTechniquesForWheel; }catch(_){}

    // Ne rappelle surtout pas les anciens wrappers : ils réinjectaient les cartes test.
    window.markTechniqueViewedAfterComplete = function(id){
      let n = toId(id);
      if(!n){
        try{
          if(typeof currentPlayerTechniqueId !== 'undefined') n = toId(currentPlayerTechniqueId);
        }catch(_){}
      }
      if(!n) return;
      saveViewed(n);
      toastSafe('Technique vue : carte débloquée');
    };
    try{ markTechniqueViewedAfterComplete = window.markTechniqueViewedAfterComplete; }catch(_){}

    window.stateLabel = function(t){
      return cleanIsTechniqueUnlocked(t)
        ? '<span class="seen">vue ✓</span>'
        : '<span>non vue ○</span>';
    };
    try{ stateLabel = window.stateLabel; }catch(_){}
  }

  function installCleanupCSS(){
    if(document.getElementById('op22-cleanup-css')) return;

    const style = document.createElement('style');
    style.id = 'op22-cleanup-css';
    style.textContent = `
      /* Ancien bouton/test cervical */
      .quick-cervical-orange{display:none !important}

      /* Ancienne carte plein écran orange : désactivée définitivement */
      #cardFullscreenOverlay{display:none !important}

      /* Annule le traitement spécial historique de la carte #12 */
      .play-card[data-tech-id="12"]{
        animation:none !important;
        filter:none !important;
      }
      .play-card[data-tech-id="12"].locked{
        pointer-events:none !important;
      }
      .play-card[data-tech-id="12"]:not(.locked){
        pointer-events:auto !important;
      }
      .play-card[data-tech-id="12"] .play-card-face{
        color:var(--violet) !important;
        border-color:currentColor !important;
        background:
          radial-gradient(circle at 50% 18%,color-mix(in srgb,currentColor 16%,transparent),transparent 42%),
          linear-gradient(145deg,rgba(10,29,55,.58),rgba(5,15,31,.72)) !important;
        box-shadow:
          0 0 18px color-mix(in srgb,currentColor 18%,transparent),
          inset 0 1px 0 rgba(255,255,255,.05) !important;
      }
      .play-card[data-tech-id="12"].locked .play-card-face{
        color:#8791a3 !important;
        filter:grayscale(1) !important;
        opacity:.42 !important;
        background:linear-gradient(145deg,rgba(45,50,62,.34),rgba(10,14,22,.62)) !important;
      }
      .play-card[data-tech-id="12"] .card-status{
        color:#dce8f8 !important;
        background:rgba(255,255,255,.05) !important;
        border-color:rgba(255,255,255,.12) !important;
      }

      /* Vignettes de l'album : vraie photo issue de la carte V22.2 */
      .play-card .card-image{
        overflow:hidden !important;
      }
      .play-card .card-image img.op22-menu-thumb{
        display:block !important;
        width:100% !important;
        height:100% !important;
        object-fit:cover !important;
        object-position:center center !important;
        opacity:1;
      }
      .play-card.locked .card-image img.op22-menu-thumb{
        filter:grayscale(1) brightness(.42) contrast(.92) !important;
        opacity:.52 !important;
      }
      .play-card.op22-menu-thumbnail-ready .card-fallback{
        display:none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanupLegacyDom(){
    document.querySelectorAll('.quick-cervical-orange').forEach(el=>el.remove());
    document.querySelectorAll('.orange-cervical-tech').forEach(el=>el.classList.remove('orange-cervical-tech'));

    const summary = document.getElementById('seenAlbumSummary');
    const summaryCard = summary?.closest('.collection-summary');
    const p = summaryCard?.querySelector('p');
    if(p){
      p.textContent = 'Les cartes se débloquent automatiquement après le visionnage complet d’une technique.';
    }

    const legacyOverlay = document.getElementById('cardFullscreenOverlay');
    if(legacyOverlay){
      legacyOverlay.classList.remove('open','show','active');
      legacyOverlay.setAttribute('aria-hidden','true');
    }
  }

  function hydrateSeenCardThumbnails(){
    const grid=document.getElementById('seenCardGrid');
    if(!grid) return;

    ensureDependencies().then(()=>{
      const baseApi=window.OSTEO_PLAYING_CARDS_V22;
      const premiumApi=window.OSTEO_PLAYING_CARDS_V22_2;
      if(!baseApi || typeof baseApi.model!=='function') return;

      grid.querySelectorAll('.play-card[data-tech-id]').forEach(card=>{
        const id=toId(card.dataset.techId);
        const t=getTechnique(id);
        if(!t) return;

        const ref=resolveRef(t,premiumApi);
        if(!ref) return;

        let model=null;
        try{ model=baseApi.model(ref); }catch(_){ model=null; }
        const photo=model?.frontPhoto;
        if(!photo) return;

        const box=card.querySelector('.card-image');
        if(!box) return;

        let img=box.querySelector('img');
        if(!img){
          img=document.createElement('img');
          box.prepend(img);
        }

        img.classList.add('op22-menu-thumb');
        img.src=photo;
        img.alt=t.title||'Technique ostéopathique';
        img.loading='lazy';
        img.style.display='block';

        const fallback=box.querySelector('.card-fallback');
        if(fallback) fallback.style.display='none';

        card.classList.add('op22-menu-thumbnail-ready');
      });
    }).catch(err=>{
      console.warn('[Ostéo Pratik] Vignettes V22.2 indisponibles',err);
    });
  }

  function wrapExistingRenderers(){
    try{
      if(typeof renderSeenCards === 'function' && !renderSeenCards.__op22ThumbWrapped){
        const original = renderSeenCards;
        const wrapped = function(){
          syncTechniqueStatuses();
          const result = original.apply(this,arguments);
          hydrateSeenCardThumbnails();
          setTimeout(hydrateSeenCardThumbnails,80);
          return result;
        };
        wrapped.__op22ThumbWrapped = true;
        renderSeenCards = wrapped;
        window.renderSeenCards = wrapped;
      }
    }catch(_){}

    try{
      if(typeof renderSeenCollections === 'function' && !renderSeenCollections.__op22CleanWrapped){
        const original = renderSeenCollections;
        const wrapped = function(){
          syncTechniqueStatuses();
          const result = original.apply(this,arguments);
          cleanupLegacyDom();
          return result;
        };
        wrapped.__op22CleanWrapped = true;
        renderSeenCollections = wrapped;
        window.renderSeenCollections = wrapped;
      }
    }catch(_){}

    try{
      if(typeof renderRevisionWheel === 'function' && !renderRevisionWheel.__op22CleanWrapped){
        const original = renderRevisionWheel;
        const wrapped = function(){
          syncTechniqueStatuses();
          return original.apply(this,arguments);
        };
        wrapped.__op22CleanWrapped = true;
        renderRevisionWheel = wrapped;
        window.renderRevisionWheel = wrapped;
      }
    }catch(_){}
  }

  function ensureStyle(id,href){
    if(document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id=id;
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  }

  function loadScript(id,src,ready){
    if(ready && ready()) return Promise.resolve();

    const existing = document.getElementById(id);
    if(existing){
      return new Promise((resolve,reject)=>{
        const started=Date.now();
        (function wait(){
          if(!ready || ready()) return resolve();
          if(Date.now()-started>12000) return reject(new Error('Chargement incomplet : '+src));
          setTimeout(wait,60);
        })();
      });
    }

    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.id=id;
      script.src=src;
      script.async=false;
      script.onload=()=>resolve();
      script.onerror=()=>reject(new Error('Impossible de charger '+src));
      document.head.appendChild(script);
    });
  }

  function ensureDependencies(){
    if(depsPromise) return depsPromise;

    ensureStyle('op22-app-base-css','playing-cards-v22.css?v=22.0');
    ensureStyle('op22-app-premium-css','playing-cards-v22_2.css?v=22.2');

    depsPromise=(async()=>{
      await loadScript(
        'op22-app-data',
        'osteo-ra-details-data.js',
        ()=>!!window.OSTEO_RA_EMBEDDED_DETAILS
      );
      await loadScript(
        'op22-app-base-js',
        'playing-cards-v22.js?v=22.0',
        ()=>!!window.OSTEO_PLAYING_CARDS_V22
      );
      await loadScript(
        'op22-app-premium-js',
        'playing-cards-v22_2.js?v=22.2',
        ()=>!!window.OSTEO_PLAYING_CARDS_V22_2
      );

      if(window.OSTEO_PLAYING_CARDS_V22_2?.ready){
        await window.OSTEO_PLAYING_CARDS_V22_2.ready();
      }

      return window.OSTEO_PLAYING_CARDS_V22_2;
    })().catch(err=>{
      depsPromise=null;
      throw err;
    });

    return depsPromise;
  }

  function ensureOverlay(){
    let overlay=document.getElementById('op22AppCardOverlay');
    if(overlay) return overlay;

    const style=document.createElement('style');
    style.id='op22-app-overlay-css';
    style.textContent=`
      #op22AppCardOverlay{
        position:fixed;inset:0;z-index:2147482000;
        display:none;align-items:center;justify-content:center;
        padding:18px;background:rgba(1,7,14,.90);
        backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px)
      }
      #op22AppCardOverlay.is-open{display:flex}
      #op22AppCardOverlay .op22-app-shell{
        position:relative;width:min(520px,100%);max-height:96vh;
        display:flex;flex-direction:column;align-items:center;gap:12px
      }
      #op22AppCardOverlay .op22-app-head{
        width:min(430px,94vw);display:flex;align-items:center;
        justify-content:space-between;gap:12px;color:#fff
      }
      #op22AppCardOverlay .op22-app-head-text{
        min-width:0;display:flex;flex-direction:column;gap:3px
      }
      #op22AppCardOverlay .op22-app-head-text small{
        color:#7feeff;font-size:10px;font-weight:900;
        text-transform:uppercase;letter-spacing:.15em
      }
      #op22AppCardOverlay .op22-app-head-text strong{
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px
      }
      #op22AppCardOverlay .op22-app-close{
        flex:0 0 auto;width:42px;height:42px;border-radius:50%;
        border:1px solid rgba(126,238,255,.55);
        background:rgba(3,18,31,.82);color:#fff;font-size:27px;
        line-height:1;cursor:pointer
      }
      #op22AppCardStage{
        width:100%;overflow:auto;overscroll-behavior:contain;padding:2px 0 5px
      }
      #op22AppCardOverlay .op22-app-actions{
        width:min(430px,94vw);display:grid;grid-template-columns:1fr 1fr;gap:9px
      }
      #op22AppCardOverlay .op22-app-actions button{
        min-height:44px;border-radius:14px;padding:10px 13px;font-weight:900;cursor:pointer
      }
      #op22AppCardOverlay .op22-app-secondary{
        color:#dffaff;border:1px solid rgba(107,231,255,.42);
        background:rgba(3,20,34,.78)
      }
      #op22AppCardOverlay .op22-app-primary{
        color:#00141d;border:1px solid #75edff;
        background:linear-gradient(135deg,#78efff,#21cbea)
      }
      #op22AppCardOverlay .op22-card{margin:0 auto}
      @media(max-width:560px){
        #op22AppCardOverlay{padding:10px}
        #op22AppCardOverlay .op22-app-shell{gap:8px}
        #op22AppCardOverlay .op22-app-actions{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);

    overlay=document.createElement('div');
    overlay.id='op22AppCardOverlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`
      <div class="op22-app-shell" role="dialog" aria-modal="true" aria-label="Carte de révision">
        <div class="op22-app-head">
          <div class="op22-app-head-text">
            <small>Carte de révision</small>
            <strong id="op22AppCardTitle">Technique</strong>
          </div>
          <button class="op22-app-close" type="button" aria-label="Fermer">×</button>
        </div>
        <div id="op22AppCardStage"></div>
        <div class="op22-app-actions">
          <button class="op22-app-secondary" type="button" id="op22AppFlipBtn">Retourner la carte</button>
          <button class="op22-app-secondary" type="button" id="op22AppTestBtn">Me tester · 4 questions</button>
          <button class="op22-app-primary" type="button" id="op22AppVideoBtn">Voir la vidéo</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.op22-app-close').addEventListener('click',closePremiumCard);
    overlay.addEventListener('click',e=>{
      if(e.target===overlay) closePremiumCard();
    });
    overlay.querySelector('#op22AppFlipBtn').addEventListener('click',()=>{
      overlay.querySelector('.op22-card')?.classList.toggle('is-flipped');
    });
    overlay.querySelector('#op22AppTestBtn').addEventListener('click',()=>{
      const id=currentTechniqueId;
      closePremiumCard();
      try{
        if(typeof window.go==='function') window.go('quiz');
        else if(typeof go==='function') go('quiz');
      }catch(_){}
      setTimeout(()=>{
        try{
          if(window.OSTEO_TESTER && typeof window.OSTEO_TESTER.startTechnique==='function'){
            window.OSTEO_TESTER.startTechnique(id);
          }
        }catch(_){}
      },30);
    });

    overlay.querySelector('#op22AppVideoBtn').addEventListener('click',()=>{
      const id=currentTechniqueId;
      closePremiumCard();
      try{
        if(typeof openTechnique === 'function') return openTechnique(id);
      }catch(_){}
      if(typeof window.openTechnique === 'function') window.openTechnique(id);
    });

    return overlay;
  }

  function normalizeCardTitle(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[’']/g,' ')
      .replace(/\benergie\s+musculaire\b/gi,' EM ')
      .replace(/\be\.?\s*m\.?\b/gi,' EM ')
      .replace(/[^a-zA-Z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function titleScore(a,b){
    const na=normalizeCardTitle(a);
    const nb=normalizeCardTitle(b);
    if(!na || !nb) return 0;
    if(na===nb) return 1000;
    if(na.includes(nb) || nb.includes(na)) return 900;

    const sa=new Set(na.split(' ').filter(Boolean));
    const sb=new Set(nb.split(' ').filter(Boolean));
    let common=0;
    sa.forEach(token=>{ if(sb.has(token)) common++; });
    return common / Math.max(sa.size,sb.size,1);
  }

  function resolveRef(t,premiumApi){
    if(!t) return null;

    // La recherche des techniques appartient au moteur V22 de base.
    // V22.2 ne fait que l'habillage graphique premium et le rendu.
    const baseApi=window.OSTEO_PLAYING_CARDS_V22;
    if(!baseApi) return null;

    let official=[];
    try{
      official=typeof baseApi.techniques==='function' ? baseApi.techniques() : [];
    }catch(_){
      official=[];
    }

    /*
      Le catalogue principal utilise videoSourceRow,
      la base des cartes utilise sourceRow.
      Dans le catalogue actuel, la correspondance est généralement :
      sourceRow = videoSourceRow - 1.
    */
    const videoRow=Number(t.videoSourceRow);
    const sourceRow=Number(t.sourceRow);

    const rowCandidates=[
      Number.isFinite(videoRow) && videoRow>1 ? videoRow-1 : 0,
      Number.isFinite(sourceRow) && sourceRow>0 ? sourceRow : 0,
      Number.isFinite(videoRow) && videoRow>0 ? videoRow : 0
    ].filter(Boolean);

    for(const row of rowCandidates){
      const hit=official.find(item=>Number(item?.sourceRow)===Number(row));
      if(hit) return hit;
    }

    // Slug explicite.
    if(t.slug){
      const hit=official.find(item=>String(item?.slug||'')===String(t.slug));
      if(hit) return hit;
      try{
        const found=baseApi.find(t.slug);
        if(found) return found;
      }catch(_){}
    }

    // Titre exact après normalisation.
    const exact=official.find(item=>
      normalizeCardTitle(item?.title)===normalizeCardTitle(t.title)
    );
    if(exact) return exact;

    // Meilleure correspondance dans la même zone/sous-zone.
    const sameArea=official.filter(item=>{
      const sameZone=!t.zone || !item?.zone || String(item.zone)===String(t.zone);
      const sameSub=!t.sub || !item?.sub || String(item.sub)===String(t.sub);
      return sameZone && sameSub;
    });

    const pool=sameArea.length ? sameArea : official;
    let best=null;
    let bestScore=0;

    for(const item of pool){
      const score=titleScore(t.title,item?.title);
      if(score>bestScore){
        best=item;
        bestScore=score;
      }
    }

    if(best && bestScore>=0.48) return best;

    // Dernier secours : moteur V22 natif.
    const candidates=[
      t.title,
      t.slug,
      Number.isFinite(videoRow) && videoRow>1 ? String(videoRow-1) : '',
      Number.isFinite(sourceRow) && sourceRow>0 ? String(sourceRow) : ''
    ].filter(Boolean);

    for(const ref of candidates){
      try{
        const found=baseApi.find(ref);
        if(found) return found;
      }catch(_){}
    }

    return null;
  }

  async function openPremiumCard(id){
    const t=getTechnique(id);

    if(!t){
      toastSafe('Technique introuvable');
      return;
    }

    if(!cleanIsTechniqueUnlocked(t)){
      toastSafe('Carte non débloquée');
      return;
    }

    let api;
    try{
      api=await ensureDependencies();
    }catch(err){
      console.warn('[Ostéo Pratik] Cartes V22.2 indisponibles',err);
      toastSafe('Carte V22.2 indisponible');
      return;
    }

    const ref=resolveRef(t,api);
    if(!ref){
      console.warn('[Ostéo Pratik] Correspondance V22.2 introuvable',t);
      toastSafe('Carte introuvable dans la base V22');
      return;
    }

    const overlay=ensureOverlay();
    const stage=overlay.querySelector('#op22AppCardStage');
    const title=overlay.querySelector('#op22AppCardTitle');

    currentTechniqueId=toId(t.id);
    if(title) title.textContent=t.title||'Technique';

    try{
      await api.render(ref,stage);
    }catch(err){
      console.warn('[Ostéo Pratik] Rendu carte V22.2 impossible',err);
      toastSafe('Impossible d’afficher la carte V22.2');
      return;
    }

    previousBodyOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
  }

  function closePremiumCard(){
    const overlay=document.getElementById('op22AppCardOverlay');
    if(!overlay) return;

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow=previousBodyOverflow||'';
    currentTechniqueId=null;
  }

  function installCardEntryPoints(){
    window.openPremiumRevisionCard=openPremiumCard;
    window.closePremiumRevisionCard=closePremiumCard;

    // Point d'entrée unique pour la roue et l'album.
    window.openFullCard=function(id){
      return openPremiumCard(id);
    };
    try{ openFullCard=window.openFullCard; }catch(_){}

    window.openSelectedWheelCard=function(){
      let t=null;
      try{
        if(typeof getSelectedWheelTechnique==='function') t=getSelectedWheelTechnique();
      }catch(_){}

      if(!t){
        toastSafe('Lancez d’abord la roue');
        return;
      }

      if(!cleanIsTechniqueUnlocked(t)){
        toastSafe('Carte non débloquée');
        return;
      }

      openPremiumCard(t.id);
    };
    try{ openSelectedWheelCard=window.openSelectedWheelCard; }catch(_){}
  }

  function refresh(){
    installCleanProgressLogic();
    installCleanupCSS();
    cleanupLegacyDom();
    wrapExistingRenderers();
    installCardEntryPoints();

    try{ if(typeof renderSeenCollections==='function') renderSeenCollections(); }catch(_){}
    try{ if(typeof renderRevisionWheel==='function') renderRevisionWheel(); }catch(_){}
    hydrateSeenCardThumbnails();
  }

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && document.getElementById('op22AppCardOverlay')?.classList.contains('is-open')){
      closePremiumCard();
    }
  });

  // Installation immédiate + quelques passages après les anciens patchs asynchrones.
  refresh();
  [100,400,1200].forEach(delay=>setTimeout(refresh,delay));

  // Précharge les cartes sans bloquer l'application.
  ensureDependencies().catch(err=>{
    console.warn('[Ostéo Pratik] Préchargement V22.2 différé',err);
  });


  /* === APP12 · SYNCHRONISATION MULTI-APPAREILS ===
     user-data-v19 récupère la progression du compte Supabase dans les
     clés STRICT/LEGACY. APP11 utilisait d'abord CLEAN : sur un nouvel
     appareil, CLEAN pouvait rester vide et bloquer les cartes malgré
     un compteur « Déjà vues » correct.
     Ici on fusionne automatiquement les IDs synchronisés du compte
     dans CLEAN, puis on redessine Collections / Roue / Stats.
  */
  let accountSyncBusy=false;

  function mergeAccountViewedIntoClean(){
    const clean = readArray(CLEAN_KEY) || [];
    const strict = readArray(STRICT_KEY) || [];
    const legacy = readArray(LEGACY_KEY) || [];

    // Une progression distante valide apparaît dans STRICT/LEGACY via V19.
    // On fusionne au lieu d'écraser pour ne jamais perdre une vue locale récente.
    const merged = uniqueValid([...clean,...strict,...legacy]);

    const before = JSON.stringify(uniqueValid(clean));
    const after = JSON.stringify(merged);

    if(before !== after){
      writeViewed(merged);
      syncTechniqueStatuses();

      try{ if(typeof renderTechniques==='function') renderTechniques(); }catch(_){}
      try{ if(typeof renderSeenCollections==='function') renderSeenCollections(); }catch(_){}
      try{ if(typeof renderSeenCards==='function') renderSeenCards(); }catch(_){}
      try{ if(typeof renderRevisionWheel==='function') renderRevisionWheel(); }catch(_){}
      try{ if(typeof updateZoneStats==='function') updateZoneStats(); }catch(_){}
      try{ if(typeof updateProgressZoneStats==='function') updateProgressZoneStats(); }catch(_){}
      hydrateSeenCardThumbnails();

      console.info('[Ostéo Pratik] Progression compte synchronisée :',merged.length,'technique(s) vue(s)');
    }

    return merged;
  }

  async function syncAccountViewed(){
    if(accountSyncBusy) return readViewed();
    accountSyncBusy=true;

    try{
      // Demande d'abord à la couche utilisateur de recharger la progression du compte.
      const userData=window.OSTEO_USER_DATA_V19;
      if(userData && typeof userData.reload==='function'){
        try{ await userData.reload(); }catch(_){}
      }

      // Laisse le temps aux écritures de compatibilité STRICT/LEGACY de se faire.
      await new Promise(resolve=>setTimeout(resolve,80));
      return mergeAccountViewedIntoClean();
    }finally{
      accountSyncBusy=false;
    }
  }

  // Plusieurs passages car l'authentification et Supabase chargent après l'interface.
  [250,700,1400,2600,4500].forEach(delay=>{
    setTimeout(()=>{
      mergeAccountViewedIntoClean();
      if(delay===1400 || delay===4500) syncAccountViewed();
    },delay);
  });

  // Re-synchronise aussi lors des événements utiles du compte / catalogue.
  window.addEventListener('osteo-central-data-loaded',()=>{
    setTimeout(syncAccountViewed,120);
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'){
      setTimeout(syncAccountViewed,120);
    }
  });

  window.OSTEO_REVISION_CARDS_V22_2={
    version:VERSION,
    open:openPremiumCard,
    close:closePremiumCard,
    ready:ensureDependencies,
    viewed:readViewed,
    syncAccount:syncAccountViewed,
    refresh
  };
})();


/* ==============================================================
   OSTÉO PRATIK — TESTER MES ACQUIS
   Version tester-1.0
   --------------------------------------------------------------
   Quiz généré automatiquement depuis les cartes V22 :
   - uniquement les techniques réellement vues
   - Position
   - Position des mains
   - Barrière motrice
   - Normalisation
   - jusqu'à 12 questions par session
   - erreurs mémorisées pour le futur mode "À revoir"
   ============================================================== */
(function(){
  'use strict';

  if(window.__osteoTesterV1Installed) return;
  window.__osteoTesterV1Installed = true;

  const VERSION='tester-1.0';
  const REVIEW_KEY='osteoPratikTechniqueReviewV1';
  const SESSION_KEY='osteoPratikTesterSessionV1';
  const LAST_QUIZ_KEY='osteoPratikLastQuiz';
  const STEP_ORDER=['position','mains','barriere','normalisation'];

  const STEP_LABELS={
    position:'Position',
    mains:'Position des mains',
    barriere:'Barrière motrice',
    normalisation:'Normalisation'
  };

  const STEP_QUESTIONS={
    position:'quelle proposition correspond à la position de départ ?',
    mains:'quelle proposition décrit correctement la position des mains ?',
    barriere:'quelle proposition correspond à la barrière motrice ?',
    normalisation:'quelle proposition correspond à la normalisation ?'
  };

  let sessionFilterZone='';
  let sessionTechniqueId=0;
  let sessionTechniqueTitle='';

  let session={
    questions:[],
    index:0,
    score:0,
    answered:false,
    answers:[]
  };

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function norm(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[’']/g,' ')
      .replace(/\benergie\s+musculaire\b/gi,' em ')
      .replace(/\be\.?\s*m\.?\b/gi,' em ')
      .replace(/[^a-zA-Z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function shuffle(values){
    const a=values.slice();
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function getTechniques(){
    try{
      if(typeof techniques!=='undefined' && Array.isArray(techniques)) return techniques;
    }catch(_){}
    return Array.isArray(window.techniques)?window.techniques:[];
  }

  function readViewedIds(){
    try{
      if(window.OSTEO_REVISION_CARDS_V22_2 &&
         typeof window.OSTEO_REVISION_CARDS_V22_2.viewed==='function'){
        return window.OSTEO_REVISION_CARDS_V22_2.viewed().map(Number).filter(Boolean);
      }
    }catch(_){}

    try{
      if(typeof readViewedTechniqueIds==='function'){
        return readViewedTechniqueIds().map(Number).filter(Boolean);
      }
    }catch(_){}

    try{
      const raw=localStorage.getItem('osteoPratikViewedTechniqueIdsCleanV1');
      const ids=raw?JSON.parse(raw):[];
      return Array.isArray(ids)?ids.map(Number).filter(Boolean):[];
    }catch(_){
      return [];
    }
  }

  function readReviewData(){
    try{
      const raw=localStorage.getItem(REVIEW_KEY);
      const data=raw?JSON.parse(raw):{};
      return data && typeof data==='object' ? data : {};
    }catch(_){
      return {};
    }
  }

  function writeReviewData(data){
    try{ localStorage.setItem(REVIEW_KEY,JSON.stringify(data)); }catch(_){}
  }

  function recordTechniqueResult(techniqueId,isCorrect){
    const id=String(Number(techniqueId)||'');
    if(!id) return;

    const data=readReviewData();
    const item=data[id] || {
      errors:0,
      successes:0,
      correctStreak:0,
      needsReview:false,
      updatedAt:null
    };

    if(isCorrect){
      item.successes=(Number(item.successes)||0)+1;
      item.correctStreak=(Number(item.correctStreak)||0)+1;
      if(item.correctStreak>=2) item.needsReview=false;
    }else{
      item.errors=(Number(item.errors)||0)+1;
      item.correctStreak=0;
      item.needsReview=true;
    }

    item.updatedAt=new Date().toISOString();
    data[id]=item;
    writeReviewData(data);
  }

  function waitForCards(timeout=12000){
    return new Promise((resolve,reject)=>{
      const started=Date.now();

      async function tick(){
        const base=window.OSTEO_PLAYING_CARDS_V22;
        if(base && typeof base.techniques==='function'){
          return resolve(base);
        }

        try{
          if(window.OSTEO_REVISION_CARDS_V22_2 &&
             typeof window.OSTEO_REVISION_CARDS_V22_2.ready==='function'){
            await window.OSTEO_REVISION_CARDS_V22_2.ready();
            if(window.OSTEO_PLAYING_CARDS_V22) return resolve(window.OSTEO_PLAYING_CARDS_V22);
          }
        }catch(_){}

        if(Date.now()-started>timeout){
          return reject(new Error('Base des cartes V22 indisponible'));
        }
        setTimeout(tick,80);
      }

      tick();
    });
  }

  function titleScore(a,b){
    const na=norm(a);
    const nb=norm(b);
    if(!na || !nb) return 0;
    if(na===nb) return 1000;
    if(na.includes(nb)||nb.includes(na)) return 900;

    const sa=new Set(na.split(' ').filter(Boolean));
    const sb=new Set(nb.split(' ').filter(Boolean));
    let common=0;
    sa.forEach(token=>{if(sb.has(token)) common++;});
    return common/Math.max(sa.size,sb.size,1);
  }

  function findOfficialTechnique(appTechnique,baseApi){
    if(!appTechnique || !baseApi) return null;

    let official=[];
    try{ official=baseApi.techniques()||[]; }catch(_){ official=[]; }

    const videoRow=Number(appTechnique.videoSourceRow);
    const sourceRow=Number(appTechnique.sourceRow);

    const rows=[
      Number.isFinite(videoRow)&&videoRow>1?videoRow-1:0,
      Number.isFinite(sourceRow)&&sourceRow>0?sourceRow:0,
      Number.isFinite(videoRow)&&videoRow>0?videoRow:0
    ].filter(Boolean);

    for(const row of rows){
      const hit=official.find(t=>Number(t?.sourceRow)===row);
      if(hit) return hit;
    }

    if(appTechnique.slug){
      const hit=official.find(t=>String(t?.slug||'')===String(appTechnique.slug));
      if(hit) return hit;
    }

    const exact=official.find(t=>norm(t?.title)===norm(appTechnique.title));
    if(exact) return exact;

    const sameArea=official.filter(t=>
      (!appTechnique.zone || !t?.zone || String(t.zone)===String(appTechnique.zone)) &&
      (!appTechnique.sub || !t?.sub || String(t.sub)===String(appTechnique.sub))
    );

    const pool=sameArea.length?sameArea:official;
    let best=null;
    let bestScore=0;

    pool.forEach(t=>{
      const score=titleScore(appTechnique.title,t?.title);
      if(score>bestScore){
        best=t;
        bestScore=score;
      }
    });

    return bestScore>=0.48?best:null;
  }

  function stepMap(t){
    const out={};
    (t?.detail?.steps||[]).forEach(s=>{
      if(s?.key) out[String(s.key).toLowerCase()]=s;
    });
    return out;
  }

  function patientPosition(text){
    const raw=String(text||'').replace(/\r/g,' ').replace(/\s+/g,' ').trim();
    if(!raw) return '';

    const patient=raw.match(/(?:PATIENT|SUJET)\s+(.+?)(?=\s+PRATICIEN\b|$)/i);
    if(patient && patient[1]) return patient[1].trim();

    return raw;
  }

  function concise(text,key,maxLen=185){
    let value=String(text||'').replace(/\r/g,' ').replace(/\s+/g,' ').trim();
    if(!value) return '';

    if(key==='position') value=patientPosition(value);

    value=value
      .replace(/^(?:PATIENT|SUJET|PRATICIEN)\s*/i,'')
      .replace(/\s+/g,' ')
      .trim();

    if(value.length<=maxLen) return value;

    const short=value.slice(0,maxLen);
    const last=Math.max(short.lastIndexOf('. '),short.lastIndexOf('; '),short.lastIndexOf(', '),short.lastIndexOf(' '));
    return (last>90?short.slice(0,last):short).trim()+'…';
  }

  function getStepAnswer(official,key){
    const steps=stepMap(official);
    return concise(steps[key]?.body||'',key);
  }

  function buildDistractors(correct,official,key,allOfficial){
    const preferred=allOfficial.filter(t=>
      t!==official &&
      t?.zone===official?.zone &&
      t?.sub===official?.sub
    );

    const secondary=allOfficial.filter(t=>
      t!==official &&
      t?.zone===official?.zone &&
      !preferred.includes(t)
    );

    const remaining=allOfficial.filter(t=>
      t!==official &&
      !preferred.includes(t) &&
      !secondary.includes(t)
    );

    const pool=[...shuffle(preferred),...shuffle(secondary),...shuffle(remaining)];
    const out=[];
    const used=new Set([norm(correct)]);

    for(const t of pool){
      const candidate=getStepAnswer(t,key);
      const n=norm(candidate);
      if(!candidate || !n || used.has(n)) continue;
      used.add(n);
      out.push(candidate);
      if(out.length===3) break;
    }

    return out;
  }

  function buildQuestion(appTechnique,official,key,allOfficial){
    const correctAnswer=getStepAnswer(official,key);
    if(!correctAnswer) return null;

    const distractors=buildDistractors(correctAnswer,official,key,allOfficial);
    if(distractors.length<3) return null;

    const options=shuffle([
      {text:correctAnswer,correct:true},
      ...distractors.map(text=>({text,correct:false}))
    ]);

    const correct=options.findIndex(o=>o.correct);

    return {
      id:'tech_'+String(appTechnique.id)+'_'+key,
      techniqueId:Number(appTechnique.id),
      techniqueTitle:String(appTechnique.title||official.title||'Technique'),
      category:STEP_LABELS[key],
      key,
      question:'Pour « '+String(appTechnique.title||official.title||'cette technique')+' », '+STEP_QUESTIONS[key],
      answers:options.map(o=>o.text),
      correct,
      explanation:correctAnswer
    };
  }

  async function buildQuestions(zoneFilter=''){
    const baseApi=await waitForCards();
    const allOfficial=baseApi.techniques()||[];
    const viewed=new Set(readViewedIds());

    const viewedTechniques=getTechniques().filter(t=>
      viewed.has(Number(t.id)) &&
      (!zoneFilter || String(t.zone||'')===String(zoneFilter))
    );
    const questions=[];

    viewedTechniques.forEach(appTechnique=>{
      const official=findOfficialTechnique(appTechnique,baseApi);
      if(!official) return;

      STEP_ORDER.forEach(key=>{
        const q=buildQuestion(appTechnique,official,key,allOfficial);
        if(q) questions.push(q);
      });
    });

    return shuffle(questions).slice(0,12);
  }

  function updateStaticQuizCopy(zoneFilter=''){
    const title=document.querySelector('#quiz .quiz-general-title h1');
    const sub=document.querySelector('#quiz .quiz-general-title p');
    const headerSub=document.getElementById('quizSubtitle');

    if(zoneFilter==='__GENERAL__'){
      if(title) title.textContent='Quiz général — Ostéopathie';
      if(sub) sub.textContent='Bases, principes et culture ostéopathique';
      if(headerSub) headerSub.textContent='Ostéopathie générale';
      return;
    }

    if(String(zoneFilter).startsWith('__TECHNIQUE__:')){
      if(title) title.textContent='Me tester sur cette technique';
      if(sub) sub.textContent=sessionTechniqueTitle || '4 questions sur la carte';
      if(headerSub) headerSub.textContent='4 questions · une technique';
      return;
    }

    if(title) title.textContent=zoneFilter ? 'Quiz '+zoneFilter : 'Quiz de mes techniques vues';
    if(sub) sub.textContent=zoneFilter
      ? 'Uniquement parmi mes techniques déjà vues'
      : 'Toutes mes techniques déjà vues';
    if(headerSub) headerSub.textContent=zoneFilter || 'Techniques vues';
  }

  function setResultDenominator(total){
    const span=document.querySelector('#quizResult .quiz-result-score span');
    if(span) span.textContent='/ '+total;
  }

  function showEmptyQuiz(){
    updateStaticQuizCopy(sessionFilterZone);

    const card=document.querySelector('#quiz .quiz-general-card');
    const result=document.getElementById('quizResult');
    const feedback=document.getElementById('quizFeedback');
    const question=document.getElementById('quizQuestionText');
    const answers=document.getElementById('quizAnswers');
    const counter=document.getElementById('quizQuestionCounter');
    const category=document.getElementById('quizQuestionCategory');
    const progress=document.getElementById('quizProgressBar');

    if(card) card.style.display='block';
    if(result) result.style.display='none';
    if(feedback) feedback.style.display='none';
    if(counter) counter.textContent='Aucune question';
    if(category) category.textContent='À débloquer';
    if(question) question.textContent='Regardez d’abord une technique en entier pour débloquer le quiz.';
    if(answers){
      answers.innerHTML=`<button class="quiz-answer-button" type="button" onclick="go('videoMap')"><span>▶</span><strong>Voir les techniques</strong></button>`;
    }
    if(progress) progress.style.width='0%';
  }

  function renderTesterQuiz(){
    updateStaticQuizCopy(sessionFilterZone);

    if(!session.questions.length){
      showEmptyQuiz();
      return;
    }

    const q=session.questions[session.index];
    if(!q) return;

    session.answered=false;

    const card=document.querySelector('#quiz .quiz-general-card');
    const result=document.getElementById('quizResult');
    const feedback=document.getElementById('quizFeedback');
    const subtitle=document.getElementById('quizSubtitle');
    const counter=document.getElementById('quizQuestionCounter');
    const category=document.getElementById('quizQuestionCategory');
    const question=document.getElementById('quizQuestionText');
    const answers=document.getElementById('quizAnswers');
    const progress=document.getElementById('quizProgressBar');

    if(card) card.style.display='block';
    if(result) result.style.display='none';
    if(feedback) feedback.style.display='none';
    if(subtitle) subtitle.textContent='Question '+(session.index+1)+' / '+session.questions.length;
    if(counter) counter.textContent='Question '+(session.index+1)+' / '+session.questions.length;
    if(category) category.textContent=q.category;
    if(question) question.textContent=q.question;
    if(progress) progress.style.width=((session.index/session.questions.length)*100)+'%';

    if(answers){
      answers.innerHTML=q.answers.map((answer,i)=>
        '<button class="quiz-answer-button" onclick="answerGeneralQuiz('+i+')">'+
          '<span>'+String.fromCharCode(65+i)+'</span>'+
          '<strong>'+esc(answer)+'</strong>'+
        '</button>'
      ).join('');
    }

    setResultDenominator(session.questions.length);
  }

  function answerTesterQuiz(answerIndex){
    if(session.answered) return;

    const q=session.questions[session.index];
    if(!q) return;

    session.answered=true;

    const isCorrect=Number(answerIndex)===Number(q.correct);
    if(isCorrect) session.score++;

    recordTechniqueResult(q.techniqueId,isCorrect);

    session.answers.push({
      questionId:q.id,
      techniqueId:q.techniqueId,
      correct:isCorrect,
      selected:Number(answerIndex),
      expected:Number(q.correct)
    });

    const buttons=document.querySelectorAll('#quizAnswers .quiz-answer-button');
    buttons.forEach((btn,i)=>{
      btn.disabled=true;
      if(i===q.correct) btn.classList.add('right');
      if(i===Number(answerIndex) && !isCorrect) btn.classList.add('wrong');
    });

    const feedback=document.getElementById('quizFeedback');
    const title=document.getElementById('quizFeedbackTitle');
    const text=document.getElementById('quizFeedbackText');
    const next=document.getElementById('quizNextButton');

    if(feedback) feedback.style.display='block';
    if(title) title.textContent=isCorrect?'Bonne réponse !':'À revoir';
    if(text){
      text.textContent=isCorrect
        ? q.explanation
        : 'Réponse correcte : '+q.explanation;
    }
    if(next){
      next.textContent=session.index===session.questions.length-1
        ? 'Voir le résultat'
        : 'Question suivante';
    }

    try{
      localStorage.setItem(SESSION_KEY,JSON.stringify({
        index:session.index,
        score:session.score,
        total:session.questions.length,
        answers:session.answers,
        date:new Date().toISOString()
      }));
    }catch(_){}
  }

  function nextTesterQuiz(){
    if(!session.questions.length) return;

    if(session.index<session.questions.length-1){
      session.index++;
      renderTesterQuiz();
      const quiz=document.getElementById('quiz');
      if(quiz) quiz.scrollTop=0;
    }else{
      finishTesterQuiz();
    }
  }

  function finishTesterQuiz(){
    if(!session.questions.length){
      showEmptyQuiz();
      return;
    }

    const total=session.questions.length;
    const percent=Math.round((session.score/total)*100);
    const wrongIds=[...new Set(
      session.answers
        .filter(a=>!a.correct)
        .map(a=>Number(a.techniqueId))
        .filter(Boolean)
    )];

    const card=document.querySelector('#quiz .quiz-general-card');
    const feedback=document.getElementById('quizFeedback');
    const result=document.getElementById('quizResult');
    const score=document.getElementById('quizFinalScore');
    const title=document.getElementById('quizResultTitle');
    const text=document.getElementById('quizResultText');
    const progress=document.getElementById('quizProgressBar');

    if(card) card.style.display='none';
    if(feedback) feedback.style.display='none';
    if(result) result.style.display='block';
    if(score) score.textContent=session.score;
    if(progress) progress.style.width='100%';
    setResultDenominator(total);

    if(title){
      title.textContent=percent>=80?'Très bon niveau':percent>=60?'Bonne base':'À renforcer';
    }

    if(text){
      text.textContent='Score : '+session.score+' / '+total+' soit '+percent+' %. '+
        (wrongIds.length
          ? wrongIds.length+' technique'+(wrongIds.length>1?'s':'')+' à revoir.'
          : 'Toutes les réponses sont justes.');
    }

    try{
      localStorage.setItem(LAST_QUIZ_KEY,JSON.stringify({
        category:'techniques',
        score:session.score,
        total,
        percent,
        wrongTechniqueIds:wrongIds,
        techniqueIds:[...new Set(session.questions.map(q=>q.techniqueId))],
        date:new Date().toISOString()
      }));
    }catch(_){}

    try{
      if(typeof updateQuizStats==='function') updateQuizStats();
    }catch(_){}
  }

  async function startTechniqueQuiz(techniqueId){
    const id=Number(techniqueId)||0;
    const appTechnique=getTechniques().find(t=>Number(t?.id)===id) || null;

    if(!appTechnique){
      console.warn('[Ostéo Pratik] Technique introuvable pour le quiz',techniqueId);
      return;
    }

    const viewed=new Set(readViewedIds());
    if(!viewed.has(id)){
      console.warn('[Ostéo Pratik] Technique non vue : quiz refusé',id);
      return;
    }

    sessionTechniqueId=id;
    sessionTechniqueTitle=String(appTechnique.title||'Technique');
    sessionFilterZone='__TECHNIQUE__:'+id;
    updateStaticQuizCopy(sessionFilterZone);

    try{
      const baseApi=await waitForCards();
      const allOfficial=baseApi.techniques()||[];
      const official=findOfficialTechnique(appTechnique,baseApi);

      if(!official){
        throw new Error('Fiche officielle introuvable');
      }

      const questions=STEP_ORDER
        .map(key=>buildQuestion(appTechnique,official,key,allOfficial))
        .filter(Boolean);

      /*
        Une carte pédagogique doit produire exactement quatre questions :
        Position, mains, barrière motrice, normalisation.
      */
      if(questions.length!==4){
        throw new Error('Les 4 rubriques de la carte ne sont pas disponibles');
      }

      session={
        questions,
        index:0,
        score:0,
        answered:false,
        answers:[]
      };

      renderTesterQuiz();
    }catch(err){
      console.warn('[Ostéo Pratik] Quiz de carte',err);
      try{
        if(typeof toast==='function'){
          toast('Quiz indisponible pour cette carte');
        }else if(typeof window.toast==='function'){
          window.toast('Quiz indisponible pour cette carte');
        }
      }catch(_){}
    }
  }

  function readGeneralOsteopathyBank(){
    let bank=[];

    try{
      if(Array.isArray(window.OSTEO_QUESTION_BANK)){
        bank=window.OSTEO_QUESTION_BANK.filter(q=>
          String(q?.zone||'')==='Général' &&
          (!q?.status || String(q.status)==='publie')
        );
      }
    }catch(_){}

    // Secours : ancien quiz général embarqué dans index.html.
    if(!bank.length){
      try{
        if(typeof generalQuizQuestions!=='undefined' && Array.isArray(generalQuizQuestions)){
          bank=generalQuizQuestions
            .filter(q=>String(q?.id||'').startsWith('general_'))
            .map(q=>({
              id:q.id,
              code:q.id,
              zone:'Général',
              category:q.category||'Général',
              question:q.question,
              answers:Array.isArray(q.answers)?q.answers.slice(0,4):[],
              correct:Number(q.correct)||0,
              explanation:q.explanation||''
            }));
        }
      }catch(_){}
    }

    return bank;
  }

  function mapGeneralQuestion(q,index){
    const answers=Array.isArray(q?.answers)?q.answers.slice(0,4):[];
    if(answers.length!==4) return null;

    const correct=Number(q?.correct);
    if(!Number.isInteger(correct) || correct<0 || correct>3) return null;

    return {
      id:String(q?.code||q?.id||('general_'+(index+1))),
      techniqueId:0,
      techniqueTitle:'Ostéopathie générale',
      category:String(q?.category||'Général'),
      key:'general',
      question:String(q?.question||''),
      answers:answers.map(String),
      correct,
      explanation:String(q?.explanation||answers[correct]||'')
    };
  }

  async function waitForGeneralBank(timeout=3500){
    const started=Date.now();

    while(Date.now()-started<timeout){
      const bank=readGeneralOsteopathyBank();
      if(bank.length>=15) return bank;
      await new Promise(r=>setTimeout(r,100));
    }

    return readGeneralOsteopathyBank();
  }

  async function startGeneralOsteopathySession(){
    sessionTechniqueId=0;
    sessionTechniqueTitle='';
    sessionFilterZone='__GENERAL__';
    updateStaticQuizCopy(sessionFilterZone);

    try{
      const bank=await waitForGeneralBank();
      const questions=shuffle(
        bank.map(mapGeneralQuestion).filter(Boolean)
      ).slice(0,15);

      session={
        questions,
        index:0,
        score:0,
        answered:false,
        answers:[]
      };

      if(!questions.length){
        const q=document.getElementById('quizQuestionText');
        const a=document.getElementById('quizAnswers');
        const c=document.getElementById('quizQuestionCounter');
        const cat=document.getElementById('quizQuestionCategory');
        if(c) c.textContent='Quiz indisponible';
        if(cat) cat.textContent='Général';
        if(q) q.textContent='La banque du quiz général n’est pas encore disponible.';
        if(a) a.innerHTML='';
        return;
      }

      renderTesterQuiz();
    }catch(err){
      console.warn('[Ostéo Pratik] Quiz général',err);
    }
  }

  async function startTesterSession(zoneFilter=''){
    sessionTechniqueId=0;
    sessionTechniqueTitle='';
    sessionFilterZone=String(zoneFilter||'');
    updateStaticQuizCopy(sessionFilterZone);

    try{
      session={
        questions:await buildQuestions(sessionFilterZone),
        index:0,
        score:0,
        answered:false,
        answers:[]
      };
      renderTesterQuiz();
    }catch(err){
      console.warn('[Ostéo Pratik] Tester',err);
      showEmptyQuiz();
    }
  }

  function restartTesterQuiz(){
    if(String(sessionFilterZone).startsWith('__TECHNIQUE__:') && sessionTechniqueId){
      startTechniqueQuiz(sessionTechniqueId);
    }else if(sessionFilterZone==='__GENERAL__'){
      startGeneralOsteopathySession();
    }else{
      startTesterSession(sessionFilterZone);
    }
  }

  function installOverrides(){
    window.renderGeneralQuiz=renderTesterQuiz;
    window.answerGeneralQuiz=answerTesterQuiz;
    window.nextGeneralQuiz=nextTesterQuiz;
    window.finishGeneralQuiz=finishTesterQuiz;
    window.restartGeneralQuiz=restartTesterQuiz;

    try{ renderGeneralQuiz=renderTesterQuiz; }catch(_){}
    try{ answerGeneralQuiz=answerTesterQuiz; }catch(_){}
    try{ nextGeneralQuiz=nextTesterQuiz; }catch(_){}
    try{ finishGeneralQuiz=finishTesterQuiz; }catch(_){}
    try{ restartGeneralQuiz=restartTesterQuiz; }catch(_){}

    if(!window.__osteoTesterGoWrapped){
      const previous=typeof window.go==='function'?window.go:null;
      if(previous){
        window.__osteoTesterGoWrapped=true;
        window.go=function(id){
          return previous.apply(this,arguments);
        };
        try{ go=window.go; }catch(_){}
      }
    }
  }

  installOverrides();

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      installOverrides();
      startTesterSession();
    },{once:true});
  }else{
    startTesterSession();
  }

  // Réinstalle les overrides après les derniers patchs asynchrones éventuels.
  [150,600,1500].forEach(delay=>setTimeout(installOverrides,delay));

  window.OSTEO_TESTER={
    version:VERSION,
    start:startTesterSession,
    startZone:startTesterSession,
    startGeneral:startGeneralOsteopathySession,
    startTechnique:startTechniqueQuiz,
    restart:restartTesterQuiz,
    viewedIds:readViewedIds,
    readReviewData
  };
})();


/* ==============================================================
   OSTÉO PRATIK — MENU TESTER LIÉ À « DÉJÀ VUES »
   Version tester-menu-2.0
   --------------------------------------------------------------
   - Toutes les techniques : uniquement les techniques vues
   - Rachis / Bassin / Membres supérieurs / Membres inférieurs
   - Une zone sans technique vue reste indisponible
   - Le nombre de questions dépend du nombre de techniques vues
   ============================================================== */
(function(){
  'use strict';

  if(window.__osteoTesterSeenMenuV2) return;
  window.__osteoTesterSeenMenuV2=true;

  const ZONES=[
    {key:'', label:'Toutes les techniques', short:'Toutes les zones', color:'#ffb020'},
    {key:'Rachis', label:'Quiz Rachis', short:'Rachis', color:'#00e5ff'},
    {key:'Bassin', label:'Quiz Bassin', short:'Bassin', color:'#ff9f43'},
    {key:'Membres supérieurs', label:'Quiz Membres supérieurs', short:'Membres supérieurs', color:'#a855ff'},
    {key:'Membres inférieurs', label:'Quiz Membres inférieurs', short:'Membres inférieurs', color:'#00e6a7'}
  ];

  function toastSafe(message){
    try{
      if(typeof toast==='function') return toast(message);
      if(typeof window.toast==='function') return window.toast(message);
    }catch(_){}
  }

  function appGo(id){
    try{
      if(typeof window.go==='function') return window.go(id);
      if(typeof go==='function') return go(id);
    }catch(_){}
  }

  function getTechniques(){
    try{
      if(typeof techniques!=='undefined' && Array.isArray(techniques)) return techniques;
    }catch(_){}
    return Array.isArray(window.techniques)?window.techniques:[];
  }

  function viewedIds(){
    try{
      if(window.OSTEO_TESTER && typeof window.OSTEO_TESTER.viewedIds==='function'){
        return window.OSTEO_TESTER.viewedIds().map(Number).filter(Boolean);
      }
    }catch(_){}

    try{
      if(window.OSTEO_REVISION_CARDS_V22_2 &&
         typeof window.OSTEO_REVISION_CARDS_V22_2.viewed==='function'){
        return window.OSTEO_REVISION_CARDS_V22_2.viewed().map(Number).filter(Boolean);
      }
    }catch(_){}

    return [];
  }

  function viewedTechniques(zone=''){
    const seen=new Set(viewedIds());
    return getTechniques().filter(t=>
      seen.has(Number(t.id)) &&
      (!zone || String(t.zone||'')===String(zone))
    );
  }

  function possibleQuestionCount(zone=''){
    return Math.min(12,viewedTechniques(zone).length*4);
  }

  function ensureMenu(){
    let menu=document.getElementById('quizMenu');
    if(!menu){
      menu=document.createElement('section');
      menu.id='quizMenu';
      menu.className='screen quiz-menu-screen';
      const quiz=document.getElementById('quiz');
      if(quiz?.parentNode) quiz.parentNode.insertBefore(menu,quiz);
      else document.body.appendChild(menu);
    }

    if(!document.getElementById('opTesterSeenMenuStyles')){
      const style=document.createElement('style');
      style.id='opTesterSeenMenuStyles';
      style.textContent=`
        #quizMenu .op-tester-summary{
          margin:12px 0 14px;padding:16px 18px;border-radius:24px;
          border:1px solid rgba(0,229,255,.22);
          background:linear-gradient(145deg,rgba(10,29,55,.86),rgba(5,15,31,.92))
        }
        #quizMenu .op-tester-summary h1{margin:0;color:#fff;font-size:30px;line-height:1.05}
        #quizMenu .op-tester-summary p{margin:7px 0 0;color:#b8c4d8;font-size:14px;line-height:1.35}
        #quizMenu .op-tester-seen-count{
          margin-top:11px;display:inline-flex;align-items:center;min-height:30px;padding:0 11px;
          border-radius:999px;border:1px solid rgba(0,229,255,.30);color:#35e4ff;
          background:rgba(0,229,255,.07);font-weight:900;font-size:12px
        }
        #quizMenu .op-tester-grid{display:grid;gap:12px}
        #quizMenu .op-tester-card{
          position:relative;min-height:104px;padding:15px 62px 15px 76px;
          border-radius:22px;text-align:left;border:1px solid var(--qc);
          color:var(--qc);background:linear-gradient(145deg,rgba(10,29,55,.82),rgba(5,15,31,.92))
        }
        #quizMenu .op-tester-card strong{display:block;color:#fff;font-size:18px;line-height:1.15}
        #quizMenu .op-tester-card small{display:block;margin-top:6px;color:#c2ccdc;font-size:12px}
        #quizMenu .op-tester-card .op-q-icon{
          position:absolute;left:14px;top:50%;transform:translateY(-50%);
          width:48px;height:48px;border-radius:50%;display:grid;place-items:center;
          border:1px solid currentColor;font-weight:950
        }
        #quizMenu .op-tester-card em{
          position:absolute;right:14px;top:50%;transform:translateY(-50%);
          min-width:36px;height:36px;padding:0 8px;border-radius:999px;display:grid;place-items:center;
          font-style:normal;border:1px solid currentColor;font-weight:950;background:rgba(4,14,30,.72)
        }
        #quizMenu .op-tester-card.disabled{opacity:.40}
      `;
      document.head.appendChild(style);
    }

    return menu;
  }

  function renderMenu(){
    const menu=ensureMenu();
    const allViewed=viewedTechniques();
    const allQuestions=possibleQuestionCount();

    menu.style.display='';
    menu.removeAttribute('aria-hidden');

    menu.innerHTML=`
      <header class="top">
        <button class="icon round" type="button" data-op-tester-back>‹</button>
        <div class="brand">
          <h1 class="logo">Tester</h1>
          <p class="subtitle">Quiz général et techniques vues</p>
        </div>
        <button class="icon" type="button" data-op-tester-refresh>↻</button>
      </header>

      <div class="op-tester-summary">
        <h1>Tester mes acquis</h1>
        <p>Choisissez entre les connaissances générales en ostéopathie et vos techniques déjà visionnées.</p>
        <span class="op-tester-seen-count">
          ${allViewed.length} technique${allViewed.length>1?'s':''} déjà vue${allViewed.length>1?'s':''}
          · ${allQuestions} question${allQuestions>1?'s':''} technique${allQuestions>1?'s':''} possible${allQuestions>1?'s':''}
        </span>
      </div>

      <div class="op-tester-grid">
        <button class="op-tester-card"
                style="--qc:#ffb020"
                type="button"
                data-op-general="1">
          <span class="op-q-icon">15</span>
          <strong>Quiz général — Ostéopathie</strong>
          <small>Bases, principes et culture ostéopathique</small>
          <em>${(()=>{
            try{
              return Array.isArray(window.OSTEO_QUESTION_BANK)
                ? window.OSTEO_QUESTION_BANK.filter(q=>String(q?.zone||'')==='Général').length
                : 15;
            }catch(_){ return 15; }
          })()}</em>
        </button>

        <div style="margin:6px 2px 0;color:#c8d4e7;font-size:13px;font-weight:900;">
          Mes techniques déjà vues
        </div>
        ${ZONES.map(zone=>{
          const n=viewedTechniques(zone.key).length;
          const q=possibleQuestionCount(zone.key);
          const disabled=n===0;
          return `
            <button class="op-tester-card ${disabled?'disabled':''}"
                    style="--qc:${zone.color}"
                    type="button"
                    data-op-zone="${zone.key}">
              <span class="op-q-icon">${q}</span>
              <strong>${zone.label}</strong>
              <small>${n} technique${n>1?'s':''} déjà vue${n>1?'s':''}</small>
              <em>${n}</em>
            </button>
          `;
        }).join('')}
      </div>
    `;

    menu.querySelector('[data-op-tester-back]').onclick=()=>appGo('home');
    menu.querySelector('[data-op-tester-refresh]').onclick=()=>renderMenu();

    const generalButton=menu.querySelector('[data-op-general]');
    if(generalButton){
      generalButton.onclick=()=>{
        const quizBack=document.querySelector('#quiz .top .icon.round');
        if(quizBack){
          quizBack.setAttribute('onclick',"window.OSTEO_TESTER_MENU(); return false;");
        }

        appGo('quiz');

        if(window.OSTEO_TESTER && typeof window.OSTEO_TESTER.startGeneral==='function'){
          setTimeout(()=>window.OSTEO_TESTER.startGeneral(),30);
        }
      };
    }

    menu.querySelectorAll('[data-op-zone]').forEach(button=>{
      button.onclick=()=>{
        const zone=button.dataset.opZone||'';
        const n=viewedTechniques(zone).length;

        if(!n){
          toastSafe('Aucune technique déjà vue dans cette zone.');
          return;
        }

        const quizBack=document.querySelector('#quiz .top .icon.round');
        if(quizBack){
          quizBack.setAttribute('onclick',"window.OSTEO_TESTER_MENU(); return false;");
        }

        appGo('quiz');

        if(window.OSTEO_TESTER && typeof window.OSTEO_TESTER.startZone==='function'){
          setTimeout(()=>window.OSTEO_TESTER.startZone(zone),30);
        }
      };
    });
  }

  function showMenu(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }

    renderMenu();
    appGo('quizMenu');
    return false;
  }

  /*
    L'ancien bridge a attaché des listeners aux boutons Tester.
    On clone ces boutons : le clone garde le graphisme mais perd les anciens listeners.
  */
  function rewireTesterEntries(){
    document.querySelectorAll('[data-quiz-menu-intercepted="1"]').forEach(old=>{
      if(old.dataset.opTesterRewired==='1') return;

      const clone=old.cloneNode(true);
      clone.removeAttribute('data-quiz-menu-intercepted');
      clone.dataset.opTesterRewired='1';
      clone.removeAttribute('onclick');
      clone.addEventListener('click',showMenu);
      old.replaceWith(clone);
    });

    // Sécurité pour le bouton principal d'accueil.
    document.querySelectorAll('.home-orbit .orbit-card.quiz').forEach(btn=>{
      if(btn.dataset.opTesterRewired==='1') return;
      btn.removeAttribute('onclick');
      btn.dataset.opTesterRewired='1';
      btn.addEventListener('click',showMenu);
    });
  }

  // L'ancien #quizMenu peut être rerendu par le bridge : on le remplace à chaque ouverture.
  window.showQuizMenuV9=showMenu;
  window.OSTEO_TESTER_MENU=showMenu;

  function install(){
    rewireTesterEntries();
    renderMenu();
  }

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  [100,500,1300].forEach(ms=>setTimeout(()=>{
    rewireTesterEntries();
  },ms));

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'){
      setTimeout(rewireTesterEntries,30);
    }
  });
})();


/* ==============================================================
   OSTÉO PRATIK — APP11 · CARTE PLEINE IMAGE
   --------------------------------------------------------------
   Dans « Déjà vues », aucune action ne réduit la vignette.
   « Me tester · 4 questions » reste uniquement dans la carte
   V22.2 ouverte en grand.
   ============================================================== */
(function(){
  'use strict';

  function cleanSeenCardButtons(){
    document.querySelectorAll('#seenCardGrid .op-card-test-button')
      .forEach(btn=>btn.remove());
  }

  function install(){
    cleanSeenCardButtons();

    try{
      if(typeof renderSeenCards==='function' && !renderSeenCards.__op11CleanWrapped){
        const original=renderSeenCards;
        const wrapped=function(){
          const result=original.apply(this,arguments);
          cleanSeenCardButtons();
          setTimeout(cleanSeenCardButtons,40);
          return result;
        };
        wrapped.__op11CleanWrapped=true;
        renderSeenCards=wrapped;
        window.renderSeenCards=wrapped;
      }
    }catch(_){}
  }

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  [100,400,1000].forEach(ms=>setTimeout(install,ms));
})();
