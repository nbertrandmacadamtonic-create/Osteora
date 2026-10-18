/* ==============================================================
   OSTÉO PRATIK V22 — CARTES AUTOMATIQUES HIGH-TECH
   --------------------------------------------------------------
   SOURCE UNIQUE : window.OSTEO_RA_EMBEDDED_DETAILS
   - toutes les techniques officielles de la base
   - recto : vraie photo de technique + filtre + visuel de zone
   - verso : 4 vraies photos + 4 vrais textes
   - logos officiels fournis par Ostéo Pratik
   - aucune source bibliographique affichée
   - aucun texte clinique inventé
   - aucun changement de index.html
   ============================================================== */
(function(){
  'use strict';

  const VERSION='22.0';
  const UI='assets/ui/cards/';
  const ASSETS={
    logo:UI+'logo-osteo-pratik.png',
    position:UI+'position.png',
    mains:UI+'mains.png',
    barriere:UI+'barriere.png',
    normalisation:UI+'normalisation.png'
  };
  const ORDER=['position','mains','barriere','normalisation'];
  const LABELS={
    position:'Position du praticien',
    mains:'Position des mains',
    barriere:'Barrière motrice',
    normalisation:'Normalisation'
  };

  function txt(v){return String(v==null?'':v).replace(/\r/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function br(v){return esc(txt(v)).replace(/\n/g,'<br>')}
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-zA-Z0-9]+/g,' ').trim().toLowerCase()}

  function data(){
    const d=window.OSTEO_RA_EMBEDDED_DETAILS;
    return d&&Array.isArray(d.officialTechniques)?d:null;
  }
  function techniques(){return data()?.officialTechniques||[]}

  function find(ref){
    if(!ref)return null;
    if(typeof ref==='object'&&ref.slug)return ref;
    const raw=String(ref), n=norm(raw);
    return techniques().find(t=>String(t.slug||'')===raw||String(t.sourceRow||'')===raw||norm(t.title)===n)
      || techniques().find(t=>norm(t.title).includes(n)||norm(t.slug).includes(n))||null;
  }

  function stepMap(t){
    const o={};
    for(const s of (t?.detail?.steps||[])) if(s?.key)o[String(s.key).toLowerCase()]=s;
    return o;
  }

  function code(t){
    const n=norm(t?.title);
    if(/atloido axoidienne/.test(n))return 'C1-C2';
    const icon=String(t?.icon||'T').replace(/\s+/g,'').toUpperCase();
    const row=Number(t?.sourceRow);
    return icon+(Number.isFinite(row)?String(row).padStart(2,'0'):'');
  }

  function level(v){return txt(v).replace(/^Niveau\s+/i,'')||'—'}

  function positionSummary(text){
    const t=txt(text), m=t.match(/(?:PATIENT|SUJET)\s+([^.\n]+(?:\.)?)/i);
    if(m)return m[1].replace(/\.$/,'');
    if(/décubitus dorsal/i.test(t))return 'Décubitus dorsal';
    if(/décubitus latéral|latérocubitus/i.test(t))return 'Décubitus latéral';
    if(/procubitus/i.test(t))return 'Procubitus';
    if(/assis/i.test(t))return 'Assis';
    return 'Voir verso';
  }

  function repetition(text){
    const t=txt(text);
    const m=t.match(/(?:à|a)\s+répéter\s+(\d+)\s+fois/i)||t.match(/répéter\s+(\d+)\s+fois/i);
    return m?m[1]+' fois':'';
  }

  function model(ref){
    const t=find(ref); if(!t)return null;
    const sm=stepMap(t);
    const steps=ORDER.map(key=>({
      key,
      label:LABELS[key],
      icon:ASSETS[key],
      text:txt(sm[key]?.body||''),
      photo:txt(sm[key]?.photo||'')
    }));

    return {
      slug:t.slug,
      code:code(t),
      title:txt(t.title),
      zone:txt(t.zone),
      sub:txt(t.sub),
      level:level(t.level),
      method:txt(t.detail?.method||''),
      // Une seule vraie photo au recto : photo de position de la technique.
      frontPhoto:txt(sm.position?.photo||t.image||''),
      // Le visuel anatomique de zone reste distinct de la photo principale.
      zoneGraphic:txt(t.headerImage||''),
      logo:ASSETS.logo,
      steps,
      position:positionSummary(sm.position?.body||''),
      repetition:repetition(sm.normalisation?.body||'')
    };
  }

  function stepHTML(s){
    return `<section class="op22-step op22-${esc(s.key)}">
      <div class="op22-step-icon"><img src="${esc(s.icon)}" alt=""></div>
      <div class="op22-step-text"><h3>${esc(s.label)}</h3><p>${br(s.text)}</p></div>
      <img class="op22-step-photo" src="${esc(s.photo)}" alt="${esc(s.label)}" loading="lazy">
    </section>`;
  }

  function cardHTML(m,opts={}){
    const backClass=opts.back?' is-flipped':'';
    const rep=m.repetition?`<div class="op22-back-chip"><span>Répétition</span><b>${esc(m.repetition)}</b></div>`:'';
    return `<div class="op22-card${backClass}" data-card-slug="${esc(m.slug)}">
      <div class="op22-inner">
        <article class="op22-face op22-front">
          <div class="op22-front-photo"><img src="${esc(m.frontPhoto)}" alt="${esc(m.title)}"><div class="op22-photo-filter"></div></div>
          <img class="op22-logo" src="${esc(m.logo)}" alt="Ostéo Pratik">
          <div class="op22-code">${esc(m.code)}</div>
          ${m.zoneGraphic?`<div class="op22-zone-hologram"><img src="${esc(m.zoneGraphic)}" alt="${esc(m.sub||m.zone)}"></div>`:''}
          <div class="op22-front-copy">
            <div class="op22-zone-pill">${esc(m.zone)}</div>
            <h2>${esc(m.title)}</h2>
            <div class="op22-sub">${esc(m.sub)}</div>
            <div class="op22-meta">
              <div><span>Niveau</span><b>${esc(m.level)}</b></div>
              <div><span>Type</span><b>${esc(m.method||'—')}</b></div>
              <div><span>Position</span><b>${esc(m.position)}</b></div>
            </div>
          </div>
          <button class="op22-flip" type="button" aria-label="Retourner la carte">↻</button>
        </article>

        <article class="op22-face op22-back">
          <img class="op22-logo op22-logo-back" src="${esc(m.logo)}" alt="Ostéo Pratik">
          <div class="op22-code">${esc(m.code)}</div>
          <header class="op22-back-header"><h2>${esc(m.title)}</h2><div>${esc(m.sub)}</div></header>
          <div class="op22-steps">${m.steps.map(stepHTML).join('')}</div>
          <div class="op22-back-footer">
            <div class="op22-back-chip"><span>Méthode</span><b>${esc(m.method||'—')}</b></div>${rep}
          </div>
          <button class="op22-flip" type="button" aria-label="Retourner la carte">↻</button>
        </article>
      </div>
    </div>`;
  }

  function wire(root){
    root.querySelectorAll('.op22-flip').forEach(b=>b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();b.closest('.op22-card')?.classList.toggle('is-flipped');
    }));
  }

  function ensureCSS(){
    if(document.getElementById('op22css'))return;
    const l=document.createElement('link');l.id='op22css';l.rel='stylesheet';l.href='playing-cards-v22.css?v=22.0';document.head.appendChild(l);
  }

  function render(ref,target,opts={}){
    ensureCSS();
    const el=typeof target==='string'?document.querySelector(target):target;
    if(!el)throw new Error('Ostéo Pratik V22 : conteneur introuvable');
    const m=model(ref); if(!m){el.innerHTML='<div class="op22-error">Technique introuvable.</div>';return null}
    el.innerHTML=cardHTML(m,opts);wire(el);return m;
  }

  function viewer(target,opts={}){
    ensureCSS();
    const el=typeof target==='string'?document.querySelector(target):target;
    if(!el)throw new Error('Ostéo Pratik V22 : conteneur introuvable');
    const all=techniques();
    let filtered=all.slice(), index=Math.max(0,Number(opts.index)||0);

    el.innerHTML=`<div class="op22-viewer">
      <div class="op22-toolbar">
        <input class="op22-search" type="search" placeholder="Rechercher une technique…">
        <select class="op22-zone-select"><option value="">Toutes les zones</option></select>
        <button class="op22-prev" type="button">‹</button><span class="op22-counter"></span><button class="op22-next" type="button">›</button>
      </div>
      <div class="op22-stage"></div>
    </div>`;

    const zones=[...new Set(all.map(t=>txt(t.zone)).filter(Boolean))].sort();
    const sel=el.querySelector('.op22-zone-select');
    zones.forEach(z=>{const o=document.createElement('option');o.value=z;o.textContent=z;sel.appendChild(o)});
    const stage=el.querySelector('.op22-stage'), counter=el.querySelector('.op22-counter');

    function draw(){
      if(!filtered.length){stage.innerHTML='<div class="op22-empty">Aucune technique.</div>';counter.textContent='0 / 0';return}
      if(index>=filtered.length)index=filtered.length-1;if(index<0)index=0;
      const m=model(filtered[index]); stage.innerHTML=cardHTML(m);wire(stage);counter.textContent=(index+1)+' / '+filtered.length;
    }
    function apply(){
      const q=norm(el.querySelector('.op22-search').value), z=sel.value;
      filtered=all.filter(t=>(!z||txt(t.zone)===z)&&(!q||norm(t.title+' '+t.zone+' '+t.sub+' '+t.detail?.method).includes(q)));
      index=0;draw();
    }
    el.querySelector('.op22-search').addEventListener('input',apply);
    sel.addEventListener('change',apply);
    el.querySelector('.op22-prev').addEventListener('click',()=>{index=(index-1+filtered.length)%filtered.length;draw()});
    el.querySelector('.op22-next').addEventListener('click',()=>{index=(index+1)%filtered.length;draw()});
    draw();
    return {count:all.length};
  }

  function audit(){
    const rows=techniques().map(t=>{
      const s=stepMap(t);
      const ok=ORDER.every(k=>s[k]?.body&&s[k]?.photo);
      return {slug:t.slug,title:t.title,complete:!!ok};
    });
    return {total:rows.length,complete:rows.filter(r=>r.complete).length,incomplete:rows.filter(r=>!r.complete)};
  }

  function ready(timeout=8000){
    return new Promise((resolve,reject)=>{
      const started=Date.now();(function tick(){
        if(data())return resolve(window.OSTEO_PLAYING_CARDS_V22);
        if(Date.now()-started>timeout)return reject(new Error('Base Ostéo Pratik non chargée'));
        setTimeout(tick,60);
      })();
    });
  }

  window.OSTEO_PLAYING_CARDS_V22={version:VERSION,ready,techniques,find,model,render,viewer,audit};
  window.dispatchEvent(new CustomEvent('osteo-playing-cards-v22-ready',{detail:{version:VERSION}}));
})();
