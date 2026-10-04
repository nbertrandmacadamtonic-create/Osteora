(function(){
  'use strict';

  const QUESTIONS_TABLE='osteo_quiz_questions';
  const SETS_TABLE='osteo_quiz_sets';
  const $=id=>document.getElementById(id);

  let client=null;
  let currentUser=null;
  let questions=[];
  let quizSets=[];
  let selectedQuestionId=null;
  let selectedSetId=null;

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function status(elId,text,mode=''){
    const el=$(elId); if(!el) return;
    el.hidden=false; el.textContent=text; el.className='status '+mode;
  }

  async function getClient(){
    if(window.OSTEO_BACKOFFICE_CLIENT){
      client=window.OSTEO_BACKOFFICE_CLIENT;
    }else{
      const cfg=window.OSTEO_SUPABASE||{};
      if(!window.supabase || !cfg.url || !cfg.anonKey) return null;
      client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    }
    const {data:{session}}=await client.auth.getSession();
    currentUser=session?.user||null;
    return client;
  }

  async function requireAdmin(messageId){
    await getClient();
    if(currentUser) return true;
    status(messageId,'Connexion administrateur requise. Reconnectez-vous en haut du back-office.');
    return false;
  }

  function setMainTab(mode){
    const quizMode=mode==='quiz';
    $('quizWorkspace').hidden=!quizMode;
    document.querySelector('.techniques-panel').hidden=quizMode;
    document.querySelector('.editor-panel').hidden=quizMode;
    $('techniquesTabBtn').classList.toggle('active',!quizMode);
    $('quizzesTabBtn').classList.toggle('active',quizMode);
    if(quizMode){ setQuizSubTab('sets'); loadAll(); }
  }

  function setQuizSubTab(mode){
    const sets=mode==='sets';
    $('quizSetsView').hidden=!sets;
    $('questionBankView').hidden=sets;
    $('quizSetsSubTab').classList.toggle('active',sets);
    $('questionBankSubTab').classList.toggle('active',!sets);
    if(sets) loadQuizSets(); else loadQuestions();
  }

  async function loadAll(){
    await Promise.all([loadQuestions(),loadQuizSets()]);
  }

  // --------------------------- QUIZ DEFINITIONS ---------------------------
  function questionCountForSet(set){
    if(!set) return 0;
    if(set.kind==='general') return questions.filter(q=>q.status==='publie').length;
    if(set.kind==='zone') return questions.filter(q=>q.status==='publie' && q.zone===set.zone).length;
    return questions.filter(q=>q.status==='publie' && q.zone===set.zone && String(q.subzone||'').trim()===String(set.subzone||'').trim()).length;
  }

  async function loadQuizSets(){
    if(!(await getClient())) return;
    const {data,error}=await client.from(SETS_TABLE).select('*').order('position',{ascending:true}).order('id',{ascending:true});
    if(error){
      $('quizSetCount').textContent='Base des quiz à créer dans Supabase';
      $('quizSetList').innerHTML='<div class="warning">Exécutez <strong>supabase-quiz-sets.sql</strong> dans Supabase.</div>';
      return;
    }
    quizSets=data||[];
    renderQuizSets();
  }

  function renderQuizSets(){
    const search=String($('quizSetSearch').value||'').trim().toLowerCase();
    const filtered=quizSets.filter(q=>!search || [q.title,q.slug,q.zone,q.subzone].join(' ').toLowerCase().includes(search));
    $('quizSetCount').textContent=`${quizSets.length} quiz · ${quizSets.filter(q=>q.status==='publie').length} publiés`;
    $('quizSetList').innerHTML=filtered.map(q=>{
      const count=questionCountForSet(q);
      return `<button class="item ${Number(q.id)===Number(selectedSetId)?'active':''}" data-set-id="${q.id}">
        <span class="quiz-set-item">
          <span class="badge">15</span>
          <span><strong>${escapeHtml(q.title)}</strong><small>${escapeHtml(q.kind==='general'?'Général':(q.subzone||q.zone||''))} · ${count} questions disponibles</small></span>
          <span class="pill ${escapeHtml(q.status)}">${q.status==='publie'?'Publié':'Brouillon'}</span>
        </span>
      </button>`;
    }).join('') || '<div class="empty">Aucun quiz. Cliquez sur « Nouveau quiz ».</div>';
    document.querySelectorAll('[data-set-id]').forEach(b=>b.addEventListener('click',()=>openQuizSet(Number(b.dataset.setId))));
  }

  function updateSetAvailability(){
    const tmp={kind:$('qsKind').value,zone:$('qsZone').value,subzone:$('qsSubzone').value.trim()};
    const count=questionCountForSet(tmp);
    const el=$('quizSetAvailability');
    el.textContent=`${count} question${count>1?'s':''} disponible${count>1?'s':''} · ${count>=15?'prêt':'15 requises'}`;
    el.className='detail-state '+(count>=15?'ok':'');
    $('qsZone').disabled=tmp.kind==='general';
    $('qsSubzone').disabled=tmp.kind!=='subzone';
  }

  function openQuizSet(id){
    const q=quizSets.find(x=>Number(x.id)===Number(id)); if(!q) return;
    selectedSetId=id;
    $('quizSetEditorEmpty').hidden=true; $('quizSetEditor').hidden=false;
    $('qsId').value=q.id; $('qsSlug').value=q.slug||''; $('qsTitle').value=q.title||'';
    $('qsKind').value=q.kind||'general'; $('qsZone').value=q.zone||''; $('qsSubzone').value=q.subzone||'';
    $('qsStatus').value=q.status||'brouillon'; $('qsPosition').value=Number(q.position)||100;
    updateSetAvailability(); renderQuizSets();
  }

  async function newQuizSet(){
    if(!(await requireAdmin('quizSetStatusMessage'))) return;
    selectedSetId='new'; $('quizSetEditorEmpty').hidden=true; $('quizSetEditor').hidden=false;
    $('qsId').value=''; $('qsSlug').value=''; $('qsTitle').value='Nouveau quiz'; $('qsKind').value='zone';
    $('qsZone').value='Rachis'; $('qsSubzone').value=''; $('qsStatus').value='brouillon'; $('qsPosition').value='100';
    updateSetAvailability();
  }

  function setPayload(){
    return {
      slug:$('qsSlug').value.trim().toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ-]+/gi,'-').replace(/^-+|-+$/g,''),
      title:$('qsTitle').value.trim(), kind:$('qsKind').value,
      zone:$('qsKind').value==='general'?'':$('qsZone').value,
      subzone:$('qsKind').value==='subzone'?$('qsSubzone').value.trim():'',
      question_count:15, status:$('qsStatus').value, position:Number($('qsPosition').value)||100
    };
  }

  async function saveQuizSet(e){
    e.preventDefault(); if(!(await requireAdmin('quizSetStatusMessage'))) return;
    const p=setPayload();
    if(!p.slug || !p.title){ status('quizSetStatusMessage','Titre et identifiant obligatoires.'); return; }
    if(p.kind!=='general' && !p.zone){ status('quizSetStatusMessage','Choisissez une zone.'); return; }
    if(p.kind==='subzone' && !p.subzone){ status('quizSetStatusMessage','Indiquez une sous-zone.'); return; }
    let result;
    if(selectedSetId==='new' || !selectedSetId) result=await client.from(SETS_TABLE).insert(p).select().single();
    else result=await client.from(SETS_TABLE).update(p).eq('id',Number(selectedSetId)).select().single();
    if(result.error){ status('quizSetStatusMessage','Erreur Supabase : '+result.error.message); return; }
    selectedSetId=result.data.id; status('quizSetStatusMessage','Quiz enregistré.','ok');
    await loadQuizSets(); openQuizSet(selectedSetId);
  }

  async function deleteQuizSet(){
    if(!(await requireAdmin('quizSetStatusMessage')) || !selectedSetId || selectedSetId==='new') return;
    const q=quizSets.find(x=>Number(x.id)===Number(selectedSetId));
    if(!confirm(`Supprimer le quiz « ${q?.title||''} » ?`)) return;
    const {error}=await client.from(SETS_TABLE).delete().eq('id',Number(selectedSetId));
    if(error){ status('quizSetStatusMessage','Erreur : '+error.message); return; }
    selectedSetId=null; $('quizSetEditor').hidden=true; $('quizSetEditorEmpty').hidden=false;
    status('quizSetStatusMessage','Quiz supprimé.','ok'); await loadQuizSets();
  }

  // --------------------------- QUESTION BANK ---------------------------
  function zoneCounts(){
    const zones=['Rachis','Bassin','Membres supérieurs','Membres inférieurs'];
    $('questionBankStats').innerHTML=[['Total',questions.length],...zones.map(z=>[z,questions.filter(q=>q.zone===z&&q.status==='publie').length])]
      .map(([label,count])=>`<div class="question-bank-stat"><b>${count}</b><span>${escapeHtml(label)}</span></div>`).join('');
  }

  async function loadQuestions(){
    if(!(await getClient())) return;
    const {data,error}=await client.from(QUESTIONS_TABLE).select('*').order('id',{ascending:true});
    if(error){
      $('quizCount').textContent='Banque à créer dans Supabase';
      $('quizList').innerHTML='<div class="warning">Exécutez <strong>supabase-question-bank.sql</strong> dans Supabase.</div>';
      return;
    }
    questions=data||[]; renderQuestionsList();
    $('quizSeedBox').hidden=!(currentUser && questions.length===0 && window.OSTEO_QUIZ_SEED);
    if(quizSets.length) renderQuizSets();
  }

  function renderQuestionsList(){
    const search=String($('quizSearch').value||'').trim().toLowerCase(); const zone=$('quizZoneFilter').value;
    const filtered=questions.filter(q=>(!zone||q.zone===zone) && (!search||[q.code,q.zone,q.subzone,q.category,q.question].join(' ').toLowerCase().includes(search)));
    $('quizCount').textContent=`${questions.length} questions · ${questions.filter(q=>q.status==='publie').length} publiées`; zoneCounts();
    $('quizList').innerHTML=filtered.map(q=>`<button class="item ${Number(q.id)===Number(selectedQuestionId)?'active':''}" data-question-id="${q.id}">
      <span class="question-bank-item"><span class="badge">?</span><span><strong>${escapeHtml(q.question||'Question sans texte')}</strong><small>${escapeHtml(q.zone||'Général')} · ${escapeHtml(q.subzone||q.category||'')}</small></span><span class="pill ${escapeHtml(q.status)}">${q.status==='publie'?'Publié':'Brouillon'}</span></span>
    </button>`).join('') || '<div class="empty">Aucune question.</div>';
    document.querySelectorAll('[data-question-id]').forEach(b=>b.addEventListener('click',()=>openQuestion(Number(b.dataset.questionId))));
  }

  function openQuestion(id){
    const q=questions.find(x=>Number(x.id)===Number(id)); if(!q) return; selectedQuestionId=id;
    $('quizEditorEmpty').hidden=true; $('quizEditor').hidden=false;
    $('qId').value=q.id; $('qSlug').value=q.code||''; $('qZone').value=q.zone||'Général'; $('qSubzone').value=q.subzone||'';
    $('qCategory').value=q.category||'Général'; $('qLevel').value=q.level||'Tous niveaux'; $('qStatus').value=q.status||'brouillon'; $('qQuestion').value=q.question||'';
    const a=Array.isArray(q.answers)?q.answers:['','','','']; ['A','B','C','D'].forEach((l,i)=>$('qAnswer'+l).value=a[i]||'');
    $('qCorrect').value=String(Number(q.correct)||0); $('qExplanation').value=q.explanation||''; updateQuestionValidation(); renderQuestionsList();
  }

  function questionPayload(){
    return {code:$('qSlug').value.trim(),zone:$('qZone').value,subzone:$('qSubzone').value.trim(),category:$('qCategory').value.trim()||'Général',level:$('qLevel').value,
      question:$('qQuestion').value.trim(),answers:['A','B','C','D'].map(l=>$('qAnswer'+l).value.trim()),correct:Number($('qCorrect').value||0),explanation:$('qExplanation').value.trim(),status:$('qStatus').value};
  }
  function questionComplete(p){return !!(p.code&&p.question&&p.answers.filter(Boolean).length===4&&p.answers[p.correct]);}
  function updateQuestionValidation(){const ok=questionComplete(questionPayload()); $('quizValidationState').textContent=ok?'Question complète':'À compléter'; $('quizValidationState').className='detail-state '+(ok?'ok':'');}

  async function newQuestion(){
    if(!(await requireAdmin('quizStatusMessage'))) return;
    selectedQuestionId='new'; $('quizEditorEmpty').hidden=true; $('quizEditor').hidden=false;
    $('qId').value=''; $('qSlug').value=`question-${Date.now()}`; $('qZone').value='Général'; $('qSubzone').value=''; $('qCategory').value='Général'; $('qLevel').value='Tous niveaux'; $('qStatus').value='brouillon'; $('qQuestion').value='';
    ['A','B','C','D'].forEach(l=>$('qAnswer'+l).value=''); $('qCorrect').value='0'; $('qExplanation').value=''; updateQuestionValidation();
  }

  async function saveQuestion(e){
    e.preventDefault(); if(!(await requireAdmin('quizStatusMessage'))) return; const p=questionPayload();
    if(!questionComplete(p)){status('quizStatusMessage','Complétez le code, la question et les 4 réponses.');return;}
    let result;
    if(selectedQuestionId==='new'||!selectedQuestionId) result=await client.from(QUESTIONS_TABLE).insert(p).select().single();
    else result=await client.from(QUESTIONS_TABLE).update(p).eq('id',Number(selectedQuestionId)).select().single();
    if(result.error){status('quizStatusMessage','Erreur Supabase : '+result.error.message);return;}
    selectedQuestionId=result.data.id; status('quizStatusMessage','Question enregistrée.','ok'); await loadQuestions(); openQuestion(selectedQuestionId); await loadQuizSets();
  }

  async function deleteQuestion(){
    if(!(await requireAdmin('quizStatusMessage'))||!selectedQuestionId||selectedQuestionId==='new') return;
    const q=questions.find(x=>Number(x.id)===Number(selectedQuestionId)); if(!confirm(`Supprimer cette question ?\n\n${q?.question||''}`)) return;
    const {error}=await client.from(QUESTIONS_TABLE).delete().eq('id',Number(selectedQuestionId)); if(error){status('quizStatusMessage','Erreur : '+error.message);return;}
    selectedQuestionId=null; $('quizEditor').hidden=true; $('quizEditorEmpty').hidden=false; status('quizStatusMessage','Question supprimée.','ok'); await loadQuestions(); await loadQuizSets();
  }

  async function seedQuestions(){
    if(!(await requireAdmin('quizStatusMessage'))) return; const seed=window.OSTEO_QUIZ_SEED;
    if(!seed?.questions || seed.questions.length!==15){status('quizStatusMessage','Les 15 questions source sont introuvables.');return;}
    const payload=seed.questions.map((q,i)=>({code:`general-${String(i+1).padStart(3,'0')}`,zone:'Général',subzone:'',category:String(q.category||'Général'),level:'Tous niveaux',question:String(q.question||''),answers:[0,1,2,3].map(j=>String(q.answers?.[j]||'')),correct:Number(q.correct||0),explanation:String(q.explanation||''),status:'publie'}));
    const {error}=await client.from(QUESTIONS_TABLE).upsert(payload,{onConflict:'code'}); if(error){status('quizStatusMessage','Erreur : '+error.message);return;}
    status('quizStatusMessage','15 questions générales importées.','ok'); await loadAll();
  }

  // --------------------------- EVENTS ---------------------------
  window.addEventListener('osteo-backoffice-auth',async e=>{currentUser=e.detail?.user||null; if(!$('quizWorkspace').hidden) await loadAll();});
  $('techniquesTabBtn').addEventListener('click',()=>setMainTab('techniques'));
  $('quizzesTabBtn').addEventListener('click',()=>setMainTab('quiz'));
  $('quizSetsSubTab').addEventListener('click',()=>setQuizSubTab('sets'));
  $('questionBankSubTab').addEventListener('click',()=>setQuizSubTab('bank'));

  $('quizSetSearch').addEventListener('input',renderQuizSets); $('newQuizSetBtn').addEventListener('click',newQuizSet);
  $('quizSetEditor').addEventListener('submit',saveQuizSet); $('deleteQuizSetBtn').addEventListener('click',deleteQuizSet); $('reloadQuizSetsBtn').addEventListener('click',loadQuizSets);
  ['qsKind','qsZone','qsSubzone'].forEach(id=>{$(id).addEventListener('input',updateSetAvailability);$(id).addEventListener('change',updateSetAvailability);});

  $('quizSearch').addEventListener('input',renderQuestionsList); $('quizZoneFilter').addEventListener('change',renderQuestionsList); $('newQuizBtn').addEventListener('click',newQuestion);
  $('quizEditor').addEventListener('submit',saveQuestion); $('deleteQuizBtn').addEventListener('click',deleteQuestion); $('reloadQuizzesBtn').addEventListener('click',loadQuestions); $('seedQuizBtn').addEventListener('click',seedQuestions);
  ['qSlug','qZone','qSubzone','qCategory','qLevel','qStatus','qQuestion','qAnswerA','qAnswerB','qAnswerC','qAnswerD','qCorrect','qExplanation'].forEach(id=>{$(id)?.addEventListener('input',updateQuestionValidation);$(id)?.addEventListener('change',updateQuestionValidation);});

  getClient().then(loadAll);
})();