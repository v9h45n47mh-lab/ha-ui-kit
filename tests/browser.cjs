const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname,'..');
const server = http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  let file = path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(url.pathname.endsWith('/')) file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  const type = file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'Content-Type':type}); res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  const page = await browser.newPage({viewport:{width:1100,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(8000);
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/examples/`);
    const card=page.locator('family-ui-example-card').first();
    await card.getByRole('button',{name:'Einstellungen',exact:true}).waitFor();
    const settings=card.getByRole('button',{name:'Einstellungen',exact:true});
    assert.equal(await settings.getAttribute('aria-current'),'page');
    const style=await settings.evaluate(el=>{const s=getComputedStyle(el);return {color:s.color,width:s.width,fill:getComputedStyle(el.querySelector('svg')).fill,svg:getComputedStyle(el.querySelector('svg')).width};});
    assert.equal(style.color,'rgb(3, 169, 244)');assert.equal(style.fill,style.color);assert.equal(style.svg,'24px');assert.equal(style.width,'48px');
    for(const width of [1100,430,390,375]){
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow at ${width}px`);
      assert.ok(await card.evaluate(el=>Array.from(el.shadowRoot.querySelectorAll('.setting-row,.card-top')).every(node=>node.scrollWidth<=node.clientWidth)),`Rows fit at ${width}px`);
      const edit=card.getByRole('button',{name:'Bearbeiten',exact:true}).first();
      const box=await edit.boundingBox();assert.ok(box.width>=40&&box.height>=40);
      await page.screenshot({path:path.join(root,`test-results/settings-${width}-light.png`),fullPage:true});
    }
    const fold=card.getByRole('button',{name:'Geräte',exact:true});
    await fold.focus();await fold.press('Space');assert.equal(await fold.getAttribute('aria-expanded'),'false');
    assert.equal(await card.locator('#devices-content').isVisible(),false);
    await fold.press('Enter');assert.equal(await fold.getAttribute('aria-expanded'),'true');
    const enabled=card.getByRole('switch',{name:'Automatik aktiv'});
    await enabled.focus();await enabled.press('Space');assert.equal(await enabled.getAttribute('aria-checked'),'false');
    const edit=card.getByRole('button',{name:'Bearbeiten',exact:true}).first();
    await edit.click();
    const modal=card.getByRole('dialog');assert.equal(await modal.isVisible(),true);
    await modal.getByLabel('Name',{exact:true}).fill('Test <script>safe</script>');
    await modal.getByRole('button',{name:'Speichern',exact:true}).click();
    assert.equal(await modal.isVisible(),false);assert.equal(await card.locator('[data-name]').textContent(),'Test <script>safe</script>');
    assert.equal(await edit.evaluate(el=>el.getRootNode().activeElement===el),true,'Focus returns to the opener');
    await edit.click();await modal.getByLabel('Name',{exact:true}).focus();await page.keyboard.press('Escape');
    assert.equal(await modal.isVisible(),false);
    await edit.click();
    for(let i=0;i<8;i++){
      await page.keyboard.press('Tab');
      assert.equal(await modal.evaluate(el=>el.contains(el.getRootNode().activeElement)),true,'Dialog traps focus');
    }
    await page.screenshot({path:path.join(root,'test-results/dialog-375-light.png'),fullPage:true});
    await modal.getByRole('button',{name:'Schließen',exact:true}).click();
    await page.getByRole('button',{name:'Dunkles Theme'}).click();
    assert.equal(await card.locator('.ui-card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(28, 28, 28)');
    await page.screenshot({path:path.join(root,'test-results/settings-375-dark.png'),fullPage:true});
    await page.setViewportSize({width:1100,height:1000});
    await page.screenshot({path:path.join(root,'test-results/settings-1100-dark.png'),fullPage:true});
    await card.getByRole('button',{name:'Programme',exact:true}).click();
    const addProgram = card.getByRole('button',{name:'+ Programm',exact:true});
    assert.equal(await addProgram.textContent(),'+ Programm');
    assert.equal(await addProgram.locator('svg').count(),0,'Program plus uses the original text glyph');
    const up = card.getByRole('button',{name:'Nach oben sortieren',exact:true});
    const down = card.getByRole('button',{name:'Nach unten sortieren',exact:true});
    assert.equal(await up.first().isEnabled(),false);
    assert.equal(await down.last().isEnabled(),false);
    assert.equal(await down.first().textContent(),'↓');
    assert.equal(await up.last().textContent(),'↑');
    assert.equal(await down.first().evaluate(el=>getComputedStyle(el).color),'rgb(3, 169, 244)','Sort arrows use the light blue accent in dark mode');
    await down.first().focus();await down.first().press('Enter');
    assert.deepEqual(await card.locator('[data-program-row]').evaluateAll(els=>els.map(el=>el.dataset.programRow)),['evening','morning']);
    await up.last().click();
    assert.deepEqual(await card.locator('[data-program-row]').evaluateAll(els=>els.map(el=>el.dataset.programRow)),['morning','evening']);
    await addProgram.click();assert.equal(await modal.isVisible(),true);await modal.getByRole('button',{name:'Schließen',exact:true}).click();
    await page.screenshot({path:path.join(root,'test-results/programs-desktop-dark.png'),fullPage:true});
    await page.getByRole('button',{name:'Helles Theme'}).click();
    assert.equal(await down.first().evaluate(el=>getComputedStyle(el).color),'rgb(3, 169, 244)','Sort arrows use the light blue accent in light mode');
    await page.screenshot({path:path.join(root,'test-results/programs-desktop-light.png'),fullPage:true});
    const filter=card.getByRole('button',{name:'Urlaub',exact:true});await filter.click();assert.equal(await filter.getAttribute('aria-pressed'),'true');
    assert.equal(await card.getByRole('button',{name:'Kopieren',exact:true}).isVisible(),true);
    await page.setViewportSize({width:390,height:900});assert.equal(await card.getByRole('button',{name:'Kopieren',exact:true}).isVisible(),false);
    assert.equal(await down.first().isVisible(),false,'Program sorting follows the mobile hiding rule');
    assert.equal(await addProgram.isVisible(),true);
    await page.screenshot({path:path.join(root,'test-results/programs-mobile-light.png'),fullPage:true});
    await card.getByRole('button',{name:'Anleitung',exact:true}).click();assert.equal(await card.locator('.icon-grid .ui-icon').count(),23);
    // Multiple cards own independent ShadowRoots and handlers.
    await page.evaluate(()=>document.body.append(document.createElement('family-ui-example-card')));
    const second=page.locator('family-ui-example-card').nth(1);
    await second.getByRole('switch',{name:'Automatik aktiv'}).click();
    assert.equal(await second.getByRole('switch',{name:'Automatik aktiv'}).getAttribute('aria-checked'),'false');
    await card.getByRole('button',{name:'Einstellungen',exact:true}).click();
    assert.equal(await card.getByRole('switch',{name:'Automatik aktiv'}).getAttribute('aria-checked'),'false');
    await second.getByRole('switch',{name:'Automatik aktiv'}).click();
    assert.equal(await card.getByRole('switch',{name:'Automatik aktiv'}).getAttribute('aria-checked'),'false');
    await page.evaluate(()=>{const el=document.querySelectorAll('family-ui-example-card')[1];el.remove();document.body.append(el);});
    await second.getByRole('switch',{name:'Automatik aktiv'}).click();
    assert.equal(await second.getByRole('switch',{name:'Automatik aktiv'}).getAttribute('aria-checked'),'false','Reconnect binds once');
    if(process.env.SHUTTER_REFERENCE){
      const source=fs.readFileSync(process.env.SHUTTER_REFERENCE,'utf8');
      const css=source.split('  css() { return `')[1].split('`; }')[0];
      const sourceGear=source.match(/aria-label="Einstellungen" title="Einstellungen"[^]*?<svg[^>]*>([^]*?)<\/svg>/)[1];
      const comparison=await page.evaluate(({css,sourceGear})=>{
        const ref=document.createElement('div');ref.attachShadow({mode:'open'});
        ref.shadowRoot.innerHTML=`<style>${css}</style><button class="settings-button selected"><svg viewBox="0 0 24 24">${sourceGear}</svg></button><section class="settings-group" data-settings="devices"><button class="settings-fold"><span>Geräte</span></button><div class="window"><div><h3>Wohnbereich</h3></div></div></section>`;
        document.body.append(ref);
        const kit=document.querySelector('family-ui-example-card').shadowRoot;
        const read=(root,selector,props)=>Object.fromEntries(props.map(key=>[key,getComputedStyle(root.querySelector(selector))[key]]));
        const pairs=[['.settings-button.selected','.settings-button.selected',['color','backgroundColor','padding','width']],['.settings-group[data-settings]','[data-settings=devices].settings-group',['paddingTop','paddingBottom']],['.settings-fold span','[data-settings=devices] .settings-fold span',['fontSize','fontWeight']],['.window h3','[data-settings=devices] .row-text strong',['fontSize','fontWeight','lineHeight']]];
        const result=pairs.map(([a,b,props])=>({reference:read(ref.shadowRoot,a,props),kit:read(kit,b,props)}));
        result.push({reference:ref.shadowRoot.querySelector('.settings-button svg').innerHTML,kit:kit.querySelector('[data-icon="settings"]').innerHTML});ref.remove();return result;
      },{css,sourceGear});
      for(const item of comparison)assert.deepEqual(item.kit,item.reference,'Matches Shutter Manager reference');
      assert.ok(source.includes('>↑</button>') && source.includes('>↓</button>') && source.includes('>+ Programm</button>'),'Reference uses the canonical text glyphs');
      const programComparison = await page.evaluate(async css=>{
        const {UI_CSS,programAddButton,programOrderButtons}=await import('/dist/family-ui.js');
        const ref=document.createElement('div'),kit=document.createElement('div');
        ref.attachShadow({mode:'open'});kit.attachShadow({mode:'open'});
        ref.shadowRoot.innerHTML=`<style>${css}</style><div class="page-actions"><button class="primary">+ Programm</button></div><div class="program-order"><button>↑</button><button>↓</button></div>`;
        kit.shadowRoot.innerHTML=`<style>${UI_CSS}</style><div class="page-actions">${programAddButton()}</div>${programOrderButtons({programId:'b',index:1,count:3,desktopOnly:false})}`;
        document.body.append(ref,kit);
        const props=['fontFamily','fontSize','fontWeight','lineHeight','padding','borderRadius','width','height'];
        const read=(host,selector)=>Object.fromEntries(props.map(key=>[key,getComputedStyle(host.shadowRoot.querySelector(selector))[key]]));
        const result=['.page-actions button','.program-order button'].map(selector=>({reference:read(ref,selector),kit:read(kit,selector)}));
        result.push({reference:ref.shadowRoot.querySelector('.page-actions button').textContent,kit:kit.shadowRoot.querySelector('.page-actions button').textContent});
        result.push({reference:ref.shadowRoot.querySelector('.program-order').textContent,kit:kit.shadowRoot.querySelector('.program-order').textContent});
        const arrows=kit.shadowRoot.querySelector('.program-order button');
        const expected=getComputedStyle(kit.shadowRoot.querySelector('.program-add')).backgroundColor;
        result.push({reference:expected,kit:getComputedStyle(arrows).color});
        ref.remove();kit.remove();return result;
      },css);
      for(const item of programComparison)assert.deepEqual(item.kit,item.reference,'Program controls match reference geometry, glyphs and requested accent color');
      console.log('Shutter Manager 1.4.0 reference styles and settings SVG match');
    }
    assert.deepEqual(errors,[]);console.log('Browser checks passed: mobile/desktop, themes, keyboard, dialogs, isolated cards');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
