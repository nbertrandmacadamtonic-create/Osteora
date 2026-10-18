/* OSTÉO PRATIK V22.1 — couche graphique du recto, sans modifier le moteur V22 */
(function(){
  'use strict';
  const VERSION='22.1';
  const LOGO='assets/images/logo-osteo-pratik-title-transparent.webp';

  function upgrade(root){
    const scope=root||document;
    scope.querySelectorAll('.op22-card').forEach(card=>card.classList.add('op221-upgraded'));
    scope.querySelectorAll('.op22-logo').forEach(img=>{
      img.src=LOGO;
      img.removeAttribute('width');
      img.removeAttribute('height');
    });
    scope.querySelectorAll('.op22-zone-hologram').forEach(box=>{
      if(!box.querySelector('.op221-zone-label')){
        const s=document.createElement('span');
        s.className='op221-zone-label';
        s.textContent='ZONE';
        box.appendChild(s);
      }
    });
  }

  function waitBase(timeout=8000){
    return new Promise((resolve,reject)=>{
      const start=Date.now();
      (function tick(){
        if(window.OSTEO_PLAYING_CARDS_V22) return resolve(window.OSTEO_PLAYING_CARDS_V22);
        if(Date.now()-start>timeout) return reject(new Error('Moteur V22 introuvable'));
        setTimeout(tick,40);
      })();
    });
  }

  async function render(ref,target,opts={}){
    const api=await waitBase();
    const result=api.render(ref,target,opts);
    const el=typeof target==='string'?document.querySelector(target):target;
    upgrade(el||document);
    return result;
  }

  async function viewer(target,opts={}){
    const api=await waitBase();
    const result=api.viewer(target,opts);
    const el=typeof target==='string'?document.querySelector(target):target;
    upgrade(el||document);
    const obs=new MutationObserver(()=>upgrade(el||document));
    obs.observe(el||document.documentElement,{subtree:true,childList:true});
    return result;
  }

  window.OSTEO_PLAYING_CARDS_V22_1={version:VERSION,render,viewer,upgrade,ready:waitBase};
})();
