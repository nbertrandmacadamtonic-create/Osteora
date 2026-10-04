(function(){
  'use strict';

  const TABLE = 'osteo_techniques';
  const STORAGE_BUCKET = 'osteo-pratik-images';
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
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
    const header=String(first(item,['headerImage','coverImage','heroImage'],'')).trim()?1:0;
    return header+main+photos+plates;
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
      headerImage: first(item,['headerImage','coverImage','heroImage']),
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
    if('headerImage' in patch) setAliased(target,['headerImage','coverImage','heroImage'],patch.headerImage,'headerImage');
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
      headerImage:item.headerImage||'',
      image:item.image||'',
      text:item.text||'',
      quiz:item.quiz||'',
      detail:clone(item.detail||{})
    };
  }


  function storagePathSafe(value){
    return String(value||'image')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-zA-Z0-9._-]+/g,'-')
      .replace(/-+/g,'-')
      .replace(/^-|-$/g,'')
      .slice(0,100) || 'image';
  }

  function fileExtension(file){
    const name=String(file?.name||'');
    const parts=name.split('.');
    if(parts.length>1){
      const ext=parts.pop().toLowerCase().replace(/[^a-z0-9]/g,'');
      if(ext && ext.length<=8) return ext==='jpeg'?'jpg':ext;
    }
    const mime=String(file?.type||'').split('/')[1] || 'jpg';
    return mime.replace('jpeg','jpg').replace(/[^a-z0-9]/g,'') || 'jpg';
  }

  function validateImageFile(file){
    if(!file) return 'Aucun fichier sélectionné.';
    if(!String(file.type||'').startsWith('image/')) return 'Le fichier doit être une image.';
    if(file.size > MAX_IMAGE_BYTES) return 'Image trop lourde : maximum 10 Mo.';
    return '';
  }

  async function verifyStorage(){
    const el=$('storageMessage');
    if(!el) return false;
    if(!client || !currentUser){
      el.textContent='🖼 Storage images : connexion administrateur requise.';
      el.className='storage-message';
      return false;
    }

    el.textContent='🖼 Storage images : vérification…';
    el.className='storage-message';

    const { error }=await client.storage.from(STORAGE_BUCKET).list('',{limit:1});
    if(error){
      el.textContent='🖼 Storage non configuré : exécutez supabase-storage.sql dans Supabase.';
      el.className='storage-message warn';
      return false;
    }

    el.textContent='🖼 Storage images actif · bucket « '+STORAGE_BUCKET+' ».';
    el.className='storage-message ok';
    return true;
  }

  async function uploadImageFile(file, kind, stateEl){
    if(!(await requireAdmin())) return '';

    const problem=validateImageFile(file);
    if(problem){
      if(stateEl){
        stateEl.textContent=problem;
        stateEl.className='upload-state error';
      }
      return '';
    }

    const techniqueId=Number($('fId')?.value || selectedId || 0);
    if(!techniqueId){
      if(stateEl){
        stateEl.textContent='Sélectionnez d’abord une technique.';
        stateEl.className='upload-state error';
      }
      return '';
    }

    const ext=fileExtension(file);
    const originalBase=String(file.name||'image').replace(/\.[^.]+$/,'');
    const base=storagePathSafe(originalBase);
    const path=`techniques/${techniqueId}/${kind}/${Date.now()}-${base}.${ext}`;

    if(stateEl){
      stateEl.textContent='Téléversement…';
      stateEl.className='upload-state';
    }

    const { error }=await client.storage.from(STORAGE_BUCKET).upload(path,file,{
      cacheControl:'3600',
      upsert:false,
      contentType:file.type || undefined
    });

    if(error){
      if(stateEl){
        stateEl.textContent='Erreur Storage : '+error.message;
        stateEl.className='upload-state error';
      }
      return '';
    }

    const { data }=client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const url=data?.publicUrl || '';

    if(stateEl){
      stateEl.textContent=url
        ? 'Image téléversée · cliquez ensuite sur « Enregistrer dans Supabase ».'
        : 'Téléversement terminé.';
      stateEl.className=url?'upload-state ok':'upload-state';
    }

    return url;
  }

  function chooseHeaderImage(){
    const input=$('fHeaderImageFile');
    input.value='';
    input.click();
  }

  async function handleHeaderImageFile(){
    const input=$('fHeaderImageFile');
    const file=input.files?.[0];
    const url=await uploadImageFile(file,'header',$('headerUploadState'));
    if(!url) return;
    $('fHeaderImage').value=url;
    renderImagePreviews();
  }

  function chooseMainImage(){
    const input=$('fImageFile');
    input.value='';
    input.click();
  }

  async function handleMainImageFile(){
    const input=$('fImageFile');
    const file=input.files?.[0];
    const url=await uploadImageFile(file,'main',$('mainUploadState'));
    if(!url) return;
    $('fImage').value=url;
    renderImagePreviews();
  }

  function chooseGalleryImages(){
    const input=$('fGalleryFiles');
    input.value='';
    input.click();
  }

  async function handleGalleryFiles(){
    const files=[...($('fGalleryFiles').files||[])];
    if(!files.length) return;

    const state=$('galleryUploadState');
    const existing=$('fDetailImages').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const added=[];

    for(let i=0;i<files.length;i++){
      state.textContent=`Téléversement ${i+1}/${files.length}…`;
      state.className='upload-state';
      const url=await uploadImageFile(files[i],'gallery',state);
      if(url) added.push(url);
    }

    if(added.length){
      $('fDetailImages').value=[...existing,...added].join('\n');
      renderImagePreviews();
      updateDetailState();
      state.textContent=`${added.length} image${added.length>1?'s':''} ajoutée${added.length>1?'s':''} · enregistrez la fiche.`;
      state.className='upload-state ok';
    }
  }

  function chooseStepPhoto(index){
    syncStepsFromDom();
    const card=document.querySelector(`.detail-step[data-step-index="${index}"]`);
    const input=card?.querySelector('[data-step-file]');
    if(!input) return;
    input.value='';
    input.click();
  }

  async function handleStepPhoto(index,input){
    const card=document.querySelector(`.detail-step[data-step-index="${index}"]`);
    const state=card?.querySelector('.step-upload-state');
    const key=storagePathSafe(card?.querySelector('[data-step-field="key"]')?.value || `etape-${index+1}`);
    const url=await uploadImageFile(input.files?.[0],`steps/${key}`,state);
    if(!url) return;

    const photo=card?.querySelector('[data-step-field="photo"]');
    if(photo){
      photo.value=url;
      renderStepPhotoPreview(photo);
      updateDetailState();
    }
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
    $('fHeaderImage').value=x.headerImage;
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
      headerImage:$('fHeaderImage').value.trim(),
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
          <div class="step-upload-row">
            <input type="file" accept="image/*" data-step-file="${index}" hidden>
            <button type="button" class="btn storage-upload" data-step-upload="${index}">☁ Téléverser la photo</button>
            <span class="step-upload-state upload-state">Supabase Storage</span>
          </div>
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
    box.querySelectorAll('[data-step-upload]').forEach(btn=>btn.addEventListener('click',()=>{
      chooseStepPhoto(Number(btn.dataset.stepUpload));
    }));
    box.querySelectorAll('[data-step-file]').forEach(input=>input.addEventListener('change',()=>{
      handleStepPhoto(Number(input.dataset.stepFile),input);
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
    const header=safeImageSrc($('fHeaderImage').value);
    $('headerImagePreview').innerHTML=header?`<img src="${escapeHtml(header)}" alt="Image d’en-tête">`:'';

    const main=safeImageSrc($('fImage').value);
    $('mainImagePreview').innerHTML=main?`<img src="${escapeHtml(main)}" alt="Image principale">`:'';

    const imgs=$('fDetailImages').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    $('detailImagesPreview').innerHTML=imgs.map((src,index)=>`
      <article class="gallery-card">
        <img src="${escapeHtml(safeImageSrc(src))}" alt="">
        <button type="button" class="gallery-remove" data-remove-gallery="${index}" title="Retirer cette image de la fiche">×</button>
        <small>${escapeHtml(src)}</small>
      </article>`).join('');

    $('detailImagesPreview').querySelectorAll('[data-remove-gallery]').forEach(btn=>btn.addEventListener('click',()=>{
      const current=$('fDetailImages').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
      current.splice(Number(btn.dataset.removeGallery),1);
      $('fDetailImages').value=current.join('\n');
      renderImagePreviews();
      updateDetailState();
    }));
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
    if(currentUser) verifyStorage();
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


  function getEmbeddedOsteoRADetail(item){
    const pack=window.OSTEO_RA_EMBEDDED_DETAILS || {};
    const byId=pack.byTechniqueId || {};
    const byRow=pack.bySourceRow || {};
    const id=String(Number(item?.id||0));
    const sourceRow=String(Number(item?.videoSourceRow||0));

    if(byId[id] && hasDetail(byId[id])) return clone(byId[id]);
    if(sourceRow !== '0' && byRow[sourceRow] && hasDetail(byRow[sourceRow])) return clone(byRow[sourceRow]);
    return null;
  }

  function buildEmbeddedDetailSnapshot(){
    return rows.map(item=>{
      const copy=clone(item);
      const detail=getEmbeddedOsteoRADetail(item);
      if(detail) copy.detail=detail;
      return copy;
    }).filter(item=>hasDetail(item.detail));
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

    let snapshot=buildEmbeddedDetailSnapshot();

    // Repli de sécurité vers l’ancien mécanisme si le fichier V7
    // n’a pas été déposé sur GitHub.
    if(!snapshot.length){
      snapshot=await ensureSnapshot(LOCAL_DETAIL_SNAPSHOT_KEY,'force');
    }

    if(!snapshot.length){
      setCloud('Impossible de lire les fiches détaillées.', 'warn');
      showStatus('Aucune fiche détaillée récupérée. Vérifiez que osteo-ra-details-data.js est présent à la racine GitHub.');
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
    showStatus(`${detailed} fiches détaillées disponibles dans le back-office · ${images} images référencées. L’image principale est visible dans la fiche technique de l’application.`);
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
    window.dispatchEvent(new CustomEvent('osteo-backoffice-auth',{detail:{user:currentUser,logged}}));
    $('loginBtn').hidden=logged;
    $('logoutBtn').hidden=!logged;
    $('adminEmail').hidden=logged;
    $('adminPassword').hidden=logged;
    $('seedBtn').hidden=!(logged && rows.length===0);
    $('detailsSyncBtn').hidden=!(logged && rows.length>0);
    if(logged){
      setCloud(`Administrateur connecté : ${currentUser.email||''}`,'ok');
      setTimeout(verifyStorage,50);
    }else if($('storageMessage')){
      $('storageMessage').textContent='🖼 Storage images : connexion administrateur requise.';
      $('storageMessage').className='storage-message';
    }
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
    window.OSTEO_BACKOFFICE_CLIENT=client;

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
  $('fHeaderImage').addEventListener('input',renderImagePreviews);
  $('uploadHeaderImageBtn').addEventListener('click',chooseHeaderImage);
  $('fHeaderImageFile').addEventListener('change',handleHeaderImageFile);
  $('fImage').addEventListener('input',renderImagePreviews);
  $('uploadMainImageBtn').addEventListener('click',chooseMainImage);
  $('fImageFile').addEventListener('change',handleMainImageFile);
  $('uploadGalleryBtn').addEventListener('click',chooseGalleryImages);
  $('fGalleryFiles').addEventListener('change',handleGalleryFiles);
  $('fDetailImages').addEventListener('input',()=>{renderImagePreviews();updateDetailState();});
  ['fDetailSource','fDetailCategory','fDetailMethod','fDetailIntro'].forEach(id=>$(id).addEventListener('input',updateDetailState));

  init();
})();
