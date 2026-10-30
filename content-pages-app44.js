/* Ostéo Pratik APP73 — stabilisation visuelle avant affichage de l'application. */
(function(){
  'use strict';
  if(/backoffice\.html$/i.test(location.pathname)||window.OSTEO_BOOT_APP73)return;
  window.OSTEO_BOOT_APP73={startedAt:Date.now()};
  const style=document.createElement('style');
  style.id='opBootStyle73';
  style.textContent=`
    html.op-booting73{overflow:hidden!important}
    #opBoot73{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#061426;color:#eaf8ff;opacity:1;transition:opacity .18s ease}
    #opBoot73.op-ready73{opacity:0;pointer-events:none}
    #opBoot73 .op-boot-box73{display:grid;justify-items:center;gap:14px;padding:24px;text-align:center}
    #opBoot73 .op-boot-mark73{width:48px;height:48px;border-radius:50%;border:3px solid #31516a;border-top-color:#57d9ef;animation:op-spin73 .8s linear infinite}
    #opBoot73 p{margin:0;font:600 15px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.02em}
    @keyframes op-spin73{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#opBoot73 .op-boot-mark73{animation:none;border-color:#57d9ef}#opBoot73{transition:none}}
  `;
  (document.head||document.documentElement).appendChild(style);
  const overlay=document.createElement('div');overlay.id='opBoot73';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.innerHTML='<div class="op-boot-box73"><span class="op-boot-mark73" aria-hidden="true"></span><p>Chargement d’Ostéo Pratik…</p></div>';
  document.documentElement.classList.add('op-booting73');
  const mount=()=>{if(!overlay.isConnected)(document.body||document.documentElement).appendChild(overlay);};
  mount();if(!document.body)document.addEventListener('DOMContentLoaded',mount,{once:true});
  let finished=false;
  function finish(){
    if(finished)return;finished=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      overlay.classList.add('op-ready73');document.documentElement.classList.remove('op-booting73');
      setTimeout(()=>{overlay.remove();style.remove();},220);
    }));
  }
  function ready(){
    const app=document.querySelector('.app');
    const screen=app?.querySelector(':scope > .screen.active');
    return !!(app&&screen&&window.OSTEO_LANG50&&window.OSTEO_NAV56);
  }
  const started=Date.now(),timer=setInterval(()=>{
    if(ready()&&Date.now()-started>350){clearInterval(timer);finish();}
    else if(Date.now()-started>4500){clearInterval(timer);finish();}
  },80);
  window.addEventListener('load',()=>setTimeout(()=>{if(ready())finish();},120),{once:true});
})();

/* Ostéo Pratik APP44 — pages éditoriales. Texte brut uniquement ; droits contrôlés par RLS. */
(function(){
  'use strict';
  if(window.OSTEO_CONTENT_APP44) return;
  window.OSTEO_CONTENT_APP44={version:'76.0'};
  const defaults={
    about:{"slug": "about", "title": "Qui sommes-nous", "body": "Ostéo Pratik est un projet pédagogique porté par Nicolas Bertrand, Frédéric Zenouda et Valentin Cohas. Vidéos, fiches, cartes, audio et quiz accompagnent l’apprentissage et la révision des techniques ostéopathiques.\n\nNicolas Bertrand\nOstéopathe depuis 2005 et masseur-kinésithérapeute depuis 1992, Nicolas Bertrand exerce la kinésithérapie et l’ostéopathie à Paris, et l’ostéopathie à Nice. Son parcours l’a notamment conduit à accompagner des sportifs dans le milieu du tennis, à Roland-Garros et au sein du Lagardère Paris Racing.\n\nAuteur de plusieurs ouvrages, dont L’Encyclopédie du massage, Leçons pour votre dos et Ostéo Pratique, coécrit avec Frédéric Zenouda, il développe une approche pédagogique nourrie par son expérience en cabinet.\n\nÉgalement entrepreneur et cofondateur de Macadam Tonic, il associe pratique, écriture et création d’outils pour transmettre ses connaissances.\n\nValentin Cohas\nOstéopathe D.O. MROF, Valentin Cohas exerce l’ostéopathie depuis plus de 22 ans et enseigne depuis 20 ans. Il pratique en cabinet dans le 13e arrondissement de Paris.\n\nFrédéric Zenouda"},
    cgu:{slug:'cgu',title:'Conditions générales d’utilisation',body:'BROUILLON À COMPLÉTER AVANT PUBLICATION\n\n1. Éditeur et contact\n[Identité ou raison sociale, statut, adresse, identifiants professionnels et contact de l’éditeur]\n\n2. Objet et public concerné\nOstéo Pratik propose des contenus pédagogiques pour apprendre et réviser des techniques ostéopathiques. Ces supports ne remplacent pas une formation pratique encadrée ni une évaluation clinique.\n[Préciser les conditions d’âge et de qualification]\n\n3. Accès et compte\n[Préciser les modalités de création du compte, les accès gratuits et payants, la sécurité du compte et sa suppression]\n\n4. Utilisation des contenus\n[Préciser les autorisations de consultation, les droits sur les vidéos et fiches, les usages interdits et les règles de partage]\n\n5. Disponibilité et responsabilités\n[Décrire les limites du service et les responsabilités sans exclure les garanties légales applicables]\n\n6. Données personnelles\n[Indiquer le contact et le lien vers une politique de confidentialité distincte précisant les finalités, bases légales, destinataires, durées de conservation et droits]\n\n7. Offres payantes\n[Confirmer l’absence d’offre payante ou renvoyer aux CGV adaptées aux prix, abonnements, paiements et rétractation]\n\n8. Évolution des conditions et réclamations\n[Préciser les modalités d’information, la date d’effet, le contact de réclamation et les dispositions applicables]'}
  };
  defaults.privacy={slug:'privacy',title:'Confidentialité',body:'BROUILLON À COMPLÉTER AVANT PUBLICATION\n\n[Identité et contact du responsable de traitement]\n\n[Données collectées, finalités et bases légales]\n\n[Prestataires, hébergement, destinataires et transferts éventuels]\n\n[Durées de conservation et modalités de suppression]\n\n[Droits des personnes et modalités de contact]\n\n[Traceurs et stockage local utilisés par l’application]'};
  const helpPages57={"videoMap": ["Vidéos des techniques", "Choisissez une grande région du corps pour accéder aux techniques : rachis, membres supérieurs, membres inférieurs ou bassin.\n\nSélectionnez ensuite une région plus précise, puis une technique pour ouvrir sa vidéo. La flèche en haut à gauche revient à l’accueil. Le Catalogue permet aussi de rechercher une technique par son intitulé."], "rachisMenu": ["Régions du rachis", "Choisissez la région que vous souhaitez explorer : cervicales, dorsales, côtes ou lombaires.\n\nLa liste suivante présente les techniques de cette région. Ouvrez une technique pour consulter sa vidéo et les supports associés. La flèche revient au choix des grandes régions du corps."], "zones": ["Catalogue", "Le Catalogue regroupe les techniques disponibles par grande région du corps.\n\nUtilisez le champ de recherche pour retrouver une technique par son intitulé, ou sélectionnez une région pour parcourir les techniques. La croix du champ efface votre recherche.\n\nLes nombres affichés indiquent les techniques disponibles dans chaque région ; ils ne correspondent pas à votre progression personnelle."], "rachis": ["Choisir une région du rachis", "Sélectionnez la région du rachis qui vous intéresse pour afficher les techniques correspondantes.\n\nOuvrez une technique pour accéder à sa vidéo et aux supports associés. La flèche en haut à gauche revient au Catalogue."], "techniques": ["Liste des techniques", "Cette page présente les techniques de la région sélectionnée.\n\nUtilisez la recherche pour filtrer la liste, puis touchez une technique pour ouvrir sa vidéo et ses supports. Les indicateurs de consultation vous aident à repérer les techniques déjà vues.\n\nLa flèche revient au niveau précédent de votre parcours."], "revision": ["Réviser", "Choisissez votre façon de réviser les techniques.\n\nAléatoire : lancez la roue pour tirer une technique parmi celles déjà débloquées.\n\nPar zone : retrouvez les techniques d’une région du corps.\n\nAudio : révisez en écoutant les techniques déjà vues.\n\nDéjà vues : retrouvez vos techniques consultées et leurs cartes de révision.\n\nSi aucune technique n’est disponible, commencez par visionner une vidéo complète. Les fonctions de révision se débloquent à partir des techniques enregistrées comme vues."], "revisionWheel": ["La roue de révision", "La roue tire au hasard une technique parmi vos techniques déjà débloquées.\n\nLancez la roue et attendez la fin du tirage. La technique choisie apparaît alors avec les modes disponibles : carte, vidéo, audio ou test.\n\nSeules les techniques déjà enregistrées comme vues participent au tirage. Si la roue est vide, visionnez d’abord une vidéo complète.\n\nLa flèche en haut à gauche revient au choix des modes de révision."], "revisionVoice": ["Révision audio", "Ce mode permet de réviser en écoutant les contenus associés à une technique déjà vue.\n\nUtilisez les commandes de lecture et de pause. Selon les commandes disponibles, vous pouvez changer de technique ou ouvrir sa carte. Le son doit être autorisé sur votre appareil.\n\nLa flèche revient à la roue de révision."], "seenCollections": ["Techniques déjà vues", "Retrouvez ici les techniques enregistrées comme vues dans votre compte, regroupées pour faciliter la révision.\n\nChoisissez une collection ou une technique pour accéder aux supports proposés. Si cette page est vide, commencez par visionner une vidéo complète.\n\nLa flèche revient au menu Réviser."], "seenCards": ["Cartes de révision", "Choisissez une carte dans la collection sélectionnée. Ouvrez-la puis retournez-la pour consulter ses deux faces.\n\nUtilisez les actions proposées pour revoir la technique ou vous tester lorsqu’un test est disponible. Fermez la carte pour revenir à la collection.\n\nLa flèche en haut de cette page revient au choix des collections."], "progress": ["Ma progression", "Cette page rassemble les indicateurs de votre activité et de vos révisions enregistrées dans l’application.\n\nConsultez les techniques vues, les résultats disponibles et les médailles obtenues. Les données dépendent des activités effectivement enregistrées dans votre compte.\n\nCes indicateurs servent à organiser votre apprentissage. Ils ne constituent pas une certification de compétence pratique. La flèche revient à l’accueil."], "msupMenu": ["Membres supérieurs", "Choisissez la région du membre supérieur à explorer : épaule, coude, poignet ou main.\n\nLa page suivante présente les techniques correspondantes. Sélectionnez une technique pour accéder à sa vidéo et aux supports associés. La flèche revient au choix des grandes régions du corps."], "minfMenu": ["Membres inférieurs", "Choisissez la région du membre inférieur à explorer : hanche, genou, tibia-fibula, cheville ou pied.\n\nLa page suivante présente les techniques correspondantes. Sélectionnez une technique pour accéder à sa vidéo et aux supports associés. La flèche revient au choix des grandes régions du corps."], "bassinMenu": ["Bassin", "Choisissez la région du bassin à explorer : articulations sacro-iliaques, sacrum ou symphyse.\n\nLa page suivante présente les techniques correspondantes. Sélectionnez une technique pour accéder à sa vidéo et aux supports associés. La flèche revient au choix des grandes régions du corps."]};
  for(const [screen,[title,body]]of Object.entries(helpPages57))defaults["help_"+screen]={slug:"help_"+screen,title,body,help:true};
  window.OSTEO_CONTENT_APP44.helpPages=helpPages57;window.OSTEO_CONTENT_APP44.openHelp=screen=>{if(helpPages57[screen])return openPage("help_"+screen);};
  const $=id=>document.getElementById(id);
  function node(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;}
  function bodyInto(el,text){el.replaceChildren();String(text||'').split(/\n\s*\n/).forEach(p=>el.appendChild(node('p',p)));}
  const team67=[{"key": "nicolas-bertrand", "name": "Nicolas Bertrand", "bio": "Ostéopathe depuis 2005 et masseur-kinésithérapeute depuis 1992, Nicolas Bertrand exerce la kinésithérapie et l’ostéopathie à Paris, et l’ostéopathie à Nice. Son parcours l’a notamment conduit à accompagner des sportifs dans le milieu du tennis, à Roland-Garros et au sein du Lagardère Paris Racing.\n\nAuteur de plusieurs ouvrages, dont L’Encyclopédie du massage, Leçons pour votre dos et Ostéo Pratique, coécrit avec Frédéric Zenouda, il développe une approche pédagogique nourrie par son expérience en cabinet.\n\nÉgalement entrepreneur et cofondateur de Macadam Tonic, il associe pratique, écriture et création d’outils pour transmettre ses connaissances."}, {"key": "valentin-cohas", "name": "Valentin Cohas", "bio": "Ostéopathe D.O. MROF, Valentin Cohas exerce l’ostéopathie depuis plus de 22 ans et enseigne depuis 20 ans. Il pratique en cabinet dans le 13e arrondissement de Paris."}, {"key": "frederic-zenouda", "name": "Frédéric Zenouda", "bio": ""}];
  function aboutInto67(el,text){
    const parts=String(text||'').split(/\n\s*\n/), bios=new Map(), intro=[];let current=null;
    for(const part of parts){const lines=part.split('\n');const person=team67.find(p=>p.name===lines[0].trim());if(person){current=person.name;bios.set(current,lines.slice(1).join('\n'));}else if(current){bios.set(current,(bios.get(current)+'\n\n'+part).trim());}else intro.push(part);}
    bodyInto(el,intro.join('\n\n'));const list=node('div',null,'op-team67');
    for(const person of team67){const card=node('section',null,'op-person67'),img=node('img'),copy=node('div');img.src=new URL('assets/images/equipe/'+person.key+'.webp',document.baseURI).href;img.alt='Portrait de '+person.name;img.width=400;img.height=500;img.loading='lazy';img.decoding='async';img.onerror=()=>{img.hidden=true;};copy.append(node('h2',person.name));const bio=bios.has(person.name)?bios.get(person.name):person.bio;if(bio)bodyInto(copy.appendChild(node('div')),bio);card.append(img,copy);list.append(card);}el.append(list);
  }
  function style(){if($('opContentStyle44'))return;const s=node('style');s.id='opContentStyle44';s.textContent=`
    .op-team67{display:grid;gap:20px;margin-top:24px}.op-person67{display:grid;grid-template-columns:130px minmax(0,1fr);gap:20px;padding:18px;border:1px solid #31516a;border-radius:18px;background:#0c2038}.op-person67 img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:center 25%;border-radius:12px}.op-person67 h2{margin:0 0 10px;font-size:20px;line-height:1.3}.op-person67 p:last-child{margin-bottom:0}@media(max-width:480px){.op-person67{grid-template-columns:minmax(0,1fr);padding:16px}.op-person67 img{width:min(220px,100%);justify-self:center}.op-person67 h2{text-align:center}}

    #opContentDialog44.op-help-dialog57{width:min(560px,calc(100% - 28px));max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 40px)}
    #opContentDialog44.op-help-dialog57 .op-content-page{display:grid;grid-template-columns:minmax(0,1fr) 44px;column-gap:12px;padding:20px}
    #opContentDialog44.op-help-dialog57 .op-content-close{grid-column:2;grid-row:1;align-self:start;padding:0;width:44px;height:44px;font-size:25px}
    #opContentDialog44.op-help-dialog57 h1{grid-column:1;grid-row:1;margin:4px 0 20px;font-size:24px;line-height:1.25}
    #opContentDialog44.op-help-dialog57 small,#opContentDialog44.op-help-dialog57 .op-content-page>div{grid-column:1/-1}
    #contentWorkspace44 #contentHelpPage57{display:block;min-height:44px;max-width:100%;background:#091729;color:#edf6ff;border:1px solid #31516a;border-radius:10px;padding:8px;font:inherit}
    .op-content-links{display:grid;gap:12px;padding:8px 0 12px}.op-content-links button{text-align:left;min-height:48px}#opSettingsDialog45{width:min(440px,calc(100% - 24px))}.op-content-links button{color:#b9ddec;background:transparent;border:1px solid #31516a;border-radius:14px;padding:12px;font:inherit;cursor:pointer}
    #opContentDialog44,#opSettingsDialog45{color:#edf6ff;background:#081528;border:1px solid #286078;border-radius:22px;padding:0;width:min(680px,calc(100% - 24px));max-height:88dvh;overflow:auto;box-sizing:border-box}#opContentDialog44::backdrop,#opSettingsDialog45::backdrop{background:#020815de}
    /* APP68 : masque la barre latérale sans désactiver le défilement tactile ou à la molette. */
    #opContentDialog44{scrollbar-width:none;-ms-overflow-style:none}#opContentDialog44::-webkit-scrollbar{display:none;width:0;height:0}
    .op-content-page{padding:22px;overflow-wrap:anywhere}.op-content-page h1{font-size:26px;line-height:1.2;margin:20px 0}.op-content-page p{white-space:pre-line;line-height:1.7;margin:0 0 20px}.op-content-page small{color:#9bb1ca}.op-content-close{color:#001b27;background:#57d9ef;border:0;border-radius:12px;padding:12px 18px;font:inherit;cursor:pointer;min-height:44px}
    #contentWorkspace44{grid-column:1/-1;min-width:0;padding:22px}#contentWorkspace44[hidden]{display:none!important}#contentWorkspace44 input,#contentWorkspace44 textarea{box-sizing:border-box;width:100%;color:#edf6ff;background:#091729;border:1px solid #31516a;border-radius:10px;padding:12px;font:inherit}#contentWorkspace44 textarea{min-height:360px;resize:vertical}#contentWorkspace44 label{display:block;margin:16px 0}#contentWorkspace44 .op-content-actions{display:flex;gap:10px;flex-wrap:wrap}#contentWorkspace44 .op-content-preview{margin-top:20px;padding:18px;border:1px solid #31516a;border-radius:14px;overflow-wrap:anywhere}#contentWorkspace44 .op-content-preview p{white-space:pre-line;line-height:1.6}#contentWorkspace44 input[type=checkbox]{width:auto}#contentStatus44{white-space:pre-line;line-height:1.6}#contentWorkspace44 button{min-height:44px} .workspace-tabs{flex-wrap:wrap}
    .op46-row{display:block;width:100%;text-align:left;box-sizing:border-box;margin:10px 0;padding:15px;border:1px solid #31516a;border-radius:14px;color:#edf6ff;background:#0c2038;cursor:pointer}.op46-row strong,.op46-row small{display:block}.op46-row strong{font-size:16px}.op46-row small{margin-top:5px;line-height:1.4}.op-content-page input:not([type=checkbox]){display:block;width:100%;box-sizing:border-box;background:#071221;color:#fff;border:1px solid #31516a;border-radius:10px;padding:12px;font-size:16px;min-height:44px}.op-content-page label{display:block;margin:14px 0;line-height:1.6}.op-content-page p{font-size:var(--op-reading46,16px)}.op46-check{display:flex!important;gap:12px;align-items:center}.op46-check input{width:22px;height:22px}.op46-data{display:grid;grid-template-columns:1fr 1fr;gap:10px}.op46-data dd{margin:0;overflow-wrap:anywhere}.op46-data dt{color:#9bb1ca}.op46-status{color:#8de6f4}.op-reduce-motion46 *, .op-reduce-motion46 *::before,.op-reduce-motion46 *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
    @media(max-width:480px){.op-content-page{padding:18px}.op-content-page h1{font-size:24px}#contentWorkspace44{padding:14px}}
    /* APP47 : volet vertical sous la barre supérieure, adapté aux zones sûres mobile. */
    html.op-settings-open47{overflow:hidden}
    #opSettingsDialog45{position:fixed;inset:auto;top:calc(env(safe-area-inset-top,0px) + 66px);right:18px;left:auto;bottom:auto;margin:0;width:min(380px,calc(100% - 36px));max-height:calc(100vh - 90px);max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 86px);border-radius:18px;overflow-y:auto;overscroll-behavior:contain;box-shadow:0 16px 50px #0008;scrollbar-width:thin}
    #opSettingsDialog45[open]{animation:op-settings-drop47 .16s ease-out}
    #opSettingsDialog45::backdrop{background:rgba(2,8,21,.54)}
    #opSettingsDialog45 .op-content-page{padding:0 14px 16px}
    #opSettingsDialog45 .op46-head{display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:0;z-index:2;background:#081528;padding:13px 0;border-bottom:1px solid #244057;margin-bottom:8px}
    #opSettingsDialog45 .op46-head h1{order:-1;font-size:19px;margin:0;line-height:1.3;min-width:0}
    #opSettingsDialog45 .op46-head button{background:transparent;color:#b9eaf2;flex-shrink:0;padding:8px;min-width:44px;min-height:44px;font-size:14px}
    #opSettingsDialog45 .op46-menu47 .op46-head button{font-size:24px}
    #opSettingsDialog45 h2{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#829cb5;margin:18px 8px 6px}
    #opSettingsDialog45 .op46-row{display:grid;grid-template-columns:28px minmax(0,1fr) 14px;column-gap:10px;align-items:center;min-height:52px;margin:0;padding:12px 8px;background:transparent;border:0;border-bottom:1px solid #ffffff0d;border-radius:0;font:inherit;color:#dceefa}
    #opSettingsDialog45 .op46-row:hover,#opSettingsDialog45 .op46-row:focus-visible{background:#122b43;border-radius:10px;outline:2px solid #42d9ed;outline-offset:-2px}
    #opSettingsDialog45 .op46-row strong{font-size:15px;font-weight:500;grid-column:2;grid-row:1;line-height:1.35}
    #opSettingsDialog45 .op46-row small{grid-column:2;grid-row:2;font-size:12px;margin-top:3px}
    #opSettingsDialog45 .op46-menu47 .op46-row small{display:none}
    #opSettingsDialog45 .op47-icon{grid-column:1;grid-row:1 / span 2;text-align:center;font-size:19px;color:#6ed8eb}
    #opSettingsDialog45 .op47-chevron{grid-column:3;grid-row:1 / span 2;color:#7999b0;font-size:21px}
    #opSettingsDialog45 .op46-row[data-account-exit]{color:#e4b4b4}
    #opSettingsDialog45 .op46-status:empty{display:none}
    #opSettingsDialog45 .op46-status{font-size:14px;margin-top:12px}
    @keyframes op-settings-drop47{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:480px){#opSettingsDialog45{right:10px;width:calc(100% - 20px);top:calc(env(safe-area-inset-top,0px) + 60px);max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 74px)}#opSettingsDialog45 .op-content-page{padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}}
  `;document.head.appendChild(s);}
  async function publicPage(slug){
    const c=window.OSTEO_SUPABASE;
    if(!c?.url||!c?.anonKey)throw Error('Configuration indisponible');
    const response=await fetch(c.url+'/rest/v1/osteo_content_pages?slug=eq.'+slug+'&select=title,body,updated_at',{headers:{apikey:c.anonKey,Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw Error('Lecture indisponible');
    return (await response.json())[0]||null;
  }
  let openSequence=0;
  async function openPage(slug,fromSettings=false){
    const seq=++openSequence,isHelp=defaults[slug]?.help===true,opener=document.activeElement;let dialog=$('opContentDialog44');
    if(!dialog){dialog=node('dialog');dialog.id='opContentDialog44';dialog.setAttribute('aria-labelledby','opContentTitle44');document.body.appendChild(dialog);}
    dialog.classList.toggle('op-help-dialog57',isHelp);
    const wrap=node('article',null,'op-content-page'),close=node('button',isHelp?'×':fromSettings?'← Réglages':'← Retour','op-content-close'),title=node('h1',defaults[slug].title),meta=node('small','Chargement…'),body=node('div');
    title.id='opContentTitle44';close.type='button';if(isHelp){close.setAttribute('aria-label','Fermer l’explication');dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();},{once:true});}close.onclick=()=>{dialog.close();if(fromSettings)openSettings();};wrap.append(close,title,meta,body);dialog.replaceChildren(wrap);if(!dialog.open)dialog.showModal();close.focus();
    try{
      let page=await publicPage(slug);if(!page&&(isHelp||slug==='about'))page=defaults[slug];if(window.OSTEO_LANG50?.translatePage)page=await window.OSTEO_LANG50.translatePage(slug,page);if(seq!==openSequence||!dialog.open)return;
      if(page){title.textContent=page.title;meta.textContent=page.updated_at?'Mis à jour le '+new Date(page.updated_at).toLocaleDateString('fr-FR'):'';if(slug==='about')aboutInto67(body,page.body);else bodyInto(body,page.body);}
      else {meta.textContent='';bodyInto(body,'Cette page n’est pas encore publiée.');}
    }catch(e){if(seq!==openSequence||!dialog.open)return;meta.textContent='';if(slug==='about')aboutInto67(body,defaults.about.body);else bodyInto(body,isHelp?defaults[slug].body:'Impossible de charger cette page. Vérifiez votre connexion et réessayez.');}
  }
  let settingsRun46=0;
  function preferences46(){try{return JSON.parse(localStorage.getItem('osteo.preferences.app46')||'{}')||{};}catch(_){return {};}}
  function applyPreferences46(){const p=preferences46();document.documentElement.classList.toggle('op-reduce-motion46',p.reduceMotion===true);document.documentElement.style.setProperty('--op-reading46',p.largeText?'18px':'16px');}
  function navigateLogin46(){const d=$('opSettingsDialog45');if(d?.open)d.close();if(typeof window.go==='function')window.go('login');}
  let menuMode49='settings';
  function openCurrentMenu49(){if(menuMode49==='profile')openProfile49();else openSettings();}
  function settingsShell46(title){
    let dialog=$('opSettingsDialog45');
    if(!dialog){dialog=node('dialog');dialog.id='opSettingsDialog45';document.body.appendChild(dialog);dialog.addEventListener('close',()=>{++settingsRun46;dialog.replaceChildren();document.documentElement.classList.remove('op-settings-open47');document.querySelectorAll('[data-op-settings45],[data-op-profile49]').forEach(b=>b.setAttribute('aria-expanded','false'));});dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});}
    const root=title==='Réglages'||title==='Mon profil';
    dialog.setAttribute('aria-labelledby','opSettingsTitle45');dialog.dataset.menuMode49=menuMode49;
    const wrap=node('article',null,'op-content-page'),head=node('div',null,'op46-head'),back=node('button',root?'×':menuMode49==='profile'?'← Profil':'← Réglages','op-content-close'),h=node('h1',title);
    back.type='button';back.onclick=()=>{if(root)dialog.close();else openCurrentMenu49();};h.id='opSettingsTitle45';
    if(root){wrap.classList.add('op46-menu47');back.setAttribute('aria-label','Fermer '+(menuMode49==='profile'?'le profil':'les réglages'));}
    head.append(back,h);wrap.appendChild(head);dialog.replaceChildren(wrap);dialog.scrollTop=0;
    if(!dialog.open)dialog.showModal();document.documentElement.classList.add('op-settings-open47');
    document.querySelectorAll('[data-op-settings45],[data-op-profile49]').forEach(b=>b.setAttribute('aria-expanded',String(menuMode49==='profile'?b.hasAttribute('data-op-profile49'):b.hasAttribute('data-op-settings45'))));
    back.focus();return wrap;
  }
  function settingButton46(parent,label,detail,action){
    const icons={'Mon compte':'♙','Mon abonnement':'◇','Préférences':'⚙','Qui sommes-nous':'ⓘ','Conditions générales d’utilisation':'≡','Confidentialité':'♧','Suppression du compte':'−','Se déconnecter':'↪','Se connecter':'→','Modifier mon mot de passe':'⌁'};
    const b=node('button',null,'op46-row'),icon=node('span',icons[label]||'›','op47-icon'),arrow=node('span','›','op47-chevron');
    icon.setAttribute('aria-hidden','true');arrow.setAttribute('aria-hidden','true');b.type='button';b.append(icon,node('strong',label),node('small',detail),arrow);b.onclick=action;
    if(label==='Se déconnecter'||label==='Suppression du compte')b.dataset.accountExit='1';parent.appendChild(b);return b;
  }
  function status46(parent){const p=node('p',null,'op46-status');p.setAttribute('role','status');p.setAttribute('aria-live','polite');parent.appendChild(p);return p;}
  async function session46(){const c=window.OSTEO_APP_AUTH_CLIENT;if(!c)throw Error('Le compte est en cours de chargement. Réessayez.');const {data,error}=await c.auth.getSession();if(error)throw Error('Impossible de vérifier la connexion.');if(!data?.session?.user)throw Error('Connectez-vous pour accéder à votre compte.');return {c,user:data.session.user};}
  async function profile46(c,user){const {data,error}=await c.from('osteo_user_profiles').select('first_name,last_name,school,student_year,subscription_status,subscription_plan,subscription_expires_at,payment_status').eq('user_id',user.id).maybeSingle();if(error)throw Error('Impossible de charger votre profil. Réessayez.');return data||{};}
  function field46(form,label,value,type='text',required=false){const l=node('label',label),i=node('input');i.type=type;i.value=value||'';i.required=required;i.maxLength=200;l.appendChild(i);form.appendChild(l);return i;}
  async function account46(){
    const run=++settingsRun46,wrap=settingsShell46('Mon compte'),status=status46(wrap);
    status.textContent='Chargement…';
    try{
      const {c,user}=await session46(),p=await profile46(c,user);if(run!==settingsRun46)return;status.textContent='';
      const form=node('form'),email=field46(form,'Email du compte',user.email,'email');email.readOnly=true;
      const first=field46(form,'Prénom',p.first_name),last=field46(form,'Nom',p.last_name),school=field46(form,'École / établissement',p.school),year=field46(form,'Année de formation',p.student_year);
      const save=node('button','Enregistrer mon profil','op-content-close');save.type='submit';form.append(save);wrap.append(form);
      form.onsubmit=async e=>{e.preventDefault();save.disabled=true;status.textContent='Enregistrement…';try{const current=await session46();if(current.user.id!==user.id)throw Error('La session a changé. Rouvrez votre compte.');const {error}=await c.rpc('osteo_update_my_profile_app46',{p_first_name:first.value.trim(),p_last_name:last.value.trim(),p_school:school.value.trim(),p_student_year:year.value.trim()});if(error)throw Error('Profil non enregistré. Vérifiez la connexion et l’installation SQL APP46.');if(run!==settingsRun46)return;status.textContent='Profil modifié ✓';}catch(err){if(run===settingsRun46)status.textContent=err.message;}finally{save.disabled=false;}};
      settingButton46(wrap,'Modifier mon mot de passe','Confirmer votre mot de passe actuel',password46);
    }catch(e){if(run===settingsRun46)status.textContent=e.message;}
  }
  async function password46(){
    const run=++settingsRun46,wrap=settingsShell46('Mot de passe'),status=status46(wrap),form=node('form');
    const current=field46(form,'Mot de passe actuel','','password',true),next=field46(form,'Nouveau mot de passe (12 caractères minimum)','','password',true),repeat=field46(form,'Confirmer le nouveau mot de passe','','password',true);
    current.autocomplete='current-password';next.autocomplete=repeat.autocomplete='new-password';next.minLength=repeat.minLength=12;
    const save=node('button','Enregistrer le mot de passe','op-content-close');save.type='submit';form.append(save);wrap.append(form);
    form.onsubmit=async e=>{e.preventDefault();if(next.value.length<12||next.value!==repeat.value){status.textContent='Utilisez au moins 12 caractères et deux saisies identiques.';return;}save.disabled=true;try{const {c,user}=await session46();if(!user.email)throw Error('Modification indisponible pour ce mode de connexion.');const verified=await c.auth.signInWithPassword({email:user.email,password:current.value});if(verified.error||verified.data?.user?.id!==user.id)throw Error('Mot de passe actuel incorrect ou connexion impossible.');const active=await session46();if(active.user.id!==user.id||run!==settingsRun46)throw Error('Session modifiée. Recommencez.');const {error}=await c.auth.updateUser({password:next.value});if(error)throw Error('Modification refusée. Réessayez ou utilisez « Mot de passe oublié » sur la page de connexion.');form.reset();if(run===settingsRun46)status.textContent='Mot de passe modifié.';}catch(err){if(run===settingsRun46)status.textContent=err.message;}finally{current.value='';save.disabled=false;}};
  }
  async function subscription46(){
    const run=++settingsRun46,wrap=settingsShell46('Mon abonnement'),status=status46(wrap);status.textContent='Chargement…';
    try{const {c,user}=await session46();const ensured=await c.rpc('osteo_ensure_my_beta_subscription_app72');if(ensured.error)throw Error('Abonnement indisponible. Vérifiez l’installation SQL APP72.');const p=await profile46(c,user);if(run!==settingsRun46)return;status.textContent='';const labels={actif:'Actif',expire_bientot:'Expire bientôt',expire:'Expiré',inactif:'Inactif'},payments={paye:'Payé',en_attente:'En attente',impaye:'Impayé',gratuit:'Gratuit / offert'};const dl=node('dl',null,'op46-data');
      for(const [label,value] of [['Formule',p.subscription_plan||'Non renseignée'],['Statut',labels[p.subscription_status]||'Non renseigné'],['Échéance',p.subscription_expires_at?new Date(p.subscription_expires_at).toLocaleDateString('fr-FR'):'Aucune pendant la bêta'],['Paiement',payments[p.payment_status]||'Non renseigné']])dl.append(node('dt',label),node('dd',value));wrap.append(dl,node('p','Abonnement synchronisé avec votre compte sur tous vos appareils. Aucun paiement en ligne n’est activé pendant la bêta.'));
    }catch(e){if(run===settingsRun46)status.textContent=e.message;}
  }
  function prefs46(){
    ++settingsRun46;const wrap=settingsShell46('Préférences'),p=preferences46(),status=status46(wrap);
    for(const [key,label] of [['reduceMotion','Réduire les animations'],['largeText','Agrandir le texte des pages d’information']]){const l=node('label',null,'op46-check'),i=node('input');i.type='checkbox';i.checked=p[key]===true;l.append(i,node('span',label));wrap.append(l);i.onchange=()=>{const old=preferences46();try{localStorage.setItem('osteo.preferences.app46',JSON.stringify({...old,[key]:i.checked}));applyPreferences46();status.textContent='Préférence enregistrée sur cet appareil.';}catch(e){i.checked=old[key]===true;status.textContent='Ce navigateur ne permet pas d’enregistrer ce réglage.';}};}
    wrap.append(node('p','Ces réglages sont propres à ce navigateur.'));
  }
  async function deletion46(){
    const run=++settingsRun46,wrap=settingsShell46('Suppression du compte'),status=status46(wrap);status.textContent='Chargement…';
    try{const {c,user}=await session46();if(run!==settingsRun46)return;const {data,error}=await c.from('osteo_account_requests').select('status,created_at').eq('user_id',user.id).eq('kind','delete_account').maybeSingle();if(error)throw Error('Cette fonction nécessite l’installation SQL APP46.');if(run!==settingsRun46)return;status.textContent='';
      wrap.append(node('p','Votre demande sera enregistrée et devra être traitée par un administrateur. Elle ne supprime pas immédiatement votre compte et ne résilie pas un éventuel abonnement.'));
      if(data){status.textContent='Demande déjà enregistrée le '+new Date(data.created_at).toLocaleDateString('fr-FR')+' · '+({pending:'En attente',processed:'Traitée'}[data.status]||data.status);return;}
      const form=node('form'),confirmation=field46(form,'Saisissez SUPPRIMER pour confirmer','','text',true);confirmation.autocomplete='off';const send=node('button','Demander la suppression','op-content-close');send.type='submit';form.append(send);wrap.append(form);
      form.onsubmit=async e=>{e.preventDefault();if(confirmation.value.trim()!=='SUPPRIMER'){status.textContent='Saisissez exactement SUPPRIMER.';return;}send.disabled=true;try{const active=await session46();if(active.user.id!==user.id)throw Error('Session modifiée. Recommencez.');const {error}=await c.from('osteo_account_requests').insert({user_id:user.id,kind:'delete_account'});if(error)throw Error('Demande non enregistrée ou déjà existante. Rouvrez cette rubrique pour vérifier.');if(run===settingsRun46){form.remove();status.textContent='Demande enregistrée. Elle est visible dans le back-office pour traitement.';}}catch(e){if(run===settingsRun46)status.textContent=e.message;send.disabled=false;}};
    }catch(e){if(run===settingsRun46)status.textContent=e.message;}
  }
  async function logout46(button){button.disabled=true;try{const {c}=await session46();const {error}=await c.auth.signOut();if(error)throw error;$('opSettingsDialog45')?.close();if(typeof window.go==='function')window.go('welcome');}catch(e){button.disabled=false;const s=$('op46MenuStatus');if(s)s.textContent='Déconnexion impossible. Vérifiez votre connexion et réessayez.';}}
  function openSettings(){
    menuMode49='settings';++settingsRun46;const wrap=settingsShell46('Réglages');
    settingButton46(wrap,'Préférences','Affichage et animations sur cet appareil',prefs46);
    wrap.append(node('h2','Informations'));
    for(const slug of ['about','cgu','privacy'])settingButton46(wrap,defaults[slug].title,'Consulter',()=>{$('opSettingsDialog45').close();openPage(slug,true);});
  }
  function openProfile49(){
    menuMode49='profile';++settingsRun46;const wrap=settingsShell46('Mon profil');
    settingButton46(wrap,'Mon compte','Mes informations personnelles',account46);
    settingButton46(wrap,'Modifier mon mot de passe','Sécuriser mon compte',password46);
    settingButton46(wrap,'Mon abonnement','Formule, statut et échéance',subscription46);
    wrap.append(node('h2','Compte'));
    settingButton46(wrap,'Suppression du compte','Enregistrer une demande de suppression',deletion46);
    const logout=settingButton46(wrap,'Se déconnecter','Fermer votre session',()=>logout46(logout));
    const status=status46(wrap);status.id='op46MenuStatus';
    if(!window.OSTEO_AUTH?.isAuthenticated?.())settingButton46(wrap,'Se connecter','Accéder à votre compte',navigateLogin46);
  }
  function watchSession46(){
    if(/backoffice\.html$/i.test(location.pathname))return;
    let bound=false;
    function attach(){const c=window.OSTEO_APP_AUTH_CLIENT;if(bound||!c)return;bound=true;let previous=window.OSTEO_AUTH?.getSession?.()?.user?.id||null;
      c.auth.onAuthStateChange((_event,session)=>{const id=session?.user?.id||null;if(id!==previous){previous=id;++settingsRun46;setTimeout(()=>{const d=$('opSettingsDialog45');if(d?.open)openCurrentMenu49();else d?.replaceChildren();},0);}});
    }
    attach();const timer=setInterval(()=>{attach();if(bound)clearInterval(timer);},500);setTimeout(()=>clearInterval(timer),30000);
  }
  function app(){
    function install(){
      document.querySelectorAll('#home > .op-content-links,#profile > .op-content-links').forEach(n=>n.remove());
      const profileLaunchers=[...document.querySelectorAll('[data-target="profile"]')];
      const profileScreen=$('profile');
      if(profileScreen && !$('opProfileEntry49')){
        const entry=node('button','Gérer mon profil','op46-row');entry.id='opProfileEntry49';entry.type='button';profileScreen.appendChild(entry);profileLaunchers.push(entry);
      }else if($('opProfileEntry49'))profileLaunchers.push($('opProfileEntry49'));
      for(const button of profileLaunchers){
        if(button.dataset.opProfile49)continue;button.dataset.opProfile49='1';button.removeAttribute('onclick');button.type='button';
        button.onclick=()=>openProfile49();button.setAttribute('aria-label','Mon profil');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','opSettingsDialog45');button.setAttribute('aria-expanded','false');
      }
      const backoffice=document.querySelector('#home .home-top .home-notifications');
      if(backoffice && backoffice.dataset.opBackoffice48!=='1'){
        backoffice.dataset.opBackoffice48='1';backoffice.type='button';
        backoffice.removeAttribute('onclick');backoffice.textContent='▦';
        backoffice.setAttribute('aria-label','Ouvrir le back-office');backoffice.title='Back-office';
        backoffice.onclick=()=>{window.location.href=new URL('backoffice.html',window.location.href).href;};
      }
      const launchers=[document.querySelector('#home .home-settings'),document.querySelector('#profile > header > button.icon:last-child')].filter(Boolean);
      for(const button of launchers){
        if(button.dataset.opSettings45)continue;
        button.dataset.opSettings45='1';button.removeAttribute('onclick');button.onclick=openSettings;button.type='button';
        button.setAttribute('aria-label','Réglages');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','opSettingsDialog45');button.setAttribute('aria-expanded','false');button.setAttribute('title','Réglages');
        button.textContent='⚙';
      }
    }
    install();document.addEventListener('DOMContentLoaded',install,{once:true});[300,1200,3000].forEach(t=>setTimeout(install,t));
  }
  async function admin(){
    const tabs=document.querySelector('.workspace-tabs');if(!tabs)return;
    const tab=node('button','✎ Contenus','workspace-tab');tab.type='button';tab.dataset.workspace='content44';
    const panel=node('section',null,'panel');panel.id='contentWorkspace44';panel.hidden=true;
    panel.innerHTML='<h1>Contenus de l’application</h1><p>Enregistrez un brouillon, vérifiez l’aperçu puis publiez. Les brouillons restent privés ; la publication remplace le texte accessible à tous.</p><div class="op-content-actions"><button class="btn" data-page="about">Qui sommes-nous</button><button class="btn" data-page="cgu">CGU</button><button class="btn" data-page="privacy">Confidentialité</button><button class="btn" id="contentReload44">Recharger</button></div><p id="contentStatus44" role="status" aria-live="polite"></p><fieldset id="contentFields44" disabled><label>Titre<input id="contentTitle44" maxlength="180"></label><label>Texte (paragraphes séparés par une ligne vide)<textarea id="contentBody44" maxlength="80000"></textarea></label><label><input id="contentConfirm44" type="checkbox"> J’ai vérifié ce texte et souhaite le rendre public.</label><div class="op-content-actions"><button class="btn" id="contentSave44">Enregistrer le brouillon</button><button class="btn green" id="contentPublish44">Publier</button></div></fieldset><h2>Aperçu</h2><div class="op-content-preview" id="contentPreview44"></div>';
    const helpLabel=node('label','Explications des pages'),helpSelect=node('select');helpSelect.id='contentHelpPage57';helpSelect.setAttribute('aria-label','Page à expliquer');helpSelect.appendChild(new Option('Choisir une page…',''));for(const [screen,[title]]of Object.entries(helpPages57))helpSelect.appendChild(new Option(title,'help_'+screen));helpLabel.appendChild(helpSelect);panel.querySelector('.op-content-actions').appendChild(helpLabel);helpSelect.onchange=async()=>{if(helpSelect.value)await load(helpSelect.value);helpSelect.value=slug.startsWith('help_')?slug:'';};
    document.querySelector('main').appendChild(panel);
    // Les gestionnaires historiques ne connaissent pas ce nouvel espace : garder son état isolé.
    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-workspace]');if(!b)return;if(b!==tab){panel.hidden=true;return;}for(const el of document.querySelectorAll('.techniques-panel,.editor-panel,#quizWorkspace,#usersWorkspace,#statsWorkspace'))el.hidden=true;panel.hidden=false;tabs.querySelectorAll('[data-workspace]').forEach(x=>x.classList.toggle('active',x===tab));load(slug);});
    tabs.appendChild(tab);
    let client=null,slug='about',version=null,liveVersion=null,busy=false,dirty=false,loadToken=0,authorized=false;
    const status=t=>$('contentStatus44').textContent=t;
    function preview(){const p=$('contentPreview44');p.replaceChildren(node('h2',$('contentTitle44').value));const b=node('div');if(slug==='about')aboutInto67(b,$('contentBody44').value);else bodyInto(b,$('contentBody44').value);p.appendChild(b);}
    function valid(){if(!$('contentTitle44').value.trim()||!$('contentBody44').value.trim())throw Error('Renseignez le titre et le texte.');}
    async function ready(){client=window.OSTEO_BACKOFFICE_CLIENT;if(!client)throw Error('Connectez-vous au back-office puis rechargez cette rubrique.');const {data,error}=await client.rpc('osteo_get_my_role');if(error||data!=='admin')throw Error('La modification est réservée aux administrateurs.');}
    async function load(next){
      if(busy)return;if(dirty&&!confirm('Abandonner les modifications non enregistrées ?'))return;
      const token=++loadToken;authorized=false;slug=next;helpSelect.value=slug.startsWith('help_')?slug:'';dirty=false;$('contentFields44').disabled=true;status('Chargement…');
      try{await ready();const [draft,live]=await Promise.all([client.from('osteo_content_drafts').select('*').eq('slug',slug).maybeSingle(),client.from('osteo_content_pages').select('*').eq('slug',slug).maybeSingle()]);if(token!==loadToken)return;if(draft.error||live.error)throw Error('Lecture impossible. Vérifiez la connexion et l’installation du SQL APP44.');version=draft.data?.updated_at||null;liveVersion=live.data?.updated_at||null;const v=draft.data||live.data||defaults[slug];$('contentTitle44').value=v.title;$('contentBody44').value=v.body;$('contentConfirm44').checked=false;authorized=true;$('contentFields44').disabled=false;panel.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('primary',b.dataset.page===slug));status(liveVersion?'Version publique du '+new Date(liveVersion).toLocaleString('fr-FR')+' · Vous éditez le brouillon.':'Aucune version publiée. Vous éditez un brouillon.');preview();}
      catch(e){if(token===loadToken){version=null;liveVersion=null;status(e.message);$('contentTitle44').value='';$('contentBody44').value='';$('contentPreview44').replaceChildren();}}
    }
    async function write(table,expected,payload){const query=expected?client.from(table).update(payload).eq('slug',slug).eq('updated_at',expected):client.from(table).insert({...payload,slug});const {data,error}=await query.select('updated_at').single();if(error||!data)throw Error('Enregistrement refusé ou conflit avec une autre modification. Copiez votre texte, puis rechargez avant de réessayer.');return data.updated_at;}
    async function save(publish){if(busy||!authorized)return;try{valid();if(publish&&(!$('contentConfirm44').checked||/\[[^\]]+\]|BROUILLON À COMPLÉTER/i.test($('contentBody44').value)))throw Error('Complétez les champs entre crochets et confirmez la vérification avant publication.');busy=true;$('contentFields44').disabled=true;await ready();const payload={title:$('contentTitle44').value.trim(),body:$('contentBody44').value.trim()};version=await write('osteo_content_drafts',version,payload);dirty=false;if(publish){liveVersion=await write('osteo_content_pages',liveVersion,payload);$('contentConfirm44').checked=false;status('Publié. Le texte sera visible à la prochaine ouverture de la page dans l’application.');}else status('Brouillon enregistré. La version publique reste inchangée.');}catch(e){status(e.message);}finally{busy=false;$('contentFields44').disabled=!authorized;}}
    panel.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>load(b.dataset.page));$('contentReload44').onclick=()=>load(slug);$('contentSave44').onclick=()=>save(false);$('contentPublish44').onclick=()=>save(true);
    for(const id of ['contentTitle44','contentBody44'])$(id).oninput=()=>{dirty=true;$('contentConfirm44').checked=false;preview();};
    window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
    let observed=null;const timer=setInterval(()=>{const c=window.OSTEO_BACKOFFICE_CLIENT;if(!c||c===observed)return;observed=c;clearInterval(timer);c.auth.onAuthStateChange(()=>{authorized=false;++loadToken;$('contentFields44').disabled=true;status('Connexion modifiée. Rechargez cette rubrique avant de continuer.');});},500);setTimeout(()=>clearInterval(timer),30000);
  }
  function adminRequests46(){
    const parent=$('contentWorkspace44');if(!parent)return;
    const section=node('section',null,'op-content-preview'),title=node('h2','Demandes de suppression'),info=node('p','Ces demandes nécessitent un traitement manuel. Le bouton « Marquer traitée » ne supprime aucun compte.'),refresh=node('button','Charger les demandes','btn'),status=status46(section),list=node('div');
    refresh.type='button';section.prepend(title,info,refresh);section.appendChild(list);parent.appendChild(section);
    refresh.onclick=async()=>{
      refresh.disabled=true;list.replaceChildren();status.textContent='Chargement…';
      try{const c=window.OSTEO_BACKOFFICE_CLIENT;if(!c)throw Error('Connectez-vous comme administrateur.');const role=await c.rpc('osteo_get_my_role');if(role.error||role.data!=='admin')throw Error('Accès administrateur requis.');
        const {data,error}=await c.from('osteo_account_requests').select('id,user_id,status,created_at').order('created_at',{ascending:false});if(error)throw Error('Lecture impossible. Vérifiez la connexion et le SQL APP46.');
        status.textContent=data.length?data.length+' demande(s)':'Aucune demande.';
        for(const row of data){const box=node('article',null,'op46-request');box.append(node('strong','Compte : '+row.user_id),node('p',new Date(row.created_at).toLocaleString('fr-FR')+' · '+(row.status==='processed'?'Traitée':'En attente')));
          if(row.status==='pending'){const button=node('button','Marquer traitée','btn');button.type='button';button.onclick=async()=>{if(!confirm('Confirmer que cette demande a effectivement été traitée ? Cette action ne supprime pas le compte.'))return;button.disabled=true;try{const {data:changed,error}=await c.from('osteo_account_requests').update({status:'processed'}).eq('id',row.id).eq('status','pending').select('id').single();if(error||!changed)throw Error();button.replaceWith(node('p','Traitée'));}catch(e){status.textContent='Mise à jour refusée. Rechargez les demandes.';button.disabled=false;}};box.append(button);}list.append(box);}
      }catch(e){status.textContent=e.message;}finally{refresh.disabled=false;}
    };
  }
  style();applyPreferences46();watchSession46();if(/backoffice\.html$/i.test(location.pathname)){admin();adminRequests46();}else app();
})();

/* APP50 : chargement indépendant, index et bridge permanents conservés. */
(function(){if(document.querySelector('script[data-op-languages50]'))return;const script=document.createElement('script');script.src=new URL('languages-app50.js?cb='+Date.now(),document.currentScript?.src||location.href).href;script.dataset.opLanguages50='1';document.head.appendChild(script);})();

/* APP56 : composants et navigation, sans changement du document principal. */
(function(){if(/backoffice\.html$/i.test(location.pathname)||document.querySelector('script[data-op-navigation56]'))return;const script=document.createElement('script');script.src=new URL('navigation-app56.js?cb='+Date.now(),document.currentScript?.src||location.href).href;script.dataset.opNavigation56='1';document.head.appendChild(script);})();

/* APP69 : validation des CGU bêta, chargée sans modifier index.html. */
(function(){if(/backoffice\.html$/i.test(location.pathname)||document.querySelector('script[data-op-cgu69]'))return;const script=document.createElement('script');script.src=new URL('cgu-acceptance-app69.js?cb='+Date.now(),document.currentScript?.src||location.href).href;script.dataset.opCgu69='1';document.head.appendChild(script);})();

/* APP74 : même flèche de retour dans le lecteur audio et la navigation. */
(function(){if(/backoffice\.html$/i.test(location.pathname)||document.querySelector('script[data-op-audio-back74]'))return;const script=document.createElement('script');script.src=new URL('audio-back-app74.js?cb='+Date.now(),document.currentScript?.src||location.href).href;script.dataset.opAudioBack74='1';document.head.appendChild(script);})();

/* APP76 : médailles fun adaptées au téléphone et à l'ordinateur. */
(function(){if(/backoffice\.html$/i.test(location.pathname)||document.querySelector('script[data-op-medals76]'))return;const script=document.createElement('script');script.src=new URL('medailles-fun-app76.js?cb='+Date.now(),document.currentScript?.src||location.href).href;script.dataset.opMedals76='1';document.head.appendChild(script);})();
