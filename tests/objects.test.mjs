import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as ui from '../dist/family-ui.js';

test('all audited object families have public render functions',()=>{
  const names=['combobox','multiSelect','checkboxGroup','weekdayPicker','programGroup','programRow','actionRow','actionEditor','foldControls','rangeControl','whiteTemperatureControl','colourPicker','timeWindow','seasonPicker','dateRange','recurrenceEditor','dateNavigation','weekCalendar','completionRow','dayAgenda','sensorOverview','historyList','groupedHistory','statusBadge','counter','statisticsTable','photoPicker','photoPreview','photoDialog','languagePicker','backupControls','helpContent','panelHeader','textareaField','numberControl','confirmDialog','feedback','formError','emptyState','loadingState','busyButton','bindGestures'];
  for(const name of names)assert.equal(typeof ui[name],'function',name);
});
test('composite controls escape labels, values, IDs and item descriptions',()=>{
  const hostile='\"><img src=x onerror=alert(1)> & \'text\'';
  const renderers=[()=>ui.combobox({id:'combo',label:hostile,items:[{id:hostile,label:hostile,description:hostile}]}),()=>ui.multiSelect({id:'multi',label:hostile,items:[{id:hostile,label:hostile,description:hostile,group:hostile}]}),()=>ui.programRow({id:'p',title:hostile,meta:[hostile]}),()=>ui.actionRow({title:hostile,description:hostile}),()=>ui.historyList({entries:[{title:hostile,time:hostile,description:hostile}]}),()=>ui.statisticsTable({columns:[{label:hostile}],rows:[[hostile]]}),()=>ui.textareaField({id:'text',label:hostile,value:hostile}),()=>ui.confirmDialog({id:'confirm',message:hostile}),()=>ui.panelHeader({title:hostile}),()=>ui.feedback(hostile),()=>ui.statusBadge({label:hostile})];
  for(const render of renderers){const html=render();assert.ok(!html.includes('<img'),html);assert.ok(html.includes('&lt;img'));}
});
test('weekday choices retain source chip markup and locked entity choices remain selected',()=>{
  const days=ui.weekdayPicker({id:'days',values:[0,6]});assert.equal((days.match(/ checked/g)||[]).length,2);assert.match(days,/data-value-type="number"/);
  const items=ui.multiSelect({id:'items',items:[{id:'b',label:'B',disabled:true}],values:['b']});assert.match(items,/value="b" checked disabled/);assert.match(items,/1 ausgewählt/);
  assert.throws(()=>ui.combobox({id:'invalid id',items:[]}));
});
test('number, textarea and grouped select expose semantic validation attributes',()=>{
  assert.match(ui.numberControl({id:'number',label:'Minutes',value:5,min:-15,max:15,step:1,unit:'min',presets:[-5,5]}),/min="-15" max="15" step="1"/);
  const textarea=ui.textareaField({id:'description',label:'Description',required:true,maxLength:500,error:'Required'});assert.match(textarea,/maxlength="500" required aria-invalid="true"/);assert.match(textarea,/aria-describedby="description-help"/);
  const select=ui.selectField({id:'select',label:'Scenes',name:'scene',required:true,options:[{label:'Hue',options:[{value:'a',label:'Relax',disabled:true}]}]});assert.match(select,/<optgroup label="Hue">/);assert.match(select,/name="scene" required/);assert.match(select,/value="a" disabled/);
});
test('range controls clamp values and preserve optional unchanged state',()=>{
  assert.match(ui.rangeControl({id:'range',label:'Position',value:150}),/value="100"/);
  assert.match(ui.rangeControl({id:'range',label:'Position',value:null}),/data-keep="true"/);
  assert.match(ui.whiteTemperatureControl({id:'white',value:6500,min:2000,max:6500}),/type="range"[^>]*value="2000"/);
  assert.throws(()=>ui.rangeControl({id:'range',min:10,max:0}));assert.throws(()=>ui.rangeControl({id:'range',value:NaN}));
});
test('yearless seasons validate leap day and reject impossible dates',()=>{
  assert.equal(ui.parseMonthDay('29.02.'),'02-29');assert.equal(ui.parseMonthDay('1.4'),'04-01');assert.equal(ui.parseMonthDay('31.04.'),null);assert.equal(ui.parseMonthDay('30.02.'),null);assert.equal(ui.parseMonthDay('2026-11-10'),null);
});
test('calendar dates cross month, year and leap day without duplicate dates',()=>{
  assert.deepEqual(ui.calendarDates('2024-02-28',3),['2024-02-28','2024-02-29','2024-03-01']);assert.deepEqual(ui.calendarDates('2026-12-31',2),['2026-12-31','2027-01-01']);assert.equal(new Set(ui.calendarDates('2026-03-27',7)).size,7);
  assert.throws(()=>ui.calendarDates('2026-02-30'));assert.throws(()=>ui.calendarDates('2026-11-10',0));
  const calendar=ui.weekCalendar({id:'week',start:'2026-11-09',entries:[{date:'2026-11-09',title:'Meal',link:'javascript:alert(1)'}]});assert.ok(!calendar.includes('javascript:'));assert.equal((calendar.match(/<article /g)||[]).length,7);
});
test('RGB/HSV conversion matches primary colours and validated inputs',()=>{
  for(const rgb of [[255,0,0],[0,255,0],[0,0,255],[255,255,255],[0,0,0],[140,100,50]]){const hsv=ui.rgbToHSV(rgb);assert.deepEqual(ui.hsvToRGB(hsv.h,hsv.s,hsv.v),rgb);}
  assert.deepEqual(ui.parseColour('#00aAFF'),[0,170,255]);assert.throws(()=>ui.parseColour('red'));assert.throws(()=>ui.parseColour([300,0,0]));assert.throws(()=>ui.hsvToRGB(0,2));
});
test('recurrence summaries cover each household pattern',()=>{
  assert.equal(ui.recurrenceSummary({kind:'once'}),'Einmalig');assert.equal(ui.recurrenceSummary({kind:'daily',interval:2}),'Alle 2 Tage');assert.equal(ui.recurrenceSummary({kind:'weekly',interval:1,weekdays:[0,4]}),'Jede Woche · Mo, Fr');assert.equal(ui.recurrenceSummary({kind:'monthly_nth',interval:1,nth:-1,weekdays:[1]}),'Monatlich · Letzter Di');assert.match(ui.recurrenceSummary({kind:'yearly',start:'2024-02-29'}),/02-29/);
});
test('backup parsing bounds bytes and reports invalid JSON without executing it',async()=>{
  assert.deepEqual(await ui.readJSONFile({size:2,text:async()=>'{"ok":true}'}),{ok:true});await assert.rejects(ui.readJSONFile({size:3,text:async()=>''},{maxBytes:2}),/groß/);await assert.rejects(ui.readJSONFile({size:2,text:async()=>'<script>'}),/JSON/);await assert.rejects(ui.readJSONFile(null));
});
test('photo controls reject SVG and remote script URLs; compression bounds input size',async()=>{
  for(const src of ['javascript:alert(1)','https://example.com/image.png','data:image/svg+xml;base64,PHN2Zz4='])assert.throws(()=>ui.photoPreview({src}));
  await assert.rejects(ui.compressPhoto({type:'image/svg+xml',size:5}),/JPG/);await assert.rejects(ui.compressPhoto({type:'image/png',size:21*1024*1024}),/20 MB/);
});
