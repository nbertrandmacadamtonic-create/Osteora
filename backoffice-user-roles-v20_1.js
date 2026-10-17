/* =========================================================
   OSTÉO PRATIK V20.1 — 4 RÔLES DANS LE BACK-OFFICE
   Ajout dynamique : ne modifie ni index.html ni backoffice.html.
   ========================================================= */
(function(){
  'use strict';

  const VERSION='20.1';
  const TABLE='osteo_user_profiles';
  const ROLES={
    student:'Étudiant',
    professional:'Professionnel',
    other:'Autre',
    admin:'Administrateur'
  };
  const ROLE_ORDER=['student','professional','other','admin'];

  let client=null;
  let currentUser=null;
  let profiles=new Map();
  let refreshTimer=null;
  let observer=null;

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizeRole=v=>ROLE_ORDER.includes(String(v||'').toLowerCase())?String(v).toLowerCase():'student';

  function ensureStyles(){
    if($('osteoRolesV201Styles')) return;
    const s=document.createElement('style');
    s.id='osteoRolesV201Styles';
    s.textContent=`
      .user-role-badge-v201{display:inline-flex;align-items:center;justify-content:center;min-width:74px;padding:5px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.14);font-size:10px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;margin-left:8px}
      .user-role-badge-v201.student{color:#8fc9ff;border-color:rgba(80,165,255,.32);background:rgba(80,165,255,.08)}
      .user-role-badge-v201.professional{color:#00e6a7;border-color:rgba(0,230,167,.32);background:rgba(0,230,167,.08)}
      .user-role-badge-v201.other{color:#d8b4fe;border-color:rgba(168,85,247,.32);background:rgba(168,85,247,.08)}
      .user-role-badge-v201.admin{color:#ffcf66;border-color:rgba(255,176,32,.40);background:rgba(255,176,32,.10)}
      .user-role-editor-v201{position:relative}
      .user-role-help-v201{display:block;margin-top:6px;color:#8da0b9;font-size:11px;line-height:1.35}
      .user-role-self-v201{color:#ffcf66}
      #usersRoleFilter{min-width:150px}
      #userEditor .user-identity-copy .user-role-badge-v201{margin:7px 0 0}
      .user-row [data-role-slot-v201]{display:flex;align-items:center;justify-content:flex-end}
    `;
    document.head.appendChild(s);
  }

  async function getClient(){
    if(window.OSTEO_BACKOFFICE_CLIENT) client=window.OSTEO_BACKOFFICE_CLIENT;
    if(!client){
      const cfg=window.OSTEO_SUPABASE||{};
      if(!window.supabase||!cfg.url||!cfg.anonKey) return null;
      client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    }
    try{
      const {data:{session}}=await client.auth.getSession();
      currentUser=session?.user||null;
    }catch(_){}
    return client;
  }

  function ensureRoleFilter(){
    const toolbar=$('usersFilter')?.closest('.multi-toolbar')||$('usersFilter')?.parentElement;
    if(!toolbar||$('usersRoleFilter')) return;
    const sel=document.createElement('select');
    sel.id='usersRoleFilter';
    sel.setAttribute('aria-label','Filtrer par rôle');
    sel.innerHTML='<option value="all">Tous les rôles</option>'+ROLE_ORDER.map(r=>`<option value="${r}">${ROLES[r]}</option>`).join('');
    toolbar.appendChild(sel);
    sel.addEventListener('change',()=>decorateRows());
  }

  function ensureRoleEditor(){
    const form=$('userEditor');
    const grid=$('uEmail')?.closest('.grid');
    if(!form||!grid) return;

    if(!$('uRole')){
      const label=document.createElement('label');
      label.className='user-role-editor-v201';
      label.innerHTML=`Rôle
        <select id="uRole">
          <option value="student">Étudiant</option>
          <option value="professional">Professionnel</option>
          <option value="other">Autre</option>
          <option value="admin">Administrateur</option>
        </select>
        <small class="user-role-help-v201">Seul Administrateur a accès au back-office.</small>`;
      const school=$('uSchool')?.closest('label');
      if(school?.nextSibling) grid.insertBefore(label,school.nextSibling);
      else grid.appendChild(label);
    }

    const identityCopy=form.querySelector('.user-identity-copy');
    if(identityCopy&&!$('userRoleBadgeV201')){
      const badge=document.createElement('span');
      badge.id='userRoleBadgeV201';
      badge.className='user-role-badge-v201 student';
      badge.textContent='Étudiant';
      identityCopy.appendChild(badge);
    }

    // Libellés plus généraux pour les 4 catégories de comptes.
    const editorTitle=form.closest('.multi-editor-panel')?.querySelector('.panel-head h2');
    if(editorTitle) editorTitle.textContent='Client / utilisateur';
    const selectedSmall=form.querySelector('.user-identity-copy small');
    if(selectedSmall) selectedSmall.textContent='Utilisateur sélectionné';
    const profileTitle=[...form.querySelectorAll('.section-title h3')].find(h=>/Informations étudiant/i.test(h.textContent||''));
    if(profileTitle) profileTitle.textContent='Informations utilisateur';
    if($('usersSearch')) $('usersSearch').placeholder='Rechercher un utilisateur…';

    if(!form.dataset.roleV201Bound){
      form.dataset.roleV201Bound='1';
      form.addEventListener('submit',handleRoleSubmit,true);
    }
  }

  function selectedId(){
    return document.querySelector('#usersList [data-user-id].active')?.dataset.userId||null;
  }

  function setSelectedRole(id){
    const row=profiles.get(String(id||''));
    const role=normalizeRole(row?.role);
    const select=$('uRole');
    const badge=$('userRoleBadgeV201');
    if(select){
      select.value=role;
      const own=!!(currentUser?.id&&String(currentUser.id)===String(id));
      select.disabled=own;
      const help=select.parentElement?.querySelector('.user-role-help-v201');
      if(help){
        help.textContent=own
          ? 'Votre propre compte administrateur est protégé ici pour éviter de vous bloquer.'
          : 'Seul Administrateur a accès au back-office.';
        help.classList.toggle('user-role-self-v201',own);
      }
    }
    if(badge){
      badge.textContent=ROLES[role];
      badge.className='user-role-badge-v201 '+role;
    }
  }

  function decorateRows(){
    const filter=$('usersRoleFilter')?.value||'all';
    document.querySelectorAll('#usersList [data-user-id],#statsUsersList [data-user-id]').forEach(row=>{
      const id=String(row.dataset.userId||'');
      const profile=profiles.get(id);
      if(!profile) return;
      const role=normalizeRole(profile.role);
      let slot=row.querySelector('[data-role-slot-v201]');
      if(!slot){
        slot=document.createElement('span');
        slot.dataset.roleSlotV201='1';
        // Inséré avant le statut d'abonnement pour garder les deux informations.
        const state=row.querySelector('.user-row-state');
        if(state) row.insertBefore(slot,state);
        else row.appendChild(slot);
      }
      slot.innerHTML=`<span class="user-role-badge-v201 ${role}">${esc(ROLES[role])}</span>`;
      if(row.closest('#usersList')) row.hidden=(filter!=='all'&&role!==filter);
    });

    if($('usersCount')){
      const n=profiles.size;
      $('usersCount').textContent=`${n} utilisateur${n>1?'s':''} inscrit${n>1?'s':''}`;
    }

    const id=selectedId();
    if(id) setSelectedRole(id);
  }

  async function refreshProfiles(){
    if(!(await getClient())||!currentUser) return false;
    const {data,error}=await client.from(TABLE).select('user_id,email,first_name,last_name,role,subscription_status').order('created_at',{ascending:false});
    if(error){
      console.warn('[Ostéo Pratik V20.1] Rôles utilisateurs :',error);
      return false;
    }
    profiles=new Map((data||[]).map(p=>[String(p.user_id),p]));
    decorateRows();
    return true;
  }

  async function handleRoleSubmit(event){
    const id=selectedId();
    const select=$('uRole');
    if(!id||!select||select.disabled) return;

    const role=normalizeRole(select.value);
    if(String(currentUser?.id||'')===String(id)&&role!=='admin'){
      event.preventDefault();
      event.stopImmediatePropagation();
      const status=$('userStatus');
      if(status){status.hidden=false;status.className='status';status.textContent='Votre propre rôle administrateur ne peut pas être retiré depuis cet écran.';}
      return;
    }

    if(!(await getClient())) return;
    const {error}=await client.from(TABLE).update({role,updated_at:new Date().toISOString()}).eq('user_id',id);
    if(error){
      const status=$('userStatus');
      if(status){status.hidden=false;status.className='status';status.textContent='Erreur rôle : '+error.message;}
      return;
    }
    const cached=profiles.get(String(id))||{user_id:id};
    cached.role=role;
    profiles.set(String(id),cached);
    setTimeout(()=>{decorateRows();refreshProfiles();},250);
  }

  function observeLists(){
    if(observer) return;
    observer=new MutationObserver(()=>{
      clearTimeout(refreshTimer);
      refreshTimer=setTimeout(decorateRows,30);
    });
    [$('usersList'),$('statsUsersList')].filter(Boolean).forEach(el=>observer.observe(el,{childList:true,subtree:true}));
  }

  function bindClicks(){
    $('usersList')?.addEventListener('click',e=>{
      const row=e.target.closest('[data-user-id]');
      if(row) setTimeout(()=>setSelectedRole(row.dataset.userId),40);
    });
    $('statsUsersList')?.addEventListener('click',e=>{
      const row=e.target.closest('[data-user-id]');
      if(row) setTimeout(()=>setSelectedRole(row.dataset.userId),40);
    });
    $('usersTabBtn')?.addEventListener('click',()=>setTimeout(refreshProfiles,80));
    $('statsTabBtn')?.addEventListener('click',()=>setTimeout(refreshProfiles,80));
    $('refreshUsersBtn')?.addEventListener('click',()=>setTimeout(refreshProfiles,120));
  }

  async function install(){
    ensureStyles();
    ensureRoleFilter();
    ensureRoleEditor();
    observeLists();
    bindClicks();
    await getClient();
    await refreshProfiles();

    window.addEventListener('osteo-backoffice-auth',()=>setTimeout(async()=>{
      await getClient();
      await refreshProfiles();
    },80));
  }

  window.OSTEO_BACKOFFICE_USER_ROLES_V201={
    version:VERSION,
    reload:refreshProfiles
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
