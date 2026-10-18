/* OSTÉO PRATIK V22.2 — recto premium épuré, moteur V22 inchangé */
(function(){
  'use strict';
  const VERSION='22.2';
  const LOGO='assets/images/logo-osteo-pratik-title-transparent.webp';

  function readText(el){ return String(el?.textContent||'').replace(/\s+/g,' ').trim(); }

  function upgradeCard(card){
    if(!card || card.classList.contains('op222-upgraded')) return;
    card.classList.add('op222-upgraded');

    card.querySelectorAll('.op22-logo').forEach(img=>{
      img.src=LOGO;
      img.removeAttribute('width');
      img.removeAttribute('height');
    });

    const front=card.querySelector('.op22-front');
    if(!front) return;

    const copy=front.querySelector('.op22-front-copy');
    if(copy){
      const zone=readText(copy.querySelector('.op22-zone-pill'));
      const sub=readText(copy.querySelector('.op22-sub'));

      if(!copy.querySelector('.op222-kicker')){
        const kicker=document.createElement('div');
        kicker.className='op222-kicker';
        kicker.textContent=[zone,sub].filter(Boolean).join(' · ');
        copy.prepend(kicker);
      }

      const meta=copy.querySelector('.op22-meta');
      if(meta && !copy.querySelector('.op222-meta-line')){
        const values=[...meta.querySelectorAll('b')].map(readText).filter(Boolean);
        const line=document.createElement('div');
        line.className='op222-meta-line';
        line.textContent=values.join(' · ');
        copy.appendChild(line);
      }
    }
  }

  function upgrade(root){
    const scope=root||document;
    scope.querySelectorAll('.op22-card').forEach(upgradeCard);
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

    let timer=null;
    const obs=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>upgrade(el||document),25);
    });
    obs.observe(el||document.documentElement,{subtree:true,childList:true});
    return result;
  }

  window.OSTEO_PLAYING_CARDS_V22_2={version:VERSION,render,viewer,upgrade,ready:waitBase};
})();
