const techniques=[
{id:1,title:"Dysfonction cervicale C2–C6 assis",sub:"Cervicales",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"▷"},
{id:2,title:"Technique de rotation cervicale assise",sub:"Cervicales",level:"Niveau intermédiaire",status:"vue",percent:100,icon:"↻"},
{id:3,title:"Technique de flexion cervicale",sub:"Cervicales",level:"Niveau débutant",status:"à revoir",percent:0,icon:"↓"},
{id:4,title:"Technique de l’élévateur de la scapula",sub:"Cervicales",level:"Niveau intermédiaire",status:"en cours",percent:60,icon:"♙"},
{id:5,title:"Relâchement des muscles sous-occipitaux",sub:"Cervicales",level:"Niveau débutant",status:"non vue",percent:0,icon:"◌"},
{id:6,title:"Technique de glissement cervical latéral",sub:"Cervicales",level:"Niveau avancé",status:"en cours",percent:30,icon:"▥"},
{id:7,title:"Technique dorsale à genoux",sub:"Dorsales",level:"Niveau intermédiaire",status:"vue",percent:80,icon:"▷"},
{id:8,title:"Technique lombaire en décubitus",sub:"Lombaires",level:"Niveau avancé",status:"à revoir",percent:45,icon:"▷"}
];
let currentSubzone="Cervicales";let currentBack="rachis";
function go(id){document.querySelectorAll(".screen").forEach(s=>{s.classList.toggle("active",s.id===id);if(s.id===id)s.scrollTop=0});document.querySelectorAll(".bottom button").forEach(b=>{const t=b.dataset.target;const a=t===id||(t==="zones"&&["zones","rachis","techniques","player"].includes(id))||(t==="revision"&&["revision","revisionCard"].includes(id))||(t==="home"&&["quiz","progress"].includes(id));b.classList.toggle("active",a)})}
function toast(m){const e=document.getElementById("toast");e.textContent=m;e.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>e.classList.remove("show"),1500)}
function openSubzone(s){currentSubzone=s;currentBack="rachis";document.getElementById("techTitle").textContent=s;renderTechniques();go("techniques")}
function openZone(z){currentSubzone=z;currentBack="zones";document.getElementById("techTitle").textContent=z;renderTechniques();go("techniques")}
function renderTechniques(){const q=(document.getElementById("searchInput")?.value||"").toLowerCase();let items=techniques.filter(t=>t.sub===currentSubzone&&t.title.toLowerCase().includes(q));if(currentSubzone==="Membres supérieurs"){items=[{id:9,title:"Correction de l’épaule en énergie musculaire",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"▷"},{id:10,title:"Technique du coude en énergie musculaire",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"↻"}]}if(currentSubzone==="Membres inférieurs"){items=[{id:11,title:"Technique du genou en chaîne fermée",level:"Niveau intermédiaire",status:"non vue",percent:0,icon:"▷"},{id:12,title:"Technique de cheville en énergie musculaire",level:"Niveau débutant",status:"non vue",percent:0,icon:"↻"}]}const list=document.getElementById("techList");if(!list)return;list.innerHTML=items.map((t,i)=>`<button class="tech ${i===0?"featured":""}" onclick="openTechnique(${t.id})"><div class="tech-icon">${t.icon}</div><div><h3>${t.title}</h3><small>${t.level}</small></div><div class="state">${stateLabel(t)}</div></button>`).join("")}
function stateLabel(t){if(t.status==="vue")return `<span class="seen">vue ✓</span>`;if(t.status==="à revoir")return `<span class="review">à revoir !</span>`;if(t.percent)return `<b>${t.percent}%</b>`;return `<span>non vue ○</span>`}
function openTechnique(id){const t=techniques.find(x=>x.id===id)||techniques[0];document.getElementById("playerTitle").textContent=t.title;go("player")}
function toggleVideo(){const v=document.getElementById("video");if(!v)return;if(v.paused){v.play().catch(()=>toast("Ajoutez la vidéo dans assets/videos"))}else{v.pause()}}
function jump(s){const v=document.getElementById("video");if(v&&v.duration){v.currentTime=Math.max(0,Math.min(v.duration,v.currentTime+s))}}
function tab(id,btn){document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));document.getElementById(id).classList.add("active");btn.classList.add("active")}
renderTechniques();
