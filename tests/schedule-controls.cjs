/* Canonical one-execution controls retain theme, keyboard and touch behavior. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://schedule-controls.test/**',route=>{
   if(new URL(route.request().url()).pathname==='/kit.js')return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'dist/family-ui.js'))});
   return route.fulfill({contentType:'text/html',body:'<html><meta charset="utf-8"><style>body{margin:8px;--primary-color:#03a9f4;--primary-text-color:#212121;--secondary-text-color:#727272;--text-primary-color:#fff;--card-background-color:#fff;--divider-color:#ddd;--ha-font-family-body:Arial,sans-serif}</style><div id="host"></div></html>'});
  });
  await page.goto('http://schedule-controls.test');
  await page.evaluate(async()=>{
   const UI=await import('/kit.js'),host=document.getElementById('host'),shadow=host.attachShadow({mode:'open'});
   shadow.innerHTML='<style>'+UI.UI_CSS+'</style><ha-card><main><div class="toolbar">'+UI.button({label:'Skip',icon:'skip-once',action:'skip',variant:'primary',compact:true})+UI.iconButton({icon:'reschedule',label:'Reschedule once',action:'reschedule'})+'</div><div class="toolbar">'+UI.button({label:'Auslassen',action:'reference',variant:'primary'})+'</div></main></ha-card>';
   window.actions=[];shadow.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.action;if(action)window.actions.push(action);});
  });
  const host=page.locator('#host'),skip=host.getByRole('button',{name:'Skip',exact:true}),shift=host.getByRole('button',{name:'Reschedule once',exact:true});
  const measures=[];fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
  for(const theme of ['light','dark'])for(const width of [320,390,1100]){
   await page.setViewportSize({width,height:700});
   await page.evaluate(theme=>{
    const dark=theme==='dark';for(const [name,value] of Object.entries({'--primary-color':dark?'#90caf9':'#03a9f4','--primary-text-color':dark?'#eee':'#212121','--secondary-text-color':dark?'#aaa':'#727272','--text-primary-color':dark?'#102030':'#fff','--card-background-color':dark?'#202124':'#fff','--divider-color':dark?'#444':'#ddd'}))document.body.style.setProperty(name,value);
    document.body.style.background=dark?'#121212':'#f5f7fa';
   },theme);
   assert.equal(await skip.locator('svg[data-icon="skip-once"]').count(),1);
   assert.equal(await shift.locator('svg[data-icon="reschedule"]').count(),1);
   const small=await skip.boundingBox(),normal=await host.getByRole('button',{name:'Auslassen',exact:true}).boundingBox(),icon=await shift.boundingBox();
   assert.ok(small.width+12<normal.width,'Skip is substantially narrower than the previous full-label control');
   assert.ok(small.height>=40&&icon.width>=40&&icon.height>=40,'compact controls retain a usable touch target');
   const glyph=await skip.locator('svg').boundingBox();assert.equal(glyph.width,16);assert.equal(glyph.height,16);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await skip.focus();await skip.press('Enter');await shift.focus();await shift.press('Space');
   assert.deepEqual(await page.evaluate(()=>window.actions.slice(-2)),['skip','reschedule']);
   measures.push({theme,width,skip:small,default:normal,reschedule:icon});
   await page.screenshot({path:path.join(root,`test-results/schedule-controls-${width}-${theme}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'test-results/schedule-controls.json'),JSON.stringify(measures,null,2));
  console.log('PASS: canonical skip-once/reschedule icons, narrower Skip, 40 px touch targets, keyboard actions and both themes at 320/390/1100 px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
