/* ==============================================================
   OSTÉO PRATIK — INTÉGRATION CARTES V22.2 DANS L'APPLICATION
   --------------------------------------------------------------
   Révision > Roue > Visionner la carte
   Révision > Déjà vues > ouverture d'une carte
   Le graphisme V22.2 n'est pas modifié.
   ============================================================== */
(function(){
  'use strict';

  const VERSION = '22.2-app-1';
  const originalOpenFullCard =
    (typeof window.openFullCard === 'function') ? window.openFullCard.bind(window) : null;

  let depsPromise = null;
  let currentTechniqueId = null;
  let previousBodyOverflow = '';

  function toastSafe(message){
    try{
      if(typeof toast === 'function') return toast(message);
      if(typeof window.toast === 'function') return window.toast(message);
    }catch(_){}
    console.info('[Ostéo Pratik]', message);
  }

  function getTechniques(){
    try{
      if(typeof techniques !== 'undefined' && Array.isArray(techniques)) return techniques;
    }catch(_){}
    if(Array.isArray(window.techniques)) return window.techniques;
    return [];
  }

  function getTechnique(id){
    return getTechniques().find(t => Number(t.id) === Number(id)) || null;
  }

  function isUnlocked(t){
    try{
      if(typeof isTechniqueUnlocked === 'function') return !!isTechniqueUnlocked(t);
    }catch(_){}
    try{
      if(typeof window.isTechniqueUnlocked === 'function') return !!window.isTechniqueUnlocked(t);
    }catch(_){}
    return true;
  }

  function ensureStyle(id, href){
    if(document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(id, src, ready){
    if(ready && ready()) return Promise.resolve();

    const found = document.getElementById(id);
    if(found){
      return new Promise((resolve,reject)=>{
        const start = Date.now();
        (function wait(){
          if(!ready || ready()) return resolve();
          if(Date.now()-start > 12000) return reject(new Error('Chargement incomplet : '+src));
          setTimeout(wait,60);
        })();
      });
    }

    return new Promise((resolve,reject)=>{
      const s = document.createElement('script');
      s.id = id;
      s.src = src;
      s.async = false;
      s.onload = ()=>resolve();
      s.onerror = ()=>reject(new Error('Impossible de charger '+src));
      document.head.appendChild(s);
    });
  }

  function ensureDependencies(){
    if(depsPromise) return depsPromise;

    ensureStyle('op22-app-base-css','playing-cards-v22.css?v=22.0');
    ensureStyle('op22-app-premium-css','playing-cards-v22_2.css?v=22.2');

    depsPromise = (async()=>{
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
      depsPromise = null;
      throw err;
    });

    return depsPromise;
  }

  function ensureOverlay(){
    let overlay = document.getElementById('op22AppCardOverlay');
    if(overlay) return overlay;

    const style = document.createElement('style');
    style.id = 'op22-app-overlay-css';
    style.textContent = `
      #op22AppCardOverlay{
        position:fixed;inset:0;z-index:2147482000;
        display:none;align-items:center;justify-content:center;
        padding:18px;background:rgba(1,7,14,.88);
        backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);
      }
      #op22AppCardOverlay.is-open{display:flex}
      #op22AppCardOverlay .op22-app-shell{
        position:relative;width:min(520px,100%);max-height:96vh;
        display:flex;flex-direction:column;align-items:center;gap:12px;
      }
      #op22AppCardOverlay .op22-app-head{
        width:min(430px,94vw);display:flex;align-items:center;
        justify-content:space-between;gap:12px;color:#fff;
      }
      #op22AppCardOverlay .op22-app-head-text{
        min-width:0;display:flex;flex-direction:column;gap:3px
      }
      #op22AppCardOverlay .op22-app-head-text small{
        color:#7feeff;font-size:10px;font-weight:900;
        text-transform:uppercase;letter-spacing:.15em
      }
      #op22AppCardOverlay .op22-app-head-text strong{
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:14px
      }
      #op22AppCardOverlay .op22-app-close{
        flex:0 0 auto;width:42px;height:42px;border-radius:50%;
        border:1px solid rgba(126,238,255,.55);
        background:rgba(3,18,31,.82);color:#fff;font-size:27px;
        line-height:1;cursor:pointer
      }
      #op22AppCardStage{
        width:100%;overflow:auto;overscroll-behavior:contain;
        padding:2px 0 5px
      }
      #op22AppCardOverlay .op22-app-actions{
        width:min(430px,94vw);display:grid;grid-template-columns:1fr 1fr;
        gap:9px
      }
      #op22AppCardOverlay .op22-app-actions button{
        min-height:44px;border-radius:14px;padding:10px 13px;
        font-weight:900;cursor:pointer
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
        #op22AppCardOverlay .op22-app-head{padding:0 2px}
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'op22AppCardOverlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML = `
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
      if(e.target === overlay) closePremiumCard();
    });
    overlay.querySelector('#op22AppFlipBtn').addEventListener('click',()=>{
      overlay.querySelector('.op22-card')?.classList.toggle('is-flipped');
    });
    overlay.querySelector('#op22AppVideoBtn').addEventListener('click',()=>{
      const id = currentTechniqueId;
      closePremiumCard();
      try{
        if(typeof openTechnique === 'function') return openTechnique(id);
      }catch(_){}
      if(typeof window.openTechnique === 'function') window.openTechnique(id);
    });

    return overlay;
  }

  function resolveRef(t,api){
    const candidates = [
      t?.slug,
      t?.sourceRow,
      t?.title,
      String(t?.id ?? '')
    ].filter(v=>v!==undefined && v!==null && String(v).trim());

    for(const ref of candidates){
      try{
        if(api?.find?.(ref)) return ref;
      }catch(_){}
    }
    return null;
  }

  async function openPremiumCard(id){
    const t = getTechnique(id);
    if(!t){
      if(originalOpenFullCard) return originalOpenFullCard(id);
      return toastSafe('Technique introuvable');
    }

    if(!isUnlocked(t)){
      toastSafe('Carte non débloquée');
      return;
    }

    let api;
    try{
      api = await ensureDependencies();
    }catch(err){
      console.warn('[Ostéo Pratik] Cartes V22.2 indisponibles',err);
      if(originalOpenFullCard) return originalOpenFullCard(id);
      toastSafe('Carte indisponible');
      return;
    }

    const ref = resolveRef(t,api);
    if(!ref){
      console.warn('[Ostéo Pratik] Correspondance V22.2 introuvable pour',t);
      if(originalOpenFullCard) return originalOpenFullCard(id);
      toastSafe('Carte indisponible pour cette technique');
      return;
    }

    const overlay = ensureOverlay();
    const stage = overlay.querySelector('#op22AppCardStage');
    const title = overlay.querySelector('#op22AppCardTitle');
    currentTechniqueId = Number(t.id);
    if(title) title.textContent = t.title || 'Technique';

    try{
      await api.render(ref,stage);
    }catch(err){
      console.warn('[Ostéo Pratik] Rendu carte V22.2 impossible',err);
      if(originalOpenFullCard) return originalOpenFullCard(id);
      toastSafe('Impossible d’afficher cette carte');
      return;
    }

    const legacy = document.getElementById('cardFullscreenOverlay');
    if(legacy){
      legacy.classList.remove('open','show','active');
      legacy.setAttribute('aria-hidden','true');
    }

    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
  }

  function closePremiumCard(){
    const overlay = document.getElementById('op22AppCardOverlay');
    if(!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = previousBodyOverflow || '';
    currentTechniqueId = null;
  }

  window.openPremiumRevisionCard = openPremiumCard;
  window.closePremiumRevisionCard = closePremiumCard;

  // La roue et l'album "Déjà vues" appellent déjà openFullCard().
  window.openFullCard = function(id){
    return openPremiumCard(id);
  };

  document.addEventListener('keydown',e=>{
    if(e.key === 'Escape' && document.getElementById('op22AppCardOverlay')?.classList.contains('is-open')){
      closePremiumCard();
    }
  });

  // Préchargement non bloquant.
  const warmup = ()=>ensureDependencies().catch(err=>{
    console.warn('[Ostéo Pratik] Préchargement cartes V22.2 différé',err);
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',warmup,{once:true});
  }else{
    setTimeout(warmup,0);
  }

  window.OSTEO_REVISION_CARDS_V22_2 = {
    version: VERSION,
    open: openPremiumCard,
    close: closePremiumCard,
    ready: ensureDependencies
  };
})();
