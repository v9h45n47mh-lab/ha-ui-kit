import {button,iconButton,selectField,escapeHtml} from './components.js';
import {icon} from './icons.js';

/** Presentation only. Authorization, account and speaker selection remain in the application. */
export function musicActionButton({label,action,icon:mediaIcon,disabled=false,data={},pressed}) {
  let markup=iconButton({label,action,icon:'media-'+mediaIcon,disabled,data});
  if(pressed!==undefined)markup=markup.replace('<button ',`<button aria-pressed="${Boolean(pressed)}" `);
  if(mediaIcon==='star'&&pressed===false)markup=markup.replace('ui-icon filled','ui-icon');
  return markup;
}
export function musicArtwork({src='',kind='music'}={}) {
  let safe='';try{const url=new URL(src,'https://home-assistant.local');if(src&&['http:','https:'].includes(url.protocol)&&!url.username&&!url.password)safe=src;}catch{}
  return `<span class="fui-music-artwork" aria-hidden="true">${icon(kind==='radio'?'media-radio':'media-music')}${safe?`<img src="${escapeHtml(safe)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}</span>`;
}
export function musicPlayerHeader({title='',description='',speaker='',speakerSelect=null,artwork='',radio=false,hideSpeaker=false,settingsAction='player-settings',disabled=false}) {
  const choice=hideSpeaker?'<span aria-hidden="true"></span>':speakerSelect?`<div class="fui-player-speaker${speakerSelect.compact?' fui-player-speaker-compact':''}">${selectField({id:speakerSelect.id,label:'Box',hideLabel:true,value:speakerSelect.value,options:speakerSelect.options,disabled:disabled||speakerSelect.disabled}).replace('<select ', '<select aria-label="Box" ')}</div>`:`<span class="fui-player-name" aria-label="Box">${escapeHtml(speaker)}</span>`;
  const settings=iconButton({label:'Einstellungen',icon:'settings',action:settingsAction,disabled}).replace('class="edit-button"','class="edit-button fui-player-settings"');
  return `<div class="fui-player-toolbar">${choice}${settings}</div><div class="fui-player-heading">${musicArtwork({src:artwork,kind:radio?'radio':'music'})}<div><h3>${escapeHtml(title)}</h3><small>${escapeHtml(description)}</small></div></div>`;
}
export function musicTransport({controls=[]}={}) {
  if(!controls.length)return '';
  return `<div class="fui-music-transport" aria-label="Wiedergabe">${controls.map(control=>{let markup=musicActionButton(control);if(control.action==='play-pause')markup=markup.replace('class="edit-button"','class="edit-button fui-music-play"');return markup;}).join('')}</div>`;
}
export function musicFavoriteTile({label,action='play-favorite',data={},artwork='',kind='music',disabled=false}) {
  return button({label,action,data,disabled}).replace('class=""','class="fui-music-favorite"').replace('<button ',`<button aria-label="${escapeHtml(label+' abspielen')}" title="${escapeHtml(label)}" `).replace(`<span>${escapeHtml(label)}</span>`,musicArtwork({src:artwork,kind}));
}
