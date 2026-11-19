import {escapeHtml, iconButton,filterButton} from './components.js';

/** Provider-neutral image radar. The host supplies images, times and playback state. */
export function radarMap({id='radar',frames=[],index=0,baseImage='',radarImage='',legendImage='',playing=false,busy=false,error='',timezone='Europe/Berlin',now=Date.now()/1000,zoom=1,markerLabel='Dein Standort',horizon=1,horizonChoices=false}={}) {
  const e=escapeHtml, count=frames.length, selected=Math.max(0,Math.min(count-1,Math.round(index))), frame=frames[selected];
  const time=t=>Number.isFinite(t)?new Intl.DateTimeFormat('de-DE',{timeZone:timezone,hour:'2-digit',minute:'2-digit'}).format(new Date(t*1000)):'—';
  const image=(src,alt,cls)=>{const safe=src&&/^(data:image\/(?:png|svg\+xml);base64,|\/(?!\/)|https:\/\/)/.test(src);return `<img class="${cls}" ${safe?`src="${e(src)}"`:'hidden'} alt="${e(alt)}" draggable="false">`;};
  const control=(icon,label,action,disabled=false)=>iconButton({icon,label,action,disabled});
  const source=frame?.kind==='observation'?'Messung':frame?.kind==='model'?'Modellvorhersage':'Vorhersage';
  horizon=horizon===12?12:1;
  const marks=horizon===12?[[-7200,'−2 Std.'],[0,'Jetzt'],[3600,'+1 Std.'],[21600,'+6 Std.'],[43200,'+12 Std.']]:[[-7200,'−2 Std.'],[-3600,'−1 Std.'],[0,'Jetzt'],[3600,'+1 Std.']];
  const ticks=marks.map(([offset,label],i)=>{const stamp=now+offset;let fraction=horizon===12?(offset<=3600?(offset+7200)/300:36+(offset-3600)/1800)/58:(offset+7200)/(7200+3600);if(count>1){const nearest=frames.reduce((best,item,index)=>Math.abs(item.time-stamp)<Math.abs(frames[best].time-stamp)?index:best,0);fraction=nearest/(count-1);}return `<span class="${i===0?'is-first':i===marks.length-1?'is-last':''}" style="left:${Math.max(0,Math.min(100,fraction*100))}%">${e(label)}<small>${time(stamp)}</small></span>`;}).join('');
  return `<section class="fui-radar" id="${e(id)}" aria-label="Regenradar">
    ${horizonChoices?`<div class="toolbar fui-radar-horizon" role="group" aria-label="Vorschauzeitraum">${[1,12].map(hours=>filterButton({label:hours+' Std.',action:'radar-horizon',selected:hours===horizon,data:{hours}})).join('')}</div>`:''}
    <div class="fui-radar-map" aria-busy="${busy}">
      ${image(baseImage,'Kartengrundlage','fui-radar-base')}${image(radarImage,'Niederschlagsradar '+time(frame?.time),'fui-radar-overlay')}
      <span class="fui-radar-marker" role="img" aria-label="${e(markerLabel)}" title="${e(markerLabel)}"></span>
      <div class="fui-radar-message" role="status" ${!radarImage||error?'':'hidden'}>${e(error||'Radarbild wird geladen …')}</div>
      <div class="fui-radar-zoom">${control('add','Vergrößern','radar-zoom-in',zoom>=3)}${control('minus','Verkleinern','radar-zoom-out',zoom<=0)}</div>
    </div>
    <div class="fui-radar-controls">
      <div class="toolbar">${control('left','Vorheriges Radarbild','radar-previous',!count||selected===0)}${control(playing?'media-pause':'media-play',playing?'Radar anhalten':'Radar abspielen','radar-play',!count)}${control('right','Nächstes Radarbild','radar-next',!count||selected===count-1)}${control('schedule','Zum aktuellen Radarbild','radar-now',!count)}</div>
      <output class="fui-radar-time" for="${e(id)}-time">${frame?`<strong>${time(frame.time)} Uhr</strong> · <span class="${frame.kind==='observation'?'is-observation':'is-prediction'}">${source}</span>${busy?' · lädt …':''}`:`<strong>${error?'Keine Radardaten':'Radardaten laden …'}</strong>`}</output>
    </div>
    <label class="fui-radar-slider" for="${e(id)}-time"><span>Radarzeitpunkt</span><input id="${e(id)}-time" type="range" min="0" max="${Math.max(0,count-1)}" step="1" value="${selected}" aria-valuetext="${time(frame?.time)} Uhr · ${frame?source:'Radardaten laden'}" ${count?'':'disabled'}></label>
    <div class="fui-radar-ticks" aria-hidden="true">${ticks}</div>
    <p class="hint fui-radar-resolution">2 Stunden Rückblick · ${horizon===12?'12 Stunden Vorhersage · erste Stunde: 5-Minuten-Schritte · danach: 30-Minuten-Schritte':'1 Stunde Vorhersage · 5-Minuten-Schritte'}</p>
    <details class="fui-radar-legend" ${legendImage?'':'hidden'}><summary>Niederschlag in mm/h · Farbskala</summary>${image(legendImage,'Legende der Niederschlagsintensität in Millimeter pro Stunde','fui-radar-scale')}</details>
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
  for(const selector of ['.fui-radar-time','.fui-radar-message','.fui-radar-ticks','.fui-radar-resolution']) {
    const old=root.querySelector(selector),fresh=next.querySelector(selector);old.innerHTML=fresh.innerHTML;old.hidden=fresh.hidden;
  }
  const input=root.querySelector('input'),freshInput=next.querySelector('input');
  input.value=freshInput.value;input.max=freshInput.max;input.disabled=freshInput.disabled;input.setAttribute('aria-valuetext',freshInput.getAttribute('aria-valuetext'));
  for(const old of root.querySelectorAll('button[data-action]')) {
    const fresh=next.querySelector('[data-action="'+old.dataset.action+'"]'+(old.dataset.hours?'[data-hours="'+old.dataset.hours+'"]':''));if(!fresh)continue;
    old.disabled=fresh.disabled;
    for(const name of ['title','aria-label','aria-pressed']){if(fresh.hasAttribute(name))old.setAttribute(name,fresh.getAttribute(name));else old.removeAttribute(name);}
    if(old.innerHTML!==fresh.innerHTML)old.innerHTML=fresh.innerHTML;
  }
  root.querySelector('.fui-radar-legend').hidden=!options.legendImage;
}

/** Two fingers zoom the map about its centred location. One finger keeps page scrolling. */
export function bindRadarGestures(root,onZoom,onActive=()=>{}) {
  const map=root.matches?.('.fui-radar-map')?root:root.querySelector('.fui-radar-map');
  if(!map)return ()=>{};
  let start=0,ratio=1,active=false;
  const distance=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
  const preview=scale=>{for(const image of map.querySelectorAll('.fui-radar-base,.fui-radar-overlay'))image.style.transform=scale===1?'':`scale(${Math.max(.5,Math.min(2,scale))})`;};
  const finish=(commit=false)=>{if(!active)return;const value=ratio;active=false;start=0;ratio=1;preview(1);onActive(false);if(commit&&(value>=1.2||value<=1/1.2)){const delta=Math.log2(value);onZoom(Math.sign(delta)*Math.max(1,Math.min(3,Math.round(Math.abs(delta)))));}};
  const begin=event=>{if(event.touches.length!==2){if(active)finish();return;}event.preventDefault();if(!active){start=distance(event.touches);if(start<1)return;ratio=1;active=true;onActive(true);}};
  const move=event=>{if(!active)return;if(event.touches.length!==2){finish();return;}event.preventDefault();ratio=distance(event.touches)/start;preview(ratio);};
  const end=event=>{if(active){event.preventDefault();if(event.touches.length<2)finish(true);}};
  const cancel=()=>finish(false);
  for(const [name,handler] of [['touchstart',begin],['touchmove',move],['touchend',end],['touchcancel',cancel]])map.addEventListener(name,handler,{passive:false});
  return ()=>{finish(false);for(const [name,handler] of [['touchstart',begin],['touchmove',move],['touchend',end],['touchcancel',cancel]])map.removeEventListener(name,handler);};
}

function radarSvgImage(svg){return 'data:image/svg+xml;base64,'+btoa(Array.from(new TextEncoder().encode(svg),byte=>String.fromCharCode(byte)).join(''));}
/** Local vector backdrop: at most four city labels, rivers and country borders only. */
export function radarBackground({lines=[],places=[]}={}) {
  const number=value=>{if(typeof value!=='number'||!Number.isFinite(value))throw new TypeError('Invalid map coordinate');return Math.round(value*10)/10;};
  const paths=lines.map(line=>{if(!['river','border'].includes(line.kind))throw new TypeError('Invalid map line');return `<path d="${line.points.map((p,i)=>(i?'L':'M')+number(p[0])+','+number(p[1])).join(' ')}" fill="none" stroke="${line.kind==='river'?'#bdd5e4':'#dce2e7'}" stroke-width="${line.kind==='river'?2:1.2}"/>`;}).join('');
  const labels=places.slice(0,4).map(place=>`<circle cx="${number(place.x)}" cy="${number(place.y)}" r="2" fill="#7b8790"/><text x="${number(place.x)+5}" y="${number(place.y)-5}" font-family="sans-serif" font-size="13" fill="#65747e">${escapeHtml(place.name)}</text>`).join('');
  return radarSvgImage(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#ffffff"/>${paths}${labels}</svg>`);
}
/** Same scale as the host's renderer; this graphic never needs a network fetch. */
export function radarLegend(){
  const entries=RADAR_SCALE.map((item,i)=>`<rect x="4" y="${8+i*24}" width="26" height="18" rx="2" fill="${item.color}"/><text x="40" y="${22+i*24}" font-family="sans-serif" font-size="13" fill="#34444e">${escapeHtml(item.label)} mm/h</text>`).join('');
  return radarSvgImage(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="254"><rect width="240" height="254" fill="white"/>${entries}<text x="4" y="246" font-family="sans-serif" font-size="12" fill="#65747e">Schraffiert: keine Radardaten</text></svg>`);
}
