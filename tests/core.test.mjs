import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {escapeHtml, icon, iconButton, section, row, navigation, field, UI_VERSION} from '../dist/family-ui.js';

test('untrusted labels, values and attributes cannot inject markup',()=>{
  const value='\"><img src=x onerror=alert(1)> & \'quoted\'';
  for(const output of [row({title:value}),field({id:value,label:value,value}),iconButton({icon:'edit',label:value,action:value,data:{id:value}}),section({id:'safe',title:value})]){
    assert.ok(!output.includes('<img'));
    assert.ok(output.includes('&lt;img'));
  }
  assert.equal(escapeHtml(null),'');
  assert.throws(()=>iconButton({icon:'edit',label:'Edit',action:'edit',data:{'id onclick':'bad'}}));
  assert.throws(()=>iconButton({icon:'edit',label:'Edit',action:'edit',data:{action:'override'}}));
});

test('one canonical settings icon and accessible navigation',()=>{
  assert.equal(UI_VERSION,'1.0.0');
  assert.throws(()=>icon('toString'));
  assert.throws(()=>iconButton({icon:'edit',action:'edit'}));
  const nav=navigation({label:'Card',items:[{id:'overview',label:'Overview'}],active:'settings'});
  assert.equal((nav.match(/data-icon="settings"/g)||[]).length,1);
  assert.match(nav,/aria-current="page"/);
  assert.match(icon('settings'),/filled/);
  assert.match(icon('sunrise'),/M12 9V2/);
});

test('vendored release is pinned and altered files are detected',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'family-ui-'));
  const run=(...args)=>execFileSync(process.execPath,['scripts/vendor.mjs','--target',target,...args],{cwd:new URL('../',import.meta.url),stdio:'pipe'});
  try{
    run(); run('--check');
    const lock=JSON.parse(await readFile(path.join(target,'family-ui.lock.json'),'utf8'));
    assert.equal(lock.module,'./family-ui/1.0.0/family-ui.js');
    await writeFile(path.join(target,'family-ui/1.0.0/family-ui.js'),'changed');
    assert.throws(()=>run('--check'));
    assert.throws(()=>run());
  }finally{await rm(target,{recursive:true,force:true});}
});
