/* Ostéo Pratik — configuration Supabase */
window.OSTEO_SUPABASE = {
  url: "https://qqcvgnerjffsgvqokluq.supabase.co",
  anonKey: "sb_publishable_yioMjVhRwG0vPJ_nupAE0w_1O8kZK6k"
};
(function(){
  const path=String(location.pathname||'').toLowerCase();
  function load(src,marker){if(document.querySelector(`script[${marker}]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(marker,'1');(document.head||document.documentElement).appendChild(s);}
  if(path.includes('backoffice')){
    load('backoffice-role-guard-v20.js?v=20.0','data-osteo-admin-role-v20');
    load('backoffice-user-roles-v20_4.js?v=20.4','data-osteo-user-roles-v204');
  }else{
    load('signup-roles-v20_4.js?v=20.4','data-osteo-signup-roles-v204');
    load('user-role-v20.js?v=20.4','data-osteo-user-role-v20');
  }
})();
