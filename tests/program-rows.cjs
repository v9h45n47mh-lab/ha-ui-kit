const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 const source=fs.readFileSync(path.join(__dirname,'../dist/family-ui.js'),'utf8');
 for(const width of [1100,390,320])for(const dark of [false,true]){
  await page.setViewportSize({width,height:1000});
  await page.setContent('<style>body{margin:12px;--primary-color:#81d4fa}</style><div id="card"></div>');
  await page.addScriptTag({type:'module',content:source+`;window.kit={UI_CSS,programGroup,programRow,button,toggle,bindUI};`});
  await page.evaluate(dark=>{
   const {UI_CSS,programGroup,programRow,button,bindUI}=kit;
   const host=document.querySelector('#card');host.style.cssText='max-width:800px;margin:auto;--ha-card-background:'+(dark?'#202020':'#fff')+';--primary-text-color:'+(dark?'#eee':'#212121');
   const root=host.attachShadow({mode:'open'});window.events=[];
   root.innerHTML='<style>'+UI_CSS+'</style><ha-card><main>'+programGroup({id:'group',title:'Zeitprogramme',count:2,content:
    programRow({id:'short',title:'Wochentag',meta:['Mo · Di · Mi · Do · Fr'],index:0,count:2})+
    programRow({id:'long',title:'Zirkulationspumpe Wochenende und Feiertage',meta:['Mo · Di · Mi · Do · Fr · Sa · So','06:00–22:30'],index:1,count:2})
   })+button({label:'Hausarbeit',icon:'add',action:'add-task',data:{test:'standard-button'}})+'</main></ha-card>';
   bindUI(root,e=>events.push({action:e.action,checked:e.checked}));
  },dark);
  const host=page.locator('#card'),toggle=host.getByRole('switch',{name:'Zirkulationspumpe Wochenende und Feiertage aktiv',exact:true});
  assert.match(await toggle.getAttribute('aria-label'),/Zirkulationspumpe/);
  assert.equal(await toggle.locator(':scope > span').last().isVisible(),false);
  assert.ok(await host.locator('.program-title').last().evaluate(e=>e.getBoundingClientRect().width)>150);
  const geometry=await host.locator('.program').evaluateAll(rows=>rows.map(row=>{
   const title=row.querySelector('.program-title>span'),meta=row.querySelector('.tags>span');
   return {title:title.getBoundingClientRect().left,meta:meta.getBoundingClientRect().left,row:row.getBoundingClientRect().left};
  }));
  for(const bounds of geometry){
   assert.ok(Math.abs(bounds.title-bounds.meta)<.5,`Program name and metadata align at ${width}px, dark=${dark}: ${JSON.stringify(bounds)}`);
   assert.ok(Math.abs(bounds.title-bounds.row-28)<.5,'Text follows the shared 28px indent');
  }
  const standardGap=await host.locator('[data-test="standard-button"]').evaluate(button=>{
   const icon=button.querySelector('svg').getBoundingClientRect(),text=button.querySelector('span').getBoundingClientRect();return text.left-icon.right;
  });
  assert.ok(Math.abs(standardGap-6)<.5,'Ordinary icon/text buttons retain their 6px gap');
  assert.equal(await host.evaluate(e=>e.shadowRoot.querySelector('ha-card').scrollWidth>e.clientWidth),false);
  await toggle.focus();await page.keyboard.press('Space');
  assert.deepEqual(await page.evaluate(()=>events.at(-1)),{action:'program-enabled',checked:false});
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
  await page.screenshot({path:path.join(__dirname,'../test-results/program-row-'+width+'-'+(dark?'dark':'light')+'.png'),fullPage:true});
 }
 await browser.close();console.log('Shared program rows: aligned text, ordinary button spacing, mobile/desktop, both themes, long names and accessible switches passed.');
})().catch(e=>{console.error(e);process.exit(1)});
