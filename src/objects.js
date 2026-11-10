import {escapeHtml, button, iconButton, toggle, field, selectField, section, dialog, programOrderButtons} from './components.js';
import {icon} from './icons.js';

// Content/actions/body/cell-renderers accept trusted application markup, all data text is escaped.
function objectId(id) { if (typeof id !== 'string' || !id || /\s/.test(id)) throw new TypeError('A unique ID without whitespace is required'); return escapeHtml(id); }
function objectAction(action) { return `data-control-action="${escapeHtml(action)}"`; }

export function textareaField({id,label,value='',name,rows=3,maxLength,required=false,disabled=false,hint='',error=''}) {
  objectId(id);
  return `<label class="field" for="${escapeHtml(id)}"><span>${escapeHtml(label)}</span><textarea id="${escapeHtml(id)}" rows="${Math.max(1,Number(rows)||3)}"${name?` name="${escapeHtml(name)}"`:''}${maxLength!==undefined?` maxlength="${escapeHtml(maxLength)}"`:''}${required?' required':''}${disabled?' disabled':''}${error?' aria-invalid="true"':''}${hint||error?` aria-describedby="${escapeHtml(id)}-help"`:''}>${escapeHtml(value)}</textarea>${hint||error?`<small id="${escapeHtml(id)}-help" class="${error?'field-error':''}"${error?' role="alert"':''}>${escapeHtml(error||hint)}</small>`:''}</label>`;
}

export function numberControl({id,label,value='',presets=[],action='number-change',...options}) {
  objectId(id);
  return `<div class="fui-number" ${objectAction(action)}>${field({id,label,value,type:'number',...options})}${presets.length?`<div class="toolbar fui-presets" role="group" aria-label="${escapeHtml(label)} – Schnellwerte">${presets.map(p=>`<button type="button" data-ui-preset="${escapeHtml(typeof p==='object'?p.value:p)}"${options.disabled?' disabled':''}>${escapeHtml(typeof p==='object'?p.label:p)}</button>`).join('')}</div>`:''}</div>`;
}

export function checkboxGroup({id,label,items,values=[],action='selection-change',disabled=false,days=false}) {
  objectId(id);const selected=new Set(values.map(String));
  return `<fieldset class="fui-check-group" id="${escapeHtml(id)}" data-ui-checks ${objectAction(action)}><legend>${escapeHtml(label)}</legend><div class="${days?'days':'fui-checks'}">${items.map((item,i)=>`<label class="${days?'':'check'}"${item.description?` title="${escapeHtml(item.description)}"`:''}><input type="checkbox" value="${escapeHtml(item.value??item.id)}" aria-label="${escapeHtml(item.description||item.label)}"${selected.has(String(item.value??item.id))?' checked':''}${disabled||item.disabled?' disabled':''}><span>${escapeHtml(item.label)}</span></label>`).join('')}</div></fieldset>`;
}

export function weekdayPicker({id,label='Wochentage',values=[],action='weekdays-change',disabled=false,labels=['Mo','Di','Mi','Do','Fr','Sa','So']}={}) {
  return checkboxGroup({id,label,values,action,disabled,days:true,items:labels.map((label,value)=>({value,label}))}).replace('data-ui-checks','data-ui-checks data-value-type="number"');
}

export function combobox({id,label,items,value='',selected='',action='combobox-select',placeholder='Suchen …',required=false,disabled=false,emptyLabel='Keine passenden Einträge gefunden.'}) {
  objectId(id);
  return `<div class="fui-combobox" id="${escapeHtml(id)}-control" data-ui-combobox data-selected="${escapeHtml(selected)}" ${objectAction(action)}>${field({id,label,value,placeholder,required,disabled,autocomplete:'off'}).replace('<input ',`<input role="combobox" aria-autocomplete="list" aria-controls="${escapeHtml(id)}-options" aria-expanded="false" `)}<button type="button" class="edit-button fui-combo-toggle" data-ui-combo-toggle aria-label="${escapeHtml(label)} aufklappen"${disabled?' disabled':''}>${icon('down')}</button><div class="fui-options" id="${escapeHtml(id)}-options" role="listbox" aria-label="${escapeHtml(label)}" hidden>${items.map((item,i)=>`<button type="button" class="fui-option" role="option" tabindex="-1" id="${escapeHtml(id)}-option-${i}" data-ui-option data-value="${escapeHtml(item.value??item.id)}" data-label="${escapeHtml(item.label)}" aria-selected="${String(String(item.value??item.id)===String(selected))}"${item.disabled?' disabled':''}><strong>${escapeHtml(item.label)}</strong>${item.description?`<small>${escapeHtml(item.description)}</small>`:''}</button>`).join('')}<div class="fui-options-empty" role="status" hidden>${escapeHtml(emptyLabel)}</div></div></div>`;
}

export function multiSelect({id,label='Auswahl',items,values=[],action='selection-change',search=true,all=true,selectedFirst=false,disabled=false,searchLabel='Name oder Entität suchen',allLabel='Alle sichtbaren auswählen',clearLabel='Auswahl aufheben',emptyLabel='Keine Treffer für diese Auswahl.'}) {
  objectId(id);const selected=new Set(values.map(String)),groups=[...new Set(items.map(i=>i.group||''))];
  return `<fieldset class="fui-multi" id="${escapeHtml(id)}" data-ui-multi ${objectAction(action)} data-selected-first="${selectedFirst}"><legend>${escapeHtml(label)}</legend>${search?field({id:id+'-search',label:searchLabel,type:'search',disabled}):''}${all?`<div class="toolbar import-toolbar"><button type="button" data-ui-select-all${disabled?' disabled':''}>${escapeHtml(allLabel)}</button><button type="button" data-ui-select-none${disabled?' disabled':''}>${escapeHtml(clearLabel)}</button></div>`:''}<div class="fui-selection-list">${groups.map(group=>`<section class="fui-selection-group" data-selection-group>${group?`<h4>${escapeHtml(group)}</h4>`:''}${items.filter(i=>(i.group||'')===group).sort((a,b)=>selectedFirst?Number(selected.has(String(b.value??b.id)))-Number(selected.has(String(a.value??a.id))):0).map(item=>`<label class="cover-option" data-selection-row data-search="${escapeHtml([item.label,item.description,item.value??item.id].filter(Boolean).join(' ').toLocaleLowerCase())}"><input type="checkbox" value="${escapeHtml(item.value??item.id)}"${selected.has(String(item.value??item.id))?' checked':''}${disabled||item.disabled?' disabled':''}><span><strong>${escapeHtml(item.label)}</strong>${item.description?`<small>${escapeHtml(item.description)}</small>`:''}${item.hint?`<small>${escapeHtml(item.hint)}</small>`:''}</span></label>`).join('')}</section>`).join('')}</div><p class="hint fui-selection-empty" role="status"${items.length?' hidden':''}>${escapeHtml(emptyLabel)}</p><small data-selection-count aria-live="polite">${items.filter(i=>selected.has(String(i.value??i.id))).length} ausgewählt</small></fieldset>`;
}

export function rangeControl({id,label,value=0,min=0,max=100,step=1,unit='%',action='range-change',keepLabel='Unverändert',allowKeep=true,disabled=false,reverse=false}) {
  objectId(id);if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min||!Number.isFinite(step)||step<=0)throw new RangeError('Invalid range');
  const keep=value===null,n=keep?min:Math.max(min,Math.min(max,Number(value)));if(!Number.isFinite(n))throw new TypeError('Invalid range value');
  const position=reverse?max-n+min:n,percent=(position-min)/(max-min)*100;
  return `<div class="position-control" data-ui-range id="${escapeHtml(id)}-control" ${objectAction(action)} data-unit="${escapeHtml(unit)}" data-keep="${keep}" data-keep-label="${escapeHtml(keepLabel)}" data-reverse="${reverse}"><div class="slider-head"><label for="${escapeHtml(id)}">${escapeHtml(label)}</label><output for="${escapeHtml(id)}">${escapeHtml(keep?keepLabel:n+(unit?' '+unit:''))}</output></div><input id="${escapeHtml(id)}" type="range" min="${min}" max="${max}" step="${step}" value="${position}" aria-label="${escapeHtml(label)}" aria-valuetext="${escapeHtml(keep?keepLabel:n+(unit?' '+unit:''))}" style="--range-percent:${percent}%"${disabled?' disabled':''}>${allowKeep?`<div class="slider-foot"><button type="button" class="keep-value${keep?' selected':''}" data-ui-keep aria-pressed="${keep}"${disabled?' disabled':''}>${escapeHtml(keepLabel)}</button></div>`:''}</div>`;
}

export function whiteTemperatureControl({id,label='Weißtöne',value=4000,min=2000,max=6500,action='temperature-change',disabled=false,coldLabel='Kaltweiß',warmLabel='Warmweiß'}) {
  return `<div class="white-control"><div class="white-labels"><span>${escapeHtml(coldLabel)}</span><span>${escapeHtml(warmLabel)}</span></div>${rangeControl({id,label,value,min,max,step:1,unit:'K',action,allowKeep:false,disabled,reverse:true})}<div class="white-labels hint"><span>${max} K</span><span>${min} K</span></div></div>`;
}

export function parseColour(value) {
  if(Array.isArray(value)&&value.length===3&&value.every(n=>Number.isFinite(n)&&n>=0&&n<=255))return value.map(Math.round);
  if(typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value))return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
  throw new TypeError('Colour requires #RRGGBB or three RGB numbers');
}
export function rgbToHSV(rgb) { const [r,g,b]=parseColour(rgb).map(n=>n/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d)h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;return {h:(h*60+360)%360,s:max?d/max:0,v:max}; }
export function hsvToRGB(h,s,v=1) { if(![h,s,v].every(Number.isFinite)||s<0||s>1||v<0||v>1)throw new RangeError('Invalid HSV colour');h=((h%360)+360)%360;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;return (h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x]).map(n=>Math.round((n+m)*255)); }
export function colourPicker({id,label='Farbe',value='#FF7000',action='colour-change',disabled=false}) {
  objectId(id);const rgb=parseColour(value),{h,s}=rgbToHSV(rgb),a=h*Math.PI/180,hex='#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('');
  return `<div class="colour-control" id="${escapeHtml(id)}" data-ui-colour ${objectAction(action)} data-rgb="${rgb.join(',')}"><span class="field-label">${escapeHtml(label)}</span><div class="colour-wheel" tabindex="${disabled?-1:0}" role="group" aria-label="${escapeHtml(label)}: Pfeiltasten zum Wählen, Pos1 für Weiß" aria-disabled="${disabled}" aria-describedby="${escapeHtml(id)}-value"><span class="colour-marker" style="left:${50+Math.sin(a)*s*50}%;top:${50-Math.cos(a)*s*50}%;background:${hex}"></span></div><div class="colour-preview"><span data-colour-swatch style="background:${hex}"></span><output id="${escapeHtml(id)}-value" aria-live="polite">${hex.toUpperCase()}</output></div></div>`;
}

export function timeWindow({id,label='Zeitfenster',start='00:00',end='00:00',action='time-window-change',disabled=false,startLabel='Von',endLabel='Bis'}) {
  objectId(id);return `<fieldset class="fui-time-window" id="${escapeHtml(id)}" data-ui-time-window ${objectAction(action)}><legend>${escapeHtml(label)}</legend><div class="grid">${field({id:id+'-start',name:'start',label:startLabel,value:start,type:'time',required:true,disabled})}${field({id:id+'-end',name:'end',label:endLabel,value:end,type:'time',required:true,disabled})}</div><small>Gleiche Uhrzeit = ganztägig. Zeitfenster über Mitternacht sind möglich.</small></fieldset>`;
}
export function parseMonthDay(value) {
  const m=String(value).match(/^(\d{1,2})\.(\d{1,2})\.?$/);if(!m)return null;
  const day=Number(m[1]),month=Number(m[2]),date=new Date(Date.UTC(2000,month-1,day));
  return date.getUTCMonth()===month-1&&date.getUTCDate()===day?`${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`:null;
}
export function seasonPicker({id,label='Gültigkeitszeitraum',enabled=false,start='04-01',end='10-31',action='season-change',disabled=false}) {
  objectId(id);const display=s=>/^\d{2}-\d{2}$/.test(s)?s.slice(3)+'.'+s.slice(0,2):s;
  return `<fieldset class="season-box" id="${escapeHtml(id)}" data-ui-season ${objectAction(action)}><legend>${escapeHtml(label)}</legend><label class="check"><input type="checkbox" data-season-enabled${enabled?' checked':''}${disabled?' disabled':''}>Saison einschränken</label><div class="season-dates"${enabled?'':' hidden'}>${field({id:id+'-start',name:'start',label:'Von (TT.MM.)',value:display(start),placeholder:'01.04.',maxLength:6,inputMode:'numeric',disabled:disabled||!enabled})}${field({id:id+'-end',name:'end',label:'Bis (TT.MM.)',value:display(end),placeholder:'31.10.',maxLength:6,inputMode:'numeric',disabled:disabled||!enabled})}</div><small>Der Zeitraum darf über den Jahreswechsel reichen.</small></fieldset>`;
}

export function dateRange({id,label='Zeitraum',start='',end='',action='date-range-change',disabled=false,optionalEnd=true}) {
  objectId(id);return `<fieldset id="${escapeHtml(id)}" data-ui-date-range ${objectAction(action)}><legend>${escapeHtml(label)}</legend><div class="grid">${field({id:id+'-start',name:'start',label:'Von',value:start,type:'date',required:true,disabled})}${field({id:id+'-end',name:'end',label:optionalEnd?'Bis (optional)':'Bis',value:end,type:'date',min:start||undefined,required:!optionalEnd,disabled})}</div></fieldset>`;
}

export function recurrenceEditor({id,label='Wiederholung',value={},action='recurrence-change',disabled=false,people=[]}) {
  objectId(id);const kind=value.kind||'once',unit=kind==='daily'?'day':kind==='yearly'?'year':kind.startsWith('monthly')?'month':'week',start=value.start||'',days=value.weekdays||[],repeating=kind!=='once';
  return `<fieldset class="recurrence"${disabled?' disabled':''} id="${escapeHtml(id)}" data-ui-recurrence ${objectAction(action)}><legend>${escapeHtml(label)}</legend>${dateRange({id:id+'-dates',start,end:value.end||'',disabled})}<label class="check"><input type="checkbox" name="repeating"${repeating?' checked':''}${disabled?' disabled':''}>${icon('schedule')}Wiederkehrend</label><div class="recurrence-controls"${repeating?'':' hidden'}><div class="repeat-line"><span>Wiederholen alle</span><input type="number" name="interval" min="1" max="365" value="${escapeHtml(value.interval??1)}" aria-label="Wiederholungsabstand"${disabled||!repeating?' disabled':''}><select name="unit" aria-label="Wiederholungseinheit"${disabled||!repeating?' disabled':''}>${[['day','Tag'],['week','Woche'],['month','Monat'],['year','Jahr']].map(([v,l])=>`<option value="${v}"${unit===v?' selected':''}>${l}</option>`).join('')}</select></div><label class="field" data-month-mode><span>Monatliches Muster</span><select name="month_mode"${disabled?' disabled':''}><option value="date"${kind!=='monthly_nth'?' selected':''}>Am Tag des Startdatums</option><option value="nth"${kind==='monthly_nth'?' selected':''}>An einem bestimmten Wochentag</option></select></label><label class="field" data-nth><span>Welcher im Monat?</span><select name="nth"${disabled?' disabled':''}>${[[1,'Erster'],[2,'Zweiter'],[3,'Dritter'],[4,'Vierter'],[5,'Fünfter'],[-1,'Letzter']].map(([v,l])=>`<option value="${v}"${Number(value.nth??1)===v?' selected':''}>${l}</option>`).join('')}</select></label>${weekdayPicker({id:id+'-days',values:days,disabled})}${people.length?`<label class="check"><input type="checkbox" name="alternating"${value.alternating?' checked':''}${disabled?' disabled':''}>Abwechselnd</label><label class="field" data-first-person><span>Wer beginnt?</span><select name="first_person"${disabled?' disabled':''}>${people.map(p=>`<option value="${escapeHtml(p)}"${value.first_person===p?' selected':''}>${escapeHtml(p)}</option>`).join('')}</select></label>`:''}<small class="recurrence-hint" aria-live="polite"></small></div></fieldset>`;
}

export function programGroup({id,title,count,content='',expanded=true}) {
  objectId(id);return `<section class="program-group" id="${escapeHtml(id)}"><button type="button" class="program-group-head" data-ui="collapse" aria-expanded="${expanded}" aria-controls="${escapeHtml(id)}-content">${icon('chevron',{expanded})}<strong>${escapeHtml(title)}</strong><span>${escapeHtml(count??'')}</span></button><div id="${escapeHtml(id)}-content"${expanded?'':' hidden'}>${content}</div></section>`;
}
export function programRow({id,title,meta=[],enabled=true,expanded=false,content='',actions='',index=0,count=1,editable=true,sortable=true,copyable=true,disabled=false}) {
  objectId(id);const data={program:id};
  const tools=(editable&&sortable?programOrderButtons({programId:id,index,count,disabled}):'')+toggle({label:title+' aktiv',action:'program-enabled',checked:enabled,disabled,data,iconOnly:true})+(editable&&copyable?iconButton({icon:'copy',label:'Programm kopieren',action:'copy-program',data,disabled,desktopOnly:true}):'')+(editable?iconButton({icon:'edit',label:'Programm bearbeiten',action:'edit-program',data,disabled}):'')+actions;
  return `<section class="program${enabled?'':' muted'}"><div class="program-head"><div class="program-heading"><button type="button" class="program-title" data-ui="collapse" aria-expanded="${expanded}" aria-controls="${escapeHtml(id)}-content">${icon('chevron',{expanded})}<span>${escapeHtml(title)}</span></button><div class="tags">${meta.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div></div><div class="toolbar">${tools}</div></div><div id="${escapeHtml(id)}-content"${expanded?'':' hidden'}>${content}</div></section>`;
}
export function actionRow({title,description='',detail='',actions='',enabled=true}) {
  return `<div class="ride${enabled?'':' muted'}"><div class="ride-info"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span>${detail?`<small>${escapeHtml(detail)}</small>`:''}</div><div class="toolbar ride-actions">${actions}</div></div>`;
}
export function actionEditor({id,title,summary='',content='',actions='',expanded=true}) {
  objectId(id);return `<section class="subpanel"><div class="ride-editor-head"><button type="button" class="ride-fold" data-ui="collapse" aria-controls="${escapeHtml(id)}-body" aria-expanded="${expanded}">${icon('chevron',{expanded})}<span class="ride-fold-text"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(summary)}</span></span></button><div class="toolbar ride-editor-actions">${actions}</div></div><div id="${escapeHtml(id)}-body" class="ride-editor-body"${expanded?'':' hidden'}>${content}</div></section>`;
}
export function foldControls({scopeId,expandLabel='Alle aufklappen',collapseLabel='Alle zuklappen'}) {
  objectId(scopeId);return `<div class="toolbar"><button type="button" data-ui-fold-all="true" data-scope="${escapeHtml(scopeId)}">${escapeHtml(expandLabel)}</button><button type="button" data-ui-fold-all="false" data-scope="${escapeHtml(scopeId)}">${escapeHtml(collapseLabel)}</button></div>`;
}
export function sensorOverview({id,title='Messwerte',expanded=true,sunrise='',sunset='',groups=[]}) {
  objectId(id);return `<div class="overview-panel"><button type="button" class="overview-toggle" data-ui="collapse" aria-controls="${escapeHtml(id)}-content" aria-expanded="${expanded}">${icon('chevron',{expanded})}<span>${escapeHtml(title)}</span></button><section class="overview" id="${escapeHtml(id)}-content"${expanded?'':' hidden'}>${sunrise||sunset?`<div class="sun-row">${[['sunrise',sunrise,'Sonnenaufgang'],['sunset',sunset,'Sonnenuntergang']].filter(([,v])=>v).map(([name,value,label])=>`<span class="sun-value" title="${label}" aria-label="${label} ${escapeHtml(value)}">${icon(name)}<span>${escapeHtml(value)}</span></span>`).join('')}</div>`:''}${groups.map(group=>`<section class="overview-group"><h4>${escapeHtml(group.title)}</h4><div class="sensor-grid">${group.items.map(item=>`<div class="sensor-value"><span class="sensor-label">${escapeHtml(item.label)}</span><span class="sensor-state" title="${escapeHtml(item.value)}">${icon(item.icon||'unknown')}<span${item.icon==='lock'||item.icon==='unlock'?' class="visually-hidden"':''}>${escapeHtml(item.value)}</span></span></div>`).join('')}</div></section>`).join('')}</section></div>`;
}
export function statusBadge({label,state='neutral',icon:iconName}) {
  if(!['neutral','active','success','warning','error','paused'].includes(state))throw new TypeError('Unknown status state');
  return `<span class="fui-status-tag ${state}">${iconName?icon(iconName):''}${escapeHtml(label)}</span>`;
}
export function counter(value,label='') { return `<small class="fui-counter"${label?` aria-label="${escapeHtml(label)}"`:''}>${escapeHtml(value)}</small>`; }
/** Static account summary. Values, units, status and permissions belong to the host. */
export function accountTile({id,label,value,unit='',status='',state='neutral',description='',details=''}) {
  objectId(id);
  if(!['neutral','active','success','warning','error'].includes(state))throw new TypeError('Unknown account state');
  return `<article class="fui-account-tile ${state}" id="${escapeHtml(id)}" aria-labelledby="${escapeHtml(id)}-label"${details?` aria-describedby="${escapeHtml(id)}-details" title="${escapeHtml(details)}"`:''}><h4 class="fui-account-label" id="${escapeHtml(id)}-label" title="${escapeHtml(label)}">${escapeHtml(label)}</h4><div class="fui-account-balance"><strong class="fui-account-value">${escapeHtml(value)}</strong><span class="fui-account-unit">${escapeHtml([unit,status].filter(Boolean).join(' '))}</span></div>${description?`<p class="fui-account-description">${escapeHtml(description)}</p>`:''}${details?`<span class="visually-hidden" id="${escapeHtml(id)}-details">${escapeHtml(details)}</span>`:''}</article>`;
}
/** Always two equal columns, including mobile and single-account views. */
export function accountTiles({content,label='Zeitkonten'}) {
  return `<div class="fui-account-tiles" role="group" aria-label="${escapeHtml(label)}">${content}</div>`;
}
export function historyList({entries,emptyLabel='Noch keine Einträge vorhanden.'}) {
  if(!entries.length)return emptyState(emptyLabel);
  return `<div class="daily-history" role="list">${entries.map(entry=>{
    const failed=entry.status==='error',pending=entry.status==='pending',result=entry.result||(failed?'Fehlgeschlagen':pending?'Wartet':'Erfolgreich');
    return `<div class="daily-history-row ${failed?'failed':pending?'pending':'completed'}" role="listitem"><time${entry.datetime?` datetime="${escapeHtml(entry.datetime)}"`:''}>${escapeHtml(entry.time)}</time><div class="daily-command"><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.description)}</small>${entry.detail?`<small class="failure-reason">${escapeHtml(entry.detail)}</small>`:''}</div><span class="command-result">${icon(failed?'failure':pending?'schedule':'success')}${escapeHtml(result)}</span></div>`;
  }).join('')}</div>`;
}
export function groupedHistory({id,title='Verlauf',groups,expanded=false}) {
  objectId(id);return section({id,title,expanded,trailing:counter(groups.reduce((n,g)=>n+g.entries.length,0),'Einträge'),content:groups.map((g,i)=>`<div class="fui-history-month">${section({id:id+'-group-'+i,title:g.title,expanded:g.expanded??false,trailing:counter(g.entries.length),content:historyList({entries:g.entries})})}</div>`).join('')||emptyState('Noch keine Einträge vorhanden.')});
}
export function statisticsTable({label='Statistik',columns,rows,totals}) {
  if(!columns.length)throw new TypeError('Statistics needs columns');
  const cells=(values,tag)=>columns.map((col,i)=>`<${tag}${tag==='th'?' scope="col"':''}${col.align==='right'?' class="numeric"':''}>${escapeHtml(values[i])}</${tag}>`).join('');
  return `<div class="fui-statistics"><table aria-label="${escapeHtml(label)}"><thead><tr>${cells(columns.map(c=>c.label),'th')}</tr></thead><tbody>${rows.map(values=>`<tr>${cells(values,'td')}</tr>`).join('')}</tbody>${totals?`<tfoot><tr>${cells(totals,'td')}</tr></tfoot>`:''}</table></div>`;
}
export function dateNavigation({label,previousLabel='Vorherige Woche',nextLabel='Nächste Woche',todayLabel='Heute',previousAction='previous-period',nextAction='next-period',todayAction='today',disabled=false}) {
  return `<div class="week">${iconButton({icon:'left',label:previousLabel,action:previousAction,disabled})}<strong>${escapeHtml(label)}</strong>${button({label:todayLabel,action:todayAction,disabled})}${iconButton({icon:'right',label:nextLabel,action:nextAction,disabled})}</div>`;
}
export function dateKey(date) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function calendarDates(start,count=7) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!Number.isInteger(count)||count<1||count>366)throw new TypeError('Invalid calendar range');
  const first=new Date(start+'T12:00:00');if(!Number.isFinite(first.getTime())||dateKey(first)!==start)throw new TypeError('Invalid calendar date');
  return Array.from({length:count},(_,i)=>{const day=new Date(first);day.setDate(day.getDate()+i);return dateKey(day);});
}
function safeLink(value) {try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?escapeHtml(u.href):'';}catch{return '';}}
export function weekCalendar({id,start,entries=[],locale='de-DE',today='',emptyLabel='Eintrag hinzufügen',action='open-day'}) {
  objectId(id);return `<div id="${escapeHtml(id)}" class="days fui-calendar">${calendarDates(start).map(date=>{const entry=entries.find(e=>e.date===date),day=new Date(date+'T12:00:00'),link=entry?.link&&safeLink(entry.link);return `<article class="calendar-row${entry?'':' empty'}${date===today?' today':''}" data-ui-calendar-day="${date}" ${objectAction(action)}><div class="day-date"><b>${escapeHtml(day.toLocaleDateString(locale,{weekday:'short'}))}</b><small>${escapeHtml(day.toLocaleDateString(locale,{day:'2-digit',month:'2-digit'}))}</small></div><div class="calendar-content"><div class="setting-row"><div class="row-text"><strong>${escapeHtml(entry?.title||emptyLabel)}</strong>${entry?.description?`<small>${escapeHtml(entry.description)}</small>`:''}</div><div class="toolbar">${entry?.actions||iconButton({icon:entry?'edit':'add',label:entry?'Eintrag bearbeiten':emptyLabel,action,data:{date}})}</div></div>${link?`<a class="meal-link" href="${link}" target="_blank" rel="noopener">Link öffnen</a>`:''}</div></article>`;}).join('')}</div>`;
}
export function completionRow({id,title,description='',people=[],action='completion-change',readOnly=false}) {
  objectId(id);const completed=people.length&&people.every(p=>p.completed);
  return `<div class="setting-row${completed?' completed':''}"><div class="row-text"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small></div><div class="checks">${people.map(p=>readOnly?`<span class="assignee${p.completed?' completed':''}">${escapeHtml(p.label)}${p.completed?icon('success'):''}</span>`:`<label class="complete" ${objectAction(action)} data-ui-completion data-id="${escapeHtml(id)}" data-person="${escapeHtml(p.id)}"><input type="checkbox" aria-label="${escapeHtml(title+' – '+p.label)}"${p.completed?' checked':''}${p.disabled?' disabled':''}><span class="visually-hidden">${escapeHtml(p.label)}</span></label>`).join('')}</div></div>`;
}
export function dayAgenda({id,days}) {objectId(id);return days.map((day,i)=>section({id:id+'-'+i,title:day.title,expanded:day.expanded??true,trailing:counter(day.count??'',day.countLabel||''),content:day.content||''})).join('');}
export function languagePicker({value='de',action='language-change',languages=[{id:'de',label:'Deutsch',short:'DE',flag:'🇩🇪'},{id:'en',label:'English',short:'EN',flag:'🇬🇧'}] }={}) {
  return `<div class="language-picker" role="group" aria-label="Sprache">${languages.map(l=>`<button type="button" data-action="${escapeHtml(action)}" data-language="${escapeHtml(l.id)}" aria-pressed="${l.id===value}" title="${escapeHtml(l.label)}">${escapeHtml(l.flag||'')} <span>${escapeHtml(l.short||l.id)}</span></button>`).join('')}</div>`;
}
export function backupControls({id='backup',exportAction='export-backup',importAction='import-backup',exportLabel='Sicherung erstellen',importLabel='Sicherung wiederherstellen',disabled=false,maxBytes=2*1024*1024}={}) {
  objectId(id);return `<div id="${escapeHtml(id)}" data-ui-backup ${objectAction(importAction)} data-max-bytes="${Number(maxBytes)}"><div class="toolbar backup-actions">${button({label:exportLabel,action:exportAction,disabled})}<button type="button" data-ui-import${disabled?' disabled':''}>${escapeHtml(importLabel)}</button></div><input type="file" accept="application/json,.json" aria-label="Sicherungsdatei" hidden${disabled?' disabled':''}><div data-backup-feedback></div></div>`;
}
export function helpContent({title='',content=''}) {return `<article class="howto">${title?`<h2>${escapeHtml(title)}</h2>`:''}${content}</article>`;}
export function panelHeader({title,dirty=false,busy=false,menu=true,reload=true,save=true,menuAction='menu',reloadAction='reload',saveAction='save',saveLabel='Änderungen speichern',savedLabel='Gespeichert'}) {
  return `<header class="fui-panel-header">${menu?iconButton({icon:'menu',label:'Menü öffnen',action:menuAction}):''}<strong>${escapeHtml(title)}</strong><span class="grow"></span>${reload?button({label:'Neu laden',action:reloadAction,disabled:busy}):''}${save?busyButton({label:dirty?saveLabel:savedLabel,busy,disabled:!dirty,action:saveAction}):''}</header>`;
}
export function feedback(message,{kind='info'}={}) {
  if(!['info','success','warning','error'].includes(kind))throw new TypeError('Unknown feedback kind');
  return `<div class="fui-feedback ${kind}" role="${kind==='error'?'alert':'status'}">${escapeHtml(message)}</div>`;
}
export function formError(message) {return `<p class="modal-save-error" role="alert"${message?'':' hidden'}>${escapeHtml(message)}</p>`;}
export function emptyState(message,{actionContent=''}={}) {return `<div class="empty" role="status">${escapeHtml(message)}${actionContent?`<div class="toolbar">${actionContent}</div>`:''}</div>`;}
export function loadingState(label='Wird geladen …') {return `<p class="hint fui-loading" role="status" aria-live="polite" aria-busy="true">${escapeHtml(label)}</p>`;}
export function busyButton({label='Speichern',busy=false,busyLabel='Speichern …',disabled=false,action='save',variant='primary',data={}}={}) {return button({label:busy?busyLabel:label,disabled:disabled||busy,action,variant,data}).replace('<button ',`<button aria-busy="${busy}" `);}
export function confirmDialog({id,title='Eintrag löschen?',message,confirmLabel='Löschen',cancelLabel='Abbrechen',confirmAction='confirm',cancelAction='cancel',danger=true}) {
  return dialog({id,title,content:`<p>${escapeHtml(message)}</p>`,actions:button({label:cancelLabel,action:cancelAction}).replace('data-action=', 'data-ui-cancel-action=')+button({label:confirmLabel,action:confirmAction,variant:danger?'danger':'primary'})});
}
export function photoPreview({src,alt='Foto',large=false}) {
  if(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(src||''))throw new TypeError('A JPEG/PNG/WebP data URL is required');
  return `<img class="${large?'gm-photo-large':'photo-preview'}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
}
export function photoPicker({id,label='Foto (optional)',src='',action='photo-change',disabled=false}) {
  objectId(id);return `<div class="gm-photo-box" id="${escapeHtml(id)}" data-ui-photo ${objectAction(action)}><span class="field-label">${escapeHtml(label)}</span><div class="toolbar"><button type="button" data-ui-photo-choose${disabled?' disabled':''}>Foto wählen</button><button type="button" data-ui-photo-remove${src?'':' hidden'}${disabled?' disabled':''}>Foto entfernen</button></div><input type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="${escapeHtml(label)}"${disabled?' disabled':''}><div data-photo-preview>${src?photoPreview({src}):''}</div><small data-photo-status role="status">${src?'Foto vorhanden.':'JPG / PNG / WebP · bis 20 MB · wird automatisch verkleinert.'}</small><div data-photo-error></div></div>`;
}
export function photoDialog({id,title='Foto',src,alt}) {return dialog({id,title,content:photoPreview({src,alt,large:true})});}
