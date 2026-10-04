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
  link.href = "responsive-web.css";
  document.head.appendChild(link);
})();


/* === V7 · IMAGE PRINCIPALE DANS LA FICHE APPLICATION === */
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

  function mainImage(t){
    return String((t && (t.image || t.imageUrl || t.poster)) || '').trim();
  }

  function styles(){
    if(document.getElementById('osteoCentralImageStyles')) return;
    const s=document.createElement('style');
    s.id='osteoCentralImageStyles';
    s.textContent=`
      .osteo-central-main-image{
        margin:14px 0 18px;padding:10px;border-radius:22px;
        border:1px solid rgba(0,229,255,.22);
        background:linear-gradient(145deg,rgba(10,29,55,.88),rgba(5,15,31,.94));
        box-shadow:0 14px 42px rgba(0,0,0,.24);
      }
      .osteo-central-main-image small{
        display:block;margin:0 0 8px;color:#8fa7c7;font-size:11px;
        font-weight:800;letter-spacing:.06em;text-transform:uppercase;
      }
      .osteo-central-main-image button{
        display:block;width:100%;padding:0;border:0;background:transparent;
        border-radius:16px;overflow:hidden;cursor:pointer;
      }
      .osteo-central-main-image img{
        display:block;width:100%;max-height:360px;object-fit:contain;
        border-radius:16px;background:#020714;
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
    const src=mainImage(t);
    const screen=document.getElementById('techniqueDetail');
    if(!screen) return;

    const hero=screen.querySelector('.fiche-hero-visual');
    if(hero){
      hero.querySelectorAll('.osteo-hero-main-image').forEach(x=>x.remove());
      hero.classList.toggle('osteo-has-main-image',!!src);
      if(src){
        const img=document.createElement('img');
        img.className='osteo-hero-main-image';
        img.src=src;
        img.alt=t?.title || 'Image principale';
        img.onclick=()=>{
          const open=fn('openStepImage');
          if(typeof open==='function') open(src,'Image principale');
        };
        hero.prepend(img);
      }
    }

    let panel=document.getElementById('osteoCentralMainImagePanel');
    if(!src){
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
    const img=panel.querySelector('img');
    img.src=src;
    img.alt=t?.title || 'Image principale';
    panel.querySelector('button').onclick=()=>{
      const open=fn('openStepImage');
      if(typeof open==='function') open(src,'Image principale');
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
