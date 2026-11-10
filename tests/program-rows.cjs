const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 const source=fs.readFileSync(path.join(__dirname,'../dist/family-ui.js'),'utf8');
 for(const width of [1100,390,320])for(const dark of [false,true]){
  await page.setViewportSize({width,height:1000});
  await page.setContent('<style>body{margin:12px;--primary-color:#81d4fa}</style><div id="card"></div>');
  await page.addScriptTag({type:'module',content:source+`;window.kit={UI_CSS,programGroup,programRow,toggle,bindUI};`});
  await page.evaluate(dark=>{
   const {UI_CSS,programGroup,programRow,bindUI}=kit;
   const host=document.querySelector('#card');host.style.cssText='max-width:800px;margin:auto;--ha-card-background:'+(dark?'#202020':'#fff')+';--primary-text-color:'+(dark?'#eee':'#212121');
   const root=host.attachShadow({mode:'open'});window.events=[];
   root.innerHTML='<style>'+UI_CSS+'</style><ha-card><main>'+programGroup({id:'group',title:'Zeitprogramme',count:1,content:programRow({id:'long',title:'Zirkulationspumpe Wochenende und Feiertage',meta:['Mo · Di · Mi · Do · Fr · Sa · So']})})+'</main></ha-card>';
   bindUI(root,e=>events.push({action:e.action,checked:e.checked}));
  },dark);
  const host=page.locator('#card'),toggle=host.locator('[role=switch]');
  assert.match(await toggle.getAttribute('aria-label'),/Zirkulationspumpe/);
  assert.equal(await toggle.locator(':scope > span').last().isVisible(),false);
  assert.ok(await host.locator('.program-title').evaluate(e=>e.getBoundingClientRect().width)>150);
  assert.equal(await host.evaluate(e=>e.shadowRoot.querySelector('ha-card').scrollWidth>e.clientWidth),false);
  await toggle.focus();await page.keyboard.press('Space');
  assert.deepEqual(await page.evaluate(()=>events.at(-1)),{action:'program-enabled',checked:false});
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
  await page.screenshot({path:path.join(__dirname,'../test-results/program-row-'+width+'-'+(dark?'dark':'light')+'.png'),fullPage:true});
 }
 await browser.close();console.log('Shared program rows: mobile/desktop, both themes, long names and accessible switches passed.');
})().catch(e=>{console.error(e);process.exit(1)});
