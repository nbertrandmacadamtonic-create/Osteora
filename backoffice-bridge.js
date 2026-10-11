/* === V15.2 · INTRO VIDÉO AVANT L’ACCUEIL === */
(function(){
  'use strict';

  const VIDEO_SRC='assets/videos/osteo-pratik-intro.mp4';
  const SESSION_KEY='osteoPratik.intro.v15.2.seen';

  function installIntro(){
    try{
      if(sessionStorage.getItem(SESSION_KEY)==='1') return;
    }catch(_){}

    if(document.getElementById('osteoPratikIntro')) return;

    const previousOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';

    const style=document.createElement('style');
    style.id='osteoPratikIntroStyles';
    style.textContent=`
      #osteoPratikIntro{
        position:fixed;
        inset:0;
        z-index:2147483647;
        display:grid;
        place-items:center;
        background:#020714;
        overflow:hidden;
        opacity:1;
        transition:opacity .55s ease;
      }
      #osteoPratikIntro.osteo-intro-leave{
        opacity:0;
        pointer-events:none;
      }
      #osteoPratikIntro::before{
        content:"";
        position:absolute;
        inset:-8%;
        background:
          radial-gradient(circle at 50% 34%,rgba(0,229,255,.11),transparent 34%),
          radial-gradient(circle at 50% 76%,rgba(37,120,255,.10),transparent 38%),
          #020714;
        filter:blur(8px);
      }
      #osteoPratikIntro video{
        position:relative;
        z-index:1;
        display:block;
        width:min(100vw,720px);
        height:100dvh;
        max-height:100dvh;
        object-fit:contain;
        background:#020714;
      }
      #osteoPratikIntro .osteo-intro-actions{
        position:absolute;
        z-index:3;
        top:max(14px,env(safe-area-inset-top));
        right:max(14px,env(safe-area-inset-right));
        display:flex;
        gap:8px;
      }
      #osteoPratikIntro button{
        border:1px solid rgba(255,255,255,.20);
        border-radius:999px;
        padding:9px 13px;
        color:#fff;
        background:rgba(2,7,20,.56);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        font:700 12px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
        cursor:pointer;
        box-shadow:0 8px 28px rgba(0,0,0,.24);
      }
      #osteoPratikIntro button:hover{
        background:rgba(7,31,58,.78);
        border-color:rgba(0,229,255,.42);
      }
      @media(max-width:760px){
        #osteoPratikIntro video{
          width:100vw;
          height:100dvh;
          object-fit:cover;
        }
      }
    `;
    document.head.appendChild(style);

    const overlay=document.createElement('div');
    overlay.id='osteoPratikIntro';
    overlay.innerHTML=`
      <video autoplay muted playsinline preload="auto" aria-label="Introduction Ostéo Pratik">
        <source src="${VIDEO_SRC}" type="video/mp4">
      </video>
      <div class="osteo-intro-actions">
        <button type="button" class="osteo-intro-sound">🔊 Son</button>
        <button type="button" class="osteo-intro-skip">Passer</button>
      </div>
    `;

    const closeIntro=()=>{
      if(!overlay.isConnected) return;
      try{ sessionStorage.setItem(SESSION_KEY,'1'); }catch(_){}
      overlay.classList.add('osteo-intro-leave');
      setTimeout(()=>{
        overlay.remove();
        style.remove();
        document.documentElement.style.overflow=previousOverflow;
      },560);
    };

    const video=overlay.querySelector('video');
    const soundBtn=overlay.querySelector('.osteo-intro-sound');

    soundBtn.addEventListener('click',()=>{
      video.muted=!video.muted;
      soundBtn.textContent=video.muted?'🔊 Son':'🔇 Couper le son';
      if(video.paused) video.play().catch(()=>{});
    });

    overlay.querySelector('.osteo-intro-skip').addEventListener('click',closeIntro);
    video.addEventListener('ended',closeIntro,{once:true});
    video.addEventListener('error',()=>setTimeout(closeIntro,350),{once:true});

    document.body.appendChild(overlay);

    const playPromise=video.play();
    if(playPromise && typeof playPromise.catch==='function'){
      playPromise.catch(()=>{
        video.muted=true;
        video.play().catch(()=>{});
      });
    }
  }

  if(document.body) installIntro();
  else document.addEventListener('DOMContentLoaded',installIntro,{once:true});
})();


/*
  Ostéo RA / Ostéo Pratik — Bridge central Supabase V5
  - app.js, styles.css et la navigation Ostéo RA restent intacts.
  - les données publiques viennent de Supabase.
  - les fiches détaillées éditées dans le back-office sont lues via t.detail.
  - une copie enrichie des fiches originales d’Ostéo RA est mise à disposition
    du back-office pour l’import initial / la récupération des textes et images.
*/
(function(){
  'use strict';

  const CONFIG_SRC='supabase-config.js';
  const TABLE='osteo_techniques';
  const LOCAL_SNAPSHOT_KEY='osteoRA.backoffice.snapshot.v1';
  const LOCAL_DETAIL_SNAPSHOT_KEY='osteoRA.backoffice.snapshot.v2.details';

  let originalDetailResolver=null;
  let detailOverrideInstalled=false;

  function clone(v){
    try{return structuredClone(v);}
    catch(_){return JSON.parse(JSON.stringify(v));}
  }

  function getTechniques(){
    try{
      if(typeof techniques!=='undefined' && Array.isArray(techniques)) return techniques;
    }catch(_){}
    try{
      if(Array.isArray(window.techniques)) return window.techniques;
    }catch(_){}
    return null;
  }

  function resolveGlobalFunction(name){
    try{
      if(typeof window[name]==='function') return window[name];
    }catch(_){}
    try{
      return eval('typeof '+name+'==="function"?'+name+':null');
    }catch(_){}
    return null;
  }

  function captureOriginalDetailResolver(){
    if(originalDetailResolver) return originalDetailResolver;
    const fn=resolveGlobalFunction('getTechniqueDetail');
    if(fn && !fn.__osteoCentralDetailOverride){
      originalDetailResolver=fn;
    }
    return originalDetailResolver;
  }

  function hasCentralDetail(t){
    const d=t&&t.detail;
    return !!(d && (
      String(d.intro||'').trim() ||
      String(d.category||'').trim() ||
      String(d.method||'').trim() ||
      (Array.isArray(d.steps) && d.steps.length) ||
      (Array.isArray(d.images) && d.images.length)
    ));
  }

  function installDetailOverride(){
    if(detailOverrideInstalled) return;
    const original=captureOriginalDetailResolver();
    if(typeof original!=='function') return;

    const wrapped=function(t){
      if(t && hasCentralDetail(t)) return t.detail;
      return original(t);
    };
    wrapped.__osteoCentralDetailOverride=true;
    wrapped.__osteoOriginal=original;

    try{
      getTechniqueDetail=wrapped;
      window.getTechniqueDetail=wrapped;
      detailOverrideInstalled=true;
    }catch(error){
      console.warn('[Ostéo Pratik] Impossible d’installer la surcouche fiche détaillée.',error);
    }
  }

  function refreshKnownViews(){
    [
      'renderTechniques','renderSeenCollections','renderRevisionWheel',
      'renderCatalogueSearch','updateHomeCount','updateCatalogueCounts',
      'updateProgressZoneStats'
    ].forEach(name=>{
      try{
        const fn=resolveGlobalFunction(name);
        if(typeof fn==='function') fn();
      }catch(_){}
    });

    // Si une fiche est déjà ouverte, on la redessine avec les données centrales.
    try{
      const detailScreen=document.getElementById('techniqueDetail');
      const render=resolveGlobalFunction('renderTechniqueDetail');
      if(detailScreen?.classList.contains('active') && typeof render==='function') render();
    }catch(_){}
  }

  function saveOriginalSnapshot(){
    const list=getTechniques();
    if(!list) return;
    try{
      if(!localStorage.getItem(LOCAL_SNAPSHOT_KEY)){
        localStorage.setItem(LOCAL_SNAPSHOT_KEY,JSON.stringify(clone(list)));
      }
    }catch(_){}
  }

  function buildDetailedSnapshot(){
    const list=getTechniques();
    if(!list) return [];

    const resolver=captureOriginalDetailResolver();
    const enriched=list.map(t=>{
      const copy=clone(t);
      let detail=null;

      // Priorité à la fiche originale d’Ostéo RA pour permettre une récupération fiable.
      try{
        if(typeof resolver==='function') detail=resolver(t);
      }catch(_){}

      // Si aucune fiche originale n'est trouvée, conserver la fiche centrale éventuelle.
      if(!detail && t.detail) detail=t.detail;
      if(detail) copy.detail=clone(detail);

      return copy;
    });

    try{
      localStorage.setItem(LOCAL_DETAIL_SNAPSHOT_KEY,JSON.stringify(enriched));
      localStorage.setItem(LOCAL_DETAIL_SNAPSHOT_KEY+'.updatedAt',String(Date.now()));
    }catch(error){
      console.warn('[Ostéo Pratik] Snapshot détaillé trop volumineux ou indisponible.',error);
    }
    return enriched;
  }

  function loadConfig(){
    return new Promise(resolve=>{
      if(window.OSTEO_SUPABASE){resolve(window.OSTEO_SUPABASE);return;}
      const script=document.createElement('script');
      script.src=CONFIG_SRC;
      script.onload=()=>resolve(window.OSTEO_SUPABASE||null);
      script.onerror=()=>resolve(null);
      document.head.appendChild(script);
    });
  }

  function configured(c){
    return c
      && /^https:\/\/.+\.supabase\.co$/i.test(String(c.url||'').trim())
      && String(c.anonKey||'').length>20
      && !String(c.url).includes('VOTRE-PROJET')
      && !String(c.anonKey).includes('VOTRE_CLE');
  }

  async function loadCentral(){
    const list=getTechniques();
    if(!list) return false;

    captureOriginalDetailResolver();
    saveOriginalSnapshot();
    buildDetailedSnapshot();
    installDetailOverride();

    const c=await loadConfig();
    if(!configured(c)) return false;

    const url=c.url.replace(/\/$/,'')+'/rest/v1/'+TABLE+'?select=id,data&order=id.asc';

    try{
      const response=await fetch(url,{
        headers:{
          apikey:c.anonKey,
          Authorization:'Bearer '+c.anonKey,
          Accept:'application/json'
        },
        cache:'no-store'
      });
      if(!response.ok) throw new Error('HTTP '+response.status);
      const rows=await response.json();
      if(!Array.isArray(rows) || !rows.length) return false;

      const remote=rows.map(r=>r&&r.data).filter(Boolean);
      list.splice(0,list.length,...remote);

      // Recrée aussi un snapshot détaillé en se basant sur les techniques centrales
      // et le moteur de fiches d’origine encore disponible.
      buildDetailedSnapshot();
      installDetailOverride();
      refreshKnownViews();

      window.dispatchEvent(new CustomEvent('osteo-central-data-loaded',{
        detail:{
          count:remote.length,
          detailed:remote.filter(hasCentralDetail).length
        }
      }));
      return true;
    }catch(error){
      console.warn('[Ostéo Pratik] Base centrale indisponible, catalogue local conservé.',error);
      return false;
    }
  }

  window.OsteoRACentralBridge={
    reload:loadCentral,
    exportDetailedSnapshot:buildDetailedSnapshot
  };

  captureOriginalDetailResolver();
  saveOriginalSnapshot();
  buildDetailedSnapshot();
  installDetailOverride();
  loadCentral();

  document.addEventListener('DOMContentLoaded',()=>{
    captureOriginalDetailResolver();
    buildDetailedSnapshot();
    installDetailOverride();
    loadCentral();
  },{once:true});

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible') loadCentral();
  });
})();


/* === ACCÈS BACK-OFFICE DEPUIS L'APPLICATION ===
   Ajout purement dynamique : aucun changement dans index.html, app.js ou styles.css.
*/
(function () {
  function openBackoffice() {
    window.location.href = "backoffice.html";
  }

  function installBackofficeAccess() {
    const profile = document.getElementById("profile");
    if (!profile || profile.dataset.backofficeAccessInstalled === "1") return;
    profile.dataset.backofficeAccessInstalled = "1";

    // 1) Rend le bouton ⚙ du profil cliquable vers le back-office.
    const headerButtons = profile.querySelectorAll("header .icon");
    if (headerButtons.length) {
      const gear = headerButtons[headerButtons.length - 1];
      gear.setAttribute("aria-label", "Ouvrir le back-office");
      gear.title = "Back-office";
      gear.onclick = openBackoffice;
    }

    // 2) Ajoute un bouton explicite dans la page Profil.
    const card = document.createElement("article");
    card.id = "osteoBackofficeAccessCard";
    card.innerHTML = `
      <div class="osteo-bo-icon">⚙</div>
      <div class="osteo-bo-copy">
        <strong>Back-office Ostéo Pratik</strong>
        <span>Modifier les techniques, textes, vidéos et images.</span>
      </div>
      <button type="button" class="osteo-bo-open">Ouvrir</button>
    `;
    card.querySelector(".osteo-bo-open").addEventListener("click", openBackoffice);

    const profileCard = profile.querySelector("article.profile");
    if (profileCard) profileCard.insertAdjacentElement("afterend", card);
    else profile.appendChild(card);

    // Style injecté localement par le bridge pour ne pas toucher à styles.css.
    if (!document.getElementById("osteoBackofficeAccessStyles")) {
      const style = document.createElement("style");
      style.id = "osteoBackofficeAccessStyles";
      style.textContent = `
        #osteoBackofficeAccessCard{
          margin-top:14px;padding:14px;border-radius:24px;
          display:grid;grid-template-columns:52px minmax(0,1fr) auto;
          gap:12px;align-items:center;
          background:linear-gradient(145deg,rgba(10,29,55,.82),rgba(5,15,31,.88));
          border:1px solid rgba(0,229,255,.25);
          box-shadow:0 18px 55px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.05);
        }
        #osteoBackofficeAccessCard .osteo-bo-icon{
          width:52px;height:52px;border-radius:50%;
          display:grid;place-items:center;font-size:24px;
          color:#00e5ff;border:1px solid rgba(0,229,255,.38);
          background:rgba(0,229,255,.10);
        }
        #osteoBackofficeAccessCard .osteo-bo-copy strong{
          display:block;color:#fff;font-size:15px;line-height:1.15;
        }
        #osteoBackofficeAccessCard .osteo-bo-copy span{
          display:block;margin-top:5px;color:#aeb8cc;font-size:12px;line-height:1.3;
        }
        #osteoBackofficeAccessCard .osteo-bo-open{
          padding:10px 12px;border-radius:14px;font-weight:900;
          color:#fff;background:linear-gradient(135deg,#00e5ff,#2d8cff);
          border:0;
        }
        @media(max-width:380px){
          #osteoBackofficeAccessCard{
            grid-template-columns:46px minmax(0,1fr);
          }
          #osteoBackofficeAccessCard .osteo-bo-open{
            grid-column:1 / -1;width:100%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  installBackofficeAccess();
  document.addEventListener("DOMContentLoaded", installBackofficeAccess, { once:true });
  setTimeout(installBackofficeAccess, 250);
})();


/* === COUCHE RESPONSIVE WEB ===
   Charge un CSS séparé sans modifier styles.css ni app.js.
*/
(function () {
  if (document.getElementById("osteoResponsiveWebCss")) return;
  const link = document.createElement("link");
  link.id = "osteoResponsiveWebCss";
  link.rel = "stylesheet";
  link.href = "responsive-web.css?v=11.2";
  document.head.appendChild(link);
})();


/* === V14 · IMAGE D’EN-TÊTE AUTOMATIQUE PAR ZONE + IMAGE PRINCIPALE FLOUE === */
(function(){
  'use strict';

  function fn(name){
    try{ if(typeof window[name]==='function') return window[name]; }catch(_){}
    try{ return eval('typeof '+name+'==="function"?'+name+':null'); }catch(_){}
    return null;
  }

  function current(){
    const get=fn('getCurrentTechnique');
    return typeof get==='function' ? get() : null;
  }

  const ZONE_HEADER_IMAGES_V14={
    cervicales:'assets/images/zones/zone-cervicales.webp',
    dorsales:'assets/images/zones/zone-dorsales.webp',
    lombaires:'assets/images/zones/zone-lombaires.webp',
    bassin:'assets/images/zones/zone-bassin.webp',
    membresSuperieurs:'assets/images/zones/zone-membres-superieurs.webp',
    membresInferieurs:'assets/images/zones/zone-membres-inferieurs.webp'
  };

  function zoneNormalizeV14(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function zoneHeaderImageV14(t){
    if(!t) return '';
    const hay=zoneNormalizeV14([
      t.title,t.titre,t.zone,t.monde,t.sub,t.region,t.category,t.categorie
    ].filter(Boolean).join(' '));

    // Membres : les termes anatomiques précis passent avant "bassin" / "rachis".
    if(/\b(epaule|scapula|scapulaire|clavicule|acromio|gleno|humerus|bras|coude|ulna|cubitus|radius|avant bras|poignet|carpe|carpien|main|doigt|pouce|membre superieur|membres superieurs)\b/.test(hay))
      return ZONE_HEADER_IMAGES_V14.membresSuperieurs;

    if(/\b(hanche|coxal|coxofemoral|femur|femoral|cuisse|genou|patella|patellaire|rotule|tibia|tibial|fibula|perone|cheville|talus|astragale|astragalien|sous talienne|sous astragalienne|calcaneus|calcaneen|pied|metatarse|metatarsien|orteil|membre inferieur|membres inferieurs)\b/.test(hay))
      return ZONE_HEADER_IMAGES_V14.membresInferieurs;

    if(/\b(bassin|pelvis|pelvien|iliaque|sacro iliaque|sacroiliaque|sacrum|sacre|coccyx|pubis|pubien)\b/.test(hay))
      return ZONE_HEADER_IMAGES_V14.bassin;

    // Rachis : charnières particulières puis sous-régions.
    if(/\b(d12 l1|t12 l1|lombo sacre|lombo sacree|l5 s1|l4 l5|l3 l4|l2 l3|l1 l2|lombaire|lombaires|lumbar)\b/.test(hay))
      return ZONE_HEADER_IMAGES_V14.lombaires;

    if(/\b(cervico dorsal|cervicodorsal|cervical|cervicales|cervico|occiput|occipital|c0 c1|c1 c2|c2 c3|c3 c4|c4 c5|c5 c6|c6 c7|c7 d1|c7 d2)\b/.test(hay))
      return ZONE_HEADER_IMAGES_V14.cervicales;

    if(/\b(dorsal|dorsales|thoracique|thoraciques|thoracic|cage thoracique|costal|costale|cote|cotes|sternum|d1|d2|d3|d4|d5|d6|d7|d8|d9|d10|d11|d12)\b/.test(hay))
      return ZONE_HEADER_IMAGES_V14.dorsales;

    // Repli par champs de classement.
    if(hay.includes('membres superieurs')) return ZONE_HEADER_IMAGES_V14.membresSuperieurs;
    if(hay.includes('membres inferieurs')) return ZONE_HEADER_IMAGES_V14.membresInferieurs;
    if(hay.includes('bassin')) return ZONE_HEADER_IMAGES_V14.bassin;
    if(hay.includes('lomb')) return ZONE_HEADER_IMAGES_V14.lombaires;
    if(hay.includes('cervic')) return ZONE_HEADER_IMAGES_V14.cervicales;
    if(hay.includes('dorsal') || hay.includes('thorac')) return ZONE_HEADER_IMAGES_V14.dorsales;
    return '';
  }

  function headerImage(t){
    // V14 : la première image représente automatiquement la zone anatomique.
    // Une ancienne image d'en-tête reste le repli pour les techniques non classées.
    return zoneHeaderImageV14(t) ||
      String((t && (t.headerImage || t.coverImage || t.heroImage)) || '').trim();
  }

  function mainImage(t){
    return String((t && (t.image || t.imageUrl || t.poster)) || '').trim();
  }

  function styles(){
    if(document.getElementById('osteoCentralImageStyles')) return;
    const s=document.createElement('style');
    s.id='osteoCentralImageStyles';
    s.textContent=`
      .osteo-central-main-image{
        position:relative;
        margin:14px 0 18px;
        padding:10px;
        border-radius:22px;
        overflow:hidden;
        border:1px solid rgba(0,229,255,.22);
        background:
          radial-gradient(ellipse at 55% 55%,rgba(0,229,255,.16),transparent 44%),
          linear-gradient(145deg,rgba(10,29,55,.88),rgba(5,15,31,.94));
        box-shadow:0 14px 42px rgba(0,0,0,.24);
      }
      .osteo-central-main-image::after{
        content:"";
        position:absolute;
        inset:0;
        z-index:2;
        pointer-events:none;
        background:
          radial-gradient(circle at 52% 58%,rgba(168,85,255,.16),transparent 24%),
          linear-gradient(180deg,rgba(2,7,20,.08),rgba(2,7,20,.24));
      }
      .osteo-central-main-image small{
        position:relative;
        z-index:4;
        display:block;
        margin:0 0 8px;
        color:#a9b9cf;
        font-size:11px;
        font-weight:800;
        letter-spacing:.06em;
        text-transform:uppercase;
      }
      .osteo-central-main-image button{
        position:relative;
        z-index:1;
        display:block;
        width:100%;
        min-height:240px;
        padding:0;
        border:0;
        background:transparent;
        border-radius:16px;
        overflow:hidden;
        cursor:pointer;
        isolation:isolate;
      }
      .osteo-central-main-image button::before{
        content:"";
        position:absolute;
        inset:-5%;
        z-index:0;
        background-image:var(--osteo-main-image);
        background-size:cover;
        background-position:center;
        filter:blur(24px) saturate(1.06) brightness(.86);
        transform:scale(1.10);
        opacity:.95;
      }
      .osteo-central-main-image button::after{
        content:"";
        position:absolute;
        inset:0;
        z-index:1;
        pointer-events:none;
        background:
          radial-gradient(ellipse at center,rgba(255,255,255,.02) 0%,rgba(255,255,255,0) 52%),
          linear-gradient(180deg,rgba(2,7,20,.03),rgba(2,7,20,.22));
      }
      .osteo-central-main-image img{
        position:relative;
        z-index:2;
        display:block;
        width:calc(100% - 20px);
        margin:10px auto;
        max-height:342px;
        object-fit:cover;
        border-radius:14px;
        background:#020714;
        opacity:1;
        mix-blend-mode:normal;
        filter:none !important;
        -webkit-filter:none !important;
        transform:none !important;
        box-shadow:0 10px 28px rgba(0,0,0,.22);
        transition:transform .2s ease,box-shadow .2s ease;
      }
      .osteo-central-main-image button:hover img{
        transform:scale(1.01);
        box-shadow:0 12px 30px rgba(0,0,0,.26);
      }
      .fiche-hero-visual.osteo-has-main-image{
        overflow:hidden;padding:0 !important;
      }
      .fiche-hero-visual.osteo-has-main-image > .osteo-hero-main-image{
        width:100%;height:100%;min-height:180px;object-fit:cover;
        display:block;border-radius:inherit;cursor:pointer;
      }
      .fiche-hero-visual.osteo-has-main-image .fiche-side-badge,
      .fiche-hero-visual.osteo-has-main-image .fiche-foot-glow{
        display:none !important;
      }
    `;
    document.head.appendChild(s);
  }

  function showMain(){
    styles();
    const t=current();
    const headerSrc=headerImage(t);
    const mainSrc=mainImage(t);
    const screen=document.getElementById('techniqueDetail');
    if(!screen) return;

    const hero=screen.querySelector('.fiche-hero-visual');
    if(hero){
      hero.querySelectorAll('.osteo-hero-main-image').forEach(x=>x.remove());
      hero.classList.toggle('osteo-has-main-image',!!headerSrc);
      if(headerSrc){
        const img=document.createElement('img');
        img.className='osteo-hero-main-image';
        img.src=headerSrc;
        img.alt=t?.title || 'Image d’en-tête';
        img.onclick=()=>{
          const open=fn('openStepImage');
          if(typeof open==='function') open(headerSrc,'Image d’en-tête');
        };
        hero.prepend(img);
      }
    }

    let panel=document.getElementById('osteoCentralMainImagePanel');
    if(!mainSrc){
      if(panel) panel.remove();
      return;
    }

    if(!panel){
      panel=document.createElement('section');
      panel.id='osteoCentralMainImagePanel';
      panel.className='osteo-central-main-image';
      const timeline=document.getElementById('ficheTimeline');
      if(timeline?.parentNode) timeline.parentNode.insertBefore(panel,timeline);
    }

    panel.innerHTML=`
      <small>Image principale</small>
      <button type="button" aria-label="Agrandir l’image principale">
        <img alt="">
      </button>
    `;
    const btn=panel.querySelector('button');
    const img=panel.querySelector('img');
    btn.style.setProperty('--osteo-main-image',`url("${mainSrc.replace(/"/g,'%22')}")`);
    img.src=mainSrc;
    img.alt=t?.title || 'Image principale';
    img.style.filter='none';
    img.style.webkitFilter='none';
    img.style.transform='none';
    img.style.opacity='1';
    img.style.mixBlendMode='normal';
    panel.querySelector('button').onclick=()=>{
      const open=fn('openStepImage');
      if(typeof open==='function') open(mainSrc,'Image principale');
    };
  }

  function wrapRender(){
    const original=fn('renderTechniqueDetail');
    if(typeof original!=='function' || original.__osteoV7MainImage) return;
    const wrapped=function(){
      const r=original.apply(this,arguments);
      setTimeout(showMain,0);
      return r;
    };
    wrapped.__osteoV7MainImage=true;
    wrapped.__osteoOriginal=original;
    try{
      renderTechniqueDetail=wrapped;
      window.renderTechniqueDetail=wrapped;
    }catch(_){}
  }

  function wrapImagesButton(){
    const original=fn('openTechniqueImagesPage');
    if(typeof original!=='function' || original.__osteoV7ImagesButton) return;
    const wrapped=function(){
      const r=original.apply(this,arguments);
      setTimeout(()=>{
        showMain();
        const p=document.getElementById('osteoCentralMainImagePanel');
        if(p) p.scrollIntoView({behavior:'smooth',block:'start'});
        else{
          const open=fn('openFichePlancheComplete');
          if(typeof open==='function') open();
        }
      },100);
      return r;
    };
    wrapped.__osteoV7ImagesButton=true;
    wrapped.__osteoOriginal=original;
    try{
      openTechniqueImagesPage=wrapped;
      window.openTechniqueImagesPage=wrapped;
    }catch(_){}
  }

  function install(){
    styles();
    wrapRender();
    wrapImagesButton();
    showMain();
  }

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.addEventListener('osteo-central-data-loaded',()=>setTimeout(install,30));
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible') setTimeout(install,20);
  });
  setTimeout(install,500);
})();

/* === V11 · QUIZ DYNAMIQUES + BANQUE DE QUESTIONS === */
(function(){
  'use strict';
  const QUESTIONS_TABLE='osteo_quiz_questions';
  const SETS_TABLE='osteo_quiz_sets';
  const SESSION_SIZE=15;
  let bank=[];
  let quizSets=[];
  let sessionMode='Quiz';

  function appGo(id){try{if(typeof window.go==='function')return window.go(id);}catch(_){} try{if(typeof go==='function')return go(id);}catch(_){}}
  function fn(name){try{if(typeof window[name]==='function')return window[name];}catch(_){} try{return eval('typeof '+name+'==="function"?'+name+':null');}catch(_){return null;}}
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function toLegacy(q,i){return{id:q.code||`bank_${i+1}`,category:q.category||q.zone||'Général',question:q.question,answers:Array.isArray(q.answers)?q.answers.slice(0,4):[],correct:Number(q.correct)||0,explanation:q.explanation||''};}

  async function config(){
    if(window.OSTEO_SUPABASE)return window.OSTEO_SUPABASE;
    await new Promise(r=>{const s=document.querySelector('script[src*="supabase-config.js"]');if(s){setTimeout(r,150);return;}const n=document.createElement('script');n.src='supabase-config.js';n.onload=r;n.onerror=r;document.head.appendChild(n);});
    return window.OSTEO_SUPABASE||null;
  }

  async function loadData(){
    const c=await config(); if(!c?.url||!c?.anonKey)return false;
    const headers={apikey:c.anonKey,Authorization:'Bearer '+c.anonKey,Accept:'application/json'};
    try{
      const [qr,sr]=await Promise.all([
        fetch(c.url.replace(/\/$/,'')+'/rest/v1/'+QUESTIONS_TABLE+'?select=id,code,zone,subzone,category,level,question,answers,correct,explanation,status&status=eq.publie&order=id.asc',{headers,cache:'no-store'}),
        fetch(c.url.replace(/\/$/,'')+'/rest/v1/'+SETS_TABLE+'?select=id,slug,title,kind,zone,subzone,question_count,status,position&status=eq.publie&order=position.asc,id.asc',{headers,cache:'no-store'})
      ]);
      if(qr.ok) bank=await qr.json();
      if(sr.ok) quizSets=await sr.json();
      window.OSTEO_QUESTION_BANK=bank; window.OSTEO_QUIZ_SETS=quizSets;
      renderMenu(); return true;
    }catch(e){console.warn('[Ostéo Pratik] Quiz central indisponible.',e);return false;}
  }

  function available(set){
    if(set.kind==='general')return bank;
    if(set.kind==='zone')return bank.filter(q=>q.zone===set.zone);
    return bank.filter(q=>q.zone===set.zone && String(q.subzone||'').trim()===String(set.subzone||'').trim());
  }

  function cardColor(set,i){
    if(set.kind==='general')return '#ffb020';
    const map={'Rachis':'#00e5ff','Bassin':'#ff9f43','Membres supérieurs':'#a855ff','Membres inférieurs':'#00e6a7'};
    return map[set.zone]||['#00e5ff','#a855ff','#00e6a7','#ff9f43'][i%4];
  }

  function buildMenu(){
    let menu=document.getElementById('quizMenu');
    if(menu)return menu;
    menu=document.createElement('section'); menu.id='quizMenu'; menu.className='screen quiz-menu-screen';
    const quiz=document.getElementById('quiz'); if(quiz?.parentNode)quiz.parentNode.insertBefore(menu,quiz); else document.body.appendChild(menu);
    if(!document.getElementById('quizMenuStylesV11')){
      const s=document.createElement('style');s.id='quizMenuStylesV11';s.textContent=`
        .quiz-menu-title{margin:12px auto 14px;padding:18px;border-radius:24px;text-align:center;border:1px solid rgba(0,229,255,.20);background:linear-gradient(145deg,rgba(10,29,55,.86),rgba(5,15,31,.90))}
        .quiz-menu-title h1{margin:0;color:#fff;font-size:30px}.quiz-menu-title p{margin:8px 0 0;color:#aeb8cc;font-size:14px}
        .quiz-menu-grid{display:grid;gap:12px}.quiz-menu-card{position:relative;min-height:104px;padding:14px 56px 14px 76px;border-radius:22px;text-align:left;border:1px solid var(--qc);color:var(--qc);background:linear-gradient(145deg,rgba(10,29,55,.82),rgba(5,15,31,.90))}
        .quiz-menu-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;display:grid;place-items:center;border:1px solid currentColor;font-weight:950}
        .quiz-menu-card strong{display:block;color:#fff;font-size:18px}.quiz-menu-card small{display:block;margin-top:5px;color:#c2ccdc;font-size:12px}.quiz-menu-card em{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-style:normal;border:1px solid currentColor;font-weight:950}.quiz-menu-card.disabled{opacity:.45}.quiz-menu-info{margin:14px auto 0;padding:14px;border-radius:20px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035)}
      `;document.head.appendChild(s);
    }
    return menu;
  }

  function renderMenu(){
    const menu=buildMenu();
    const sets=quizSets.length?quizSets:[{slug:'general',title:'Quiz général',kind:'general',zone:'',subzone:''}];
    menu.innerHTML=`<header class="top"><button class="icon round" type="button" data-quiz-back>‹</button><div class="brand"><h1 class="logo">Tester</h1><p class="subtitle">Choisir un quiz</p></div><button class="icon" type="button" data-quiz-refresh>↻</button></header><div class="quiz-menu-title"><h1>Tester mes acquis</h1><p>15 questions par session</p></div><div class="quiz-menu-grid">${sets.map((s,i)=>{const n=available(s).length;return `<button class="quiz-menu-card ${n<15?'disabled':''}" style="--qc:${cardColor(s,i)}" type="button" data-quiz-slug="${s.slug}"><span class="quiz-menu-icon">15</span><strong>${s.title}</strong><small>${s.kind==='general'?'Toutes les zones':(s.subzone||s.zone||'')}</small><em>${n}</em></button>`;}).join('')}</div><article class="quiz-menu-info"><strong>Principe</strong><p>Chaque quiz tire 15 questions dans la banque selon son filtre.</p></article>`;
    menu.querySelector('[data-quiz-back]').onclick=()=>appGo('home');
    menu.querySelector('[data-quiz-refresh]').onclick=()=>loadData();
    menu.querySelectorAll('[data-quiz-slug]').forEach(b=>b.onclick=()=>startSet(b.dataset.quizSlug));
  }

  function inject(qs){try{if(typeof generalQuizQuestions==='undefined'||!Array.isArray(generalQuizQuestions))return false;generalQuizQuestions.splice(0,generalQuizQuestions.length,...qs.map(toLegacy));return true;}catch(e){console.warn(e);return false;}}
  function startSet(slug){
    const set=quizSets.find(s=>s.slug===slug)||{slug:'general',title:'Quiz général',kind:'general'};
    const pool=available(set); if(pool.length<15){const t=fn('toast');if(t)t(`Il faut au moins 15 questions publiées pour « ${set.title} ».`);return;}
    const qs=shuffle(pool).slice(0,15); if(!inject(qs))return; sessionMode=set.title;
    try{generalQuizIndex=0;generalQuizScore=0;generalQuizAnswered=false;}catch(_){}
    const title=document.querySelector('#quiz .quiz-general-title h1');const sub=document.querySelector('#quiz .quiz-general-title p');if(title)title.textContent=set.title;if(sub)sub.textContent='15 questions';
    appGo('quiz'); const restart=fn('restartGeneralQuiz'); if(restart)restart();
  }

  function showMenu(e){if(e){e.preventDefault();e.stopPropagation();}renderMenu();appGo('quizMenu');return false;}
  function interceptQuizButtons(){document.querySelectorAll('[onclick]').forEach(el=>{const code=String(el.getAttribute('onclick')||'');if(!/go\s*\(\s*['\"]quiz['\"]\s*\)/.test(code)||el.dataset.quizMenuIntercepted==='1')return;el.dataset.quizMenuIntercepted='1';el.removeAttribute('onclick');el.addEventListener('click',showMenu);});}

  window.showQuizMenuV9=showMenu; window.startQuizSessionV9=startSet;
  function install(){buildMenu();interceptQuizButtons();loadData();}
  install(); document.addEventListener('DOMContentLoaded',install,{once:true}); document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')loadData();});
})();



/* === V15.3 · FUSION TEXTE + IMAGES / ÉTAPES INTERACTIVES === */
(function(){
  'use strict';

  let requestedTechniqueId = null;

  function globalFn(name){
    try{ if(typeof window[name] === 'function') return window[name]; }catch(_){}
    try{ return eval('typeof '+name+'==="function" ? '+name+' : null'); }catch(_){}
    return null;
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function textHtml(value){
    return escapeHtml(value)
      .replace(/\r\n|\r|\n/g,'<br>');
  }

  function getTechnique(id){
    if(id !== null && id !== undefined){
      const byId = globalFn('getTechniqueById');
      if(typeof byId === 'function'){
        try{
          const t = byId(id);
          if(t) return t;
        }catch(_){}
      }
    }
    const current = globalFn('getCurrentTechnique');
    if(typeof current === 'function'){
      try{ return current(); }catch(_){}
    }
    return null;
  }

  function getDetail(t){
    if(!t) return null;
    const resolver = globalFn('getTechniqueDetail');
    if(typeof resolver === 'function'){
      try{
        const d = resolver(t);
        if(d) return d;
      }catch(_){}
    }
    return t.detail || null;
  }

  function findStep(steps, tokens){
    return steps.find(step => {
      const hay = [
        step && step.key,
        step && step.label,
        step && step.title
      ].filter(Boolean).join(' ').toLowerCase()
       .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      return tokens.some(token => hay.includes(token));
    }) || null;
  }

  function canonicalSteps(detail){
    const all = Array.isArray(detail && detail.steps) ? detail.steps.filter(Boolean) : [];
    if(!all.length) return [];

    const ordered = [
      findStep(all,['position']),
      findStep(all,['mains','main','contact']),
      findStep(all,['barriere','barrière']),
      findStep(all,['normalisation','normalization','normaliser'])
    ].filter(Boolean);

    // Évite les doublons tout en gardant l'ordre pédagogique officiel.
    const seen = new Set();
    return ordered.filter(step => {
      const key = String(step.key || step.label || step.title || '');
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function stepLabel(step, index){
    const key = String(step && step.key || '').toLowerCase();
    if(key.includes('position')) return 'Position';
    if(key.includes('mains') || key.includes('main')) return 'Position des mains';
    if(key.includes('bar')) return 'Barrière motrice';
    if(key.includes('normal')) return 'Normalisation';
    return String(step && (step.label || step.title) || ('Étape '+(index+1)));
  }

  function stepIcon(step){
    const key = String(step && step.key || '').toLowerCase();
    if(key.includes('position')) return '01';
    if(key.includes('mains') || key.includes('main')) return '02';
    if(key.includes('bar')) return '03';
    if(key.includes('normal')) return '04';
    return '•';
  }

  function installStyles(){
    if(document.getElementById('osteoInteractiveStepsV153Styles')) return;
    const style = document.createElement('style');
    style.id = 'osteoInteractiveStepsV153Styles';
    style.textContent = `
      #player .video-premium-actions .osteo-v153-hidden{
        display:none !important;
      }
      #player .video-premium-actions #openVimeoDirectButton{
        grid-column:1 / -1 !important;
        width:100% !important;
      }

      #player .steps.osteo-v153-steps{
        padding:16px !important;
        overflow:visible !important;
      }
      #player .steps.osteo-v153-steps > h3{
        margin:0 0 13px !important;
        font-size:20px !important;
        line-height:1.15 !important;
      }

      .osteo-v153-step-nav{
        display:grid;
        grid-template-columns:1fr;
        gap:8px;
      }
      .osteo-v153-step-btn{
        width:100%;
        min-height:52px;
        display:grid;
        grid-template-columns:38px minmax(0,1fr) 24px;
        gap:10px;
        align-items:center;
        padding:9px 10px;
        text-align:left;
        color:#dbe8fb;
        border:1px solid rgba(170,205,225,.18);
        border-radius:17px;
        background:rgba(255,255,255,.035);
        transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .18s ease;
      }
      .osteo-v153-step-btn:hover{
        border-color:rgba(0,229,255,.40);
        background:rgba(0,229,255,.055);
      }
      .osteo-v153-step-btn.active{
        color:#fff;
        border-color:rgba(0,229,255,.68);
        background:linear-gradient(135deg,rgba(0,229,255,.13),rgba(45,140,255,.09));
        box-shadow:0 0 24px rgba(0,229,255,.10),inset 0 1px 0 rgba(255,255,255,.05);
      }
      .osteo-v153-step-num{
        width:36px;height:36px;
        display:grid;place-items:center;
        border-radius:50%;
        color:#00e5ff;
        font-weight:950;
        font-size:12px;
        border:1px solid rgba(0,229,255,.38);
        background:rgba(0,229,255,.09);
        box-shadow:0 0 16px rgba(0,229,255,.10);
      }
      .osteo-v153-step-btn strong{
        display:block;
        font-size:15px;
        line-height:1.15;
      }
      .osteo-v153-step-arrow{
        justify-self:end;
        color:#00e5ff;
        font-size:22px;
        transform:rotate(0deg);
        transition:transform .18s ease;
      }
      .osteo-v153-step-btn.active .osteo-v153-step-arrow{
        transform:rotate(90deg);
      }

      .osteo-v153-step-detail{
        margin-top:12px;
        padding:12px;
        border-radius:19px;
        border:1px solid rgba(0,229,255,.20);
        background:
          radial-gradient(circle at 50% 0%,rgba(0,229,255,.07),transparent 42%),
          rgba(2,9,22,.52);
      }
      .osteo-v153-step-detail-title{
        display:flex;
        align-items:center;
        gap:9px;
        margin:0 0 10px;
      }
      .osteo-v153-step-detail-title b{
        font-size:17px;
        color:#fff;
      }
      .osteo-v153-step-body{
        color:#d7e1ef;
        font-size:14px;
        line-height:1.52;
      }
      .osteo-v153-step-photo{
        display:block;
        width:100%;
        max-height:360px;
        margin:12px 0 0;
        object-fit:contain;
        border-radius:15px;
        background:#020714;
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 12px 28px rgba(0,0,0,.24);
        cursor:zoom-in;
      }
      .osteo-v153-source{
        margin:10px 2px 0;
        color:#7890ad;
        font-size:10.5px;
        line-height:1.3;
      }
      .osteo-v153-no-detail{
        margin:0;
        color:#aeb8cc;
        font-size:13px;
        line-height:1.4;
      }

      @media(min-width:620px){
        .osteo-v153-step-nav{
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function hideOldActions(player){
    const actions = player.querySelector('.video-premium-actions');
    if(!actions) return;

    actions.querySelectorAll('button').forEach(button => {
      const onclick = String(button.getAttribute('onclick') || '');
      const label = String(button.textContent || '').trim().toLowerCase();
      const isOldText = onclick.includes('openTechniqueTextPage') || label.includes('texte de la technique');
      const isOldImages = onclick.includes('openTechniqueImagesPage') || label.includes('images associées');
      button.classList.toggle('osteo-v153-hidden', isOldText || isOldImages);
    });
  }

  function renderStepPanel(section, t, detail, steps, activeIndex){
    const buttons = Array.from(section.querySelectorAll('.osteo-v153-step-btn'));
    buttons.forEach((btn,index)=>{
      btn.classList.toggle('active',index===activeIndex);
      btn.setAttribute('aria-selected',index===activeIndex ? 'true' : 'false');
    });

    const step = steps[activeIndex];
    const target = section.querySelector('.osteo-v153-step-detail');
    if(!step || !target) return;

    const label = stepLabel(step, activeIndex);
    const photo = String(step.photo || '').trim();
    const source = String(detail && detail.source || '').trim();

    target.innerHTML = `
      <div class="osteo-v153-step-detail-title">
        <span class="osteo-v153-step-num">${escapeHtml(stepIcon(step))}</span>
        <b>${escapeHtml(label)}</b>
      </div>
      <div class="osteo-v153-step-body">${textHtml(step.body || '')}</div>
      ${photo ? `<img class="osteo-v153-step-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(label)}">` : ''}
      ${source ? `<div class="osteo-v153-source">${escapeHtml(source)}</div>` : ''}
    `;

    const img = target.querySelector('.osteo-v153-step-photo');
    if(img){
      img.addEventListener('click',()=>{
        const open = globalFn('openStepImage');
        if(typeof open === 'function') open(photo,label);
      });
    }
  }

  function renderInteractiveSteps(id){
    installStyles();

    const player = document.getElementById('player');
    if(!player) return false;

    hideOldActions(player);

    const section = player.querySelector('.steps');
    if(!section) return false;

    const t = getTechnique(id !== undefined ? id : requestedTechniqueId);
    const detail = getDetail(t);
    const steps = canonicalSteps(detail);

    const signature = String(
      (t && (t.id || t.title)) || ''
    ) + '|' + steps.map(s=>String(s.key || s.label || '')).join(',');

    // Si l'UI est déjà installée pour cette technique, ne pas la reconstruire.
    if(section.dataset.osteoV153Signature === signature && section.classList.contains('osteo-v153-steps')){
      return true;
    }

    section.classList.add('osteo-v153-steps');
    section.dataset.osteoV153Signature = signature;

    if(!steps.length){
      section.innerHTML = `
        <h3>Technique</h3>
        <p class="osteo-v153-no-detail">Les étapes détaillées de cette technique ne sont pas encore disponibles.</p>
      `;
      return false;
    }

    section.innerHTML = `
      <h3>Technique</h3>
      <div class="osteo-v153-step-nav" role="tablist" aria-label="Étapes de la technique">
        ${steps.map((step,index)=>`
          <button type="button" class="osteo-v153-step-btn${index===0?' active':''}" data-step-index="${index}" role="tab" aria-selected="${index===0?'true':'false'}">
            <span class="osteo-v153-step-num">${escapeHtml(stepIcon(step))}</span>
            <strong>${escapeHtml(stepLabel(step,index))}</strong>
            <span class="osteo-v153-step-arrow">›</span>
          </button>
        `).join('')}
      </div>
      <div class="osteo-v153-step-detail" role="tabpanel"></div>
    `;

    section.querySelectorAll('.osteo-v153-step-btn').forEach(button=>{
      button.addEventListener('click',()=>{
        const index = Number(button.dataset.stepIndex || 0);
        renderStepPanel(section,t,detail,steps,index);
        const panel = section.querySelector('.osteo-v153-step-detail');
        if(panel && window.matchMedia('(max-width: 760px)').matches){
          setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),40);
        }
      });
    });

    // Première étape ouverte par défaut.
    renderStepPanel(section,t,detail,steps,0);
    return true;
  }

  function installOpenTechniqueHook(){
    const original = globalFn('openTechnique');
    if(typeof original !== 'function' || original.__osteoV153StepsHook) return;

    const wrapped = function(id){
      requestedTechniqueId = id;
      const result = original.apply(this,arguments);
      [0,60,180,500].forEach(delay=>{
        setTimeout(()=>renderInteractiveSteps(id),delay);
      });
      return result;
    };
    wrapped.__osteoV153StepsHook = true;
    wrapped.__osteoOriginal = original;

    try{
      window.openTechnique = wrapped;
      openTechnique = wrapped;
    }catch(_){
      window.openTechnique = wrapped;
    }
  }

  let observerTimer = null;
  function installObserver(){
    if(window.__osteoV153StepsObserver) return;
    window.__osteoV153StepsObserver = new MutationObserver(()=>{
      clearTimeout(observerTimer);
      observerTimer = setTimeout(()=>{
        installOpenTechniqueHook();
        const player = document.getElementById('player');
        if(player && player.classList.contains('active')){
          renderInteractiveSteps(requestedTechniqueId);
        }
      },60);
    });
    window.__osteoV153StepsObserver.observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class']
    });
  }

  function install(){
    installStyles();
    installOpenTechniqueHook();
    installObserver();
    renderInteractiveSteps(requestedTechniqueId);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  window.addEventListener('osteo-central-data-loaded',()=>setTimeout(install,80));
  setTimeout(install,500);
})();

