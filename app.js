// OSTÉO RA — V10 stable mobile — patch anatomique
// Fichier app.js uniquement.
// index.html et styles.css restent inchangés.

const techniques = [
  // RACHIS — CERVICALES
  {
    id: 1,
    title: "Dysfonction cervicale C2–C6 assis",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "▷"
  },
  {
    id: 2,
    title: "Technique de rotation cervicale assise",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "vue",
    percent: 100,
    icon: "↻"
  },
  {
    id: 3,
    title: "Technique de flexion cervicale",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau débutant",
    status: "à revoir",
    percent: 0,
    icon: "↓"
  },
  {
    id: 4,
    title: "Technique de l’élévateur de la scapula",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "en cours",
    percent: 60,
    icon: "♙"
  },
  {
    id: 5,
    title: "Relâchement des muscles sous-occipitaux",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 6,
    title: "Technique de glissement cervical latéral",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "en cours",
    percent: 30,
    icon: "▥"
  },

  // RACHIS — DORSALES
  {
    id: 7,
    title: "Technique dorsale à genoux",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "vue",
    percent: 80,
    icon: "▷"
  },

  // RACHIS — LOMBAIRES
  {
    id: 8,
    title: "Technique lombaire en décubitus",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau avancé",
    status: "à revoir",
    percent: 45,
    icon: "▷"
  },

  // MEMBRES SUPÉRIEURS
  {
    id: 9,
    title: "Correction de l’épaule en énergie musculaire",
    zone: "Membres supérieurs",
    sub: "Épaule",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↻"
  },
  {
    id: 10,
    title: "Technique du coude en énergie musculaire",
    zone: "Membres supérieurs",
    sub: "Coude",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↻"
  },
  {
    id: 11,
    title: "Mobilisation structurelle du poignet",
    zone: "Membres supérieurs",
    sub: "Poignet",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "▧"
  },
  {
    id: 12,
    title: "Technique de la main en énergie musculaire",
    zone: "Membres supérieurs",
    sub: "Main",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "✋"
  },

  // MEMBRES INFÉRIEURS
  {
    id: 13,
    title: "Technique du genou en chaîne fermée",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 14,
    title: "Technique de cheville en énergie musculaire",
    zone: "Membres inférieurs",
    sub: "Cheville",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 15,
    title: "Technique du pied en énergie musculaire",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "◟"
  }
];

const memberSubzones = {
  "Membres supérieurs": [
    { label: "Épaule", icon: "◜", detail: "Techniques de l’épaule" },
    { label: "Coude", icon: "◌", detail: "Techniques du coude" },
    { label: "Poignet", icon: "▧", detail: "Techniques du poignet" },
    { label: "Main", icon: "✋", detail: "Techniques de la main" }
  ],
  "Membres inférieurs": [
    { label: "Genou", icon: "◉", detail: "Techniques du genou" },
    { label: "Cheville", icon: "◌", detail: "Techniques de la cheville" },
    { label: "Pied", icon: "◟", detail: "Techniques du pied" }
  ]
};

let currentZone = "Rachis";
let currentSubzone = "Cervicales";
let currentBack = "rachis";

function go(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === id);
    if (screen.id === id) screen.scrollTop = 0;
  });

  document.querySelectorAll(".bottom button").forEach(button => {
    const target = button.dataset.target;
    const active =
      target === id ||
      (target === "zones" && ["zones", "rachis", "techniques", "player"].includes(id)) ||
      (target === "revision" && ["revision", "revisionCard"].includes(id)) ||
      (target === "home" && ["quiz", "progress"].includes(id));

    button.classList.toggle("active", active);
  });
}

function toast(message) {
  const element = document.getElementById("toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 1500);
}

function openSubzone(subzone) {
  currentZone = "Rachis";
  currentSubzone = subzone;
  currentBack = "rachis";

  const title = document.getElementById("techTitle");
  if (title) title.textContent = subzone;

  renderTechniques();
  go("techniques");
}

function openZone(zone) {
  currentZone = zone;
  currentSubzone = zone;
  currentBack = "zones";

  const title = document.getElementById("techTitle");
  if (title) title.textContent = zone;

  renderTechniques();
  go("techniques");
}

function openMemberSubzone(zone, subzone) {
  currentZone = zone;
  currentSubzone = subzone;
  currentBack = "techniques";

  const title = document.getElementById("techTitle");
  if (title) title.textContent = subzone;

  renderTechniques();
}

function renderTechniques() {
  const list = document.getElementById("techList");
  if (!list) return;

  const query = (document.getElementById("searchInput")?.value || "").toLowerCase();

  if (memberSubzones[currentSubzone]) {
    list.innerHTML = memberSubzones[currentSubzone].map(item => `
      <button class="row tech featured" onclick="openMemberSubzone('${currentSubzone}', '${item.label}')">
        <div class="tech-icon">${item.icon}</div>
        <div>
          <h3>${item.label}</h3>
          <small>${item.detail}</small>
        </div>
        <div class="state"><span>ouvrir ›</span></div>
      </button>
    `).join("");
    return;
  }

  const items = techniques.filter(technique => {
    return technique.sub === currentSubzone &&
      technique.title.toLowerCase().includes(query);
  });

  if (items.length === 0) {
    list.innerHTML = `
      <article class="empty">
        <h3>Aucune technique pour l’instant</h3>
        <p>Les vidéos seront ajoutées progressivement dans cette sous-zone.</p>
      </article>
    `;
    return;
  }

  list.innerHTML = items.map((technique, index) => `
    <button class="row tech ${index === 0 ? "featured" : ""}" onclick="openTechnique(${technique.id})">
      <div class="tech-icon">${technique.icon}</div>
      <div>
        <h3>${technique.title}</h3>
        <small>${technique.level}</small>
      </div>
      <div class="state">${stateLabel(technique)}</div>
    </button>
  `).join("");
}

function stateLabel(technique) {
  if (technique.status === "vue") return `<span class="seen">vue ✓</span>`;
  if (technique.status === "à revoir") return `<span class="review">à revoir !</span>`;
  if (technique.percent) return `<b>${technique.percent}%</b>`;

  return `<span>non vue ○</span>`;
}

function openTechnique(id) {
  const technique = techniques.find(item => item.id === id) || techniques[0];

  const title = document.getElementById("playerTitle");
  if (title) title.textContent = technique.title;

  go("player");
}

function toggleVideo() {
  const video = document.getElementById("video");
  if (!video) return;

  if (video.paused) {
    video.play().catch(() => toast("Ajoutez la vidéo dans assets/videos"));
  } else {
    video.pause();
  }
}

function jump(seconds) {
  const video = document.getElementById("video");
  if (video && video.duration) {
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }
}

renderTechniques();
