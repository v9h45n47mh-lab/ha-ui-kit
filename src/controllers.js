import {rgbToHSV,hsvToRGB,feedback,photoPreview,parseMonthDay} from './objects.js';

export function recurrenceSummary(rule) {
  if(rule.kind==='once')return 'Einmalig';
  const n=rule.interval||1,days=['Mo','Di','Mi','Do','Fr','Sa','So'];
  if(rule.kind==='daily')return n===1?'Täglich':`Alle ${n} Tage`;
  if(rule.kind==='weekly')return (n===1?'Jede Woche':`Alle ${n} Wochen`)+' · '+(rule.weekdays||[]).map(i=>days[i]).join(', ');
  if(rule.kind==='yearly')return (n===1?'Jährlich':`Alle ${n} Jahre`)+' · '+(rule.start||'').slice(5);
  const prefix=n===1?'Monatlich':`Alle ${n} Monate`;
  return rule.kind==='monthly_date'?prefix+' · am '+Number((rule.start||'').slice(8))+'. Tag':prefix+' · '+(rule.nth===-1?'Letzter':rule.nth+'.')+' '+(rule.weekdays||[]).map(i=>days[i]).join(', ');
}

export async function readJSONFile(file,{maxBytes=2*1024*1024}={}) {
  if(!file||typeof file.text!=='function')throw new TypeError('Bitte eine Sicherungsdatei auswählen.');
  if(file.size>maxBytes)throw new Error('Datei zu groß.');
  try{return JSON.parse(await file.text());}catch{throw new Error('Die Datei enthält kein gültiges JSON.');}
}
export function downloadJSON(value,{filename='sicherung.json',document:doc=globalThis.document}={}) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=doc.createElement('a');
  a.href=url;a.download=filename;doc.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
}
export async function compressPhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Bitte ein JPG-, PNG- oder WebP-Foto wählen.');
  if(file.size>20*1024*1024)throw new Error('Bitte ein Foto bis 20 MB wählen.');
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Das Foto konnte nicht gelesen werden.'));img.src=url;});
    if(!img.naturalWidth||!img.naturalHeight)throw new Error('Das Foto hat keine gültige Größe.');
    const factor=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*factor));canvas.height=Math.max(1,Math.round(img.naturalHeight*factor));
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Bildverarbeitung nicht verfügbar.');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    for(const quality of [.85,.7,.55,.4]){const data=canvas.toDataURL('image/jpeg',quality);if(data.length<950000)return data;}
    throw new Error('Das Foto ist zu groß. Bitte ein kleineres Bild wählen.');
  }finally{URL.revokeObjectURL(url);}
}

/** UI event delegation only: no network, HA services, persistence or business decisions. */
export function bindObjects(root,onAction) {
  let disposed=false;const initialized=new WeakSet(),photoTokens=new WeakMap();
  const emit=(control,event,value,extra={})=>{if(!disposed&&control.dataset.controlAction)onAction({action:control.dataset.controlAction,data:{...control.dataset},value,element:control,originalEvent:event,...extra});};
  const closeCombo=box=>{box.querySelector('[role=listbox]').hidden=true;const input=box.querySelector('input');input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');box.querySelectorAll('.active').forEach(el=>el.classList.remove('active'));};
  const options=box=>[...box.querySelectorAll('[data-ui-option]')].filter(el=>!el.hidden&&!el.disabled);
  const filterCombo=box=>{
    const input=box.querySelector('input'),q=input.value.trim().toLocaleLowerCase();
    box.querySelectorAll('[data-ui-option]').forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase().includes(q);el.classList.remove('active');});
    box.querySelector('.fui-options-empty').hidden=Boolean(options(box).length);
    input.removeAttribute('aria-activedescendant');
  };
  const openCombo=box=>{if(box.querySelector('input').disabled)return;filterCombo(box);box.querySelector('[role=listbox]').hidden=false;box.querySelector('input').setAttribute('aria-expanded','true');};
  const choose=(box,option,event)=>{
    if(option.disabled)return;const input=box.querySelector('input');input.value=option.dataset.label;box.dataset.selected=option.dataset.value;
    box.querySelectorAll('[data-ui-option]').forEach(el=>el.setAttribute('aria-selected',String(el===option)));
    input.focus();closeCombo(box);emit(box,event,option.dataset.value,{label:option.dataset.label});
  };
  const updateMulti=control=>{
    const q=(control.querySelector('input[type=search]')?.value||'').trim().toLocaleLowerCase();
    for(const group of control.querySelectorAll('[data-selection-group]')){
      let rows=[...group.querySelectorAll('[data-selection-row]')];
      rows.forEach(el=>el.hidden=!el.dataset.search.includes(q));
      if(control.dataset.selectedFirst==='true'){rows.sort((a,b)=>Number(b.querySelector('input').checked)-Number(a.querySelector('input').checked));rows.forEach(el=>group.append(el));}
      group.hidden=rows.every(el=>el.hidden);
    }
    control.querySelector('.fui-selection-empty').hidden=Boolean(control.querySelector('[data-selection-row]:not([hidden])'));
    control.querySelector('[data-selection-count]').textContent=control.querySelectorAll('input[type=checkbox]:checked').length+' ausgewählt';
  };
  const selection=control=>[...control.querySelectorAll('input[type=checkbox]:checked')].map(el=>control.dataset.valueType==='number'?Number(el.value):el.value);
  const updateRange=control=>{
    const input=control.querySelector('input'),keep=control.dataset.keep==='true',n=control.dataset.reverse==='true'?Number(input.max)+Number(input.min)-Number(input.value):Number(input.value),text=keep?control.dataset.keepLabel:n+(control.dataset.unit?' '+control.dataset.unit:'');
    control.querySelector('output').textContent=text;input.setAttribute('aria-valuetext',text);input.style.setProperty('--range-percent',((input.value-input.min)/(input.max-input.min)*100)+'%');
    const button=control.querySelector('[data-ui-keep]');button?.classList.toggle('selected',keep);button?.setAttribute('aria-pressed',String(keep));return keep?null:n;
  };
  const updateRecurrence=control=>{
    const get=name=>control.querySelector(`[name="${name}"]`),repeating=get('repeating'),alternate=get('alternating'),globalDisabled=control.hasAttribute('disabled');
    if(alternate?.checked)repeating.checked=true;
    const unit=get('unit').value,kind=!repeating.checked?'once':unit==='day'?'daily':unit==='year'?'yearly':unit==='month'?(get('month_mode').value==='nth'?'monthly_nth':'monthly_date'):'weekly';
    const start=get('start').value,end=get('end');end.min=start;end.closest('label').hidden=!repeating.checked;end.disabled=globalDisabled||!repeating.checked;
    control.querySelector('.recurrence-controls').hidden=!repeating.checked;
    control.querySelector('[data-month-mode]').hidden=unit!=='month';control.querySelector('[data-nth]').hidden=kind!=='monthly_nth';
    const days=control.querySelector('[data-ui-checks]');days.hidden=!['weekly','monthly_nth'].includes(kind);
    const first=control.querySelector('[data-first-person]');if(first)first.hidden=!alternate?.checked;
    control.querySelectorAll('.recurrence-controls input,.recurrence-controls select').forEach(el=>{el.disabled=globalDisabled||!repeating.checked||Boolean(el.closest('[hidden]'));});
    const rule={kind,interval:kind==='once'?1:Number(get('interval').value),start,end:kind==='once'?'':end.value,weekdays:[...days.querySelectorAll('input:checked')].map(el=>Number(el.value)),nth:Number(get('nth').value),alternating:Boolean(alternate?.checked),first_person:get('first_person')?.value||''};
    const dayRequired=['weekly','monthly_nth'].includes(kind);const dayInput=days.querySelector('input');dayInput?.setCustomValidity(dayRequired&&!rule.weekdays.length?'Bitte mindestens einen Wochentag auswählen.':'');
    const valid=Boolean(start)&&Number.isInteger(rule.interval)&&rule.interval>=1&&rule.interval<=365&&(!rule.end||rule.end>=start)&&(!dayRequired||rule.weekdays.length>0);
    let text=valid?recurrenceSummary(rule):'Bitte Datum, Wiederholungsabstand und Wochentage prüfen.';
    if(rule.alternating)text+=' · Abwechselnd, Beginn: '+rule.first_person;
    if(kind==='monthly_date'&&Number(start.slice(8))>28)text+=' · Monate ohne diesen Tag werden übersprungen.';
    if(kind==='yearly'&&start.slice(5)==='02-29')text+=' · Jahre ohne den 29. Februar werden übersprungen.';
    control.querySelector('.recurrence-hint').textContent=text;return {rule,valid};
  };
  const init=()=>{
    for(const el of root.querySelectorAll('[data-ui-multi],[data-ui-recurrence],[data-ui-range]')){
      if(initialized.has(el))continue;initialized.add(el);
      if(el.hasAttribute('data-ui-multi'))updateMulti(el);
      if(el.hasAttribute('data-ui-recurrence'))updateRecurrence(el);
      if(el.hasAttribute('data-ui-range'))updateRange(el);
    }
  };
  const click=event=>{
    const target=event.target.closest?.('button'),combo=event.target.closest?.('[data-ui-combobox]');
    if(target?.disabled)return;
    if(target?.hasAttribute('data-ui-combo-toggle')){const open=combo.querySelector('input').getAttribute('aria-expanded')==='true';combo.querySelector('input').focus();if(open)closeCombo(combo);else openCombo(combo);return;}
    if(target?.hasAttribute('data-ui-option')){choose(combo,target,event);return;}
    if(target?.hasAttribute('data-ui-preset')){const box=target.closest('.fui-number'),input=box.querySelector('input');input.value=target.dataset.uiPreset;input.focus();emit(box,event,input.valueAsNumber,{valid:input.checkValidity()});return;}
    if(target?.hasAttribute('data-ui-keep')){const control=target.closest('[data-ui-range]');control.dataset.keep='true';updateRange(control);emit(control,event,null);return;}
    if(target?.hasAttribute('data-ui-select-all')||target?.hasAttribute('data-ui-select-none')){
      const control=target.closest('[data-ui-multi]'),checked=target.hasAttribute('data-ui-select-all');
      control.querySelectorAll('input[type=checkbox]').forEach(el=>{if(!el.disabled&&(!checked||!el.closest('[data-selection-row]').hidden))el.checked=checked;});updateMulti(control);emit(control,event,selection(control));return;
    }
    if(target?.hasAttribute('data-ui-fold-all')){
      const scope=root.getElementById(target.dataset.scope);scope?.querySelectorAll('[data-ui="collapse"]').forEach(el=>{const expanded=target.dataset.uiFoldAll==='true';el.setAttribute('aria-expanded',String(expanded));el.querySelector('.chevron')?.classList.toggle('expanded',expanded);const body=root.getElementById(el.getAttribute('aria-controls'));if(body)body.hidden=!expanded;});return;
    }
    if(target?.hasAttribute('data-ui-cancel-action')){target.closest('dialog')?.close();onAction({action:target.dataset.uiCancelAction,data:{},value:false,element:target,originalEvent:event});return;}
    if(target?.hasAttribute('data-ui-import')){target.closest('[data-ui-backup]').querySelector('input[type=file]').click();return;}
    if(target?.hasAttribute('data-ui-photo-choose')){target.closest('[data-ui-photo]').querySelector('input[type=file]').click();return;}
    if(target?.hasAttribute('data-ui-photo-remove')){const control=target.closest('[data-ui-photo]');photoTokens.set(control,{});control.querySelector('[data-photo-preview]').replaceChildren();control.querySelector('[data-photo-status]').textContent='Foto wird entfernt.';control.querySelector('[data-photo-error]').replaceChildren();target.hidden=true;control.querySelector('input').value='';emit(control,event,null);return;}
    const day=event.target.closest?.('[data-ui-calendar-day]');
    if(day&&!event.target.closest('button,a,input,select,textarea'))emit(day,event,day.dataset.uiCalendarDay,{date:day.dataset.uiCalendarDay});
  };
  const input=event=>{
    const el=event.target,recurrence=el.closest?.('[data-ui-recurrence]');
    if(recurrence){if(el.name==='repeating'&&!el.checked){const alternate=recurrence.querySelector('[name=alternating]');if(alternate)alternate.checked=false;}const {rule,valid}=updateRecurrence(recurrence);emit(recurrence,event,rule,{valid});return;}
    const combo=el.closest?.('[data-ui-combobox]');if(combo&&el.matches('input')){combo.dataset.selected='';combo.querySelectorAll('[data-ui-option]').forEach(o=>o.setAttribute('aria-selected','false'));openCombo(combo);return;}
    const multi=el.closest?.('[data-ui-multi]');if(multi&&el.type==='search'){updateMulti(multi);return;}
    const range=el.closest?.('[data-ui-range]');if(range){range.dataset.keep='false';emit(range,event,updateRange(range),{phase:'input'});return;}
    const number=el.closest?.('.fui-number');if(number)emit(number,event,el.valueAsNumber,{valid:el.checkValidity()});
    const season=el.closest?.('[data-ui-season]');if(season&&el.type!=='checkbox'){el.setCustomValidity(parseMonthDay(el.value)?'':'Bitte ein gültiges Datum als TT.MM. eingeben.');}
  };
  const change=async event=>{
    const el=event.target,recurrence=el.closest?.('[data-ui-recurrence]');
    if(recurrence){if(el.name==='repeating'&&!el.checked){const alternate=recurrence.querySelector('[name=alternating]');if(alternate)alternate.checked=false;}const {rule,valid}=updateRecurrence(recurrence);emit(recurrence,event,rule,{valid});return;}
    const multi=el.closest?.('[data-ui-multi]');if(multi&&el.type==='checkbox'){updateMulti(multi);emit(multi,event,selection(multi));return;}
    const checks=el.closest?.('[data-ui-checks]');if(checks){emit(checks,event,selection(checks));return;}
    const completion=el.closest?.('[data-ui-completion]');if(completion){emit(completion,event,el.checked,{checked:el.checked});return;}
    const range=el.closest?.('[data-ui-range]');if(range){range.dataset.keep='false';emit(range,event,updateRange(range),{phase:'change'});return;}
    const window=el.closest?.('[data-ui-time-window]');if(window){const start=window.querySelector('[name=start]'),end=window.querySelector('[name=end]');emit(window,event,{start:start.value,end:end.value},{valid:start.checkValidity()&&end.checkValidity()});return;}
    const dates=el.closest?.('[data-ui-date-range]');if(dates){const start=dates.querySelector('[name=start]'),end=dates.querySelector('[name=end]');end.min=start.value;emit(dates,event,{start:start.value,end:end.value},{valid:start.checkValidity()&&end.checkValidity()});return;}
    const season=el.closest?.('[data-ui-season]');if(season){const enabled=season.querySelector('[data-season-enabled]').checked;season.querySelector('.season-dates').hidden=!enabled;const fields=[...season.querySelectorAll('input:not([type=checkbox])')];fields.forEach(f=>{f.disabled=!enabled;f.setCustomValidity(enabled&&!parseMonthDay(f.value)?'Bitte ein gültiges Datum als TT.MM. eingeben.':'');});emit(season,event,{enabled,start:parseMonthDay(fields[0].value),end:parseMonthDay(fields[1].value)},{valid:!enabled||fields.every(f=>f.checkValidity())});return;}
    const backup=el.closest?.('[data-ui-backup]');if(backup&&el.type==='file'&&el.files?.[0]){
      const file=el.files[0],box=backup.querySelector('[data-backup-feedback]');box.textContent='Datei wird gelesen …';
      try{const value=await readJSONFile(file,{maxBytes:Number(backup.dataset.maxBytes)});if(disposed||!backup.isConnected)return;box.replaceChildren();emit(backup,event,value,{file});}catch(error){if(!disposed&&backup.isConnected)box.innerHTML=feedback(error.message,{kind:'error'});}el.value='';return;
    }
    const photo=el.closest?.('[data-ui-photo]');if(photo&&el.type==='file'&&el.files?.[0]){
      const token={};photoTokens.set(photo,token);const controls=[...photo.querySelectorAll('button,input')].filter(n=>!n.disabled);controls.forEach(n=>n.disabled=true);const status=photo.querySelector('[data-photo-status]'),error=photo.querySelector('[data-photo-error]');error.replaceChildren();status.textContent='Foto wird aufbereitet …';
      try{const src=await compressPhoto(el.files[0]);if(disposed||!photo.isConnected||photoTokens.get(photo)!==token)return;photo.querySelector('[data-photo-preview]').innerHTML=photoPreview({src});photo.querySelector('[data-ui-photo-remove]').hidden=false;status.textContent='Foto bereit.';emit(photo,event,src);}catch(err){if(!disposed&&photo.isConnected&&photoTokens.get(photo)===token){status.textContent='Bitte ein anderes Foto wählen.';error.innerHTML=feedback(err.message,{kind:'error'});}}finally{controls.forEach(n=>n.disabled=false);el.value='';}return;
    }
  };
  const colour=(control,x,y,event)=>{
    const radius=Math.hypot(x,y);if(radius>1){x/=radius;y/=radius;}
    const rgb=hsvToRGB((Math.atan2(x,-y)*180/Math.PI+360)%360,Math.min(1,radius)),hex='#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('');control.dataset.rgb=rgb.join(',');
    Object.assign(control.querySelector('.colour-marker').style,{left:(50+x*50)+'%',top:(50+y*50)+'%',background:hex});control.querySelector('[data-colour-swatch]').style.background=hex;control.querySelector('output').textContent=hex.toUpperCase();emit(control,event,rgb,{hex});
  };
  const pointer=event=>{
    const wheel=event.target.closest?.('.colour-wheel');if(!wheel||wheel.getAttribute('aria-disabled')==='true'||event.isPrimary===false)return;
    if(event.type==='pointermove'&&!wheel.hasPointerCapture(event.pointerId))return;
    if(event.type==='pointerdown'){if(event.button!==0)return;wheel.setPointerCapture(event.pointerId);wheel.focus();}
    const r=wheel.getBoundingClientRect();if(!r.width)return;event.preventDefault();colour(wheel.closest('[data-ui-colour]'),(event.clientX-r.left-r.width/2)/(r.width/2),(event.clientY-r.top-r.height/2)/(r.height/2),event);
  };
  const keydown=event=>{
    const el=event.target,combo=el.closest?.('[data-ui-combobox]');
    if(combo&&el.matches('input')){
      if(event.key==='Tab'){closeCombo(combo);return;}
      if(event.key==='Escape'&&el.getAttribute('aria-expanded')==='true'){event.preventDefault();event.stopPropagation();closeCombo(combo);return;}
      if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();if(el.getAttribute('aria-expanded')!=='true')openCombo(combo);const list=options(combo),index=list.findIndex(n=>n.classList.contains('active')),next=event.key==='ArrowDown'?Math.min(index+1,list.length-1):Math.max(index-1,0);list.forEach(n=>n.classList.remove('active'));if(list[next]){list[next].classList.add('active');el.setAttribute('aria-activedescendant',list[next].id);list[next].scrollIntoView({block:'nearest'});}return;}
      if(event.key==='Enter'&&el.getAttribute('aria-expanded')==='true'){event.preventDefault();const list=options(combo),selected=list.find(n=>n.classList.contains('active'))||(list.length===1?list[0]:null);if(selected)choose(combo,selected,event);return;}
    }
    const wheel=el.closest?.('.colour-wheel');if(wheel&&wheel.getAttribute('aria-disabled')!=='true'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)){
      event.preventDefault();const control=wheel.closest('[data-ui-colour]'),{h,s}=rgbToHSV(control.dataset.rgb.split(',').map(Number)),a=h*Math.PI/180,step=event.shiftKey?.1:.02;let x=Math.sin(a)*s,y=-Math.cos(a)*s;
      if(event.key==='Home'){x=0;y=0;}else if(event.key==='End'){x=Math.sin(a);y=-Math.cos(a);}else if(event.key==='ArrowLeft')x-=step;else if(event.key==='ArrowRight')x+=step;else if(event.key==='ArrowUp')y-=step;else y+=step;
      colour(control,x,y,event);
    }
  };
  const focusin=event=>{const box=event.target.closest?.('[data-ui-combobox]');if(box&&event.target.matches('input'))openCombo(box);};
  const outside=event=>{root.querySelectorAll('[data-ui-combobox]').forEach(box=>{if(!box.contains(event.target))closeCombo(box);});};
  const focusout=event=>{const box=event.target.closest?.('[data-ui-combobox]');if(box&&event.relatedTarget&&!box.contains(event.relatedTarget))closeCombo(box);};
  const listeners={click,input,change,keydown,focusin,focusout,pointerdown:pointer,pointermove:pointer};
  for(const [type,fn] of Object.entries(listeners))root.addEventListener(type,fn);
  root.addEventListener('pointerdown',outside);const observer=new MutationObserver(init);observer.observe(root,{childList:true,subtree:true});init();
  return ()=>{disposed=true;observer.disconnect();for(const [type,fn] of Object.entries(listeners))root.removeEventListener(type,fn);root.removeEventListener('pointerdown',outside);};
}

/** Source: Essensplaner horizontal swipe, Gartenarbeit top-of-page pull. Opt-in per surface. */
export function bindGestures(element,{onSwipeLeft,onSwipeRight,onPullDown,canPull=()=>!element.getRootNode().querySelector?.('dialog[open]')&&(element.ownerDocument.defaultView.scrollY<=0),swipeThreshold=60,pullThreshold=85}={}) {
  let start=null;
  const touchstart=event=>{const target=event.target;start=event.touches.length===1&&!target.closest?.('input,select,textarea,button,a,.colour-wheel')?[event.touches[0].clientX,event.touches[0].clientY,canPull()]:null;};
  const cancel=()=>{start=null;};
  const touchend=event=>{if(!start||!event.changedTouches.length)return;const [x,y,pull]=start;start=null;const dx=event.changedTouches[0].clientX-x,dy=event.changedTouches[0].clientY-y;if(Math.abs(dx)>swipeThreshold&&Math.abs(dx)>Math.abs(dy)*1.2)(dx<0?onSwipeLeft:onSwipeRight)?.();else if(pull&&dy>pullThreshold&&dy>Math.abs(dx)*1.2)onPullDown?.();};
  element.addEventListener('touchstart',touchstart,{passive:true});element.addEventListener('touchend',touchend,{passive:true});element.addEventListener('touchcancel',cancel,{passive:true});
  return ()=>{cancel();element.removeEventListener('touchstart',touchstart);element.removeEventListener('touchend',touchend);element.removeEventListener('touchcancel',cancel);};
}
