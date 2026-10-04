/*
  Ostéo RA / Ostéo Pratik — Bridge central Supabase V4
  - app.js et styles.css restent intacts.
  - charge la configuration Supabase dynamiquement.
  - lit la base centrale publique et remplace uniquement le tableau de données
    en mémoire, sans réécrire le moteur de l'application.
  - en cas de problème réseau/configuration, le catalogue original reste utilisable.
*/
(function(){
  'use strict';

  const CONFIG_SRC='supabase-config.js';
  const TABLE='osteo_techniques';
  const LOCAL_SNAPSHOT_KEY='osteoRA.backoffice.snapshot.v1';

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

  function refreshKnownViews(){
    [
      'renderTechniques','renderSeenCollections','renderRevisionWheel',
      'renderCatalogueSearch','updateHomeCount','updateCatalogueCounts',
      'updateProgressZoneStats'
    ].forEach(name=>{
      try{
        const fn=window[name]||eval('typeof '+name+'==="function"?'+name+':null');
        if(typeof fn==='function') fn();
      }catch(_){}
    });
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

    saveOriginalSnapshot();

    const c=await loadConfig();
    if(!configured(c)) return false;

    const url=c.url.replace(/\/$/,'')+
      '/rest/v1/'+TABLE+'?select=id,data&order=id.asc';

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
      refreshKnownViews();

      window.dispatchEvent(new CustomEvent('osteo-central-data-loaded',{
        detail:{count:remote.length}
      }));
      return true;
    }catch(error){
      console.warn('[Ostéo Pratik] Base centrale indisponible, catalogue local conservé.',error);
      return false;
    }
  }

  window.OsteoRACentralBridge={
    reload:loadCentral
  };

  saveOriginalSnapshot();
  loadCentral();
  document.addEventListener('DOMContentLoaded',loadCentral,{once:true});

  // Synchronise aussi quand l'onglet redevient actif après une modification admin.
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
