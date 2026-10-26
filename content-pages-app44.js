/* Ostéo Pratik APP44 — pages éditoriales. Texte brut uniquement ; droits contrôlés par RLS. */
(function(){
  'use strict';
  if(window.OSTEO_CONTENT_APP44) return;
  window.OSTEO_CONTENT_APP44={version:'45.0'};
  const defaults={
    about:{slug:'about',title:'Qui sommes-nous',body:'Ostéo Pratik est une application pédagogique consacrée à l’apprentissage et à la révision des techniques ostéopathiques.\n\nConçue par Nicolas Bertrand, masseur-kinésithérapeute et ostéopathe, elle associe vidéos, cartes de révision, audio et quiz pour accompagner un apprentissage régulier.\n\nNotre démarche\nTransmettre des repères clairs, faciliter la mémorisation et permettre à chacun de suivre sa progression.\n\nLes contenus sont des supports pédagogiques. Ils s’adressent aux étudiants et aux professionnels formés et ne remplacent ni une formation pratique encadrée, ni l’évaluation clinique d’un patient.'},
    cgu:{slug:'cgu',title:'Conditions générales d’utilisation',body:'BROUILLON À COMPLÉTER AVANT PUBLICATION\n\n1. Éditeur et contact\n[Identité ou raison sociale, statut, adresse, identifiants professionnels et contact de l’éditeur]\n\n2. Objet et public concerné\nOstéo Pratik propose des contenus pédagogiques pour apprendre et réviser des techniques ostéopathiques. Ces supports ne remplacent pas une formation pratique encadrée ni une évaluation clinique.\n[Préciser les conditions d’âge et de qualification]\n\n3. Accès et compte\n[Préciser les modalités de création du compte, les accès gratuits et payants, la sécurité du compte et sa suppression]\n\n4. Utilisation des contenus\n[Préciser les autorisations de consultation, les droits sur les vidéos et fiches, les usages interdits et les règles de partage]\n\n5. Disponibilité et responsabilités\n[Décrire les limites du service et les responsabilités sans exclure les garanties légales applicables]\n\n6. Données personnelles\n[Indiquer le contact et le lien vers une politique de confidentialité distincte précisant les finalités, bases légales, destinataires, durées de conservation et droits]\n\n7. Offres payantes\n[Confirmer l’absence d’offre payante ou renvoyer aux CGV adaptées aux prix, abonnements, paiements et rétractation]\n\n8. Évolution des conditions et réclamations\n[Préciser les modalités d’information, la date d’effet, le contact de réclamation et les dispositions applicables]'}
  };
  const $=id=>document.getElementById(id);
  function node(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;}
  function bodyInto(el,text){el.replaceChildren();String(text||'').split(/\n\s*\n/).forEach(p=>el.appendChild(node('p',p)));}
  function style(){if($('opContentStyle44'))return;const s=node('style');s.id='opContentStyle44';s.textContent=`
    .op-content-links{display:grid;gap:12px;padding:8px 0 12px}.op-content-links button{text-align:left;min-height:48px}#opSettingsDialog45{width:min(440px,calc(100% - 24px))}.op-content-links button{color:#b9ddec;background:transparent;border:1px solid #31516a;border-radius:14px;padding:12px;font:inherit;cursor:pointer}
    #opContentDialog44,#opSettingsDialog45{color:#edf6ff;background:#081528;border:1px solid #286078;border-radius:22px;padding:0;width:min(680px,calc(100% - 24px));max-height:88dvh;overflow:auto;box-sizing:border-box}#opContentDialog44::backdrop,#opSettingsDialog45::backdrop{background:#020815de}
    .op-content-page{padding:22px;overflow-wrap:anywhere}.op-content-page h1{font-size:26px;line-height:1.2;margin:20px 0}.op-content-page p{white-space:pre-line;line-height:1.7;margin:0 0 20px}.op-content-page small{color:#9bb1ca}.op-content-close{color:#001b27;background:#57d9ef;border:0;border-radius:12px;padding:12px 18px;font:inherit;cursor:pointer;min-height:44px}
    #contentWorkspace44{grid-column:1/-1;min-width:0;padding:22px}#contentWorkspace44[hidden]{display:none!important}#contentWorkspace44 input,#contentWorkspace44 textarea{box-sizing:border-box;width:100%;color:#edf6ff;background:#091729;border:1px solid #31516a;border-radius:10px;padding:12px;font:inherit}#contentWorkspace44 textarea{min-height:360px;resize:vertical}#contentWorkspace44 label{display:block;margin:16px 0}#contentWorkspace44 .op-content-actions{display:flex;gap:10px;flex-wrap:wrap}#contentWorkspace44 .op-content-preview{margin-top:20px;padding:18px;border:1px solid #31516a;border-radius:14px;overflow-wrap:anywhere}#contentWorkspace44 .op-content-preview p{white-space:pre-line;line-height:1.6}#contentWorkspace44 input[type=checkbox]{width:auto}#contentStatus44{white-space:pre-line;line-height:1.6}#contentWorkspace44 button{min-height:44px} .workspace-tabs{flex-wrap:wrap}
    @media(max-width:480px){.op-content-page{padding:18px}.op-content-page h1{font-size:24px}#contentWorkspace44{padding:14px}}
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
    const seq=++openSequence;let dialog=$('opContentDialog44');
    if(!dialog){dialog=node('dialog');dialog.id='opContentDialog44';dialog.setAttribute('aria-labelledby','opContentTitle44');document.body.appendChild(dialog);}
    const wrap=node('article',null,'op-content-page'),close=node('button',fromSettings?'← Paramètres':'← Retour','op-content-close'),title=node('h1',defaults[slug].title),meta=node('small','Chargement…'),body=node('div');
    title.id='opContentTitle44';close.type='button';close.onclick=()=>{dialog.close();if(fromSettings)openSettings();};wrap.append(close,title,meta,body);dialog.replaceChildren(wrap);if(!dialog.open)dialog.showModal();close.focus();
    try{
      const page=await publicPage(slug);if(seq!==openSequence)return;
      if(page){title.textContent=page.title;meta.textContent='Mis à jour le '+new Date(page.updated_at).toLocaleDateString('fr-FR');bodyInto(body,page.body);}
      else {meta.textContent='';bodyInto(body,'Cette page n’est pas encore publiée.');}
    }catch(e){if(seq!==openSequence)return;meta.textContent='';bodyInto(body,'Impossible de charger cette page. Vérifiez votre connexion et réessayez.');}
  }
  function openSettings(){
    let dialog=$('opSettingsDialog45');
    if(!dialog){
      dialog=node('dialog');dialog.id='opSettingsDialog45';dialog.setAttribute('aria-labelledby','opSettingsTitle45');
      const wrap=node('article',null,'op-content-page'),close=node('button','Fermer','op-content-close'),title=node('h1','Paramètres'),links=node('nav',null,'op-content-links');
      title.id='opSettingsTitle45';close.type='button';close.onclick=()=>dialog.close();links.setAttribute('aria-label','Informations');
      for(const slug of ['about','cgu']){const button=node('button',defaults[slug].title);button.type='button';button.onclick=()=>{dialog.close();openPage(slug,true);};links.appendChild(button);}
      wrap.append(close,title,links);dialog.appendChild(wrap);document.body.appendChild(dialog);
    }
    if(!dialog.open)dialog.showModal();
  }
  function app(){
    function install(){
      document.querySelectorAll('#home > .op-content-links,#profile > .op-content-links').forEach(n=>n.remove());
      const launchers=[document.querySelector('#home .home-settings'),document.querySelector('#profile > header > button.icon:last-child')].filter(Boolean);
      for(const button of launchers){
        if(button.dataset.opSettings45)continue;
        button.dataset.opSettings45='1';button.removeAttribute('onclick');button.onclick=openSettings;button.type='button';
        button.setAttribute('aria-label','Paramètres');button.setAttribute('aria-haspopup','dialog');button.setAttribute('title','Paramètres');
        button.textContent='⚙';
      }
    }
    install();document.addEventListener('DOMContentLoaded',install,{once:true});[300,1200,3000].forEach(t=>setTimeout(install,t));
  }
  async function admin(){
    const tabs=document.querySelector('.workspace-tabs');if(!tabs)return;
    const tab=node('button','✎ Contenus','workspace-tab');tab.type='button';tab.dataset.workspace='content44';
    const panel=node('section',null,'panel');panel.id='contentWorkspace44';panel.hidden=true;
    panel.innerHTML='<h1>Contenus de l’application</h1><p>Enregistrez un brouillon, vérifiez l’aperçu puis publiez. Les brouillons restent privés ; la publication remplace le texte accessible à tous.</p><div class="op-content-actions"><button class="btn" data-page="about">Qui sommes-nous</button><button class="btn" data-page="cgu">CGU</button><button class="btn" id="contentReload44">Recharger</button></div><p id="contentStatus44" role="status" aria-live="polite"></p><fieldset id="contentFields44" disabled><label>Titre<input id="contentTitle44" maxlength="180"></label><label>Texte (paragraphes séparés par une ligne vide)<textarea id="contentBody44" maxlength="80000"></textarea></label><label><input id="contentConfirm44" type="checkbox"> J’ai vérifié ce texte et souhaite le rendre public.</label><div class="op-content-actions"><button class="btn" id="contentSave44">Enregistrer le brouillon</button><button class="btn green" id="contentPublish44">Publier</button></div></fieldset><h2>Aperçu</h2><div class="op-content-preview" id="contentPreview44"></div>';
    document.querySelector('main').appendChild(panel);
    // Les gestionnaires historiques ne connaissent pas ce nouvel espace : garder son état isolé.
    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-workspace]');if(!b)return;if(b!==tab){panel.hidden=true;return;}for(const el of document.querySelectorAll('.techniques-panel,.editor-panel,#quizWorkspace,#usersWorkspace,#statsWorkspace'))el.hidden=true;panel.hidden=false;tabs.querySelectorAll('[data-workspace]').forEach(x=>x.classList.toggle('active',x===tab));load(slug);});
    tabs.appendChild(tab);
    let client=null,slug='about',version=null,liveVersion=null,busy=false,dirty=false,loadToken=0,authorized=false;
    const status=t=>$('contentStatus44').textContent=t;
    function preview(){const p=$('contentPreview44');p.replaceChildren(node('h2',$('contentTitle44').value));const b=node('div');bodyInto(b,$('contentBody44').value);p.appendChild(b);}
    function valid(){if(!$('contentTitle44').value.trim()||!$('contentBody44').value.trim())throw Error('Renseignez le titre et le texte.');}
    async function ready(){client=window.OSTEO_BACKOFFICE_CLIENT;if(!client)throw Error('Connectez-vous au back-office puis rechargez cette rubrique.');const {data,error}=await client.rpc('osteo_get_my_role');if(error||data!=='admin')throw Error('La modification est réservée aux administrateurs.');}
    async function load(next){
      if(busy)return;if(dirty&&!confirm('Abandonner les modifications non enregistrées ?'))return;
      const token=++loadToken;authorized=false;slug=next;dirty=false;$('contentFields44').disabled=true;status('Chargement…');
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
  style();if(/backoffice\.html$/i.test(location.pathname))admin();else app();
})();
