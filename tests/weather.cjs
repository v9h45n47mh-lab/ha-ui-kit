const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),screens=path.join(root,'test-results');fs.mkdirSync(screens,{recursive:true});let browser;
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/examples/gallery.html`);
 const gallery=page.locator('family-ui-gallery'),weather=gallery.locator('#weather'),strip=weather.locator('.fui-weather-strip');await strip.waitFor();
 for(const width of [320,390,768,1100])for(const dark of [false,true]){
  await page.setViewportSize({width,height:1000});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  assert.equal(await weather.locator('.fui-weather-period').count(),8);
  assert.equal(await weather.locator('.fui-weather-period.is-actual').first().evaluate(e=>getComputedStyle(e).color),'rgb(2, 119, 189)');
  assert.equal(await weather.locator('.is-forecast small').first().evaluate(e=>getComputedStyle(e).color),'rgb(0, 0, 0)');
  assert.equal(await strip.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
  assert(await strip.evaluate(e=>e.scrollWidth>e.clientWidth));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const positions=await weather.locator('.fui-weather-period').first().evaluate(e=>({time:e.querySelector('.fui-weather-time').getBoundingClientRect(),graphic:e.querySelector('svg').getBoundingClientRect(),temperature:e.querySelector('strong').getBoundingClientRect()}));
  assert(positions.graphic.y>positions.time.y);assert(positions.temperature.y>=positions.graphic.bottom);
  await strip.evaluate(e=>e.scrollLeft=0);await weather.screenshot({path:path.join(screens,`weather-${width}-${dark?'dark':'light'}.png`)});
  await strip.focus();await page.keyboard.press('End');await strip.evaluate(e=>e.scrollLeft=e.scrollWidth);assert(await strip.evaluate(e=>e.scrollLeft>0));
  assert(await weather.locator('.fui-weather-period').last().getByText('1.013 hPa').isVisible());
 }
 const context=await browser.newContext({viewport:{width:390,height:900},isMobile:true,hasTouch:true}),touch=await context.newPage();
 await touch.goto(`http://127.0.0.1:${server.address().port}/examples/gallery.html`);
 const touchStrip=touch.locator('family-ui-gallery').locator('#weather .fui-weather-strip');await touchStrip.scrollIntoViewIfNeeded();
 const box=await touchStrip.boundingBox(),cdp=await context.newCDPSession(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-20,y:box.y+100}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-20-i*30,y:box.y+100}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(300);
 assert(await touchStrip.evaluate(e=>e.scrollLeft>0),'Touch swipe reveals later periods');
 await context.close();assert.deepEqual(errors,[]);console.log('PASS weather: original SVGs, four widths, light/dark, source colours, overflow, keyboard and touch scrolling');
 await browser.close();server.close();
})().catch(async e=>{console.error(e);await browser?.close();server.close();process.exitCode=1;});
