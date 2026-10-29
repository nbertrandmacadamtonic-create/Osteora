/* Ostéo Pratik APP50 — langues séparées des identités, médias et données de progression. */
(function(){
'use strict';if(window.OSTEO_LANG50)return;
const LANGS={fr:{flag:'🇫🇷',label:'Français'},en:{flag:'🇬🇧',label:'English'},es:{flag:'🇪🇸',label:'Español'},it:{flag:'🇮🇹',label:'Italiano'},'zh-CN':{flag:'🇨🇳',label:'简体中文'}};
const KEY='osteo.language.app50',PUB='osteo_translations',DRAFT='osteo_translation_drafts';
const $=id=>document.getElementById(id),node=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
let lang='fr';try{const saved=localStorage.getItem(KEY);if(LANGS[saved])lang=saved;}catch(_){}
const phrases={
'Commencer':['Get started','Iniziare','Comenzar'],
'Réglages':['Settings','Impostazioni','Ajustes'], 'Mon profil':['My profile','Il mio profilo','Mi perfil'],
'Mon compte':['My account','Il mio account','Mi cuenta'],'Mon abonnement':['My subscription','Il mio abbonamento','Mi suscripción'],
'Préférences':['Preferences','Preferenze','Preferencias'],'Informations':['Information','Informazioni','Información'],
'Qui sommes-nous':['About us','Chi siamo','Quiénes somos'],'Conditions générales d’utilisation':['Terms of use','Condizioni di utilizzo','Condiciones de uso'],
'Confidentialité':['Privacy','Privacy','Privacidad'],'Suppression du compte':['Account deletion','Eliminazione account','Eliminación de la cuenta'],
'Se déconnecter':['Sign out','Disconnettersi','Cerrar sesión'],'Se connecter':['Sign in','Accedi','Iniciar sesión'],
'Modifier mon mot de passe':['Change my password','Modifica la password','Cambiar mi contraseña'],
'← Profil':['← Profile','← Profilo','← Perfil'],'← Réglages':['← Settings','← Impostazioni','← Ajustes'],
'Profil':['Profile','Profilo','Perfil'],'Compte':['Account','Account','Cuenta'],'Accueil':['Home','Home','Inicio'],
'Vidéos':['Videos','Video','Vídeos'],'Réviser':['Review','Ripassa','Repasar'],'Tester':['Test yourself','Mettiti alla prova','Evaluarse'],
'Ma progression':['My progress','I miei progressi','Mi progreso'],'Mes statistiques':['My statistics','Le mie statistiche','Mis estadísticas'],
'Mes médailles':['My medals','Le mie medaglie','Mis medallas'],'Favoris':['Favourites','Preferiti','Favoritos'],
'Déjà vues':['Already watched','Già viste','Ya vistas'],'À revoir':['To review','Da ripassare','Por repasar'],
'S’inscrire':['Sign up','Registrati','Registrarse'],'Inscription':['Sign up','Registrazione','Registro'],'Connexion':['Sign in','Accesso','Inicio de sesión'],
'J’ai déjà un compte':['I already have an account','Ho già un account','Ya tengo una cuenta'],
'Mot de passe':['Password','Password','Contraseña'],'Email':['Email','Email','Correo electrónico'],
'Prénom':['First name','Nome','Nombre'],'Nom':['Last name','Cognome','Apellidos'],'École / établissement':['School / institution','Scuola / istituto','Escuela / centro'],
'Année de formation':['Year of study','Anno di formazione','Curso de formación'],'Enregistrer mon profil':['Save my profile','Salva il profilo','Guardar mi perfil'],
'Formule':['Plan','Piano','Plan'],'Statut':['Status','Stato','Estado'],'Échéance':['Expiry date','Scadenza','Vencimiento'],'Paiement':['Payment','Pagamento','Pago'],
'Actif':['Active','Attivo','Activo'],'Inactif':['Inactive','Inattivo','Inactivo'],'Expiré':['Expired','Scaduto','Caducado'],
'Position':['Position','Posizione','Posición'],'Position des mains':['Hand position','Posizione delle mani','Posición de las manos'],
'Barrière motrice':['Restrictive barrier','Barriera motoria','Barrera motriz'],'Normalisation':['Correction','Normalizzazione','Normalización'],
'Retour':['Back','Indietro','Volver'],'← Retour':['← Back','← Indietro','← Volver'],'Fermer':['Close','Chiudi','Cerrar'],
'Que voulez-vous faire ?':['What would you like to do?','Cosa vuoi fare?','¿Qué quieres hacer?']
};
const chinese54={"Commencer": "开始", "Réglages": "设置", "Mon profil": "个人资料", "Mon compte": "我的账户", "Mon abonnement": "我的订阅", "Préférences": "偏好设置", "Informations": "信息", "Qui sommes-nous": "关于我们", "Conditions générales d’utilisation": "使用条款", "Confidentialité": "隐私政策", "Suppression du compte": "删除账户", "Se déconnecter": "退出登录", "Se connecter": "登录", "Modifier mon mot de passe": "修改密码", "← Profil": "← 个人资料", "← Réglages": "← 设置", "Profil": "个人资料", "Compte": "账户", "Accueil": "首页", "Vidéos": "视频", "Réviser": "复习", "Tester": "自测", "Ma progression": "学习进度", "Mes statistiques": "学习统计", "Mes médailles": "我的勋章", "Favoris": "收藏", "Déjà vues": "已观看", "À revoir": "待复习", "S’inscrire": "注册", "Inscription": "注册", "Connexion": "登录", "J’ai déjà un compte": "已有账户", "Mot de passe": "密码", "Email": "电子邮箱", "Prénom": "名字", "Nom": "姓氏", "École / établissement": "学校 / 机构", "Année de formation": "学习年级", "Enregistrer mon profil": "保存个人资料", "Formule": "订阅方案", "Statut": "状态", "Échéance": "到期日期", "Paiement": "付款", "Actif": "有效", "Inactif": "未激活", "Expiré": "已到期", "Position": "体位", "Position des mains": "手的位置", "Barrière motrice": "运动限制屏障", "Normalisation": "矫正", "Retour": "返回", "← Retour": "← 返回", "Fermer": "关闭", "Que voulez-vous faire ?": "您想做什么？"};
for(const [key,value] of Object.entries(chinese54))if(phrases[key])phrases[key][3]=value;
const at={en:0,it:1,es:2,"zh-CN":3};let translations=new Map(),loadState='loading',dataTimer=null;const originals=new WeakMap(),textNodes=new WeakMap();
function mapKey(type,id,l=lang){return [type,String(id),l].join('|');}
function sourceFor(type,x){
 if(type==='technique'){const d=x.detail||{},steps={};for(const k of ['position','mains','barriere','normalisation'])steps[k]=(d.steps||[]).find(s=>s.key===k)?.body||'';return {title:x.title||'',text:x.text||'',intro:d.intro||'',...steps};}
 if(type==='question')return {question:x.question||'',answers:Array.isArray(x.answers)?x.answers.slice():[],correct:x.correct,explanation:x.explanation||''};
 if(type==='page')return {title:x.title||'',body:x.body||''};
 return {messages:{}};
}
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));return value;}
async function fingerprint(value){if(!window.crypto?.subtle)throw Error('Le navigateur ne permet pas de vérifier les traductions.');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(value))));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
function tr(source){if(lang==='fr')return source;const custom=translations.get(mapKey('interface','main'))?.payload?.messages;return custom?.[source]||phrases[source]?.[at[lang]]||source;}
function setLanguage(next){if(!LANGS[next]||next===lang)return;try{localStorage.setItem(KEY,next);}catch(_){alert('Le navigateur ne peut pas enregistrer la langue.');return;}location.reload();}
function flag53(code){
 const shapes={'zh-CN':'<path fill="#de2910" d="M0 0h30v20H0z"/><g fill="#ffde00"><path d="m5 3 1 3h3L6.5 8l1 3L5 9l-2.5 2 1-3L1 6h3z"/><path d="m11 2 .4 1.2h1.3l-1 .8 .4 1.2-1.1-.8-1.1.8.4-1.2-1-.8h1.3z"/><path d="m14 5 .4 1.2h1.3l-1 .8 .4 1.2-1.1-.8-1.1.8.4-1.2-1-.8h1.3z"/><path d="m14 9 .4 1.2h1.3l-1 .8 .4 1.2-1.1-.8-1.1.8.4-1.2-1-.8h1.3z"/><path d="m11 12 .4 1.2h1.3l-1 .8 .4 1.2-1.1-.8-1.1.8.4-1.2-1-.8h1.3z"/></g>',fr:'<path fill="#002395" d="M0 0h10v20H0z"/><path fill="#fff" d="M10 0h10v20H10z"/><path fill="#ed2939" d="M20 0h10v20H20z"/>',it:'<path fill="#009246" d="M0 0h10v20H0z"/><path fill="#fff" d="M10 0h10v20H10z"/><path fill="#ce2b37" d="M20 0h10v20H20z"/>',es:'<path fill="#aa151b" d="M0 0h30v20H0z"/><path fill="#f1bf00" d="M0 5h30v10H0z"/>',en:'<path fill="#012169" d="M0 0h30v20H0z"/><path stroke="#fff" stroke-width="5" d="m0 0 30 20M30 0 0 20"/><path stroke="#c8102e" stroke-width="2" d="m0 0 30 20M30 0 0 20"/><path stroke="#fff" stroke-width="7" d="M15 0v20M0 10h30"/><path stroke="#c8102e" stroke-width="4" d="M15 0v20M0 10h30"/>'};
 const img=node('img');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20">'+shapes[code]+'</svg>');img.alt='';img.width=27;img.height=18;return img;
}
function installPicker(){const welcome=$('welcome');if(!welcome||$('opLanguagePicker50'))return;
 const wrap=node('div');wrap.id='opLanguagePicker50';const details=node('details'),summary=node('summary');summary.setAttribute('aria-label','Choisir la langue / Choose language');summary.append(flag53(lang),node('span',LANGS[lang].label),node('span','▾'));details.append(summary);
 const list=node('div');list.className='op-language-options53';
 for(const [code,l]of Object.entries(LANGS)){const button=node('button');button.type='button';button.lang=code;button.setAttribute('aria-pressed',String(code===lang));button.append(flag53(code),node('span',l.label));button.onclick=()=>{details.open=false;setLanguage(code);};list.append(button);}
 details.append(list);wrap.append(details);welcome.append(wrap);
 document.addEventListener('click',e=>{if(!wrap.contains(e.target))details.open=false;});wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){details.open=false;summary.focus();}});
}
function translateUI(){if(/backoffice\.html$/i.test(location.pathname))return;
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while((n=walker.nextNode())){const p=n.parentElement;if(!p||p.closest('script,style,textarea,input,select,option,code,pre,[contenteditable],#opLanguagePicker50,[data-no-translate]'))continue;
  const raw=n.nodeValue,word=raw.trim();if(!word)continue;let record=textNodes.get(n);if(!record||raw!==record.last)record={source:raw,last:raw};
  const src=record.source.trim(),translated=tr(src);const result=translated===src?record.source:record.source.replace(src,translated);if(result!==raw)n.nodeValue=result;record.last=result;textNodes.set(n,record);
 }
}
function getTechniqueList50(){try{if(typeof window.techniques!=='undefined'&&Array.isArray(window.techniques))return window.techniques;if(typeof techniques!=='undefined'&&Array.isArray(techniques))return techniques;}catch(_){}return [];}
// The lexical catalogue is exposed by its existing getter when available; no IDs/media are changed.
function catalogue(){try{if(typeof getTechniqueById==='function'){const ids=window.OSTEO_LANG50_SOURCE_IDS||[];return ids.map(id=>getTechniqueById(id)).filter(Boolean);}}catch(_){}return getTechniqueList50();}
function remember(type,obj){let record=originals.get(obj);if(!record){record={type,source:sourceFor(type,obj),hash:null,applied:null};originals.set(obj,record);}return record;}
async function applyRecord(type,obj,id){const record=remember(type,obj),candidate=translations.get(mapKey(type,id));if(!record.hash)record.hash=await fingerprint(record.source);const payload=candidate&&candidate.source_hash===record.hash?candidate.payload:null;const signature=lang+'|'+(payload?candidate.updated_at:'fallback');if(record.applied===signature)return false;
 const src=record.source,get=k=>payload&&typeof payload[k]==='string'&&payload[k].trim()?payload[k]:src[k];
 if(type==='technique'){obj.title=get('title');if('text'in obj)obj.text=get('text');if(obj.detail){obj.detail.intro=get('intro');for(const step of obj.detail.steps||[])if(step.key in src)step.body=get(step.key);}}
 if(type==='question'){const valid=payload&&typeof payload.question==='string'&&Array.isArray(payload.answers)&&payload.answers.length===src.answers.length&&payload.answers.every(a=>typeof a==='string'&&a.trim())&&typeof payload.explanation==='string';obj.question=valid?payload.question:src.question;obj.answers=(valid?payload.answers:src.answers).slice();obj.explanation=valid?payload.explanation:src.explanation;}
 record.applied=signature;return true;
}
let applying=false;
async function applyData(){if(applying||lang==='fr'||loadState!=='ready')return;applying=true;let changed=false;
 try{for(const obj of catalogue())changed=(await applyRecord('technique',obj,obj.id))||changed;for(const q of window.OSTEO_QUESTION_BANK||[])changed=(await applyRecord('question',q,q.code))||changed;
  if(changed){for(const name of ['renderTechniques','renderCatalogueSearch','renderSeenCollections'])try{if(typeof window[name]==='function')window[name]();}catch(_){}window.dispatchEvent(new CustomEvent('osteo-language-changed',{detail:{language:lang}}));}
 }catch(e){console.warn('[Ostéo Pratik APP50] Traduction non appliquée',e.message);}finally{applying=false;}
}
async function loadTranslations(){const c=window.OSTEO_SUPABASE;if(!c?.url||!c?.anonKey){loadState='unavailable';return;}
 try{const r=await fetch(c.url+'/rest/v1/'+PUB+'?select=entity,source_id,language,payload,source_hash,updated_at&language=eq.'+lang,{headers:{apikey:c.anonKey},cache:'no-store'});if(!r.ok)throw Error();const list=await r.json();translations=new Map(list.map(x=>[mapKey(x.entity,x.source_id,x.language),x]));loadState='ready';await applyData();translateUI();}
 catch(_){loadState='unavailable';}
}
async function translatedPage(slug,base){if(!base||lang==='fr')return base;await ready;const row=translations.get(mapKey('page',slug));if(!row||row.source_hash!==await fingerprint(sourceFor('page',base)))return base;return {...base,title:row.payload.title||base.title,body:row.payload.body||base.body};}
function style(){const s=node('style');s.textContent=`
 @media(min-width:601px){
 .app > #welcome.screen{position:absolute!important;inset:0!important;height:100%!important;min-height:100%!important}
 #welcome .welcome-poster-page{width:100%!important;height:100%!important;min-height:100%!important;box-sizing:border-box!important}
 #welcome .welcome-poster-img{inset:0!important;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain!important;object-position:center top!important;transform:none!important;animation:none!important}
 #welcome .welcome-poster-actions{position:absolute!important;left:24px!important;right:24px!important;top:auto!important;bottom:calc(88px + env(safe-area-inset-bottom,0px))!important;width:auto!important;max-width:none!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important;padding:0!important;transform:none!important;box-sizing:border-box!important}
 #welcome .welcome-poster-actions button{width:100%!important;min-width:0!important;max-width:100%!important;height:auto!important;min-height:44px!important;margin:0!important;padding:10px 16px!important;font-size:16px!important;line-height:1.3!important;white-space:normal!important;overflow-wrap:break-word!important;box-sizing:border-box!important}
 #welcome .welcome-poster-actions .welcome-start{min-height:52px!important}
 #welcome .welcome-poster-actions button span{float:right!important}
 }
 .app > #welcome.screen{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important}#opLanguagePicker50{position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:20;max-width:min(180px,calc(100% - 28px));padding:4px 8px;border:1px solid #5c7d96;border-radius:14px;background:#08192dee;color:#fff;box-sizing:border-box}#opLanguagePicker50 label,#opLanguagePicker50 small{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;overflow:hidden!important;clip-path:inset(50%);white-space:nowrap}#opLanguagePicker50 select{color:#fff;background:#0c263c;font:15px system-ui;border:0;min-height:40px;max-width:100%}#opLanguagePicker50 small{display:block;font:10px/1.4 system-ui;margin-top:4px;max-width:190px;color:#9ab9c9}
 @media(max-width:600px){
 #revision.screen.active,#revisionWheel.screen.active,#revisionCard.screen.active,#revisionVoice.screen.active,#seenCollections.screen.active,#seenCards.screen.active{visibility:visible!important;opacity:1!important;transform:none!important;transition:none!important;pointer-events:auto;isolation:isolate}
 }
 #opLanguagePicker50{z-index:100!important;overflow:visible!important;padding:0!important;max-width:190px!important}
 #opLanguagePicker50 summary{display:flex;align-items:center;gap:8px;padding:10px 12px;min-height:24px;cursor:pointer;list-style:none;font:14px system-ui;color:#fff}#opLanguagePicker50 summary::-webkit-details-marker{display:none}
 #opLanguagePicker50 img{display:block;flex:0 0 27px;width:27px!important;height:18px!important;object-fit:fill!important;border-radius:2px}
 #opLanguagePicker50 .op-language-options53{position:absolute;right:0;top:calc(100% + 6px);width:170px;padding:5px;background:#08192d;border:1px solid #5c7d96;border-radius:12px;box-shadow:0 8px 24px #0008}
 #opLanguagePicker50 button{display:flex!important;align-items:center;gap:10px;width:100%!important;min-height:44px!important;padding:8px 10px!important;border:0;border-radius:7px;background:transparent;color:#fff;font:14px system-ui;text-align:left;cursor:pointer}#opLanguagePicker50 button:hover,#opLanguagePicker50 button:focus-visible,#opLanguagePicker50 button[aria-pressed=true]{background:#173e58}
 #opLanguagesWorkspace50{grid-column:1/-1;min-width:0}#opLanguagesWorkspace50[hidden]{display:none!important}#opLanguagesWorkspace50 .language-tools{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}#opLanguagesWorkspace50 select{min-height:44px;max-width:100%}#opLanguagesWorkspace50 .translation-field{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}#opLanguagesWorkspace50 textarea{width:100%;box-sizing:border-box;min-height:110px;resize:vertical;background:#091729;color:#fff;border:1px solid #355269;padding:12px;border-radius:10px;font:14px/1.5 system-ui}#opLanguagesWorkspace50 .source-text{white-space:pre-wrap;background:#10253b;color:#d0e4f0;padding:12px;border-radius:10px;overflow-wrap:anywhere}#opLanguagesWorkspace50 label{display:block}#opLanguageStatus50{white-space:pre-line}#opLanguagesWorkspace50 fieldset{min-width:0}#opLanguagesWorkspace50 input[type=checkbox]{width:auto}@media(max-width:700px){#opLanguagesWorkspace50 .translation-field{grid-template-columns:1fr}}
 `;document.head.append(s);}
const API={version:'55.0',getLanguage:()=>lang,translate:tr,translatePage:translatedPage,fingerprint,sourceFor,setLanguage,applyData};window.OSTEO_LANG50=API;
let ready=Promise.resolve();
function app(){document.documentElement.lang=lang;installPicker();translateUI();
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;installPicker();translateUI();clearTimeout(dataTimer);dataTimer=setTimeout(applyData,60);},40);});observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 window.addEventListener('osteo-central-data-loaded',()=>{if(lang!=='fr'&&loadState==='unavailable')loadTranslations();else setTimeout(applyData,0);});
 async function boot(){for(let i=0;i<40&&!window.OSTEO_SUPABASE;i++)await new Promise(r=>setTimeout(r,100));
  // Collect immutable IDs only, using the already-public catalogue. Used solely for existing getter lookup.
  const c=window.OSTEO_SUPABASE;if(lang!=='fr'&&c?.url)try{const r=await fetch(c.url+'/rest/v1/osteo_techniques?select=id',{headers:{apikey:c.anonKey}});if(r.ok)window.OSTEO_LANG50_SOURCE_IDS=(await r.json()).map(x=>x.id);}catch(_){}
  if(lang!=='fr')await loadTranslations();else loadState='ready';
 }
 ready=boot();API.ready=ready;
}
async function admin(){
 const tabs=document.querySelector('.workspace-tabs');if(!tabs)return;
 const tab=node('button','🌐 Langues');tab.type='button';tab.className='workspace-tab';tab.dataset.workspace='languages50';
 const panel=node('section');panel.id='opLanguagesWorkspace50';panel.className='panel';panel.hidden=true;
 panel.innerHTML='<h1>Langues et traductions</h1><p>Le français reste la référence. Une traduction vide ou devenue obsolète laisse le texte français affiché. Les médias, identifiants et données de progression ne sont pas traduits.</p><div class="language-tools"><label>Type de contenu<select id="opEntity50"><option value="technique">Techniques</option><option value="question">Questions de quiz</option><option value="page">Pages d’information</option><option value="interface">Interface</option></select></label><label>Langue cible<select id="opTargetLanguage50"><option value="en">🇬🇧 English</option><option value="es">🇪🇸 Español</option><option value="it">🇮🇹 Italiano</option><option value="zh-CN">中文 · Chinois simplifié</option></select></label><label>Rechercher<input id="opSourceSearch50" type="search" placeholder="Numéro ou intitulé"></label><label>Contenu français<select id="opSource50"></select></label><button class="btn" id="opLanguageReload50">Recharger les sources</button></div><p id="opLanguageStatus50" role="status" aria-live="polite"></p><fieldset id="opTranslationFields50" disabled><div id="opTranslationEditor50"></div><label><input type="checkbox" id="opTranslationConfirmed50"> J’ai vérifié la traduction et sa correspondance avec le français.</label><div class="language-tools"><button type="button" class="btn" id="opDraftSave50">Enregistrer le brouillon</button><button type="button" class="btn green" id="opTranslationPublish50">Publier la traduction</button></div></fieldset>';
 document.querySelector('main').append(panel);tabs.append(tab);
 let pool=[],client=null,selected=null,baseline=null,hash=null,draftVersion=null,publicVersion=null,dirty=false,busy=false,authorized=false,seq=0,currentType='technique',currentLang='en';const inputs=new Map();
 const status=t=>$('opLanguageStatus50').textContent=t;
 function controls(){for(const id of ['opEntity50','opTargetLanguage50','opSource50','opSourceSearch50','opLanguageReload50'])$(id).disabled=busy;$('opTranslationFields50').disabled=busy||!authorized;}
 async function isAdmin(){client=window.OSTEO_BACKOFFICE_CLIENT;if(!client)throw Error('Connectez-vous comme administrateur.');const role=await client.rpc('osteo_get_my_role');if(role.error||role.data!=='admin')throw Error('Édition réservée aux administrateurs.');}
 function clear(){authorized=false;selected=null;hash=null;baseline=null;inputs.clear();$('opTranslationEditor50').replaceChildren();$('opTranslationConfirmed50').checked=false;controls();}
 function mayLeave(){return !dirty||confirm('Abandonner les modifications non enregistrées ?');}
 function renderSources(){const previous=$('opSource50').value,q=$('opSourceSearch50').value.toLocaleLowerCase('fr');const select=$('opSource50');select.replaceChildren();for(const src of pool){if(q&&!src.label.toLocaleLowerCase('fr').includes(q)&&src.id!==selected?.id)continue;const option=node('option',src.label);option.value=src.id;select.append(option);}if([...select.options].some(x=>x.value===previous))select.value=previous;}
 async function sources(){if(busy||!mayLeave())return;const token=++seq;dirty=false;clear();busy=true;controls();status('Chargement des sources françaises…');
  try{await isAdmin();currentType=$('opEntity50').value;currentLang=$('opTargetLanguage50').value;let result;
   if(currentType==='technique'){result=await client.from('osteo_techniques').select('id,data').order('id');pool=(result.data||[]).map(x=>({id:String(x.id),label:'#'+x.id+' · '+x.data.title,data:x.data}));}
   else if(currentType==='question'){result=await client.from('osteo_quiz_questions').select('code,question,answers,correct,explanation').order('id');pool=(result.data||[]).map(x=>({id:x.code,label:x.code+' · '+x.question,data:x}));}
   else if(currentType==='page'){result=await client.from('osteo_content_pages').select('slug,title,body');pool=(result.data||[]).map(x=>({id:x.slug,label:x.title,data:x}));}
   else{pool=[{id:'main',label:'Libellés de navigation et de compte',data:{}}];}
   if(token!==seq)return;if(result?.error)throw Error('Impossible de charger les contenus français.');renderSources();status(pool.length?pool.length+' contenu(s) disponible(s).':'Aucun contenu publié. Publiez d’abord la source française.');
  }catch(e){if(token===seq)status(e.message);}finally{busy=false;controls();}
  if(token===seq&&$('opSource50').value)await loadSelected();
 }
 function addField(key,label,source,value){const row=node('div');row.className='translation-field';const left=node('div'),right=node('label','Traduction · '+label),sourceLabel=node('strong','Français · '+label),original=node('div',source),input=node('textarea');original.className='source-text';left.append(sourceLabel,original);input.value=value||'';input.maxLength=80000;input.setAttribute('aria-label','Traduction · '+label);input.oninput=()=>{dirty=true;$('opTranslationConfirmed50').checked=false;};right.append(input);row.append(left,right);$('opTranslationEditor50').append(row);inputs.set(key,input);}
 async function loadSelected(){if(busy)return;if(!mayLeave()){$('opSource50').value=selected?.id||'';return;}const item=pool.find(x=>x.id===$('opSource50').value);if(!item)return;const token=++seq;dirty=false;clear();busy=true;controls();status('Chargement de la traduction…');
  try{await isAdmin();selected=item;currentLang=$('opTargetLanguage50').value;currentType=$('opEntity50').value;baseline=sourceFor(currentType,item.data);hash=await fingerprint(baseline);
   const query=table=>client.from(table).select('*').eq('entity',currentType).eq('source_id',item.id).eq('language',currentLang).maybeSingle();const [draft,live]=await Promise.all([query(DRAFT),query(PUB)]);if(token!==seq)return;if(draft.error||live.error)throw Error('Traductions indisponibles. Vérifiez le SQL APP50.');draftVersion=draft.data?.updated_at||null;publicVersion=live.data?.updated_at||null;
   const stored=draft.data||live.data,payload=stored?.payload||{};if(currentType==='interface'){for(const label of Object.keys(phrases))addField(label,label,label,payload.messages?.[label]||phrases[label][at[currentLang]]);}
   else if(currentType==='question'){addField('question','Question',baseline.question,payload.question);baseline.answers.forEach((a,i)=>addField('answer'+i,'Réponse '+(i+1)+(i===baseline.correct?' · correcte':''),a,payload.answers?.[i]));addField('explanation','Explication',baseline.explanation,payload.explanation);const note=node('p','Conservez strictement l’ordre des réponses. La bonne réponse reste celle de la source française.');$('opTranslationEditor50').prepend(note);}
   else{for(const [key,label]of Object.entries(currentType==='page'?{title:'Titre',body:'Texte'}:{title:'Titre',text:'Texte de synthèse',intro:'Introduction',position:'Position',mains:'Position des mains',barriere:'Barrière motrice',normalisation:'Normalisation'}))addField(key,label,baseline[key]||'',payload[key]);}
   authorized=true;$('opTranslationConfirmed50').checked=false;
   status((live.data?'Une version est publiée.':'Aucune traduction publiée.')+(stored&&stored.source_hash!==hash?' Attention : la source française a changé. Relisez toute la traduction avant publication.':''));
  }catch(e){if(token===seq){clear();status(e.message);}}finally{busy=false;controls();}
 }
 async function currentSource(){if(currentType==='interface')return {messages:{}};let q;
  if(currentType==='technique')q=client.from('osteo_techniques').select('id,data').eq('id',Number(selected.id));
  else if(currentType==='question')q=client.from('osteo_quiz_questions').select('code,question,answers,correct,explanation').eq('code',selected.id);
  else q=client.from('osteo_content_pages').select('slug,title,body').eq('slug',selected.id);
  const r=await q.single();if(r.error||!r.data)throw Error('La source française n’est plus disponible.');return sourceFor(currentType,currentType==='technique'?r.data.data:r.data);
 }
 function payload(){const values=Object.fromEntries([...inputs].map(([k,n])=>[k,n.value.trim()]));if(currentType==='interface')return {messages:Object.fromEntries(Object.entries(values).filter(([,v])=>v))};if(currentType==='question')return {question:values.question,answers:baseline.answers.map((_,i)=>values['answer'+i]),explanation:values.explanation};return values;}
 async function write(table,version,value){const row={entity:currentType,source_id:selected.id,language:currentLang,payload:value,source_hash:hash};const q=version?client.from(table).update(row).eq('entity',currentType).eq('source_id',selected.id).eq('language',currentLang).eq('updated_at',version):client.from(table).insert(row);const r=await q.select('updated_at').single();if(r.error||!r.data)throw Error('Enregistrement refusé ou modification concurrente. Copiez votre texte puis rechargez.');return r.data.updated_at;}
 async function save(publish){if(busy||!authorized||!selected)return;busy=true;controls();
  try{await isAdmin();const actual=await currentSource();if(await fingerprint(actual)!==hash)throw Error('La source française a changé. Copiez votre traduction puis rechargez les sources avant de publier.');const value=payload();
   if(publish){if(!$('opTranslationConfirmed50').checked)throw Error('Confirmez la vérification de la traduction.');if(currentType==='question'&&(!value.question||!value.explanation||value.answers.some(x=>!x)||new Set(value.answers.map(x=>x.toLocaleLowerCase().replace(/[\p{P}\p{Z}]/gu,''))).size!==value.answers.length))throw Error('Complétez la question, les réponses distinctes et l’explication.');if(currentType!=='question'&&!Object.values(currentType==='interface'?value.messages:value).some(Boolean))throw Error('Renseignez au moins une traduction.');}
   draftVersion=await write(DRAFT,draftVersion,value);dirty=false;if(publish){publicVersion=await write(PUB,publicVersion,value);$('opTranslationConfirmed50').checked=false;status('Traduction publiée. Elle sera chargée à la prochaine ouverture de l’application dans cette langue.');}else status('Brouillon enregistré. Le texte public reste inchangé.');
  }catch(e){status(e.message);}finally{busy=false;controls();}
 }
 tabs.addEventListener('click',e=>{const b=e.target.closest('[data-workspace]');if(!b)return;if(b!==tab){panel.hidden=true;return;}for(const el of document.querySelectorAll('.techniques-panel,.editor-panel,#quizWorkspace,#usersWorkspace,#statsWorkspace,#contentWorkspace44'))el.hidden=true;panel.hidden=false;tabs.querySelectorAll('[data-workspace]').forEach(x=>x.classList.toggle('active',x===tab));if(!selected&&!busy)sources();});
 // Historical tabs added before this one do not know this panel. Returning to Contenus remains supported.
 for(const id of ['opEntity50','opTargetLanguage50'])$(id).onchange=()=>{if(!mayLeave()){$('opEntity50').value=currentType;$('opTargetLanguage50').value=currentLang;return;}dirty=false;sources();};
 $('opSource50').onchange=loadSelected;$('opLanguageReload50').onclick=sources;$('opSourceSearch50').oninput=()=>{renderSources();};$('opDraftSave50').onclick=()=>save(false);$('opTranslationPublish50').onclick=()=>save(true);
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 let observed=null;const timer=setInterval(()=>{const c=window.OSTEO_BACKOFFICE_CLIENT;if(!c||c===observed)return;observed=c;clearInterval(timer);c.auth.onAuthStateChange(()=>{++seq;clear();status('Connexion modifiée. Rechargez les sources.');});},500);setTimeout(()=>clearInterval(timer),30000);
}
style();if(/backoffice\.html$/i.test(location.pathname))admin();else app();
})();
