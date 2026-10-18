/* =========================================================
   OSTÉO PRATIK V19.5 — CORRECTIF "À REVOIR" -> VIDÉO
   Fichier annexe : ne modifie pas index.html.
   ========================================================= */
(function(){
  'use strict';
  const VERSION='19.5';

  function techniquesList(){
    try{ if(Array.isArray(window.techniques)) return window.techniques; }catch(_){}
    try{ const t=eval('typeof techniques!=="undefined" ? techniques : []'); return Array.isArray(t)?t:[]; }catch(_){return []}
  }
  function byId(id){ return techniquesList().find(t=>String(t&&t.id)===String(id))||null; }
  function getFn(name){
    try{ if(typeof window[name]==='function') return window[name]; }catch(_){}
    try{ return eval('typeof '+name+'==="function" ? '+name+' : null'); }catch(_){return null;}
  }
  function openReviewVideo(id){
    const t=byId(id);
    if(!t){ const toast=getFn('toast'); if(toast) toast('Technique introuvable.'); return; }
    window.__nextPlayerBackTarget='seenCollections';
    const open=getFn('openTechnique');
    if(typeof open==='function'){
      open(t.id);
      setTimeout(()=>{
        const player=document.getElementById('player');
        if(player && !player.classList.contains('active')){
          const go=getFn('go');
          if(typeof go==='function') go('player');
        }
      },30);
      return;
    }
    const fallback=getFn('openTechniqueFromCatalogue');
    if(typeof fallback==='function') fallback(t.id);
  }
  function decorate(root){
    (root||document).querySelectorAll('#seenCollections [data-review-technique]').forEach(card=>{
      if(card.dataset.osteoReviewVideoV195==='1') return;
      card.dataset.osteoReviewVideoV195='1';
      const title=card.querySelector('strong');
      const label=(title?.textContent||'Technique').trim();
      card.title='Ouvrir la vidéo de cette technique';
      card.setAttribute('aria-label','Ouvrir la vidéo : '+label);
      if(title){ title.style.cursor='pointer'; title.style.textDecoration='none'; }
    });
  }
  document.addEventListener('click',function(e){
    const card=e.target&&e.target.closest?e.target.closest('#seenCollections [data-review-technique]'):null;
    if(!card) return;
    e.preventDefault(); e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
    openReviewVideo(card.dataset.reviewTechnique);
  },true);
  let timer=null;
  const observer=new MutationObserver(()=>{ clearTimeout(timer); timer=setTimeout(()=>decorate(document),40); });
  observer.observe(document.documentElement,{subtree:true,childList:true});
  decorate(document);
  window.OSTEO_REVIEW_VIDEO_LINK_V19_5={version:VERSION,open:openReviewVideo};
})();
