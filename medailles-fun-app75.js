/* Ostéo Pratik APP75 — collection vivante et parcours anatomique. */
(function(){
  'use strict';
  if(window.OSTEO_MEDALS75)return;
  window.OSTEO_MEDALS75={version:'75.0'};
  const $=id=>document.getElementById(id);
  const number=value=>Number(String(value||'0').replace(/[^0-9.-]/g,''))||0;
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>';
  const MEDALS=[
    {id:'first-view',icon:'▶',title:'Premier contact',text:'Terminer une première vidéo',key:'viewed',target:1,tone:'gold'},
    {id:'explorer-10',icon:'✦',title:'Explorateur',text:'Découvrir 10 techniques',key:'viewed',target:10,tone:'cyan'},
    {id:'explorer-25',icon:'✧',title:'Grand explorateur',text:'Découvrir 25 techniques',key:'viewed',target:25,tone:'violet'},
    {id:'first-card',icon:'▤',title:'Retourneur de cartes',text:'Consulter une première carte',key:'cards',target:1,tone:'cyan'},
    {id:'cards-10',icon:'▥',title:'Cartographe',text:'Consulter 10 cartes',key:'cards',target:10,tone:'violet'},
    {id:'mastered-1',icon:'◆',title:'Technique ancrée',text:'Maîtriser une technique',key:'mastered',target:1,tone:'gold'},
    {id:'mastered-10',icon:'◇',title:'Maître des techniques',text:'Maîtriser 10 techniques',key:'mastered',target:10,tone:'violet'},
    {id:'quiz-1',icon:'✓',title:'Mise à l’épreuve',text:'Terminer un premier test',key:'quizzes',target:1,tone:'cyan'},
    {id:'quiz-80',icon:'◎',title:'Précision',text:'Atteindre 80 % de moyenne',key:'quizAverage',target:80,tone:'cyan',suffix:' %'},
    {id:'perfect',icon:'★',title:'Sans trembler',text:'Obtenir 100 % à un test',key:'perfect',target:1,tone:'gold'},
    {id:'streak-3',icon:'♨',title:'Main régulière',text:'Réviser 3 jours de suite',key:'streak',target:3,tone:'orange'},
    {id:'zone-complete',icon:'⌖',title:'Gardien d’une région',text:'Terminer une zone anatomique',key:'completedZones',target:1,tone:'violet'}
  ];
  let signature='',scheduled=false,activeTab='collection',selectedMedal='first-view',selectedZone=0;
  function stats(){
    let viewed=number($('statsVideos')?.textContent);
    try{const ids=window.OSTEO_REVISION_CARDS_V22_2?.viewed?.();if(Array.isArray(ids))viewed=ids.length;}catch(_){}
    const learning=[...document.querySelectorAll('#osteoLearningStatsV1912 .op-learning-kpi b')];
    const quiz=[...document.querySelectorAll('#opQuizStatsSummaryV1919 .op-learning-kpi b')];
    const perfect=[...document.querySelectorAll('#opQuizHistoryV1919 .op-history-row b')].some(n=>number(n.textContent)>=100);
    const zones=zoneStats();
    return {
      viewed,
      cards:number($('statsSheets')?.textContent),
      streak:number(document.querySelector('#progress .stats-streak > b')?.textContent),
      mastered:number(learning[0]?.textContent),
      review:number(learning[1]?.textContent),
      quizzes:number(quiz[0]?.textContent),
      quizAverage:number(quiz[1]?.textContent),
      perfect:perfect?1:0,
      completedZones:zones.filter(z=>z.done).length,
      zones
    };
  }
  function zoneStats(){
    const found=[...document.querySelectorAll('#osteoLearningStatsV1912 .op-zone-row')].map((row,index)=>{
      const label=row.querySelector('strong,span')?.textContent?.trim()||'Région '+(index+1);
      const match=String(row.querySelector('em')?.textContent||'').match(/(\d+)\s*\/\s*(\d+)/);
      const value=match?Number(match[1]):0,total=match?Number(match[2]):0;
      return {label,value,total,ratio:total?Math.min(1,value/total):0,done:total>0&&value>=total};
    }).filter(z=>z.total>0);
    if(found.length)return found.slice(0,6);
    return ['Rachis','Membre supérieur','Bassin','Membre inférieur','Thorax'].map((label,index)=>({label,value:0,total:1,ratio:0,done:false,index}));
  }
  function states(s){return MEDALS.map(m=>{const value=Math.max(0,Number(s[m.key])||0);return {...m,value,ratio:Math.min(1,value/m.target),done:value>=m.target};});}
  function levelFor(xp){
    const levels=[{name:'Observateur',min:0,max:100},{name:'Explorateur',min:100,max:300},{name:'Praticien en progression',min:300,max:600},{name:'Réviseur confirmé',min:600,max:1000},{name:'Maître des techniques',min:1000,max:1500}];
    let index=levels.findIndex(l=>xp<l.max);if(index<0)index=levels.length-1;
    const current=levels[index],ratio=Math.min(1,(xp-current.min)/(current.max-current.min));
    return {...current,index:index+1,ratio};
  }
  function xpFor(s){return s.viewed*10+s.cards*3+s.quizzes*5+s.mastered*20+s.perfect*10+Math.min(s.streak,30)*2;}
  function ensureStyles(){
    if($('opMedalsStyle75'))return;
    const style=document.createElement('style');style.id='opMedalsStyle75';style.textContent=`
      #rewards>header.top,#rewards>.op-rewards-title,#rewards>#opRewardsContent{display:none!important}
      #opRewardsFun75{min-height:100%;padding:14px 14px 110px;color:#f3f8ff;background:radial-gradient(circle at 50% 0,rgba(61,211,245,.12),transparent 25%),#020914;box-sizing:border-box}
      #opRewardsFun75 *{box-sizing:border-box}
      #opRewardsFun75 .op75-head{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:8px;margin-bottom:14px}
      #opRewardsFun75 .op75-head>div{text-align:center}#opRewardsFun75 .op75-head small{display:block;color:#5feaff;font-size:9px;font-weight:900;letter-spacing:.13em}#opRewardsFun75 .op75-head h1{margin:3px 0 0;font-size:23px}
      #opRewardsFun75 .op75-back,#opRewardsFun75 .op75-info{display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:12px;background:transparent;color:#eef8ff}#opRewardsFun75 .op75-back svg{width:25px;height:25px}
      #opRewardsFun75 .op75-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:13px;padding:4px;border-radius:15px;background:#08182a}
      #opRewardsFun75 .op75-tab{min-height:42px;border:0;border-radius:11px;background:transparent;color:#91a8bf;font:inherit;font-weight:800}#opRewardsFun75 .op75-tab.is-active{color:#001b27;background:#5feaff}
      #opRewardsFun75 .op75-level{display:grid;grid-template-columns:76px 1fr;align-items:center;gap:14px;padding:15px;border-radius:21px;background:linear-gradient(145deg,#0b2942,#171a3d)}
      #opRewardsFun75 .op75-level-ring{width:68px;height:68px;display:grid;place-content:center;text-align:center;border-radius:50%;background:radial-gradient(circle,#14274a 54%,transparent 56%),conic-gradient(#5feaff var(--level),#263750 0);box-shadow:0 0 20px rgba(95,234,255,.2)}
      #opRewardsFun75 .op75-level-ring strong{font-size:24px}#opRewardsFun75 .op75-level-ring small{font-size:7px;color:#91a8bf}#opRewardsFun75 .op75-level-copy>small{color:#ffc85a}#opRewardsFun75 .op75-level-copy strong{display:block;margin:3px 0 8px;font-size:16px}
      #opRewardsFun75 .op75-track{height:6px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.09)}#opRewardsFun75 .op75-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#5feaff,#a47cff)}
      #opRewardsFun75 .op75-level-copy span{display:block;margin-top:7px;color:#91a8bf;font-size:10px}
      #opRewardsFun75 .op75-next{display:grid;grid-template-columns:58px 1fr;align-items:center;gap:13px;margin:12px 0;padding:13px;border-radius:18px;background:#091a2d}#opRewardsFun75 .op75-next small{color:#5feaff;font-size:9px;font-weight:900;letter-spacing:.1em}#opRewardsFun75 .op75-next strong{display:block;margin:3px 0;font-size:14px}#opRewardsFun75 .op75-next span{display:block;margin-bottom:7px;color:#91a8bf;font-size:10px}
      #opRewardsFun75 .op75-medal{display:grid;place-items:center;width:50px;height:50px;margin:auto;border-radius:50%;font-size:22px;font-weight:950;color:#5feaff;background:linear-gradient(145deg,rgba(95,234,255,.25),#071424);box-shadow:0 0 0 4px rgba(95,234,255,.06),0 0 17px rgba(95,234,255,.18)}
      #opRewardsFun75 .op75-medal.gold{color:#ffc85a;background:linear-gradient(145deg,rgba(255,200,90,.28),#171221)}#opRewardsFun75 .op75-medal.violet{color:#a47cff;background:linear-gradient(145deg,rgba(164,124,255,.3),#12122a)}#opRewardsFun75 .op75-medal.orange{color:#ff9664;background:linear-gradient(145deg,rgba(255,150,100,.3),#1d1420)}
      #opRewardsFun75 .op75-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}#opRewardsFun75 .op75-card{min-width:0;padding:11px 5px 9px;border:1px solid rgba(255,255,255,.07);border-radius:17px;background:#091a2d;color:#f3f8ff;text-align:center}#opRewardsFun75 .op75-card.is-selected{border-color:rgba(95,234,255,.65);background:#102842}#opRewardsFun75 .op75-card:not(.is-done){opacity:.58;filter:saturate(.35)}#opRewardsFun75 .op75-card:not(.is-done) .op75-medal{box-shadow:none;color:#718397;background:#111c2b}
      #opRewardsFun75 .op75-card strong{display:block;min-height:30px;margin-top:8px;font-size:10px;line-height:1.25}#opRewardsFun75 .op75-card small{color:#91a8bf;font-size:9px}
      #opRewardsFun75 .op75-detail{margin-top:11px;padding:12px 14px;border-radius:15px;background:linear-gradient(120deg,rgba(95,234,255,.1),rgba(164,124,255,.1))}#opRewardsFun75 .op75-detail small{color:#5feaff;font-size:8px;font-weight:900;letter-spacing:.1em}#opRewardsFun75 .op75-detail strong{display:block;margin:3px 0;font-size:13px}#opRewardsFun75 .op75-detail span{color:#91a8bf;font-size:10px}
      #opRewardsFun75 .op75-anatomy-intro{padding:14px;border-radius:17px;background:#091a2d}#opRewardsFun75 .op75-anatomy-intro strong{display:block;font-size:14px}#opRewardsFun75 .op75-anatomy-intro small{display:block;margin:5px 0 9px;color:#91a8bf;font-size:10px}
      #opRewardsFun75 .op75-zone-list{display:grid;gap:8px;margin-top:12px}#opRewardsFun75 .op75-zone{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:11px;padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:#091a2d;color:#f3f8ff;text-align:left}#opRewardsFun75 .op75-zone.is-done{border-color:rgba(95,234,255,.35);background:#0a2639}#opRewardsFun75 .op75-zone-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;color:#718397;background:#111f30}#opRewardsFun75 .op75-zone.is-done .op75-zone-icon{color:#001b27;background:#5feaff}#opRewardsFun75 .op75-zone strong{display:block;font-size:13px}#opRewardsFun75 .op75-zone small{display:block;margin:4px 0 6px;color:#91a8bf;font-size:9px}#opRewardsFun75 .op75-zone>b{color:#91a8bf;font-size:10px}
      #opRewardsFun75 .op75-challenge{margin-top:12px;padding:14px;border-radius:17px;background:linear-gradient(120deg,rgba(255,200,90,.13),rgba(164,124,255,.13))}#opRewardsFun75 .op75-challenge small{color:#ffc85a;font-size:9px;font-weight:900;letter-spacing:.1em}#opRewardsFun75 .op75-challenge strong{display:block;margin:4px 0;font-size:13px}#opRewardsFun75 .op75-challenge span{color:#91a8bf;font-size:10px}
      #opMedalToast75{position:fixed;left:50%;bottom:90px;z-index:10020;width:min(340px,calc(100% - 30px));padding:16px;transform:translateX(-50%);border:1px solid rgba(255,200,90,.5);border-radius:20px;color:#fff;text-align:center;background:linear-gradient(145deg,#12243d,#26163d);box-shadow:0 18px 50px #000a}#opMedalToast75 strong{display:block;margin:5px 0;color:#ffc85a;font-size:17px}#opMedalToast75 button{min-height:42px;margin-top:10px;padding:8px 14px;border:0;border-radius:11px;background:#5feaff;color:#001b27;font-weight:900}
      @media(max-width:370px){#opRewardsFun75{padding-left:10px;padding-right:10px}#opRewardsFun75 .op75-grid{gap:5px}#opRewardsFun75 .op75-card{padding-left:3px;padding-right:3px}}
    `;document.head.appendChild(style);
  }
  function collectionHTML(s,list){
    const xp=xpFor(s),level=levelFor(xp),obtained=list.filter(m=>m.done).length;
    const next=list.filter(m=>!m.done).sort((a,b)=>b.ratio-a.ratio||a.target-b.target)[0]||list[list.length-1];
    const selected=list.find(m=>m.id===selectedMedal)||list[0];
    return `<section class="op75-panel" data-panel="collection">
      <article class="op75-level"><div class="op75-level-ring" style="--level:${Math.round(level.ratio*100)}%"><strong>${level.index}</strong><small>NIVEAU</small></div><div class="op75-level-copy"><small>${esc(level.name)}</small><strong>${xp} / ${level.max} XP</strong><div class="op75-track"><i style="width:${Math.round(level.ratio*100)}%"></i></div><span>${Math.max(0,level.max-xp)} XP avant le niveau suivant</span></div></article>
      <article class="op75-next"><div class="op75-medal ${next.tone}">${esc(next.icon)}</div><div><small>${obtained===list.length?'COLLECTION COMPLÈTE':'PROCHAINE MÉDAILLE'}</small><strong>${esc(next.title)}</strong><span>${esc(next.text)} · ${Math.min(next.value,next.target)} / ${next.target}${next.suffix||''}</span><div class="op75-track"><i style="width:${Math.round(next.ratio*100)}%"></i></div></div></article>
      <div class="op75-grid">${list.map(m=>`<button type="button" class="op75-card ${m.done?'is-done':''} ${m.id===selected.id?'is-selected':''}" data-medal="${m.id}"><span class="op75-medal ${m.tone}">${esc(m.icon)}</span><strong>${esc(m.title)}</strong><small>${m.done?'Obtenue':Math.min(m.value,m.target)+' / '+m.target+(m.suffix||'')}</small></button>`).join('')}</div>
      <article class="op75-detail" aria-live="polite"><small>MÉDAILLE SÉLECTIONNÉE</small><strong>${esc(selected.title)}</strong><span>${esc(selected.text)} · ${selected.done?'Médaille obtenue':Math.min(selected.value,selected.target)+' / '+selected.target+(selected.suffix||'')}</span></article>
    </section>`;
  }
  function anatomyHTML(s){
    const zones=s.zones,done=zones.filter(z=>z.done).length,total=zones.length||1,next=zones.find(z=>!z.done)||zones[0];
    return `<section class="op75-panel" data-panel="anatomy">
      <article class="op75-anatomy-intro"><strong>${done} région${done>1?'s':''} terminée${done>1?'s':''} sur ${total}</strong><small>Progressez dans chaque région pour compléter votre parcours anatomique.</small><div class="op75-track"><i style="width:${Math.round(done/total*100)}%"></i></div></article>
      <div class="op75-zone-list">${zones.map((z,i)=>`<button type="button" class="op75-zone ${z.done?'is-done':''}" data-zone="${i}"><span class="op75-zone-icon">${z.done?'✓':'⌖'}</span><span><strong>${esc(z.label)}</strong><small>${z.done?'Collection terminée':'Progression anatomique'}</small><span class="op75-track"><i style="width:${Math.round(z.ratio*100)}%"></i></span></span><b>${z.value} / ${z.total}</b></button>`).join('')}</div>
      <article class="op75-challenge"><small>OBJECTIF DU MOMENT</small><strong>${next?.done?'Toutes les régions disponibles sont terminées':'Continuer : '+esc(next?.label||'prochaine région')}</strong><span>${next?Math.round(next.ratio*100):0} % de progression dans cette région</span></article>
    </section>`;
  }
  function shellHTML(s,list){
    return `<div class="op75-head"><button class="op75-back" type="button" aria-label="Retour à la progression">${BACK}</button><div><small>PROGRESSION PERSONNELLE</small><h1>Mes trophées</h1></div><button class="op75-info" type="button" aria-label="Informations">ⓘ</button></div>
      <div class="op75-tabs" role="tablist" aria-label="Trophées"><button class="op75-tab ${activeTab==='collection'?'is-active':''}" type="button" data-tab="collection" role="tab" aria-selected="${activeTab==='collection'}">Collection</button><button class="op75-tab ${activeTab==='anatomy'?'is-active':''}" type="button" data-tab="anatomy" role="tab" aria-selected="${activeTab==='anatomy'}">Parcours anatomique</button></div>
      ${activeTab==='collection'?collectionHTML(s,list):anatomyHTML(s)}`;
  }
  function bind(root,s,list){
    root.querySelector('.op75-back')?.addEventListener('click',()=>{try{if(typeof window.go==='function')window.go('progress');else if(typeof go==='function')go('progress');}catch(_){}});
    root.querySelector('.op75-info')?.addEventListener('click',()=>alert('Les trophées récompensent votre régularité et votre progression. Ils ne constituent pas une certification professionnelle.'));
    root.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{activeTab=b.dataset.tab;signature='';render(true);}));
    root.querySelectorAll('[data-medal]').forEach(b=>b.addEventListener('click',()=>{selectedMedal=b.dataset.medal;root.querySelectorAll('[data-medal]').forEach(x=>x.classList.toggle('is-selected',x===b));const m=list.find(x=>x.id===selectedMedal),d=root.querySelector('.op75-detail');if(m&&d){d.querySelector('strong').textContent=m.title;d.querySelector('span').textContent=m.text+' · '+(m.done?'Médaille obtenue':Math.min(m.value,m.target)+' / '+m.target+(m.suffix||''));}}));
  }
  function celebrate(list){
    const key='osteo.medals.app75.seen',done=list.filter(m=>m.done).map(m=>m.id);let previous=null;
    try{previous=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
    if(!Array.isArray(previous)){try{localStorage.setItem(key,JSON.stringify(done));}catch(_){}return;}
    const fresh=done.filter(id=>!previous.includes(id));try{localStorage.setItem(key,JSON.stringify(done));}catch(_){}
    if(!fresh.length||$('opMedalToast75'))return;const medal=list.find(m=>m.id===fresh[0]);if(!medal)return;
    const toast=document.createElement('aside');toast.id='opMedalToast75';toast.setAttribute('role','status');toast.innerHTML='<small>NOUVELLE MÉDAILLE</small><strong>'+esc(medal.icon+' '+medal.title)+'</strong><span>'+esc(medal.text)+'</span><button type="button">Voir ma collection</button>';document.body.appendChild(toast);toast.querySelector('button').onclick=()=>toast.remove();setTimeout(()=>toast.remove(),7000);
  }
  function render(force=false){
    scheduled=false;ensureStyles();const screen=$('rewards');if(!screen)return;
    const s=stats(),list=states(s),nextSignature=JSON.stringify({s,activeTab,selectedMedal});
    if(!force&&nextSignature===signature)return;signature=nextSignature;
    let root=$('opRewardsFun75');if(!root){root=document.createElement('div');root.id='opRewardsFun75';screen.appendChild(root);}
    root.innerHTML=shellHTML(s,list);bind(root,s,list);celebrate(list);
  }
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(render,80);}
  function install(){ensureStyles();render(true);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});[300,900,1800].forEach(ms=>setTimeout(()=>render(true),ms));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
