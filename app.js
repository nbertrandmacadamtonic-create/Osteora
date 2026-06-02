const techniques = [
  {id:1,title:"Dysfonction cervicale C2–C6 assis",sub:"Cervicales",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"▷"},
  {id:2,title:"Technique de rotation cervicale assise",sub:"Cervicales",level:"Niveau intermédiaire",status:"vue",percent:100,icon:"↻"},
  {id:3,title:"Technique de flexion cervicale",sub:"Cervicales",level:"Niveau intermédiaire",status:"à revoir",percent:0,icon:"↓"},
  {id:4,title:"Technique de l’élévateur de la scapula",sub:"Cervicales",level:"Niveau intermédiaire",status:"en cours",percent:60,icon:"♙"},
  {id:5,title:"Relâchement des muscles sous-occipitaux",sub:"Cervicales",level:"Niveau débutant",status:"non vue",percent:0,icon:"◌"},
  {id:6,title:"Technique de glissement cervical latéral",sub:"Cervicales",level:"Niveau avancé",status:"en cours",percent:30,icon:"▥"},
  {id:7,title:"Technique dorsale à genoux",sub:"Dorsales",level:"Niveau intermédiaire",status:"vue",percent:80,icon:"▷"},
  {id:8,title:"Technique lombaire en décubitus",sub:"Lombaires",level:"Niveau avancé",status:"à revoir",percent:45,icon:"▷"}
];

let currentSubzone = "Cervicales";
let currentBack = "rachis";

function go(id){
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === id);
    if(screen.id === id) screen.scrollTop = 0;
  });

  document.querySelectorAll(".bottom button").forEach(btn => {
    const target = btn.dataset.target;
    const active =
      target === id ||
      (target === "body" && ["body","rachis","techniques","player"].includes(id)) ||
      (target === "revision" && ["revision","revisionCard"].includes(id)) ||
      (target === "home" && ["quiz","progress"].includes(id));
    btn.classList.toggle("active", active);
  });
}

function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 1500);
}

function openSubzone(subzone){
  currentSubzone = subzone;
  currentBack = "rachis";
  document.getElementById("techTitle").textContent = subzone;
  renderTechniques();
  go("techniques");
}

function openGenericZone(zone){
  currentSubzone = zone;
  currentBack = "body";
  document.getElementById("techTitle").textContent = zone;
  renderTechniques();
  go("techniques");
}

function renderTechniques(){
  const query = (document.getElementById("searchInput")?.value || "").toLowerCase();

  let items = techniques.filter(t => {
    return t.sub === currentSubzone && t.title.toLowerCase().includes(query);
  });

  if(currentSubzone === "Membres supérieurs"){
    items = [
      {id:9,title:"Correction de l’épaule en énergie musculaire",sub:"Épaule",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"▷"},
      {id:10,title:"Technique du coude en énergie musculaire",sub:"Coude",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"↻"}
    ];
  }

  if(currentSubzone === "Membres inférieurs"){
    items = [
      {id:11,title:"Technique du genou en chaîne fermée",sub:"Genou",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"▷"},
      {id:12,title:"Technique de cheville en énergie musculaire",sub:"Cheville",level:"Niveau débutant",status:"non vue",percent:0,icon:"↻"}
    ];
  }

  const list = document.getElementById("techList");
  if(!list) return;

  list.innerHTML = items.map((t, index) => `
    <button class="tech card ${index === 0 ? "featured" : ""}" onclick="openTechnique(${t.id})">
      <div class="tech-icon">${t.icon}</div>
      <div>
        <h3>${t.title}</h3>
        <small>${t.level}</small>
      </div>
      <div class="state">${stateLabel(t)}</div>
    </button>
  `).join("");
}

function stateLabel(t){
  if(t.status === "vue") return `<span class="seen">vue ✓</span>`;
  if(t.status === "à revoir") return `<span class="review">à revoir !</span>`;
  if(t.percent) return `<b>${t.percent}%</b>`;
  return `<span>non vue ○</span>`;
}

function openTechnique(id){
  const technique = techniques.find(t => t.id === id) || techniques[0];
  document.getElementById("playerTitle").textContent = technique.title;
  go("player");
}

function toggleVideo(){
  const video = document.getElementById("video");
  if(!video) return;

  if(video.paused){
    video.play().catch(() => toast("Ajoutez la vidéo dans assets/videos"));
  }else{
    video.pause();
  }
}

function jump(seconds){
  const video = document.getElementById("video");
  if(video && video.duration){
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }
}

function showTab(id, btn){
  document.querySelectorAll(".tab").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(button => button.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  btn.classList.add("active");
}

renderTechniques();
