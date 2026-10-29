/* Ostéo Pratik APP56 — composants et navigation. APP55 conservée. */
(function(){
'use strict';
if(/backoffice\.html$/i.test(location.pathname)||window.OSTEO_NAV56)return;
const $=id=>document.getElementById(id),active=()=>document.querySelector('.app > .screen.active'),pub=new Set(['welcome','signup','login','reset-password']);
const paths={back:'<path d="m14 5-7 7 7 7M7 12h13"/>',home:'<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z"/>',books:'<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',revision:'<path d="m16 3 4 4-4 4M4 7h16M8 21l-4-4 4-4M20 17H4"/>',heart:'<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',settings:'<path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>',admin:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'};
function svg(kind){return '<svg data-op-icon56="'+kind+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths[kind]+'</svg>';}
function tr(text){return window.OSTEO_LANG50?.translate?.(text)||text;}
function attr(el,k,v){if(el.getAttribute(k)!==String(v))el.setAttribute(k,v);}
function icon(el,kind,label,bottom=false){if(!el)return;if(!el.querySelector('[data-op-icon56="'+kind+'"]')){if(bottom){for(const n of [...el.childNodes])if(n.nodeType===3||n.nodeType===1&&n.tagName==='SVG')n.remove();el.insertAdjacentHTML('afterbegin',svg(kind));}else el.innerHTML=svg(kind);}if(label){attr(el,'aria-label',tr(label));attr(el,'title',tr(label));}}
const fixed={home:'home',videoMap:'zones',zones:'zones',rachisMenu:'zones',rachis:'zones',msupMenu:'zones',minfMenu:'zones',bassinMenu:'zones',techniques:'zones',catalogue:'zones',revision:'revision',revisionWheel:'revision',revisionVoice:'revision',revisionCard:'revision',seenCollections:'revision',seenCards:'revision',quizMenu:'home',quiz:'home',progress:'home',rewards:'home',favorites:'favorites',profile:'profile'};
const transient=new Set(['player','techniqueDetail','osteoTechniqueWorld']);
let lastId=active()?.id||'welcome',origin='zones',anchor='techniques',scheduled=false,popping=false,departing=null,wrapped=null,identity=null,started=false;
const token=Math.random().toString(36).slice(2),entries=new Map();let position=0;
function signed(){return window.OSTEO_AUTH?.isAuthenticated?.()===true;}
function userKey(){return window.OSTEO_AUTH?.getSession?.()?.user?.id||null;}
function context(){const c={};try{if(typeof currentZone!=='undefined')c.zone=currentZone;if(typeof currentSubzone!=='undefined')c.sub=currentSubzone;if(typeof currentBack!=='undefined')c.back=currentBack;if(typeof currentFilters!=='undefined')c.filters=Array.isArray(currentFilters)?currentFilters.slice():currentFilters;if(typeof currentSeenZone!=='undefined')c.seenZone=currentSeenZone;if(typeof currentSeenSub!=='undefined')c.seenSub=currentSeenSub;}catch(_){}return c;}
function capture(id=active()?.id){const el=$(id),search={};for(const key of ['searchInput','catalogueSearchInput'])if($(key))search[key]=$(key).value;return {screen:id||'welcome',scroll:el?.scrollTop||0,search,context:context(),origin,anchor};}
function resume(entry){const e={...entry};if(transient.has(e.screen))e.screen=e.anchor||'techniques';if(e.screen==='revisionCard'||e.screen==='revisionVoice')e.screen='revisionWheel';if(e.screen==='quiz')e.screen='quizMenu';return e;}
function state(index){return {...(history.state&&typeof history.state==='object'?history.state:{}),osteoNavigation56:{token,index}};}
function initialise(){if(!window.OSTEO_AUTH)return;identity=userKey();entries.clear();position=0;entries.set(0,capture());try{history.replaceState(state(0),'');started=true;}catch(_){started=false;}}
function storeTransition(before,id){if(!started)return;if(userKey()!==identity){initialise();return;}if(popping)return;const old=entries.get(position);if(old&&before&&old.screen===before.screen)entries.set(position,before);if(old?.screen===id)return;
 const next=capture(id);for(const key of entries.keys())if(key>position)entries.delete(key);const n=position+1;try{history.pushState(state(n),'');entries.set(n,next);position=n;}catch(_){}
}
function installHelp57(){
 const pages=window.OSTEO_CONTENT_APP44?.helpPages||{};
 for(const screen of Object.keys(pages)){const header=$(screen)?.querySelector(':scope > header.top');if(!header)continue;const buttons=[...header.children].filter(n=>n.matches('button.icon:not(.round)'));const b=buttons[buttons.length-1];if(!b)continue;
 if(!header.classList.contains('op-help-header57'))header.classList.add('op-help-header57');b.dataset.opHelp57=screen;b.type='button';icon(b,'info',tr('Informations')+' · '+pages[screen][0]);attr(b,'aria-haspopup','dialog');attr(b,'aria-controls','opContentDialog44');}
}
const titleSelectors58='.video-page-title,.rachis-menu-title,.module-menu-title,.revision-page-title,.seen-album-title,.stats-page-title,.catalogue-hero-title,.quiz-general-title,.revision-title,.page-title,.zone-page-title,.library-page-title,.detail-page-title,.op-tester-summary,.op-rewards-title';
function centreTitles58(){
 for(const header of document.querySelectorAll('.screen > header.top'))if(header.querySelector(':scope > .brand')&&header.querySelector(':scope > button.icon.round')){if(!header.classList.contains('op-balanced-header58'))header.classList.add('op-balanced-header58');}
 for(const block of document.querySelectorAll(titleSelectors58)){
  if(!block.closest('.screen'))continue;
  let text=[...block.children].find(el=>el.tagName==='DIV'&&el.querySelector('h1,h2'));
  const direct=block.querySelector(':scope > h1,:scope > h2');
  if(!text&&direct){text=document.createElement('div');for(const child of [...block.children])if(child.matches('h1,h2,p,small'))text.appendChild(child);block.insertBefore(text,block.firstChild);}
  if(!text)continue;
  // Tester et les médailles ne possèdent pas l’illustration des anciens bandeaux.
  const noLogo=!block.querySelector(':scope > .page-title-logo');if(block.classList.contains('op-title-no-logo59')!==noLogo)block.classList.toggle('op-title-no-logo59',noLogo);

  if(!text.classList.contains('op-title-content58'))text.classList.add('op-title-content58');
  if(!block.classList.contains('op-centered-title58'))block.classList.add('op-centered-title58');
 }
}
function sync(){const screen=active();if(!screen)return;const id=screen.id;
 if(!started&&window.OSTEO_AUTH)initialise();
 if(started&&userKey()!==identity)initialise();
 if(id!==lastId){const before=departing||entries.get(position)||{screen:lastId};if(transient.has(id)&&!transient.has(lastId)){origin=fixed[lastId]||origin;anchor=lastId;if(id==='player')try{if(typeof playerBackTarget!=='undefined')playerBackTarget=anchor;}catch(_){}}else if(!transient.has(id)){origin=fixed[id]||origin;anchor=id;}
  if(transient.has(lastId)&&id===anchor){const prior=[...entries].filter(([k,e])=>k<position&&e.screen===id).sort((a,b)=>b[0]-a[0])[0]?.[1];if(prior){for(const [key,value]of Object.entries(prior.search||{}))if($(key))$(key).value=value;screen.scrollTop=prior.scroll||0;requestAnimationFrame(()=>{if(active()===screen)screen.scrollTop=prior.scroll||0;});}}
  storeTransition(before,id);lastId=id;departing=null;}
 const section=transient.has(id)?origin:fixed[id];const profileOpen=$('opSettingsDialog45')?.open&&$('opSettingsDialog45').dataset.menuMode49==='profile';
 document.querySelectorAll('.bottom [data-target]').forEach(b=>{const isCurrent=!pub.has(id)&&(profileOpen?b.dataset.target==='profile':b.dataset.target===section);if(b.classList.contains('active')!==isCurrent)b.classList.toggle('active',isCurrent);if(isCurrent)attr(b,'aria-current',profileOpen?'true':'page');else if(b.hasAttribute('aria-current'))b.removeAttribute('aria-current');const kinds={home:'home',zones:'books',revision:'revision',favorites:'heart',profile:'user'};icon(b,kinds[b.dataset.target]||'home',null,true);});
 document.querySelectorAll('.screen > header.top > button.icon.round').forEach(b=>icon(b,'back','Retour'));
 for(const b of document.querySelectorAll('.screen > header.top > button.icon:not(.round)')){const text=b.textContent.trim();if(['i','?','▤','▥'].includes(text))icon(b,'info',b.getAttribute('title')||'Informations');}
 icon(document.querySelector('#home .home-settings'),'settings','Réglages');icon(document.querySelector('#home .home-notifications'),'admin','Back-office');
 const premium=document.querySelector('#signup > .top > .icon:not(.round)');if(premium){premium.hidden=true;attr(premium,'aria-hidden','true');premium.tabIndex=-1;premium.classList.add('op-unavailable56');}
 for(const b of document.querySelectorAll('button.auth-v18-eye, .auth-v18-password-wrap button'))labelPassword(b);
 // Auth module uses a plain wrapper; avoid assumptions about its class name.
 for(const b of document.querySelectorAll('#signup button,#login button,#reset-password button'))if(b.textContent.trim()==='◉'||b.dataset.opPassword56)labelPassword(b);
 installHelp57();centreTitles58();
 const start=document.querySelector('#welcome .welcome-start');if(start){const base=signed()?'Commencer':'Créer mon compte';if(start.dataset.opStart56!==base){start.dataset.opStart56=base;start.innerHTML='';const text=document.createElement('span');text.className='op-start-label56';text.textContent=tr(base);start.append(text);const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');start.append(arrow);}attr(start,'aria-label',tr(base));}
}
function labelPassword(b){const input=b.parentElement?.querySelector('input');if(!input||!['password','text'].includes(input.type))return;b.dataset.opPassword56='1';attr(b,'aria-label',tr(input.type==='password'?'Afficher le mot de passe':'Masquer le mot de passe'));attr(b,'title',tr(input.type==='password'?'Afficher le mot de passe':'Masquer le mot de passe'));attr(b,'aria-pressed',input.type==='text');}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;sync();},0);}
function installGo(){const current=window.go;if(typeof current!=='function'||current===wrapped||current.__opNav56)return;const previous=current;wrapped=function(){if(!popping&&!departing)departing=capture();const result=previous.apply(this,arguments);schedule();return result;};wrapped.__opNav56=true;window.go=wrapped;try{go=wrapped;}catch(_){} }
function restore(entry){const target=resume(entry);if(!$(target.screen))return false;if(!pub.has(target.screen)&&!signed())return false;
 const c=target.context||{};try{if(typeof currentZone!=='undefined'&&'zone'in c)currentZone=c.zone;if(typeof currentSubzone!=='undefined'&&'sub'in c)currentSubzone=c.sub;if(typeof currentBack!=='undefined'&&'back'in c)currentBack=c.back;if(typeof currentFilters!=='undefined'&&'filters'in c)currentFilters=c.filters;if(typeof currentSeenZone!=='undefined'&&'seenZone'in c)currentSeenZone=c.seenZone;if(typeof currentSeenSub!=='undefined'&&'seenSub'in c)currentSeenSub=c.seenSub;}catch(_){}
 origin=target.origin||fixed[target.screen]||'zones';anchor=target.anchor||target.screen;
 window.go(target.screen);if(active()?.id!==target.screen)return false;
 for(const [key,value]of Object.entries(target.search||{}))if($(key))$(key).value=value;
 try{if(target.screen==='techniques'){if(typeof setTitle==='function')setTitle(c.sub||c.zone||'Techniques','Sélectionnez une technique');if(typeof renderTechniques==='function')renderTechniques();}if(target.screen==='zones'&&typeof renderCatalogueSearch==='function')renderCatalogueSearch();if(target.screen==='seenCards'&&c.seenZone&&typeof renderSeenCards==='function')renderSeenCards(c.seenZone,c.seenSub);}catch(_){}
 const el=$(target.screen);el.scrollTop=target.scroll||0;requestAnimationFrame(()=>{if(active()===el)el.scrollTop=target.scroll||0;});lastId=target.screen;entries.set(position,capture());return true;
}
window.addEventListener('popstate',event=>{if(!started)return;const key=event.state?.osteoNavigation56;if(!key||key.token!==token)return;const entry=entries.get(key.index);popping=true;departing=null;
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());position=key.index;
 if(userKey()!==identity||!entry||!restore(entry)){entries.clear();identity=userKey();window.go(signed()?'home':'welcome');lastId=active()?.id||'welcome';entries.set(position,capture());}
 popping=false;schedule();});
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;
 if(b.dataset.opHelp57){event.preventDefault();event.stopImmediatePropagation();window.OSTEO_CONTENT_APP44?.openHelp?.(b.dataset.opHelp57);return;}
 if(!popping)departing=capture();
 const screen=b.closest('.screen');const isBack=b.matches('.icon.round')&&b.parentElement?.matches('header.top');
 let withinList=false;try{withinList=screen?.id==='techniques'&&typeof currentBack!=='undefined'&&currentBack==='techniques';}catch(_){}
 if(isBack&&!withinList&&screen&&!pub.has(screen.id)&&!transient.has(screen.id)&&!['quiz','revisionCard','revisionVoice'].includes(screen.id)&&started&&entries.has(position-1)&&userKey()===identity){event.preventDefault();event.stopImmediatePropagation();history.back();return;}
 if(b.closest('.bottom'))departing=capture();
 schedule();},true);
document.addEventListener('scroll',event=>{const el=event.target;if(started&&el===active()){const entry=entries.get(position);if(entry?.screen===el.id)entry.scroll=el.scrollTop;}},true);
const css=document.createElement('style');css.id='opNavigationStyles56';css.textContent=`
 /* APP58 : même espace de chaque côté, centre du texte = centre du bandeau. */
 .app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58{--op-title-side58:52px;display:grid!important;grid-template-columns:var(--op-title-side58) minmax(0,1fr) var(--op-title-side58)!important;align-items:center!important;column-gap:10px!important;row-gap:0!important;padding:16px!important;text-align:center!important;box-sizing:border-box!important}
 .app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 > .op-title-content58{grid-column:2!important;grid-row:1!important;min-width:0!important;width:100%!important;max-width:none!important;text-align:center!important;margin:0!important;padding:0!important}
 .app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 > .page-title-logo{grid-column:3!important;grid-row:1!important;position:relative!important;inset:auto!important;justify-self:end!important;align-self:center!important;width:var(--op-title-side58)!important;height:var(--op-title-side58)!important;margin:0!important;transform:none!important}
 .app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 .op-title-content58 h1,.app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 .op-title-content58 h2{width:100%!important;max-width:none!important;text-align:center!important;margin:0!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.12!important;font-size:clamp(23px,6.6vw,30px)!important}
 .app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 .op-title-content58 p,.app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 .op-title-content58 small{display:block;max-width:none!important;text-align:center!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.35!important;margin:7px 0 0!important}
 .screen > header.top.op-balanced-header58{display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px!important;align-items:center!important;column-gap:12px!important;width:100%!important;max-width:100%!important;margin-inline:auto!important;box-sizing:border-box!important}
 .screen > header.top.op-balanced-header58 > .brand{grid-column:2!important;min-width:0!important;width:100%!important;text-align:center!important;justify-self:center!important}
 .screen > header.top.op-balanced-header58 > .brand h1,.screen > header.top.op-balanced-header58 > .brand p{text-align:center!important;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important}
 .screen > header.top.op-balanced-header58 > .brand img{max-width:100%!important;margin-left:auto!important;margin-right:auto!important}
 .screen > header.top.op-balanced-header58 > button.icon.round{grid-column:1!important;justify-self:start!important;margin:0!important}
 .screen > header.top.op-balanced-header58 > button.icon:not(.round){grid-column:3!important;justify-self:end!important;margin:0!important}
 #opContentDialog44.op-help-dialog57 .op-content-page{grid-template-columns:44px minmax(0,1fr) 44px;column-gap:10px}
 #opContentDialog44.op-help-dialog57 h1{grid-column:2;text-align:center}
 #opContentDialog44.op-help-dialog57 .op-content-close{grid-column:3}
 @media(max-width:380px){.app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58{--op-title-side58:40px;column-gap:8px!important;padding:14px!important}.app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 .op-title-content58 h1,.app :is(#revision,#videoMap,#zones,#progress,#rachisMenu,#bassinMenu,#msupMenu,#minfMenu,#quiz,.screen) .op-centered-title58 .op-title-content58 h2{font-size:25px!important}}
 .screen > header.top.op-help-header57{display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px!important;align-items:center!important;gap:12px!important;width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important}
 .screen > header.top.op-help-header57 > .brand{grid-column:2!important;min-width:0!important;width:auto!important;text-align:center!important}
 .screen > header.top.op-help-header57 > button.icon.round{grid-column:1!important;justify-self:start!important;margin:0!important}
 .screen > header.top.op-help-header57 > button[data-op-help57]{grid-column:3!important;justify-self:end!important;margin:0!important;cursor:pointer}
 .bottom button > svg[data-op-icon56]{display:block;width:23px;height:23px;flex:0 0 23px;pointer-events:none}
 .screen > header.top > button.icon{width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;border-radius:14px!important;display:grid!important;place-items:center!important;flex-shrink:0}
 .screen > header.top > button.op-unavailable56{display:none!important}
 .screen > header.top svg[data-op-icon56]{width:23px;height:23px;pointer-events:none}
 .screen > header.top .brand{min-width:0}
 .screen button:focus-visible,.bottom button:focus-visible{outline:2px solid #69eaff;outline-offset:3px}
 #authV18AlreadyAccount,#authV18GoSignup,#authV18ForgotPassword,button[data-op-password56]{min-height:44px!important}
 button[data-op-password56]{min-width:44px!important}
 #welcome .welcome-start .op-start-label56{float:none!important;font:inherit!important}
 .bottom button[aria-expanded=true]{color:var(--cyan,#00e5ff)}
 /* APP59 : pages créées par les modules Tester et Médailles. */
 .app :is(#quizMenu,#rewards,.screen) .op-centered-title58.op-title-no-logo59{grid-template-columns:minmax(0,1fr)!important}
 .app :is(#quizMenu,#rewards,.screen) .op-centered-title58.op-title-no-logo59 > .op-title-content58{grid-column:1!important}
 .app :is(#quizMenu,#rewards,.screen) .op-centered-title58 > .op-tester-seen-count{grid-column:1/-1!important;justify-self:center!important;max-width:100%!important;box-sizing:border-box!important;text-align:center!important;white-space:normal!important;line-height:1.4!important;margin-top:12px!important;padding:7px 11px!important}
 `;document.body.append(css);
window.OSTEO_NAV56={version:'59.0',refresh:()=>{installGo();sync();},getState:()=>({screen:active()?.id,section:transient.has(active()?.id)?origin:fixed[active()?.id],historyReady:started})};
installGo();sync();
const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.matches?.('.screen,dialog,input,[data-op-profile49]')))schedule();});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','open','type','aria-expanded']});
// Existing auth and integration modules install their wrappers asynchronously.
[300,1000,2500,5000].forEach(ms=>setTimeout(()=>{installGo();sync();},ms));
window.addEventListener('osteo-language-changed',schedule);
})();
