/* =========================================================
   OSTÉO PRATIK V18 — AUTHENTIFICATION ÉTUDIANT
   Inscription obligatoire avant l'accès à l'application.
   Supabase Auth : email + mot de passe.
   Aucun mot de passe n'est stocké dans le navigateur.
   ========================================================= */
(function(){
  'use strict';

  const VERSION='18.2';
  const LOGIN_SCREEN_ID='login';
  const PUBLIC_SCREENS=new Set(['welcome','signup','login','reset-password']);
  const MIN_PASSWORD_LENGTH=8;

  let client=null;
  let session=null;
  let sessionReady=false;
  let originalGo=null;
  let goHookInstalled=false;

  const $=id=>document.getElementById(id);

  function toast(message){
    try{
      if(typeof window.toast==='function'){
        window.toast(message);
        return;
      }
    }catch(_){}
    console.log('[Ostéo Pratik Auth]',message);
  }

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }


  function authRedirectUrl(){
    try{
      const url=new URL('.',window.location.href);
      url.hash='';
      url.search='';
      return url.href;
    }catch(_){
      return window.location.origin+window.location.pathname;
    }
  }

  function splitName(fullName){
    const parts=String(fullName||'').trim().split(/\s+/).filter(Boolean);
    return {
      first_name:parts.shift()||'',
      last_name:parts.join(' ')
    };
  }

  function setStatus(id,message,mode=''){
    const el=$(id);
    if(!el) return;
    el.hidden=!message;
    el.textContent=message||'';
    el.className='auth-v18-status '+mode;
  }

  function setBusy(button,busy,busyLabel){
    if(!button) return;
    if(busy){
      button.dataset.authOldText=button.textContent;
      button.disabled=true;
      button.textContent=busyLabel||'Patientez…';
    }else{
      button.disabled=false;
      if(button.dataset.authOldText) button.textContent=button.dataset.authOldText;
      delete button.dataset.authOldText;
    }
  }

  function injectStyles(){
    if($('osteoAuthV18Styles')) return;
    const style=document.createElement('style');
    style.id='osteoAuthV18Styles';
    style.textContent=`
      .auth-v18-field{
        display:grid;
        gap:7px;
      }
      .auth-v18-field > span{
        color:#c5d2e5;
        font-size:12px;
        font-weight:800;
      }
      .auth-v18-field input{
        width:100%;
        min-height:48px;
        box-sizing:border-box;
        border:1px solid rgba(142,176,214,.20);
        border-radius:15px;
        padding:0 14px;
        color:#fff;
        background:rgba(4,15,31,.72);
        outline:none;
        font:inherit;
      }
      .auth-v18-field input:focus{
        border-color:rgba(0,229,255,.65);
        box-shadow:0 0 0 3px rgba(0,229,255,.08);
      }
      .auth-v18-password-wrap{
        position:relative;
      }
      .auth-v18-password-wrap input{
        padding-right:54px;
      }
      .auth-v18-toggle-password{
        position:absolute;
        right:7px;
        top:50%;
        transform:translateY(-50%);
        width:40px;
        height:36px;
        border:0;
        border-radius:11px;
        color:#8fefff;
        background:rgba(0,229,255,.08);
        cursor:pointer;
      }
      .auth-v18-status{
        margin:2px 0 4px;
        padding:11px 12px;
        border-radius:14px;
        color:#cfe6ff;
        border:1px solid rgba(0,229,255,.20);
        background:rgba(0,229,255,.055);
        font-size:12px;
        line-height:1.4;
      }
      .auth-v18-status.ok{
        color:#baffdf;
        border-color:rgba(0,230,167,.30);
        background:rgba(0,230,167,.07);
      }
      .auth-v18-status.error{
        color:#ffd1d6;
        border-color:rgba(255,107,119,.30);
        background:rgba(255,107,119,.07);
      }
      .auth-v18-small{
        color:#8da1bd;
        font-size:11px;
        line-height:1.4;
        text-align:center;
      }
      .auth-v18-link{
        border:0;
        padding:7px 4px;
        color:#8fefff;
        background:transparent;
        font-weight:850;
        cursor:pointer;
      }
      #login.signup-screen .signup-card{
        margin-top:8px;
      }
      #authV18Logout{
        width:100%;
        min-height:48px;
        margin:16px 0 84px;
        border:1px solid rgba(255,107,119,.34);
        border-radius:17px;
        color:#ffd1d6;
        background:rgba(255,107,119,.065);
        font-weight:900;
        cursor:pointer;
      }
      body.auth-v18-locked .bottom{
        display:none !important;
      }
      body.auth-v18-locked #home,
      body.auth-v18-locked #zones,
      body.auth-v18-locked #rachis,
      body.auth-v18-locked #techniques,
      body.auth-v18-locked #player,
      body.auth-v18-locked #revision,
      body.auth-v18-locked #quiz,
      body.auth-v18-locked #progress,
      body.auth-v18-locked #profile{
        pointer-events:none;
      }
    `;
    document.head.appendChild(style);
  }

  function loadScript(src,key){
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector(`script[data-auth-v18="${key}"]`);
      if(existing){
        if(existing.dataset.loaded==='1') return resolve();
        existing.addEventListener('load',()=>resolve(),{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      const s=document.createElement('script');
      s.src=src;
      s.async=true;
      s.dataset.authV18=key;
      s.onload=()=>{s.dataset.loaded='1';resolve();};
      s.onerror=()=>reject(new Error('Impossible de charger '+src));
      document.head.appendChild(s);
    });
  }

  async function ensureSupabase(){
    if(!window.supabase){
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'supabase-lib'
      );
    }
    if(!window.OSTEO_SUPABASE){
      await loadScript('supabase-config.js','supabase-config');
    }
    const cfg=window.OSTEO_SUPABASE||{};
    if(!window.supabase || !cfg.url || !cfg.anonKey){
      throw new Error('Configuration Supabase indisponible.');
    }

    // Réutiliser le client du back-office s'il existe déjà.
    if(window.OSTEO_APP_AUTH_CLIENT){
      client=window.OSTEO_APP_AUTH_CLIENT;
      return client;
    }

    client=window.supabase.createClient(cfg.url,cfg.anonKey,{
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:true
      }
    });
    window.OSTEO_APP_AUTH_CLIENT=client;
    return client;
  }

  function createLoginScreen(){
    if($(LOGIN_SCREEN_ID)) return;

    const section=document.createElement('section');
    section.id=LOGIN_SCREEN_ID;
    section.className='screen signup-screen';
    section.innerHTML=`
      <header class="top">
        <button class="icon round" type="button" id="authV18LoginBack">‹</button>
        <div class="brand">
          <h1 class="logo">Connexion</h1>
          <p class="subtitle">Votre compte Ostéo Pratik</p>
        </div>
        <span></span>
      </header>

      <article class="signup-card">
        <div class="pill-icon">◎</div>
        <h2>Bienvenue</h2>
        <p>Connectez-vous avec l’adresse email et le mot de passe utilisés lors de votre inscription.</p>

        <label class="auth-v18-field">
          <span>Email</span>
          <input id="authV18LoginEmail" type="email" inputmode="email" autocomplete="email"
                 placeholder="votre@email.com">
        </label>

        <label class="auth-v18-field">
          <span>Mot de passe</span>
          <div class="auth-v18-password-wrap">
            <input id="authV18LoginPassword" type="password" autocomplete="current-password"
                   placeholder="Votre mot de passe">
            <button type="button" class="auth-v18-toggle-password" data-target="authV18LoginPassword">◉</button>
          </div>
        </label>

        <div id="authV18LoginStatus" class="auth-v18-status" hidden></div>

        <button class="primary" type="button" id="authV18LoginButton">Se connecter</button>
        <button class="secondary" type="button" id="authV18GoSignup">Créer un compte</button>
        <button class="auth-v18-link" type="button" id="authV18ForgotPassword">Mot de passe oublié ?</button>
      </article>
    `;

    const home=$('home');
    if(home && home.parentNode) home.parentNode.insertBefore(section,home);
    else document.querySelector('.app')?.appendChild(section);
  }


  function createResetPasswordScreen(){
    if($('reset-password')) return;

    const section=document.createElement('section');
    section.id='reset-password';
    section.className='screen signup-screen';
    section.innerHTML=`
      <header class="top">
        <button class="icon round" type="button" id="authV181ResetBack">‹</button>
        <div class="brand">
          <h1 class="logo">Nouveau mot de passe</h1>
          <p class="subtitle">Sécurisez votre compte</p>
        </div>
        <span></span>
      </header>

      <article class="signup-card">
        <div class="pill-icon">◉</div>
        <h2>Choisissez votre nouveau mot de passe</h2>
        <p>Le lien reçu par email vous a identifié. Il reste maintenant à définir votre nouveau mot de passe.</p>

        <label class="auth-v18-field">
          <span>Nouveau mot de passe</span>
          <div class="auth-v18-password-wrap">
            <input id="authV181NewPassword" type="password" autocomplete="new-password"
                   minlength="${MIN_PASSWORD_LENGTH}"
                   placeholder="${MIN_PASSWORD_LENGTH} caractères minimum">
            <button type="button" class="auth-v18-toggle-password" data-target="authV181NewPassword">◉</button>
          </div>
        </label>

        <label class="auth-v18-field">
          <span>Confirmer le mot de passe</span>
          <div class="auth-v18-password-wrap">
            <input id="authV181NewPassword2" type="password" autocomplete="new-password"
                   minlength="${MIN_PASSWORD_LENGTH}"
                   placeholder="Retapez votre mot de passe">
            <button type="button" class="auth-v18-toggle-password" data-target="authV181NewPassword2">◉</button>
          </div>
        </label>

        <div id="authV181ResetStatus" class="auth-v18-status" hidden></div>

        <button class="primary" type="button" id="authV181SavePassword">
          Enregistrer mon nouveau mot de passe
        </button>
      </article>
    `;

    const home=$('home');
    if(home && home.parentNode) home.parentNode.insertBefore(section,home);
    else document.querySelector('.app')?.appendChild(section);
  }

  function prepareSignupScreen(){
    const signup=$('signup');
    if(!signup) return;

    const card=signup.querySelector('.signup-card');
    if(!card) return;

    const p=card.querySelector('h2 + p');
    if(p){
      p.textContent='L’inscription est obligatoire pour accéder à Ostéo Pratik. Créez votre compte personnel.';
    }

    const nameInput=$('signupName');
    if(nameInput){
      nameInput.autocomplete='name';
    }
    const emailInput=$('signupEmail');
    if(emailInput){
      emailInput.autocomplete='email';
      emailInput.inputMode='email';
    }

    if(!$('signupPassword')){
      const profileLabel=$('signupProfile')?.closest('label');
      const field=document.createElement('label');
      field.className='auth-v18-field';
      field.innerHTML=`
        <span>Mot de passe</span>
        <div class="auth-v18-password-wrap">
          <input id="signupPassword" type="password" autocomplete="new-password"
                 minlength="${MIN_PASSWORD_LENGTH}"
                 placeholder="${MIN_PASSWORD_LENGTH} caractères minimum">
          <button type="button" class="auth-v18-toggle-password" data-target="signupPassword">◉</button>
        </div>
      `;
      profileLabel?.insertAdjacentElement('afterend',field);

      const confirm=document.createElement('label');
      confirm.className='auth-v18-field';
      confirm.innerHTML=`
        <span>Confirmer le mot de passe</span>
        <div class="auth-v18-password-wrap">
          <input id="signupPassword2" type="password" autocomplete="new-password"
                 minlength="${MIN_PASSWORD_LENGTH}"
                 placeholder="Retapez votre mot de passe">
          <button type="button" class="auth-v18-toggle-password" data-target="signupPassword2">◉</button>
        </div>
      `;
      field.insertAdjacentElement('afterend',confirm);
    }

    let status=$('authV18SignupStatus');
    if(!status){
      status=document.createElement('div');
      status.id='authV18SignupStatus';
      status.className='auth-v18-status';
      status.hidden=true;

      const buttons=[...card.querySelectorAll('button')];
      const primary=buttons.find(b=>b.classList.contains('primary'));
      primary?.insertAdjacentElement('beforebegin',status);
    }

    const buttons=[...card.querySelectorAll('button')];
    const primary=buttons.find(b=>b.classList.contains('primary'));
    if(primary){
      primary.id='authV18SignupButton';
      primary.textContent='Créer mon compte';
      primary.removeAttribute('onclick');
      primary.type='button';
    }

    // Plus aucun accès sans compte.
    buttons.forEach(b=>{
      const txt=String(b.textContent||'').toLowerCase();
      if(txt.includes('continuer sans compte')) b.remove();
    });

    if(!$('authV18AlreadyAccount')){
      const already=document.createElement('button');
      already.id='authV18AlreadyAccount';
      already.type='button';
      already.className='secondary';
      already.textContent='J’ai déjà un compte';
      card.appendChild(already);
    }
  }

  function prepareWelcome(){
    const start=document.querySelector('#welcome .welcome-start');
    const signup=document.querySelector('#welcome .welcome-signup');
    const login=document.querySelector('#welcome .welcome-login');

    if(start){
      start.removeAttribute('onclick');
      start.type='button';
      start.addEventListener('click',()=>{
        if(session) safeGo('home');
        else safeGo('signup');
      });
    }
    if(signup){
      signup.removeAttribute('onclick');
      signup.type='button';
      signup.addEventListener('click',()=>safeGo('signup'));
    }
    if(login){
      login.removeAttribute('onclick');
      login.type='button';
      login.textContent='J’ai déjà un compte ›';
      login.addEventListener('click',()=>safeGo('login'));
    }
  }

  function installPasswordToggles(){
    document.addEventListener('click',event=>{
      const button=event.target.closest('.auth-v18-toggle-password');
      if(!button) return;
      const input=$(button.dataset.target);
      if(!input) return;
      input.type=input.type==='password'?'text':'password';
      button.textContent=input.type==='password'?'◉':'◌';
    });
  }

  function safeGo(id){
    if(typeof originalGo==='function'){
      originalGo(id);
      updateLockClass(id);
      return;
    }
    document.querySelectorAll('.screen').forEach(s=>{
      s.classList.toggle('active',s.id===id);
    });
    updateLockClass(id);
  }

  function updateLockClass(screenId){
    const locked=!session;
    document.body.classList.toggle('auth-v18-locked',locked);
    document.body.dataset.authV18=locked?'locked':'authenticated';
  }

  function installGoGuard(){
    if(goHookInstalled) return;
    if(typeof window.go!=='function') return;

    originalGo=window.go;
    window.__OSTEO_ORIGINAL_GO=originalGo;

    window.go=function(id){
      const target=String(id||'home');

      // Pendant la vérification initiale, aucun écran privé n'est ouvert.
      if(!sessionReady && !PUBLIC_SCREENS.has(target)){
        safeGo('welcome');
        return;
      }

      if(!session && !PUBLIC_SCREENS.has(target)){
        toast('Inscription ou connexion nécessaire');
        safeGo('signup');
        return;
      }

      originalGo(target);
      updateLockClass(target);
    };

    goHookInstalled=true;
  }

  async function recordActivity(type,metadata={}){
    if(!client || !session?.user?.id) return;
    try{
      await client.from('osteo_user_activity').insert({
        user_id:session.user.id,
        event_type:type,
        metadata,
        occurred_at:new Date().toISOString()
      });
    }catch(_){}
  }

  async function signup(){
    if(!client){
      setStatus('authV18SignupStatus','Connexion au service indisponible.','error');
      return;
    }

    const name=String($('signupName')?.value||'').trim();
    const email=String($('signupEmail')?.value||'').trim().toLowerCase();
    const profile=String($('signupProfile')?.value||'Étudiant en ostéopathie');
    const password=String($('signupPassword')?.value||'');
    const password2=String($('signupPassword2')?.value||'');

    if(!name || !email){
      setStatus('authV18SignupStatus','Indiquez votre nom et votre email.','error');
      return;
    }
    if(password.length<MIN_PASSWORD_LENGTH){
      setStatus('authV18SignupStatus',`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,'error');
      return;
    }
    if(password!==password2){
      setStatus('authV18SignupStatus','Les deux mots de passe ne correspondent pas.','error');
      return;
    }

    const button=$('authV18SignupButton');
    setBusy(button,true,'Création du compte…');
    setStatus('authV18SignupStatus','');

    const names=splitName(name);
    try{
      const {data,error}=await client.auth.signUp({
        email,
        password,
        options:{
          emailRedirectTo:authRedirectUrl(),
          data:{
            full_name:name,
            first_name:names.first_name,
            last_name:names.last_name,
            profile_type:profile
          }
        }
      });
      if(error) throw error;

      if(data?.session){
        session=data.session;
        sessionReady=true;
        setStatus('authV18SignupStatus','Compte créé. Accès autorisé.','ok');
        await recordActivity('signup',{profile_type:profile});
        setTimeout(()=>safeGo('home'),500);
      }else{
        setStatus(
          'authV18SignupStatus',
          'Compte créé. Vérifiez votre boîte email pour confirmer l’inscription, puis connectez-vous.',
          'ok'
        );
      }
    }catch(error){
      const msg=String(error?.message||error||'Erreur inconnue');
      let fr='Impossible de créer le compte.';
      if(/already|registered|exists/i.test(msg)) fr='Cette adresse email possède déjà un compte.';
      else if(/password/i.test(msg)) fr='Le mot de passe ne respecte pas les critères de sécurité.';
      else if(/email/i.test(msg)) fr='Adresse email invalide ou inscription email impossible.';
      setStatus('authV18SignupStatus',fr,'error');
    }finally{
      setBusy(button,false);
    }
  }

  async function login(){
    const email=String($('authV18LoginEmail')?.value||'').trim().toLowerCase();
    const password=String($('authV18LoginPassword')?.value||'');
    if(!email || !password){
      setStatus('authV18LoginStatus','Indiquez votre email et votre mot de passe.','error');
      return;
    }

    const button=$('authV18LoginButton');
    setBusy(button,true,'Connexion…');
    setStatus('authV18LoginStatus','');

    try{
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error) throw error;
      session=data.session||null;
      sessionReady=true;
      setStatus('authV18LoginStatus','Connexion réussie.','ok');
      await recordActivity('login',{source:'password'});
      setTimeout(()=>safeGo('home'),300);
    }catch(error){
      const msg=String(error?.message||'');
      const fr=/confirm/i.test(msg)
        ? 'Confirmez d’abord votre adresse email.'
        : 'Email ou mot de passe incorrect.';
      setStatus('authV18LoginStatus',fr,'error');
    }finally{
      setBusy(button,false);
    }
  }


  async function saveNewPassword(){
    const password=String($('authV181NewPassword')?.value||'');
    const password2=String($('authV181NewPassword2')?.value||'');

    if(password.length<MIN_PASSWORD_LENGTH){
      setStatus(
        'authV181ResetStatus',
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
        'error'
      );
      return;
    }
    if(password!==password2){
      setStatus('authV181ResetStatus','Les deux mots de passe ne correspondent pas.','error');
      return;
    }

    const button=$('authV181SavePassword');
    setBusy(button,true,'Enregistrement…');
    setStatus('authV181ResetStatus','');

    try{
      const {data,error}=await client.auth.updateUser({password});
      if(error) throw error;

      session=(await client.auth.getSession()).data?.session||session;
      sessionReady=true;

      setStatus(
        'authV181ResetStatus',
        'Votre nouveau mot de passe est enregistré. Vous êtes maintenant connecté.',
        'ok'
      );

      // Retirer les paramètres du lien de récupération de la barre d'adresse.
      try{
        history.replaceState(null,'',location.pathname+location.search);
      }catch(_){}

      setTimeout(()=>safeGo('home'),700);
    }catch(error){
      console.error('[Ostéo Pratik Auth] password update',error);
      setStatus(
        'authV181ResetStatus',
        'Impossible d’enregistrer le nouveau mot de passe. Demandez un nouveau lien.',
        'error'
      );
    }finally{
      setBusy(button,false);
    }
  }

  async function forgotPassword(){
    const email=String($('authV18LoginEmail')?.value||'').trim().toLowerCase();
    if(!email){
      setStatus('authV18LoginStatus','Entrez d’abord votre adresse email.','error');
      return;
    }

    const redirectTo=authRedirectUrl();

    try{
      const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});
      if(error) throw error;

      setStatus(
        'authV18LoginStatus',
        'Email de réinitialisation envoyé. Vérifiez aussi les courriers indésirables.',
        'ok'
      );
    }catch(error){
      const msg=String(error?.message||error||'Erreur inconnue');
      console.error('[Ostéo Pratik Auth] reset password', {
        message:msg,
        status:error?.status,
        code:error?.code,
        redirectTo
      });

      let fr='Impossible d’envoyer l’email de réinitialisation.';
      if(/rate|limit|too many/i.test(msg)){
        fr='Trop de demandes ont été faites. Attendez environ 60 secondes puis réessayez.';
      }else if(/redirect|url|allow/i.test(msg)){
        fr='L’adresse de retour du site n’est pas autorisée dans Supabase. Vérifiez Authentication → URL Configuration.';
      }else if(/smtp|email|mail/i.test(msg)){
        fr='Supabase n’arrive pas à envoyer l’email. Vérifiez Authentication → Emails / SMTP.';
      }

      setStatus(
        'authV18LoginStatus',
        fr+' Détail Supabase : '+msg,
        'error'
      );
    }
  }

  async function logout(){
    try{
      await client?.auth.signOut();
    }catch(_){}
    session=null;
    sessionReady=true;
    safeGo('welcome');
    toast('Vous êtes déconnecté');
  }

  function installLogoutButton(){
    const profile=$('profile');
    if(!profile || $('authV18Logout')) return;
    const button=document.createElement('button');
    button.id='authV18Logout';
    button.type='button';
    button.textContent='Se déconnecter';
    button.addEventListener('click',logout);
    profile.appendChild(button);
  }

  function bind(){
    $('authV18SignupButton')?.addEventListener('click',signup);
    $('authV18AlreadyAccount')?.addEventListener('click',()=>safeGo('login'));
    $('authV18LoginButton')?.addEventListener('click',login);
    $('authV18GoSignup')?.addEventListener('click',()=>safeGo('signup'));
    $('authV18LoginBack')?.addEventListener('click',()=>safeGo('welcome'));
    $('authV18ForgotPassword')?.addEventListener('click',forgotPassword);
    $('authV181SavePassword')?.addEventListener('click',saveNewPassword);
    $('authV181ResetBack')?.addEventListener('click',()=>safeGo('login'));

    $('authV18LoginPassword')?.addEventListener('keydown',e=>{
      if(e.key==='Enter') login();
    });
    $('signupPassword2')?.addEventListener('keydown',e=>{
      if(e.key==='Enter') signup();
    });
    $('authV181NewPassword2')?.addEventListener('keydown',e=>{
      if(e.key==='Enter') saveNewPassword();
    });

    // Remplace l'ancienne fonction localeStorage appelée par l'ancien HTML.
    window.saveSignupLead=signup;
    window.OSTEO_AUTH={
      version:VERSION,
      signup,
      login,
      logout,
      getSession:()=>session,
      isAuthenticated:()=>!!session
    };
  }

  async function init(){
    injectStyles();
    createLoginScreen();
    createResetPasswordScreen();
    prepareSignupScreen();
    prepareWelcome();
    installPasswordToggles();
    installLogoutButton();

    // Attendre la fonction go de l'application.
    let tries=0;
    while(typeof window.go!=='function' && tries<80){
      await new Promise(r=>setTimeout(r,50));
      tries++;
    }
    installGoGuard();

    try{
      await ensureSupabase();
      const {data}=await client.auth.getSession();
      session=data?.session||null;
      sessionReady=true;

      client.auth.onAuthStateChange(async(event,newSession)=>{
        session=newSession||null;
        sessionReady=true;

        if(event==='PASSWORD_RECOVERY'){
          // Supabase nous renvoie bien vers le site : c'est normal.
          // On transforme cette arrivée en écran "Nouveau mot de passe".
          updateLockClass('reset-password');
          setTimeout(()=>safeGo('reset-password'),0);
          return;
        }

        updateLockClass(document.querySelector('.screen.active')?.id||'welcome');

        if(event==='SIGNED_IN' && session){
          installLogoutButton();
        }
        if(event==='SIGNED_OUT'){
          safeGo('welcome');
        }
      });

      bind();
      updateLockClass(document.querySelector('.screen.active')?.id||'welcome');

      // Les liens Supabase reviennent volontairement vers le site.
      // Pour un mot de passe oublié, on ne doit PAS aller à l'accueil :
      // on affiche l'écran qui permet de choisir le nouveau mot de passe.
      const hash=String(location.hash||'');
      const query=String(location.search||'');
      const recoveryReturn=/type=recovery/i.test(hash) || /type=recovery/i.test(query);

      if(recoveryReturn){
        safeGo('reset-password');
      }else if(session && hash && /access_token|refresh_token/i.test(hash)){
        history.replaceState(null,'',location.pathname+location.search);
        safeGo('home');
      }
    }catch(error){
      sessionReady=true;
      bind();
      updateLockClass('welcome');
      console.error('[Ostéo Pratik Auth]',error);
      setStatus(
        'authV18SignupStatus',
        'Le service d’inscription est momentanément indisponible.',
        'error'
      );
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
