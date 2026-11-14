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
  assert.equal(UI_VERSION,'1.5.1');
  assert.throws(()=>icon('toString'));
  assert.throws(()=>iconButton({icon:'edit',action:'edit'}));
  const nav=navigation({label:'Card',items:[{id:'overview',label:'Overview'}],active:'settings'});
  assert.equal((nav.match(/data-icon="settings"/g)||[]).length,1);
  assert.match(nav,/aria-current="page"/);
  assert.match(icon('settings'),/filled/);
  assert.match(icon('sunrise'),/M12 9V2/);
});

test('program controls use source text glyphs, escaped IDs and correct ordering boundaries',()=>{
  const add = programAddButton();
  assert.match(add,/>\+ Programm<\/button>/);
  assert.ok(!add.includes('<svg'));
  assert.match(programAddButton({label:'Program',action:'create',data:{kind:'time'},disabled:true}),/data-action="create" data-kind="time" disabled>\+ Program/);
  const first = programOrderButtons({programId:'a"<b',index:0,count:3});
  assert.match(first,/data-program="a&quot;&lt;b"/);
  assert.match(first,/data-direction="up"[^>]*disabled>↑/);
  assert.match(first,/data-direction="down"[^>]*>↓/);
  assert.equal((first.match(/ disabled/g)||[]).length,1);
  assert.ok(!first.includes('<svg'));
  const last = programOrderButtons({programId:'a',index:2,count:3});
  assert.match(last,/data-direction="down"[^>]*disabled>↓/);
  assert.equal((programOrderButtons({programId:'a',index:0,count:1}).match(/ disabled/g)||[]).length,2);
  assert.equal((programOrderButtons({programId:'a',index:1,count:3,disabled:true}).match(/ disabled/g)||[]).length,2);
  const translated = programOrderButtons({programId:'a',index:1,count:3,upLabel:'Move up',downLabel:'Move down',action:'reorder',desktopOnly:false});
  assert.match(translated,/data-action="reorder"/);
  assert.match(translated,/aria-label="Move up"/);
  assert.ok(!translated.includes('desktop-only'));
  assert.throws(()=>programOrderButtons({programId:'a',index:-1,count:3}));
  assert.throws(()=>programOrderButtons({programId:'a',index:3,count:3}));
  assert.throws(()=>programOrderButtons({programId:'a',index:0,count:0}));
});

test('vendored release is pinned and altered files are detected',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'family-ui-'));
  const run=(...args)=>execFileSync(process.execPath,['scripts/vendor.mjs','--target',target,...args],{cwd:new URL('../',import.meta.url),stdio:'pipe'});
  try{
    run(); run('--check');
    const lock=JSON.parse(await readFile(path.join(target,'family-ui.lock.json'),'utf8'));
    assert.equal(lock.module,'./family-ui/1.5.1/family-ui.js');
    await writeFile(path.join(target,'family-ui/1.5.1/family-ui.js'),'changed');
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
