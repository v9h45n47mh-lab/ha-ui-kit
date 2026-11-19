const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),screens=path.join(root,'test-results');fs.mkdirSync(screens,{recursive:true});let browser;
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/examples/gallery.html`);
 const radar=page.locator('family-ui-gallery').locator('#radar .fui-radar');await radar.waitFor();
 for(const width of [320,390,768,1100])for(const dark of [false,true]){
  await page.setViewportSize({width,height:1000});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  assert.equal(await radar.getByRole('slider',{name:'Radarzeitpunkt'}).count(),1);
  assert.equal(await radar.locator('.fui-radar-marker').getAttribute('aria-label'),'Dein Standort');
  assert(await radar.locator('.fui-radar-overlay').evaluate(e=>e.complete&&e.naturalWidth>0));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await radar.screenshot({path:path.join(screens,`radar-${width}-${dark?'dark':'light'}.png`)});
 }
 await radar.getByRole('slider').focus();
 const retained=await radar.evaluate(async root=>{const {updateRadarMap}=await import('/dist/family-ui.js');const slider=root.querySelector('input');const options={frames:[{time:1795089600,kind:'observation'},{time:1795089900,kind:'prediction'}],index:1,playing:true};updateRadarMap(root,options);return root.querySelector('input')===slider&&root.getRootNode().activeElement===slider;});
 assert(retained,'Frame changes preserve slider and keyboard focus');assert.match(await radar.locator('output').innerText(),/Vorhersage/);assert.equal(await radar.getByRole('button',{name:'Radar anhalten'}).count(),1);
 assert.equal(await radar.getByRole('button',{name:'Nächstes Radarbild'}).isDisabled(),true);
 assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS radar: four widths, themes, images, accessible timeline and stable focus');
})().catch(async e=>{console.error(e);await browser?.close();server.close();process.exitCode=1;});
