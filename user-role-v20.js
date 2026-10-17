/* OSTÉO PRATIK V20.4 — 5 RÔLES */
(function(){
'use strict';
const ALLOWED=new Set(['student','professional','teacher','other','admin']);
const LABELS={student:'Étudiant',professional:'Professionnel',teacher:'Enseignant',other:'Autre',admin:'Administrateur',anonymous:'Non connecté'};
let client=null,session=null,role='anonymous',serial=0;
const normalize=v=>{const x=String(v||'student').toLowerCase();return ALLOWED.has(x)?x:'student';};
function dispatch(){const detail={role,roleLabel:LABELS[role]||LABELS.student,isAdmin:role==='admin',isStudent:role==='student',isProfessional:role==='professional',isTeacher:role==='teacher',isOther:role==='other',userId:session?.user?.id||null};try{document.documentElement.dataset.osteoRole=role;}catch(_){}window.dispatchEvent(new CustomEvent('osteo-role-loaded',{detail}));}
async function wait(){for(let i=0;i<120;i++){client=window.OSTEO_APP_AUTH_CLIENT||client;if(client)return client;await new Promise(r=>setTimeout(r,50));}return null;}
async function loadRole(){const run=++serial;client=window.OSTEO_APP_AUTH_CLIENT||client;if(!client){client=await wait();if(!client){role='anonymous';session=null;dispatch();return role;}}try{const {data:{session:s}}=await client.auth.getSession();if(run!==serial)return role;session=s||null;if(!session?.user?.id){role='anonymous';dispatch();return role;}const {data,error}=await client.rpc('osteo_get_my_role');if(error)throw error;if(run!==serial)return role;role=normalize(data);dispatch();return role;}catch(e){console.warn('[V20.4] rôle indisponible',e);role=session?.user?.id?'student':'anonymous';dispatch();return role;}}
async function install(){client=await wait();if(!client){role='anonymous';dispatch();return;}client.auth.onAuthStateChange((_e,s)=>{session=s||null;if(!session){++serial;role='anonymous';dispatch();return;}setTimeout(loadRole,0);});await loadRole();}
window.OSTEO_USER_ROLE_V20={version:'20.4',reload:loadRole,getRole:()=>role,getRoleLabel:()=>LABELS[role]||LABELS.student,isAdmin:()=>role==='admin',isStudent:()=>role==='student',isProfessional:()=>role==='professional',isTeacher:()=>role==='teacher',isOther:()=>role==='other'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
