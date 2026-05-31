
const videos = [
  {
    id:1,
    title:"Technique de thrust lombaire",
    category:"Rachis",
    sub:"Lombaires",
    level:"Avancé",
    duration:"6 min",
    views:4,
    percent:87,
    progress:47,
    last:"02:35",
    status:"À revoir",
    image:"assets/images/module-rachis.webp",
    description:"Vidéo noyau V3 : installation, prise de contact, mise en tension, verrouillage, impulsion, sécurité et retour au calme. Le texte vient autour de la vidéo, mais la vidéo reste le centre de l'application.",
    steps:["Installation du patient en décubitus latéral.","Prise de contact précise et stable.","Mise en tension progressive.","Recherche de la barrière motrice.","Impulsion brève et contrôlée.","Vérification et retour au calme."]
  },
  {
    id:7,
    title:"Dysfonction cervicale C2-C6 assis",
    category:"Rachis",
    sub:"Cervicales",
    level:"Avancé",
    duration:"6 min",
    views:0,
    percent:0,
    progress:0,
    last:"00:00",
    status:"Non vue",
    image:"assets/images/module-rachis.webp",
    video:"assets/videos/dysfonction-cervicale-c2-c6-assis.mp4",
    description:"Technique structurelle cervicale en position assise, centrée sur l’analyse et la correction d’une dysfonction C2-C6. Cette vidéo sert de premier test réel dans le module Rachis cervical.",
    steps:["Installation du patient en position assise.","Placement du praticien et prise de contact cervicale.","Repérage de la dysfonction C2-C6.","Mise en tension progressive et sécurisée.","Correction contrôlée dans l’axe.","Retour au neutre et réévaluation."]
  },
  {
    id:2,
    title:"Technique HVLA du rachis thoracique",
    category:"Rachis",
    sub:"Dorsales",
    level:"Intermédiaire",
    duration:"5 min",
    views:2,
    percent:54,
    progress:31,
    last:"01:12",
    status:"En cours",
    image:"assets/images/module-rachis.webp",
    description:"Révision des appuis et des axes de correction thoraciques.",
    steps:["Identifier le segment cible.","Positionner les mains et les leviers.","Optimiser l’appui thoracique.","Contrôler l’axe avant impulsion."]
  },
  {
    id:3,
    title:"Épaule : abduction et rotation",
    category:"Membres supérieurs",
    sub:"Épaule",
    level:"Débutant",
    duration:"4 min",
    views:5,
    percent:92,
    progress:64,
    last:"04:00",
    status:"Maîtrisée",
    image:"assets/images/module-membres-superieurs.webp",
    description:"Travail structurel guidé autour de l’épaule.",
    steps:["Installation de l’épaule.","Mise en tension douce.","Contrôle de l’abduction.","Rotation et libération."]
  },
  {
    id:4,
    title:"Poignet : correction structurelle",
    category:"Membres supérieurs",
    sub:"Poignet",
    level:"Intermédiaire",
    duration:"4 min",
    views:1,
    percent:21,
    progress:12,
    last:"00:48",
    status:"Commencée",
    image:"assets/images/module-membres-superieurs.webp",
    description:"Repères et gestes clés pour le poignet.",
    steps:["Repérer la restriction.","Positionner la prise.","Corriger l’axe.","Contrôler la mobilité finale."]
  },
  {
    id:5,
    title:"Cheville : mobilité et restrictions",
    category:"Membres inférieurs",
    sub:"Cheville",
    level:"Intermédiaire",
    duration:"5 min",
    views:3,
    percent:72,
    progress:55,
    last:"03:07",
    status:"En cours",
    image:"assets/images/module-membres-inferieurs.webp",
    description:"Révision structurelle de la cheville, avec sécurisation des appuis.",
    steps:["Bilan initial de la cheville.","Prise de contact et verrouillage.","Mobilité guidée.","Correction finale et contrôle."]
  },
  {
    id:6,
    title:"Genou : chaînes de correction",
    category:"Membres inférieurs",
    sub:"Genou",
    level:"Avancé",
    duration:"7 min",
    views:2,
    percent:66,
    progress:39,
    last:"02:18",
    status:"À revoir",
    image:"assets/images/module-membres-inferieurs.webp",
    description:"Technique avancée sur les chaînes de correction du genou.",
    steps:["Identifier la chaîne dominante.","Mise en position du membre inférieur.","Correction contrôlée.","Réévaluation fonctionnelle."]
  }
];

const quiz = [
  {question:"Quel est le point clé de sécurité dans une technique structurelle ?",answers:["La force maximale","Le verrouillage et l’axe","La vitesse uniquement"],correct:1},
  {question:"Quel élément doit rester au centre de cette application ?",answers:["Le lecteur vidéo pédagogique","Le logo","La page profil"],correct:0},
  {question:"Quelle statistique est indispensable pour l’étudiant ?",answers:["Nombre de vues et pourcentage vu","Couleur préférée","Nom du navigateur"],correct:0}
];

let currentFilter = "Tous";
let currentVideo = videos[0];
let playing = false;
let quizIndex = 0;

const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".bottom-nav button");
const chips = document.querySelectorAll(".chip");
const search = document.getElementById("search");

function showScreen(id){
  screens.forEach(s => s.classList.toggle("active", s.id === id));
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === id));
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

function renderVideos(){
  const q = search.value.toLowerCase().trim();
  const filtered = videos.filter(v => {
    const matchFilter = currentFilter === "Tous" || v.category === currentFilter;
    const matchSearch = !q || `${v.title} ${v.category} ${v.sub} ${v.level}`.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  document.getElementById("videoList").innerHTML = filtered.map(v => `
    <article class="video-card soft" onclick="openVideo(${v.id})">
      <div class="thumb" style="--thumb:url('${v.image}')"></div>
      <div>
        <h4>${v.title}</h4>
        <p>${v.category} • ${v.sub} • ${v.duration}</p>
        <div class="tag-row">
          <span class="tag">${v.level}</span>
          <span class="tag">${v.status}</span>
          <span class="tag">${v.percent}% vu</span>
        </div>
      </div>
      <div class="video-card-footer">
        <div class="bar"><span style="width:${v.progress}%"></span></div>
        <button class="small-btn">Ouvrir</button>
      </div>
    </article>
  `).join("");
}

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    currentFilter = chip.dataset.filter;
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    renderVideos();
  });
});

search.addEventListener("input", renderVideos);

function filterCategory(category){
  currentFilter = category;
  chips.forEach(c => c.classList.toggle("active", c.dataset.filter === category));
  renderVideos();
  showScreen("catalog");
}

function openVideo(id){
  currentVideo = videos.find(v => v.id === id);
  document.getElementById("playerTitle").textContent = currentVideo.title;
  document.getElementById("playerTopTitle").textContent = currentVideo.title.length > 24 ? currentVideo.title.slice(0,24) + "…" : currentVideo.title;
  document.getElementById("playerMeta").textContent = `${currentVideo.category} • ${currentVideo.sub} • ${currentVideo.level} • ${currentVideo.duration}`;
  document.getElementById("timeline").value = currentVideo.progress;
  document.getElementById("timeStart").textContent = currentVideo.last;
  document.getElementById("description").textContent = currentVideo.description;
  document.getElementById("views").textContent = currentVideo.views;
  document.getElementById("percent").textContent = currentVideo.percent + " %";
  document.getElementById("lastPosition").textContent = currentVideo.last;
  document.getElementById("status").textContent = currentVideo.status;
  document.getElementById("stepsList").innerHTML = currentVideo.steps.map(s => `<li>${s}</li>`).join("");
  const videoStage = document.getElementById("videoStage");
  videoStage.style.setProperty("--bg-img", `url('${currentVideo.image}')`);

  if (currentVideo.video) {
    videoStage.innerHTML = `
      <video id="realVideo" class="real-video" controls playsinline preload="metadata" poster="${currentVideo.image}">
        <source src="${currentVideo.video}" type="video/mp4">
        Votre navigateur ne peut pas lire cette vidéo.
      </video>
    `;

    const realVideo = document.getElementById("realVideo");

    realVideo.addEventListener("play", () => {
      playing = true;
      document.getElementById("playButton").textContent = "Pause";
      currentVideo.views += 1;
      document.getElementById("views").textContent = currentVideo.views;
    });

    realVideo.addEventListener("pause", () => {
      playing = false;
      document.getElementById("playButton").textContent = "Lecture";
    });

    realVideo.addEventListener("timeupdate", () => {
      if (!realVideo.duration) return;
      const percent = Math.round((realVideo.currentTime / realVideo.duration) * 100);
      currentVideo.progress = percent;
      currentVideo.percent = Math.max(currentVideo.percent, percent);
      document.getElementById("timeline").value = percent;
      document.getElementById("percent").textContent = currentVideo.percent + " %";
      const minutes = String(Math.floor(realVideo.currentTime / 60)).padStart(2, "0");
      const seconds = String(Math.floor(realVideo.currentTime % 60)).padStart(2, "0");
      currentVideo.last = `${minutes}:${seconds}`;
      document.getElementById("timeStart").textContent = currentVideo.last;
      document.getElementById("lastPosition").textContent = currentVideo.last;
    });

    document.getElementById("timeline").oninput = () => {
      if (!realVideo.duration) return;
      realVideo.currentTime = (Number(document.getElementById("timeline").value) / 100) * realVideo.duration;
    };
  } else {
    videoStage.innerHTML = `
      <div class="image-tint"></div>
      <button class="play-overlay" onclick="togglePlay()">▶</button>
    `;
  }
  playing = false;
  document.getElementById("playButton").textContent = "Lecture";
  showScreen("player");
}

function togglePlay(){
  const realVideo = document.getElementById("realVideo");

  if (realVideo) {
    if (realVideo.paused) {
      realVideo.play();
    } else {
      realVideo.pause();
    }
    return;
  }

  playing = !playing;
  document.getElementById("playButton").textContent = playing ? "Pause" : "Lecture";
  if(playing){
    currentVideo.views += 1;
    document.getElementById("views").textContent = currentVideo.views;
  }
}

function jump(seconds){
  const realVideo = document.getElementById("realVideo");
  if (realVideo) {
    realVideo.currentTime = Math.max(0, Math.min(realVideo.duration || 0, realVideo.currentTime + seconds));
    return;
  }

  const timeline = document.getElementById("timeline");
  timeline.value = Math.max(0, Math.min(100, Number(timeline.value) + seconds/3));
}

function restartVideo(){
  const realVideo = document.getElementById("realVideo");
  if (realVideo) {
    realVideo.currentTime = 0;
    realVideo.pause();
  }
  document.getElementById("timeline").value = 0;
  document.getElementById("timeStart").textContent = "00:00";
  document.getElementById("lastPosition").textContent = "00:00";
  currentVideo.last = "00:00";
  toast("Vidéo recommencée");
}

function markReview(){
  currentVideo.status = "À revoir";
  document.getElementById("status").textContent = "À revoir";
  toast("Technique marquée à revoir");
}

function markMastered(){
  currentVideo.status = "Maîtrisée";
  document.getElementById("status").textContent = "Maîtrisée";
  toast("Technique marquée maîtrisée");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById(tab.dataset.tab === "stats" ? "statsPanel" : tab.dataset.tab).classList.add("active");
  });
});

function renderQuiz(){
  const item = quiz[quizIndex];
  document.getElementById("quizQuestion").textContent = item.question;
  document.getElementById("feedback").textContent = "";
  document.getElementById("answers").innerHTML = item.answers.map((a,i)=>`
    <button class="answer" onclick="answerQuiz(${i})">${a}</button>
  `).join("");
}

function answerQuiz(index){
  const item = quiz[quizIndex];
  const buttons = document.querySelectorAll(".answer");
  buttons.forEach(b => b.classList.remove("correct","wrong"));
  buttons[item.correct].classList.add("correct");
  if(index !== item.correct) buttons[index].classList.add("wrong");
  document.getElementById("feedback").textContent = index === item.correct ? "Bonne réponse." : "À revoir : la bonne réponse est indiquée.";
}

function nextQuestion(){
  quizIndex = (quizIndex + 1) % quiz.length;
  renderQuiz();
}

function prevQuestion(){
  quizIndex = (quizIndex - 1 + quiz.length) % quiz.length;
  renderQuiz();
}

function toast(message){
  const t = document.getElementById("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>t.classList.remove("show"),2000);
}

renderVideos();
openVideo(1);
showScreen("home");
renderQuiz();

