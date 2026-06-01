const techniques = [
  {
    id:1,
    title:"Dysfonction cervicale C2-C6 assis",
    category:"Rachis",
    sub:"Cervicales",
    level:"Niveau intermédiaire",
    type:"Technique structurelle",
    duration:"06:38",
    views:12,
    percent:87,
    score:"4,7/5",
    status:"non vue",
    icon:"▷",
    poster:"assets/images/video-poster-cervicale-c2-c6.webp",
    video:"assets/videos/dysfonction-cervicale-c2-c6-assis.mp4",
    steps:[
      "Position du praticien",
      "Position du patient",
      "Contact et évaluation",
      "Mise en tension",
      "Thrust / impulsion",
      "Réévaluation"
    ]
  },
  {
    id:2,
    title:"Technique de rotation cervicale assise",
    category:"Rachis",
    sub:"Cervicales",
    level:"Niveau intermédiaire",
    type:"Énergie musculaire",
    duration:"07:20",
    views:8,
    percent:100,
    score:"4,4/5",
    status:"vue",
    icon:"↻",
    steps:["Installation","Évaluation","Contraction isométrique","Relâchement","Gain d’amplitude"]
  },
  {
    id:3,
    title:"Technique de flexion cervicale",
    category:"Rachis",
    sub:"Cervicales",
    level:"Niveau débutant",
    type:"Énergie musculaire",
    duration:"05:45",
    views:3,
    percent:50,
    score:"3,8/5",
    status:"à revoir",
    icon:"↓",
    steps:["Installation","Contact","Correction","Réévaluation"]
  },
  {
    id:4,
    title:"Technique de l’élévateur de la scapula",
    category:"Rachis",
    sub:"Cervicales",
    level:"Niveau intermédiaire",
    type:"Énergie musculaire",
    duration:"06:10",
    views:6,
    percent:60,
    score:"4,1/5",
    status:"en cours",
    icon:"♙",
    steps:["Repérage","Positionnement","Contraction","Relâchement","Réévaluation"]
  },
  {
    id:5,
    title:"Relâchement des muscles sous-occipitaux",
    category:"Rachis",
    sub:"Cervicales",
    level:"Niveau débutant",
    type:"Énergie musculaire",
    duration:"04:50",
    views:0,
    percent:0,
    score:"—",
    status:"non vue",
    icon:"✋",
    steps:["Installation","Contact sous-occipital","Respiration","Relâchement","Réévaluation"]
  },
  {
    id:6,
    title:"Technique de glissement cervical latéral",
    category:"Rachis",
    sub:"Cervicales",
    level:"Niveau avancé",
    type:"Technique structurelle",
    duration:"08:12",
    views:4,
    percent:30,
    score:"3,9/5",
    status:"en cours",
    icon:"▥",
    steps:["Position","Contact","Mise en tension","Impulsion","Réévaluation"]
  },
  {
    id:7,
    title:"Technique dorsale à genoux",
    category:"Rachis",
    sub:"Dorsales",
    level:"Niveau intermédiaire",
    type:"Technique structurelle",
    duration:"08:45",
    views:10,
    percent:78,
    score:"4,5/5",
    status:"vue",
    icon:"▷",
    steps:["Position du patient","Contact dorsal","Mise en tension","Impulsion","Réévaluation"]
  },
  {
    id:8,
    title:"Technique lombaire en décubitus",
    category:"Rachis",
    sub:"Lombaires",
    level:"Niveau avancé",
    type:"Technique structurelle",
    duration:"09:30",
    views:7,
    percent:80,
    score:"4,6/5",
    status:"vue",
    icon:"▷",
    steps:["Décubitus latéral","Verrouillage","Mise en tension","Impulsion","Réévaluation"]
  },
  {
    id:9,
    title:"Correction de l’épaule en énergie musculaire",
    category:"Membres supérieurs",
    sub:"Épaule",
    level:"Niveau intermédiaire",
    type:"Énergie musculaire",
    duration:"06:20",
    views:5,
    percent:62,
    score:"4,2/5",
    status:"en cours",
    icon:"↻",
    steps:["Test initial","Positionnement","Contraction","Relâchement","Contrôle"]
  },
  {
    id:10,
    title:"Technique du genou en chaîne fermée",
    category:"Membres inférieurs",
    sub:"Genou",
    level:"Niveau intermédiaire",
    type:"Énergie musculaire",
    duration:"07:10",
    views:3,
    percent:43,
    score:"3,9/5",
    status:"à revoir",
    icon:"↻",
    steps:["Analyse","Contact","Correction","Contrôle"]
  }
];

let currentSubzone = "Cervicales";
let previousTechniqueScreen = "rachis";
let currentTechnique = techniques[0];
let playing = false;

const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".bottom-nav button");

function showScreen(id){
  screens.forEach(screen => screen.classList.toggle("active", screen.id === id));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.screen === id));
  const activeScroll = document.querySelector(`#${id} .scroll`);
  if(activeScroll) activeScroll.scrollTop = 0;
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});

function openRegion(region){
  previousTechniqueScreen = "bodyMap";
  document.getElementById("techScreenTitle").textContent = region;
  currentSubzone = region;
  renderTechniqueList(region);
  showScreen("techniques");
}

function openSubzone(subzone){
  previousTechniqueScreen = "rachis";
  currentSubzone = subzone;
  document.getElementById("techScreenTitle").textContent = subzone;
  renderTechniqueList();
  showScreen("techniques");
}

function backFromTechniques(){
  if(["Cervicales","Dorsales","Lombaires"].includes(currentSubzone)){
    showScreen("rachis");
  } else {
    showScreen("bodyMap");
  }
}

function renderTechniqueList(forcedCategory){
  const search = (document.getElementById("techSearch")?.value || "").toLowerCase().trim();
  const list = document.getElementById("techniqueList");
  let filtered = techniques.filter(t => {
    const zoneMatch = forcedCategory ? t.category === forcedCategory : (t.sub === currentSubzone || t.category === currentSubzone);
    const searchMatch = !search || `${t.title} ${t.category} ${t.sub} ${t.level} ${t.type}`.toLowerCase().includes(search);
    return zoneMatch && searchMatch;
  });

  if(filtered.length === 0){
    filtered = techniques.filter(t => t.category === forcedCategory || t.category === currentSubzone);
  }

  list.innerHTML = filtered.map((t, index) => `
    <button class="tech-card glass ${index === 0 ? "featured" : ""}" onclick="openTechnique(${t.id})">
      <div class="tech-icon ${t.poster ? 'poster' : ''}" style="${t.poster ? `--poster:url('${t.poster}')` : ''}">${t.poster ? '' : t.icon}</div>
      <div>
        <h2>${t.title}</h2>
        <span class="level">${t.level}</span>
      </div>
      <div class="tech-state">
        ${stateLabel(t)}
      </div>
    </button>
  `).join("");
}

function stateLabel(t){
  if(t.status === "vue") return `<span class="seen">vue ✓</span>`;
  if(t.status === "à revoir") return `<span class="review">à revoir !</span>`;
  if(t.percent > 0) return `<strong>${t.percent}%</strong>`;
  return `<span>non vue ○</span>`;
}

function openTechnique(id){
  currentTechnique = techniques.find(t => t.id === id) || techniques[0];

  document.getElementById("playerTopTitle").textContent = shortTitle(currentTechnique.title);
  document.getElementById("playerTitle").textContent = currentTechnique.title;
  document.getElementById("playerZone").textContent = `${currentTechnique.category} ${currentTechnique.sub}`.trim();
  document.getElementById("playerType").textContent = currentTechnique.type;
  document.getElementById("playerLevel").textContent = currentTechnique.level;
  document.getElementById("timeEnd").textContent = currentTechnique.duration;
  document.getElementById("playerViews").textContent = currentTechnique.views;
  document.getElementById("playerPercent").textContent = `${currentTechnique.percent}%`;
  document.getElementById("playerScore").textContent = currentTechnique.score;
  document.getElementById("timeline").value = currentTechnique.percent || 0;
  document.getElementById("stepsList").innerHTML = currentTechnique.steps.map(step => `<li><span>${step}</span><em>⌄</em></li>`).join("");

  const videoStage = document.getElementById("videoStage");
  if(currentTechnique.video){
    videoStage.classList.toggle("poster-bg", !!currentTechnique.poster);
    if(currentTechnique.poster){
      videoStage.style.setProperty("--poster", `url('${currentTechnique.poster}')`);
    }
    videoStage.innerHTML = `
      <video id="realVideo" class="real-video" controls playsinline preload="metadata" poster="${currentTechnique.poster || ''}">
        <source src="${currentTechnique.video}" type="video/mp4">
        Votre navigateur ne peut pas lire cette vidéo.
      </video>
    `;
    setupRealVideo();
  } else {
    videoStage.classList.toggle("poster-bg", !!currentTechnique.poster);
    if(currentTechnique.poster){
      videoStage.style.setProperty("--poster", `url('${currentTechnique.poster}')`);
    }
    videoStage.innerHTML = `<div class="fake-video"><span>▶</span></div>`;
  }

  playing = false;
  document.getElementById("playButton").textContent = "▶";
  showScreen("player");
}

function setupRealVideo(){
  const video = document.getElementById("realVideo");
  if(!video) return;

  video.addEventListener("play", () => {
    playing = true;
    document.getElementById("playButton").textContent = "Ⅱ";
    currentTechnique.views += 1;
    document.getElementById("playerViews").textContent = currentTechnique.views;
  });

  video.addEventListener("pause", () => {
    playing = false;
    document.getElementById("playButton").textContent = "▶";
  });

  video.addEventListener("timeupdate", () => {
    if(!video.duration) return;
    const percent = Math.round((video.currentTime / video.duration) * 100);
    currentTechnique.percent = Math.max(currentTechnique.percent, percent);
    document.getElementById("timeline").value = percent;
    document.getElementById("playerPercent").textContent = `${currentTechnique.percent}%`;
    document.getElementById("timeStart").textContent = formatTime(video.currentTime);
  });

  document.getElementById("timeline").oninput = () => {
    if(!video.duration) return;
    video.currentTime = (Number(document.getElementById("timeline").value) / 100) * video.duration;
  };
}

function togglePlay(){
  const video = document.getElementById("realVideo");
  if(video){
    video.paused ? video.play() : video.pause();
    return;
  }
  playing = !playing;
  document.getElementById("playButton").textContent = playing ? "Ⅱ" : "▶";
}

function jump(seconds){
  const video = document.getElementById("realVideo");
  if(video){
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  } else {
    const timeline = document.getElementById("timeline");
    timeline.value = Math.max(0, Math.min(100, Number(timeline.value) + seconds / 3));
  }
}

function previousStep(){ toast("Étape précédente"); }
function nextStep(){ toast("Étape suivante"); }
function toggleFavorite(){ toast("Ajouté aux favoris"); }

document.querySelectorAll(".content-tabs button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".content-tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(`tab-${button.dataset.tab}`).classList.add("active");
  });
});

function openRevisionCard(mode){
  toast(mode === "random" ? "Carte tirée au sort" : "Révision ciblée");
  showScreen("revisionCard");
}

function answerQuiz(button, correct){
  document.querySelectorAll(".answers button").forEach(b => b.classList.remove("correct","wrong"));
  button.classList.add(correct ? "correct" : "wrong");
  document.getElementById("quizFeedback").classList.remove("hidden");
  if(correct) toast("Bonne réponse !");
  else toast("À revoir");
}

function formatTime(seconds){
  const m = String(Math.floor(seconds / 60)).padStart(2,"0");
  const s = String(Math.floor(seconds % 60)).padStart(2,"0");
  return `${m}:${s}`;
}

function shortTitle(title){
  return title.length > 28 ? `${title.slice(0,28)}…` : title;
}

function toast(message){
  const t = document.getElementById("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

function renderFavorites(){
  const favs = techniques.filter(t => [1,2,7].includes(t.id));
  const container = document.getElementById("favoritesList");
  if(!container) return;
  container.innerHTML = favs.map(t => `
    <button class="tech-card glass" onclick="openTechnique(${t.id})">
      <div class="tech-icon ${t.poster ? 'poster' : ''}" style="${t.poster ? `--poster:url('${t.poster}')` : ''}">${t.poster ? '' : t.icon}</div>
      <div>
        <h2>${t.title}</h2>
        <span class="level">${t.sub}</span>
      </div>
      <div class="tech-state">${stateLabel(t)}</div>
    </button>
  `).join("");
}

renderTechniqueList();
renderFavorites();
