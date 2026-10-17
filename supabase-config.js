/*
  Ostéo Pratik — configuration Supabase
  Clé publique uniquement : aucune clé secrète n'est stockée ici.
*/
window.OSTEO_SUPABASE = {
  url: "https://qqcvgnerjffsgvqokluq.supabase.co",
  anonKey: "sb_publishable_yioMjVhRwG0vPJ_nupAE0w_1O8kZK6k"
};

/* === V20.0 · GARDE RÔLE ADMINISTRATEUR DU BACK-OFFICE === */
(function(){
  const path=String(location.pathname||'').toLowerCase();
  if(!path.includes('backoffice')) return;
  if(document.querySelector('script[data-osteo-admin-role-v20]')) return;
  const s=document.createElement('script');
  s.src='backoffice-role-guard-v20.js?v=20.0';
  s.defer=true;
  s.dataset.osteoAdminRoleV20='1';
  (document.head||document.documentElement).appendChild(s);
})();
