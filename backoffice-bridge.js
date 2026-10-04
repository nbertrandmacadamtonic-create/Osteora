/*
  Ostéo RA — Back-office bridge V1
  Couche additive : ne modifie ni app.js ni styles.css.
  Elle lit les modifications du back-office dans localStorage et les applique
  en mémoire au tableau `techniques` déjà chargé par Ostéo RA.
*/
(function () {
  'use strict';

  const KEYS = {
    snapshot: 'osteoRA.backoffice.snapshot.v1',
    patches: 'osteoRA.backoffice.patches.v1',
    additions: 'osteoRA.backoffice.additions.v1',
    deleted: 'osteoRA.backoffice.deleted.v1'
  };

  function clone(value) {
    try { return structuredClone(value); }
    catch (_) { return JSON.parse(JSON.stringify(value)); }
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function getTechniques() {
    try {
      if (typeof techniques !== 'undefined' && Array.isArray(techniques)) return techniques;
    } catch (_) {}
    try {
      if (Array.isArray(window.techniques)) return window.techniques;
    } catch (_) {}
    return null;
  }

  function setAliased(target, aliases, value, preferred) {
    let touched = false;
    aliases.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = value;
        touched = true;
      }
    });
    if (!touched && preferred) target[preferred] = value;
  }

  function applyCanonicalPatch(target, patch) {
    if (!target || !patch) return;

    if ('title' in patch) setAliased(target, ['title', 'titre'], patch.title, 'title');
    if ('zone' in patch) setAliased(target, ['zone', 'monde'], patch.zone, 'zone');
    if ('sub' in patch) setAliased(target, ['sub', 'region'], patch.sub, 'sub');
    if ('level' in patch) setAliased(target, ['level', 'niveau'], patch.level, 'level');
    if ('status' in patch) setAliased(target, ['status', 'statut'], patch.status, 'status');
    if ('icon' in patch) setAliased(target, ['icon'], patch.icon, 'icon');
    if ('image' in patch) setAliased(target, ['image', 'imageUrl', 'poster'], patch.image, 'image');
    if ('text' in patch) setAliased(target, ['text', 'texte', 'description', 'techniqueText'], patch.text, 'text');
    if ('quiz' in patch) setAliased(target, ['quiz', 'quizText', 'associatedQuiz'], patch.quiz, 'quiz');

    if ('video' in patch) {
      setAliased(target, ['videoUrl', 'video', 'vimeoUrl', 'directVimeo'], patch.video, 'videoUrl');
      if (String(patch.video || '').includes('vimeo')) target.videoProvider = 'vimeo';
    }

    if ('published' in patch) {
      if (Object.prototype.hasOwnProperty.call(target, 'published')) target.published = !!patch.published;
      if (Object.prototype.hasOwnProperty.call(target, 'statut')) target.statut = patch.published ? 'publie' : 'brouillon';
    }
  }

  function canonicalToNative(item) {
    const obj = {
      id: Number(item.id),
      title: item.title || 'Nouvelle technique',
      zone: item.zone || 'À classer',
      sub: item.sub || 'À classer',
      level: item.level || 'Tous niveaux',
      status: item.status || 'non vue',
      percent: 0,
      icon: item.icon || '•',
      videoProvider: String(item.video || '').includes('vimeo') ? 'vimeo' : '',
      videoUrl: item.video || '',
      image: item.image || '',
      text: item.text || '',
      quiz: item.quiz || ''
    };
    return obj;
  }

  function refreshKnownViews() {
    const names = [
      'renderTechniques', 'renderSeenCollections', 'renderRevisionWheel',
      'updateHomeCount', 'updateCatalogueCounts', 'updateProgressZoneStats'
    ];
    names.forEach((name) => {
      try {
        const fn = window[name] || eval('typeof ' + name + ' === "function" ? ' + name + ' : null');
        if (typeof fn === 'function') fn();
      } catch (_) {}
    });
  }

  function applyAll() {
    const list = getTechniques();
    if (!list) return false;

    if (!localStorage.getItem(KEYS.snapshot)) {
      write(KEYS.snapshot, clone(list));
    }

    const patches = read(KEYS.patches, {});
    const deleted = new Set(read(KEYS.deleted, []).map(Number));
    const additions = read(KEYS.additions, []);

    // Suppressions administratives.
    for (let i = list.length - 1; i >= 0; i--) {
      if (deleted.has(Number(list[i] && list[i].id))) list.splice(i, 1);
    }

    // Modifications sur les techniques existantes.
    list.forEach((item) => {
      const patch = patches[String(item.id)] || patches[item.id];
      if (patch) applyCanonicalPatch(item, patch);
    });

    // Ajouts créés depuis le back-office.
    additions.forEach((canonical) => {
      const id = Number(canonical && canonical.id);
      if (!id || deleted.has(id) || list.some((x) => Number(x.id) === id)) return;
      list.push(canonicalToNative(canonical));
    });

    refreshKnownViews();
    return true;
  }

  window.OsteoRABackofficeBridge = {
    keys: KEYS,
    apply: applyAll,
    resetAdminEdits: function () {
      localStorage.removeItem(KEYS.patches);
      localStorage.removeItem(KEYS.additions);
      localStorage.removeItem(KEYS.deleted);
      location.reload();
    }
  };

  // Le script est chargé tout en bas de l'index : on tente immédiatement,
  // puis après DOMContentLoaded pour couvrir toutes les variantes du site.
  applyAll();
  document.addEventListener('DOMContentLoaded', applyAll, { once: true });

  // Si le back-office est ouvert dans un autre onglet, les changements sont
  // appliqués sans toucher au code source de l'application.
  window.addEventListener('storage', function (event) {
    if (Object.values(KEYS).includes(event.key)) applyAll();
  });
})();


/* === ACCÈS BACK-OFFICE DEPUIS L'APPLICATION ===
   Ajout purement dynamique : aucun changement dans index.html, app.js ou styles.css.
*/
(function () {
  function openBackoffice() {
    window.location.href = "backoffice.html";
  }

  function installBackofficeAccess() {
    const profile = document.getElementById("profile");
    if (!profile || profile.dataset.backofficeAccessInstalled === "1") return;
    profile.dataset.backofficeAccessInstalled = "1";

    // 1) Rend le bouton ⚙ du profil cliquable vers le back-office.
    const headerButtons = profile.querySelectorAll("header .icon");
    if (headerButtons.length) {
      const gear = headerButtons[headerButtons.length - 1];
      gear.setAttribute("aria-label", "Ouvrir le back-office");
      gear.title = "Back-office";
      gear.onclick = openBackoffice;
    }

    // 2) Ajoute un bouton explicite dans la page Profil.
    const card = document.createElement("article");
    card.id = "osteoBackofficeAccessCard";
    card.innerHTML = `
      <div class="osteo-bo-icon">⚙</div>
      <div class="osteo-bo-copy">
        <strong>Back-office Ostéo Pratik</strong>
        <span>Modifier les techniques, textes, vidéos et images.</span>
      </div>
      <button type="button" class="osteo-bo-open">Ouvrir</button>
    `;
    card.querySelector(".osteo-bo-open").addEventListener("click", openBackoffice);

    const profileCard = profile.querySelector("article.profile");
    if (profileCard) profileCard.insertAdjacentElement("afterend", card);
    else profile.appendChild(card);

    // Style injecté localement par le bridge pour ne pas toucher à styles.css.
    if (!document.getElementById("osteoBackofficeAccessStyles")) {
      const style = document.createElement("style");
      style.id = "osteoBackofficeAccessStyles";
      style.textContent = `
        #osteoBackofficeAccessCard{
          margin-top:14px;padding:14px;border-radius:24px;
          display:grid;grid-template-columns:52px minmax(0,1fr) auto;
          gap:12px;align-items:center;
          background:linear-gradient(145deg,rgba(10,29,55,.82),rgba(5,15,31,.88));
          border:1px solid rgba(0,229,255,.25);
          box-shadow:0 18px 55px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.05);
        }
        #osteoBackofficeAccessCard .osteo-bo-icon{
          width:52px;height:52px;border-radius:50%;
          display:grid;place-items:center;font-size:24px;
          color:#00e5ff;border:1px solid rgba(0,229,255,.38);
          background:rgba(0,229,255,.10);
        }
        #osteoBackofficeAccessCard .osteo-bo-copy strong{
          display:block;color:#fff;font-size:15px;line-height:1.15;
        }
        #osteoBackofficeAccessCard .osteo-bo-copy span{
          display:block;margin-top:5px;color:#aeb8cc;font-size:12px;line-height:1.3;
        }
        #osteoBackofficeAccessCard .osteo-bo-open{
          padding:10px 12px;border-radius:14px;font-weight:900;
          color:#fff;background:linear-gradient(135deg,#00e5ff,#2d8cff);
          border:0;
        }
        @media(max-width:380px){
          #osteoBackofficeAccessCard{
            grid-template-columns:46px minmax(0,1fr);
          }
          #osteoBackofficeAccessCard .osteo-bo-open{
            grid-column:1 / -1;width:100%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  installBackofficeAccess();
  document.addEventListener("DOMContentLoaded", installBackofficeAccess, { once:true });
  setTimeout(installBackofficeAccess, 250);
})();
