/* ============================================================
   OSTÉO PRATIK V21 — GÉNÉRATEUR DE CARTES À JOUER
   - Base : window.OSTEO_RA_EMBEDDED_DETAILS
   - Vraies images / vrais textes de la base
   - Aucun texte clinique inventé
   - Aucune source bibliographique affichée
   - Ne modifie pas index.html
   ============================================================ */
(function () {
  "use strict";
  const VERSION = "21.0";
  const ICON_BASE = "assets/ui/cards/";
  const ICONS = {
    position: ICON_BASE + "position.png",
    mains: ICON_BASE + "mains.png",
    barriere: ICON_BASE + "barriere.png",
    normalisation: ICON_BASE + "normalisation.png"
  };
  const LABELS = {
    position: "Position du praticien",
    mains: "Position des mains",
    barriere: "Barrière motrice",
    normalisation: "Normalisation"
  };
  const STEP_ORDER = ["position", "mains", "barriere", "normalisation"];
  function cleanText(value) {
    return String(value == null ? "" : value).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function cleanLevel(value) { return cleanText(value).replace(/^Niveau\s+/i, "") || "—"; }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function nl2br(value) { return escapeHtml(cleanText(value)).replace(/\n/g, "<br>"); }
  function getData() {
    const d = window.OSTEO_RA_EMBEDDED_DETAILS;
    return d && Array.isArray(d.officialTechniques) ? d : null;
  }
  function techniques() { return getData()?.officialTechniques || []; }
  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, " ").replace(/[^a-zA-Z0-9]+/g, " ").trim().toLowerCase();
  }
  function findTechnique(ref) {
    if (!ref) return null;
    if (typeof ref === "object" && ref.slug) return ref;
    const raw = String(ref), norm = normalize(raw);
    return techniques().find(t => String(t.slug||"")===raw || String(t.sourceRow||"")===raw || normalize(t.title)===norm || normalize(t.slug)===norm)
      || techniques().find(t => normalize(t.title).includes(norm) || normalize(t.slug).includes(norm)) || null;
  }
  function repetitionFromText(text) {
    const value = cleanText(text);
    const m = value.match(/(?:à|a)\s+répéter\s+(\d+)\s+fois/i) || value.match(/répéter\s+(\d+)\s+fois/i) || value.match(/(\d+)\s+fois/i);
    return m ? (m[1] + " fois") : "";
  }
  function stepMap(t) {
    const out = {};
    for (const step of (t?.detail?.steps || [])) if (step?.key) out[String(step.key).toLowerCase()] = step;
    return out;
  }
  function makeCode(t) {
    const title = normalize(t?.title);
    if (/atloido axoidienne|atlas axis/.test(title)) return "C1-C2";
    const row = Number(t?.sourceRow);
    return Number.isFinite(row) ? String(t?.icon || "T") + String(row).padStart(2,"0") : String(t?.icon || "T").toUpperCase();
  }
  function buildModel(ref) {
    const t = findTechnique(ref); if (!t) return null;
    const map = stepMap(t);
    const ordered = STEP_ORDER.map(key => ({
      key, label: LABELS[key], icon: ICONS[key], text: cleanText(map[key]?.body || ""), photo: cleanText(map[key]?.photo || "")
    }));
    return {
      slug:t.slug, sourceRow:t.sourceRow, code:makeCode(t), title:cleanText(t.title), zone:cleanText(t.zone), sub:cleanText(t.sub),
      level:cleanLevel(t.level), method:cleanText(t.detail?.method || ""),
      frontImage:cleanText(t.image || map.position?.photo || ""),
      steps:ordered, repetition:repetitionFromText(map.normalisation?.body || "")
    };
  }
  function installStyles() {
    if (document.getElementById("osteoPlayingCardsV21Styles")) return;
    const link=document.createElement("link"); link.id="osteoPlayingCardsV21Styles"; link.rel="stylesheet"; link.href="playing-cards-v21.css?v=21.0";
    (document.head||document.documentElement).appendChild(link);
  }
  function positionSummary(text) {
    const t=cleanText(text); const m=t.match(/(?:PATIENT|SUJET)\s+([^.\n]+(?:\.)?)/i);
    if(m) return m[1].replace(/\.$/,"");
    if(/décubitus dorsal/i.test(t)) return "Décubitus dorsal";
    if(/décubitus latéral|latérocubitus/i.test(t)) return "Décubitus latéral";
    if(/procubitus/i.test(t)) return "Procubitus";
    if(/assis/i.test(t)) return "Assis";
    return "Voir verso";
  }
  function stepHtml(step) {
    const image = step.photo ? `<img class="opc-step-photo" src="${escapeHtml(step.photo)}" alt="${escapeHtml(step.label)}" loading="lazy">`
      : `<div class="opc-step-photo opc-step-photo-missing">Image non disponible</div>`;
    return `<section class="opc-step opc-step-${escapeHtml(step.key)}"><div class="opc-step-icon-wrap"><img class="opc-step-icon" src="${escapeHtml(step.icon)}" alt=""></div><div class="opc-step-copy"><h3>${escapeHtml(step.label)}</h3><p>${nl2br(step.text)}</p></div>${image}</section>`;
  }
  function cardHtml(model, options) {
    const showRepetition=options?.showRepetition!==false && model.repetition;
    return `<div class="opc-card" data-osteo-card="${escapeHtml(model.slug)}"><div class="opc-card-inner">
      <article class="opc-face opc-front"><div class="opc-brand">OSTÉO<br>PRATIK</div><div class="opc-code">${escapeHtml(model.code)}</div>
      <div class="opc-front-media"><img src="${escapeHtml(model.frontImage)}" alt="${escapeHtml(model.title)}"><div class="opc-front-filter"></div></div>
      <div class="opc-front-copy"><div class="opc-zone">${escapeHtml(model.zone||"OSTÉOPATHIE")}</div><h2>${escapeHtml(model.title)}</h2><div class="opc-sub">${escapeHtml(model.sub)}</div>
      <div class="opc-meta"><div><span>Niveau</span><b>${escapeHtml(model.level)}</b></div><div><span>Type</span><b>${escapeHtml(model.method||"—")}</b></div><div><span>Position</span><b>${escapeHtml(positionSummary(model.steps[0]?.text))}</b></div></div></div>
      <button type="button" class="opc-flip-button" aria-label="Voir le verso">↻</button></article>
      <article class="opc-face opc-back"><div class="opc-brand opc-brand-small">OSTÉO<br>PRATIK</div><div class="opc-code">${escapeHtml(model.code)}</div>
      <header class="opc-back-head"><h2>${escapeHtml(model.title)}</h2><div>${escapeHtml(model.sub)}</div></header>
      <div class="opc-steps">${model.steps.map(stepHtml).join("")}</div>
      <div class="opc-back-footer"><div class="opc-footer-chip"><span>Méthode</span><b>${escapeHtml(model.method||"—")}</b></div>${showRepetition?`<div class="opc-footer-chip"><span>Répétition</span><b>${escapeHtml(model.repetition)}</b></div>`:""}</div>
      <button type="button" class="opc-flip-button" aria-label="Voir le recto">↻</button></article>
    </div></div>`;
  }
  function wireFlip(root) {
    root.querySelectorAll(".opc-flip-button").forEach(btn=>btn.addEventListener("click",ev=>{ev.stopPropagation();btn.closest(".opc-card")?.classList.toggle("is-flipped");}));
    root.querySelectorAll(".opc-card").forEach(card=>card.addEventListener("dblclick",()=>card.classList.toggle("is-flipped")));
  }
  function render(ref,target,options={}) {
    installStyles(); const el=typeof target==="string"?document.querySelector(target):target; if(!el) throw new Error("Ostéo Pratik V21 : conteneur introuvable.");
    const model=buildModel(ref); if(!model){el.innerHTML='<div class="opc-error">Technique introuvable dans la base.</div>';return null;}
    el.innerHTML=cardHtml(model,options); wireFlip(el); return model;
  }
  function renderMany(refs,target,options={}) {
    installStyles(); const el=typeof target==="string"?document.querySelector(target):target; if(!el) throw new Error("Ostéo Pratik V21 : conteneur introuvable.");
    const models=refs.map(buildModel).filter(Boolean); el.innerHTML=`<div class="opc-gallery">${models.map(m=>cardHtml(m,options)).join("")}</div>`; wireFlip(el); return models;
  }
  function ready(timeoutMs=8000) {
    return new Promise((resolve,reject)=>{const start=Date.now();(function tick(){if(getData()) return resolve(window.OSTEO_PLAYING_CARDS_V21);if(Date.now()-start>timeoutMs)return reject(new Error("Ostéo Pratik V21 : base des techniques non chargée."));setTimeout(tick,60);})();});
  }
  window.OSTEO_PLAYING_CARDS_V21={version:VERSION,ready,techniques,findTechnique,buildModel,render,renderMany};
  window.dispatchEvent(new CustomEvent("osteo-playing-cards-ready",{detail:{version:VERSION}}));
})();
