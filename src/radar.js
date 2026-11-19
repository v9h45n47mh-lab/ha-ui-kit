import {escapeHtml, iconButton} from './components.js';

/** Provider-neutral image radar. The host supplies images, times and playback state. */
export function radarMap({id='radar',frames=[],index=0,baseImage='',radarImage='',legendImage='',playing=false,busy=false,error='',timezone='Europe/Berlin',now=Date.now()/1000,zoom=1}={}) {
  const e=escapeHtml, count=frames.length, selected=Math.max(0,Math.min(count-1,Math.round(index))), frame=frames[selected];
  const time=t=>Number.isFinite(t)?new Intl.DateTimeFormat('de-DE',{timeZone:timezone,hour:'2-digit',minute:'2-digit'}).format(new Date(t*1000)):'—';
  const image=(src,alt,cls)=>{const safe=src&&/^(data:image\/png;base64,|\/(?!\/)|https:\/\/)/.test(src);return `<img class="${cls}" ${safe?`src="${e(src)}"`:'hidden'} alt="${e(alt)}" draggable="false">`;};
  const control=(icon,label,action,disabled=false)=>iconButton({icon,label,action,disabled});
  return `<section class="fui-radar" id="${e(id)}" aria-label="Regenradar">
    <div class="fui-radar-map" aria-busy="${busy}">
      ${image(baseImage,'Kartengrundlage','fui-radar-base')}${image(radarImage,'Niederschlagsradar '+time(frame?.time),'fui-radar-overlay')}
      <span class="fui-radar-marker" role="img" aria-label="Dein Standort"></span>
      <div class="fui-radar-message" role="status" ${!radarImage||error?'':'hidden'}>${e(error||'Radarbild wird geladen …')}</div>
      <div class="fui-radar-zoom">${control('add','Vergrößern','radar-zoom-in',zoom>=3)}${control('minus','Verkleinern','radar-zoom-out',zoom<=0)}</div>
    </div>
    <div class="fui-radar-controls">
      <div class="toolbar">${control('left','Vorheriges Radarbild','radar-previous',!count||selected===0)}${control(playing?'media-pause':'media-play',playing?'Radar anhalten':'Radar abspielen','radar-play',!count)}${control('right','Nächstes Radarbild','radar-next',!count||selected===count-1)}${control('schedule','Zum aktuellen Radarbild','radar-now',!count)}</div>
      <output class="fui-radar-time" for="${e(id)}-time"><strong>${time(frame?.time)} Uhr</strong> · <span class="${frame?.kind==='observation'?'is-observation':'is-prediction'}">${frame?.kind==='observation'?'Messung':'Vorhersage'}</span>${busy?' · lädt …':''}</output>
    </div>
    <label class="fui-radar-slider" for="${e(id)}-time"><span>Radarzeitpunkt</span><input id="${e(id)}-time" type="range" min="0" max="${Math.max(0,count-1)}" step="1" value="${selected}" aria-valuetext="${time(frame?.time)} Uhr · ${frame?.kind==='observation'?'Messung':'Vorhersage'}" ${count?'':'disabled'}></label>
    <div class="fui-radar-ticks" aria-hidden="true"><span>−2 Std.<small>${time(now-7200)}</small></span><span>−1 Std.<small>${time(now-3600)}</small></span><span>Jetzt<small>${time(now)}</small></span><span>+1 Std.<small>${time(now+3600)}</small></span></div>
    <p class="hint">2 Stunden Rückblick · 1 Stunde Vorhersage · 5-Minuten-Schritte</p>
    <details class="fui-radar-legend" ${legendImage?'':'hidden'}><summary>Niederschlag in mm/h · DWD-Farbskala</summary>${image(legendImage,'DWD-Legende der Niederschlagsintensität in Millimeter pro Stunde','fui-radar-scale')}</details>
  </section>`;
}

/** Patch controlled state without replacing the slider, focus or pointer capture. */
export function updateRadarMap(root,options) {
  const template=root.ownerDocument.createElement('template');template.innerHTML=radarMap(options);
  const next=template.content.firstElementChild;
  for(const cls of ['fui-radar-base','fui-radar-overlay','fui-radar-scale']) {
    const old=root.querySelector('.'+cls),fresh=next.querySelector('.'+cls);
    for(const name of ['src','alt','hidden'])if(old.getAttribute(name)!==fresh.getAttribute(name)) {
      if(fresh.hasAttribute(name))old.setAttribute(name,fresh.getAttribute(name));else old.removeAttribute(name);
    }
  }
  root.querySelector('.fui-radar-map').setAttribute('aria-busy',String(!!options.busy));
  for(const selector of ['.fui-radar-time','.fui-radar-message','.fui-radar-ticks']) {
    const old=root.querySelector(selector),fresh=next.querySelector(selector);old.innerHTML=fresh.innerHTML;old.hidden=fresh.hidden;
  }
  const input=root.querySelector('input'),freshInput=next.querySelector('input');
  input.value=freshInput.value;input.max=freshInput.max;input.disabled=freshInput.disabled;input.setAttribute('aria-valuetext',freshInput.getAttribute('aria-valuetext'));
  for(const old of root.querySelectorAll('button[data-action]')) {
    const fresh=next.querySelector('[data-action="'+old.dataset.action+'"]');if(!fresh)continue;
    old.disabled=fresh.disabled;old.title=fresh.title;old.setAttribute('aria-label',fresh.getAttribute('aria-label'));
    if(old.innerHTML!==fresh.innerHTML)old.innerHTML=fresh.innerHTML;
  }
  root.querySelector('.fui-radar-legend').hidden=!options.legendImage;
}
