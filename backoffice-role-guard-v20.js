/* =========================================================
   OSTÉO PRATIK V20.0 — GARDE D'ACCÈS BACK-OFFICE
   UI : bloque les comptes non administrateurs.
   Sécurité réelle : assurée en plus par les RLS Supabase V20.
   ========================================================= */
(function(){
  'use strict';

  const VERSION='20.0';
  let client=null;
  let checkSerial=0;

  function ensureStyles(){
    if(document.getElementById('osteoAdminGuardV20Styles')) return;
    const style=document.createElement('style');
    style.id='osteoAdminGuardV20Styles';
    style.textContent=`
      #osteoAdminGuardV20{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 10%,rgba(0,229,255,.10),transparent 32%),#05101f;color:#eef7ff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #osteoAdminGuardV20[hidden]{display:none!important}
      #osteoAdminGuardV20 .op-card{width:min(470px,100%);padding:28px;border-radius:28px;border:1px solid rgba(111,213,255,.22);background:linear-gradient(145deg,rgba(10,29,55,.96),rgba(5,15,31,.98));box-shadow:0 28px 90px rgba(0,0,0,.48);text-align:center}
      #osteoAdminGuardV20 .op-mark{width:62px;height:62px;margin:0 auto 16px;border-radius:20px;display:grid;place-items:center;border:1px solid rgba(0,229,255,.35);background:rgba(0,229,255,.08);color:#00e5ff;font-size:28px;font-weight:900}
      #osteoAdminGuardV20 h1{margin:0 0 8px;font-size:25px;line-height:1.1;color:#fff}
      #osteoAdminGuardV20 p{margin:0;color:#9fb0c7;line-height:1.55;font-size:14px}
      #osteoAdminGuardV20 .op-actions{display:grid;gap:9px;margin-top:20px}
      #osteoAdminGuardV20 button,#osteoAdminGuardV20 a{min-height:46px;border-radius:15px;border:1px solid rgba(170,205,225,.20);display:flex;align-items:center;justify-content:center;text-decoration:none;font-weight:800;font-size:14px;cursor:pointer}
      #osteoAdminGuardV20 .op-primary{background:rgba(0,229,255,.10);border-color:rgba(0,229,255,.38);color:#00e5ff}
      #osteoAdminGuardV20 .op-secondary{background:rgba(255,255,255,.035);color:#d8e5f4}
      #osteoAdminBadgeV20{position:fixed;right:14px;bottom:14px;z-index:99999;padding:8px 11px;border-radius:999px;border:1px solid rgba(0,230,167,.34);background:rgba(5,20,31,.92);color:#00e6a7;font:800 11px/1.1 Inter,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.28)}
    `;
    document.head.appendChild(style);
  }

  function guard(){
    ensureStyles();
    let el=document.getElementById('osteoAdminGuardV20');
    if(el) return el;
    el=document.createElement('div');
    el.id='osteoAdminGuardV20';
    el.innerHTML='<div class="op-card"><div class="op-mark">⌁</div><h1>Vérification de l’accès</h1><p>Contrôle du rôle administrateur…</p></div>';
    (document.body||document.documentElement).appendChild(el);
    return el;
  }

  function hideGuard(){
    const el=document.getElementById('osteoAdminGuardV20');
    if(el) el.hidden=true;
  }

  function showChecking(){
    const el=guard();
    el.hidden=false;
    el.innerHTML='<div class="op-card"><div class="op-mark">⌁</div><h1>Vérification de l’accès</h1><p>Contrôle du rôle administrateur…</p></div>';
  }

  function showDenied(email){
    const el=guard();
    el.hidden=false;
    el.innerHTML=`
      <div class="op-card">
        <div class="op-mark">♙</div>
        <h1>Compte étudiant</h1>
        <p>${email?'<b style="color:#fff">'+escapeHtml(email)+'</b><br>':''}L’accès au back-office est réservé aux administrateurs Ostéo Pratik.</p>
        <div class="op-actions">
          <a class="op-primary" href="index.html">Retour à Ostéo Pratik</a>
          <button class="op-secondary" type="button" data-osteo-admin-signout>Se déconnecter</button>
        </div>
      </div>`;
    el.querySelector('[data-osteo-admin-signout]')?.addEventListener('click',async()=>{
      try{if(client) await client.auth.signOut();}catch(_){}
      location.reload();
    });
  }

  function showError(){
    const el=guard();
    el.hidden=false;
    el.innerHTML=`
      <div class="op-card">
        <div class="op-mark">!</div>
        <h1>Rôle administrateur non vérifié</h1>
        <p>La sécurité V20 n’a pas pu confirmer ce compte. Vérifiez que le script SQL V20 a bien été exécuté dans Supabase.</p>
        <div class="op-actions"><a class="op-primary" href="index.html">Retour à Ostéo Pratik</a></div>
      </div>`;
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function setAdminBadge(show){
    let b=document.getElementById('osteoAdminBadgeV20');
    if(!show){if(b)b.remove();return;}
    if(b)return;
    b=document.createElement('div');
    b.id='osteoAdminBadgeV20';
    b.textContent='● Administrateur';
    (document.body||document.documentElement).appendChild(b);
  }

  async function getClient(){
    for(let i=0;i<100;i++){
      if(window.OSTEO_BACKOFFICE_CLIENT){client=window.OSTEO_BACKOFFICE_CLIENT;return client;}
      await new Promise(r=>setTimeout(r,40));
    }

    // Repli : normalement backoffice.js a déjà créé ce client.
    const cfg=window.OSTEO_SUPABASE||{};
    if(!window.supabase||!cfg.url||!cfg.anonKey) return null;
    client=window.supabase.createClient(cfg.url,cfg.anonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    return client;
  }

  async function verify(){
    const run=++checkSerial;
    showChecking();
    if(!client) client=await getClient();
    if(run!==checkSerial) return;
    if(!client){setAdminBadge(false);showError();return;}

    try{
      const {data:{session}}=await client.auth.getSession();
      if(run!==checkSerial) return;

      // Non connecté : laisser le formulaire de connexion du back-office visible.
      if(!session?.user?.id){
        setAdminBadge(false);
        hideGuard();
        return;
      }

      const {data,error}=await client.rpc('osteo_get_my_role');
      if(error) throw error;
      if(run!==checkSerial) return;
      const role=String(data||'student').toLowerCase();
      if(role==='admin'){
        setAdminBadge(true);
        hideGuard();
      }else{
        setAdminBadge(false);
        showDenied(session.user.email||'');
      }
    }catch(error){
      console.warn('[Ostéo Pratik V20] Contrôle administrateur',error);
      setAdminBadge(false);
      showError();
    }
  }

  async function install(){
    guard();
    client=await getClient();
    if(client){
      client.auth.onAuthStateChange(()=>setTimeout(verify,0));
    }
    window.addEventListener('osteo-backoffice-auth',()=>setTimeout(verify,20));
    await verify();
  }

  window.OSTEO_BACKOFFICE_ROLE_GUARD_V20={version:VERSION,recheck:verify};

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
