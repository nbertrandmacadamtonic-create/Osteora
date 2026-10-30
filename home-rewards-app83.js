/* Ostéo Pratik APP98 — médaille visible uniquement sur l'accueil principal. */
(function(){
  'use strict';
  if(window.OSTEO_HOME_REWARDS83)return;
  window.OSTEO_HOME_REWARDS83={version:'98.0'};
  const $=id=>document.getElementById(id);

  function addStyle(){
    if($('opHomeRewardsStyle83'))return;
    const style=document.createElement('style');style.id='opHomeRewardsStyle83';style.textContent=`
      body>.op-home-rewards83{position:fixed;z-index:10050!important;width:112px;height:112px;margin:0;padding:0;transform:translate(-50%,-50%);isolation:isolate}
      body>.op-home-rewards83[hidden]{display:none!important}
      body>.op-home-rewards83 button{display:grid;place-items:center;width:100%;height:100%;padding:0;border:0;border-radius:50%;color:#fff;background:transparent;font:inherit;cursor:pointer}
      body>.op-home-rewards83 .op-home-medal83{position:relative;z-index:2;display:grid;place-items:center;width:62px;height:62px;border:2px solid rgba(255,211,109,.84);border-radius:50%;color:#ffd36d;background:radial-gradient(circle at 35% 27%,#5c452b 0,#36251e 30%,#151124 72%);box-shadow:0 0 0 4px #07101f,0 0 21px rgba(255,199,78,.34);font-size:34px;line-height:1}
      body>.op-home-rewards83 button:hover .op-home-medal83,body>.op-home-rewards83 button:focus-visible .op-home-medal83{border-color:#5feaff;box-shadow:0 0 0 5px rgba(3,14,28,.70),0 0 30px rgba(95,234,255,.45)}
      @media(max-width:420px){body>.op-home-rewards83 .op-home-medal83{width:58px;height:58px;font-size:32px}}
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

  function locate(home){
    const labels=[textElement(home,/^Vidéos$/i),textElement(home,/^Réviser$/i),textElement(home,/^Tester$/i),textElement(home,/^(Stats|Statistiques)$/i)];
    if(labels.some(element=>!element))return null;
    const centers=labels.map(element=>{const box=element.getBoundingClientRect();return {x:box.left+box.width/2,y:box.top+box.height/2};});
    let x=centers.reduce((sum,p)=>sum+p.x,0)/4,y=centers.reduce((sum,p)=>sum+p.y,0)/4;
    const circle=document.elementsFromPoint(x,y).map(element=>({element,box:element.getBoundingClientRect()})).filter(item=>home.contains(item.element)&&item.box.width>=85&&item.box.width<=145&&item.box.height>=85&&item.box.height<=145&&Math.abs(item.box.width-item.box.height)<14&&Math.hypot(item.box.left+item.box.width/2-x,item.box.top+item.box.height/2-y)<35).sort((a,b)=>Math.abs(a.box.width-112)-Math.abs(b.box.width-112))[0];
    if(circle){x=circle.box.left+circle.box.width/2;y=circle.box.top+circle.box.height/2;}
    return {x,y};
  }

  function install(){
    addStyle();const home=$('home');if(!home)return;
    const activeScreens=[...document.querySelectorAll('.app > .screen.active')],activeScreen=activeScreens[activeScreens.length-1]||document.querySelector('.screen.active');
    const homeBox=home.getBoundingClientRect(),visible=activeScreen===home&&home.classList.contains('active')&&homeBox.width>0&&homeBox.height>0&&getComputedStyle(home).display!=='none'&&getComputedStyle(home).visibility!=='hidden';
    let wrap=$('opHomeRewards83');
    if(!wrap){wrap=document.createElement('div');wrap.id='opHomeRewards83';wrap.className='op-home-rewards83';const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Ouvrir mes trophées');button.innerHTML='<span class="op-home-medal83" aria-hidden="true">★</span>';button.onclick=openRewards;wrap.appendChild(button);}
    if(wrap.parentElement!==document.body)document.body.appendChild(wrap);
    wrap.hidden=!visible;if(!visible)return;
    const location=locate(home);if(!location){wrap.hidden=true;return;}
    wrap.style.left=location.x+'px';wrap.style.top=location.y+'px';
  }

  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});}
  install();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule,{passive:true});window.addEventListener('scroll',schedule,{passive:true});[250,700,1400,2500].forEach(delay=>setTimeout(schedule,delay));
})();
