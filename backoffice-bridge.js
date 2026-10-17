/* === V15.6 · INTRO VIDÉO AVEC SON + BOUTON REVOIR === */
(function(){
  'use strict';

  const VIDEO_SRC='assets/videos/osteo-pratik-intro.mp4';
  const SESSION_KEY='osteoPratik.intro.v15.6.seen';

  function ensureStyles(){
    if(document.getElementById('osteoPratikIntroStylesV156')) return;
    const style=document.createElement('style');
    style.id='osteoPratikIntroStylesV156';
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
        z-index:4;
        top:max(14px,env(safe-area-inset-top));
        right:max(14px,env(safe-area-inset-right));
        display:flex;
        gap:8px;
      }
      #osteoPratikIntro .osteo-intro-actions button,
      #osteoPratikIntro .osteo-intro-launch{
        border:1px solid rgba(255,255,255,.20);
        border-radius:999px;
        color:#fff;
        background:rgba(2,7,20,.68);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        font:800 12px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
        cursor:pointer;
        box-shadow:0 8px 28px rgba(0,0,0,.28);
      }
      #osteoPratikIntro .osteo-intro-actions button{
        padding:9px 13px;
      }
      #osteoPratikIntro .osteo-intro-launch-wrap{
        position:absolute;
        inset:0;
        z-index:3;
        display:grid;
        place-items:center;
        padding:24px;
        background:rgba(2,7,20,.20);
      }
      #osteoPratikIntro .osteo-intro-launch-wrap[hidden]{display:none}
      #osteoPratikIntro .osteo-intro-launch{
        min-width:210px;
        padding:15px 22px;
        border-color:rgba(0,229,255,.52);
        background:linear-gradient(135deg,rgba(0,229,255,.20),rgba(45,140,255,.20));
        font-size:15px;
        box-shadow:0 0 32px rgba(0,229,255,.18),0 12px 34px rgba(0,0,0,.30);
      }
      /* V17.2 : le bouton de relance appartient à la grille native
         de l'écran d'entrée. Plus aucun positionnement absolu. */
      .welcome-poster-actions #osteoReplayIntroButton{
        position:relative !important;
        inset:auto !important;
        width:100% !important;
        min-width:0 !important;
        max-width:none !important;
        min-height:48px !important;
        margin:0 !important;
        box-sizing:border-box !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:9px !important;
        padding:10px 14px !important;
        border:1px solid rgba(0,229,255,.32) !important;
        border-radius:18px !important;
        color:#fff !important;
        background:linear-gradient(135deg,rgba(0,229,255,.10),rgba(45,140,255,.08)) !important;
        box-shadow:0 12px 28px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.04) !important;
        font-size:16px !important;
        font-weight:900 !important;
        line-height:1.15 !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        cursor:pointer !important;
        z-index:3 !important;
      }
      .welcome-poster-actions #osteoReplayIntroButton span{
        color:#00e5ff !important;
        font-size:18px !important;
        flex:0 0 auto;
      }

      /* Restaurer les dimensions prévues par la page pour les 3 boutons natifs. */
      #welcome .welcome-poster-actions .welcome-start,
      #welcome .welcome-poster-actions .welcome-signup,
      #welcome .welcome-poster-actions .welcome-login{
        width:100% !important;
        min-width:0 !important;
        max-width:none !important;
        box-sizing:border-box !important;
        white-space:normal !important;
        overflow:hidden !important;
        text-overflow:clip !important;
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
  }

  function closeIntro(overlay,markSeen=true){
    if(!overlay || !overlay.isConnected) return;
    if(markSeen){
      try{sessionStorage.setItem(SESSION_KEY,'1');}catch(_){}
    }
    overlay.classList.add('osteo-intro-leave');
    setTimeout(()=>{
      overlay.remove();
      document.documentElement.style.overflow='';
    },560);
  }

  function showIntro(options={}){
    ensureStyles();

    const force=!!options.force;
    const sound=options.sound !== false;

    if(!force){
      try{if(sessionStorage.getItem(SESSION_KEY)==='1') return;}catch(_){}
    }

    const existing=document.getElementById('osteoPratikIntro');
    if(existing) existing.remove();

    document.documentElement.style.overflow='hidden';

    const overlay=document.createElement('div');
    overlay.id='osteoPratikIntro';
    overlay.innerHTML=`
      <video playsinline preload="auto" aria-label="Introduction Ostéo Pratik">
        <source src="${VIDEO_SRC}" type="video/mp4">
      </video>
      <div class="osteo-intro-actions">
        <button type="button" class="osteo-intro-sound">🔊 Son actif</button>
        <button type="button" class="osteo-intro-skip">Passer</button>
      </div>
      <div class="osteo-intro-launch-wrap" hidden>
        <button type="button" class="osteo-intro-launch">▶ Lancer avec le son</button>
      </div>
    `;

    const video=overlay.querySelector('video');
    const soundBtn=overlay.querySelector('.osteo-intro-sound');
    const launchWrap=overlay.querySelector('.osteo-intro-launch-wrap');
    const launchBtn=overlay.querySelector('.osteo-intro-launch');

    video.muted=!sound;
    video.volume=1;

    function syncSoundLabel(){
      soundBtn.textContent=video.muted?'🔇 Activer le son':'🔊 Son actif';
    }
    syncSoundLabel();

    soundBtn.addEventListener('click',()=>{
      video.muted=!video.muted;
      video.volume=1;
      syncSoundLabel();
      if(video.paused) video.play().catch(()=>{});
    });

    launchBtn.addEventListener('click',()=>{
      video.muted=false;
      video.volume=1;
      syncSoundLabel();
      launchWrap.hidden=true;
      video.currentTime=0;
      video.play().catch(()=>{launchWrap.hidden=false;});
    });

    overlay.querySelector('.osteo-intro-skip').addEventListener('click',()=>closeIntro(overlay,true));
    video.addEventListener('ended',()=>closeIntro(overlay,true),{once:true});
    video.addEventListener('error',()=>setTimeout(()=>closeIntro(overlay,false),350),{once:true});

    document.body.appendChild(overlay);

    // On essaie d'abord avec le son. Les navigateurs peuvent bloquer
    // l'autoplay sonore : dans ce cas, on garde l'écran d'intro et on propose
    // un seul clic « Lancer avec le son » au lieu de basculer silencieusement.
    video.play().then(()=>{
      launchWrap.hidden=true;
    }).catch(()=>{
      video.pause();
      video.currentTime=0;
      video.muted=false;
      video.volume=1;
      syncSoundLabel();
      launchWrap.hidden=false;
    });
  }

  function installReplayButton(){
    ensureStyles();

    const target=document.getElementById('welcome');
    if(!target) return;

    const actions=target.querySelector('.welcome-poster-actions');
    if(!actions) return;

    let button=document.getElementById('osteoReplayIntroButton');
    if(!button){
      button=document.createElement('button');
      button.id='osteoReplayIntroButton';
      button.type='button';
      button.innerHTML='<span>▶</span> Revoir la vidéo';
    }

    button.onclick=()=>showIntro({force:true,sound:true});

    // V17.2 : le bouton est le PREMIER élément de la grille,
    // juste avant « Commencer », sans positionnement absolu.
    if(button.parentElement!==actions || actions.firstElementChild!==button){
      actions.insertBefore(button,actions.firstElementChild);
    }

    // Nettoie d'éventuels styles inline laissés par l'ancienne version.
    [
      'position','top','right','left','bottom',
      'width','min-width','max-width','min-height',
      'z-index','white-space','overflow','line-height'
    ].forEach(prop=>button.style.removeProperty(prop));

    target.querySelectorAll('.welcome-start,.welcome-signup,.welcome-login').forEach(el=>{
      [
        'min-width','width','max-width','box-sizing',
        'white-space','overflow','text-overflow','line-height'
      ].forEach(prop=>el.style.removeProperty(prop));
      el.classList.remove('osteo-welcome-action-v161');
    });
    target.classList.remove('osteo-welcome-v161');
  }


  window.OsteoPratikIntro={
    replay:()=>showIntro({force:true,sound:true}),
    reset:()=>{try{sessionStorage.removeItem(SESSION_KEY);}catch(_){}},
    show:showIntro
  };

  function install(){
    installReplayButton();
    showIntro({force:false,sound:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
  setTimeout(installReplayButton,500);
  window.addEventListener('resize',()=>{
    clearTimeout(window.__osteoWelcomeResizeV161);
    window.__osteoWelcomeResizeV161=setTimeout(installReplayButton,100);
  });
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
    if(set.kind==='general')return bank.filter(q=>q.zone==='Général');
    if(set.kind==='zone')return bank.filter(q=>q.zone===set.zone);
    return bank.filter(q=>q.zone===set.zone && String(q.subzone||'').trim()===String(set.subzone||'').trim());
  }

  function canonicalQuizSets(){
    const source=Array.isArray(quizSets)?quizSets:[];
    const wanted=[
      {slug:'quiz-general',title:'Quiz général — Ostéopathie',kind:'general',zone:'Général',subzone:''},
      {slug:'quiz-rachis',title:'Quiz Rachis',kind:'zone',zone:'Rachis',subzone:''},
      {slug:'quiz-bassin',title:'Quiz Bassin',kind:'zone',zone:'Bassin',subzone:''},
      {slug:'quiz-membres-superieurs',title:'Quiz Membres supérieurs',kind:'zone',zone:'Membres supérieurs',subzone:''},
      {slug:'quiz-membres-inferieurs',title:'Quiz Membres inférieurs',kind:'zone',zone:'Membres inférieurs',subzone:''}
    ];

    return wanted.map(def=>{
      // 1) priorité absolue au slug V17
      let found=source.find(s=>String(s.slug||'')===def.slug);

      // 2) sinon on récupère un ancien quiz équivalent pour éviter un écran vide
      if(!found){
        found=source.find(s=>{
          if(def.kind==='general') return s.kind==='general' && (!s.zone || s.zone==='Général');
          return s.kind==='zone' && String(s.zone||'')===def.zone;
        });
      }

      // On force le libellé et le filtre canonique même si la ligne Supabase est ancienne.
      return {
        ...(found||{}),
        slug:def.slug,
        title:def.title,
        kind:def.kind,
        zone:def.zone,
        subzone:def.subzone,
        question_count:15,
        status:'publie'
      };
    });
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
        .quiz-menu-card strong{display:block;color:#fff;font-size:18px;line-height:1.18;padding-right:4px;overflow-wrap:anywhere}.quiz-menu-card small{display:block;margin-top:5px;color:#c2ccdc;font-size:12px;line-height:1.25}.quiz-menu-card em{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-style:normal;border:1px solid currentColor;font-weight:950;background:rgba(4,14,30,.72)}.quiz-menu-card.disabled{opacity:.45}.quiz-menu-info{margin:14px auto 0;padding:14px;border-radius:20px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035)}
      `;document.head.appendChild(s);
    }
    return menu;
  }

  function renderMenu(){
    const menu=buildMenu();
    const sets=canonicalQuizSets();
    menu.innerHTML=`<header class="top"><button class="icon round" type="button" data-quiz-back>‹</button><div class="brand"><h1 class="logo">Tester</h1><p class="subtitle">Choisir un quiz</p></div><button class="icon" type="button" data-quiz-refresh>↻</button></header><div class="quiz-menu-title"><h1>Tester mes acquis</h1><p>15 questions par session</p></div><div class="quiz-menu-grid">${sets.map((s,i)=>{const n=available(s).length;return `<button class="quiz-menu-card ${n<15?'disabled':''}" style="--qc:${cardColor(s,i)}" type="button" data-quiz-slug="${s.slug}"><span class="quiz-menu-icon">15</span><strong>${s.title}</strong><small>${s.kind==='general'?'Toutes les zones':(s.subzone||s.zone||'')}</small><em>${n}</em></button>`;}).join('')}</div><article class="quiz-menu-info"><strong>Principe</strong><p>Chaque quiz tire 15 questions dans la banque selon son filtre.</p></article>`;
    menu.querySelector('[data-quiz-back]').onclick=()=>appGo('home');
    menu.querySelector('[data-quiz-refresh]').onclick=()=>loadData();
    menu.querySelectorAll('[data-quiz-slug]').forEach(b=>b.onclick=()=>startSet(b.dataset.quizSlug));
  }

  function inject(qs){try{if(typeof generalQuizQuestions==='undefined'||!Array.isArray(generalQuizQuestions))return false;generalQuizQuestions.splice(0,generalQuizQuestions.length,...qs.map(toLegacy));return true;}catch(e){console.warn(e);return false;}}
  function pickSession(set){
    return shuffle(available(set)).slice(0,SESSION_SIZE);
  }

  function startSet(slug){
    const set=canonicalQuizSets().find(s=>s.slug===slug)||{slug:'quiz-general',title:'Quiz général — Ostéopathie',kind:'general',zone:'Général'};
    const pool=available(set); if(pool.length<SESSION_SIZE){const t=fn('toast');if(t)t(`Il faut au moins ${SESSION_SIZE} questions publiées pour « ${set.title} ».`);return;}
    const qs=pickSession(set); if(qs.length<SESSION_SIZE||!inject(qs))return; sessionMode=set.title;
    try{generalQuizIndex=0;generalQuizScore=0;generalQuizAnswered=false;}catch(_){}
    const title=document.querySelector('#quiz .quiz-general-title h1');const sub=document.querySelector('#quiz .quiz-general-title p');if(title)title.textContent=set.title;if(sub)sub.textContent=`${SESSION_SIZE} questions`;
    appGo('quiz'); const restart=fn('restartGeneralQuiz'); if(restart)restart();
  }

  function showMenu(e){if(e){e.preventDefault();e.stopPropagation();}renderMenu();appGo('quizMenu');return false;}
  function interceptQuizButtons(){document.querySelectorAll('[onclick]').forEach(el=>{const code=String(el.getAttribute('onclick')||'');if(!/go\s*\(\s*['\"]quiz['\"]\s*\)/.test(code)||el.dataset.quizMenuIntercepted==='1')return;el.dataset.quizMenuIntercepted='1';el.removeAttribute('onclick');el.addEventListener('click',showMenu);});}

  window.showQuizMenuV9=showMenu; window.startQuizSessionV9=startSet;
  function install(){buildMenu();interceptQuizButtons();loadData();}
  install(); document.addEventListener('DOMContentLoaded',install,{once:true}); document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')loadData();});
})();



/* === V15.7 · MONDE TECHNIQUE SÉPARÉ DU MONDE VIDÉO === */
(function(){
  'use strict';

  let requestedTechniqueId = null;
  let activeStepIndex = null;

  function fn(name){
    try{ if(typeof window[name] === 'function') return window[name]; }catch(_){}
    try{ return eval('typeof '+name+'==="function" ? '+name+' : null'); }catch(_){}
    return null;
  }

  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function bodyHtml(value){
    return esc(value).replace(/\r\n|\r|\n/g,'<br>');
  }

  function normalize(value){
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase();
  }

  function getTechnique(id){
    if(id !== null && id !== undefined){
      const byId = fn('getTechniqueById');
      if(typeof byId === 'function'){
        try{
          const t = byId(id);
          if(t) return t;
        }catch(_){}
      }
    }
    const current = fn('getCurrentTechnique');
    if(typeof current === 'function'){
      try{ return current(); }catch(_){}
    }
    return null;
  }

  function getDetail(t){
    if(!t) return null;
    const resolver = fn('getTechniqueDetail');
    if(typeof resolver === 'function'){
      try{
        const d = resolver(t);
        if(d) return d;
      }catch(_){}
    }
    return t.detail || null;
  }

  function findStep(steps,tokens){
    return steps.find(step=>{
      const hay = normalize([
        step && step.key,
        step && step.label,
        step && step.title
      ].filter(Boolean).join(' '));
      return tokens.some(token=>hay.includes(token));
    }) || null;
  }

  function officialSteps(detail){
    const all = Array.isArray(detail && detail.steps) ? detail.steps.filter(Boolean) : [];
    if(!all.length) return [];

    const ordered = [
      findStep(all,['position']),
      findStep(all,['mains','main','contact']),
      findStep(all,['barriere','barrière']),
      findStep(all,['normalisation','normalization','normaliser'])
    ].filter(Boolean);

    const seen = new Set();
    return ordered.filter(step=>{
      const key = String(step.key || step.label || step.title || '');
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function stepLabel(step,index){
    const key = normalize(step && step.key);
    if(index === 0) return 'Position du praticien';
    if(key.includes('main') || key.includes('contact') || index === 1) return 'Position des mains';
    if(key.includes('bar') || index === 2) return 'Barrière motrice';
    if(key.includes('normal') || index === 3) return 'Normalisation';
    return String(step && (step.label || step.title) || ('Étape '+(index+1)));
  }

  function stepLogo(step,index){
    const resolver = fn('getTechniqueStepLogoSrc');
    if(typeof resolver === 'function'){
      try{
        const src = String(resolver(step) || '').trim();
        if(src) return src;
      }catch(_){}
    }
    return '';
  }

  function stepColor(step,index){
    const resolver = fn('getTechniqueStepColorKey');
    if(typeof resolver === 'function'){
      try{
        const key = String(resolver(step) || '').trim().toLowerCase();
        if(key) return key;
      }catch(_){}
    }
    return ['cyan','red','orange','green'][index] || 'cyan';
  }

  function colorValue(key){
    const map={
      cyan:'#00e5ff',
      blue:'#36b8ff',
      red:'#ff6b77',
      rose:'#ff6b77',
      orange:'#ffb020',
      yellow:'#ffb020',
      green:'#00e6a7',
      violet:'#a855ff',
      purple:'#a855ff'
    };
    return map[key] || '#00e5ff';
  }

  function logoMarkup(step,index,large=false){
    const src = stepLogo(step,index);
    const color = colorValue(stepColor(step,index));
    const cls = large ? 'osteo-v157-step-logo large' : 'osteo-v157-step-logo';
    if(src){
      return `<span class="${cls}" style="--step-color:${color}"><img src="${esc(src)}" alt=""></span>`;
    }
    return `<span class="${cls} fallback" style="--step-color:${color}">${String(index+1).padStart(2,'0')}</span>`;
  }

  function installStyles(){
    if(document.getElementById('osteoV157Styles')) return;

    const style=document.createElement('style');
    style.id='osteoV157Styles';
    style.textContent=`
      #player .video-premium-actions .osteo-v157-old-action{
        display:none !important;
      }
      #player .video-premium-actions{
        grid-template-columns:1fr !important;
        width:100% !important;
        align-items:stretch !important;
      }
      #player .video-premium-actions .osteo-v157-open-world{
        width:100% !important;
        min-width:100% !important;
        max-width:none !important;
        min-height:56px !important;
        display:flex !important;
        grid-column:1 / -1 !important;
        justify-self:stretch !important;
        align-self:stretch !important;
        box-sizing:border-box !important;
        margin:0 auto !important;
        align-items:center !important;
        justify-content:center !important;
        gap:9px !important;
        padding:10px 16px !important;
        border-radius:20px !important;
        color:#fff !important;
        border:1px solid rgba(0,229,255,.42) !important;
        background:linear-gradient(135deg,rgba(0,229,255,.13),rgba(45,140,255,.10)) !important;
        box-shadow:0 0 24px rgba(0,229,255,.10),inset 0 1px 0 rgba(255,255,255,.05) !important;
        font-weight:950 !important;
        text-align:center !important;
        white-space:nowrap !important;
      }
      #player .video-premium-actions .osteo-v157-open-world span{
        color:#00e5ff;
        font-size:19px;
      }

      /* Dans le monde vidéo on ne montre plus l'ancien bloc Étapes. */
      #player > .steps{
        display:none !important;
      }

      #osteoTechniqueWorld{
        background:
          radial-gradient(circle at 50% -4%,rgba(0,229,255,.15),transparent 34%),
          linear-gradient(180deg,rgba(3,10,24,.76),rgba(3,8,22,.98));
      }

      .osteo-v157-top{
        display:grid;
        grid-template-columns:46px minmax(0,1fr) 46px;
        align-items:center;
        gap:10px;
        margin-bottom:12px;
      }
      .osteo-v157-back{
        width:44px;height:44px;
        border-radius:16px;
        display:grid;place-items:center;
        color:#dbe8fb;
        border:1px solid rgba(255,255,255,.16);
        background:rgba(255,255,255,.045);
        font-size:24px;
      }
      .osteo-v157-title{
        min-width:0;
        text-align:center;
      }
      .osteo-v157-title strong{
        display:block;
        color:#fff;
        font-size:20px;
        line-height:1.1;
      }
      .osteo-v157-title small{
        display:block;
        margin-top:4px;
        color:#8fa7c7;
        font-size:11px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .osteo-v161-header{
        width:100%;
        margin:0 0 14px;
        aspect-ratio:16 / 7;
        overflow:hidden;
        border-radius:22px;
        border:1px solid rgba(0,229,255,.30);
        background:#020714;
        box-shadow:0 14px 34px rgba(0,0,0,.24),0 0 24px rgba(0,229,255,.07);
      }
      .osteo-v161-header img{
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
        filter:none !important;
        -webkit-filter:none !important;
      }

      .osteo-v157-intro{
        margin:0 0 14px;
        padding:13px 14px;
        border-radius:20px;
        color:#dbe8fb;
        border:1px solid rgba(0,229,255,.18);
        background:linear-gradient(145deg,rgba(10,29,55,.76),rgba(5,15,31,.84));
        font-size:13px;
        line-height:1.42;
      }

      .osteo-v157-menu{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
        margin-bottom:12px;
      }
      .osteo-v157-menu-btn{
        min-height:116px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:9px;
        padding:12px 8px;
        text-align:center;
        border-radius:22px;
        color:#fff;
        border:1px solid rgba(170,205,225,.16);
        background:
          radial-gradient(circle at 50% 20%,rgba(0,229,255,.08),transparent 52%),
          rgba(7,20,39,.62);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }
      .osteo-v157-menu-btn.active{
        border-color:var(--menu-color,#00e5ff);
        box-shadow:0 0 24px color-mix(in srgb,var(--menu-color,#00e5ff) 18%,transparent),inset 0 1px 0 rgba(255,255,255,.05);
        background:
          radial-gradient(circle at 50% 18%,color-mix(in srgb,var(--menu-color,#00e5ff) 15%,transparent),transparent 55%),
          rgba(7,20,39,.72);
      }
      .osteo-v157-menu-btn strong{
        font-size:13px;
        line-height:1.15;
      }

      .osteo-v157-global{
        grid-column:1 / -1;
        min-height:74px;
        flex-direction:row;
        gap:12px;
      }
      .osteo-v157-global-icon{
        width:44px;height:44px;
        border-radius:50%;
        display:grid;place-items:center;
        color:#00e5ff;
        border:1px solid rgba(0,229,255,.38);
        background:rgba(0,229,255,.09);
        font-size:21px;
      }

      .osteo-v157-step-logo{
        width:46px;height:46px;
        display:grid;place-items:center;
        border-radius:15px;
        flex:0 0 46px;
        overflow:hidden;
        border:1px solid color-mix(in srgb,var(--step-color) 58%,transparent);
        background:color-mix(in srgb,var(--step-color) 10%,transparent);
        box-shadow:0 0 18px color-mix(in srgb,var(--step-color) 15%,transparent);
      }
      .osteo-v157-step-logo.large{
        width:54px;height:54px;
      }
      .osteo-v157-step-logo img{
        width:33px;height:33px;
        object-fit:contain;
        display:block;
      }
      .osteo-v157-step-logo.large img{
        width:39px;height:39px;
      }
      .osteo-v157-step-logo.fallback{
        color:var(--step-color);
        font-weight:950;
        font-size:11px;
      }

      .osteo-v157-content{
        min-height:120px;
        margin:12px 0 0;
      }
      .osteo-v157-placeholder{
        padding:22px 16px;
        text-align:center;
        border-radius:22px;
        color:#91a6c0;
        border:1px dashed rgba(170,205,225,.18);
        background:rgba(255,255,255,.02);
        font-size:13px;
        line-height:1.4;
      }

      .osteo-v157-card{
        padding:13px;
        border-radius:22px;
        border:1px solid rgba(170,205,225,.16);
        background:
          radial-gradient(circle at 50% 0%,rgba(0,229,255,.055),transparent 44%),
          linear-gradient(145deg,rgba(10,29,55,.78),rgba(5,15,31,.88));
        box-shadow:0 16px 42px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.04);
      }
      .osteo-v157-card + .osteo-v157-card{
        margin-top:11px;
      }
      .osteo-v157-card-head{
        display:flex;
        align-items:center;
        gap:11px;
        margin-bottom:10px;
      }
      .osteo-v157-card-head b{
        color:#fff;
        font-size:17px;
        line-height:1.15;
      }
      .osteo-v157-card-body{
        color:#d7e1ef;
        font-size:14px;
        line-height:1.55;
      }
      .osteo-v157-card img{
        display:block;
        width:100%;
        max-height:370px;
        margin-top:12px;
        object-fit:contain;
        border-radius:16px;
        background:#020714;
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 12px 28px rgba(0,0,0,.24);
        cursor:zoom-in;
      }
      .osteo-v157-source{
        margin:10px 2px 0;
        color:#7187a3;
        font-size:10.5px;
        line-height:1.3;
      }

      @media(max-width:360px){
        .osteo-v157-menu{
          grid-template-columns:1fr;
        }
        .osteo-v157-global{
          grid-column:auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function hideLegacyPlayerActions(player){
    const actions=player.querySelector('.video-premium-actions');
    if(!actions) return null;

    actions.querySelectorAll('button').forEach(button=>{
      const onclick=String(button.getAttribute('onclick') || '');
      const label=normalize(button.textContent || '');
      const hide=
        onclick.includes('openTechniqueTextPage') ||
        onclick.includes('openTechniqueImagesPage') ||
        label.includes('texte de la technique') ||
        label.includes('images associees') ||
        label.includes('technique texte images') ||
        label.includes('technique images texte');

      button.classList.toggle('osteo-v157-old-action',hide);
    });

    return actions;
  }

  function ensureOpenWorldButton(){
    const player=document.getElementById('player');
    if(!player) return;

    const actions=hideLegacyPlayerActions(player);
    if(!actions) return;

    let button=actions.querySelector('.osteo-v157-open-world');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='secondary osteo-v157-open-world';
      button.innerHTML='<span>◎</span> Technique · Images · Texte';

      const vimeo=actions.querySelector('#openVimeoDirectButton');
      if(vimeo) actions.insertBefore(button,vimeo);
      else actions.appendChild(button);

      button.addEventListener('click',()=>{
        renderWorld();
        const go=fn('go');
        if(typeof go==='function') go('osteoTechniqueWorld');
        else{
          document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id==='osteoTechniqueWorld'));
        }
      });
    }
  }

  function ensureWorldScreen(){
    let screen=document.getElementById('osteoTechniqueWorld');
    if(screen) return screen;

    const app=document.querySelector('.app') || document.body;
    screen=document.createElement('section');
    screen.id='osteoTechniqueWorld';
    screen.className='screen';
    screen.innerHTML=`
      <div class="osteo-v157-top">
        <button type="button" class="osteo-v157-back" aria-label="Retour à la vidéo">‹</button>
        <div class="osteo-v157-title">
          <strong>Technique</strong>
          <small id="osteoV157TechniqueName">Fiche technique</small>
        </div>
        <div></div>
      </div>

      <div class="osteo-v161-header" id="osteoV161Header" hidden>
        <img id="osteoV161HeaderImage" alt="Image anatomique de la zone">
      </div>

      <div class="osteo-v157-intro">
        Sélectionnez une étape pour afficher son texte et son image, ou ouvrez la technique globale.
      </div>

      <div class="osteo-v157-menu" id="osteoV157Menu"></div>
      <div class="osteo-v157-content" id="osteoV157Content"></div>
    `;

    const bottom=app.querySelector('.bottom');
    if(bottom) app.insertBefore(screen,bottom);
    else app.appendChild(screen);

    screen.querySelector('.osteo-v157-back').addEventListener('click',()=>{
      const go=fn('go');
      if(typeof go==='function') go('player');
      else{
        document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id==='player'));
      }
    });

    return screen;
  }

  function setMenuActive(indexOrGlobal){
    const screen=ensureWorldScreen();
    screen.querySelectorAll('.osteo-v157-menu-btn').forEach(button=>{
      const active=String(button.dataset.step)===String(indexOrGlobal);
      button.classList.toggle('active',active);
    });
  }

  function renderStepCard(step,index,detail){
    const label=stepLabel(step,index);
    const photo=String(step && step.photo || '').trim();

    return `
      <article class="osteo-v157-card">
        <div class="osteo-v157-card-head">
          ${logoMarkup(step,index,true)}
          <b>${esc(label)}</b>
        </div>
        <div class="osteo-v157-card-body">${bodyHtml(step && step.body || '')}</div>
        ${photo ? `<img class="osteo-v157-photo" src="${esc(photo)}" alt="${esc(label)}" data-photo="${esc(photo)}" data-label="${esc(label)}">` : ''}
      </article>
    `;
  }

  function bindPhotoZoom(container){
    container.querySelectorAll('.osteo-v157-photo').forEach(img=>{
      img.addEventListener('click',()=>{
        const open=fn('openStepImage');
        if(typeof open==='function') open(img.dataset.photo,img.dataset.label);
      });
    });
  }

  function renderSelectedStep(index){
    const t=getTechnique(requestedTechniqueId);
    const detail=getDetail(t);
    const steps=officialSteps(detail);
    const content=document.getElementById('osteoV157Content');
    if(!content || !steps[index]) return;

    activeStepIndex=index;
    setMenuActive(index);
    content.innerHTML=
      renderStepCard(steps[index],index,detail) +
      (detail && detail.source ? `<div class="osteo-v157-source">${esc(detail.source)}</div>` : '');

    bindPhotoZoom(content);
    content.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function renderGlobal(){
    const t=getTechnique(requestedTechniqueId);
    const detail=getDetail(t);
    const steps=officialSteps(detail);
    const content=document.getElementById('osteoV157Content');
    if(!content) return;

    activeStepIndex='global';
    setMenuActive('global');
    content.innerHTML=
      steps.map((step,index)=>renderStepCard(step,index,detail)).join('') +
      (detail && detail.source ? `<div class="osteo-v157-source">${esc(detail.source)}</div>` : '');

    bindPhotoZoom(content);
    content.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function techniqueHeaderImageV161(t){
    if(!t) return '';
    const direct=String(
      t.headerImage || t.coverImage || t.heroImage ||
      t.header_image || t.cover_image || ''
    ).trim();
    if(direct) return direct;

    const hay=normalize([
      t.title,t.titre,t.zone,t.monde,t.sub,t.region,t.category,t.categorie
    ].filter(Boolean).join(' '));

    if(hay.includes('membre superieur') || /epaule|scapul|clavicul|coude|poignet|carp|main|pouce/.test(hay))
      return 'assets/images/zones/zone-membres-superieurs.webp';
    if(hay.includes('membre inferieur') || /hanche|cox|femur|genou|tibia|fibula|perone|cheville|talus|calcane|pied|metatars/.test(hay))
      return 'assets/images/zones/zone-membres-inferieurs.webp';
    if(/bassin|pelv|ilium|iliaque|sacrum|sacro|pubis|coccyx/.test(hay))
      return 'assets/images/zones/zone-bassin.webp';
    if(/lomb|l1|l2|l3|l4|l5|lombo/.test(hay))
      return 'assets/images/zones/zone-lombaires.webp';
    if(/cervic|occip|atlas|axis|c0|c1|c2|c3|c4|c5|c6|c7/.test(hay))
      return 'assets/images/zones/zone-cervicales.webp';
    if(/dorsal|thorac|cote|costal|sternum|d1|d2|d3|d4|d5|d6|d7|d8|d9|d10|d11|d12/.test(hay))
      return 'assets/images/zones/zone-dorsales.webp';
    return '';
  }

  function renderWorld(){
    installStyles();
    const screen=ensureWorldScreen();
    const t=getTechnique(requestedTechniqueId);
    const detail=getDetail(t);
    const steps=officialSteps(detail);

    const name=screen.querySelector('#osteoV157TechniqueName');
    if(name) name.textContent=String(t && t.title || 'Fiche technique');

    const headerWrap=screen.querySelector('#osteoV161Header');
    const headerImg=screen.querySelector('#osteoV161HeaderImage');
    const headerSrc=techniqueHeaderImageV161(t);
    if(headerWrap && headerImg){
      headerWrap.hidden=!headerSrc;
      if(headerSrc) headerImg.src=headerSrc;
    }

    const menu=screen.querySelector('#osteoV157Menu');
    const content=screen.querySelector('#osteoV157Content');

    if(!steps.length){
      menu.innerHTML='';
      content.innerHTML='<div class="osteo-v157-placeholder">Les étapes détaillées de cette technique ne sont pas encore disponibles.</div>';
      return;
    }

    menu.innerHTML=
      steps.map((step,index)=>{
        const color=colorValue(stepColor(step,index));
        return `
          <button type="button" class="osteo-v157-menu-btn" data-step="${index}" style="--menu-color:${color}">
            ${logoMarkup(step,index,true)}
            <strong>${esc(stepLabel(step,index))}</strong>
          </button>
        `;
      }).join('') +
      `
        <button type="button" class="osteo-v157-menu-btn osteo-v157-global" data-step="global" style="--menu-color:#00e5ff">
          <span class="osteo-v157-global-icon">◎</span>
          <strong>Technique globale</strong>
        </button>
      `;

    menu.querySelectorAll('.osteo-v157-menu-btn').forEach(button=>{
      button.addEventListener('click',()=>{
        if(button.dataset.step==='global') renderGlobal();
        else renderSelectedStep(Number(button.dataset.step));
      });
    });

    activeStepIndex=null;
    content.innerHTML='<div class="osteo-v157-placeholder">Choisissez une étape ci-dessus.</div>';
  }

  function hookOpenTechnique(){
    const original=fn('openTechnique');
    if(typeof original!=='function' || original.__osteoV157Hook) return;

    const wrapped=function(id){
      requestedTechniqueId=id;
      activeStepIndex=null;
      const result=original.apply(this,arguments);
      [0,60,180,500].forEach(delay=>setTimeout(()=>{
        ensureOpenWorldButton();
        renderWorld();
      },delay));
      return result;
    };

    wrapped.__osteoV157Hook=true;
    wrapped.__osteoOriginal=original;

    try{
      window.openTechnique=wrapped;
      openTechnique=wrapped;
    }catch(_){
      window.openTechnique=wrapped;
    }
  }

  let timer=null;
  function observe(){
    if(window.__osteoV157Observer) return;

    window.__osteoV157Observer=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        hookOpenTechnique();
        ensureOpenWorldButton();
      },60);
    });

    window.__osteoV157Observer.observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class']
    });
  }

  function install(){
    installStyles();
    ensureWorldScreen();
    ensureOpenWorldButton();
    hookOpenTechnique();
    observe();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }

  window.addEventListener('osteo-central-data-loaded',()=>setTimeout(install,80));
  setTimeout(install,500);
})();


/* === V18 · CHARGEMENT AUTHENTIFICATION ÉTUDIANT === */
(function(){
  if(document.querySelector('script[data-osteo-auth-v18]')) return;
  const s=document.createElement('script');
  s.src='auth-app-v18.js?v=18.3';
  s.defer=true;
  s.dataset.osteoAuthV18='1';
  (document.body||document.documentElement).appendChild(s);
})();

/* === V20.0 · RÔLES UTILISATEUR : ÉTUDIANT / ADMINISTRATEUR === */
(function(){
  if(document.querySelector('script[data-osteo-user-role-v20]')) return;
  const s=document.createElement('script');
  s.src='user-role-v20.js?v=20.0';
  s.defer=true;
  s.dataset.osteoUserRoleV20='1';
  (document.body||document.documentElement).appendChild(s);
})();

/* === V19.4 · SOCLE UTILISATEUR : FAVORIS + À REVOIR + PROGRESSION + STATS === */
(function(){
  if(document.querySelector('script[data-osteo-user-data-v19]')) return;
  const s=document.createElement('script');
  s.src='user-data-v19.js?v=19.4';
  s.defer=true;
  s.dataset.osteoUserDataV19='1';
  (document.body||document.documentElement).appendChild(s);
})();

