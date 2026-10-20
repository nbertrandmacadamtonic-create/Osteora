/* =========================================================
   OSTÉO PRATIK V19.4 — SOCLE UTILISATEUR
   Favoris + À revoir + dernière technique + progression + quiz/stats

   Objectif : chaque compte retrouve SES données sur tous ses appareils.
   L'interface existante d'Ostéo Pratik reste intacte : cette couche ne
   remplace pas les écrans, elle alimente leurs données via Supabase.
   ========================================================= */
(function(){
  'use strict';

  const VERSION='19.16';
  const T_FAVORITES='osteo_user_favorites';
  const T_STATE='osteo_user_state';
  const T_PROGRESS='osteo_user_technique_progress';
  const T_QUIZ='osteo_user_quiz_results';

  const LAST_PRACTICE_KEY='osteoPratikLastPractice';
  const LAST_QUIZ_KEY='osteoPratikLastQuiz';
  const VIEWED_KEYS=[
    'osteoPratikViewedTechniqueIdsCleanV1',
    'osteoPratikStrictViewedTechniqueIdsV2',
    'osteoPratikViewedTechniqueIds'
  ];

  let client=null;
  let session=null;
  let userId=null;
  let favorites=new Set();
  let progressRows=[];
  let quizResults=[];
  let stateRow=null;
  let loading=false;
  let loadSerial=0;
  let observer=null;
  let seenHubMode='seen';
  let quizAnswerQueue=Promise.resolve();
  let lastQuizSaveSignature='';
  let lastQuizSaveAt=0;

  const $=id=>document.getElementById(id);

  function resolveFunction(name){
    try{if(typeof window[name]==='function') return window[name];}catch(_){}
    try{return eval('typeof '+name+'==="function" ? '+name+' : null');}catch(_){}
    return null;
  }

  function listTechniques(){
    try{if(Array.isArray(techniques)) return techniques;}catch(_){}
    try{if(Array.isArray(window.techniques)) return window.techniques;}catch(_){}
    return [];
  }

  function techniqueById(id){
    return listTechniques().find(t=>String(t.id)===String(id))||null;
  }

  function currentTechnique(){
    const getter=resolveFunction('getCurrentTechnique');
    if(getter){
      try{const t=getter(); if(t) return t;}catch(_){}
    }
    try{
      const id=typeof currentPlayerTechniqueId!=='undefined' ? currentPlayerTechniqueId : window.currentPlayerTechniqueId;
      return techniqueById(id);
    }catch(_){return null;}
  }

  function appToast(message){
    const f=resolveFunction('toast');
    if(f){try{f(message);return;}catch(_){}}
    console.log('[Ostéo Pratik]',message);
  }

  function esc(v){
    return String(v??'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function cacheKey(kind){
    return userId ? `osteoPratik.user.${userId}.${kind}.v19` : '';
  }

  function saveCache(){
    if(!userId) return;
    try{
      localStorage.setItem(cacheKey('favorites'),JSON.stringify([...favorites]));
      localStorage.setItem(cacheKey('progress'),JSON.stringify(progressRows||[]));
      localStorage.setItem(cacheKey('quiz-results'),JSON.stringify(quizResults||[]));
      localStorage.setItem(cacheKey('state'),JSON.stringify(stateRow||null));
    }catch(_){}
  }

  function readCache(){
    if(!userId) return null;
    try{
      return {
        favorites:JSON.parse(localStorage.getItem(cacheKey('favorites'))||'[]'),
        progress:JSON.parse(localStorage.getItem(cacheKey('progress'))||'[]'),
        quizResults:JSON.parse(localStorage.getItem(cacheKey('quiz-results'))||'[]'),
        state:JSON.parse(localStorage.getItem(cacheKey('state'))||'null')
      };
    }catch(_){return null;}
  }

  function writeViewedIds(ids){
    const clean=[...new Set((ids||[]).map(Number).filter(n=>Number.isFinite(n)&&n>0))];
    VIEWED_KEYS.forEach(k=>{
      try{localStorage.setItem(k,JSON.stringify(clean));}catch(_){}
    });

    // Compatibilité avec le Set déjà chargé dans index.html.
    try{
      const set=eval('typeof unlockedTechniqueIds!=="undefined" ? unlockedTechniqueIds : null');
      if(set&&typeof set.clear==='function'){
        set.clear();
        // V19.4 : l'album reflète uniquement les techniques réellement vues
        // par le compte connecté. Plus de cartes de démonstration ajoutées d'office.
        clean.forEach(id=>set.add(id));
      }
    }catch(_){}
  }

  function applyStateToCompatibilityStorage(){
    if(stateRow?.last_technique_id){
      const t=techniqueById(stateRow.last_technique_id);
      const v={
        id:Number(stateRow.last_technique_id)||stateRow.last_technique_id,
        title:stateRow.last_technique_title||t?.title||'Technique',
        zone:stateRow.last_zone||t?.zone||'',
        sub:stateRow.last_subzone||t?.sub||'',
        level:stateRow.last_level||t?.level||'',
        date:stateRow.last_opened_at||stateRow.updated_at||new Date().toISOString()
      };
      try{localStorage.setItem(LAST_PRACTICE_KEY,JSON.stringify(v));}catch(_){}
    }else{
      try{localStorage.removeItem(LAST_PRACTICE_KEY);}catch(_){}
    }

    if(stateRow?.last_quiz_total!=null && stateRow?.last_quiz_score!=null){
      const q={
        category:stateRow.last_quiz_title||'Quiz Ostéo Pratik',
        score:Number(stateRow.last_quiz_score)||0,
        total:Number(stateRow.last_quiz_total)||0,
        percent:Number(stateRow.last_quiz_percent)||0,
        date:stateRow.last_quiz_at||stateRow.updated_at||new Date().toISOString()
      };
      try{localStorage.setItem(LAST_QUIZ_KEY,JSON.stringify(q));}catch(_){}
    }else{
      try{localStorage.removeItem(LAST_QUIZ_KEY);}catch(_){}
    }
  }

  function isViewedRow(r){
    return !!(r && (
      r.completed_at ||
      Number(r.percent)>=100 ||
      String(r.status||'').toLowerCase()==='vue'
    ));
  }

  function viewedTechniqueIdSet(){
    return new Set((progressRows||[])
      .filter(isViewedRow)
      .map(r=>String(r.technique_id||''))
      .filter(Boolean));
  }

  function applyProgressToTechniques(){
    listTechniques().forEach(t=>{
      const r=progressRowFor(t.id);
      if(r){
        const viewed=isViewed(t.id);
        t.status=viewed?'vue':String(r.status||'non vue');
        t.percent=viewed?100:Math.max(0,Math.min(100,Number(r.percent)||0));
      }else{
        t.status='non vue';
        t.percent=0;
      }
    });

    const viewed=[...viewedTechniqueIdSet()]
      .map(Number)
      .filter(Boolean);
    writeViewedIds(viewed);
  }

  function refreshExistingViews(){
    [
      'renderLastPracticeCard','renderTechniques','renderSeenCollections',
      'renderRevisionWheel','updateZoneStats','updateProgressZoneStats',
      'updateHomeCount','updateCatalogueCounts','updateMSupRegionCounts',
      'updateMInfRegionCounts','updateBassinRegionCounts'
    ].forEach(name=>{
      try{const f=resolveFunction(name); if(f) f();}catch(_){}
    });
    renderFavorites();
    updateHearts();
    updateStatusBars();
    renderSeenHub();
    renderCoreStats();
    renderLearningStats();
  }

  function applyAll(){
    applyProgressToTechniques();
    applyStateToCompatibilityStorage();
    saveCache();
    refreshExistingViews();
  }

  function clearVisibleUserData(){
    favorites=new Set();
    progressRows=[];
    quizResults=[];
    stateRow=null;
    writeViewedIds([]);
    try{localStorage.removeItem(LAST_PRACTICE_KEY);}catch(_){}
    try{localStorage.removeItem(LAST_QUIZ_KEY);}catch(_){}
    listTechniques().forEach(t=>{t.status='non vue';t.percent=0;});
    refreshExistingViews();
  }

  async function ensureSession(){
    client=window.OSTEO_APP_AUTH_CLIENT||client;
    if(!client) return null;
    try{
      const {data}=await client.auth.getSession();
      session=data?.session||null;
      userId=session?.user?.id||null;
      return session;
    }catch(_){
      session=null; userId=null; return null;
    }
  }

  async function loadUserData(){
    if(loading) return;
    const serial=++loadSerial;
    loading=true;

    try{
      const s=await ensureSession();
      if(!s?.user?.id){
        clearVisibleUserData();
        return;
      }

      const cache=readCache();
      if(cache){
        favorites=new Set(Array.isArray(cache.favorites)?cache.favorites.map(String):[]);
        progressRows=Array.isArray(cache.progress)?cache.progress:[];
        quizResults=Array.isArray(cache.quizResults)?cache.quizResults:[];
        stateRow=cache.state||null;
        applyAll();
      }

      const [favRes,progressRes,stateRes,quizRes]=await Promise.all([
        client.from(T_FAVORITES).select('technique_id,created_at').eq('user_id',userId).order('created_at',{ascending:false}),
        client.from(T_PROGRESS).select('*').eq('user_id',userId).order('updated_at',{ascending:false}),
        client.from(T_STATE).select('*').eq('user_id',userId).maybeSingle(),
        client.from(T_QUIZ).select('*').eq('user_id',userId).limit(100)
      ]);

      if(favRes.error) throw favRes.error;
      if(progressRes.error) throw progressRes.error;
      if(stateRes.error) throw stateRes.error;
      if(serial!==loadSerial) return;

      favorites=new Set((favRes.data||[]).map(r=>String(r.technique_id)));
      progressRows=progressRes.data||[];
      stateRow=stateRes.data||null;
      quizResults=quizRes.error ? [] : (quizRes.data||[]);
      await cleanupInvalidReviews();
      applyAll();
    }catch(error){
      console.warn('[Ostéo Pratik V19.9] Données utilisateur : cache local utilisé.',error);
    }finally{
      loading=false;
    }
  }

  function injectStyles(){
    if($('osteoUserDataV19Styles')) return;
    const style=document.createElement('style');
    style.id='osteoUserDataV19Styles';
    style.textContent=`
      .osteo-v19-heart-active{color:#ff5f91!important;border-color:rgba(255,95,145,.55)!important;background:rgba(255,95,145,.10)!important;box-shadow:0 0 20px rgba(255,95,145,.18)!important}
      #favorites .osteo-v19-fav-summary{display:flex;justify-content:space-between;align-items:center;margin:4px 0 14px;padding:12px 14px;border-radius:18px;border:1px solid rgba(255,95,145,.22);background:rgba(255,95,145,.045)}
      #favorites .osteo-v19-fav-summary strong{color:#fff}#favorites .osteo-v19-fav-summary b{color:#ff7da3;font-size:18px}
      #favorites .osteo-v19-fav-list{display:grid;gap:11px}
      #favorites .osteo-v19-fav-card{width:100%;display:grid;grid-template-columns:48px minmax(0,1fr) 42px;gap:11px;align-items:center;padding:12px;border-radius:21px;border:1px solid rgba(170,205,225,.16);background:linear-gradient(145deg,rgba(10,29,55,.82),rgba(5,15,31,.90));text-align:left;color:#fff}
      #favorites .osteo-v19-fav-icon,#favorites .osteo-v19-fav-remove{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;border:1px solid rgba(255,95,145,.32);color:#ff6f9b;background:rgba(255,95,145,.07);font-size:21px}
      #favorites .osteo-v19-fav-main{min-width:0;text-align:left;color:#fff}#favorites .osteo-v19-fav-main strong{display:block;font-size:15px;line-height:1.2}#favorites .osteo-v19-fav-main small{display:block;margin-top:5px;color:#9db0c8;font-size:11px;line-height:1.25}
      #favorites .osteo-v19-empty{padding:28px 18px;border-radius:22px;border:1px dashed rgba(170,205,225,.18);background:rgba(255,255,255,.02);color:#97aac2;text-align:center;line-height:1.45}#favorites .osteo-v19-empty b{display:block;margin-bottom:7px;color:#fff;font-size:16px}
      .osteo-v19-statusbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 14px}
      .osteo-v19-statusbtn{min-height:42px;padding:8px 9px;border-radius:15px;border:1px solid rgba(170,205,225,.18);background:rgba(255,255,255,.035);color:#aebbd0;font-size:11px;font-weight:900;line-height:1.15;text-align:center}
      .osteo-v19-statusbtn[disabled]{opacity:.72;cursor:default}
      .osteo-v19-statusbtn.is-viewed{color:#00e6a7;border-color:rgba(0,230,167,.38);background:rgba(0,230,167,.08)}
      .osteo-v19-statusbtn.is-review{color:#ffb020;border-color:rgba(255,176,32,.50);background:rgba(255,176,32,.10);box-shadow:0 0 18px rgba(255,176,32,.08)}
      .osteo-v19-statusbtn.is-favorite{color:#ff6f9b;border-color:rgba(255,95,145,.50);background:rgba(255,95,145,.10);box-shadow:0 0 18px rgba(255,95,145,.08)}
      #seenCollections .osteo-v19-seen-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px}
      #seenCollections .osteo-v19-seen-tab{min-height:46px;border-radius:16px;border:1px solid rgba(170,205,225,.18);background:rgba(255,255,255,.035);color:#aebbd0;font-size:12px;font-weight:950;display:flex;align-items:center;justify-content:center;gap:7px}
      #seenCollections .osteo-v19-seen-tab b{min-width:22px;height:22px;padding:0 6px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.06);font-size:10px}
      #seenCollections .osteo-v19-seen-tab.active[data-mode="seen"]{color:#00e6a7;border-color:rgba(0,230,167,.42);background:rgba(0,230,167,.08);box-shadow:0 0 18px rgba(0,230,167,.08)}
      #seenCollections .osteo-v19-seen-tab.active[data-mode="review"]{color:#ffb020;border-color:rgba(255,176,32,.52);background:rgba(255,176,32,.10);box-shadow:0 0 18px rgba(255,176,32,.09)}
      #seenCollections .osteo-v19-review-panel{display:grid;gap:10px;margin:2px 0 18px}
      #seenCollections .osteo-v19-review-summary{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:18px;border:1px solid rgba(255,176,32,.28);background:rgba(255,176,32,.055)}
      #seenCollections .osteo-v19-review-summary strong{color:#fff;font-size:14px}#seenCollections .osteo-v19-review-summary b{color:#ffb020;font-size:18px}
      #seenCollections .osteo-v19-review-list{display:grid;gap:10px}
      #seenCollections .osteo-v19-review-card{width:100%;display:grid;grid-template-columns:42px minmax(0,1fr) 34px;gap:11px;align-items:center;padding:12px;border-radius:20px;border:1px solid rgba(255,176,32,.23);background:linear-gradient(145deg,rgba(10,29,55,.82),rgba(5,15,31,.90));color:#fff;text-align:left}
      #seenCollections .osteo-v19-review-card .mark{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;color:#ffb020;border:1px solid rgba(255,176,32,.38);background:rgba(255,176,32,.08);font-weight:950}
      #seenCollections .osteo-v19-review-card strong{display:block;font-size:14px;line-height:1.2;color:#fff}#seenCollections .osteo-v19-review-card small{display:block;margin-top:5px;color:#9db0c8;font-size:11px;line-height:1.25}
      #seenCollections .osteo-v19-review-card .arrow{color:#ffb020;font-size:22px;text-align:center}
      #seenCollections .osteo-v19-review-empty{padding:28px 18px;border-radius:22px;border:1px dashed rgba(255,176,32,.28);background:rgba(255,176,32,.035);color:#9eacc0;text-align:center;line-height:1.45}
      #seenCollections .osteo-v19-review-empty b{display:block;margin-bottom:7px;color:#fff;font-size:16px}
      @media(max-width:360px){.osteo-v19-statusbar{gap:6px}.osteo-v19-statusbtn{font-size:10px;padding:7px 5px}#seenCollections .osteo-v19-seen-tab{font-size:11px}}
    `;
    document.head.appendChild(style);
  }

  function progressRowsFor(id){
    return (progressRows||[]).filter(r=>String(r.technique_id)===String(id));
  }

  function progressRowFor(id){
    const rows=progressRowsFor(id);
    return rows.find(isViewedRow) || rows[0] || null;
  }

  function isViewed(id){
    return progressRowsFor(id).some(isViewedRow);
  }

  function isReview(id){
    return isViewed(id) && progressRowsFor(id).some(r=>r?.review_needed===true);
  }

  async function cleanupInvalidReviews(){
    const invalid=(progressRows||[]).filter(r=>
      r?.review_needed===true &&
      !isViewed(r.technique_id)
    );
    if(!invalid.length) return;

    invalid.forEach(r=>{ r.review_needed=false; });
    saveCache();

    if(!client || !userId) return;
    await Promise.allSettled(invalid.map(r=>client.rpc('osteo_set_technique_review',{
      p_technique_id:String(r.technique_id),
      p_review:false,
      p_title:String(r.title||''),
      p_zone:String(r.zone||''),
      p_subzone:String(r.subzone||''),
      p_level:String(r.level||'')
    })));
  }

  function ensureStatusBar(container){
    if(!container) return null;
    let bar=container.querySelector(':scope > .osteo-v19-statusbar');
    if(bar) return bar;

    bar=document.createElement('div');
    bar.className='osteo-v19-statusbar';
    bar.innerHTML=`
      <button type="button" class="osteo-v19-statusbtn osteo-v19-view" disabled>Non vue ○</button>
      <button type="button" class="osteo-v19-statusbtn osteo-v19-review">À revoir</button>
      <button type="button" class="osteo-v19-statusbtn osteo-v19-favorite">♡ Favori</button>
    `;

    const review=bar.querySelector('.osteo-v19-review');
    const favorite=bar.querySelector('.osteo-v19-favorite');
    review.addEventListener('click',async()=>{
      const t=currentTechnique();
      if(t) await toggleReview(t);
    });
    favorite.addEventListener('click',async()=>{
      const t=currentTechnique();
      if(t) await toggleFavorite(t);
    });

    if(container.id==='player'){
      const chips=$('playerChips');
      if(chips?.parentNode) chips.insertAdjacentElement('afterend',bar);
      else container.querySelector('header.top')?.insertAdjacentElement('afterend',bar) || container.prepend(bar);
    }else if(container.id==='techniqueDetail'){
      const hero=container.querySelector('.fiche-hero,.fiche-hero-visual,.fiche-premium-hero');
      if(hero) hero.insertAdjacentElement('beforebegin',bar);
      else container.querySelector('header.top')?.insertAdjacentElement('afterend',bar) || container.prepend(bar);
    }else if(container.id==='osteoTechniqueWorld'){
      const top=container.querySelector('.osteo-v157-top');
      if(top) top.insertAdjacentElement('afterend',bar);
      else container.prepend(bar);
    }
    return bar;
  }

  function updateStatusBar(container){
    if(!container) return;
    const t=currentTechnique();
    if(!t) return;
    const bar=ensureStatusBar(container);
    if(!bar) return;

    const viewed=isViewed(t.id);
    const review=isReview(t.id);
    const favorite=favorites.has(String(t.id));
    const viewBtn=bar.querySelector('.osteo-v19-view');
    const reviewBtn=bar.querySelector('.osteo-v19-review');
    const favBtn=bar.querySelector('.osteo-v19-favorite');

    viewBtn.textContent=viewed?'Vue ✓':'Non vue ○';
    viewBtn.classList.toggle('is-viewed',viewed);
    reviewBtn.textContent=review?'✓ À revoir':'À revoir';
    reviewBtn.classList.toggle('is-review',review);
    reviewBtn.disabled=!viewed && !review;
    reviewBtn.setAttribute('aria-disabled',reviewBtn.disabled?'true':'false');
    reviewBtn.title=reviewBtn.disabled
      ? 'Visionnez entièrement cette technique avant de l’ajouter à « À revoir »'
      : 'Ajouter ou retirer cette technique de « À revoir »';
    favBtn.textContent=favorite?'♥ Favori':'♡ Favori';
    favBtn.classList.toggle('is-favorite',favorite);
  }

  function updateStatusBars(){
    ['player','techniqueDetail','osteoTechniqueWorld'].forEach(id=>{
      const screen=$(id);
      if(screen) updateStatusBar(screen);
    });
  }

  async function toggleReview(t){
    if(!t) return;
    const s=await ensureSession();
    if(!s?.user?.id){appToast('Connectez-vous pour enregistrer « À revoir ».');return;}

    const id=String(t.id);
    let row=progressRowsFor(id).find(r=>r?.review_needed===true) || progressRowFor(id);
    const previous=!!row?.review_needed;
    const next=!previous;
    const now=new Date().toISOString();

    // « À revoir » est obligatoirement un sous-ensemble de « Déjà vues ».
    // Une ancienne entrée invalide peut toujours être retirée, mais jamais créée.
    if(next && !isViewed(id)){
      appToast('Visionnez entièrement cette technique avant de l’ajouter à « À revoir ».');
      updateStatusBars();
      return;
    }

    if(!row){
      row={user_id:userId,technique_id:id,title:t.title||'',zone:t.zone||'',subzone:t.sub||'',level:t.level||'',status:'en cours',percent:0,opened_count:1,first_opened_at:now,last_opened_at:now,completed_at:null,updated_at:now,review_needed:next};
      progressRows.push(row);
    }else{
      row.review_needed=next;
      row.updated_at=now;
    }
    saveCache(); updateStatusBars(); renderSeenHub();

    try{
      const {error}=await client.rpc('osteo_set_technique_review',{
        p_technique_id:id,
        p_review:next,
        p_title:String(t.title||''),
        p_zone:String(t.zone||''),
        p_subzone:String(t.sub||''),
        p_level:String(t.level||'')
      });
      if(error) throw error;
      appToast(next?'Technique marquée « À revoir »':'Technique retirée de « À revoir »');
    }catch(error){
      console.warn('[Ostéo Pratik V19.8] À revoir',error);
      row.review_needed=previous;
      saveCache(); updateStatusBars(); renderSeenHub();
      appToast('Impossible de synchroniser « À revoir ».');
    }
  }

  async function recordTechniqueQuizAnswerNow(techniqueId,isCorrect){
    const id=String(Number(techniqueId)||'');
    if(!id) return false;

    const s=await ensureSession();
    if(!s?.user?.id) return false;

    // Le quiz technique est réservé aux techniques vues. Cette garde empêche
    // également une ancienne session locale d'écrire un état incohérent.
    if(!isViewed(id)) return false;

    const t=techniqueById(id);
    const row=progressRowFor(id);
    if(!row) return false;

    const previous={
      review_needed:!!row.review_needed,
      quiz_errors:Number(row.quiz_errors)||0,
      quiz_successes:Number(row.quiz_successes)||0,
      quiz_correct_streak:Number(row.quiz_correct_streak)||0,
      mastered:!!row.mastered,
      last_quiz_answer_at:row.last_quiz_answer_at||null,
      updated_at:row.updated_at||null
    };

    const now=new Date().toISOString();
    if(isCorrect){
      row.quiz_successes=previous.quiz_successes+1;
      row.quiz_correct_streak=previous.quiz_correct_streak+1;
      if(row.quiz_correct_streak>=2){
        row.review_needed=false;
        row.mastered=true;
      }
    }else{
      row.quiz_errors=previous.quiz_errors+1;
      row.quiz_correct_streak=0;
      row.review_needed=true;
      row.mastered=false;
    }
    row.last_quiz_answer_at=now;
    row.updated_at=now;
    saveCache();
    updateStatusBars();
    renderSeenHub();

    try{
      const {data,error}=await client.rpc('osteo_record_technique_quiz_answer',{
        p_technique_id:id,
        p_correct:!!isCorrect
      });
      if(error) throw error;

      const saved=Array.isArray(data)?data[0]:data;
      if(saved && typeof saved==='object') Object.assign(row,saved);
      else await loadUserData();

      saveCache();
      updateStatusBars();
      renderSeenHub();
      return true;
    }catch(error){
      Object.assign(row,previous);
      saveCache();
      updateStatusBars();
      renderSeenHub();
      console.warn('[Ostéo Pratik V19.11] Résultat technique non synchronisé.',error);
      return false;
    }
  }

  function recordTechniqueQuizAnswer(techniqueId,isCorrect){
    // Les réponses sont envoyées dans leur ordre exact, même si l'utilisateur
    // enchaîne rapidement les questions.
    quizAnswerQueue=quizAnswerQueue
      .catch(()=>false)
      .then(()=>recordTechniqueQuizAnswerNow(techniqueId,isCorrect));
    return quizAnswerQueue;
  }

  function getHeart(screenId){
    const header=$(screenId)?.querySelector('header.top');
    if(!header) return null;
    const buttons=[...header.querySelectorAll('button.icon')];
    return buttons[buttons.length-1]||null;
  }

  function prepareHeart(button){
    if(!button||button.dataset.osteoV19Heart==='1') return;
    button.dataset.osteoV19Heart='1';
    button.type='button';
    button.removeAttribute('onclick');
    button.addEventListener('click',async e=>{
      e.preventDefault(); e.stopPropagation();
      const t=currentTechnique();
      if(t) await toggleFavorite(t);
    });
  }

  function updateHearts(){
    const t=currentTechnique();
    const active=!!(t&&favorites.has(String(t.id)));
    ['player','techniqueDetail'].forEach(id=>{
      const b=getHeart(id); prepareHeart(b); if(!b) return;
      b.textContent=active?'♥':'♡';
      b.classList.toggle('osteo-v19-heart-active',active);
      b.title=active?'Retirer des favoris':'Ajouter aux favoris';
      b.setAttribute('aria-label',b.title);
    });
    updateStatusBars();
  }

  async function toggleFavorite(t){
    if(!t) return;
    const s=await ensureSession();
    if(!s?.user?.id){appToast('Connectez-vous pour enregistrer vos favoris.');return;}

    const id=String(t.id);
    const removing=favorites.has(id);
    if(removing) favorites.delete(id); else favorites.add(id);
    saveCache(); updateHearts(); renderFavorites();

    try{
      if(removing){
        const {error}=await client.from(T_FAVORITES).delete().eq('user_id',userId).eq('technique_id',id);
        if(error) throw error;
        appToast('Technique retirée des favoris');
      }else{
        const {error}=await client.from(T_FAVORITES).upsert({user_id:userId,technique_id:id},{onConflict:'user_id,technique_id'});
        if(error) throw error;
        appToast('Technique ajoutée aux favoris');
      }
    }catch(error){
      console.warn('[Ostéo Pratik V19.8] Favoris',error);
      // Revenir à l'état serveur en cas d'échec.
      if(removing) favorites.add(id); else favorites.delete(id);
      saveCache(); updateHearts(); renderFavorites();
      appToast('Impossible de synchroniser ce favori.');
    }
  }

  function openFavorite(id){
    const t=techniqueById(id);
    if(!t){appToast('Technique introuvable.');return;}

    try{
      // Depuis Favoris, ouvrir directement la technique en conservant
      // exactement le type de son identifiant (nombre ou texte).
      // Le bouton retour du lecteur doit revenir à Favoris, pas à Zones.
      window.__nextPlayerBackTarget='favorites';
      const open=resolveFunction('openTechnique');
      if(open){open(t.id);return;}

      // Repli uniquement si le moteur direct n'est pas disponible.
      const fallback=resolveFunction('openTechniqueFromCatalogue');
      if(fallback) fallback(t.id);
    }catch(error){
      console.warn('[Ostéo Pratik V19.8] Ouverture favori',error);
      appToast('Impossible d’ouvrir cette technique.');
    }
  }

  function renderFavorites(){
    const screen=$('favorites'); if(!screen) return;
    [...screen.children].forEach(child=>{
      if(child.classList?.contains('empty')||child.classList?.contains('osteo-v19-fav-summary')||child.classList?.contains('osteo-v19-fav-list')||child.classList?.contains('osteo-v19-empty')) child.remove();
    });

    const items=[...favorites].map(techniqueById).filter(Boolean);
    if(!items.length){
      const empty=document.createElement('div');
      empty.className='osteo-v19-empty';
      empty.innerHTML='<b>♡ Aucun favori</b>Touchez le petit cœur d’une technique pour la retrouver ici.';
      screen.appendChild(empty); return;
    }

    const summary=document.createElement('div'); summary.className='osteo-v19-fav-summary';
    summary.innerHTML=`<strong>Mes techniques favorites</strong><b>${items.length}</b>`;
    screen.appendChild(summary);

    const list=document.createElement('div'); list.className='osteo-v19-fav-list';
    items.forEach(t=>{
      const card=document.createElement('div'); card.className='osteo-v19-fav-card';
      card.innerHTML=`<button class="osteo-v19-fav-icon" type="button">♥</button><button class="osteo-v19-fav-main" type="button"><strong>${esc(t.title||'Technique')}</strong><small>${esc([t.zone,t.sub,t.level].filter(Boolean).join(' · '))}</small></button><button class="osteo-v19-fav-remove" type="button" aria-label="Retirer">♥</button>`;
      card.querySelector('.osteo-v19-fav-icon').onclick=()=>openFavorite(t.id);
      card.querySelector('.osteo-v19-fav-main').onclick=()=>openFavorite(t.id);
      card.querySelector('.osteo-v19-fav-remove').onclick=async e=>{e.stopPropagation();await toggleFavorite(t);};
      list.appendChild(card);
    });
    screen.appendChild(list);
  }

  function viewedCount(){
    return viewedTechniqueIdSet().size;
  }

  function reviewTechniques(){
    return listTechniques()
      .filter(t=>t&&isViewed(t.id)&&isReview(t.id))
      .sort((a,b)=>String(a.zone||'').localeCompare(String(b.zone||''),'fr') || String(a.sub||'').localeCompare(String(b.sub||''),'fr') || String(a.title||'').localeCompare(String(b.title||''),'fr'));
  }

  function openReviewTechnique(id){
    const t=techniqueById(id);
    if(!t){appToast('Technique introuvable.');return;}
    try{
      window.__nextPlayerBackTarget='seenCollections';
      const open=resolveFunction('openTechnique');
      if(open){open(t.id);return;}
      const fallback=resolveFunction('openTechniqueFromCatalogue');
      if(fallback) fallback(t.id);
    }catch(error){
      console.warn('[Ostéo Pratik V19.8] Ouverture À revoir',error);
      appToast('Impossible d’ouvrir cette technique.');
    }
  }

  function ensureSeenHub(){
    const screen=$('seenCollections');
    if(!screen) return null;

    let tabs=$('osteoSeenReviewTabs');
    if(!tabs){
      tabs=document.createElement('div');
      tabs.id='osteoSeenReviewTabs';
      tabs.className='osteo-v19-seen-tabs';
      tabs.innerHTML=`
        <button type="button" class="osteo-v19-seen-tab" data-mode="seen">Déjà vues <b data-count-seen>0</b></button>
        <button type="button" class="osteo-v19-seen-tab" data-mode="review">À revoir <b data-count-review>0</b></button>
      `;
      const title=screen.querySelector('.seen-album-title');
      if(title) title.insertAdjacentElement('afterend',tabs);
      else screen.querySelector('header.top')?.insertAdjacentElement('afterend',tabs) || screen.prepend(tabs);

      tabs.querySelectorAll('[data-mode]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          seenHubMode=btn.dataset.mode==='review'?'review':'seen';
          renderSeenHub();
        });
      });
    }

    let panel=$('osteoReviewPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='osteoReviewPanel';
      panel.className='osteo-v19-review-panel';
      const grid=$('collectionGrid');
      if(grid) grid.insertAdjacentElement('beforebegin',panel);
      else screen.appendChild(panel);
    }
    return {screen,tabs,panel};
  }

  function renderSeenHub(){
    const ui=ensureSeenHub();
    if(!ui) return;
    const {screen,tabs,panel}=ui;
    const items=reviewTechniques();
    const seenCount=viewedCount();

    const seenBadge=tabs.querySelector('[data-count-seen]');
    const reviewBadge=tabs.querySelector('[data-count-review]');
    if(seenBadge) seenBadge.textContent=String(seenCount);
    if(reviewBadge) reviewBadge.textContent=String(items.length);
    tabs.querySelectorAll('[data-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===seenHubMode));

    const summary=screen.querySelector('.collection-summary');
    const quick=screen.querySelector('.quick-cervical-orange');
    const grid=$('collectionGrid');
    const albumTitle=screen.querySelector('.seen-album-title');

    if(seenHubMode==='seen'){
      const totalCount=listTechniques().length;
      if(summary){
        summary.style.display='';
        const strong=summary.querySelector('strong');
        const text=summary.querySelector('p');
        if(strong) strong.textContent=`${seenCount} / ${totalCount} cartes débloquées`;
        if(text) text.textContent='Les cartes se débloquent automatiquement après visionnage complet d’une technique.';
      }
      // L'ancien raccourci de démonstration C2–C6 n'est visible que si cette
      // technique a réellement été vue par le compte connecté.
      if(quick) quick.style.display=isViewed(12)?'':'none';
      if(grid) grid.style.display='';
      panel.style.display='none';
      if(albumTitle){
        const h=albumTitle.querySelector('h1');
        const p=albumTitle.querySelector('p');
        if(h) h.textContent='Collections';
        if(p) p.textContent='Chaque zone devient une famille de cartes. Les techniques non vues restent grisées.';
      }
      return;
    }

    if(summary) summary.style.display='none';
    if(quick) quick.style.display='none';
    if(grid) grid.style.display='none';
    panel.style.display='grid';
    if(albumTitle){
      const h=albumTitle.querySelector('h1');
      const p=albumTitle.querySelector('p');
      if(h) h.textContent='À revoir';
      if(p) p.textContent='Toutes les techniques que vous avez marquées pour les retravailler.';
    }

    if(!items.length){
      panel.innerHTML='<div class="osteo-v19-review-empty"><b>✓ Rien à revoir</b>Marquez une technique « À revoir » pour la retrouver ici.</div>';
      return;
    }

    panel.innerHTML=`
      <div class="osteo-v19-review-summary"><strong>Techniques à retravailler</strong><b>${items.length}</b></div>
      <div class="osteo-v19-review-list">
        ${items.map(t=>`<button type="button" class="osteo-v19-review-card" data-review-technique="${esc(t.id)}"><span class="mark">↻</span><span><strong>${esc(t.title||'Technique')}</strong><small>${esc([t.zone,t.sub,t.level].filter(Boolean).join(' · '))}</small></span><span class="arrow">›</span></button>`).join('')}
      </div>
    `;
    panel.querySelectorAll('[data-review-technique]').forEach(btn=>{
      btn.addEventListener('click',()=>openReviewTechnique(btn.dataset.reviewTechnique));
    });
  }

  function uniqueProgressRows(){
    const byId=new Map();
    (progressRows||[]).forEach(row=>{
      const id=String(row?.technique_id||'');
      if(!id) return;
      const current=byId.get(id);
      if(!current){byId.set(id,row);return;}
      const currentDate=Date.parse(current.updated_at||current.last_quiz_answer_at||0)||0;
      const nextDate=Date.parse(row.updated_at||row.last_quiz_answer_at||0)||0;
      const newer=nextDate>currentDate?row:current;
      const older=newer===row?current:row;
      byId.set(id,{
        ...older,
        ...newer,
        completed_at:newer.completed_at||older.completed_at||null,
        percent:Math.max(Number(newer.percent)||0,Number(older.percent)||0),
        status:(isViewedRow(newer)||isViewedRow(older))?'vue':(newer.status||older.status),
        card_open_count:Math.max(Number(newer.card_open_count)||0,Number(older.card_open_count)||0),
        card_opened_at:newer.card_opened_at||older.card_opened_at||null
      });
    });
    return [...byId.values()];
  }

  function normalizedQuizResults(){
    const values=(quizResults||[]).map(row=>{
      const score=Number(row?.score ?? row?.quiz_score ?? 0)||0;
      const total=Number(row?.total ?? row?.quiz_total ?? 0)||0;
      const percent=Number(row?.percent ?? row?.quiz_percent ?? (total?Math.round(score*100/total):0))||0;
      return {
        title:String(row?.quiz_title||row?.title||row?.category||'Quiz Ostéo Pratik'),
        score,total,percent,
        date:row?.created_at||row?.completed_at||row?.quiz_at||row?.updated_at||null
      };
    }).filter(row=>row.total>0);

    if(!values.length && stateRow?.last_quiz_total){
      values.push({
        title:String(stateRow.last_quiz_title||'Quiz Ostéo Pratik'),
        score:Number(stateRow.last_quiz_score)||0,
        total:Number(stateRow.last_quiz_total)||0,
        percent:Number(stateRow.last_quiz_percent)||0,
        date:stateRow.last_quiz_at||stateRow.updated_at||null
      });
    }
    return values.sort((a,b)=>(Date.parse(b.date||0)||0)-(Date.parse(a.date||0)||0));
  }

  function formatStatsDate(value){
    const date=value?new Date(value):null;
    if(!date || Number.isNaN(date.getTime())) return 'Date inconnue';
    try{
      return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(date);
    }catch(_){return date.toLocaleDateString();}
  }

  function ensureLearningStatsPanel(){
    const screen=$('progress');
    if(!screen) return null;

    if(!$('osteoLearningStatsV1912Styles')){
      const style=document.createElement('style');
      style.id='osteoLearningStatsV1912Styles';
      style.textContent=`
        #osteoLearningStatsV1912{display:grid;gap:12px;margin:14px auto;width:100%;max-width:760px}
        #osteoLearningStatsV1912 .op-learning-card{padding:16px;border-radius:22px;border:1px solid rgba(0,229,255,.18);background:linear-gradient(145deg,rgba(10,29,55,.88),rgba(5,15,31,.94));box-shadow:0 18px 45px rgba(0,0,0,.18)}
        #osteoLearningStatsV1912 .op-learning-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
        #osteoLearningStatsV1912 .op-learning-head strong{color:#fff;font-size:17px}
        #osteoLearningStatsV1912 .op-learning-head small{color:#8fa5bf;font-size:11px}
        #osteoLearningStatsV1912 .op-learning-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
        #osteoLearningStatsV1912 .op-learning-kpi{min-width:0;padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035)}
        #osteoLearningStatsV1912 .op-learning-kpi b{display:block;color:#fff;font-size:24px;line-height:1}
        #osteoLearningStatsV1912 .op-learning-kpi span{display:block;margin-top:6px;color:#9db0c8;font-size:11px;line-height:1.25}
        #osteoLearningStatsV1912 .op-learning-kpi.mastered b{color:#35e6a7}
        #osteoLearningStatsV1912 .op-learning-kpi.review b{color:#ffb020}
        #osteoLearningStatsV1912 .op-zone-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px 10px;align-items:center;margin-top:11px}
        #osteoLearningStatsV1912 .op-zone-row span{color:#dce7f5;font-size:12px;font-weight:800}
        #osteoLearningStatsV1912 .op-zone-row em{color:#8fa5bf;font-size:11px;font-style:normal}
        #osteoLearningStatsV1912 .op-zone-bar{grid-column:1/-1;height:7px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.07)}
        #osteoLearningStatsV1912 .op-zone-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#00e5ff,#35e6a7)}
        #osteoLearningStatsV1912 .op-history{display:grid;gap:8px}
        #osteoLearningStatsV1912 .op-history-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 12px;padding:11px 12px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
        #osteoLearningStatsV1912 .op-history-row strong{min-width:0;color:#fff;font-size:12px;overflow-wrap:anywhere}
        #osteoLearningStatsV1912 .op-history-row b{color:#00e5ff;font-size:13px}
        #osteoLearningStatsV1912 .op-history-row small{color:#8196b1;font-size:10px}
        #osteoLearningStatsV1912 .op-history-empty{padding:15px;text-align:center;color:#8fa5bf;font-size:12px}
        #progress .stats-quiz-layout.op-stats-empty-mode{display:flex!important;align-items:center!important;justify-content:center!important;min-height:210px!important;padding:22px!important}
        #progress .stats-quiz-layout.op-stats-empty-mode .stats-chart{display:none!important}
        #progress .stats-quiz-layout.op-stats-empty-mode .stats-quiz-score{position:static!important;width:100%!important;max-width:310px!important;min-width:0!important;margin:0 auto!important;padding:22px 18px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;border:1px dashed rgba(0,229,255,.24)!important;border-radius:20px!important;background:rgba(0,229,255,.035)!important}
        #progress .stats-quiz-layout.op-stats-empty-mode .stats-quiz-score strong{display:grid!important;place-items:center!important;width:58px!important;height:58px!important;margin:0 0 12px!important;border-radius:50%!important;border:1px solid rgba(53,230,167,.42)!important;color:#35e6a7!important;font-size:25px!important}
        #progress .stats-quiz-layout.op-stats-empty-mode .stats-quiz-score p{margin:0!important;color:#fff!important;font-size:16px!important;font-weight:900!important}
        #progress .stats-quiz-layout.op-stats-empty-mode .stats-quiz-score em{display:block!important;margin:9px 0 0!important;padding:0!important;border:0!important;background:none!important;color:#91a7c1!important;font-size:12px!important;font-style:normal!important;line-height:1.4!important}
        #progress .stats-quiz-layout.op-stats-empty-mode .stats-quiz-score em small{display:block!important;margin:0!important;color:inherit!important;font-size:inherit!important}
      `;
      document.head.appendChild(style);
    }

    let panel=$('osteoLearningStatsV1912');
    if(!panel){
      panel=document.createElement('section');
      panel.id='osteoLearningStatsV1912';
      const global=screen.querySelector('.stats-global-card');
      if(global) global.insertAdjacentElement('afterend',panel);
      else screen.appendChild(panel);
    }
    return panel;
  }

  function renderLearningStats(){
    const panel=ensureLearningStatsPanel();
    if(!panel) return;

    const rows=uniqueProgressRows().filter(isViewedRow);
    const masteredRows=rows.filter(row=>row?.mastered===true);
    const reviewRows=rows.filter(row=>row?.review_needed===true);
    const history=normalizedQuizResults();
    const average=history.length
      ? Math.round(history.reduce((sum,row)=>sum+row.percent,0)/history.length)
      : 0;

    const zones=['Rachis','Membres supérieurs','Membres inférieurs','Bassin'];
    const zoneHtml=zones.map(zone=>{
      const zoneRows=rows.filter(row=>String(row?.zone||'')===zone);
      const mastered=zoneRows.filter(row=>row?.mastered===true).length;
      const percent=zoneRows.length?Math.round(mastered*100/zoneRows.length):0;
      return `<div class="op-zone-row"><span>${esc(zone)}</span><em>${mastered}/${zoneRows.length} maîtrisée${mastered>1?'s':''}</em><div class="op-zone-bar"><i style="width:${percent}%"></i></div></div>`;
    }).join('');

    const historyHtml=history.slice(0,5).map(row=>`
      <div class="op-history-row">
        <strong>${esc(row.title)}</strong><b>${row.percent}%</b>
        <small>${esc(formatStatsDate(row.date))}</small><small>${row.score} / ${row.total}</small>
      </div>
    `).join('');

    panel.innerHTML=`
      <article class="op-learning-card">
        <div class="op-learning-head"><strong>Apprentissage intelligent</strong><small>Synchronisé avec votre compte</small></div>
        <div class="op-learning-kpis">
          <div class="op-learning-kpi mastered"><b>${masteredRows.length}</b><span>Techniques maîtrisées</span></div>
          <div class="op-learning-kpi review"><b>${reviewRows.length}</b><span>Techniques à revoir</span></div>
          <div class="op-learning-kpi"><b>${history.length}</b><span>Quiz enregistrés</span></div>
          <div class="op-learning-kpi"><b>${average}%</b><span>Taux de réussite moyen</span></div>
        </div>
      </article>
      <article class="op-learning-card">
        <div class="op-learning-head"><strong>Maîtrise par zone</strong><small>Parmi les techniques vues</small></div>
        ${zoneHtml}
      </article>
      <article class="op-learning-card">
        <div class="op-learning-head"><strong>Derniers quiz</strong><small>5 derniers résultats</small></div>
        <div class="op-history">${historyHtml||'<div class="op-history-empty">Aucun quiz enregistré pour le moment.</div>'}</div>
      </article>
    `;
  }

  function renderCoreStats(){
    const rows=uniqueProgressRows();
    const videos=viewedTechniqueIdSet().size;
    const sheets=rows.filter(row=>
      isViewedRow(row) &&
      (row?.card_opened_at || Number(row?.card_open_count)>0)
    ).length;
    const total=listTechniques().length;

    const setText=(id,value)=>{const el=$(id);if(el) el.textContent=String(value);};
    setText('statsVideos',videos);
    setText('statsVideosTotal','/ '+total);
    setText('statsSheets',sheets);
    setText('statsSheetsTotal','/ '+total);

    const sheetsLabel=$('statsSheets')?.closest('article')?.querySelector('span');
    if(sheetsLabel) sheetsLabel.textContent='Cartes consultées';

    const history=normalizedQuizResults();
    const successful=history.filter(row=>row.percent>=60).length;
    setText('statsQuiz',history.length?successful+'/'+history.length:'—');
    setText('statsQuizDetail',history.length
      ? successful+' quiz réussi'+(successful>1?'s':'')+' sur '+history.length
      : 'Aucun quiz terminé');
    renderQuizPerformance(history);
  }

  function renderQuizPerformance(source){
    const card=document.querySelector('#progress .stats-quiz-card .stats-quiz-layout');
    if(!card) return;
    const history=(Array.isArray(source)?source:normalizedQuizResults()).slice(0,7).reverse();
    const svg=card.querySelector('.stats-chart svg');
    const labels=card.querySelector('.stats-chart-labels');
    const scoreBox=card.querySelector('.stats-quiz-score');
    if(!svg || !labels || !scoreBox) return;

    const line=svg.querySelector('polyline');
    svg.querySelectorAll('circle').forEach(node=>node.remove());

    if(!history.length){
      card.classList.add('op-stats-empty-mode');
      if(line) line.setAttribute('points','');
      labels.innerHTML='';
      const strong=scoreBox.querySelector('strong');
      const caption=scoreBox.querySelector('p');
      const trend=scoreBox.querySelector('em');
      if(strong) strong.innerHTML='◎';
      if(caption) caption.textContent='Aucun quiz terminé';
      if(trend) trend.innerHTML='<small>Terminez un quiz pour suivre votre progression.</small>';
      return;
    }

    card.classList.remove('op-stats-empty-mode');
    const caption=scoreBox.querySelector('p');
    if(caption) caption.textContent='taux de réussite moyen';

    const count=history.length;
    const points=history.map((row,index)=>{
      const x=count===1?160:10+(300*index/(count-1));
      const y=135-(Math.max(0,Math.min(100,row.percent))*1.05);
      return {x,y,row};
    });
    if(line) line.setAttribute('points',points.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' '));

    const ns='http://www.w3.org/2000/svg';
    points.forEach(point=>{
      const circle=document.createElementNS(ns,'circle');
      circle.setAttribute('cx',point.x.toFixed(1));
      circle.setAttribute('cy',point.y.toFixed(1));
      circle.setAttribute('r','5');
      circle.setAttribute('aria-label',point.row.percent+'%');
      svg.appendChild(circle);
    });

    labels.innerHTML=history.map(row=>{
      const date=row.date?new Date(row.date):null;
      const label=date && !Number.isNaN(date.getTime())
        ? String(date.getDate()).padStart(2,'0')+'/'+String(date.getMonth()+1).padStart(2,'0')
        : '—';
      return '<span>'+label+'</span>';
    }).join('');

    const average=Math.round(history.reduce((sum,row)=>sum+row.percent,0)/history.length);
    const strong=scoreBox.querySelector('strong');
    if(strong) strong.innerHTML=average+'<span>%</span>';

    const recent=history.slice(-3);
    const previous=history.slice(Math.max(0,history.length-6),Math.max(0,history.length-3));
    const recentAverage=Math.round(recent.reduce((sum,row)=>sum+row.percent,0)/recent.length);
    const previousAverage=previous.length
      ? Math.round(previous.reduce((sum,row)=>sum+row.percent,0)/previous.length)
      : null;
    const trend=scoreBox.querySelector('em');
    if(trend){
      if(previousAverage==null){
        trend.innerHTML=history.length+' résultat'+(history.length>1?'s':'')+'<small>enregistré'+(history.length>1?'s':'')+'</small>';
      }else{
        const delta=recentAverage-previousAverage;
        trend.innerHTML=(delta>=0?'↥ +':'↧ ')+delta+'%<small>3 derniers quiz vs précédents</small>';
      }
    }
  }

  async function recordCardOpen(techniqueId){
    const id=String(Number(techniqueId)||'');
    if(!id) return false;
    const s=await ensureSession();
    if(!s?.user?.id || !isViewed(id)) return false;

    const row=progressRowFor(id);
    if(!row) return false;
    const previousCount=Number(row.card_open_count)||0;
    const previousDate=row.card_opened_at||null;
    const now=new Date().toISOString();

    row.card_open_count=previousCount+1;
    row.card_opened_at=now;
    row.updated_at=now;
    saveCache();
    renderCoreStats();

    try{
      const {data,error}=await client.rpc('osteo_record_technique_card_open',{
        p_technique_id:id
      });
      if(error) throw error;
      const saved=Array.isArray(data)?data[0]:data;
      if(saved && typeof saved==='object') Object.assign(row,saved);
      saveCache();
      renderCoreStats();
      return true;
    }catch(error){
      row.card_open_count=previousCount;
      row.card_opened_at=previousDate;
      saveCache();
      renderCoreStats();
      console.warn('[Ostéo Pratik V19.13] Consultation de fiche non synchronisée.',error);
      return false;
    }
  }

  async function recordOpen(id){
    const s=await ensureSession(); if(!s?.user?.id||!id) return;
    const t=techniqueById(id); if(!t) return;

    // Retour visuel immédiat dans « Dernière technique ».
    stateRow={...(stateRow||{}),user_id:userId,last_technique_id:String(t.id),last_technique_title:t.title||'',last_zone:t.zone||'',last_subzone:t.sub||'',last_level:t.level||'',last_opened_at:new Date().toISOString()};
    applyStateToCompatibilityStorage(); saveCache();
    try{const f=resolveFunction('renderLastPracticeCard'); if(f) f();}catch(_){}

    try{
      const {error}=await client.rpc('osteo_record_technique_open',{p_technique_id:String(t.id),p_title:String(t.title||''),p_zone:String(t.zone||''),p_subzone:String(t.sub||''),p_level:String(t.level||'')});
      if(error) throw error;
    }catch(error){console.warn('[Ostéo Pratik V19.8] Dernière technique',error);}
  }

  async function recordComplete(id){
    const s=await ensureSession(); if(!s?.user?.id||!id) return;
    const t=techniqueById(id); if(!t) return;

    try{
      const {error}=await client.rpc('osteo_record_technique_complete',{p_technique_id:String(t.id),p_title:String(t.title||''),p_zone:String(t.zone||''),p_subzone:String(t.sub||''),p_level:String(t.level||'')});
      if(error) throw error;

      const now=new Date().toISOString();
      const existing=progressRows.find(r=>String(r.technique_id)===String(t.id));
      if(existing){Object.assign(existing,{status:'vue',percent:100,completed_at:existing.completed_at||now,updated_at:now});}
      else progressRows.push({user_id:userId,technique_id:String(t.id),title:t.title||'',zone:t.zone||'',subzone:t.sub||'',level:t.level||'',status:'vue',percent:100,opened_count:1,first_opened_at:now,last_opened_at:now,completed_at:now,updated_at:now});
      applyAll();
    }catch(error){console.warn('[Ostéo Pratik V19.8] Technique terminée',error);}
  }

  function readQuizResult(){
    let score=0,total=0;
    try{
      score=Number(eval('typeof generalQuizScore!=="undefined" ? generalQuizScore : 0'))||0;
      const q=eval('typeof generalQuizQuestions!=="undefined" ? generalQuizQuestions : []');
      total=Array.isArray(q)?q.length:0;
    }catch(_){}
    if(!total){
      try{const v=JSON.parse(localStorage.getItem(LAST_QUIZ_KEY)||'null');score=Number(v?.score)||0;total=Number(v?.total)||0;}catch(_){}
    }
    const title=document.querySelector('#quiz .quiz-general-title h1')?.textContent?.trim()||'Quiz Ostéo Pratik';
    return {title,score,total,percent:total?Math.round(score*100/total):0};
  }

  async function recordQuizSummary(summary){
    const s=await ensureSession(); if(!s?.user?.id) return;
    const q={
      title:String(summary?.title||summary?.category||'Quiz Ostéo Pratik'),
      score:Number(summary?.score)||0,
      total:Number(summary?.total)||0,
      percent:Number(summary?.percent)||0
    };
    if(!q.total) return;

    const signature=[q.title,q.score,q.total,q.percent].join('|');
    const nowMs=Date.now();
    if(signature===lastQuizSaveSignature && nowMs-lastQuizSaveAt<3000) return;
    lastQuizSaveSignature=signature;
    lastQuizSaveAt=nowMs;

    try{
      const {error}=await client.rpc('osteo_record_quiz_result',{p_quiz_title:q.title,p_score:q.score,p_total:q.total,p_percent:q.percent});
      if(error) throw error;
      const savedAt=new Date().toISOString();
      stateRow={...(stateRow||{}),user_id:userId,last_quiz_title:q.title,last_quiz_score:q.score,last_quiz_total:q.total,last_quiz_percent:q.percent,last_quiz_at:savedAt};
      quizResults.unshift({quiz_title:q.title,score:q.score,total:q.total,percent:q.percent,created_at:savedAt});
      applyStateToCompatibilityStorage(); saveCache();
      renderLearningStats();
    }catch(error){
      lastQuizSaveSignature='';
      console.warn('[Ostéo Pratik V19.12] Résultat quiz',error);
    }
  }

  async function recordQuiz(){
    return recordQuizSummary(readQuizResult());
  }

  function hook(name,after){
    const original=resolveFunction(name);
    if(typeof original!=='function'||original.__osteoV19UserData) return false;
    const wrapped=function(){
      const args=[...arguments];
      const result=original.apply(this,args);
      try{Promise.resolve(after.apply(this,args)).catch(()=>{});}catch(_){}
      return result;
    };
    wrapped.__osteoV19UserData=true; wrapped.__osteoOriginal=original;
    try{window[name]=wrapped;}catch(_){}
    try{eval(name+' = wrapped');}catch(_){}
    return true;
  }

  function installHooks(){
    hook('openTechnique',id=>{recordOpen(id);setTimeout(()=>{updateHearts();updateStatusBars();},30);});
    hook('markTechniqueViewedAfterComplete',id=>recordComplete(id||currentTechnique()?.id));
    hook('finishGeneralQuiz',()=>recordQuiz());
  }

  function installObserver(){
    if(observer) return;
    let timer=null;

    /*
      V19.8 — stabilité bureau
      Ne plus écouter les mutations childList. renderSeenHub() modifie lui-même
      le DOM de #seenCollections ; l'ancien observer voyait cette modification
      puis rappelait renderSeenHub(), ce qui créait une boucle de rendu visible
      sous forme de tremblement sur ordinateur.

      On observe uniquement les changements de classe des écrans (navigation).
    */
    observer=new MutationObserver(mutations=>{
      const screenChanged=mutations.some(m=>
        m.type==='attributes' &&
        m.attributeName==='class' &&
        m.target &&
        m.target.classList &&
        m.target.classList.contains('screen')
      );
      if(!screenChanged) return;

      clearTimeout(timer);
      timer=setTimeout(()=>{
        installHooks();
        updateHearts();
        updateStatusBars();
        if($('favorites')?.classList.contains('active')) renderFavorites();
        if($('seenCollections')?.classList.contains('active')) renderSeenHub();
        if($('progress')?.classList.contains('active')){
          renderCoreStats();
          renderLearningStats();
          setTimeout(renderCoreStats,80);
          setTimeout(renderCoreStats,320);
        }
      },40);
    });

    observer.observe(document.documentElement,{
      subtree:true,
      attributes:true,
      attributeFilter:['class']
    });
  }

  async function waitForAuthClient(){
    for(let i=0;i<100;i++){
      client=window.OSTEO_APP_AUTH_CLIENT||null;
      if(client) return client;
      await new Promise(r=>setTimeout(r,50));
    }
    return null;
  }

  async function install(){
    injectStyles();
    installHooks();
    installObserver();
    prepareHeart(getHeart('player')); prepareHeart(getHeart('techniqueDetail'));
    updateStatusBars();
    renderSeenHub();

    client=await waitForAuthClient();
    if(!client){console.warn('[Ostéo Pratik V19.8] Client Supabase indisponible.');return;}

    client.auth.onAuthStateChange((event,newSession)=>{
      session=newSession||null;
      if(!session){
        userId=null; ++loadSerial; clearVisibleUserData(); return;
      }
      userId=session.user.id;
      if(['SIGNED_IN','INITIAL_SESSION','TOKEN_REFRESHED'].includes(event)) setTimeout(loadUserData,0);
    });

    await loadUserData();
    [300,900,1800].forEach(ms=>setTimeout(()=>{installHooks();updateHearts();updateStatusBars();renderFavorites();renderSeenHub();},ms));
  }

  window.OSTEO_USER_DATA_V19={
    version:VERSION,
    reload:loadUserData,
    isFavorite:id=>favorites.has(String(id)),
    toggleFavorite:t=>toggleFavorite(t),
    isReview:id=>isReview(id),
    isViewed:id=>isViewed(id),
    toggleReview:t=>toggleReview(t),
    recordTechniqueQuizAnswer,
    renderSeenHub,
    recordOpen,
    recordComplete,
    recordCardOpen,
    recordQuiz,
    recordQuizSummary,
    renderLearningStats
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.addEventListener('osteo-central-data-loaded',()=>setTimeout(()=>{installHooks();loadUserData();updateStatusBars();renderSeenHub();},120));
})();
