import {test} from 'node:test';
import assert from 'node:assert/strict';
import {radarBackground,radarLegend,RADAR_SCALE,radarMap,navigation,ICON_NAMES} from '../dist/family-ui.js';
const frames=[{time:1795089600,kind:'observation'},{time:1795089900,kind:'prediction'}];
test('radar keeps observation and prediction explicit with accessible controls',()=>{
  const first=radarMap({frames,index:0,now:1795089600});
  assert.match(first,/Messung/);assert.match(first,/aria-label="Radar abspielen"/);assert.match(first,/aria-label="Vorheriges Radarbild"[^>]*disabled/);
  assert.match(first,/type="range".*max="1"/);assert.match(first,/2 Stunden Rückblick · 1 Stunde Vorhersage/);
  const second=radarMap({frames,index:1,playing:true});assert.match(second,/Vorhersage/);assert.match(second,/aria-label="Radar anhalten"/);
});
test('radar escapes error text and rejects executable or non-image sources',()=>{
  const html=radarMap({error:'<script>alert(1)</script>',baseImage:'javascript:alert(1)',radarImage:'data:text/html,hi',legendImage:'//evil.test/img'});
  assert.doesNotMatch(html,/<script|src="javascript|src="data:text|src="\/\//);assert.match(html,/&lt;script/);
  assert.match(radarMap({radarImage:'data:image/png;base64,AAAA'}),/src="data:image\/png;base64,AAAA"/);
});
test('weather tabs share local icons with readable labels and tooltips',()=>{
  for(const name of ['weather','warning','radar','wind','temperature','illuminance'])assert(ICON_NAMES.includes(name));
  const html=navigation({items:[{id:'radar',label:'Regenradar',icon:'radar'}],active:'radar'});
  assert.match(html,/aria-label="Regenradar"/);assert.match(html,/title="Regenradar"/);assert.match(html,/data-icon="radar"/);
});

const svg=src=>Buffer.from(src.split(',')[1],'base64').toString('utf8');
test('local background is a small standalone image with capped escaped labels',()=>{
  const src=radarBackground({lines:[{kind:'river',points:[[0,0],[512,512]]}],places:Array.from({length:8},(_,i)=>({x:i*40,y:50,name:'Böhl <script>'+i}))});
  const image=svg(src);assert.equal((image.match(/<text /g)||[]).length,4);assert.match(image,/Böhl &lt;script&gt;/);assert.doesNotMatch(image,/<script|href=|onload|foreignObject/);
  assert(src.length<3000);assert.throws(()=>radarBackground({lines:[{kind:'river',points:[[NaN,0]]}]}));
  assert.match(radarMap({baseImage:src}),/src="data:image\/svg\+xml;base64,/);
});
test('local legend and renderer share one strictly increasing scale',()=>{
  assert(RADAR_SCALE.every((item,i)=>/^#[0-9a-f]{6}$/i.test(item.color)&&(!i||item.min>RADAR_SCALE[i-1].min)));
  const image=svg(radarLegend());assert.equal((image.match(/mm\/h/g)||[]).length,RADAR_SCALE.length);assert.match(image,/keine Radardaten/);
});

test('cold loading shows a location-ready map without invented forecast labels',()=>{const html=radarMap({baseImage:radarBackground()});assert.match(html,/Radardaten laden/);assert.doesNotMatch(html,/>Vorhersage<|>Messung</);assert.match(html,/aria-label="Dein Standort"/);});
