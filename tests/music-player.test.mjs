import test from 'node:test';
import assert from 'node:assert/strict';
import {musicPlayerHeader,musicTransport,musicFavoriteTile,musicActionButton,musicArtwork,MUSIC_PLAYER_CSS} from '../dist/family-ui.js';
test('music objects escape text, keep icon-only favorites accessible and share canonical media icons',()=>{
 const hostile='\"><script>alert(1)</script>';
 assert(!musicPlayerHeader({title:hostile,speaker:hostile}).includes('<script>'));
 const tile=musicFavoriteTile({label:'Mein Sender',data:{index:2}});assert.match(tile,/aria-label="Mein Sender abspielen"/);assert.match(tile,/title="Mein Sender"/);assert(!tile.includes('<span>Mein Sender</span>'));assert.match(tile,/data-icon="media-music"/);
 assert(!musicArtwork({src:'javascript:alert(1)'}).includes('<img'));
 assert.match(musicActionButton({label:'Star',action:'star',icon:'star',pressed:false}),/aria-pressed="false"/);
 assert(!musicActionButton({label:'Star',action:'star',icon:'star',pressed:false}).includes('ui-icon filled'));
});
test('music header has a hidden label, left speaker selector and canonical settings icon',()=>{
 const html=musicPlayerHeader({speakerSelect:{id:'speaker',value:'bed',options:[{value:'bed',label:'Sonos Schlafzimmer'}]}});
 assert.match(html,/class="visually-hidden">Box/);assert.match(html,/aria-label="Box"/);assert.match(html,/data-icon="settings"/);assert(html.indexOf('fui-player-speaker')<html.indexOf('fui-player-settings'));
 assert(!html.includes('Beta'));assert.match(MUSIC_PLAYER_CSS,/\.fui-player-speaker\{width:190px/);
});
test('player transport icons use equal width and height with circular hover geometry',()=>{
 const html=musicTransport({controls:[{label:'Play',action:'play-pause',icon:'play'},{label:'Weiter',action:'next',icon:'next'}]});
 assert.match(html,/fui-music-play/);assert.match(html,/data-icon="media-next"/);assert.equal(musicTransport(), '');
 assert.match(MUSIC_PLAYER_CSS,/width:48px;height:48px;[^}]*border-radius:50%/);assert.match(MUSIC_PLAYER_CSS,/width:56px;height:56px/);
});

test('compact speaker size and hidden speaker name remain optional presentation only',()=>{
 const header=musicPlayerHeader({speakerSelect:{id:'box',value:'bed',compact:true,options:[{value:'bed',label:'Schlafzimmer'}]}});assert.match(header,/fui-player-speaker-compact/);
 const hidden=musicPlayerHeader({speaker:'Paul',hideSpeaker:true});assert(!hidden.includes('fui-player-name'));assert(!hidden.includes('Paul'));assert.match(hidden,/data-icon="settings"/);
 assert.match(MUSIC_PLAYER_CSS,/\.fui-player-speaker-compact\{width:150px/);
});
