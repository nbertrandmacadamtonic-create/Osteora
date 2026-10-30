/* Ostéo Pratik APP86 — récompenses au centre des quatre menus. */
(function(){
  'use strict';
  if(window.OSTEO_HOME_REWARDS83)return;
  window.OSTEO_HOME_REWARDS83={version:'86.0'};
  const $=id=>document.getElementById(id);
  function style(){
    if($('opHomeRewardsStyle83'))return;
    const s=document.createElement('style');s.id='opHomeRewardsStyle83';s.textContent=`
      #home .op-home-menu-anchor86{position:relative!important;overflow:visible!important}
      #home .op-home-rewards83{position:absolute;left:50%;top:50%;z-index:12;width:auto;margin:0;padding:0;transform:translate(-50%,-50%);box-sizing:border-box}
      #home .op-home-rewards83 button{display:grid;place-items:center;width:78px;height:78px;padding:6px;border:1px solid rgba(255,200,90,.62);border-radius:50%;color:#f5f8ff;background:linear-gradient(145deg,rgba(25,39,68,.98),rgba(34,18,55,.98));box-shadow:0 10px 28px rgba(0,0,0,.48),0 0 0 5px rgba(2,9,20,.82),0 0 24px rgba(255,200,90,.20);font:inherit;cursor:pointer}
      #home .op-home-medal83{display:grid;place-items:center;width:37px;height:37px;margin:auto;border-radius:50%;color:#ffc85a;background:radial-gradient(circle at 36% 28%,rgba(255,255,255,.25),transparent 23%),linear-gradient(145deg,rgba(255,200,90,.34),rgba(20,14,34,.98));font-size:20px}
      #home .op-home-reward-copy83{display:block;margin-top:2px;color:#fff;text-align:center;font-size:8px;font-weight:900;line-height:1.05}#home .op-home-reward-copy83 small{display:none}
      #home .op-home-rewards83 button:hover,#home .op-home-rewards83 button:focus-visible{border-color:#5feaff;box-shadow:0 0 0 5px rgba(2,9,20,.82),0 0 0 7px rgba(95,234,255,.24),0 12px 32px rgba(0,0,0,.52)}
      @media(max-width:420px){#home .op-home-rewards83 button{width:68px;height:68px}#home .op-home-medal83{width:32px;height:32px;font-size:18px}#home .op-home-reward-copy83{font-size:7px}}
    `;document.head.appendChild(s);
  }
  function findMenu(home){
    const named=['.home-grid','.home-menu','.menu-grid','.main-menu','.home-actions','.home-cards'];
    for(const selector of named){const found=home.querySelector(selector);if(found)return found;}
    const nodes=[...home.querySelectorAll('div,section,main')];
    return nodes.find(node=>{
      const items=[...node.children].filter(child=>child.matches('button,a')||child.querySelector(':scope > button,:scope > a'));
      return items.length===4;
    })||null;
  }
  function openRewards(){
    const existing=$('opRewardsEntryApp43');
    if(existing){existing.click();return;}
    try{if(typeof window.go==='function')window.go('rewards');else if(typeof go==='function')go('rewards');}catch(_){}
  }
  function install(){
    style();const home=$('home');if(!home)return;
    const menu=findMenu(home);if(!menu)return;
    menu.classList.add('op-home-menu-anchor86');
    let wrap=$('opHomeRewards83');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='opHomeRewards83';wrap.className='op-home-rewards83';
      const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Ouvrir mes trophées et récompenses');button.innerHTML='<span class="op-home-medal83" aria-hidden="true">★</span><span class="op-home-reward-copy83">Récompenses</span>';button.onclick=openRewards;wrap.appendChild(button);
    }
    if(wrap.parentElement!==menu)menu.appendChild(wrap);
  }
  install();
  let refreshQueued=false;
  const observer=new MutationObserver(()=>{
    if(refreshQueued)return;
    refreshQueued=true;
    requestAnimationFrame(()=>{refreshQueued=false;install();});
  });
  observer.observe(document.body,{childList:true,subtree:true});
  [300,900,1800].forEach(ms=>setTimeout(install,ms));
})();
