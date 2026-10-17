/* =========================================================
   OSTÉO PRATIK V20.0 — RÔLE DU COMPTE
   Couche indépendante : ne modifie aucun écran de l'application.
   ========================================================= */
(function(){
  'use strict';

  const VERSION='20.0';
  let client=null;
  let session=null;
  let role='anonymous';
  let serial=0;

  function dispatch(){
    const detail={
      role,
      isAdmin:role==='admin',
      userId:session?.user?.id||null
    };
    try{document.documentElement.dataset.osteoRole=role;}catch(_){}
    window.dispatchEvent(new CustomEvent('osteo-role-loaded',{detail}));
  }

  async function waitForClient(){
    for(let i=0;i<120;i++){
      client=window.OSTEO_APP_AUTH_CLIENT||client;
      if(client) return client;
      await new Promise(r=>setTimeout(r,50));
    }
    return null;
  }

  async function loadRole(){
    const run=++serial;
    client=window.OSTEO_APP_AUTH_CLIENT||client;
    if(!client){
      client=await waitForClient();
      if(!client){role='anonymous';session=null;dispatch();return role;}
    }

    try{
      const {data:{session:nextSession}}=await client.auth.getSession();
      if(run!==serial) return role;
      session=nextSession||null;
      if(!session?.user?.id){role='anonymous';dispatch();return role;}

      const {data,error}=await client.rpc('osteo_get_my_role');
      if(error) throw error;
      if(run!==serial) return role;
      role=String(data||'student').toLowerCase()==='admin'?'admin':'student';
      dispatch();
      return role;
    }catch(error){
      console.warn('[Ostéo Pratik V20] Lecture du rôle impossible : rôle étudiant appliqué par sécurité.',error);
      role=session?.user?.id?'student':'anonymous';
      dispatch();
      return role;
    }
  }

  async function install(){
    client=await waitForClient();
    if(!client){role='anonymous';dispatch();return;}

    client.auth.onAuthStateChange((_event,newSession)=>{
      session=newSession||null;
      if(!session){++serial;role='anonymous';dispatch();return;}
      setTimeout(loadRole,0);
    });

    await loadRole();
  }

  window.OSTEO_USER_ROLE_V20={
    version:VERSION,
    reload:loadRole,
    getRole:()=>role,
    isAdmin:()=>role==='admin'
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
