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
  assert.equal(await radar.locator('.fui-radar-marker').getAttribute('aria-label'),'Dein Standort');assert((await radar.locator('.fui-radar-base').getAttribute('src')).startsWith('data:image/svg+xml;base64,'));
  assert(await radar.locator('.fui-radar-overlay').evaluate(e=>e.complete&&e.naturalWidth>0));
  assert.equal(await radar.locator('.fui-radar-map').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
  assert.equal(await radar.locator('.fui-radar-overlay').evaluate(e=>getComputedStyle(e).opacity),'1');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await radar.screenshot({path:path.join(screens,`radar-${width}-${dark?'dark':'light'}.png`)});
 }
 await radar.getByRole('slider').focus();
 const retained=await radar.evaluate(async root=>{const {updateRadarMap}=await import('/dist/family-ui.js');const slider=root.querySelector('input');const options={frames:[{time:1795089600,kind:'observation'},{time:1795089900,kind:'prediction'}],index:1,playing:true};updateRadarMap(root,options);return root.querySelector('input')===slider&&root.getRootNode().activeElement===slider;});
 assert(retained,'Frame changes preserve slider and keyboard focus');assert.match(await radar.locator('output').innerText(),/Vorhersage/);assert.equal(await radar.getByRole('button',{name:'Radar anhalten'}).count(),1);
 assert.equal(await radar.getByRole('button',{name:'Nächstes Radarbild'}).isDisabled(),true);
 const touch=await browser.newPage({viewport:{width:390,height:850},isMobile:true,hasTouch:true});await touch.goto(`http://127.0.0.1:${server.address().port}/examples/gallery.html`);
 const touchMap=touch.locator('family-ui-gallery').locator('#radar .fui-radar-map');await touchMap.scrollIntoViewIfNeeded();
 await touchMap.evaluate(async map=>{const {bindRadarGestures}=await import('/dist/family-ui.js');window.pinchSteps=[];window.pinchCleanup=bindRadarGestures(map,step=>pinchSteps.push(step));});
 const box=await touchMap.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2,cdp=await touch.context().newCDPSession(touch);
 const points=spread=>[{x:cx-spread,y:cy,id:1},{x:cx+spread,y:cy,id:2}];
 const pinch=async(from,to,cancel=false)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(from)});for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(from+(to-from)*i/5)});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});};
 const pageScale=await touch.evaluate(()=>visualViewport.scale);
 await pinch(35,70);await pinch(70,35);await pinch(35,70,true);
 assert.deepEqual(await touch.evaluate(()=>pinchSteps),[1,-1]);assert.equal(await touch.evaluate(()=>visualViewport.scale),pageScale,'Map gestures do not zoom the page');
 const marker=await touch.locator('family-ui-gallery').locator('#radar .fui-radar-marker').boundingBox();assert(Math.abs(marker.x+marker.width/2-cx)<1&&Math.abs(marker.y+marker.height/2-cy)<1,'The location stays centred');
 await touch.waitForTimeout(250);const before=await touch.evaluate(()=>scrollY);
 await cdp.send('Input.synthesizeScrollGesture',{x:cx,y:cy,yDistance:before>20?100:-100,gestureSourceType:'touch',speed:300});await touch.waitForTimeout(250);
 const after=await touch.evaluate(()=>scrollY);console.log('Single-finger scroll:',{before,after});assert(Math.abs(after-before)>20,'One finger can scroll the page');await touch.evaluate(()=>pinchCleanup());await touch.close();
 assert.deepEqual(errors,[]);await browser.close();server.close();console.log('PASS radar: four widths, themes, model timeline, real two-finger pinch, page scrolling, centred marker and stable focus');
})().catch(async e=>{console.error(e);await browser?.close();server.close();process.exitCode=1;});
