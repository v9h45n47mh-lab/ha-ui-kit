import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {escapeHtml, icon, iconButton, section, row, navigation, field, programAddButton, programOrderButtons, toggle, programRow, button, actionRow, ICON_NAMES, UI_VERSION} from '../dist/family-ui.js';

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
  assert.match(UI_VERSION,/^1\.9\.\d+$/);
  assert.throws(()=>icon('toString'));
  assert.throws(()=>iconButton({icon:'edit',action:'edit'}));
  const nav=navigation({label:'Card',items:[{id:'overview',label:'Overview'}],active:'settings'});
  assert.equal((nav.match(/data-icon="settings"/g)||[]).length,1);
  assert.match(nav,/aria-current="page"/);
  assert.match(icon('settings'),/filled/);
  assert.match(icon('sunrise'),/M12 9V2/);
});

test('ordering uses one accessible drag handle without arrow buttons',()=>{
  assert.match(programAddButton(),/>\+ Programm<\/button>/);
  const handle=programOrderButtons({programId:'a"<b',index:0,count:3});
  assert.match(handle,/data-program="a&quot;&lt;b"/);
  assert.match(handle,/data-ui="order"/);assert.match(handle,/data-icon="drag"/);
  assert.equal((handle.match(/<button /g)||[]).length,1);
  assert.ok(!handle.includes('↑')&&!handle.includes('↓')&&!handle.includes('desktop-only'));
  assert.match(programOrderButtons({programId:'one',index:0,count:1}),/ disabled/);
  assert.match(programOrderButtons({programId:'a',index:1,count:3,disabled:true}),/ disabled/);
  assert.match(programOrderButtons({programId:'a',index:1,count:3,dragLabel:'Move',action:'reorder'}),/aria-label="Move"/);
  for(const [index,count] of [[-1,3],[3,3],[0,0]])assert.throws(()=>programOrderButtons({programId:'a',index,count}));
});

test('vendored release is pinned and altered files are detected',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'family-ui-'));
  const run=(...args)=>execFileSync(process.execPath,['scripts/vendor.mjs','--target',target,...args],{cwd:new URL('../',import.meta.url),stdio:'pipe'});
  try{
    run(); run('--check');
    const lock=JSON.parse(await readFile(path.join(target,'family-ui.lock.json'),'utf8'));
    assert.equal(lock.module,`./family-ui/${UI_VERSION}/family-ui.js`);
    await writeFile(path.join(target,`family-ui/${UI_VERSION}/family-ui.js`),'changed');
    assert.throws(()=>run('--check'));
    assert.throws(()=>run());
  }finally{await rm(target,{recursive:true,force:true});}
});

test('icon-only toggles preserve accessible labels and program rows use the shared variant',()=>{
  const label='Langes Programm aktiv';
  assert.match(toggle({label,action:'toggle',iconOnly:true}),/class="toggle icon-only"/);
  assert.match(toggle({label,action:'toggle',iconOnly:true}),/aria-label="Langes Programm aktiv"/);
  assert.ok(!toggle({label,action:'toggle'}).includes('icon-only'));
  assert.match(programRow({id:'long',title:'Langes Programm'}),/class="toggle on icon-only"/);
});

test('schedule icons are canonical, semantic and available to every integration',()=>{
  for(const name of ['skip-once','reschedule']){
    assert.ok(ICON_NAMES.includes(name));
    const svg=icon(name);
    assert.match(svg,new RegExp('data-icon="'+name+'"'));
    assert.match(svg,/viewBox="0 0 24 24" aria-hidden="true"/);
    assert.ok(!svg.includes('filled'));
    assert.match(iconButton({icon:name,label:'Schedule action',action:name}),/aria-label="Schedule action" title="Schedule action"/);
  }
});

test('compact action buttons are optional and preserve escaping and disabling',()=>{
  const normal=button({label:'Skip',action:'skip',variant:'primary'});
  assert.match(normal,/class="primary"/);assert.ok(!normal.includes('compact'));
  const compact=button({label:'Skip <once>',icon:'skip-once',action:'skip',variant:'primary',compact:true,disabled:true,data:{occurrence:'day:ride'}});
  assert.match(compact,/class="primary compact"/);
  assert.match(compact,/data-occurrence="day:ride" disabled/);
  assert.match(compact,/data-icon="skip-once"/);assert.match(compact,/Skip &lt;once&gt;/);
});

test('inline action groups are optional and keep default rows unchanged',()=>{
 const normal=actionRow({title:'Cover',actions:'buttons'});
 assert.ok(!normal.includes('inline-actions'));
 assert.match(actionRow({title:'Cover',actions:'buttons',inlineActions:true}),/class="toolbar ride-actions inline-actions"/);
});

test('skipped occurrences have a distinct shared state and restore symbol',()=>{
 assert.match(actionRow({title:'Skipped',skipped:true,inlineActions:true}),/class="ride skipped"/);
 assert.ok(!actionRow({title:'Active'}).includes('skipped'));
 assert.match(icon('restore-schedule'),/data-icon="restore-schedule"/);
 assert.notEqual(icon('restore-schedule'),icon('skip-once'));
});


test('navigation exposes a canonical refresh icon without changing default navigation',()=>{
  const nav=navigation({label:'Views',items:[{id:'one',label:'One'}],active:'one',actions:[{icon:'refresh',label:'Aktualisieren',action:'reload'}]});
  assert.match(nav,/fui-navigation-actions/);assert.match(nav,/data-icon="refresh"/);
  assert.equal((nav.match(/data-action="reload"/g)||[]).length,1);
  assert.match(nav,/aria-label="Aktualisieren"/);
  assert.ok(!navigation({label:'Views',items:[],active:''}).includes('fui-navigation-actions'));
});
