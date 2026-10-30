/* Ostéo Pratik APP90 — grande médaille exactement centrée sur les quatre menus. */
(function(){
  'use strict';
  if(window.OSTEO_HOME_REWARDS83)return;
  window.OSTEO_HOME_REWARDS83={version:'90.0'};
  const $=id=>document.getElementById(id);

  function addStyle(){
    if($('opHomeRewardsStyle83'))return;
    const style=document.createElement('style');style.id='opHomeRewardsStyle83';style.textContent=`
      #home .op-home-menu-anchor90{position:relative!important;overflow:visible!important}
      #home .op-home-rewards83{position:absolute;z-index:40;width:112px;height:112px;margin:0;padding:0;transform:translate(-50%,-50%)}
      #home .op-home-rewards83 button{display:grid;place-items:center;width:100%;height:100%;padding:0;border:0;border-radius:50%;color:#fff;background:transparent;font:inherit;cursor:pointer}
      #home .op-home-medal83{display:grid;place-items:center;width:72px;height:72px;border:2px solid rgba(255,211,109,.78);border-radius:50%;color:#ffd36d;background:radial-gradient(circle at 35% 27%,rgba(255,255,255,.31),transparent 22%),linear-gradient(145deg,rgba(255,198,76,.38),rgba(22,15,37,.98));box-shadow:0 0 0 5px rgba(3,14,28,.66),0 0 25px rgba(255,199,78,.34);font-size:39px;line-height:1}
      #home .op-home-rewards83 button:hover .op-home-medal83,#home .op-home-rewards83 button:focus-visible .op-home-medal83{border-color:#5feaff;box-shadow:0 0 0 5px rgba(3,14,28,.70),0 0 30px rgba(95,234,255,.45)}
      @media(max-width:420px){#home .op-home-medal83{width:68px;height:68px;font-size:37px}}
    `;document.head.appendChild(style);
  }

  function openRewards(){
    const existing=$('opRewardsEntryApp43');if(existing){existing.click();return;}
    try{if(typeof window.go==='function')window.go('rewards');else if(typeof go==='function')go('rewards');}catch(_){}
  }

  function textElement(home,pattern){
    const walker=document.createTreeWalker(home,NodeFilter.SHOW_TEXT);
    const matches=[];let textNode;
    while((textNode=walker.nextNode())){
      const text=(textNode.nodeValue||'').replace(/\s+/g,' ').trim();
      if(pattern.test(text)&&textNode.parentElement){const box=textNode.parentElement.getBoundingClientRect();if(box.width&&box.height)matches.push({element:textNode.parentElement,box,area:box.width*box.height});}
    }
    matches.sort((a,b)=>a.area-b.area);return matches[0]?.element||null;
  }

  function commonAncestor(elements,home){
    let current=elements[0]?.parentElement;
    while(current&&current!==home){if(elements.every(element=>current.contains(element)))return current;current=current.parentElement;}
    return home;
  }

  function locate(home){
    const labels=[textElement(home,/^Vidéos$/i),textElement(home,/^Réviser$/i),textElement(home,/^Tester$/i),textElement(home,/^(Stats|Statistiques)$/i)];
    if(labels.some(element=>!element))return null;
    const centers=labels.map(element=>{const box=element.getBoundingClientRect();return {x:box.left+box.width/2,y:box.top+box.height/2};});
    return {anchor:commonAncestor(labels,home),x:centers.reduce((sum,p)=>sum+p.x,0)/4,y:centers.reduce((sum,p)=>sum+p.y,0)/4};
  }

  function install(){
    addStyle();const home=$('home');if(!home)return;
    const location=locate(home);if(!location)return;
    const anchor=location.anchor;anchor.classList.add('op-home-menu-anchor90');
    let wrap=$('opHomeRewards83');
    if(!wrap){wrap=document.createElement('div');wrap.id='opHomeRewards83';wrap.className='op-home-rewards83';const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Ouvrir mes trophées');button.innerHTML='<span class="op-home-medal83" aria-hidden="true">★</span>';button.onclick=openRewards;wrap.appendChild(button);}
    if(wrap.parentElement!==anchor)anchor.appendChild(wrap);
    const anchorBox=anchor.getBoundingClientRect();wrap.style.left=(location.x-anchorBox.left+anchor.scrollLeft)+'px';wrap.style.top=(location.y-anchorBox.top+anchor.scrollTop)+'px';
  }

  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});}
  install();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',schedule,{passive:true});[250,700,1400,2500].forEach(delay=>setTimeout(schedule,delay));
})();
