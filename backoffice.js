(function(){
  'use strict';

  const TABLE = 'osteo_techniques';
  const LOCAL_SNAPSHOT_KEY = 'osteoRA.backoffice.snapshot.v1';
  const $ = (id) => document.getElementById(id);

  let client = null;
  let rows = [];           // native technique objects from the central database
  let selectedId = null;
  let currentUser = null;
  let isConfigured = false;

  function cfg(){
    return window.OSTEO_SUPABASE || {};
  }

  function configured(){
    const c = cfg();
    return /^https:\/\/.+\.supabase\.co$/i.test(String(c.url || '').trim())
      && String(c.anonKey || '').length > 20
      && !String(c.url).includes('VOTRE-PROJET')
      && !String(c.anonKey).includes('VOTRE_CLE');
  }

  function setCloud(message, mode=''){
    $('cloudMessage').textContent = message;
    $('cloudState').textContent = mode === 'ok' ? '☁ Centralisé' : mode === 'warn' ? '☁ À configurer' : '☁ Connexion';
    $('cloudState').className = 'cloud-state ' + mode;
  }

  function first(obj, keys, fallback=''){
    for(const k of keys){ if(obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; }
    return fallback;
  }

  function canonical(item){
    return {
      id: Number(item.id),
      title: first(item,['title','titre']),
      zone: first(item,['zone','monde']),
      sub: first(item,['sub','region']),
      level: first(item,['level','niveau']),
      status: first(item,['status','statut','publication']),
      icon: first(item,['icon']),
      video: first(item,['videoUrl','video','vimeoUrl','directVimeo']),
      image: first(item,['image','imageUrl','poster']),
      text: first(item,['text','texte','description','techniqueText']),
      quiz: first(item,['quiz','quizText','associatedQuiz'])
    };
  }

  function setAliased(target, aliases, value, preferred){
    let touched=false;
    aliases.forEach(k=>{
      if(Object.prototype.hasOwnProperty.call(target,k)){ target[k]=value; touched=true; }
    });
    if(!touched && preferred) target[preferred]=value;
  }

  function applyCanonicalPatch(target, patch){
    if('title' in patch) setAliased(target,['title','titre'],patch.title,'title');
    if('zone' in patch) setAliased(target,['zone','monde'],patch.zone,'zone');
    if('sub' in patch) setAliased(target,['sub','region'],patch.sub,'sub');
    if('level' in patch) setAliased(target,['level','niveau'],patch.level,'level');
    if('status' in patch){
      setAliased(target,['status','statut','publication'],patch.status,'status');
    }
    if('icon' in patch) setAliased(target,['icon'],patch.icon,'icon');
    if('video' in patch){
      setAliased(target,['videoUrl','video','vimeoUrl','directVimeo'],patch.video,'videoUrl');
      if(String(patch.video||'').includes('vimeo')) target.videoProvider='vimeo';
    }
    if('image' in patch) setAliased(target,['image','imageUrl','poster'],patch.image,'image');
    if('text' in patch) setAliased(target,['text','texte','description','techniqueText'],patch.text,'text');
    if('quiz' in patch) setAliased(target,['quiz','quizText','associatedQuiz'],patch.quiz,'quiz');
  }

  function canonicalToNative(item){
    return {
      id:Number(item.id),
      title:item.title||'Nouvelle technique',
      zone:item.zone||'À classer',
      sub:item.sub||'À classer',
      level:item.level||'Tous niveaux',
      status:item.status||'non vue',
      percent:0,
      icon:item.icon||'•',
      videoProvider:String(item.video||'').includes('vimeo')?'vimeo':'',
      videoUrl:item.video||'',
      image:item.image||'',
      text:item.text||'',
      quiz:item.quiz||''
    };
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function render(){
    const canon = rows.map(canonical).sort((a,b)=>a.id-b.id);
    const q = ($('search').value || '').trim().toLowerCase();
    const filtered = canon.filter(x => !q || [x.title,x.zone,x.sub,String(x.id)].join(' ').toLowerCase().includes(q));
    $('count').textContent = `${canon.length} techniques · ${canon.filter(x=>x.video).length} avec vidéo`;
    $('list').innerHTML = filtered.map(x=>`
      <button class="item ${x.id===selectedId?'active':''}" data-id="${x.id}">
        <span class="badge">${escapeHtml(x.icon || String(x.id).slice(-2))}</span>
        <span><strong>${escapeHtml(x.title || 'Sans titre')}</strong><small>${escapeHtml(x.zone || '—')} · ${escapeHtml(x.sub || '—')}</small></span>
        <span class="video-dot ${x.video?'ok':''}">${x.video?'Vimeo ✓':'—'}</span>
      </button>`).join('');
    document.querySelectorAll('.item').forEach(btn=>btn.addEventListener('click',()=>openEditor(Number(btn.dataset.id))));
  }

  function openEditor(id){
    const native = rows.find(t=>Number(t.id)===Number(id));
    if(!native) return;
    const x=canonical(native);
    selectedId=id;
    $('editorEmpty').hidden=true;$('editor').hidden=false;
    $('fId').value=x.id;$('fTitle').value=x.title;$('fZone').value=x.zone;$('fSub').value=x.sub;
    $('fLevel').value=x.level;$('fStatus').value=x.status;$('fIcon').value=x.icon;$('fVideo').value=x.video;
    $('fImage').value=x.image;$('fText').value=x.text;$('fQuiz').value=x.quiz;
    $('status').hidden=true;
    render();
  }

  function formValue(){
    return {
      id:Number($('fId').value), title:$('fTitle').value.trim(), zone:$('fZone').value.trim(),
      sub:$('fSub').value.trim(), level:$('fLevel').value.trim(), status:$('fStatus').value.trim(),
      icon:$('fIcon').value.trim(), video:$('fVideo').value.trim(), image:$('fImage').value.trim(),
      text:$('fText').value, quiz:$('fQuiz').value
    };
  }

  async function requireAdmin(){
    if(!isConfigured){
      showStatus('Supabase n’est pas encore configuré.');
      return false;
    }
    if(!currentUser){
      showStatus('Connectez-vous comme administrateur avant de modifier la base.');
      return false;
    }
    return true;
  }

  async function loadCentral(){
    if(!isConfigured) return;
    setCloud('Chargement de la base centrale…');
    const { data, error } = await client.from(TABLE).select('id,data').order('id', { ascending:true });
    if(error){
      setCloud('Erreur de lecture : ' + error.message, 'warn');
      return;
    }
    rows=(data||[]).map(r=>r.data).filter(Boolean);
    setCloud(`${rows.length} techniques synchronisées sur tous les appareils.`, 'ok');
    $('seedBtn').hidden = !(currentUser && rows.length===0);
    render();
  }

  async function saveCurrent(e){
    e.preventDefault();
    if(!(await requireAdmin())) return;
    const value=formValue();
    let native=rows.find(t=>Number(t.id)===value.id);
    if(native){
      native=JSON.parse(JSON.stringify(native));
      applyCanonicalPatch(native,value);
    }else{
      native=canonicalToNative(value);
    }
    const { error }=await client.from(TABLE).upsert({id:value.id,data:native},{onConflict:'id'});
    if(error){ showStatus('Erreur : '+error.message); return; }
    const i=rows.findIndex(t=>Number(t.id)===value.id);
    if(i>=0) rows[i]=native; else rows.push(native);
    showStatus('Enregistré dans la base centrale. La modification est disponible sur tous les appareils.');
    render();
  }

  function addNew(){
    if(!currentUser){ showStatus('Connectez-vous avant d’ajouter une technique.'); return; }
    const id=Math.max(0,...rows.map(x=>Number(x.id)||0))+1;
    rows.push(canonicalToNative({id,title:'Nouvelle technique',zone:'À classer',sub:'À classer',level:'Tous niveaux',status:'brouillon',icon:'•',video:'',image:'',text:'',quiz:''}));
    render();openEditor(id);
  }

  async function deleteCurrent(){
    if(!(await requireAdmin())) return;
    if(!selectedId || !confirm('Supprimer cette technique de la base centrale ?')) return;
    const { error }=await client.from(TABLE).delete().eq('id',Number(selectedId));
    if(error){ showStatus('Erreur : '+error.message); return; }
    rows=rows.filter(x=>Number(x.id)!==Number(selectedId));
    selectedId=null;$('editor').hidden=true;$('editorEmpty').hidden=false;render();
    showStatus('Technique supprimée de la base centrale.');
  }

  function exportJson(){
    const blob=new Blob([JSON.stringify(rows,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='osteo-pratik-techniques-central.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  function showStatus(text){ $('status').textContent=text;$('status').hidden=false; }

  function readLocalSnapshot(){
    try{
      const raw=localStorage.getItem(LOCAL_SNAPSHOT_KEY);
      return raw?JSON.parse(raw):[];
    }catch(_){return [];}
  }

  async function ensureSnapshot(){
    let snapshot=readLocalSnapshot();
    if(snapshot.length) return snapshot;
    $('bootWarning').hidden=false;
    const frame=document.createElement('iframe');
    frame.src='index.html?backoffice-bootstrap=1';
    frame.hidden=true;frame.setAttribute('aria-hidden','true');document.body.appendChild(frame);
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,150));
      snapshot=readLocalSnapshot();
      if(snapshot.length){ frame.remove();$('bootWarning').hidden=true;return snapshot; }
    }
    frame.remove();
    $('bootWarning').textContent="Impossible de récupérer automatiquement le catalogue Ostéo RA.";
    return [];
  }

  async function seedCentral(){
    if(!(await requireAdmin())) return;
    const snapshot=await ensureSnapshot();
    if(!snapshot.length){ showStatus('Aucune donnée locale trouvée pour initialiser la base.'); return; }
    if(!confirm(`Initialiser la base centrale avec ${snapshot.length} techniques d’Ostéo RA ?`)) return;
    const payload=snapshot.map(x=>({id:Number(x.id),data:x}));
    const { error }=await client.from(TABLE).upsert(payload,{onConflict:'id'});
    if(error){ showStatus('Erreur d’initialisation : '+error.message); return; }
    showStatus(`Base centrale initialisée avec ${payload.length} techniques.`);
    await loadCentral();
  }

  async function login(){
    if(!isConfigured){ setCloud('Complétez supabase-config.js avant la connexion.', 'warn'); return; }
    const email=$('adminEmail').value.trim();
    const password=$('adminPassword').value;
    if(!email || !password){ setCloud('Saisissez votre e-mail et votre mot de passe.', 'warn'); return; }
    const { data, error }=await client.auth.signInWithPassword({email,password});
    if(error){ setCloud('Connexion refusée : '+error.message,'warn'); return; }
    currentUser=data.user||null;
    updateAuthUi();
    await loadCentral();
  }

  async function logout(){
    if(client) await client.auth.signOut();
    currentUser=null;
    updateAuthUi();
  }

  function updateAuthUi(){
    const logged=!!currentUser;
    $('loginBtn').hidden=logged;
    $('logoutBtn').hidden=!logged;
    $('adminEmail').hidden=logged;
    $('adminPassword').hidden=logged;
    $('seedBtn').hidden=!(logged && rows.length===0);
    if(logged) setCloud(`Administrateur connecté : ${currentUser.email||''}`,'ok');
  }

  async function init(){
    isConfigured=configured();
    if(!isConfigured || !window.supabase){
      setCloud('Complétez supabase-config.js avec la Project URL et la clé publique Supabase.', 'warn');
      $('count').textContent='Base centrale non configurée';
      return;
    }

    const c=cfg();
    client=window.supabase.createClient(c.url,c.anonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });

    const { data:{ session } }=await client.auth.getSession();
    currentUser=session?.user||null;
    updateAuthUi();

    client.auth.onAuthStateChange((_event,session)=>{
      currentUser=session?.user||null;
      updateAuthUi();
    });

    await loadCentral();
  }

  $('search').addEventListener('input',render);
  $('newBtn').addEventListener('click',addNew);
  $('editor').addEventListener('submit',saveCurrent);
  $('deleteBtn').addEventListener('click',deleteCurrent);
  $('exportBtn').addEventListener('click',exportJson);
  $('resetBtn').addEventListener('click',loadCentral);
  $('loginBtn').addEventListener('click',login);
  $('logoutBtn').addEventListener('click',logout);
  $('seedBtn').addEventListener('click',seedCentral);

  init();
})();
