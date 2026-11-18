import {escapeHtml, notice} from './components.js';
import {icon} from './icons.js';

const ENERGY_ROLES = new Set(['solar','grid','home','battery','export','charge']);
const roleClass = role => 'fui-energy-'+(ENERGY_ROLES.has(role) ? role : 'grid');
/** Generic display only. The host supplies measured values and calculated directed flows. */
export function energyFlow({nodes,flows=[],label='Energiefluss',animated=true}) {
  const positions={solar:[250,70],grid:[65,195],home:[435,195],battery:[250,320]};
  const paths={'solar-home':'M270 108 Q270 177 390 177','solar-grid':'M230 108 Q230 177 110 177','solar-battery':'M250 112 L250 278','grid-home':'M110 195 L390 195','battery-home':'M270 282 Q270 213 390 213','grid-battery':'M110 213 Q230 213 230 282'};
  const edges=Object.entries(paths).filter(([key])=>key.includes('battery')?nodes.some(n=>n.id==='battery'):true).map(([key,d])=>{
    const [from,to]=key.split('-');const flow=flows.find(f=>(f.from===from&&f.to===to)||(f.from===to&&f.to===from));
    const track = `<path class="fui-flow-track" d="${d}"/>`;
    const watts = flow?.value;
    if (!Number.isFinite(watts) || watts <= 0) return track;
    const reverse = flow.from === to;
    // Use the same watts-to-dots scale for each connection, regardless of its length.
    const dots = Math.min(8, Math.max(1, Math.ceil(Math.sqrt(watts / 225))));
    const motion = animated ? ` pathLength="100" style="--fui-flow-dot-step:${100 / dots};--fui-flow-dot-duration:${5 / dots}s"` : '';
    return track + `<path class="fui-flow-line ${roleClass(flow.role||flow.from)}${animated?' animated':''}${reverse?' reverse':''}" d="${d}"${motion}/>`;
  }).join('');
  return `<div class="fui-energy-flow" role="group" aria-label="${escapeHtml(label)}"><svg viewBox="0 0 500 390" aria-hidden="true" focusable="false">${edges}</svg>${nodes.map(n=>{
    const [x,y]=positions[n.id]||positions.home;
    return `<button type="button" class="fui-energy-node ${roleClass(n.id)}" style="--node-x:${x/5}%;--node-y:${y/3.9}%" data-action="energy-node" data-node="${escapeHtml(n.id)}" aria-label="${escapeHtml([n.label,n.value,n.detail].filter(Boolean).join(', '))}"><span class="fui-energy-circle">${n.badge?`<small>${escapeHtml(n.badge)}</small>`:''}${icon('energy-'+n.id)}<strong>${escapeHtml(n.value??'—')}</strong>${n.detail?`<small>${escapeHtml(n.detail)}</small>`:''}</span><span class="fui-energy-label">${escapeHtml(n.label)}</span></button>`;
  }).join('')}</div>`;
}

/** Numeric x coordinates; null points break lines. Interactive legends are controlled by the caller. */
export function seriesChart({id,title,series,unit='',kind='line',min,max,formatX=String,formatValue=v=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:2}),width=700,legendAction,legendLabel='Datenreihen',integerTicks=false}) {
  const heading = `<h3>${escapeHtml(title)}${unit ? ` <small>${escapeHtml(unit)}</small>` : ''}</h3>`;
  const legend = legendAction
    ? `<div class="fui-chart-legend fui-chart-legend-interactive" role="group" aria-label="${escapeHtml(legendLabel)}">${series.map((item, index) => {
        const label = escapeHtml(item.label);
        const valueId = `${escapeHtml(id)}-legend-value-${index}`;
        const hasValue = item.legendValue != null;
        const description = hasValue ? ` aria-describedby="${valueId}"` : '';
        const value = hasValue ? `<small id="${valueId}">${escapeHtml(item.legendValue)}</small>` : '';
        return `<button type="button" class="fui-chart-legend-button ${roleClass(item.role)}" data-action="${escapeHtml(legendAction)}" data-series="${escapeHtml(item.id)}" aria-pressed="${!item.hidden}" aria-label="${label}"${description}><i aria-hidden="true"></i><span>${label}${value}</span></button>`;
      }).join('')}</div>`
    : `<div class="fui-chart-legend">${series.map(item => `<span><i class="${roleClass(item.role)}"></i>${escapeHtml(item.label)}</span>`).join('')}</div>`;
  if (legendAction) {
    series = series.filter(item => !item.hidden);
    if (!series.length) {
      return `<section class="fui-series-chart" id="${escapeHtml(id)}">${heading}${legend}${notice('Wähle mindestens eine Datenreihe aus.')}</section>`;
    }
  }
  width=Math.max(280,Math.min(1000,Number(width)||700));const plotWidth=width-80;
  const times=[...new Set(series.flatMap(s=>s.points.map(p=>p.x)))].filter(Number.isFinite).sort((a,b)=>a-b);
  const values=series.flatMap(s=>s.points.map(p=>p.y)).filter(v=>typeof v==='number'&&Number.isFinite(v));
  let low=min??Math.min(0,...values),high=max??Math.max(1,...values);
  let tickValues;
  if (integerTicks) {
    const targetStep = Math.max(1, (high - low) / 3);
    const magnitude = 10 ** Math.floor(Math.log10(targetStep));
    const step = [1, 2, 5, 10].find(value => value * magnitude >= targetStep) * magnitude;
    low = Math.floor(low / step) * step;
    high = Math.max(low + step, Math.ceil(high / step) * step);
    tickValues = Array.from({length: 1 + (high - low) / step}, (_, i) => low + i * step);
  } else {
    tickValues = [0, 1, 2, 3].map(i => low + (high - low || 1) * i / 3);
  }
  const range = high - low || 1;
  const first = times[0] ?? 0;
  const span = (times.at(-1) ?? first) - first;
  let band = 0;
  if (kind === 'bar') {
    // Leave half a group at either end. Use the closest timestamps so groups
    // stay separate even when some intervals are missing.
    const shortestInterval = times.slice(1).reduce((shortest, t, i) => Math.min(shortest, t - times[i]), span);
    band = span > 0 ? plotWidth / (span / shortestInterval + 1) : plotWidth;
  }
  const inset = band / 2;
  const x = t => 52 + inset + (t - first) / (span || 1) * (plotWidth - band);
  const y=v=>220-(v-low)/range*180;
  const chartData={width,plotWidth,inset,times,labels:times.map(formatX),unit,series:series.map(s=>({label:s.label,role:roleClass(s.role),values:times.map(t=>{const v=s.points.find(p=>p.x===t)?.y;return typeof v==='number'&&Number.isFinite(v)?formatValue(v):null;})}))};
  const ticks=tickValues.map(v=>{const yy=y(v);return `<line class="fui-chart-grid" x1="52" x2="${width-28}" y1="${yy}" y2="${yy}"/><text x="46" y="${yy+4}" text-anchor="end">${escapeHtml(integerTicks ? v.toLocaleString('de-DE') : formatValue(v))}</text>`;}).join('')+
    (kind === 'bar' && low < 0 && high > 0 ? `<line class="fui-chart-zero" x1="52" x2="${width-28}" y1="${y(0)}" y2="${y(0)}"/>` : '');
  const marks=series.map((s,si)=>{
    const points=times.map(t=>({x:t,y:s.points.find(p=>p.x===t)?.y}));
    const cls=roleClass(s.role);
    if(kind==='bar'){
      const barWidth = Math.min(28, band * .75 / series.length);
      const baseline = y(0);
      return points.filter(p => typeof p.y === 'number' && Number.isFinite(p.y)).map(p =>
        `<rect class="fui-chart-bar ${cls}" x="${x(p.x)+(si-series.length/2)*barWidth}" y="${Math.min(baseline,y(p.y))}" width="${barWidth}" height="${Math.abs(y(p.y)-baseline)}"/>`
      ).join('');
    }
    let d='',pen=false;for(const p of points){if(typeof p.y!=='number'||!Number.isFinite(p.y)){pen=false;continue;}d+=`${pen?'L':'M'}${x(p.x)},${y(p.y)} `;pen=true;}
    return `<path class="fui-chart-line ${cls}" d="${d}"/>`+points.filter(p=>typeof p.y==='number'&&Number.isFinite(p.y)).map(p=>`<circle class="fui-chart-dot ${cls}" cx="${x(p.x)}" cy="${y(p.y)}" r="2"/>`).join('');
  }).join('');
  const indices=times.length?[...new Set([0,Math.floor((times.length-1)/2),times.length-1])]:[];
  return `<section class="fui-series-chart" id="${escapeHtml(id)}" style="--chart-rows:${series.length}" data-chart-index="${Math.max(0,times.length-1)}" data-chart="${escapeHtml(JSON.stringify(chartData))}">${heading}${legend}<div class="fui-chart-inspector" aria-live="polite">${values.length?`<strong>${escapeHtml(chartData.labels.at(-1))}</strong><div class="fui-chart-values">${chartData.series.map(s=>`<span>${escapeHtml(s.label)}</span><span>${escapeHtml(s.values.at(-1)===null?'—':s.values.at(-1)+' '+unit)}</span>`).join('')}</div>`:'Keine historischen Werte für diesen Zeitraum vorhanden.'}</div><svg class="fui-chart-svg" viewBox="0 0 ${width} 264" role="group" aria-label="${escapeHtml(title+' – Pfeiltasten für Einzelwerte')}" tabindex="0">${ticks}${marks}${indices.map(i=>`<text x="${x(times[i])}" y="248" text-anchor="${i===0?'start':i===times.length-1?'end':'middle'}">${escapeHtml(formatX(times[i]))}</text>`).join('')}<line class="fui-chart-cursor" x1="52" x2="52" y1="32" y2="220" hidden/><rect class="fui-chart-hit" x="52" y="32" width="${plotWidth}" height="188"/></svg></section>`;
}

/** Bind once per ShadowRoot, cleanup on disconnect. The inspector stays above the plot. */
export function bindSeriesCharts(root) {
  function inspect(chart,index){
    const data=JSON.parse(chart.dataset.chart);if(!data.times.length)return;
    index=Math.max(0,Math.min(data.times.length-1,index));chart.dataset.chartIndex=String(index);
    chart.querySelector('.fui-chart-inspector').innerHTML=`<strong>${escapeHtml(data.labels[index])}</strong><div class="fui-chart-values">${data.series.map(s=>`<span>${escapeHtml(s.label)}</span><span>${escapeHtml(s.values[index]===null?'—':s.values[index]+' '+data.unit)}</span>`).join('')}</div>`;
    const cursor=chart.querySelector('.fui-chart-cursor'),times=data.times;
    const inset = data.inset ?? 0;
    const xx=52+inset+(times[index]-times[0])/(times.at(-1)-times[0]||1)*(data.plotWidth-2*inset);
    cursor.removeAttribute('hidden');cursor.setAttribute('x1',xx);cursor.setAttribute('x2',xx);
  }
  function pointer(event){
    const svg=event.target.closest?.('.fui-chart-svg');if(!svg)return;
    const chart=svg.closest('[data-chart]'),data=JSON.parse(chart.dataset.chart);if(!data.times.length)return;
    const box = svg.getBoundingClientRect();
    const inset = data.inset ?? 0;
    const plotWidth = data.plotWidth - 2 * inset;
    const offset = (event.clientX - box.left) / box.width * data.width - 52 - inset;
    const fraction = plotWidth > 0 ? Math.max(0, Math.min(1, offset / plotWidth)) : 0;
    const t = data.times[0] + fraction * (data.times.at(-1) - data.times[0]);
    let index=0;data.times.forEach((v,i)=>{if(Math.abs(v-t)<Math.abs(data.times[index]-t))index=i;});inspect(chart,index);
    if(event.type==='pointerdown')svg.setPointerCapture?.(event.pointerId);
  }
  function keyboard(event){const chart=event.target.closest?.('[data-chart]');if(!chart||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const data=JSON.parse(chart.dataset.chart),i=Number(chart.dataset.chartIndex||0);inspect(chart,event.key==='Home'?0:event.key==='End'?data.times.length-1:i+(event.key==='ArrowRight'?1:-1));}
  root.addEventListener('pointermove',pointer);root.addEventListener('pointerdown',pointer);root.addEventListener('keydown',keyboard);
  return ()=>{root.removeEventListener('pointermove',pointer);root.removeEventListener('pointerdown',pointer);root.removeEventListener('keydown',keyboard);};
}
