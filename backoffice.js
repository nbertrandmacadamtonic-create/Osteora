(function(){
  'use strict';

  const KEYS = {
    snapshot: 'osteoRA.backoffice.snapshot.v1',
    patches: 'osteoRA.backoffice.patches.v1',
    additions: 'osteoRA.backoffice.additions.v1',
    deleted: 'osteoRA.backoffice.deleted.v1'
  };

  const $ = (id) => document.getElementById(id);
  let rows = [];
  let selectedId = null;

  function read(key, fallback){
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch(_){ return fallback; }
  }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
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
      status: first(item,['status','statut']),
      icon: first(item,['icon']),
      video: first(item,['videoUrl','video','vimeoUrl','directVimeo']),
      image: first(item,['image','imageUrl','poster']),
      text: first(item,['text','texte','description','techniqueText']),
      quiz: first(item,['quiz','quizText','associatedQuiz'])
    };
  }

  function mergedData(){
    const base = read(KEYS.snapshot, []).map(canonical);
    const patches = read(KEYS.patches, {});
    const additions = read(KEYS.additions, []).map(canonical);
    const deleted = new Set(read(KEYS.deleted, []).map(Number));
    const out = base.filter(x=>!deleted.has(x.id)).map(x=>Object.assign({},x,patches[String(x.id)]||{}));
    additions.forEach(x=>{
      if(!deleted.has(x.id) && !out.some(y=>y.id===x.id)) out.push(x);
    });
    return out.sort((a,b)=>a.id-b.id);
  }

  function render(){
    rows = mergedData();
    const q = ($('search').value || '').trim().toLowerCase();
    const filtered = rows.filter(x => !q || [x.title,x.zone,x.sub,String(x.id)].join(' ').toLowerCase().includes(q));
    $('count').textContent = `${rows.length} techniques · ${rows.filter(x=>x.video).length} avec vidéo`;
    $('list').innerHTML = filtered.map(x=>`
      <button class="item ${x.id===selectedId?'active':''}" data-id="${x.id}">
        <span class="badge">${escapeHtml(x.icon || String(x.id).slice(-2))}</span>
        <span><strong>${escapeHtml(x.title || 'Sans titre')}</strong><small>${escapeHtml(x.zone || '—')} · ${escapeHtml(x.sub || '—')}</small></span>
        <span class="video-dot ${x.video?'ok':''}">${x.video?'Vimeo ✓':'—'}</span>
      </button>`).join('');
    document.querySelectorAll('.item').forEach(btn=>btn.addEventListener('click',()=>openEditor(Number(btn.dataset.id))));
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function openEditor(id){
    const x = mergedData().find(t=>t.id===id);
    if(!x) return;
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

  function saveCurrent(e){
    e.preventDefault();
    const value=formValue();
    const baseIds=new Set(read(KEYS.snapshot,[]).map(x=>Number(x.id)));
    if(baseIds.has(value.id)){
      const patches=read(KEYS.patches,{});patches[String(value.id)]=value;write(KEYS.patches,patches);
    }else{
      const additions=read(KEYS.additions,[]);const i=additions.findIndex(x=>Number(x.id)===value.id);
      if(i>=0)additions[i]=value;else additions.push(value);write(KEYS.additions,additions);
    }
    showStatus('Enregistré. Revenez à l’application : la modification sera appliquée automatiquement.');
    render();
  }

  function addNew(){
    const all=mergedData();
    const id=Math.max(0,...all.map(x=>Number(x.id)||0))+1;
    const additions=read(KEYS.additions,[]);
    additions.push({id,title:'Nouvelle technique',zone:'À classer',sub:'À classer',level:'Tous niveaux',status:'non vue',icon:'•',video:'',image:'',text:'',quiz:''});
    write(KEYS.additions,additions);render();openEditor(id);
  }

  function deleteCurrent(){
    if(!selectedId || !confirm('Supprimer cette technique du catalogue affiché ?')) return;
    const ids=new Set(read(KEYS.deleted,[]).map(Number));ids.add(Number(selectedId));write(KEYS.deleted,[...ids]);
    selectedId=null;$('editor').hidden=true;$('editorEmpty').hidden=false;render();
  }

  function exportJson(){
    const blob=new Blob([JSON.stringify(mergedData(),null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='osteo-ra-backoffice-techniques.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  function resetAll(){
    if(!confirm('Annuler toutes les modifications faites dans ce back-office ?')) return;
    localStorage.removeItem(KEYS.patches);localStorage.removeItem(KEYS.additions);localStorage.removeItem(KEYS.deleted);
    selectedId=null;$('editor').hidden=true;$('editorEmpty').hidden=false;render();
  }

  function showStatus(text){ $('status').textContent=text;$('status').hidden=false; }

  function bootstrapIfNeeded(){
    if(read(KEYS.snapshot,[]).length){ render(); return; }
    $('bootWarning').hidden=false;
    const frame=document.createElement('iframe');
    frame.src='index.html?backoffice-bootstrap=1';
    frame.hidden=true;frame.setAttribute('aria-hidden','true');document.body.appendChild(frame);
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(read(KEYS.snapshot,[]).length){clearInterval(timer);frame.remove();$('bootWarning').hidden=true;render();}
      else if(tries>30){clearInterval(timer);$('bootWarning').textContent="Impossible d'initialiser automatiquement. Ouvrez d'abord index.html une fois, puis revenez sur backoffice.html.";}
    },150);
  }

  $('search').addEventListener('input',render);
  $('newBtn').addEventListener('click',addNew);
  $('editor').addEventListener('submit',saveCurrent);
  $('deleteBtn').addEventListener('click',deleteCurrent);
  $('exportBtn').addEventListener('click',exportJson);
  $('resetBtn').addEventListener('click',resetAll);
  bootstrapIfNeeded();
})();
