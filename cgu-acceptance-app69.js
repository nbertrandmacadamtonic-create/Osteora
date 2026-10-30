/* Ostéo Pratik APP69 — acceptation obligatoire des CGU bêta. */
(function(){
  'use strict';
  if(window.OSTEO_CGU_APP69)return;
  const VERSION='beta-1-2026-10-30';
  const TITLE='Conditions générales d’utilisation — version bêta';
  const TEXT=`CONDITIONS GÉNÉRALES D’UTILISATION — VERSION BÊTA

Version bêta 1 — 30 octobre 2026

1. Éditeur

L’application Ostéo Pratik est actuellement proposée dans le cadre d’une phase de test privée.

Éditeur : Nicolas Bertrand
Adresse, coordonnées juridiques et contact : à compléter avant l’ouverture publique du service.

2. Objet de l’application

Ostéo Pratik propose des vidéos, fiches, cartes, contenus audio, questionnaires et outils de révision consacrés aux techniques ostéopathiques.

Ces contenus ont une finalité exclusivement pédagogique et informative. Ils ne constituent ni un avis médical, ni un diagnostic, ni une prescription, ni une recommandation personnalisée de prise en charge.

3. Accès à la version bêta

La version bêta est une version de test susceptible de comporter des erreurs, des interruptions, des fonctions incomplètes ou des contenus en cours de modification.

L’accès peut être modifié, suspendu ou interrompu afin d’assurer la maintenance, la sécurité ou l’évolution de l’application. Les testeurs sont invités à signaler les anomalies rencontrées.

4. Public concerné

L’application s’adresse principalement aux étudiants en ostéopathie, aux ostéopathes et aux professionnels disposant d’une formation adaptée.

La consultation de l’application ne confère aucune qualification, autorisation d’exercice ou certification professionnelle.

L’utilisateur doit s’assurer qu’il possède les connaissances, compétences, diplômes et autorisations nécessaires avant toute mise en pratique.

5. Responsabilité professionnelle et utilisation des techniques

Les contenus d’Ostéo Pratik ne remplacent pas une formation pratique supervisée, l’expérience professionnelle, l’examen clinique du patient ou le respect des règles professionnelles applicables.

L’utilisateur demeure seul responsable de l’appréciation de ses compétences et de sa capacité à utiliser les techniques présentées.

Avant tout acte, il lui appartient notamment :

- de réaliser un examen clinique adapté ;
- de vérifier les indications et contre-indications ;
- d’évaluer les risques et précautions nécessaires ;
- d’adapter son intervention à la situation du patient ;
- de recueillir le consentement libre et éclairé du patient ;
- de s’abstenir ou d’orienter le patient vers un professionnel compétent lorsque la situation dépasse ses compétences.

Toute décision clinique, tout diagnostic, toute sélection, adaptation ou exécution d’une technique et tout acte réalisé par l’utilisateur relèvent de sa responsabilité professionnelle personnelle.

Ostéo Pratik, son éditeur, ses auteurs et ses contributeurs ne dirigent ni ne supervisent les actes accomplis par les utilisateurs. Dans les limites autorisées par la loi, ils ne sauraient être tenus responsables des conséquences résultant d’une utilisation inappropriée, imprudente, non conforme ou réalisée par une personne insuffisamment qualifiée.

Aucune disposition des présentes conditions ne peut exclure ou limiter une responsabilité qui ne pourrait légalement l’être, notamment en cas de manquement de l’éditeur à ses propres obligations.

6. Exactitude et évolution des contenus

Les contenus sont préparés avec soin, mais peuvent contenir des erreurs, omissions ou informations nécessitant une actualisation.

L’utilisateur doit conserver son esprit critique, confronter les informations à sa formation et aux connaissances professionnelles actualisées, et ne pas utiliser l’application comme source unique pour prendre une décision clinique.

Les contenus et fonctionnalités peuvent être corrigés, complétés, remplacés ou supprimés pendant la phase bêta.

7. Comportements interdits

Il est notamment interdit :

- de présenter l’application comme délivrant un diagnostic ou une prescription ;
- d’utiliser les contenus pour réaliser des actes sans qualification adaptée ;
- de reproduire, vendre, diffuser ou mettre à disposition les contenus sans autorisation ;
- de contourner les protections ou les restrictions d’accès ;
- de perturber le fonctionnement ou la sécurité de l’application ;
- d’utiliser le compte d’une autre personne ou de partager ses identifiants.

8. Compte utilisateur

L’utilisateur est responsable de la confidentialité de ses identifiants et des activités effectuées depuis son compte.

Il doit fournir des informations exactes et signaler rapidement toute utilisation non autorisée.

L’accès d’un utilisateur peut être suspendu en cas d’utilisation dangereuse, frauduleuse ou contraire aux présentes conditions.

9. Données personnelles

Les informations relatives aux comptes, à la progression et à l’utilisation de l’application sont traitées pour permettre le fonctionnement et le test du service.

Une politique de confidentialité distincte précisera l’identité du responsable du traitement, les données collectées, les finalités, les bases légales, les destinataires, les durées de conservation et les droits des utilisateurs.

L’acceptation des présentes CGU ne vaut pas consentement à des traitements facultatifs de données personnelles ou à des traceurs non indispensables.

10. Propriété intellectuelle

Sauf indication contraire, les textes, vidéos, images, illustrations, sons, questionnaires, cartes, marques, logos, éléments graphiques et logiciels de l’application sont protégés.

L’utilisateur bénéficie uniquement d’un droit personnel, limité et non transférable de consultation pendant la durée de son accès.

11. Signalement

Toute erreur, anomalie, utilisation dangereuse ou atteinte aux droits peut être signalée à l’adresse de contact qui sera indiquée par l’éditeur.

12. Modification des CGU

Les présentes CGU peuvent évoluer pendant la phase bêta.

En cas de modification importante, l’application présentera la nouvelle version à l’utilisateur et demandera une nouvelle acceptation avant la poursuite de l’utilisation.

13. Acceptation

Avant d’accéder à l’application, l’utilisateur doit pouvoir consulter les présentes CGU et cocher lui-même une case non précochée portant la mention :

« J’ai lu et j’accepte les Conditions générales d’utilisation, notamment les règles relatives à l’usage professionnel des techniques et à ma responsabilité personnelle. »

L’application conserve la version acceptée ainsi que la date et l’heure de cette acceptation.

14. Droit applicable

Les présentes CGU sont soumises au droit français, sous réserve des dispositions impératives applicables.

Les voies de recours et les juridictions compétentes sont déterminées conformément aux règles légales applicables.
`;
  const $=id=>document.getElementById(id);
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
  let checking=false,currentUser=null;
  function client(){return window.OSTEO_APP_AUTH_CLIENT||window.OSTEO_BACKOFFICE_CLIENT||null;}
  function user(){return window.OSTEO_AUTH?.getSession?.()?.user||null;}
  function styles(){
    if($('opCguStyle69'))return;
    const s=node('style');s.id='opCguStyle69';s.textContent=`
      html.op-cgu-lock69,html.op-cgu-lock69 body{overflow:hidden!important}
      #opCguDialog69{width:min(720px,calc(100% - 24px));max-height:calc(100dvh - 24px);padding:0;border:1px solid #286078;border-radius:22px;color:#edf6ff;background:#081528;box-shadow:0 24px 80px #000c}
      #opCguDialog69::backdrop{background:#020815f2}
      .op-cgu69{display:grid;grid-template-rows:auto minmax(0,1fr) auto;max-height:calc(100dvh - 24px)}
      .op-cgu69 header{padding:20px 22px 14px;border-bottom:1px solid #27465d}.op-cgu69 h1{margin:0 0 6px;font-size:24px}.op-cgu69 header p{margin:0;color:#a9c5d8}
      .op-cgu-text69{overflow:auto;padding:20px 22px;scrollbar-width:none}.op-cgu-text69::-webkit-scrollbar{display:none}.op-cgu-text69 p{white-space:pre-line;line-height:1.65;margin:0}
      .op-cgu-actions69{padding:16px 22px 20px;border-top:1px solid #27465d;background:#081528}.op-cgu-check69{display:flex;gap:12px;align-items:flex-start;line-height:1.45}.op-cgu-check69 input{width:22px;height:22px;flex:0 0 auto}
      .op-cgu-buttons69{display:flex;gap:10px;justify-content:flex-end;margin-top:15px;flex-wrap:wrap}.op-cgu-buttons69 button{min-height:46px;padding:11px 16px;border-radius:12px;border:1px solid #31516a;font:inherit;cursor:pointer}.op-cgu-accept69{background:#57d9ef;color:#001b27;font-weight:700}.op-cgu-accept69:disabled{opacity:.45;cursor:not-allowed}.op-cgu-exit69{background:transparent;color:#d8eaf5}.op-cgu-status69{min-height:1.4em;margin:10px 0 0;color:#ffb7b7}
      @media(max-width:480px){#opCguDialog69{width:calc(100% - 12px);max-height:calc(100dvh - 12px)}.op-cgu69{max-height:calc(100dvh - 12px)}.op-cgu69 header,.op-cgu-text69,.op-cgu-actions69{padding-left:16px;padding-right:16px}.op-cgu69 h1{font-size:21px}}
    `;document.head.appendChild(s);
  }
  function close(){const d=$('opCguDialog69');if(d?.open)d.close();document.documentElement.classList.remove('op-cgu-lock69');}
  function show(c,u){
    styles();let d=$('opCguDialog69');if(!d){d=node('dialog');d.id='opCguDialog69';d.addEventListener('cancel',e=>e.preventDefault());document.body.appendChild(d);}
    const root=node('section',null,'op-cgu69'),head=node('header'),title=node('h1',TITLE),sub=node('p','Vous devez accepter cette version pour continuer.'),body=node('div',null,'op-cgu-text69'),actions=node('footer',null,'op-cgu-actions69'),label=node('label',null,'op-cgu-check69'),check=node('input'),copy=node('span','J’ai lu et j’accepte les Conditions générales d’utilisation, notamment les règles relatives à l’usage professionnel des techniques et à ma responsabilité personnelle.'),buttons=node('div',null,'op-cgu-buttons69'),exit=node('button','Se déconnecter','op-cgu-exit69'),accept=node('button','Accepter et continuer','op-cgu-accept69'),status=node('p','', 'op-cgu-status69');
    check.type='checkbox';check.checked=false;accept.type='button';accept.disabled=true;exit.type='button';label.append(check,copy);body.append(node('p',TEXT));buttons.append(exit,accept);actions.append(label,status,buttons);head.append(title,sub);root.append(head,body,actions);d.replaceChildren(root);
    check.onchange=()=>{accept.disabled=!check.checked;status.textContent='';};
    exit.onclick=async()=>{exit.disabled=true;accept.disabled=true;await c.auth.signOut();close();if(typeof window.go==='function')window.go('welcome');};
    accept.onclick=async()=>{if(!check.checked)return;accept.disabled=true;exit.disabled=true;status.textContent='Enregistrement…';const payload={user_id:u.id,cgu_version:VERSION};const {error}=await c.from('osteo_cgu_acceptances').upsert(payload,{onConflict:'user_id,cgu_version'});if(error){status.textContent='Validation impossible. Vérifiez votre connexion et réessayez.';accept.disabled=false;exit.disabled=false;return;}close();};
    document.documentElement.classList.add('op-cgu-lock69');if(!d.open)d.showModal();check.focus();
  }
  async function verify(){
    if(checking)return;const c=client(),u=user();if(!c||!u){currentUser=null;close();return;}if(currentUser===u.id&&$('opCguDialog69')?.open)return;
    checking=true;currentUser=u.id;try{const {data,error}=await c.from('osteo_cgu_acceptances').select('accepted_at').eq('user_id',u.id).eq('cgu_version',VERSION).maybeSingle();if(error)throw error;if(!data)show(c,u);else close();}catch(_){show(c,u);}finally{checking=false;}
  }
  function start(){verify();const timer=setInterval(()=>{if(client()&&window.OSTEO_AUTH){clearInterval(timer);verify();const c=client();c?.auth?.onAuthStateChange?.(()=>setTimeout(verify,0));}},400);setTimeout(()=>clearInterval(timer),30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)verify();});}
  window.OSTEO_CGU_APP69={version:VERSION,title:TITLE,text:TEXT,verify};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
