/* Real browser interaction tests for the reusable object catalogue. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;let file=path.resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(pathname.endsWith('/'))file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});res.end(fs.readFileSync(file));});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1100,height:1000}});page.setDefaultTimeout(8000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}/examples/gallery.html`;
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
 try{
  await page.goto(url);const gallery=page.locator('family-ui-gallery');await gallery.locator('#recurrence .recurrence-hint').waitFor();
  const last=()=>gallery.evaluate(el=>el.events.at(-1));
  assert.equal(await gallery.locator('.gallery-block').count(),15,'Every catalogue section renders');
  assert.equal(await gallery.getByRole('button',{name:'+ Programm',exact:true}).textContent(),'+ Programm');
  assert.equal(await gallery.getByRole('button',{name:'Hausarbeit',exact:true}).locator('svg').count(),1);
  assert.equal(await gallery.getByRole('button',{name:'Speichern …',exact:true}).isEnabled(),false);
  console.log('Buttons, variants and busy state render');

  const search=gallery.getByRole('combobox',{name:'Gericht auswählen',exact:true});
  await search.fill('reis');assert.equal(await gallery.locator('[data-ui-option]:visible').count(),3);
  await search.press('ArrowDown');await search.press('Enter');assert.equal((await last()).value,'rice');assert.equal(await search.getAttribute('aria-expanded'),'false');
  await search.fill('kein-treffer');assert.equal(await gallery.locator('.fui-options-empty').isVisible(),true);await search.press('Escape');
  await search.fill('Reis');await gallery.getByRole('heading',{name:'Buttons',exact:true}).click();assert.equal(await search.getAttribute('aria-expanded'),'false');
  const multi=gallery.locator('#devices');await multi.getByRole('searchbox').fill('Küche');await multi.getByRole('button',{name:'Alle sichtbaren auswählen',exact:true}).click();
  assert.deepEqual((await last()).value,['used','kitchen']);assert.equal(await multi.locator('input[value=living]').isChecked(),false);
  await multi.getByRole('button',{name:'Auswahl aufheben',exact:true}).click();assert.deepEqual((await last()).value,['used']);
  await multi.getByRole('searchbox').fill('');await multi.locator('input[value=bedroom]').check();assert.deepEqual((await last()).value,['used','bedroom']);
  await gallery.locator('#people input[value=max]').check();assert.deepEqual((await last()).value,['paul','max']);
  await gallery.locator('#weekdays input[value="6"]').check();assert.deepEqual((await last()).value,[0,1,2,3,4,6]);
  console.log('Combobox, empty search, locked selections and weekday groups work');

  await gallery.locator('#minutes').fill('8');assert.equal((await last()).value,8);
  await gallery.locator('[data-ui-preset="-15"]').click();assert.equal(await gallery.locator('#minutes').inputValue(),'-15');assert.equal((await last()).valid,true);
  const position=gallery.getByRole('slider',{name:'Höhe',exact:true});await position.focus();await position.press('ArrowRight');assert.equal((await last()).value,51);
  await gallery.locator('#position-control').getByRole('button',{name:'Unverändert',exact:true}).click();assert.equal((await last()).value,null);
  const kelvin=gallery.getByRole('slider',{name:'Weißtöne',exact:true});await kelvin.focus();await kelvin.press('ArrowRight');assert.equal((await last()).value,3999);
  const wheel=gallery.locator('#colour .colour-wheel');await wheel.focus();await wheel.press('Home');assert.deepEqual((await last()).value,[255,255,255]);await wheel.press('Shift+ArrowRight');assert.notDeepEqual((await last()).value,[255,255,255]);
  const box=await wheel.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);assert.deepEqual((await last()).value,[255,255,255]);
  console.log('Numeric presets, percent sliders, reversed Kelvin and pointer/keyboard colour wheel work');

  const season=gallery.locator('#season'),seasonStart=season.locator('[name=start]');await seasonStart.fill('31.02.');await seasonStart.dispatchEvent('change');assert.equal((await last()).valid,false);assert.equal(await seasonStart.evaluate(el=>el.checkValidity()),false);
  await seasonStart.fill('29.02.');await seasonStart.dispatchEvent('change');assert.equal((await last()).value.start,'02-29');assert.equal((await last()).valid,true);
  await season.locator('[data-season-enabled]').uncheck();assert.equal((await last()).value.enabled,false);assert.equal(await seasonStart.isEnabled(),false);
  const dates=gallery.locator('#date-range');await dates.locator('[name=start]').fill('2026-12-01');await dates.locator('[name=start]').dispatchEvent('change');assert.equal((await last()).valid,false);
  await dates.locator('[name=end]').fill('2027-01-01');await dates.locator('[name=end]').dispatchEvent('change');assert.equal((await last()).valid,true);
  const times=gallery.locator('#time-window');await times.locator('[name=start]').fill('23:00');await times.locator('[name=start]').dispatchEvent('change');assert.deepEqual((await last()).value,{start:'23:00',end:'06:00'});assert.equal((await last()).valid,true);
  const recurrence=gallery.locator('#recurrence');await recurrence.locator('[name=unit]').selectOption('month');await recurrence.locator('[name=month_mode]').selectOption('nth');await recurrence.locator('[name=nth]').selectOption('-1');assert.equal((await last()).value.kind,'monthly_nth');assert.equal((await last()).value.nth,-1);
  await recurrence.locator('input[type=checkbox][value="1"]').uncheck();assert.equal((await last()).valid,false);await recurrence.locator('input[type=checkbox][value="1"]').check();assert.equal((await last()).valid,true);
  await recurrence.locator('[name=alternating]').check();await recurrence.locator('[name=first_person]').selectOption('Maximilian');assert.equal((await last()).value.first_person,'Maximilian');assert.equal((await last()).value.alternating,true);
  await recurrence.locator('[name=repeating]').uncheck();assert.equal((await last()).value.kind,'once');assert.equal((await last()).value.alternating,false);assert.equal(await recurrence.locator('[name=interval]').isEnabled(),false);
  console.log('Yearless seasons, overnight windows, date bounds and household recurrence work');

  const program=gallery.locator('#programs');await program.getByRole('button',{name:'Alle zuklappen',exact:true}).click();assert.equal(await gallery.locator('#time-programs-content').isVisible(),false);await program.getByRole('button',{name:'Alle aufklappen',exact:true}).click();assert.equal(await gallery.locator('#action-editor-body').isVisible(),true);
  const calendar=gallery.locator('#calendar');await calendar.getByRole('button',{name:'Nächste Woche',exact:true}).click();assert.equal(await gallery.locator('#week-calendar article').first().getAttribute('data-ui-calendar-day'),'2026-11-16');await calendar.getByRole('button',{name:'Heute',exact:true}).click();assert.equal(await gallery.locator('#week-calendar article').first().getAttribute('data-ui-calendar-day'),'2026-11-09');
  await gallery.locator('#week-calendar article').first().getByText('Gemüsereis',{exact:true}).click();assert.equal((await last()).action,'open-day');assert.equal((await last()).value,'2026-11-09');
  await gallery.getByRole('checkbox',{name:'Zimmer aufräumen – Paul',exact:true}).check();assert.equal((await last()).checked,true);assert.equal((await last()).data.person,'paul');
  await gallery.locator('#months').getByRole('button',{name:'Monatsverlauf',exact:true}).click();assert.equal(await gallery.locator('#months-group-0-content').isVisible(),false);
  assert.equal(await gallery.getByRole('table',{name:'Statistik',exact:true}).locator('tfoot').textContent(),'Gesamt15');
  console.log('Program folds, calendar navigation, completion, grouped history and statistics work');

  const backup=gallery.locator('#backup');await backup.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('invalid')});await backup.getByRole('alert').waitFor();
  await backup.locator('input[type=file]').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from('{"hello":"world"}')});await page.waitForFunction(()=>document.querySelector('family-ui-gallery').events.at(-1)?.action==='import-backup');assert.deepEqual((await last()).value,{hello:'world'});
  const downloadPromise=page.waitForEvent('download');await backup.getByRole('button',{name:'Sicherung erstellen',exact:true}).click();assert.equal((await downloadPromise).suggestedFilename(),'ui-kit-beispiel.json');
  const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=16;const ctx=canvas.getContext('2d');ctx.fillStyle='#03a9f4';ctx.fillRect(0,0,32,16);return canvas.toDataURL('image/png').split(',')[1];});
  const photo=gallery.locator('#garden-photo');await photo.locator('input[type=file]').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await photo.getByText('Foto bereit.',{exact:true}).waitFor();assert.match(await photo.locator('img').getAttribute('src'),/^data:image\/jpeg;base64,/);
  await gallery.getByRole('button',{name:'Foto groß anzeigen',exact:true}).click();const photoModal=gallery.getByRole('dialog',{name:'Foto',exact:true});assert.equal(await photoModal.locator('img').count(),1);await photoModal.getByRole('button',{name:'Schließen',exact:true}).click();
  await photo.getByRole('button',{name:'Foto entfernen',exact:true}).click();assert.equal((await last()).value,null);assert.equal(await photo.locator('img').count(),0);
  await photo.locator('input[type=file]').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});await photo.getByRole('alert').waitFor();assert.match(await photo.getByRole('alert').textContent(),/JPG/);
  console.log('Backup import/export, invalid files, image compression, preview and large view work');

  await gallery.getByRole('button',{name:'Bestätigung öffnen',exact:true}).click();const confirm=gallery.getByRole('dialog',{name:'Eintrag löschen?',exact:true});await confirm.getByRole('button',{name:'Löschen',exact:true}).click();assert.equal((await last()).action,'confirmed');assert.equal(await confirm.isVisible(),false);
  await gallery.getByRole('button',{name:'Bestätigung öffnen',exact:true}).click();await confirm.getByRole('button',{name:'Abbrechen',exact:true}).click();assert.equal((await last()).value,false);assert.equal(await confirm.isVisible(),false);
  await gallery.locator('.language-picker').getByRole('button',{name:/EN/}).click();assert.equal((await last()).data.language,'en');await gallery.locator('#panel').getByRole('button',{name:'Menü öffnen',exact:true}).click();assert.equal((await last()).action,'menu');
  // Escape in an open combobox closes its list before the containing native dialog.
  await gallery.evaluate(async host=>{const ui=await import('/dist/family-ui.js');host.shadowRoot.insertAdjacentHTML('beforeend',ui.dialog({id:'combo-modal',title:'Auswahldialog',content:ui.combobox({id:'inside-combo',label:'Suche im Dialog',items:[{id:'a',label:'A'}]})}));host.shadowRoot.querySelector('#combo-modal').showModal();});
  const inside=gallery.getByRole('combobox',{name:'Suche im Dialog',exact:true});await inside.focus();await inside.press('Escape');assert.equal(await gallery.locator('#combo-modal').isVisible(),true);assert.equal(await inside.getAttribute('aria-expanded'),'false');await inside.press('Escape');assert.equal(await gallery.locator('#combo-modal').isVisible(),false);
  console.log('Confirmation, cancellation, language, panel actions and nested dialog keyboard work');

  const gestureResult=await gallery.evaluate(async host=>{
    const {bindGestures}=await import('/dist/family-ui.js'),surface=document.createElement('div');host.shadowRoot.append(surface);const calls=[];const cleanup=bindGestures(surface,{canPull:()=>true,onSwipeLeft:()=>calls.push('left'),onSwipeRight:()=>calls.push('right'),onPullDown:()=>calls.push('pull')});
    const send=(type,points)=>{const event=new Event(type,{bubbles:true});Object.defineProperty(event,type==='touchstart'?'touches':'changedTouches',{value:points.map(([clientX,clientY])=>({clientX,clientY}))});surface.dispatchEvent(event);};
    send('touchstart',[[200,100]]);send('touchend',[[100,100]]);send('touchstart',[[100,100]]);send('touchend',[[200,100]]);send('touchstart',[[100,100]]);send('touchend',[[100,200]]);send('touchstart',[[100,100],[200,100]]);send('touchend',[[100,300]]);cleanup();send('touchstart',[[100,100]]);send('touchend',[[100,300]]);surface.remove();return calls;
  });assert.deepEqual(gestureResult,['left','right','pull']);
  const cleanupResult=await gallery.evaluate(async host=>{const ui=await import('/dist/family-ui.js'),el=document.createElement('div');el.attachShadow({mode:'open'});el.shadowRoot.innerHTML=ui.checkboxGroup({id:'cleanup-checks',label:'Cleanup',items:[{id:'a',label:'A'}]});host.shadowRoot.append(el);let calls=0;const unbind=ui.bindUI(el.shadowRoot,()=>calls++);const input=el.shadowRoot.querySelector('input');input.click();unbind();input.click();el.remove();return calls;});assert.equal(cleanupResult,1);
  console.log('Swipe/pull gestures ignore multitouch and all bindings clean up');

  for(const width of [1100,390,375]){
    await page.setViewportSize({width,height:1000});await page.goto(url);await gallery.locator('#recurrence .recurrence-hint').waitFor();
    for(const mode of ['light','dark']){
      if(mode==='dark')await page.getByRole('button',{name:'Dunkles Theme',exact:true}).click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No page overflow at ${width} ${mode}`);
      assert.equal(await gallery.evaluate(el=>el.scrollWidth<=el.clientWidth),true,`No card overflow at ${width} ${mode}`);
      const sort=gallery.locator('#programs .program-order');assert.equal(await sort.isVisible(),width>600);
      if(width>600)assert.equal(await sort.locator('button').first().evaluate(el=>getComputedStyle(el).color),'rgb(3, 169, 244)');
      for(const id of ['buttons','selection','ranges','dates','programs','calendar'])await gallery.locator('#'+id).screenshot({path:path.join(root,`test-results/gallery-${id}-${width}-${mode}.png`)});
    }
  }
  assert.deepEqual(errors,[]);console.log('All catalogue objects passed in desktop/mobile and light/dark themes');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
