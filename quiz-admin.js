(function(){
  'use strict';

  const TABLE='osteo_quizzes';
  const QUESTION_COUNT=15;
  const $=id=>document.getElementById(id);

  let client=null;
  let quizzes=[];
  let selectedQuizId=null;
  let currentUser=null;

  function blankQuestion(index){
    return {
      id:`q${String(index+1).padStart(2,'0')}`,
      category:'Général',
      question:'',
      answers:['','','',''],
      correct:0,
      explanation:''
    };
  }

  function normalizeQuestions(input){
    const src=Array.isArray(input)?input:[];
    const out=[];
    for(let i=0;i<QUESTION_COUNT;i++){
      const q=src[i]||blankQuestion(i);
      const answers=Array.isArray(q.answers)?q.answers.slice(0,4):[];
      while(answers.length<4) answers.push('');
      out.push({
        id:String(q.id||`q${String(i+1).padStart(2,'0')}`),
        category:String(q.category||'Général'),
        question:String(q.question||''),
        answers:answers.map(x=>String(x||'')),
        correct:Number.isInteger(Number(q.correct))?Math.max(0,Math.min(3,Number(q.correct))):0,
        explanation:String(q.explanation||''),
        ...(q.customFeedback?{customFeedback:true}:{})
      });
    }
    return out;
  }

  function isQuestionComplete(q){
    return !!(
      String(q.question||'').trim() &&
      Array.isArray(q.answers) &&
      q.answers.filter(a=>String(a||'').trim()).length>=2 &&
      Number(q.correct)>=0 &&
      Number(q.correct)<q.answers.length
    );
  }

  function completeCount(questions){
    return normalizeQuestions(questions).filter(isQuestionComplete).length;
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function message(text,mode=''){
    const el=$('quizStatusMessage');
    if(!el) return;
    el.hidden=false;
    el.textContent=text;
    el.className='status '+mode;
  }

  function setTabs(mode){
    const quizMode=mode==='quiz';
    $('quizWorkspace').hidden=!quizMode;
    document.querySelector('.techniques-panel').hidden=quizMode;
    document.querySelector('.editor-panel').hidden=quizMode;
    $('techniquesTabBtn').classList.toggle('active',!quizMode);
    $('quizzesTabBtn').classList.toggle('active',quizMode);
    if(quizMode) loadQuizzes();
  }

  async function getClient(){
    if(window.OSTEO_BACKOFFICE_CLIENT){
      client=window.OSTEO_BACKOFFICE_CLIENT;
      const {data:{session}}=await client.auth.getSession();
      currentUser=session?.user||null;
      return client;
    }
    const cfg=window.OSTEO_SUPABASE||{};
    if(!window.supabase || !cfg.url || !cfg.anonKey) return null;
    client=window.supabase.createClient(cfg.url,cfg.anonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    const {data:{session}}=await client.auth.getSession();
    currentUser=session?.user||null;
    return client;
  }

  async function loadQuizzes(){
    if(!(await getClient())){
      $('quizCount').textContent='Base quiz non configurée';
      return;
    }

    const {data,error}=await client
      .from(TABLE)
      .select('id,slug,title,zone,status,questions,updated_at')
      .order('id',{ascending:true});

    if(error){
      $('quizCount').textContent='Base quiz à créer dans Supabase';
      $('quizList').innerHTML=`<div class="warning">Exécutez d’abord <strong>supabase-quizzes.sql</strong> dans Supabase.</div>`;
      return;
    }

    quizzes=data||[];
    renderQuizList();
    $('quizSeedBox').hidden=!(currentUser && quizzes.length===0 && window.OSTEO_QUIZ_SEED);
  }

  function renderQuizList(){
    const q=String($('quizSearch').value||'').trim().toLowerCase();
    const list=quizzes.filter(x=>!q || [x.title,x.slug,x.zone].join(' ').toLowerCase().includes(q));
    $('quizCount').textContent=`${quizzes.length} quiz · base indépendante · 15 questions par quiz`;

    $('quizList').innerHTML=list.map(x=>{
      const filled=completeCount(x.questions);
      return `<button class="item ${Number(x.id)===Number(selectedQuizId)?'active':''}" data-quiz-id="${x.id}">
        <span class="quiz-item-summary">
          <span class="badge">15</span>
          <span>
            <strong>${escapeHtml(x.title||'Quiz sans titre')}</strong>
            <small>${escapeHtml(x.zone||'Général')} · ${filled}/15 complètes</small>
          </span>
          <span class="quiz-status-pill ${escapeHtml(x.status)}">${x.status==='publie'?'Publié':'Brouillon'}</span>
        </span>
      </button>`;
    }).join('') || '<div class="empty">Aucun quiz.</div>';

    document.querySelectorAll('[data-quiz-id]').forEach(btn=>{
      btn.addEventListener('click',()=>openQuiz(Number(btn.dataset.quizId)));
    });
  }

  function openQuiz(id){
    const row=quizzes.find(x=>Number(x.id)===Number(id));
    if(!row) return;
    selectedQuizId=id;
    $('quizEditorEmpty').hidden=true;
    $('quizEditor').hidden=false;
    $('qId').value=row.id;
    $('qSlug').value=row.slug||'';
    $('qTitle').value=row.title||'';
    $('qZone').value=row.zone||'Général';
    $('qStatus').value=row.status||'brouillon';
    renderQuestions(normalizeQuestions(row.questions));
    renderQuizList();
  }

  function renderQuestions(questions){
    const normalized=normalizeQuestions(questions);
    $('quizQuestionsEditor').innerHTML=normalized.map((q,index)=>`
      <article class="quiz-question-card" data-question-index="${index}">
        <div class="quiz-question-head">
          <strong>Question ${index+1}</strong>
          <span>${index+1}</span>
        </div>
        <div class="quiz-question-grid">
          <label>Catégorie
            <input data-q-field="category" value="${escapeHtml(q.category)}" placeholder="Général, Sécurité…">
          </label>
          <label>Bonne réponse
            <select data-q-field="correct">
              <option value="0" ${q.correct===0?'selected':''}>A</option>
              <option value="1" ${q.correct===1?'selected':''}>B</option>
              <option value="2" ${q.correct===2?'selected':''}>C</option>
              <option value="3" ${q.correct===3?'selected':''}>D</option>
            </select>
          </label>
          <label class="wide">Question
            <textarea data-q-field="question" placeholder="Écrire la question…">${escapeHtml(q.question)}</textarea>
          </label>
          ${['A','B','C','D'].map((letter,i)=>`
            <label>Réponse ${letter}
              <input data-answer-index="${i}" value="${escapeHtml(q.answers[i]||'')}">
            </label>`).join('')}
          <label class="wide">Explication après réponse
            <textarea data-q-field="explanation" placeholder="Explication pédagogique…">${escapeHtml(q.explanation||'')}</textarea>
          </label>
        </div>
      </article>
    `).join('');

    $('quizQuestionsEditor').querySelectorAll('input,textarea,select').forEach(el=>{
      el.addEventListener('input',updateValidation);
      el.addEventListener('change',updateValidation);
    });
    updateValidation();
  }

  function collectQuestions(){
    return [...document.querySelectorAll('.quiz-question-card')].map((card,index)=>{
      const answers=[...card.querySelectorAll('[data-answer-index]')].map(x=>x.value.trim());
      return {
        id:`q${String(index+1).padStart(2,'0')}`,
        category:card.querySelector('[data-q-field="category"]').value.trim()||'Général',
        question:card.querySelector('[data-q-field="question"]').value.trim(),
        answers,
        correct:Number(card.querySelector('[data-q-field="correct"]').value||0),
        explanation:card.querySelector('[data-q-field="explanation"]').value.trim()
      };
    });
  }

  function updateValidation(){
    const questions=collectQuestions();
    const filled=questions.filter(isQuestionComplete).length;
    $('quizFilledCount').textContent=`${filled} / 15 complètes`;
    $('quizValidationState').textContent=filled===15?'Prêt à publier':`${15-filled} à compléter`;
    $('quizValidationState').className='detail-state '+(filled===15?'ok':'');
  }

  async function requireAdmin(){
    await getClient();
    if(!currentUser){
      message('Connectez-vous d’abord comme administrateur dans la base centrale.');
      return false;
    }
    return true;
  }

  function newQuiz(){
    if(!currentUser){
      message('Connectez-vous d’abord comme administrateur.');
      return;
    }
    selectedQuizId='new';
    $('quizEditorEmpty').hidden=true;
    $('quizEditor').hidden=false;
    $('qId').value='';
    $('qSlug').value='';
    $('qTitle').value='Nouveau quiz';
    $('qZone').value='Général';
    $('qStatus').value='brouillon';
    renderQuestions(Array.from({length:15},(_,i)=>blankQuestion(i)));
  }

  async function saveQuiz(event){
    event.preventDefault();
    if(!(await requireAdmin())) return;

    const questions=collectQuestions();
    const filled=questions.filter(isQuestionComplete).length;
    const status=$('qStatus').value;

    if(status==='publie' && filled!==15){
      message(`Impossible de publier : ${filled}/15 questions sont complètes.`);
      return;
    }

    const payload={
      slug:$('qSlug').value.trim().toLowerCase().replace(/\s+/g,'-'),
      title:$('qTitle').value.trim(),
      zone:$('qZone').value.trim()||'Général',
      status,
      questions
    };

    if(!payload.slug || !payload.title){
      message('Le titre et le slug sont obligatoires.');
      return;
    }

    let result;
    if(selectedQuizId==='new' || !selectedQuizId){
      result=await client.from(TABLE).insert(payload).select().single();
    }else{
      result=await client.from(TABLE).update(payload).eq('id',Number(selectedQuizId)).select().single();
    }

    if(result.error){
      message('Erreur Supabase : '+result.error.message);
      return;
    }

    selectedQuizId=result.data.id;
    message('Quiz enregistré dans la base indépendante.');
    await loadQuizzes();
    openQuiz(selectedQuizId);

    window.dispatchEvent(new CustomEvent('osteo-quiz-admin-saved',{detail:{slug:payload.slug}}));
  }

  async function deleteQuiz(){
    if(!(await requireAdmin()) || !selectedQuizId || selectedQuizId==='new') return;
    const row=quizzes.find(x=>Number(x.id)===Number(selectedQuizId));
    if(!confirm(`Supprimer le quiz « ${row?.title||''} » ?`)) return;
    const {error}=await client.from(TABLE).delete().eq('id',Number(selectedQuizId));
    if(error){ message('Erreur : '+error.message); return; }
    selectedQuizId=null;
    $('quizEditor').hidden=true;
    $('quizEditorEmpty').hidden=false;
    message('Quiz supprimé.');
    await loadQuizzes();
  }

  async function seedCurrentQuiz(){
    if(!(await requireAdmin())) return;
    const seed=window.OSTEO_QUIZ_SEED;
    if(!seed || !Array.isArray(seed.questions) || seed.questions.length!==15){
      message('Les 15 questions source sont introuvables.');
      return;
    }
    if(!confirm('Créer la base Quiz général avec les 15 questions actuelles d’Ostéo RA ?')) return;

    const payload={
      slug:seed.slug||'general',
      title:seed.title||'Quiz général',
      zone:seed.zone||'Général',
      status:'publie',
      questions:normalizeQuestions(seed.questions)
    };
    const {data,error}=await client.from(TABLE).upsert(payload,{onConflict:'slug'}).select().single();
    if(error){ message('Erreur : '+error.message); return; }
    selectedQuizId=data.id;
    message('Quiz général initialisé avec les 15 questions actuelles.');
    await loadQuizzes();
    openQuiz(selectedQuizId);
  }

  window.addEventListener('osteo-backoffice-auth',async event=>{
    currentUser=event.detail?.user||null;
    await loadQuizzes();
  });

  $('techniquesTabBtn').addEventListener('click',()=>setTabs('techniques'));
  $('quizzesTabBtn').addEventListener('click',()=>setTabs('quiz'));
  $('quizSearch').addEventListener('input',renderQuizList);
  $('newQuizBtn').addEventListener('click',newQuiz);
  $('quizEditor').addEventListener('submit',saveQuiz);
  $('deleteQuizBtn').addEventListener('click',deleteQuiz);
  $('reloadQuizzesBtn').addEventListener('click',loadQuizzes);
  $('seedQuizBtn').addEventListener('click',seedCurrentQuiz);

  getClient().then(loadQuizzes);
})();