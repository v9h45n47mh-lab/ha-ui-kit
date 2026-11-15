import {test} from 'node:test';
import assert from 'node:assert/strict';
import {userAccessRow} from '../dist/family-ui.js';

test('user access row uses shared controls, hidden labels and escaped values',()=>{
  const html=userAccessRow({id:'test',title:'<img src=x onerror=alert(1)>',description:'<script>bad</script>',value:'family',options:[{value:'family',label:'Familie'}],enabled:true});
  assert.ok(!html.includes('<img')&&!html.includes('<script>'));
  assert.match(html,/fui-user-access/);
  assert.match(html,/data-user="test"/);
  assert.match(html,/aria-checked="true"/);
  assert.match(html,/visually-hidden/);
});

test('administrator row has no editable role or switch',()=>{
  const html=userAccessRow({id:'admin',title:'Manuel',admin:true});
  assert.ok(!html.includes('<select')&&!html.includes('role="switch"'));
  assert.match(html,/Vollzugriff/);
  assert.match(html,/data-icon="lock"/);
});

test('disabled controls preserve selected role and empty descriptions work',()=>{
  const html=userAccessRow({id:'test',title:'Test',disabled:true,value:'family',options:[{value:'family',label:'Familie'}]});
  assert.match(html,/<select[^>]* disabled/);
  assert.match(html,/<button[^>]* disabled/);
  assert.match(html,/value="family" selected/);
  assert.throws(()=>userAccessRow({id:'bad id',title:'Test'}));
});
