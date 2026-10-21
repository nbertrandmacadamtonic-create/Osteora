/* ==============================================================
   OSTÉO PRATIK — RÉVISION PROPRE + CARTES V22.2
  Version 22.2-app-42
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

  const VERSION = '22.2-app-42';

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

  function accountViewedIds(){
    const api=window.OSTEO_USER_DATA_V19;
    if(!api || typeof api.isViewed!=='function') return null;
    return uniqueValid(getTechniques()
      .filter(t=>{
        try{ return !!api.isViewed(t.id); }catch(_){ return false; }
      })
      .map(t=>t.id));
  }

  function readViewed(){
    // Une fois user-data chargé, Supabase est l'unique source de vérité.
    const account=accountViewedIds();
    if(account) return writeViewed(account);

    const clean = readArray(CLEAN_KEY);
    if(clean) return writeViewed(clean);

    const strict = readArray(STRICT_KEY) || [];
    const legacy = readArray(LEGACY_KEY) || [];

    // Première migration seulement : retire les anciens déblocages de démonstration.
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
    if(!t) return false;
    const api=window.OSTEO_USER_DATA_V19;
    if(api && typeof api.isViewed==='function'){
      try{ return !!api.isViewed(t.id); }catch(_){}
    }
    return viewedSet().has(toId(t.id));
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
    syncWheelUnlockedLabel();
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

  function syncWheelUnlockedLabel(){
    const count = document.getElementById('wheelCount');
    if(!count) return;

    // Même source que la roue et l'album « Déjà vues ».
    const total = cleanViewedTechniquesForWheel().length;
    count.textContent = total + (total === 1
      ? ' technique débloquée'
      : ' techniques débloquées');
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
          const result = original.apply(this,arguments);
          syncWheelUnlockedLabel();
          return result;
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

  function fitMainCardPhoto(stage){
    if(!stage) return;
    const apply=()=>{
      const card=stage.querySelector('.op22-card');
      if(!card) return;
      const images=[...card.querySelectorAll('img')].filter(img=>
        !img.closest('.op22-card-back,[class*="back"],[class*="verso"]')
      );
      images.forEach(img=>img.classList.remove('op-app-main-card-photo'));
      let main=null;
      let bestArea=0;
      images.forEach(img=>{
        const rect=img.getBoundingClientRect();
        const displayed=Math.max(0,rect.width*rect.height);
        const natural=Math.max(0,(img.naturalWidth||0)*(img.naturalHeight||0));
        const area=displayed||natural;
        if(area>bestArea){bestArea=area;main=img;}
      });
      if(main) main.classList.add('op-app-main-card-photo');
    };
    apply();
    setTimeout(apply,80);
    setTimeout(apply,320);
    stage.querySelectorAll('img').forEach(img=>{
      if(!img.complete) img.addEventListener('load',apply,{once:true});
    });
  }

  function decorateElectricCard(stage,technique){
    const card=stage?.querySelector('.op22-card');
    if(!card) return;
    const zone=String(technique?.zone||'').toLocaleLowerCase('fr');
    let color='#39e7ff';
    let rgb='57,231,255';
    if(zone.includes('supérieur')){color='#b46cff';rgb='180,108,255';}
    else if(zone.includes('inférieur')){color='#ff9f43';rgb='255,159,67';}
    else if(zone.includes('bassin')){color='#39e6ad';rgb='57,230,173';}
    card.style.setProperty('--op-card-electric',color);
    card.style.setProperty('--op-card-electric-rgb',rgb);
    card.classList.add('op-app-electric-card');

    const front=card.querySelector(
      '.op22-card-front,.op22-front,[class*="card-front"],[class*="face-front"],.op22-card-face:not(.op22-card-back):not([class*="back"])'
    );
    if(!front) return;
    front.classList.add('op-app-electric-front');
    if(!front.querySelector(':scope > .op-app-electric-layer')){
      const layer=document.createElement('span');
      layer.className='op-app-electric-layer';
      layer.setAttribute('aria-hidden','true');
      front.appendChild(layer);
    }
  }

  function cleanCardBackMetadata(stage){
    if(!stage) return;
    const apply=()=>{
      const back=stage.querySelector(
        '.op22-card-back,.op22-back,[class*="card-back"],[class*="face-back"],[class*="verso"]'
      );
      if(!back) return;
      [...back.querySelectorAll('*')].forEach(node=>{
        if(node.children.length) return;
        const text=String(node.textContent||'').replace(/\s+/g,' ').trim();
        const isCode=/^[A-ZÀ-Ü]{1,4}\s*[-–]?\s*\d{1,3}$/i.test(text);
        const isMethod=/^(thrust|snap|énergie musculaire|energie musculaire)$/i.test(text);
        if(isCode||isMethod){
          node.classList.add('op-app-back-meta-hidden');
          node.setAttribute('aria-hidden','true');
        }
      });
    };
    apply();
    setTimeout(apply,80);
    setTimeout(apply,320);
  }

  function decorateModernCardBack(stage){
    if(!stage) return;
    const apply=()=>{
      const back=stage.querySelector(
        '.op22-card-back,.op22-back,[class*="card-back"],[class*="face-back"],[class*="verso"]'
      );
      if(!back) return;
      back.classList.add('op-app-modern-back');

      const labels=['position','position des mains','barrière motrice','barriere motrice','normalisation'];
      [...back.querySelectorAll('*')].forEach(node=>{
        if(node.children.length) return;
        const text=String(node.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('fr');
        if(!labels.includes(text)) return;
        node.classList.add('op-app-back-section-title');
        let panel=node.parentElement;
        let best=panel;
        for(let depth=0;panel&&panel!==back&&depth<5;depth++,panel=panel.parentElement){
          const bg=getComputedStyle(panel).backgroundColor.match(/[\d.]+/g)?.slice(0,3).map(Number)||[];
          const isLight=bg.length===3&&bg.every(value=>value>150);
          if(panel.querySelector('img')||isLight) best=panel;
          if(isLight) break;
        }
        if(best&&best!==back) best.classList.add('op-app-back-section');
      });

      [...back.querySelectorAll('img')].forEach(img=>{
        const src=String(img.currentSrc||img.src||'').toLocaleLowerCase('fr');
        const holder=String(img.parentElement?.className||'').toLocaleLowerCase('fr');
        const isBrand=src.includes('logo-osteo-pratik')||/brand|app-logo|card-logo/.test(holder);
        const isStepLogo=/step-logo|fiche-logo|detail-step-logo|step-icon|pictogram|picto/.test(holder);
        const ratio=(img.naturalWidth&&img.naturalHeight)?img.naturalWidth/img.naturalHeight:0;
        const looksLikeIcon=ratio>.82&&ratio<1.18&&(img.naturalWidth||0)<=256;
        img.classList.toggle('op-app-native-brand-logo',isBrand);
        img.classList.toggle('op-app-native-step-logo',!isBrand&&(isStepLogo||looksLikeIcon));
        img.classList.toggle('op-app-step-photo',!isBrand&&!isStepLogo&&!looksLikeIcon);
      });

      if(!back.querySelector(':scope > .op-app-electric-layer-back')){
        const layer=document.createElement('span');
        layer.className='op-app-electric-layer op-app-electric-layer-back';
        layer.setAttribute('aria-hidden','true');
        back.appendChild(layer);
      }
    };
    apply();
    setTimeout(apply,80);
    setTimeout(apply,320);
  }

  function enableWholeCardFlip(stage){
    const card=stage?.querySelector('.op22-card');
    if(!card||card.dataset.wholeFlip==='app35') return;
    card.dataset.wholeFlip='app35';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label','Retourner la carte');
    let startX=0,startY=0,moved=false;
    card.addEventListener('pointerdown',event=>{
      startX=event.clientX;startY=event.clientY;moved=false;
    });
    card.addEventListener('pointermove',event=>{
      if(Math.abs(event.clientX-startX)>8||Math.abs(event.clientY-startY)>8) moved=true;
    });
    card.addEventListener('click',event=>{
      if(moved||event.target.closest('button,a,input,select,textarea')) return;
      card.classList.toggle('is-flipped');
      card.setAttribute('aria-label',card.classList.contains('is-flipped')?'Afficher le recto':'Afficher le verso');
    });
    card.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ') return;
      event.preventDefault();
      card.classList.toggle('is-flipped');
      card.setAttribute('aria-label',card.classList.contains('is-flipped')?'Afficher le recto':'Afficher le verso');
    });
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
      fitMainCardPhoto(stage);
      decorateElectricCard(stage,t);
      cleanCardBackMetadata(stage);
      decorateModernCardBack(stage);
      enableWholeCardFlip(stage);
    }catch(err){
      console.warn('[Ostéo Pratik] Rendu carte V22.2 impossible',err);
      toastSafe('Impossible d’afficher la carte V22.2');
      return;
    }

    previousBodyOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');

    // V19.13 : une fiche est comptée comme consultée uniquement après son
    // affichage réussi, puis synchronisée avec le compte Supabase.
    try{
      const userData=window.OSTEO_USER_DATA_V19;
      if(userData && typeof userData.recordCardOpen==='function'){
        Promise.resolve(userData.recordCardOpen(t.id)).catch(()=>{});
      }
    }catch(_){}
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
    syncWheelUnlockedLabel();
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
    const account = accountViewedIds();

    // Supabase gagne toujours. Sans API centrale prête, on conserve seulement CLEAN
    // et on ne réinjecte jamais les anciennes clés STRICT/LEGACY.
    const merged = account===null ? uniqueValid(clean) : account;

    const before = JSON.stringify(uniqueValid(clean));
    const after = JSON.stringify(merged);

    if(before !== after){
      writeViewed(merged);
      syncTechniqueStatuses();

      try{ if(typeof renderTechniques==='function') renderTechniques(); }catch(_){}
      try{ if(typeof renderSeenCollections==='function') renderSeenCollections(); }catch(_){}
      try{ if(typeof renderSeenCards==='function') renderSeenCards(); }catch(_){}
      try{ if(typeof renderRevisionWheel==='function') renderRevisionWheel(); }catch(_){}
      syncWheelUnlockedLabel();
      try{ if(typeof updateZoneStats==='function') updateZoneStats(); }catch(_){}
      try{ if(typeof updateProgressZoneStats==='function') updateProgressZoneStats(); }catch(_){}
      hydrateSeenCardThumbnails();

      console.info('[Ostéo Pratik] Progression Supabase appliquée :',merged.length,'technique(s) vue(s)');
    }

    // Redessine même sans changement de stockage : l'ancien HTML peut encore
    // montrer les cartes de démonstration rendues avant le chargement Supabase.
    syncTechniqueStatuses();
    try{ if(typeof renderSeenCollections==='function') renderSeenCollections(); }catch(_){}
    try{ if(typeof renderRevisionWheel==='function') renderRevisionWheel(); }catch(_){}
    syncWheelUnlockedLabel();
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

/* =========================================================
   OSTÉO PRATIK — APP30 · RECTO DE CARTE COMPACT ET RECADRÉ
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoCardFrontFitApp30) return;
  window.__osteoCardFrontFitApp30=true;
  function install(){
    if(document.getElementById('opCardFrontFitApp30')) return;
    const style=document.createElement('style');
    style.id='opCardFrontFitApp30';
    style.textContent=`
      #op22AppCardOverlay .op22-app-shell{
        max-height:calc(100dvh - 16px) !important;
      }
      #op22AppCardOverlay #op22AppCardStage{
        display:flex !important;justify-content:center !important;
        overflow:auto !important;min-height:0 !important;
      }
      #op22AppCardOverlay .op22-card{
        width:min(370px,86vw) !important;
        max-width:370px !important;
        height:auto !important;
        aspect-ratio:2 / 3 !important;
        flex:0 0 auto !important;
      }
      #op22AppCardOverlay .op-app-main-card-photo{
        object-fit:contain !important;
        object-position:center center !important;
        background:linear-gradient(145deg,#edf3f6,#dce7ed) !important;
      }
      @media(max-width:560px){
        #op22AppCardOverlay .op22-card{
          width:min(320px,82vw,calc(58dvh * 2 / 3)) !important;
        }
        #op22AppCardOverlay .op22-app-head,
        #op22AppCardOverlay .op22-app-actions{
          width:min(360px,92vw) !important;
        }
        #op22AppCardOverlay .op22-app-actions button{
          min-height:40px !important;padding:8px 12px !important;
        }
      }
      @media(max-height:720px) and (max-width:560px){
        #op22AppCardOverlay .op22-card{
          width:min(280px,76vw,calc(52dvh * 2 / 3)) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_CARD_FRONT_FIT_APP30={version:'30.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP31 · CALQUE ÉLECTRIQUE DU RECTO
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoCardElectricLayerApp31) return;
  window.__osteoCardElectricLayerApp31=true;
  function install(){
    if(document.getElementById('opCardElectricLayerApp31')) return;
    const style=document.createElement('style');
    style.id='opCardElectricLayerApp31';
    style.textContent=`
      #op22AppCardOverlay .op-app-electric-card{
        filter:none !important;
      }
      #op22AppCardOverlay .op-app-electric-front{
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.78) !important;
        box-shadow:
          0 0 0 1px rgba(var(--op-card-electric-rgb,57,231,255),.16),
          0 0 20px rgba(var(--op-card-electric-rgb,57,231,255),.22),
          inset 0 0 18px rgba(var(--op-card-electric-rgb,57,231,255),.08) !important;
      }
      #op22AppCardOverlay .op-app-electric-layer{
        position:absolute;inset:5px;z-index:50;display:block;
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.24);
        border-radius:calc(1em - 3px);pointer-events:none;
        box-shadow:inset 0 0 12px rgba(var(--op-card-electric-rgb,57,231,255),.06);
      }
      #op22AppCardOverlay .op-app-electric-layer::before,
      #op22AppCardOverlay .op-app-electric-layer::after{
        content:"";position:absolute;width:38px;height:38px;pointer-events:none;
      }
      #op22AppCardOverlay .op-app-electric-layer::before{
        left:-2px;top:-2px;border-left:3px solid var(--op-card-electric,#39e7ff);
        border-top:3px solid var(--op-card-electric,#39e7ff);border-radius:12px 0 0 0;
        filter:drop-shadow(0 0 5px var(--op-card-electric,#39e7ff));
      }
      #op22AppCardOverlay .op-app-electric-layer::after{
        right:-2px;bottom:-2px;border-right:3px solid var(--op-card-electric,#39e7ff);
        border-bottom:3px solid var(--op-card-electric,#39e7ff);border-radius:0 0 12px 0;
        filter:drop-shadow(0 0 5px var(--op-card-electric,#39e7ff));
      }
      #op22AppCardOverlay.is-open .op-app-electric-layer{
        animation:opCardElectricPulse 3.2s ease-in-out infinite;
      }
      @keyframes opCardElectricPulse{
        0%,100%{opacity:.72}
        50%{opacity:1}
      }
      @media(prefers-reduced-motion:reduce){
        #op22AppCardOverlay.is-open .op-app-electric-layer{animation:none}
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_CARD_ELECTRIC_LAYER_APP31={version:'31.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP32 · SÉPARATION RECTO / VERSO
   Le calque ne modifie plus le positionnement 3D des faces.
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoCardFacesSeparatedApp32) return;
  window.__osteoCardFacesSeparatedApp32=true;
  function install(){
    if(document.getElementById('opCardFacesSeparatedApp32')) return;
    const style=document.createElement('style');
    style.id='opCardFacesSeparatedApp32';
    style.textContent=`
      #op22AppCardOverlay .op22-card-front,
      #op22AppCardOverlay .op22-front,
      #op22AppCardOverlay [class*="card-front"],
      #op22AppCardOverlay [class*="face-front"]{
        overflow:hidden !important;
      }
      #op22AppCardOverlay .op22-card-back,
      #op22AppCardOverlay .op22-back,
      #op22AppCardOverlay [class*="card-back"],
      #op22AppCardOverlay [class*="face-back"],
      #op22AppCardOverlay [class*="verso"]{
        overflow-y:auto !important;
        overflow-x:hidden !important;
        overscroll-behavior:contain !important;
        -webkit-overflow-scrolling:touch !important;
      }
      #op22AppCardOverlay .op-app-electric-layer{
        transform:none !important;
        backface-visibility:hidden !important;
        -webkit-backface-visibility:hidden !important;
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_CARD_FACES_APP32={version:'32.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP33 · CORRECTION SUPERPOSITION IOS
   Aucun filtre n'est appliqué au conteneur de rotation 3D.
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoCardIosFacesApp33) return;
  window.__osteoCardIosFacesApp33=true;
  function install(){
    if(document.getElementById('opCardIosFacesApp33')) return;
    const style=document.createElement('style');
    style.id='opCardIosFacesApp33';
    style.textContent=`
      #op22AppCardOverlay .op22-card{
        perspective:1200px !important;
        filter:none !important;
        isolation:isolate !important;
      }
      #op22AppCardOverlay .op22-card-inner,
      #op22AppCardOverlay .op22-inner{
        position:relative !important;
        width:100% !important;height:100% !important;
        transform-style:preserve-3d !important;
        -webkit-transform-style:preserve-3d !important;
      }
      #op22AppCardOverlay .op22-card-face,
      #op22AppCardOverlay .op22-face,
      #op22AppCardOverlay .op22-card-front,
      #op22AppCardOverlay .op22-card-back{
        position:absolute !important;inset:0 !important;
        width:100% !important;height:100% !important;
        backface-visibility:hidden !important;
        -webkit-backface-visibility:hidden !important;
        transform-style:preserve-3d !important;
        -webkit-transform-style:preserve-3d !important;
      }
      #op22AppCardOverlay .op22-card-front,
      #op22AppCardOverlay .op22-front{
        transform:rotateY(0deg) translateZ(1px) !important;
        -webkit-transform:rotateY(0deg) translateZ(1px) !important;
      }
      #op22AppCardOverlay .op22-card-back,
      #op22AppCardOverlay .op22-back{
        transform:rotateY(180deg) translateZ(1px) !important;
        -webkit-transform:rotateY(180deg) translateZ(1px) !important;
      }
      #op22AppCardOverlay .op22-card.is-flipped .op22-card-inner,
      #op22AppCardOverlay .op22-card.is-flipped .op22-inner{
        transform:rotateY(180deg) !important;
        -webkit-transform:rotateY(180deg) !important;
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_CARD_IOS_FACES_APP33={version:'33.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP34 · VERSO ALLÉGÉ
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoCardBackCompactApp34) return;
  window.__osteoCardBackCompactApp34=true;
  function install(){
    if(document.getElementById('opCardBackCompactApp34')) return;
    const style=document.createElement('style');
    style.id='opCardBackCompactApp34';
    style.textContent=`
      #op22AppCardOverlay .op-app-back-meta-hidden{
        display:none !important;
      }
      @media(max-width:560px){
        #op22AppCardOverlay .op22-card.is-flipped{
          width:min(290px,76vw,calc(54dvh * 2 / 3)) !important;
        }
        #op22AppCardOverlay .op22-card-back,
        #op22AppCardOverlay .op22-back,
        #op22AppCardOverlay [class*="card-back"],
        #op22AppCardOverlay [class*="face-back"],
        #op22AppCardOverlay [class*="verso"]{
          scrollbar-width:thin;
          scrollbar-color:rgba(87,230,255,.58) rgba(3,20,34,.24);
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_CARD_BACK_COMPACT_APP34={version:'34.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP35 · CARTE ENTIÈREMENT CLIQUABLE
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoWholeCardClickableApp35) return;
  window.__osteoWholeCardClickableApp35=true;
  function install(){
    if(document.getElementById('opWholeCardClickableApp35')) return;
    const style=document.createElement('style');
    style.id='opWholeCardClickableApp35';
    style.textContent=`
      #op22AppCardOverlay .op22-card[data-whole-flip="app35"]{
        cursor:pointer !important;
        -webkit-tap-highlight-color:transparent;
        touch-action:pan-y;
      }
      #op22AppCardOverlay .op22-card[data-whole-flip="app35"]:focus-visible{
        outline:2px solid var(--op-card-electric,#39e7ff) !important;
        outline-offset:4px !important;
      }
      #op22AppCardOverlay .op22-card[data-whole-flip="app35"]:active{
        opacity:.97;
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_WHOLE_CARD_CLICKABLE_APP35={version:'35.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP36 · CALQUE MODERNE RECTO ET VERSO
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoModernCardFacesApp36) return;
  window.__osteoModernCardFacesApp36=true;
  function install(){
    if(document.getElementById('opModernCardFacesApp36')) return;
    const style=document.createElement('style');
    style.id='opModernCardFacesApp36';
    style.textContent=`
      #op22AppCardOverlay .op-app-electric-front > .op-app-electric-layer{
        background:linear-gradient(180deg,transparent 48%,rgba(2,12,27,.12) 62%,rgba(2,12,27,.48) 100%);
      }
      #op22AppCardOverlay .op-app-modern-back{
        color:#f7fbff !important;
        background:
          radial-gradient(circle at 100% 0%,rgba(130,68,255,.16),transparent 36%),
          radial-gradient(circle at 0% 100%,rgba(var(--op-card-electric-rgb,57,231,255),.12),transparent 42%),
          linear-gradient(155deg,#071d32 0%,#071526 48%,#100d27 100%) !important;
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.78) !important;
        box-shadow:
          0 0 0 1px rgba(var(--op-card-electric-rgb,57,231,255),.14),
          0 0 20px rgba(var(--op-card-electric-rgb,57,231,255),.18),
          inset 0 0 18px rgba(var(--op-card-electric-rgb,57,231,255),.06) !important;
      }
      #op22AppCardOverlay .op-app-modern-back .op-app-back-section{
        color:#f5fbff !important;
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.46) !important;
        border-radius:14px !important;
        background:linear-gradient(135deg,rgba(5,29,47,.94),rgba(10,19,43,.90)) !important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 7px 18px rgba(0,0,0,.14) !important;
      }
      #op22AppCardOverlay .op-app-modern-back .op-app-back-section-title{
        color:var(--op-card-electric,#39e7ff) !important;
        font-weight:950 !important;letter-spacing:.07em !important;
        text-transform:uppercase !important;text-shadow:none !important;
      }
      #op22AppCardOverlay .op-app-modern-back .op-app-back-section p,
      #op22AppCardOverlay .op-app-modern-back .op-app-back-section span:not(.op-app-electric-layer){
        color:#edf7ff !important;
      }
      #op22AppCardOverlay .op-app-modern-back .op-app-back-section img.op-app-step-photo{
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.52) !important;
        border-radius:10px !important;background:#071827 !important;
        box-shadow:0 0 12px rgba(var(--op-card-electric-rgb,57,231,255),.10) !important;
      }
      #op22AppCardOverlay .op-app-modern-back img.op-app-native-step-logo,
      #op22AppCardOverlay .op-app-modern-back img.op-app-native-brand-logo{
        object-fit:contain !important;
        border:0 !important;background:transparent !important;
        box-shadow:none !important;filter:none !important;
      }
      #op22AppCardOverlay .op-app-electric-layer-back{
        background:none !important;
      }
      @media(max-width:560px){
        #op22AppCardOverlay .op-app-modern-back .op-app-back-section{
          margin-bottom:7px !important;padding:8px !important;
        }
        #op22AppCardOverlay .op-app-modern-back .op-app-back-section-title{
          font-size:9px !important;
        }
        #op22AppCardOverlay .op-app-modern-back .op-app-back-section p,
        #op22AppCardOverlay .op-app-modern-back .op-app-back-section span{
          font-size:8px !important;line-height:1.28 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.OSTEO_MODERN_CARD_FACES_APP36={version:'36.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP37 · LOGOS NATIFS PRÉSERVÉS
   Les logos existants restent la seule source graphique.
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoNativeCardLogosApp37) return;
  window.__osteoNativeCardLogosApp37=true;
  window.OSTEO_NATIVE_CARD_LOGOS_APP37={version:'37.0'};
})();

/* =========================================================
   OSTÉO PRATIK — APP39 · CALQUE MODERNE SUR LA STRUCTURE RÉELLE
   playing-cards-v22 utilise op22-inner/front/back/face.
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoRealCardLayerApp39) return;
  window.__osteoRealCardLayerApp39=true;

  function installStyles(){
    if(document.getElementById('opRealCardLayerApp39')) return;
    const style=document.createElement('style');
    style.id='opRealCardLayerApp39';
    style.textContent=`
      #op22AppCardOverlay .op22-card{
        border-radius:24px !important;
        background:#061321 !important;
        box-shadow:0 0 0 1px rgba(var(--op-card-electric-rgb,57,231,255),.20),
          0 0 30px rgba(var(--op-card-electric-rgb,57,231,255),.30) !important;
      }
      #op22AppCardOverlay .op22-inner{
        position:relative !important;width:100% !important;height:100% !important;
        transform-style:preserve-3d !important;-webkit-transform-style:preserve-3d !important;
      }
      #op22AppCardOverlay .op22-face{
        position:absolute !important;inset:0 !important;width:100% !important;height:100% !important;
        overflow:hidden !important;border-radius:24px !important;
        backface-visibility:hidden !important;-webkit-backface-visibility:hidden !important;
        transform-style:flat !important;-webkit-transform-style:flat !important;
      }
      #op22AppCardOverlay .op22-front{
        transform:rotateY(0deg) !important;
        -webkit-transform:rotateY(0deg) !important;
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.85) !important;
        box-shadow:inset 0 0 22px rgba(var(--op-card-electric-rgb,57,231,255),.10) !important;
      }
      #op22AppCardOverlay .op22-back{
        transform:rotateY(180deg) !important;
        -webkit-transform:rotateY(180deg) !important;
        overflow-y:auto !important;
        padding:14px 12px 12px !important;
        background:radial-gradient(circle at 100% 0%,rgba(126,72,255,.20),transparent 34%),
          linear-gradient(155deg,#071e33,#071426 55%,#100d28) !important;
      }
      #op22AppCardOverlay .op22-card.is-flipped .op22-inner{
        transform:rotateY(180deg) !important;-webkit-transform:rotateY(180deg) !important;
      }
      #op22AppCardOverlay .op22-logo{
        display:block !important;object-fit:contain !important;filter:none !important;
      }
      #op22AppCardOverlay .op22-back .op22-logo-back{
        width:auto !important;max-width:88px !important;height:28px !important;margin:0 auto 6px !important;
      }
      #op22AppCardOverlay .op22-back .op22-code,
      #op22AppCardOverlay .op22-back .op22-back-footer{
        display:none !important;
      }
      #op22AppCardOverlay .op22-back .op22-back-header{
        margin:0 0 9px !important;padding:0 8px 8px !important;
        border-bottom:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.34) !important;
      }
      #op22AppCardOverlay .op22-back .op22-back-header h2{
        margin:0 !important;color:#fff !important;font-size:15px !important;line-height:1.08 !important;
      }
      #op22AppCardOverlay .op22-back .op22-step{
        margin:0 0 8px !important;padding:8px !important;border-radius:13px !important;
        border:1px solid rgba(var(--op-card-electric-rgb,57,231,255),.34) !important;
        background:linear-gradient(135deg,rgba(7,35,55,.96),rgba(12,20,43,.94)) !important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04) !important;
      }
      #op22AppCardOverlay .op22-back .op22-step-icon img{
        display:block !important;width:100% !important;height:100% !important;
        object-fit:contain !important;border:0 !important;background:transparent !important;
        box-shadow:none !important;filter:none !important;
      }
      #op22AppCardOverlay .op22-back .op22-step h3{
        color:var(--op-card-electric,#39e7ff) !important;text-transform:uppercase !important;
        letter-spacing:.055em !important;
      }
      #op22AppCardOverlay .op22-back .op22-step p{color:#edf8ff !important;}
      #op22AppCardOverlay .op-app-electric-layer{
        border-radius:19px !important;
      }
      @media(max-width:560px){
        #op22AppCardOverlay .op22-back{padding:11px 9px 9px !important;}
        #op22AppCardOverlay .op22-back .op22-logo-back{height:23px !important;margin-bottom:4px !important;}
        #op22AppCardOverlay .op22-back .op22-back-header h2{font-size:12px !important;}
        #op22AppCardOverlay .op22-back .op22-step{padding:6px !important;margin-bottom:6px !important;}
        #op22AppCardOverlay .op22-back .op22-step h3{font-size:8px !important;}
        #op22AppCardOverlay .op22-back .op22-step p{font-size:7.5px !important;line-height:1.22 !important;}
      }
      @media(max-width:760px){
        #op22AppCardOverlay .op22-card.is-flipped{
          width:min(255px,70vw,calc(48dvh * 2 / 3)) !important;
          max-width:255px !important;
        }
        #op22AppCardOverlay .op22-card.is-flipped .op22-back{
          padding:9px 7px 7px !important;
        }
        #op22AppCardOverlay .op22-card.is-flipped .op22-logo-back{
          height:21px !important;max-width:76px !important;margin-bottom:3px !important;
        }
        #op22AppCardOverlay .op22-card.is-flipped .op22-back-header{
          margin-bottom:5px !important;padding-bottom:5px !important;
        }
        #op22AppCardOverlay .op22-card.is-flipped .op22-back-header h2{
          font-size:10.5px !important;
        }
        #op22AppCardOverlay .op22-card.is-flipped .op22-step{
          margin-bottom:4px !important;padding:5px !important;border-radius:10px !important;
        }
        #op22AppCardOverlay .op22-card.is-flipped .op22-step h3{font-size:7.5px !important;}
        #op22AppCardOverlay .op22-card.is-flipped .op22-step p{font-size:6.8px !important;line-height:1.16 !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function decorate(root){
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('#op22AppCardOverlay .op22-card').forEach(card=>{
      card.dataset.realLayer='app39';
      card.querySelectorAll('.op22-logo').forEach(img=>img.classList.add('op-app-native-brand-logo'));
      card.querySelectorAll('.op22-step-icon img').forEach(img=>img.classList.add('op-app-native-step-logo'));
      card.querySelectorAll('.op22-step').forEach(step=>step.classList.add('op-app-back-section'));
      const front=card.querySelector('.op22-front');
      if(front&&!front.querySelector(':scope > .op-app-electric-layer')){
        const layer=document.createElement('span');
        layer.className='op-app-electric-layer';layer.setAttribute('aria-hidden','true');front.appendChild(layer);
      }
    });
  }

  installStyles();
  decorate(document);
  const observer=new MutationObserver(records=>records.forEach(record=>
    record.addedNodes.forEach(node=>{if(node.nodeType===1) decorate(node);})
  ));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.OSTEO_REAL_CARD_LAYER_APP39={version:'39.0',refresh:()=>{installStyles();decorate(document);}};
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

    // V19.11 : Supabase devient aussi la source de vérité pour les résultats
    // par technique. Une erreur active « À revoir » ; deux bonnes réponses
    // consécutives le retirent et marquent la technique comme maîtrisée.
    const sync=()=>{
      const api=window.OSTEO_USER_DATA_V19;
      if(!api || typeof api.recordTechniqueQuizAnswer!=='function') return false;
      try{
        Promise.resolve(api.recordTechniqueQuizAnswer(id,!!isCorrect)).catch(()=>{});
        return true;
      }catch(_){
        return false;
      }
    };
    if(!sync()) setTimeout(sync,250);
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
      const api=window.OSTEO_USER_DATA_V19;
      if(api && typeof api.recordQuizSummary==='function'){
        Promise.resolve(api.recordQuizSummary({
          title:sessionTechniqueTitle
            ? 'Quiz technique — '+sessionTechniqueTitle
            : (sessionFilterZone?'Quiz '+sessionFilterZone:'Quiz de mes techniques vues'),
          score:session.score,
          total,
          percent
        })).catch(()=>{});
      }
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


/* ==============================================================
   OSTÉO PRATIK — APP13 · ROUE V2
   --------------------------------------------------------------
   Après le tirage :
   - Voir la carte
   - Voir la vidéo
   - Écouter (piste audio de la vidéo, image masquée)
   - Me tester · 4 questions
   ============================================================== */
(function(){
  'use strict';

  if(window.__osteoWheelV2App13) return;
  window.__osteoWheelV2App13=true;

  let audioPlayer=null;
  let audioTechniqueId=0;
  let audioTechnique=null;
  let audioRate=1;
  let audioShuffle=false;

  function toastSafe(message){
    try{
      if(typeof toast==='function') return toast(message);
      if(typeof window.toast==='function') return window.toast(message);
    }catch(_){}
  }

  function selectedTechnique(){
    try{
      if(typeof getSelectedWheelTechnique==='function'){
        return getSelectedWheelTechnique();
      }
    }catch(_){}
    return null;
  }

  function audioTechniques(){
    try{
      if(typeof getViewedTechniquesForWheel==='function'){
        return (getViewedTechniquesForWheel()||[])
          .filter(t=>t&&(t.videoUrl||t.vimeoId))
          .sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'fr',{sensitivity:'base'}));
      }
    }catch(_){ }
    return [];
  }

  function populateAudioPicker(query,currentId){
    const select=document.getElementById('opWheelAudioSelect');
    if(!select) return;
    const needle=String(query||'').trim().toLocaleLowerCase('fr');
    const list=audioTechniques().filter(t=>
      !needle || String(t.title||'').toLocaleLowerCase('fr').includes(needle)
    );
    select.innerHTML='';
    if(!list.length){
      const option=document.createElement('option');
      option.value=''; option.textContent='Aucune technique trouvée';
      select.appendChild(option);
      select.disabled=true;
      return;
    }
    select.disabled=false;
    list.forEach(t=>{
      const option=document.createElement('option');
      option.value=String(t.id);
      option.textContent=String(t.title||'Technique');
      select.appendChild(option);
    });
    const wanted=String(currentId||audioTechniqueId||'');
    if(list.some(t=>String(t.id)===wanted)) select.value=wanted;
  }

  function refreshLastViewedAudioCard(){
    const card=document.getElementById('opWheelAudioLast');
    const title=document.getElementById('opWheelAudioLastTitle');
    if(!card||!title) return;
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem('osteoPratikLastPractice')||'null');}catch(_){ }
    const technique=saved?.id
      ? audioTechniques().find(t=>String(t.id)===String(saved.id))
      : null;
    if(!technique){
      card.hidden=true;
      card.dataset.techniqueId='';
      return;
    }
    card.hidden=false;
    card.dataset.techniqueId=String(technique.id);
    title.textContent=String(technique.title||'Technique');
  }

  function adjacentAudioTechnique(direction){
    const list=audioTechniques();
    if(!list.length) return null;
    if(audioShuffle&&list.length>1){
      const candidates=list.filter(t=>String(t.id)!==String(audioTechniqueId));
      return candidates[Math.floor(Math.random()*candidates.length)]||list[0];
    }
    const index=Math.max(0,list.findIndex(t=>String(t.id)===String(audioTechniqueId)));
    return list[(index+direction+list.length)%list.length];
  }

  function ensureVimeoApi(){
    if(window.Vimeo && window.Vimeo.Player) return Promise.resolve();

    return new Promise((resolve,reject)=>{
      let script=document.querySelector('script[src*="player.vimeo.com/api/player.js"]');
      if(script){
        const started=Date.now();
        (function wait(){
          if(window.Vimeo && window.Vimeo.Player) return resolve();
          if(Date.now()-started>10000) return reject(new Error('API Vimeo indisponible'));
          setTimeout(wait,80);
        })();
        return;
      }

      script=document.createElement('script');
      script.src='https://player.vimeo.com/api/player.js';
      script.async=true;
      script.onload=()=>resolve();
      script.onerror=()=>reject(new Error('API Vimeo indisponible'));
      document.head.appendChild(script);
    });
  }

  function ensureAudioOverlay(){
    let overlay=document.getElementById('opWheelAudioOverlay');
    if(overlay) return overlay;

    const style=document.createElement('style');
    style.id='opWheelAudioStylesApp13';
    style.textContent=`
      #revisionWheel .wheel-actions-choice{
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
      }
      #revisionWheel .wheel-actions-choice .wheel-spin-button{
        grid-column:1 / -1;
      }
      #revisionWheel .wheel-test-button{
        border-color:rgba(168,85,255,.48) !important;
        color:#d6b7ff !important;
        background:rgba(168,85,255,.08) !important;
      }

      #opWheelAudioOverlay{
        position:fixed;inset:0;z-index:2147482500;
        display:none;align-items:center;justify-content:center;
        padding:18px;background:rgba(1,7,14,.92);
        backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
      }
      #opWheelAudioOverlay.is-open{display:flex}
      #opWheelAudioOverlay .op-audio-shell{
        width:min(460px,94vw);
        border:1px solid rgba(91,222,255,.42);
        border-radius:26px;
        padding:20px;
        background:
          radial-gradient(circle at 12% 0%,rgba(0,221,255,.22),transparent 38%),
          radial-gradient(circle at 100% 32%,rgba(139,78,255,.20),transparent 42%),
          linear-gradient(155deg,#0b3554 0%,#101d48 48%,#180f35 100%);
        box-shadow:0 28px 90px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.08);
      }
      #opWheelAudioOverlay .op-audio-head{
        display:flex;justify-content:space-between;gap:12px;align-items:center;
        min-height:66px;padding:11px 12px 11px 15px;border-radius:18px;
        border:1px solid rgba(114,231,255,.20);
        background:linear-gradient(120deg,rgba(0,190,225,.16),rgba(117,62,210,.18));
      }
      #opWheelAudioOverlay .op-audio-head small{
        display:block;color:#5feaff;font-size:11px;font-weight:900;
        text-transform:uppercase;letter-spacing:.12em;margin-bottom:7px;
      }
      #opWheelAudioOverlay .op-audio-head strong{
        display:block;color:#fff;font-size:19px;line-height:1.2;
        text-shadow:0 2px 8px rgba(0,0,0,.55);
      }
      #opWheelAudioOverlay .op-audio-close{
        flex:0 0 auto;width:40px;height:40px;border-radius:50%;
        border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);
        color:#fff;font-size:24px;cursor:pointer;
      }
      #opWheelAudioOverlay .op-audio-visual{
        height:150px;margin:18px 0;border-radius:22px;
        display:grid;place-items:center;
        border:1px solid rgba(95,229,255,.28);
        background:
          radial-gradient(circle at center,rgba(43,226,255,.22),transparent 38%),
          linear-gradient(145deg,rgba(5,43,67,.82),rgba(47,23,83,.72));
        box-shadow:inset 0 0 36px rgba(0,0,0,.26);
      }
      #opWheelAudioOverlay .op-audio-picker{
        display:grid;gap:8px;margin:16px 0 12px;
      }
      #opWheelAudioOverlay .op-audio-last{
        width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;
        align-items:center;gap:5px 12px;margin:16px 0 12px;padding:13px 14px;
        border-radius:16px;border:1px solid rgba(174,114,255,.45);
        color:#fff;text-align:left;cursor:pointer;
        background:linear-gradient(135deg,rgba(110,52,173,.42),rgba(18,48,91,.82));
        box-shadow:0 10px 28px rgba(81,42,150,.16);
      }
      #opWheelAudioOverlay .op-audio-last[hidden]{display:none !important}
      #opWheelAudioOverlay .op-audio-last small{
        grid-column:1;color:#cfadff;font-size:9px;font-weight:950;
        letter-spacing:.13em;text-transform:uppercase;
      }
      #opWheelAudioOverlay .op-audio-last strong{
        grid-column:1;display:block;min-width:0;color:#fff;font-size:13px;
        line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      #opWheelAudioOverlay .op-audio-last span{
        grid-column:2;grid-row:1 / 3;color:#75ecff;font-size:12px;font-weight:950;
      }
      #opWheelAudioOverlay .op-audio-picker label{
        color:#79eaff;font-size:10px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;
      }
      #opWheelAudioOverlay .op-audio-picker input,
      #opWheelAudioOverlay .op-audio-picker select{
        width:100%;min-height:44px;padding:0 12px;border-radius:13px;
        border:1px solid rgba(104,233,255,.30);color:#f4fbff;
        background:#07192b;font:inherit;font-size:13px;outline:none;
      }
      #opWheelAudioOverlay .op-audio-search-wrap{position:relative}
      #opWheelAudioOverlay .op-audio-search-wrap::before{
        content:"";position:absolute;left:13px;top:50%;width:13px;height:13px;
        border:2px solid #78eaff;border-radius:50%;transform:translateY(-58%);
        opacity:.9;pointer-events:none;box-sizing:border-box;
      }
      #opWheelAudioOverlay .op-audio-search-wrap::after{
        content:"";position:absolute;left:24px;top:27px;width:6px;height:2px;
        border-radius:2px;background:#78eaff;transform:rotate(45deg);
        opacity:.9;pointer-events:none;
      }
      #opWheelAudioOverlay .op-audio-search-wrap input{
        padding-left:38px !important;
      }
      #opWheelAudioOverlay .op-audio-picker input:focus,
      #opWheelAudioOverlay .op-audio-picker select:focus{
        border-color:#54e8ff;box-shadow:0 0 0 3px rgba(84,232,255,.10);
      }
      #opWheelAudioOverlay .op-audio-disc{
        width:84px;height:84px;border-radius:50%;
        border:1px solid rgba(0,229,255,.55);
        display:grid;place-items:center;color:#54e8ff;font-size:34px;
        box-shadow:0 0 38px rgba(0,229,255,.15);
      }
      #opWheelAudioOverlay.is-playing .op-audio-disc{
        animation:opAudioPulse 1.45s ease-in-out infinite;
      }
      @keyframes opAudioPulse{
        0%,100%{transform:scale(1);box-shadow:0 0 25px rgba(0,229,255,.12)}
        50%{transform:scale(1.08);box-shadow:0 0 48px rgba(0,229,255,.28)}
      }
      #opWheelAudioOverlay .op-audio-status{
        color:#b9c8db;text-align:center;font-size:12px;margin:-6px 0 15px;
      }
      #opWheelAudioOverlay .op-audio-now{
        display:block;margin:-5px 0 13px;text-align:center;
      }
      #opWheelAudioOverlay .op-audio-now small{
        display:block;margin-bottom:4px;color:#71eaff;font-size:9px;
        font-weight:950;letter-spacing:.12em;text-transform:uppercase;
      }
      #opWheelAudioOverlay .op-audio-now strong{
        display:block;color:#f7fbff;font-size:13px;line-height:1.3;font-weight:850;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        text-shadow:0 1px 4px rgba(0,0,0,.45);
      }
      #opWheelAudioOverlay .op-audio-actions{
        display:grid;grid-template-columns:1fr 1fr;gap:9px;
      }
      #opWheelAudioOverlay .op-audio-transport{
        display:grid;grid-template-columns:56px minmax(0,1fr) 56px;gap:9px;margin-bottom:9px;
      }
      #opWheelAudioOverlay .op-audio-options{
        display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:9px;
      }
      #opWheelAudioOverlay .op-audio-actions button{
        min-height:46px;border-radius:14px;font-weight:900;cursor:pointer;
      }
      #opWheelAudioOverlay .op-audio-transport button,
      #opWheelAudioOverlay .op-audio-options button{
        min-height:46px;border-radius:14px;font-weight:900;cursor:pointer;
      }
      #opWheelAudioOverlay .op-audio-play{
        color:#00141d;border:1px solid #69eaff;
        background:linear-gradient(135deg,#78efff,#20c8e7);
      }
      #opWheelAudioOverlay .op-audio-secondary{
        color:#e5faff;border:1px solid rgba(104,233,255,.35);
        background:rgba(3,20,34,.75);
      }
      #opWheelAudioOverlay .op-audio-option-active{
        color:#001d1c !important;border-color:#41efca !important;
        background:linear-gradient(135deg,#73f4da,#24caaa) !important;
      }
      #opWheelAudioIframeWrap{
        position:absolute !important;
        width:1px !important;height:1px !important;
        overflow:hidden !important;opacity:.001 !important;
        pointer-events:none !important;left:-9999px !important;top:-9999px !important;
      }
      @media(max-width:480px){
        #opWheelAudioOverlay .op-audio-shell{padding:16px}
        #opWheelAudioOverlay .op-audio-visual{height:128px}
        #opWheelAudioOverlay .op-audio-actions{grid-template-columns:1fr 1fr}
        #opWheelAudioOverlay .op-audio-options{grid-template-columns:1fr 1fr 1fr}
      }
    `;
    document.head.appendChild(style);

    overlay=document.createElement('div');
    overlay.id='opWheelAudioOverlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`
      <div class="op-audio-shell" role="dialog" aria-modal="true" aria-label="Révision audio">
        <div class="op-audio-head">
          <div>
            <strong>Réviser en écoutant</strong>
          </div>
          <button class="op-audio-close" type="button" aria-label="Fermer">×</button>
        </div>

        <button class="op-audio-last" type="button" id="opWheelAudioLast" hidden>
          <small>Dernière technique vue</small>
          <strong id="opWheelAudioLastTitle">Technique</strong>
          <span>Écouter ›</span>
        </button>

        <div class="op-audio-picker">
          <label for="opWheelAudioSearch">Choisir une technique déjà vue</label>
          <div class="op-audio-search-wrap">
            <input id="opWheelAudioSearch" type="search" inputmode="search" autocomplete="off" placeholder="Rechercher une technique…">
          </div>
          <select id="opWheelAudioSelect" aria-label="Techniques disponibles par ordre alphabétique"></select>
        </div>

        <div class="op-audio-visual">
          <div class="op-audio-disc">♫</div>
        </div>

        <div class="op-audio-now">
          <small>Technique en cours</small>
          <strong id="opWheelAudioTitle">Technique</strong>
        </div>

        <div class="op-audio-status" id="opWheelAudioStatus">Prêt à écouter</div>

        <div class="op-audio-transport">
          <button class="op-audio-secondary" type="button" id="opWheelAudioPrevious" aria-label="Technique précédente">◀</button>
          <button class="op-audio-play" type="button" id="opWheelAudioPlay">▶ Lecture</button>
          <button class="op-audio-secondary" type="button" id="opWheelAudioNext" aria-label="Technique suivante">▶</button>
        </div>

        <div class="op-audio-options">
          <button class="op-audio-secondary" type="button" id="opWheelAudioRestart">↺ Début</button>
          <button class="op-audio-secondary" type="button" id="opWheelAudioSpeed">×1</button>
          <button class="op-audio-secondary" type="button" id="opWheelAudioShuffle">Aléatoire</button>
        </div>

        <div class="op-audio-actions">
          <button class="op-audio-secondary" type="button" id="opWheelAudioCard">Voir la carte</button>
          <button class="op-audio-secondary" type="button" id="opWheelAudioVideo">Voir la vidéo</button>
        </div>

        <div id="opWheelAudioIframeWrap"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.op-audio-close').addEventListener('click',closeAudio);
    overlay.addEventListener('click',e=>{
      if(e.target===overlay) closeAudio();
    });

    overlay.querySelector('#opWheelAudioPlay').addEventListener('click',async()=>{
      if(!audioPlayer) return;
      try{
        const paused=await audioPlayer.getPaused();
        if(paused){
          await audioPlayer.play();
        }else{
          await audioPlayer.pause();
        }
      }catch(_){}
    });

    overlay.querySelector('#opWheelAudioRestart').addEventListener('click',async()=>{
      if(!audioPlayer) return;
      try{
        await audioPlayer.setCurrentTime(0);
        await audioPlayer.play();
      }catch(_){}
    });

    overlay.querySelector('#opWheelAudioSearch').addEventListener('input',event=>{
      populateAudioPicker(event.currentTarget.value,audioTechniqueId);
    });

    overlay.querySelector('#opWheelAudioLast').addEventListener('click',event=>{
      const id=event.currentTarget.dataset.techniqueId;
      const t=audioTechniques().find(item=>String(item.id)===String(id));
      if(t) openWheelAudio(t,false);
    });

    overlay.querySelector('#opWheelAudioSelect').addEventListener('change',event=>{
      const id=event.currentTarget.value;
      const t=audioTechniques().find(item=>String(item.id)===String(id));
      if(t) openWheelAudio(t,false);
    });

    overlay.querySelector('#opWheelAudioPrevious').addEventListener('click',()=>{
      const t=adjacentAudioTechnique(-1);
      if(t) openWheelAudio(t,true);
    });

    overlay.querySelector('#opWheelAudioNext').addEventListener('click',()=>{
      const t=adjacentAudioTechnique(1);
      if(t) openWheelAudio(t,true);
    });

    overlay.querySelector('#opWheelAudioSpeed').addEventListener('click',async event=>{
      audioRate=audioRate===1?1.25:1;
      event.currentTarget.textContent='×'+String(audioRate).replace('.',',');
      event.currentTarget.classList.toggle('op-audio-option-active',audioRate!==1);
      try{if(audioPlayer) await audioPlayer.setPlaybackRate(audioRate);}catch(_){
        toastSafe('Cette vidéo ne permet pas de changer la vitesse');
      }
    });

    overlay.querySelector('#opWheelAudioShuffle').addEventListener('click',event=>{
      audioShuffle=!audioShuffle;
      event.currentTarget.classList.toggle('op-audio-option-active',audioShuffle);
      event.currentTarget.textContent=audioShuffle?'Aléatoire ✓':'Aléatoire';
    });

    overlay.querySelector('#opWheelAudioCard').addEventListener('click',()=>{
      closeAudio();
      if(audioTechniqueId&&typeof window.openFullCard==='function') window.openFullCard(audioTechniqueId);
    });

    overlay.querySelector('#opWheelAudioVideo').addEventListener('click',()=>{
      closeAudio();
      if(audioTechniqueId&&typeof window.openTechnique==='function') window.openTechnique(audioTechniqueId);
    });

    return overlay;
  }

  async function closeAudio(){
    const overlay=document.getElementById('opWheelAudioOverlay');
    try{
      if(audioPlayer) await audioPlayer.pause();
    }catch(_){}
    if(overlay){
      overlay.classList.remove('is-open','is-playing');
      overlay.setAttribute('aria-hidden','true');
    }
  }

  async function openWheelAudio(technique,autoplay){
    const t=technique&&typeof technique==='object'?technique:selectedTechnique();
    if(!t){
      toastSafe('Lancez d’abord la roue');
      return;
    }

    if(!(t.videoUrl || t.vimeoId)){
      toastSafe('Aucune piste vidéo disponible pour cette technique');
      return;
    }

    const overlay=ensureAudioOverlay();
    const title=overlay.querySelector('#opWheelAudioTitle');
    const status=overlay.querySelector('#opWheelAudioStatus');
    const playBtn=overlay.querySelector('#opWheelAudioPlay');
    const wrap=overlay.querySelector('#opWheelAudioIframeWrap');

    if(title) title.textContent=t.title||'Technique';
    if(status) status.textContent='Chargement de la piste audio…';
    if(playBtn) playBtn.textContent='▶ Lecture';

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
    refreshLastViewedAudioCard();
    populateAudioPicker(document.getElementById('opWheelAudioSearch')?.value||'',t.id);

    try{
      if(audioPlayer){
        try{ await audioPlayer.unload(); }catch(_){}
        audioPlayer=null;
      }

      await ensureVimeoApi();

      const src = t.videoUrl
        ? String(t.videoUrl)
        : 'https://player.vimeo.com/video/'+encodeURIComponent(String(t.vimeoId));

      const joiner=src.includes('?')?'&':'?';
      const iframe=document.createElement('iframe');
      iframe.id='opWheelAudioIframe';
      iframe.src=src+joiner+'controls=0&title=0&byline=0&portrait=0&autoplay=0&dnt=1';
      iframe.allow='autoplay; fullscreen; picture-in-picture';
      iframe.setAttribute('title','Lecture audio Ostéo Pratik');

      wrap.innerHTML='';
      wrap.appendChild(iframe);

      audioPlayer=new window.Vimeo.Player(iframe);
      audioTechniqueId=Number(t.id)||0;
      audioTechnique=t;
      let activityRecorded=false;

      audioPlayer.on('play',()=>{
        overlay.classList.add('is-playing');
        if(status) status.textContent='Lecture en cours';
        if(playBtn) playBtn.textContent='❚❚ Pause';
        if(!activityRecorded){
          activityRecorded=true;
          try{window.OSTEO_USER_DATA_V19?.recordActivity?.('audio',t.title||'Révision audio');}catch(_){ }
        }
      });

      audioPlayer.on('pause',()=>{
        overlay.classList.remove('is-playing');
        if(status) status.textContent='En pause';
        if(playBtn) playBtn.textContent='▶ Lecture';
      });

      audioPlayer.on('ended',()=>{
        overlay.classList.remove('is-playing');
        if(status) status.textContent='Lecture terminée';
        if(playBtn) playBtn.textContent='▶ Réécouter';
        const next=adjacentAudioTechnique(1);
        if(next) setTimeout(()=>openWheelAudio(next,true),350);
      });

      audioPlayer.ready().then(async()=>{
        try{await audioPlayer.setPlaybackRate(audioRate);}catch(_){ }
        if(status) status.textContent='Prêt à écouter';
        if(autoplay){
          try{await audioPlayer.play();}catch(_){ }
        }
      }).catch(()=>{});

    }catch(err){
      console.warn('[Ostéo Pratik] Audio roue',err);
      if(status) status.textContent='Audio indisponible';
      toastSafe('Impossible de charger l’audio de cette technique');
    }
  }

  function openWheelQuiz(){
    const t=selectedTechnique();
    if(!t){
      toastSafe('Lancez d’abord la roue');
      return;
    }

    try{
      if(typeof window.go==='function') window.go('quiz');
      else if(typeof go==='function') go('quiz');
    }catch(_){}

    setTimeout(()=>{
      if(window.OSTEO_TESTER && typeof window.OSTEO_TESTER.startTechnique==='function'){
        window.OSTEO_TESTER.startTechnique(Number(t.id));
      }else{
        toastSafe('Quiz de la technique indisponible');
      }
    },40);
  }

  function ensureWheelButtons(){
    const actions=document.querySelector('#revisionWheel .wheel-actions-choice');
    if(!actions) return;

    const voice=document.getElementById('wheelVoiceButton');
    if(voice){
      voice.textContent='Écouter';
      voice.setAttribute('onclick','openSelectedWheelVoice()');
      voice.classList.add('wheel-audio-button');
    }

    let test=document.getElementById('wheelTestButton');
    if(!test){
      test=document.createElement('button');
      test.id='wheelTestButton';
      test.type='button';
      test.className='secondary wheel-choice-button wheel-test-button';
      test.textContent='Me tester · 4 questions';
      test.disabled=true;
      test.setAttribute('onclick','openSelectedWheelQuiz()');

      const video=document.getElementById('wheelVideoButton');
      if(video) actions.insertBefore(test,video.nextSibling);
      else actions.appendChild(test);
    }

    syncTestButtonState();
  }

  function syncTestButtonState(){
    const test=document.getElementById('wheelTestButton');
    const card=document.getElementById('wheelCardButton');
    if(!test) return;

    const ready=!!(card && !card.disabled && selectedTechnique());
    test.disabled=!ready;
    test.classList.toggle('ready',ready);
  }

  function installOverrides(){
    window.openSelectedWheelVoice=openWheelAudio;
    window.openSelectedWheelQuiz=openWheelQuiz;
    try{ openSelectedWheelVoice=openWheelAudio; }catch(_){}
    try{ openSelectedWheelQuiz=openWheelQuiz; }catch(_){}

    ensureWheelButtons();

    try{
      if(typeof renderRevisionWheel==='function' && !renderRevisionWheel.__app13WheelWrapped){
        const original=renderRevisionWheel;
        const wrapped=function(){
          const result=original.apply(this,arguments);
          ensureWheelButtons();
          syncTestButtonState();
          setTimeout(syncTestButtonState,50);
          return result;
        };
        wrapped.__app13WheelWrapped=true;
        renderRevisionWheel=wrapped;
        window.renderRevisionWheel=wrapped;
      }
    }catch(_){}

    try{
      if(typeof spinRevisionWheel==='function' && !spinRevisionWheel.__app13WheelWrapped){
        const original=spinRevisionWheel;
        const wrapped=function(){
          ensureWheelButtons();
          const test=document.getElementById('wheelTestButton');
          if(test){test.disabled=true;test.classList.remove('ready');}
          const result=original.apply(this,arguments);
          [500,1500,3300,3500].forEach(ms=>setTimeout(syncTestButtonState,ms));
          return result;
        };
        wrapped.__app13WheelWrapped=true;
        spinRevisionWheel=wrapped;
        window.spinRevisionWheel=wrapped;
      }
    }catch(_){}
  }

  installOverrides();
  document.addEventListener('DOMContentLoaded',installOverrides,{once:true});
  [150,600,1400].forEach(ms=>setTimeout(installOverrides,ms));

  // Suit aussi les changements disabled du bouton Carte.
  const observer=new MutationObserver(()=>{
    ensureWheelButtons();
    syncTestButtonState();
  });
  const startObserve=()=>{
    const card=document.getElementById('wheelCardButton');
    if(card) observer.observe(card,{attributes:true,attributeFilter:['disabled','class']});
  };
  startObserve();
  setTimeout(startObserve,600);

  window.OSTEO_WHEEL_V2={
    version:'13.0',
    audio:openWheelAudio,
    quiz:openWheelQuiz,
    nextAudio:()=>{const t=adjacentAudioTechnique(1);if(t) return openWheelAudio(t,true);},
    previousAudio:()=>{const t=adjacentAudioTechnique(-1);if(t) return openWheelAudio(t,true);}
  };
})();


/* ==============================================================
   OSTÉO PRATIK — APP14 · TEXTE CENTRAL DE LA ROUE
   --------------------------------------------------------------
   Objectif :
   - texte plus lisible au centre
   - rotation plus propre pendant l'animation
   - arrêt final à l'horizontale
   ============================================================== */
(function(){
  'use strict';

  if(window.__osteoWheelCenterTextFixApp14) return;
  window.__osteoWheelCenterTextFixApp14 = true;

  function ensureStyles(){
    if(document.getElementById('opWheelTextFixStylesApp14')) return;

    const style=document.createElement('style');
    style.id='opWheelTextFixStylesApp14';
    style.textContent=`
      #revisionWheelDisc .wheel-core{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
      }

      #wheelTicker{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        width:90px !important;
        max-width:90px !important;
        min-height:60px !important;
        margin:0 auto !important;
        padding:0 2px !important;
        text-align:center !important;
        white-space:normal !important;
        text-wrap:balance !important;
        word-break:normal !important;
        overflow-wrap:anywhere !important;
        line-height:1.04 !important;
        font-size:12px !important;
        font-weight:900 !important;
        letter-spacing:.01em !important;
        transform:rotate(var(--op-wheel-ticker-rotation, 0deg)) !important;
        transform-origin:center center !important;
        transition:transform 120ms linear, opacity 180ms ease !important;
      }

      #revisionWheelDisc.spinning #wheelTicker{
        opacity:.96;
      }

      #revisionWheelDisc.selected #wheelTicker{
        opacity:1;
      }
    `;
    document.head.appendChild(style);
  }

  function extractAngle(transformText){
    const text=String(transformText||'');
    const m=text.match(/rotate\(([-\d.]+)deg\)/i);
    if(m) return Number(m[1]) || 0;
    return 0;
  }

  function shortenCenterText(value){
    const clean=String(value||'').replace(/\s+/g,' ').trim();
    if(!clean) return 'Appuyez ici';
    if(clean.length <= 26) return clean;
    return clean.slice(0, 24).trim() + '…';
  }

  function formatCurrentTickerText(){
    const ticker=document.getElementById('wheelTicker');
    const disc=document.getElementById('revisionWheelDisc');
    if(!ticker) return;

    // Après le tirage, APP14 ne doit plus retronquer le titre restauré par APP15.
    try{
      if(disc?.classList.contains('selected') &&
         typeof getSelectedWheelTechnique==='function'){
        const selected=getSelectedWheelTechnique();
        if(selected?.title){
          ticker.textContent=String(selected.title);
          return;
        }
      }
    }catch(_){}

    const text=String(ticker.textContent || '').trim();
    if(!text) return;
    ticker.textContent = shortenCenterText(text);
  }

  function applyCounterRotation(){
    const disc=document.getElementById('revisionWheelDisc');
    const ticker=document.getElementById('wheelTicker');
    if(!disc || !ticker) return;

    const inlineAngle = extractAngle(disc.style.transform);
    const angle = inlineAngle || extractAngle(getComputedStyle(disc).transform);
    ticker.style.setProperty('--op-wheel-ticker-rotation', (-angle) + 'deg');

    formatCurrentTickerText();
  }

  function observeDisc(){
    const disc=document.getElementById('revisionWheelDisc');
    if(!disc || disc.__opWheelObserverApp14) return;

    const obs=new MutationObserver(()=>{
      applyCounterRotation();
      setTimeout(applyCounterRotation,30);
    });

    obs.observe(disc,{attributes:true,attributeFilter:['style','class']});
    disc.__opWheelObserverApp14 = obs;
  }

  function install(){
    ensureStyles();
    observeDisc();
    applyCounterRotation();
    setTimeout(applyCounterRotation,40);
    setTimeout(applyCounterRotation,180);
  }

  // On recadre aussi le texte juste après les fonctions de roue existantes.
  try{
    if(typeof renderRevisionWheel==='function' && !renderRevisionWheel.__app14TextWrapped){
      const original=renderRevisionWheel;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        install();
        [30,120,260].forEach(ms=>setTimeout(applyCounterRotation,ms));
        return result;
      };
      wrapped.__app14TextWrapped=true;
      renderRevisionWheel=wrapped;
      window.renderRevisionWheel=wrapped;
    }
  }catch(_){}

  try{
    if(typeof spinRevisionWheel==='function' && !spinRevisionWheel.__app14TextWrapped){
      const original=spinRevisionWheel;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        [30,120,300,700,1200,1800,2600,3300,3500].forEach(ms=>setTimeout(applyCounterRotation,ms));
        return result;
      };
      wrapped.__app14TextWrapped=true;
      spinRevisionWheel=wrapped;
      window.spinRevisionWheel=wrapped;
    }
  }catch(_){}

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  [100,500,1200].forEach(ms=>setTimeout(install,ms));

  window.OSTEO_WHEEL_TEXT_FIX = {
    version:'14.0',
    refresh:install
  };
})();


/* ==============================================================
   OSTÉO PRATIK — APP15 · CENTRE DE ROUE
   --------------------------------------------------------------
   - titre complet, non tronqué
   - centre lisible sur plusieurs lignes
   - TAP déplacé sur un petit cercle extérieur
   ============================================================== */
(function(){
  'use strict';

  if(window.__osteoWheelCenterApp15) return;
  window.__osteoWheelCenterApp15=true;

  function ensureStyles(){
    if(document.getElementById('opWheelCenterStylesApp15')) return;

    const style=document.createElement('style');
    style.id='opWheelCenterStylesApp15';
    style.textContent=`
      /* Le cercle central garde uniquement le titre */
      #revisionWheelDisc .wheel-core{
        width:126px !important;
        height:126px !important;
        padding:10px !important;
        overflow:visible !important;
      }

      #wheelTicker{
        width:104px !important;
        max-width:104px !important;
        min-height:0 !important;
        padding:0 !important;
        display:block !important;
        color:#fff !important;
        font-size:10.2px !important;
        line-height:1.02 !important;
        font-weight:950 !important;
        letter-spacing:-.025em !important;
        text-align:center !important;
        white-space:normal !important;
        word-break:normal !important;
        overflow-wrap:break-word !important;

        /* Annule les anciennes coupures */
        overflow:visible !important;
        text-overflow:clip !important;
        -webkit-line-clamp:unset !important;
        -webkit-box-orient:unset !important;
        max-height:none !important;
      }

      /* Le badge TAP sort du cercle central */
      #revisionWheelDisc .wheel-core::after{
        content:"TAP" !important;
        position:absolute !important;
        width:34px !important;
        height:34px !important;
        right:-38px !important;
        top:50% !important;
        bottom:auto !important;
        left:auto !important;

        display:grid !important;
        place-items:center !important;

        border-radius:50% !important;
        border:1px solid rgba(0,229,255,.62) !important;
        background:
          radial-gradient(circle at 35% 30%,rgba(255,255,255,.10),transparent 34%),
          rgba(3,18,34,.96) !important;

        color:#6cecff !important;
        font-size:7px !important;
        line-height:1 !important;
        font-weight:950 !important;
        letter-spacing:.08em !important;
        text-transform:uppercase !important;

        box-shadow:
          0 0 18px rgba(0,229,255,.20),
          inset 0 1px 0 rgba(255,255,255,.08) !important;

        transform:translateY(-50%) !important;
        z-index:5 !important;
      }

      /* Le badge disparaît pendant/après le tirage */
      #revisionWheelDisc.spinning .wheel-core::after,
      #revisionWheelDisc.selected .wheel-core::after{
        opacity:0 !important;
        pointer-events:none !important;
      }

      @media(max-width:430px){
        #revisionWheelDisc .wheel-core{
          width:122px !important;
          height:122px !important;
          padding:9px !important;
        }

        #wheelTicker{
          width:101px !important;
          max-width:101px !important;
          font-size:9.8px !important;
          line-height:1.01 !important;
        }

        #revisionWheelDisc .wheel-core::after{
          width:32px !important;
          height:32px !important;
          right:-34px !important;
          top:50% !important;
          bottom:auto !important;
          transform:translateY(-50%) !important;
          font-size:6.5px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function restoreFullTicker(){
    const ticker=document.getElementById('wheelTicker');
    if(!ticker) return;

    /*
      APP14 raccourcissait le texte au centre.
      Ici on réinjecte le titre complet de la technique sélectionnée
      dès que la roue a fini son tirage.
    */
    try{
      const disc=document.getElementById('revisionWheelDisc');
      if(disc?.classList.contains('selected') &&
         typeof getSelectedWheelTechnique==='function'){
        const t=getSelectedWheelTechnique();
        if(t?.title) ticker.textContent=String(t.title);
      }
    }catch(_){}
  }

  function install(){
    ensureStyles();
    restoreFullTicker();
  }

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  [100,400,1000,1800].forEach(ms=>setTimeout(install,ms));

  // Après un tirage, APP14 peut encore raccourcir le texte :
  // on restaure le titre complet à la fin de l'animation.
  try{
    if(typeof spinRevisionWheel==='function' && !spinRevisionWheel.__app15CenterWrapped){
      const original=spinRevisionWheel;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        [3250,3350,3500,3800].forEach(ms=>setTimeout(()=>{
          restoreFullTicker();
          try{
            if(window.OSTEO_WHEEL_TEXT_FIX?.refresh){
              window.OSTEO_WHEEL_TEXT_FIX.refresh();
            }
          }catch(_){}
        },ms));
        return result;
      };
      wrapped.__app15CenterWrapped=true;
      spinRevisionWheel=wrapped;
      window.spinRevisionWheel=wrapped;
    }
  }catch(_){}

  const observer=new MutationObserver(()=>{
    const disc=document.getElementById('revisionWheelDisc');
    if(disc?.classList.contains('selected')){
      setTimeout(restoreFullTicker,20);
    }
  });

  function observe(){
    const disc=document.getElementById('revisionWheelDisc');
    if(disc && !disc.__op15Observed){
      observer.observe(disc,{attributes:true,attributeFilter:['class']});
      disc.__op15Observed=true;
    }
  }

  observe();
  setTimeout(observe,500);

  window.OSTEO_WHEEL_CENTER_V15={
    version:'15.0',
    refresh:install
  };
})();

/* =========================================================
   OSTÉO PRATIK — APP21 · LISIBILITÉ DES ACTIONS SOUS LA ROUE
   Dégradé distinct par action, sans modification fonctionnelle.
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoWheelActionsGradientApp21) return;
  window.__osteoWheelActionsGradientApp21=true;

  function install(){
    if(document.getElementById('opWheelActionsGradientApp21')) return;
    const style=document.createElement('style');
    style.id='opWheelActionsGradientApp21';
    style.textContent=`
      #revisionWheel .wheel-actions-choice{
        gap:12px !important;
      }
      #revisionWheel .wheel-actions-choice .wheel-choice-button{
        position:relative !important;
        overflow:hidden !important;
        min-height:58px !important;
        padding:0 14px !important;
        border-width:1px !important;
        border-style:solid !important;
        color:#fff !important;
        font-weight:950 !important;
        line-height:1.15 !important;
        text-shadow:0 1px 3px rgba(0,0,0,.55) !important;
        transition:transform .18s ease,filter .18s ease,box-shadow .18s ease !important;
      }
      #revisionWheel .wheel-actions-choice .wheel-choice-button::before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:linear-gradient(180deg,rgba(255,255,255,.15),transparent 46%,rgba(0,0,0,.09));
      }
      #revisionWheel #wheelCardButton{
        border-color:rgba(67,216,255,.58) !important;
        background:linear-gradient(135deg,#0879a5 0%,#075a91 48%,#243fa2 100%) !important;
        box-shadow:0 9px 24px rgba(0,151,210,.18) !important;
      }
      #revisionWheel #wheelVoiceButton{
        border-color:rgba(44,239,198,.56) !important;
        background:linear-gradient(135deg,#087f7c 0%,#08726e 48%,#08605f 100%) !important;
        box-shadow:0 9px 24px rgba(0,205,170,.16) !important;
      }
      #revisionWheel #wheelVideoButton{
        border-color:rgba(255,184,73,.62) !important;
        background:linear-gradient(135deg,#b86613 0%,#a34825 52%,#863246 100%) !important;
        box-shadow:0 9px 24px rgba(255,139,45,.16) !important;
      }
      #revisionWheel #wheelTestButton{
        border-color:rgba(205,132,255,.62) !important;
        background:linear-gradient(135deg,#7d3ab5 0%,#6232a4 50%,#3d3ba6 100%) !important;
        box-shadow:0 9px 24px rgba(151,82,235,.18) !important;
      }
      #revisionWheel .wheel-actions-choice .wheel-choice-button:disabled{
        opacity:.48 !important;
        color:rgba(234,241,250,.78) !important;
        filter:saturate(.48) brightness(.67) !important;
        box-shadow:none !important;
        cursor:not-allowed !important;
      }
      #revisionWheel .wheel-actions-choice .wheel-choice-button.ready,
      #revisionWheel .wheel-actions-choice .wheel-choice-button:not(:disabled){
        opacity:1 !important;
        filter:none !important;
      }
      @media(hover:hover){
        #revisionWheel .wheel-actions-choice .wheel-choice-button:not(:disabled):hover{
          transform:translateY(-2px) !important;
          filter:brightness(1.09) !important;
        }
      }
      #revisionWheel .wheel-actions-choice .wheel-choice-button:not(:disabled):active{
        transform:translateY(0) scale(.985) !important;
      }
      @media(max-width:380px){
        #revisionWheel .wheel-actions-choice .wheel-choice-button{
          min-height:54px !important;
          padding:0 10px !important;
          font-size:13px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  setTimeout(install,500);
  window.OSTEO_WHEEL_ACTIONS_GRADIENT_APP21={version:'21.0',refresh:install};
})();

/* =========================================================
   OSTÉO PRATIK — APP23 · ENTRÉE « RÉVISER EN ÉCOUTANT »
   Le menu Réviser utilise le même lecteur que la roue et la même
   source Supabase de techniques réellement vues.
   ========================================================= */
(function(){
  'use strict';
  if(window.__osteoRevisionAudioEntryApp23) return;
  window.__osteoRevisionAudioEntryApp23=true;

  function toastAudio(message){
    try{
      if(typeof window.toast==='function') return window.toast(message);
      if(typeof toast==='function') return toast(message);
    }catch(_){ }
  }

  function availableAudioTechniques(){
    try{
      if(typeof window.getViewedTechniquesForWheel==='function'){
        return (window.getViewedTechniquesForWheel()||[])
          .filter(t=>t&&(t.videoUrl||t.vimeoId))
          .sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'fr',{sensitivity:'base'}));
      }
      if(typeof getViewedTechniquesForWheel==='function'){
        return (getViewedTechniquesForWheel()||[])
          .filter(t=>t&&(t.videoUrl||t.vimeoId))
          .sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'fr',{sensitivity:'base'}));
      }
    }catch(_){ }
    return [];
  }

  function lastViewedAudioTechnique(list){
    try{
      const saved=JSON.parse(localStorage.getItem('osteoPratikLastPractice')||'null');
      if(saved?.id){
        const match=(list||[]).find(t=>String(t.id)===String(saved.id));
        if(match) return match;
      }
    }catch(_){ }
    return (list||[])[0]||null;
  }

  function openRevisionAudioMode(){
    const list=availableAudioTechniques();
    if(!list.length){
      toastAudio('Visionnez d’abord une technique complète pour la réviser en audio');
      return;
    }
    const first=lastViewedAudioTechnique(list);
    if(window.OSTEO_WHEEL_V2?.audio){
      window.OSTEO_WHEEL_V2.audio(first,false);
      return;
    }
    toastAudio('Le lecteur audio est en cours de chargement');
  }

  function connectEntry(){
    const candidates=[...document.querySelectorAll('#revision .revision-orbit-card')];
    const button=candidates.find(node=>
      node.classList.contains('revision-review') ||
      /réviser en écoutant/i.test(node.textContent||'')
    );
    if(!button) return false;
    button.setAttribute('onclick','openRevisionAudioMode()');
    button.setAttribute('aria-label','Réviser en écoutant les techniques déjà vues');
    button.dataset.audioConnected='app23';
    return true;
  }

  window.openRevisionAudioMode=openRevisionAudioMode;
  try{openRevisionAudioMode=window.openRevisionAudioMode;}catch(_){ }
  connectEntry();
  document.addEventListener('DOMContentLoaded',connectEntry,{once:true});
  [100,500,1200,2500].forEach(ms=>setTimeout(connectEntry,ms));
  window.OSTEO_REVISION_AUDIO_APP23={version:'23.0',open:openRevisionAudioMode,refresh:connectEntry};
})();
