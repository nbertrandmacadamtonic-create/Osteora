/* Ostéo Pratik APP89 — choix de langue mémorisé. */
(function(){
  'use strict';
  if(window.OSTEO_LANG50)return;
  const KEY='osteo.language.app50';
  const SUPPORTED=['fr','en','es','it','de','pt'];
  function getLanguage(){
    try{const saved=localStorage.getItem(KEY);return SUPPORTED.includes(saved)?saved:'fr';}catch(_){return 'fr';}
  }
  async function setLanguage(language){
    const code=SUPPORTED.includes(language)?language:'fr';
    localStorage.setItem(KEY,code);document.documentElement.lang=code;
    window.dispatchEvent(new CustomEvent('osteo:language-changed',{detail:{language:code}}));
    return code;
  }
  async function translatePage(_slug,page){return page;}
  document.documentElement.lang=getLanguage();
  window.OSTEO_LANG50={version:'89.0',supported:SUPPORTED,getLanguage,setLanguage,translatePage};
})();
