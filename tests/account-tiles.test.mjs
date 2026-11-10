import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountTile,accountTiles} from '../dist/family-ui.js';

test('account tiles expose names, values and details without interpreting account data',()=>{
  const tile=accountTile({id:'paul',label:'Paul',value:0,unit:'min',status:'offen',description:'10 min warten auf Freigabe',details:'Zugewiesen 15 · Erledigt 5'});
  assert.match(tile,/aria-labelledby="paul-label"/);assert.match(tile,/aria-describedby="paul-details"/);
  assert.match(tile,/fui-account-value">0<\/strong>/);assert.match(tile,/min offen/);assert.match(tile,/Zugewiesen 15/);
  assert.match(accountTiles({content:tile}),/class="fui-account-tiles" role="group" aria-label="Zeitkonten"/);
  assert.throws(()=>accountTile({id:'bad id',label:'Paul',value:5}),TypeError);
  assert.throws(()=>accountTile({id:'paul',state:'custom',value:5}),TypeError);
});

test('all account text and identifiers are escaped',()=>{
  const tile=accountTile({id:'a"b',label:'<img src=x>',value:'<script>',unit:'"min',status:'<open>',description:'<svg>',details:'" onmouseover="x',state:'success'});
  assert.ok(!tile.includes('<img')&&!tile.includes('<script>')&&!tile.includes('<svg>'));
  assert.match(tile,/&lt;img src=x&gt;/);assert.match(tile,/id="a&quot;b"/);
  assert.match(tile,/class="fui-account-tile success"/);
});
