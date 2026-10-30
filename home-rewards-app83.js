/* Ostéo Pratik APP88 — récompenses dans le cercle central des quatre menus. */
(function(){
  'use strict';
  if(window.OSTEO_HOME_REWARDS83)return;
  window.OSTEO_HOME_REWARDS83={version:'88.0'};
  const $=id=>document.getElementById(id);
  function addStyle(){
    if($('opHomeRewardsStyle83'))return;
    const style=document.createElement('style');style.id='opHomeRewardsStyle83';style.textContent=`
      #home .op-home-menu-anchor88{position:relative!important;overflow:visible!important}
      #home .op-home-rewards83{position:absolute;z-index:30;width:112px;height:112px;margin:0;padding:0;transform:translate(-50%,-50%)}
      #home .op-home-rewards83 button{display:grid;place-items:center;width:100%;height:100%;padding:10px;border:2px solid rgba(231,246,255,.88);border-radius:50%;color:#fff;background:radial-gradient(circle at 50% 35%,rgba(31,73,103,.96),rgba(5,17,34,.98) 67%);box-shadow:0 0 0 4px rgba(95,234,255,.12),0 0 26px rgba(95,234,255,.27),0 12px 30px rgba(0,0,0,.48);font:inherit;cursor:pointer}
      #home .op-home-medal83{display:grid;place-items:center;width:47px;height:47px;border-radius:50%;color:#ffc85a;background:radial-gradient(circle at 35% 27%,rgba(255,255,255,.30),transparent 22%),linear-gradient(145deg,rgba(255,200,90,.35),rgba(27,16,31,.98));box-shadow:0 0 0 3px rgba(255,200,90,.10),0 0 17px rgba(255,200,90,.24);font-size:25px}
      #home .op-home-reward-copy83{display:block;margin-top:5px;color:#fff;font-size:9px;font-weight:950;line-height:1;letter-spacing:.02em;text-align:center}
      #home .op-home-rewards83 button:hover,#home .op-home-rewards83 button:focus-visible{border-color:#ffc85a;box-shadow:0 0 0 4px rgba(255,200,90,.16),0 0 32px rgba(255,200,90,.33),0 12px 30px rgba(0,0,0,.5)}
      @media(max-width:420px){#home .op-home-rewards83{width:104px;height:104px}#home .op-home-medal83{width:43px;height:43px;font-size:23px}#home .op-home-reward-copy83{font-size:8px}}
    `;document.head.appendChild(style);
  }
  function openRewards(){
    const existing=$('opRewardsEntryApp43');if(existing){existing.click();return;}
    try{if(typeof window.go==='function')window.go('rewards');else if(typeof go==='function')go('rewards');}catch(_){}
  }
  function action(home,pattern){
    return [...home.querySelectorAll('button,a,[role="button"]')].find(element=>pattern.test((element.innerText||element.textContent||'').trim()))||null;
  }
  function commonAncestor(elements,home){
    let current=elements[0]?.parentElement;
    while(current&&current!==home){if(elements.every(element=>current.contains(element)))return current;current=current.parentElement;}
    return home;
  }
  function locate(home){
    const actions=[action(home,/vid[eé]os/i),action(home,/r[eé]viser/i),action(home,/tester/i),action(home,/stats|statistiques/i)];
    if(actions.some(element=>!element))return null;
    const boxes=actions.map(element=>element.getBoundingClientRect()).filter(box=>box.width&&box.height);if(boxes.length!==4)return null;
    const left=Math.min(...boxes.map(box=>box.left)),right=Math.max(...boxes.map(box=>box.right));
    const top=Math.min(...boxes.map(box=>box.top)),bottom=Math.max(...boxes.map(box=>box.bottom));
    return {anchor:commonAncestor(actions,home),x:(left+right)/2,y:(top+bottom)/2};
  }
  function install(){
    addStyle();const home=$('home');if(!home)return;
    const location=locate(home);if(!location)return;
    const anchor=location.anchor;anchor.classList.add('op-home-menu-anchor88');
    let wrap=$('opHomeRewards83');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='opHomeRewards83';wrap.className='op-home-rewards83';
      const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Ouvrir mes trophées et récompenses');
      button.innerHTML='<span class="op-home-medal83" aria-hidden="true">★</span><span class="op-home-reward-copy83">Récompenses</span>';button.onclick=openRewards;wrap.appendChild(button);
    }
    if(wrap.parentElement!==anchor)anchor.appendChild(wrap);
    const anchorBox=anchor.getBoundingClientRect();
    wrap.style.left=(location.x-anchorBox.left+anchor.scrollLeft)+'px';wrap.style.top=(location.y-anchorBox.top+anchor.scrollTop)+'px';
  }
  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});}
  install();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',schedule,{passive:true});[250,700,1400,2500].forEach(delay=>setTimeout(schedule,delay));
})();
