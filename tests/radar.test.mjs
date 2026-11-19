import {test} from 'node:test';
import assert from 'node:assert/strict';
import {radarMap,navigation,ICON_NAMES} from '../dist/family-ui.js';
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
