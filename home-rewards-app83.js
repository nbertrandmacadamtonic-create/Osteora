/* Ostéo Pratik APP83 — accès central aux récompenses depuis l'accueil. */
(function(){
  'use strict';
  if(window.OSTEO_HOME_REWARDS83)return;
  window.OSTEO_HOME_REWARDS83={version:'83.0'};
  const $=id=>document.getElementById(id);
  function style(){
    if($('opHomeRewardsStyle83'))return;
    const s=document.createElement('style');s.id='opHomeRewardsStyle83';s.textContent=`
      #home .op-home-rewards83{display:flex;justify-content:center;align-items:center;width:100%;margin:13px 0 17px;padding:0 14px;box-sizing:border-box}
      #home .op-home-rewards83 button{position:relative;display:grid;grid-template-columns:54px auto;align-items:center;gap:11px;min-height:64px;padding:7px 17px 7px 8px;border:1px solid rgba(255,200,90,.42);border-radius:999px;color:#f5f8ff;background:linear-gradient(135deg,rgba(22,35,64,.96),rgba(29,18,57,.96));box-shadow:0 12px 30px rgba(0,0,0,.24),0 0 22px rgba(255,200,90,.08);font:inherit;cursor:pointer}
      #home .op-home-medal83{display:grid;place-items:center;width:50px;height:50px;border-radius:50%;color:#ffc85a;background:radial-gradient(circle at 36% 28%,rgba(255,255,255,.24),transparent 23%),linear-gradient(145deg,rgba(255,200,90,.30),rgba(20,14,34,.98));box-shadow:0 0 0 4px rgba(255,200,90,.07),0 0 18px rgba(255,200,90,.20);font-size:25px}
      #home .op-home-reward-copy83{text-align:left}#home .op-home-reward-copy83 small{display:block;color:#ffc85a;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}#home .op-home-reward-copy83 strong{display:block;margin-top:3px;font-size:14px}#home .op-home-reward-count83{display:block;margin-top:3px;color:#9fb5cb;font-size:10px}
      #home .op-home-rewards83 button:hover,#home .op-home-rewards83 button:focus-visible{border-color:#5feaff;box-shadow:0 0 0 2px rgba(95,234,255,.24),0 14px 34px rgba(0,0,0,.3)}
      @media(max-width:420px){#home .op-home-rewards83{margin:10px 0 13px}#home .op-home-rewards83 button{grid-template-columns:48px auto;min-height:58px;padding-right:14px}#home .op-home-medal83{width:44px;height:44px;font-size:22px}}
    `;document.head.appendChild(s);
  }
  function updateCount(){
    const count=$('opHomeRewardCount83');if(!count)return;
    const cards=[...document.querySelectorAll('#opRewardsFun75 .op75-card')],done=cards.filter(card=>card.classList.contains('is-done')).length;
    count.textContent=cards.length?done+' / '+cards.length+' trophées obtenus':'Voir ma collection';
  }
  function openRewards(){
    const existing=$('opRewardsEntryApp43');
    if(existing){existing.click();return;}
    try{if(typeof window.go==='function')window.go('rewards');else if(typeof go==='function')go('rewards');}catch(_){}
  }
  function install(){
    style();const home=$('home');if(!home||$('opHomeRewards83'))return;
    const wrap=document.createElement('div');wrap.id='opHomeRewards83';wrap.className='op-home-rewards83';
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Ouvrir mes trophées et récompenses');button.innerHTML='<span class="op-home-medal83" aria-hidden="true">★</span><span class="op-home-reward-copy83"><small>Récompenses</small><strong>Mes trophées</strong><span class="op-home-reward-count83" id="opHomeRewardCount83">Voir ma collection</span></span>';button.onclick=openRewards;wrap.appendChild(button);
    const top=home.querySelector('.home-top');if(top)top.insertAdjacentElement('afterend',wrap);else home.prepend(wrap);
    updateCount();
  }
  install();
  const observer=new MutationObserver(()=>{install();updateCount();});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  [300,900,1800].forEach(ms=>setTimeout(()=>{install();updateCount();},ms));
})();
