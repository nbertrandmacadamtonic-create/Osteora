(function(){
  'use strict';
  const PROFILES='osteo_user_profiles';
  const ACTIVITY='osteo_user_activity';
  const TECHNIQUES='osteo_techniques';
  const $=id=>document.getElementById(id);

  let client=null;
  let currentUser=null;
  let profiles=[];
  let selectedUserId=null;
  let activities=[];
  let totalTechniques=0;
  let currentWorkspace='techniques';

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function initials(p){const a=(p.first_name||'').trim()[0]||'';const b=(p.last_name||'').trim()[0]||'';return (a+b||String(p.email||'OP').slice(0,2)).toUpperCase();}
  function nameOf(p){return [p.first_name,p.last_name].filter(Boolean).join(' ').trim() || p.email || 'Utilisateur';}
  function statusLabel(s){return ({actif:'Abonnement actif',expire_bientot:'Expire bientôt',expire:'Abonnement expiré',inactif:'Inactif'})[s]||'Inactif';}
  function paymentLabel(s){return ({paye:'Payé',en_attente:'En attente',impaye:'Impayé',gratuit:'Gratuit / offert'})[s]||'En attente';}
  function showStatus(id,text,mode=''){const el=$(id); if(!el)return; el.hidden=false;el.textContent=text;el.className='status '+mode;}

  async function getClient(){
    if(window.OSTEO_BACKOFFICE_CLIENT) client=window.OSTEO_BACKOFFICE_CLIENT;
    if(!client){
      const c=window.OSTEO_SUPABASE||{};
      if(!window.supabase||!c.url||!c.anonKey) return null;
      client=window.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    }
    const {data:{session}}=await client.auth.getSession();
    currentUser=session?.user||null;
    return client;
  }

  function setWorkspace(mode){
    currentWorkspace=mode;
    const tech=mode==='techniques', quiz=mode==='quiz', users=mode==='users', stats=mode==='stats';
    const techPanel=document.querySelector('.techniques-panel');
    const editorPanel=document.querySelector('.editor-panel');
    if(techPanel) techPanel.hidden=!tech;
    if(editorPanel) editorPanel.hidden=!tech;
    if($('quizWorkspace')) $('quizWorkspace').hidden=!quiz;
    if($('usersWorkspace')) $('usersWorkspace').hidden=!users;
    if($('statsWorkspace')) $('statsWorkspace').hidden=!stats;
    document.querySelectorAll('[data-workspace]').forEach(btn=>btn.classList.toggle('active',btn.dataset.workspace===mode));
    if(users) loadProfiles().then(()=>{renderUsers(); if(selectedUserId) openUser(selectedUserId);});
    if(stats) loadProfiles().then(async()=>{renderStatsUsers(); if(!selectedUserId && profiles[0]) selectedUserId=profiles[0].user_id; if(selectedUserId) await openStats(selectedUserId);});
  }

  async function loadProfiles(){
    if(!(await getClient())) return false;
    const {data,error}=await client.from(PROFILES).select('*').order('created_at',{ascending:false});
    if(error){
      const message='Base Utilisateurs non configurée. Exécutez supabase-users-stats-v13.sql dans Supabase.';
      if($('usersList')) $('usersList').innerHTML='<div class="warning">'+message+'</div>';
      if($('statsUsersList')) $('statsUsersList').innerHTML='<div class="warning">'+message+'</div>';
      return false;
    }
    profiles=data||[];
    $('usersCount').textContent=`${profiles.length} étudiant${profiles.length>1?'s':''} inscrit${profiles.length>1?'s':''}`;
    renderUsers(); renderStatsUsers();
    return true;
  }

  function userRow(p,active=false){
    const state=p.subscription_status||'inactif';
    return `<button type="button" class="user-row ${active?'active':''}" data-user-id="${p.user_id}">
      <span class="user-row-avatar">${esc(initials(p))}</span>
      <span><strong>${esc(nameOf(p))}</strong><small>${esc(p.email||'')}</small></span>
      <span class="user-row-state ${esc(state)}"><i></i>${esc(statusLabel(state))}</span>
    </button>`;
  }

  function filteredProfiles(searchId,filterId){
    const q=($(searchId)?.value||'').trim().toLowerCase();
    const filter=filterId?($(filterId)?.value||'all'):'all';
    return profiles.filter(p=>{
      const hay=[p.first_name,p.last_name,p.email,p.school,p.student_year].join(' ').toLowerCase();
      return (!q||hay.includes(q)) && (filter==='all'||p.subscription_status===filter);
    });
  }

  function renderUsers(){
    const rows=filteredProfiles('usersSearch','usersFilter');
    $('usersList').innerHTML=rows.length?rows.map(p=>userRow(p,p.user_id===selectedUserId)).join(''):'<div class="empty">Aucun utilisateur.</div>';
    $('usersList').querySelectorAll('[data-user-id]').forEach(b=>b.addEventListener('click',()=>openUser(b.dataset.userId)));
  }
  function renderStatsUsers(){
    const rows=filteredProfiles('statsUsersSearch');
    $('statsUsersList').innerHTML=rows.length?rows.map(p=>userRow(p,p.user_id===selectedUserId)).join(''):'<div class="empty">Aucun utilisateur.</div>';
    $('statsUsersList').querySelectorAll('[data-user-id]').forEach(b=>b.addEventListener('click',()=>openStats(b.dataset.userId)));
  }

  function fillUserEditor(p){
    $('userEditorEmpty').hidden=true;$('userEditor').hidden=false;
    $('uEmail').value=p.email||'';$('uFirstName').value=p.first_name||'';$('uLastName').value=p.last_name||'';$('uStudentYear').value=p.student_year||'';$('uSchool').value=p.school||'';
    $('uSubscriptionStatus').value=p.subscription_status||'inactif';$('uSubscriptionPlan').value=p.subscription_plan||'';$('uSubscriptionExpires').value=p.subscription_expires_at||'';$('uPaymentStatus').value=p.payment_status||'en_attente';$('uAdminNotes').value=p.admin_notes||'';
    $('userAvatar').textContent=initials(p);$('userDisplayName').textContent=nameOf(p);$('userDisplayEmail').textContent=p.email||'';
    const badge=$('userSubscriptionBadge');badge.textContent=statusLabel(p.subscription_status);badge.className='subscription-badge '+(p.subscription_status||'inactif');
    $('userStatus').hidden=true;
  }
  function openUser(id){selectedUserId=id;const p=profiles.find(x=>x.user_id===id);if(!p)return;fillUserEditor(p);renderUsers();}

  async function saveUser(e){
    e.preventDefault(); if(!selectedUserId||!(await getClient())) return;
    const patch={
      first_name:$('uFirstName').value.trim(),last_name:$('uLastName').value.trim(),student_year:$('uStudentYear').value.trim(),school:$('uSchool').value.trim(),subscription_status:$('uSubscriptionStatus').value,subscription_plan:$('uSubscriptionPlan').value.trim(),subscription_expires_at:$('uSubscriptionExpires').value||null,payment_status:$('uPaymentStatus').value,admin_notes:$('uAdminNotes').value,updated_at:new Date().toISOString()
    };
    const {error}=await client.from(PROFILES).update(patch).eq('user_id',selectedUserId);
    if(error){showStatus('userStatus','Erreur : '+error.message);return;}
    showStatus('userStatus','Client enregistré dans Supabase.','ok');
    await loadProfiles();openUser(selectedUserId);
  }

  async function loadStatsData(id){
    if(!(await getClient())) return false;
    const [act,techCount]=await Promise.all([
      client.from(ACTIVITY).select('id,user_id,event_type,technique_id,quiz_slug,zone,score,max_score,metadata,occurred_at').eq('user_id',id).order('occurred_at',{ascending:false}).limit(2000),
      client.from(TECHNIQUES).select('id',{count:'exact',head:true})
    ]);
    if(act.error){
      $('statsActivityList').innerHTML='<div class="warning">Table d’activité non configurée. Exécutez supabase-users-stats-v13.sql.</div>';
      return false;
    }
    activities=act.data||[]; totalTechniques=techCount.count||0; return true;
  }

  function timeAgo(value){
    if(!value) return '—'; const d=new Date(value); const s=Math.max(0,(Date.now()-d.getTime())/1000);
    if(s<60)return 'À l’instant'; if(s<3600)return `Il y a ${Math.floor(s/60)} min`; if(s<86400)return `Il y a ${Math.floor(s/3600)} h`; if(s<172800)return 'Hier'; return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  }
  function activityTitle(a){
    if(a.event_type==='quiz_completed') return `Quiz terminé${a.quiz_slug?' · '+a.quiz_slug:''}`;
    if(a.event_type==='technique_view') return `Technique consultée${a.technique_id?' · #'+a.technique_id:''}`;
    if(a.event_type==='login') return 'Connexion';
    return a.event_type||'Activité';
  }

  function renderStats(p){
    $('statsAvatar').textContent=initials(p);$('statsName').textContent=nameOf(p);$('statsEmail').textContent=p.email||'';$('statsSubscription').textContent=statusLabel(p.subscription_status);$('statsPlan').textContent=p.subscription_plan||paymentLabel(p.payment_status);
    const last=activities[0];$('statsLastActivityTop').textContent=last?timeAgo(last.occurred_at):'—';$('statsLastActivityType').textContent=last?activityTitle(last):'Aucune donnée';

    const viewed=[...new Set(activities.filter(a=>a.event_type==='technique_view'&&a.technique_id!=null).map(a=>String(a.technique_id)))];
    const progress=totalTechniques?Math.min(100,Math.round(viewed.length/totalTechniques*100)):0;
    $('statProgress').textContent=progress+'%';$('statProgressBar').style.width=progress+'%';$('statProgressCaption').textContent=`${viewed.length} / ${totalTechniques||'—'} techniques consultées`;

    const quiz=activities.filter(a=>a.event_type==='quiz_completed'&&Number(a.max_score)>0);const totalScore=quiz.reduce((n,a)=>n+(Number(a.score)||0),0);const maxScore=quiz.reduce((n,a)=>n+(Number(a.max_score)||0),0);const rate=maxScore?Math.round(totalScore/maxScore*100):0;
    $('statQuizRate').textContent=rate+'%';$('statQuizBar').style.width=rate+'%';$('statQuizCaption').textContent=`${quiz.length} quiz terminé${quiz.length>1?'s':''}`;

    const cutoff=Date.now()-30*86400000;const days=new Set(activities.filter(a=>new Date(a.occurred_at).getTime()>=cutoff).map(a=>new Date(a.occurred_at).toISOString().slice(0,10)));
    $('statActiveDays').textContent=days.size;$('statLastActivity').textContent=last?timeAgo(last.occurred_at):'—';$('statLastCaption').textContent=last?activityTitle(last):'Aucune activité';

    const zoneCounts={};activities.forEach(a=>{const z=String(a.zone||'').trim();if(z)zoneCounts[z]=(zoneCounts[z]||0)+1;});const zoneTotal=Object.values(zoneCounts).reduce((a,b)=>a+b,0)||1;
    const zones=Object.entries(zoneCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    $('statsZoneBars').innerHTML=zones.length?zones.map(([z,n])=>{const pct=Math.round(n/zoneTotal*100);return `<div class="zone-row"><span>${esc(z)}</span><span class="bar"><i style="width:${pct}%"></i></span><b>${pct}%</b></div>`;}).join(''):'<div class="empty">Aucune donnée de zone.</div>';

    const perf={};quiz.forEach(a=>{const z=String(a.zone||'Non classé');if(!perf[z])perf[z]={score:0,max:0};perf[z].score+=Number(a.score)||0;perf[z].max+=Number(a.max_score)||0;});
    const perfRows=Object.entries(perf).map(([z,v])=>[z,v.max?Math.round(v.score/v.max*100):0]).sort((a,b)=>b[1]-a[1]);
    $('statsPerformanceBars').innerHTML=perfRows.length?perfRows.map(([z,pct])=>`<div class="performance-row"><span>${esc(z)}</span><span class="bar"><i style="width:${pct}%"></i></span><b>${pct}%</b></div>`).join(''):'<div class="empty">Aucun résultat de quiz.</div>';

    $('statsActivityList').innerHTML=activities.length?activities.slice(0,12).map(a=>`<div class="activity-item ${a.event_type==='quiz_completed'?'quiz':''}"><i></i><time>${esc(timeAgo(a.occurred_at))}</time><strong>${esc(activityTitle(a))}</strong><span>${a.zone?esc(a.zone):''}${a.max_score?` · ${esc(a.score)}/${esc(a.max_score)}`:''}</span></div>`).join(''):'<div class="empty">Aucune activité enregistrée.</div>';

    renderTimeline();
  }

  function renderTimeline(){
    const events=activities.filter(a=>a.event_type==='technique_view'&&a.technique_id!=null).slice().sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at));
    if(!events.length||!totalTechniques){$('statsTimeline').innerHTML='<div class="empty">La courbe apparaîtra après les premières consultations de techniques.</div>';return;}
    const W=560,H=190,pad=28;const seen=new Set();const pts=[];events.forEach(a=>{seen.add(String(a.technique_id));pts.push({d:new Date(a.occurred_at),v:Math.min(100,seen.size/totalTechniques*100)});});
    const min=pts[0].d.getTime(),max=Math.max(min+86400000,pts[pts.length-1].d.getTime());const x=t=>pad+(t-min)/(max-min)*(W-pad*2);const y=v=>H-pad-v/100*(H-pad*2);const coords=pts.map(p=>[x(p.d.getTime()),y(p.v)]);const line=coords.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');const area=`M ${coords[0][0]} ${H-pad} `+coords.map(p=>'L '+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ') + ` L ${coords[coords.length-1][0]} ${H-pad} Z`;
    let grid='';[0,25,50,75,100].forEach(v=>{const yy=y(v);grid+=`<line class="timeline-grid" x1="${pad}" y1="${yy}" x2="${W-pad}" y2="${yy}"/><text class="timeline-label" x="2" y="${yy+3}">${v}%</text>`;});
    $('statsTimeline').innerHTML=`<svg class="timeline-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}<path class="timeline-area" d="${area}"/><path class="timeline-line" d="${line}"/>${coords.slice(-8).map(p=>`<circle class="timeline-dot" cx="${p[0]}" cy="${p[1]}" r="3"/>`).join('')}</svg>`;
  }

  async function openStats(id){selectedUserId=id;renderStatsUsers();const p=profiles.find(x=>x.user_id===id);if(!p)return;await loadStatsData(id);renderStats(p);}

  function bind(){
    document.querySelectorAll('[data-workspace]').forEach(btn=>btn.addEventListener('click',()=>setWorkspace(btn.dataset.workspace)));
    $('usersSearch')?.addEventListener('input',renderUsers);$('usersFilter')?.addEventListener('change',renderUsers);$('statsUsersSearch')?.addEventListener('input',renderStatsUsers);$('refreshUsersBtn')?.addEventListener('click',loadProfiles);$('userEditor')?.addEventListener('submit',saveUser);
    window.addEventListener('osteo-backoffice-auth',e=>{currentUser=e.detail?.user||null;if(currentWorkspace==='users'||currentWorkspace==='stats')loadProfiles();});
  }

  bind();
})();
