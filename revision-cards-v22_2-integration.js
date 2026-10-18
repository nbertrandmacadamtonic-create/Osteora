/* ==============================================================
   OSTÉO PRATIK — RÉVISION PROPRE + CARTES V22.2
   Version 22.2-app-2
   --------------------------------------------------------------
   - supprime les anciens déblocages de démonstration 12 / 401
   - source unique : techniques réellement visionnées
   - roue = uniquement techniques réellement vues
   - album Déjà vues = mêmes techniques
   - supprime l'ancien bouton orange C2-C6 et l'ancien texte de test
   - empêche l'ancienne carte orange de se rouvrir
   - ouvre exclusivement la carte V22.2 Premium
   ============================================================== */
(function(){
  'use strict';

  const VERSION = '22.2-app-2';

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

  function wrapExistingRenderers(){
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

  function resolveRef(t,api){
    const candidates=[
      t?.slug,
      t?.sourceRow,
      t?.title,
      String(t?.id??'')
    ].filter(v=>v!==undefined && v!==null && String(v).trim());

    for(const ref of candidates){
      try{
        if(api?.find?.(ref)) return ref;
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
      toastSafe('Carte V22.2 introuvable pour cette technique');
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

  window.OSTEO_REVISION_CARDS_V22_2={
    version:VERSION,
    open:openPremiumCard,
    close:closePremiumCard,
    ready:ensureDependencies,
    viewed:readViewed,
    refresh
  };
})();
