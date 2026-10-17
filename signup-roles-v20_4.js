/* OSTÉO PRATIK V20.4 — RÔLES À L'INSCRIPTION */
(function(){
  'use strict';
  const OPTIONS=[['student','Étudiant'],['professional','Professionnel'],['teacher','Enseignant'],['other','Autre']];
  function apply(){
    const sel=document.getElementById('signupProfile'); if(!sel)return false;
    const current=String(sel.value||'').toLowerCase();
    const map={'étudiant en ostéopathie':'student','etudiant en osteopathie':'student','student':'student','praticien':'professional','professionnel':'professional','professional':'professional','enseignant':'teacher','teacher':'teacher','autre':'other','other':'other'};
    const wanted=map[current]||'student';
    const sig=OPTIONS.map(x=>x[0]).join('|');
    if(sel.dataset.roleOptionsV204!==sig){sel.innerHTML=OPTIONS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');sel.dataset.roleOptionsV204=sig;}
    sel.value=wanted;
    return true;
  }
  function install(){apply();new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});}
  window.OSTEO_SIGNUP_ROLES_V204={version:'20.4',apply};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
