/* Real held pointer/touch dragging, cancellation, keyboard and controlled persistence. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<html><meta name="viewport" content="width=device-width,initial-scale=1"><order-test></order-test></html>');return;}
 const file=path.join(root,req.url);if(!fs.existsSync(file)){res.statusCode=404;res.end();return;}res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:800},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.evaluate(async()=>{
   const ui=await import('/dist/family-ui.js');
   customElements.define('order-test',class extends HTMLElement{
    constructor(){super();this.attachShadow({mode:'open'});this.items=['A','B','C'];this.calls=[];ui.bindUI(this.shadowRoot,event=>{
     if(event.action!=='move-program')return;
     this.calls.push(event.data);const index=this.items.indexOf(event.data.program),target=index+Number(event.data.offset);this.items.splice(target,0,...this.items.splice(index,1));this.draw();
    });this.draw();}
    draw(){this.shadowRoot.innerHTML='<style>'+ui.UI_CSS+'</style><div class="ui-card"><main>'+ui.programGroup({id:'items',title:'Programme',content:this.items.map((id,index)=>ui.programRow({id,title:id,index,count:this.items.length})).join('')})+'</main></div>';}
   });window.host=document.querySelector('order-test');
  });
  const handle=id=>page.locator(`[data-ui="order"][data-program="${id}"]`);
  const center=async id=>{const b=await handle(id).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
  for(const width of [320,390,1100])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:800});await page.evaluate(theme=>{host.items=['A','B','C'];host.calls=[];host.draw();document.documentElement.style.setProperty('--primary-text-color',theme==='dark'?'#eee':'#212121');document.documentElement.style.setProperty('--card-background-color',theme==='dark'?'#202124':'#fff');},theme);
   assert.equal(await handle('A').isVisible(),true);assert.equal(await handle('A').locator('[data-icon="drag"]').count(),1);
   const a=await center('A'),c=await center('C');await page.mouse.move(a.x,a.y);await page.mouse.down();await page.waitForTimeout(220);await page.mouse.move(c.x,c.y,{steps:8});await page.mouse.up();
   assert.deepEqual(await page.evaluate(()=>host.items),['B','C','A']);assert.equal(await page.evaluate(()=>host.calls.length),1);
   await handle('A').focus();await handle('A').press('Home');assert.deepEqual(await page.evaluate(()=>host.items),['A','B','C']);
   const start=await center('A'),end=await center('C');await page.mouse.move(start.x,start.y);await page.mouse.down();await page.waitForTimeout(220);await page.mouse.move(end.x,end.y);await page.keyboard.press('Escape');await page.mouse.up();
   assert.deepEqual(await page.evaluate(()=>host.items),['A','B','C']);
   await handle('A').click();assert.deepEqual(await page.evaluate(()=>host.items),['A','B','C'],'a short click never changes order');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   fs.mkdirSync(path.join(root,'test-results'),{recursive:true});await page.screenshot({path:path.join(root,'test-results',`ordering-${width}-${theme}.png`)});
  }
  // Native touch input produces pointer events through the same controller.
  await page.setViewportSize({width:390,height:800});const a=await center('A'),c=await center('C'),cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await page.waitForTimeout(230);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[c]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.deepEqual(await page.evaluate(()=>host.items),['B','C','A']);
  // A rendered/changed list cancels a pending drag rather than saving stale indices.
  const before=await page.evaluate(()=>[...host.items]),from=await center('B');await page.mouse.move(from.x,from.y);await page.mouse.down();await page.waitForTimeout(220);await page.evaluate(()=>host.draw());await page.mouse.up();assert.deepEqual(await page.evaluate(()=>host.items),before);
  assert.deepEqual(errors,[]);console.log('Ordering passed: held mouse/touch drag, multi-position move, cancellation, keyboard, no-op click and responsive themes.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
