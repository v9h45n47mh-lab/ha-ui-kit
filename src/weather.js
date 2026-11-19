import {escapeHtml} from './components.js';

/** Original, local vector illustrations. WMO codes come from the host, never a network lookup. */
export const WEATHER_GRAPHICS = Object.freeze(['clear','partly-cloudy','cloudy','fog','rain','showers','snow','sleet','thunder','hail','thermometer','unknown']);
function weatherType(code) {
  if (code === 0) return 'clear';
  if ([1,2].includes(code)) return 'partly-cloudy';
  if (code === 3) return 'cloudy';
  if ([45,48].includes(code)) return 'fog';
  if ([51,53,55,61,63,65].includes(code)) return 'rain';
  if ([56,57,66,67].includes(code)) return 'sleet';
  if ([71,73,75,77,85,86].includes(code)) return 'snow';
  if ([80,81,82].includes(code)) return 'showers';
  if (code === 95) return 'thunder';
  if ([96,99].includes(code)) return 'hail';
  return 'unknown';
}
export function weatherGraphic({code=null,kind,isDay=true,windy=false,label=''}={}) {
  const type=kind || weatherType(code);
  if (!WEATHER_GRAPHICS.includes(type)) throw new TypeError('Unknown weather graphic');
  const sun='<g fill="none" stroke="#e8a51b" stroke-width="2.4" stroke-linecap="round"><path d="M40 8V3m0 47v5M18 29h-5m49 0h5M24 13l-4-4m36 36 4 4M24 45l-4 4m36-36 4-4"/><circle cx="40" cy="29" r="14" fill="#ffd467"/></g>';
  const moon='<path d="M47 6a23 23 0 1 0 21 34C44 44 35 22 47 6Z" fill="#9db2dc" stroke="#768ebd" stroke-width="1.6"/>';
  const sky=isDay?sun:moon;
  const cloud='<path d="M25 52C8 52 8 30 24 29c3-17 28-20 36-4 20-5 31 24 10 27Z" fill="#e1f2fb" stroke="#a3d0e6" stroke-width="1.5"/>';
  const drops='<g stroke="#46acd9" stroke-width="3" stroke-linecap="round"><path d="m29 61-3 6m19-6-3 6m19-6-3 6"/></g>';
  const snow='<g stroke="#70a9cb" stroke-width="1.5" stroke-linecap="round"><path d="M29 59v12m-5-9 10 6m0-6-10 6M56 59v12m-5-9 10 6m0-6-10 6"/></g>';
  let drawing='';
  if(type==='clear')drawing=`<g transform="translate(8 5)">${sky}</g>`;
  if(['partly-cloudy','showers'].includes(type))drawing=`<g transform="translate(0 -1) scale(.92)">${sky}</g>${cloud}`+(type==='showers'?drops:'');
  if(['cloudy','rain','snow','sleet','thunder','hail','fog'].includes(type))drawing=cloud;
  if(type==='rain')drawing+=drops;
  if(type==='snow')drawing+=snow;
  if(type==='sleet')drawing+='<path d="m28 59-3 7" stroke="#46acd9" stroke-width="3" stroke-linecap="round"/>'+snow.replace('M29 59v12m-5-9 10 6m0-6-10 6','');
  if(['thunder','hail'].includes(type))drawing+='<path d="m48 46-12 17h10l-5 12 20-22H49l5-7" fill="#f3bb36" stroke="#dfa328" stroke-linejoin="round"/>'+(type==='hail'?'<g fill="#78b9d8"><circle cx="25" cy="64" r="3"/><circle cx="69" cy="64" r="3"/></g>':'');
  if(type==='fog')drawing+='<path d="M14 58h56M23 65h50M17 72h44" stroke="#9bb0bb" stroke-width="3" stroke-linecap="round"/>';
  if(type==='thermometer')drawing='<circle cx="48" cy="39" r="31" fill="#eef8ff"/><path d="M39 46V17a9 9 0 0 1 18 0v29a16 16 0 1 1-18 0Z" fill="#fff" stroke="#79b9dc" stroke-width="2.4"/><path d="M48 29v28" stroke="#2594ca" stroke-width="5" stroke-linecap="round"/><circle cx="48" cy="59" r="8" fill="#2594ca"/><path d="M61 21h7m-7 10h4m-4 10h7" stroke="#79b9dc" stroke-width="2" stroke-linecap="round"/>';
  if(type==='unknown')drawing='<circle cx="48" cy="39" r="25" fill="#f2f5f7" stroke="#c5d3db"/><path d="M40 30a8 8 0 1 1 12 7c-4 2-4 5-4 7m0 7v1" fill="none" stroke="#8b9faa" stroke-width="3" stroke-linecap="round"/>';
  if(windy&&type!=='thermometer'&&type!=='unknown')drawing+='<g fill="none" stroke="#7e9cae" stroke-width="2" stroke-linecap="round"><path d="M65 12h15c10 0 8 11 2 9M72 27h12c9 0 8 10 1 9"/></g>';
  return `<svg class="fui-weather-graphic" data-weather-graphic="${type}" viewBox="0 0 96 80" focusable="false"${label?` role="img" aria-label="${escapeHtml(label)}"`:' aria-hidden="true"'}>${drawing}</svg>`;
}

const WEATHER_METRIC_PATHS={
  rain:'<path d="M3 12a9 9 0 0 1 18 0H3Zm9-9v17c0 3 4 3 4 0M6 16l-1 2m14-2-1 2"/>',
  wind:'<path d="M3 8h12c6 0 6-6 2-6M3 12h16c5 0 5 7 0 7M3 16h7c5 0 5 6 0 6"/>',
  feels:'<path d="M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z"/>',
  humidity:'<path d="M12 2S4 11 4 16a8 8 0 0 0 16 0c0-5-8-14-8-14Z"/><path d="m9 18 6-6m-6 0h.01m6 6h.01"/>',
  pressure:'<circle cx="12" cy="12" r="9"/><path d="m12 12 4-5M6 12h1m5-6v1m5 5h1m-9 5h6"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  temperature:'<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM12 7v11"/>'
};
export function weatherMetricIcon(name) {
  if(!Object.hasOwn(WEATHER_METRIC_PATHS,name))throw new TypeError('Unknown weather metric');
  return `<svg class="fui-weather-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${WEATHER_METRIC_PATHS[name]}</svg>`;
}
function weatherMetrics(metrics) {
  return `<dl class="fui-weather-metrics">${metrics.map(m=>`<div><dt>${weatherMetricIcon(m.icon)}<span>${escapeHtml(m.label)}</span></dt><dd>${escapeHtml(m.value??'—')}${m.detail?`<small>${escapeHtml(m.detail)}</small>`:''}</dd></div>`).join('')}</dl>`;
}
/** Inputs are already formatted. No meteorology, aggregation or sample inference belongs to the kit. */
export function weatherPeriod({id='',time,kind='forecast',temperature='—',temperatureLabel='',range='',condition='',graphic={},metrics=[],start,end}={}) {
  if(!['actual','forecast'].includes(kind))throw new TypeError('Unknown weather source');
  const bounds=[['start',start],['end',end]].filter(([,v])=>Number.isFinite(v)).map(([k,v])=>` data-${k}="${v}"`).join('');
  return `<li${id?` id="${escapeHtml(id)}"`:''} class="fui-weather-period is-${kind}" data-weather-kind="${kind}"${bounds}><div class="fui-weather-time">${escapeHtml(time)}</div><small class="fui-weather-source">${kind==='actual'?'Gemessen':'Vorhersage'}</small>${weatherGraphic(graphic)}<div class="fui-weather-temperature"><strong>${escapeHtml(temperature)}</strong></div><small class="fui-weather-temperature-label">${escapeHtml(temperatureLabel)}</small><div class="fui-weather-range">${escapeHtml(range)}</div><p class="fui-weather-condition">${escapeHtml(condition)}</p>${weatherMetrics(metrics)}</li>`;
}
export function weatherStrip({items=[],label='Wetter im 3-Stunden-Takt'}={}) {
  return `<div class="fui-weather-strip" role="region" aria-label="${escapeHtml(label)}" tabindex="0"><ul class="fui-weather-periods">${items.map(weatherPeriod).join('')}</ul></div>`;
}
/** Natural page scrolling, including current readings as a regular item. No nested scroll surface. */
export function weatherList({items=[],label='Wetter im 3-Stunden-Takt'}={}) {
  return `<div class="fui-weather-list" role="region" aria-label="${escapeHtml(label)}"><ul class="fui-weather-list-items">${items.map(weatherPeriod).join('')}</ul></div>`;
}
export function weatherNow({id='',label='Jetzt',temperature='—',range='',metrics=[]}={}) {
  return `<div${id?` id="${escapeHtml(id)}"`:''} class="fui-weather-now is-actual" data-weather-kind="actual"><div><span>${escapeHtml(label)}</span><strong>${escapeHtml(temperature)}</strong><small>${escapeHtml(range)}</small></div>${weatherMetrics(metrics)}</div>`;
}
