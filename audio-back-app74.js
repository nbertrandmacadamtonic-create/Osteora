/* Ostéo Pratik APP74 — harmonisation de la flèche de retour audio. */
(function(){
  'use strict';
  if(window.OSTEO_AUDIO_BACK74)return;
  window.OSTEO_AUDIO_BACK74={version:'74.0'};
  const SVG='<svg data-op-icon56="back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14 5-7 7 7 7M7 12h13"/></svg>';
  function style(){
    if(document.getElementById('opAudioBackStyle74'))return;
    const s=document.createElement('style');s.id='opAudioBackStyle74';s.textContent=`
      #opWheelAudioOverlay .op-audio-close{
        display:grid!important;place-items:center!important;
        width:44px!important;height:44px!important;padding:0!important;
        border:0!important;border-radius:12px!important;
        background:transparent!important;color:#eaf8ff!important;
        box-shadow:none!important;font-size:0!important;
      }
      #opWheelAudioOverlay .op-audio-close svg{
        display:block;width:25px;height:25px;pointer-events:none;
      }
      #opWheelAudioOverlay .op-audio-close:hover,
      #opWheelAudioOverlay .op-audio-close:focus-visible{
        background:#122b43!important;
        outline:2px solid #42d9ed!important;
        outline-offset:-2px!important;
      }
    `;document.head.appendChild(s);
  }
  function apply(root=document){
    style();
    const button=root.querySelector?.('#opWheelAudioOverlay .op-audio-close');
    if(!button||button.dataset.opAudioBack74==='1')return false;
    button.dataset.opAudioBack74='1';
    button.innerHTML=SVG;
    button.setAttribute('aria-label','Retour à la page précédente');
    button.setAttribute('title','Retour');
    return true;
  }
  apply();
  const observer=new MutationObserver(records=>{
    for(const record of records)for(const added of record.addedNodes){
      if(added.nodeType!==1)continue;
      if(apply(added)||apply())return;
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',apply,{once:true});
})();
