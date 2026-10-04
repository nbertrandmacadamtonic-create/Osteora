(function(){
  'use strict';

  const TABLE = 'osteo_techniques';
  const LOCAL_SNAPSHOT_KEY = 'osteoRA.backoffice.snapshot.v1';
  const LOCAL_DETAIL_SNAPSHOT_KEY = 'osteoRA.backoffice.snapshot.v2.details';
  const $ = (id) => document.getElementById(id);

  let client = null;
  let rows = [];
  let selectedId = null;
  let currentUser = null;
  let isConfigured = false;
  let detailStepsDraft = [];

  function cfg(){ return window.OSTEO_SUPABASE || {}; }

  function configured(){
    const c = cfg();
    return /^https:\/\/.+\.supabase\.co$/i.test(String(c.url || '').trim())
      && String(c.anonKey || '').length > 20
      && !String(c.url).includes('VOTRE-PROJET')
      && !String(c.anonKey).includes('VOTRE_CLE');
  }

  function clone(v){
    try{return structuredClone(v);}
    catch(_){return JSON.parse(JSON.stringify(v));}
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

  function hasDetail(detail){
    return !!(detail && (
      String(detail.intro||'').trim() ||
      String(detail.category||'').trim() ||
      String(detail.method||'').trim() ||
      (Array.isArray(detail.steps) && detail.steps.some(s=>String(s?.body||'').trim())) ||
      (Array.isArray(detail.images) && detail.images.length)
    ));
  }

  function imageCount(item){
    const d=item?.detail||{};
    const photos=(Array.isArray(d.steps)?d.steps:[]).filter(s=>String(s?.photo||'').trim()).length;
    const plates=(Array.isArray(d.images)?d.images:[]).filter(Boolean).length;
    const main=String(first(item,['image','imageUrl','poster'],'')).trim()?1:0;
    return main+photos+plates;
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
      quiz: first(item,['quiz','quizText','associatedQuiz']),
      detail: clone(item.detail || {})
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
    if('status' in patch) setAliased(target,['status','statut','publication'],patch.status,'status');
    if('icon' in patch) setAliased(target,['icon'],patch.icon,'icon');
    if('video' in patch){
      setAliased(target,['videoUrl','video','vimeoUrl','directVimeo'],patch.video,'videoUrl');
      if(String(patch.video||'').includes('vimeo')) target.videoProvider='vimeo';
    }
    if('image' in patch) setAliased(target,['image','imageUrl','poster'],patch.image,'image');
    if('text' in patch) setAliased(target,['text','texte','description','techniqueText'],patch.text,'text');
    if('quiz' in patch) setAliased(target,['quiz','quizText','associatedQuiz'],patch.quiz,'quiz');
    if('detail' in patch) target.detail=clone(patch.detail||{});
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
      quiz:item.quiz||'',
      detail:clone(item.detail||{})
    };
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function safeImageSrc(src){
    const s=String(src||'').trim();
    if(!s) return '';
    return s;
  }

  function render(){
    const canon = rows.map(canonical).sort((a,b)=>a.id-b.id);
    const q = ($('search').value || '').trim().toLowerCase();
    const filtered = canon.filter(x => !q || [x.title,x.zone,x.sub,String(x.id),x.detail?.category,x.detail?.method].join(' ').toLowerCase().includes(q));
    const detailed=rows.filter(x=>hasDetail(x.detail)).length;
    const images=rows.reduce((n,x)=>n+imageCount(x),0);
    $('count').textContent = `${canon.length} techniques · ${canon.filter(x=>x.video).length} avec vidéo · ${detailed} fiches détaillées · ${images} images référencées`;

    $('list').innerHTML = filtered.map(x=>`
      <button class="item ${x.id===selectedId?'active':''}" data-id="${x.id}">
        <span class="badge">${escapeHtml(x.icon || String(x.id).slice(-2))}</span>
        <span>
          <strong>${escapeHtml(x.title || 'Sans titre')}</strong>
          <small>${escapeHtml(x.zone || '—')} · ${escapeHtml(x.sub || '—')}</small>
        </span>
        <span class="item-state">
          <span class="video-dot ${x.video?'ok':''}">${x.video?'Vimeo ✓':'Vidéo —'}</span>
          <span class="fiche-dot ${hasDetail(x.detail)?'ok':''}">${hasDetail(x.detail)?'Fiche ✓':'Fiche —'}</span>
        </span>
      </button>`).join('');

    document.querySelectorAll('.item').forEach(btn=>btn.addEventListener('click',()=>openEditor(Number(btn.dataset.id))));
  }

  function normalizeDetail(detail){
    const d=clone(detail||{});
    d.source=String(d.source||'');
    d.category=String(d.category||'');
    d.method=String(d.method||'');
    d.intro=String(d.intro||'');
    d.steps=Array.isArray(d.steps)?d.steps.map((s,i)=>({
      key:String(s?.key||['position','mains','barriere','normalisation'][i]||`etape-${i+1}`),
      logoKey:String(s?.logoKey||s?.key||''),
      logo:String(s?.logo||''),
      label:String(s?.label||''),
      title:String(s?.title||''),
      body:String(s?.body||''),
      photo:String(s?.photo||'')
    })):[];
    d.images=Array.isArray(d.images)?d.images.filter(Boolean).map(String):[];
    return d;
  }

  function openEditor(id){
    const native = rows.find(t=>Number(t.id)===Number(id));
    if(!native) return;
    const x=canonical(native);
    const d=normalizeDetail(x.detail);

    selectedId=id;
    $('editorEmpty').hidden=true;
    $('editor').hidden=false;

    $('fId').value=x.id;
    $('fTitle').value=x.title;
    $('fZone').value=x.zone;
    $('fSub').value=x.sub;
    $('fLevel').value=x.level;
    $('fStatus').value=x.status;
    $('fIcon').value=x.icon;
    $('fVideo').value=x.video;
    $('fImage').value=x.image;
    $('fText').value=x.text;
    $('fQuiz').value=x.quiz;

    $('fDetailSource').value=d.source;
    $('fDetailCategory').value=d.category;
    $('fDetailMethod').value=d.method;
    $('fDetailIntro').value=d.intro;
    $('fDetailImages').value=d.images.join('\n');

    detailStepsDraft=d.steps;
    renderDetailSteps();
    renderImagePreviews();
    updateDetailState();
    $('status').hidden=true;
    render();

    setTimeout(()=>document.querySelector('.editor-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function formValue(){
    syncStepsFromDom();
    const detail={
      source:$('fDetailSource').value.trim(),
      category:$('fDetailCategory').value.trim(),
      method:$('fDetailMethod').value.trim(),
      intro:$('fDetailIntro').value,
      steps:clone(detailStepsDraft),
      images:$('fDetailImages').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)
    };
    return {
      id:Number($('fId').value),
      title:$('fTitle').value.trim(),
      zone:$('fZone').value.trim(),
      sub:$('fSub').value.trim(),
      level:$('fLevel').value.trim(),
      status:$('fStatus').value.trim(),
      icon:$('fIcon').value.trim(),
      video:$('fVideo').value.trim(),
      image:$('fImage').value.trim(),
      text:$('fText').value,
      quiz:$('fQuiz').value,
      detail
    };
  }

  function stepTemplate(step,index){
    return `
      <article class="detail-step" data-step-index="${index}">
        <div class="detail-step-head">
          <strong>Étape ${index+1}</strong>
          <button type="button" class="step-remove" data-remove-step="${index}">Supprimer</button>
        </div>
        <div class="step-grid">
          <label>Clé<input data-step-field="key" value="${escapeHtml(step.key)}" placeholder="position / mains / barriere / normalisation"></label>
          <label>Libellé<input data-step-field="label" value="${escapeHtml(step.label)}" placeholder="Position des mains"></label>
          <label>Titre<input data-step-field="title" value="${escapeHtml(step.title)}" placeholder="Contacts et prises"></label>
          <label>Logo / chemin<input data-step-field="logo" value="${escapeHtml(step.logo)}" placeholder="assets/images/…"></label>
          <label class="step-body">Texte<textarea data-step-field="body" placeholder="Texte détaillé de l’étape…">${escapeHtml(step.body)}</textarea></label>
          <label>Photo / chemin<input data-step-field="photo" value="${escapeHtml(step.photo)}" placeholder="assets/images/… ou https://…"></label>
          <div class="step-photo-preview">${step.photo?`<img src="${escapeHtml(safeImageSrc(step.photo))}" alt="">`:''}</div>
        </div>
      </article>`;
  }

  function renderDetailSteps(){
    const box=$('detailStepsEditor');
    box.innerHTML=detailStepsDraft.map(stepTemplate).join('') || '<div class="empty">Aucune étape. Cliquez sur « Ajouter une étape ».</div>';
    box.querySelectorAll('[data-remove-step]').forEach(btn=>btn.addEventListener('click',()=>{
      syncStepsFromDom();
      detailStepsDraft.splice(Number(btn.dataset.removeStep),1);
      renderDetailSteps();
      updateDetailState();
    }));
    box.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',()=>{
      if(el.dataset.stepField==='photo') renderStepPhotoPreview(el);
      updateDetailState();
    }));
  }

  function syncStepsFromDom(){
    const cards=[...document.querySelectorAll('.detail-step')];
    detailStepsDraft=cards.map(card=>{
      const get=(field)=>card.querySelector(`[data-step-field="${field}"]`)?.value || '';
      const key=get('key').trim();
      return {
        key:key||'etape',
        logoKey:key||'',
        logo:get('logo').trim(),
        label:get('label').trim(),
        title:get('title').trim(),
        body:get('body'),
        photo:get('photo').trim()
      };
    });
  }

  function renderStepPhotoPreview(input){
    const card=input.closest('.detail-step');
    const preview=card?.querySelector('.step-photo-preview');
    if(!preview) return;
    const src=safeImageSrc(input.value);
    preview.innerHTML=src?`<img src="${escapeHtml(src)}" alt="">`:'';
  }

  function addStep(){
    syncStepsFromDom();
    const defaults=[
      {key:'position',label:'Position',title:'Patient et praticien'},
      {key:'mains',label:'Position des mains',title:'Contacts et prises'},
      {key:'barriere',label:'Barrière motrice',title:'Mise en tension'},
      {key:'normalisation',label:'Normalisation',title:'Geste de correction'}
    ];
    const d=defaults[detailStepsDraft.length]||{key:`etape-${detailStepsDraft.length+1}`,label:`Étape ${detailStepsDraft.length+1}`,title:''};
    detailStepsDraft.push({...d,logoKey:d.key,logo:'',body:'',photo:''});
    renderDetailSteps();
    updateDetailState();
  }

  function renderImagePreviews(){
    const main=safeImageSrc($('fImage').value);
    $('mainImagePreview').innerHTML=main?`<img src="${escapeHtml(main)}" alt="Image principale">`:'';

    const imgs=$('fDetailImages').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    $('detailImagesPreview').innerHTML=imgs.map(src=>`
      <article class="gallery-card">
        <img src="${escapeHtml(safeImageSrc(src))}" alt="">
        <small>${escapeHtml(src)}</small>
      </article>`).join('');
  }

  function updateDetailState(){
    syncStepsFromDom();
    const d={
      source:$('fDetailSource').value,
      category:$('fDetailCategory').value,
      method:$('fDetailMethod').value,
      intro:$('fDetailIntro').value,
      steps:detailStepsDraft,
      images:$('fDetailImages').value.split(/\r?\n/).filter(Boolean)
    };
    const ok=hasDetail(d);
    $('detailState').textContent=ok?'Fiche détaillée':'À compléter';
    $('detailState').className='detail-state '+(ok?'ok':'');
  }

  async function requireAdmin(){
    if(!isConfigured){ showStatus('Supabase n’est pas encore configuré.'); return false; }
    if(!currentUser){ showStatus('Connectez-vous comme administrateur avant de modifier la base.'); return false; }
    return true;
  }

  async function loadCentral(){
    if(!isConfigured) return;
    setCloud('Chargement de la base centrale…');
    const { data, error } = await client.from(TABLE).select('id,data').order('id', { ascending:true });
    if(error){ setCloud('Erreur de lecture : ' + error.message, 'warn'); return; }
    rows=(data||[]).map(r=>r.data).filter(Boolean);
    const detailed=rows.filter(x=>hasDetail(x.detail)).length;
    setCloud(`${rows.length} techniques synchronisées · ${detailed} fiches détaillées.`, 'ok');
    $('seedBtn').hidden = !(currentUser && rows.length===0);
    $('detailsSyncBtn').hidden = !currentUser || rows.length===0;
    render();
    if(selectedId && rows.some(x=>Number(x.id)===Number(selectedId))) openEditor(selectedId);
  }

  async function saveCurrent(e){
    e.preventDefault();
    if(!(await requireAdmin())) return;
    const value=formValue();
    let native=rows.find(t=>Number(t.id)===value.id);
    if(native){ native=clone(native); applyCanonicalPatch(native,value); }
    else native=canonicalToNative(value);

    const { error }=await client.from(TABLE).upsert({id:value.id,data:native},{onConflict:'id'});
    if(error){ showStatus('Erreur : '+error.message); return; }

    const i=rows.findIndex(t=>Number(t.id)===value.id);
    if(i>=0) rows[i]=native; else rows.push(native);
    showStatus('Fiche complète enregistrée dans Supabase. La modification est disponible sur tous les appareils.');
    render();
    openEditor(value.id);
  }

  function addNew(){
    if(!currentUser){ showStatus('Connectez-vous avant d’ajouter une technique.'); return; }
    const id=Math.max(0,...rows.map(x=>Number(x.id)||0))+1;
    const detail={
      source:'',category:'',method:'',intro:'',
      steps:[
        {key:'position',logoKey:'position',logo:'',label:'Position',title:'Patient et praticien',body:'',photo:''},
        {key:'mains',logoKey:'mains',logo:'',label:'Position des mains',title:'Contacts et prises',body:'',photo:''},
        {key:'barriere',logoKey:'barriere',logo:'',label:'Barrière motrice',title:'Mise en tension',body:'',photo:''},
        {key:'normalisation',logoKey:'normalisation',logo:'',label:'Normalisation',title:'Geste de correction',body:'',photo:''}
      ],images:[]
    };
    rows.push(canonicalToNative({id,title:'Nouvelle technique',zone:'À classer',sub:'À classer',level:'Tous niveaux',status:'brouillon',icon:'•',video:'',image:'',text:'',quiz:'',detail}));
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
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='osteo-pratik-techniques-fiches-detaillees.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  function showStatus(text){ $('status').textContent=text;$('status').hidden=false; }

  function readSnapshot(key){
    try{
      const raw=localStorage.getItem(key);
      return raw?JSON.parse(raw):[];
    }catch(_){return [];}
  }

  async function ensureSnapshot(key, mode){
    let snapshot=readSnapshot(key);
    if(snapshot.length && mode!=='force') return snapshot;

    try{ localStorage.removeItem(key); }catch(_){}
    $('bootWarning').hidden=false;

    const frame=document.createElement('iframe');
    frame.src=`index.html?backoffice-bootstrap=${encodeURIComponent(mode||'1')}&ts=${Date.now()}`;
    frame.hidden=true;
    frame.setAttribute('aria-hidden','true');
    document.body.appendChild(frame);

    for(let i=0;i<80;i++){
      await new Promise(r=>setTimeout(r,150));
      snapshot=readSnapshot(key);
      if(snapshot.length){
        frame.remove();
        $('bootWarning').hidden=true;
        return snapshot;
      }
    }
    frame.remove();
    $('bootWarning').textContent="Impossible de récupérer automatiquement les données d’Ostéo RA.";
    return [];
  }

  async function seedCentral(){
    if(!(await requireAdmin())) return;
    const snapshot=await ensureSnapshot(LOCAL_DETAIL_SNAPSHOT_KEY,'force');
    const source=snapshot.length?snapshot:await ensureSnapshot(LOCAL_SNAPSHOT_KEY,'force');
    if(!source.length){ showStatus('Aucune donnée locale trouvée pour initialiser la base.'); return; }
    if(!confirm(`Initialiser la base centrale avec ${source.length} techniques d’Ostéo RA ?`)) return;
    const payload=source.map(x=>({id:Number(x.id),data:x}));
    const { error }=await client.from(TABLE).upsert(payload,{onConflict:'id'});
    if(error){ showStatus('Erreur d’initialisation : '+error.message); return; }
    showStatus(`Base centrale initialisée avec ${payload.length} techniques.`);
    await loadCentral();
  }

  async function syncDetailedSheets(){
    if(!(await requireAdmin())) return;
    if(!rows.length){ showStatus('La base centrale est vide.'); return; }

    const ok=confirm(
      "Importer / actualiser les fiches détaillées depuis l’application Ostéo RA ?\n\n"+
      "Cette opération met à jour les textes détaillés, les étapes et les images associées sans écraser vos titres, liens Vimeo ou classements déjà présents dans Supabase."
    );
    if(!ok) return;

    setCloud('Lecture des fiches détaillées d’Ostéo RA…');
    const snapshot=await ensureSnapshot(LOCAL_DETAIL_SNAPSHOT_KEY,'force');
    if(!snapshot.length){
      setCloud('Impossible de lire les fiches détaillées.', 'warn');
      showStatus('Aucune fiche détaillée n’a pu être récupérée depuis l’application.');
      return;
    }

    const sourceById=new Map(snapshot.map(x=>[Number(x.id),x]));
    const merged=rows.map(current=>{
      const src=sourceById.get(Number(current.id));
      if(!src) return current;
      const next=clone(current);
      if(src.detail && hasDetail(src.detail)) next.detail=clone(src.detail);
      const currentImage=String(first(next,['image','imageUrl','poster'],'')).trim();
      const srcImage=String(first(src,['image','imageUrl','poster'],'')).trim();
      if(!currentImage && srcImage) next.image=srcImage;
      return next;
    });

    const changed=merged.filter((x,i)=>JSON.stringify(x.detail||{})!==JSON.stringify(rows[i]?.detail||{}) || String(x.image||'')!==String(rows[i]?.image||''));
    if(!changed.length){
      rows=merged;
      setCloud(`${rows.length} techniques synchronisées · aucune nouvelle fiche à importer.`, 'ok');
      showStatus('Les fiches détaillées de la base sont déjà à jour.');
      render();
      return;
    }

    let done=0;
    for(let i=0;i<changed.length;i+=25){
      const chunk=changed.slice(i,i+25).map(x=>({id:Number(x.id),data:x}));
      const { error }=await client.from(TABLE).upsert(chunk,{onConflict:'id'});
      if(error){
        setCloud('Erreur pendant l’import des fiches.', 'warn');
        showStatus(`Import interrompu : ${error.message}`);
        return;
      }
      done+=chunk.length;
      setCloud(`Import des fiches détaillées… ${done}/${changed.length}`);
    }

    rows=merged;
    const detailed=rows.filter(x=>hasDetail(x.detail)).length;
    const images=rows.reduce((n,x)=>n+imageCount(x),0);
    setCloud(`${rows.length} techniques synchronisées · ${detailed} fiches détaillées.`, 'ok');
    showStatus(`${detailed} fiches détaillées disponibles dans le back-office · ${images} images référencées.`);
    render();
    if(selectedId) openEditor(selectedId);
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
    $('detailsSyncBtn').hidden=!(logged && rows.length>0);
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
  $('detailsSyncBtn').addEventListener('click',syncDetailedSheets);
  $('addStepBtn').addEventListener('click',addStep);
  $('fImage').addEventListener('input',renderImagePreviews);
  $('fDetailImages').addEventListener('input',()=>{renderImagePreviews();updateDetailState();});
  ['fDetailSource','fDetailCategory','fDetailMethod','fDetailIntro'].forEach(id=>$(id).addEventListener('input',updateDetailState));

  init();
})();
