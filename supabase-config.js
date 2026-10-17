/*
  Ostéo Pratik — configuration Supabase
  Clé publique uniquement : aucune clé secrète n'est stockée ici.
*/
window.OSTEO_SUPABASE = {
  url: "https://qqcvgnerjffsgvqokluq.supabase.co",
  anonKey: "sb_publishable_yioMjVhRwG0vPJ_nupAE0w_1O8kZK6k"
};

/* === V20.1 · CHARGEMENT DES RÔLES === */
(function(){
  const path=String(location.pathname||'').toLowerCase();

  function load(src,marker,where){
    if(document.querySelector(`script[${marker}]`)) return;
    const s=document.createElement('script');
    s.src=src;
    s.defer=true;
    s.setAttribute(marker,'1');
    (where==='body'?(document.body||document.documentElement):(document.head||document.documentElement)).appendChild(s);
  }

  if(path.includes('backoffice')){
    // Garde d'accès V20 : seul admin entre dans le back-office.
    load('backoffice-role-guard-v20.js?v=20.0','data-osteo-admin-role-v20','head');
    // V20.1 : affichage + édition des 4 rôles dans Utilisateurs.
    load('backoffice-user-roles-v20_1.js?v=20.1','data-osteo-user-roles-v201','head');
  }else{
    // Charge V20.1 avant le bridge ; le marqueur empêche le bridge de
    // recharger l'ancienne version V20.0 avec son ancien cache.
    load('user-role-v20.js?v=20.1','data-osteo-user-role-v20','head');
  }
})();
