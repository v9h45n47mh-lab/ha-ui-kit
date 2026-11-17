const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),source=fs.readFileSync(path.join(__dirname,'../dist/family-ui.js'),'utf8');
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
  for(const width of [1100,430,390,375,320])for(const dark of [false,true]){
   await page.setViewportSize({width,height:1000});
   await page.setContent('<style>body{margin:12px}#card{max-width:760px;margin:auto}</style><div id="card"></div>');
   await page.addScriptTag({type:'module',content:source+';window.kit={UI_CSS,accountTile,accountTiles,navigation};'});
   await page.evaluate(dark=>{
    const {UI_CSS,accountTile,accountTiles}=kit,host=document.querySelector('#card');
    document.body.style.background=dark?'#111':'#fff';
    if(dark)for(const [name,value] of Object.entries({'--ha-card-background':'#1c1c1c','--primary-text-color':'#e1e1e1','--secondary-text-color':'#b0b0b0','--divider-color':'#3b3b3b'}))host.style.setProperty(name,value);
    const root=host.attachShadow({mode:'open'});
    root.innerHTML='<style>'+UI_CSS+'</style><ha-card><main>'+accountTiles({content:accountTile({id:'max',label:'Maximilian',value:25,unit:'min',status:'Guthaben',state:'success',description:'30 min warten auf Freigabe',details:'Zugewiesen 10 · Erledigt 5 · Korrektur −30 min'})+accountTile({id:'paul',label:'Paul',value:40,unit:'min',status:'Guthaben',state:'success'})})+'</main></ha-card>';
   },dark);
   const result=await page.locator('#card').evaluate(host=>{
    const root=host.shadowRoot,tiles=[...root.querySelectorAll('.fui-account-tile')],rects=tiles.map(t=>{const r=t.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});
    const label=tiles[0].querySelector('h4').getBoundingClientRect(),value=tiles[0].querySelector('strong').getBoundingClientRect(),description=tiles[0].querySelector('p').getBoundingClientRect(),other=tiles[1].querySelector('strong').getBoundingClientRect(),group=tiles[0].querySelector('.fui-account-balance'),unit=tiles[0].querySelector('.fui-account-unit').getBoundingClientRect();
    return {rects,grid:root.querySelector('.fui-account-tiles').clientWidth,background:getComputedStyle(tiles[0]).backgroundColor,overflow:tiles.some(t=>t.scrollWidth>t.clientWidth||t.scrollHeight>t.clientHeight),label:{x:label.x,y:label.y,bottom:label.bottom},value:{x:value.x,width:value.width,top:value.top,bottom:value.bottom,font:parseFloat(getComputedStyle(tiles[0].querySelector('strong')).fontSize)},otherValueTop:other.top,centre:(value.top+unit.bottom)/2,descriptionTop:description.top};
   });
   assert.equal(result.rects.length,2);const [a,b]=result.rects;
   assert.ok(Math.abs(a.width-a.height)<1&&Math.abs(b.width-b.height)<1,'Tiles are square');
   assert.ok(Math.abs(a.width-b.width)<1&&Math.abs(a.y-b.y)<1&&b.x>a.x+a.width,'Two equal tiles share one row');
   assert.ok(a.width<result.grid/2&&a.width>result.grid*.4,'Each tile occupies half of the grid minus the gap');
   assert.ok(result.label.x>=a.x+12&&result.label.y>=a.y+12,'Name starts at the upper left');
   assert.ok(Math.abs(result.value.x+result.value.width/2-a.x-a.width/2)<1,'Balance is centred');
   assert.ok(Math.abs(result.value.top-result.otherValueTop)<1&&Math.abs(result.centre-a.y-a.height/2)<1,'Both balances stay on the same centre line, independently of hints');
   assert.equal(result.background,dark?'rgb(28, 28, 28)':'rgb(255, 255, 255)','The requested theme is actually applied');
   assert.ok(result.value.font>=28&&result.label.bottom<=result.value.top+1&&result.value.bottom<=result.descriptionTop+1,'Large balance and text do not overlap');
   assert.equal(result.overflow,false);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:path.join(__dirname,`../test-results/account-tiles-${width}-${dark?'dark':'light'}.png`),fullPage:true});
   const single=await page.locator('#card').evaluate(host=>{
    host.shadowRoot.querySelector('.fui-account-tiles').innerHTML=kit.accountTile({id:'own',label:'Ein sehr langer vollständiger Benutzername',value:999999,unit:'min',status:'offen'});
    const t=host.shadowRoot.querySelector('.fui-account-tile');return {width:t.clientWidth,grid:t.parentElement.clientWidth,overflow:t.scrollWidth>t.clientWidth,title:t.querySelector('h4').title};
   });assert.ok(single.width<single.grid/2);assert.equal(single.overflow,false);assert.match(single.title,/vollständiger/);
   await page.locator('#card').evaluate(host=>{
    const {UI_CSS,accountTile,accountTiles,navigation}=kit;
    host.shadowRoot.innerHTML='<style>'+UI_CSS+'</style><ha-card>'+navigation({label:'Views',items:[{id:'temperature',label:'Temperatur'},{id:'wind',label:'Wind'},{id:'illuminance',label:'Helligkeit'}],active:'temperature',actions:[{icon:'refresh',label:'Aktualisieren',action:'reload'}]})+'<main>'+accountTiles({content:accountTile({id:'now',label:'Aktuell',state:'active',metrics:[{value:'100.000',unit:'lx',description:'Messung 15:00'},{label:'Veränderung in 1 Std.',value:'+1.234',unit:'lx',description:'Steigend'}]})+accountTile({id:'extremes',label:'Minimum / Maximum',metrics:[{label:'Minimum',value:'−12,3',unit:'°C',description:'Uhrzeit nicht gespeichert'},{label:'Maximum',value:'30,4',unit:'°C',description:'15:00'}]})})+'</main></ha-card>';
   });
   const compound=await page.locator('#card').evaluate(host=>{
    const root=host.shadowRoot,tiles=[...root.querySelectorAll('.fui-account-tile')],reload=root.querySelector('[data-action="reload"]');
    return {metrics:root.querySelectorAll('.fui-account-metric').length,overflow:tiles.some(t=>t.scrollWidth>t.clientWidth||t.scrollHeight>t.clientHeight),heights:tiles.map(t=>t.getBoundingClientRect().height),refreshWidth:reload.getBoundingClientRect().width,refreshVisible:reload.getBoundingClientRect().right<=innerWidth};
   });
   assert.equal(compound.metrics,4);assert.equal(compound.overflow,false);assert.equal(compound.refreshVisible,true);assert.ok(compound.refreshWidth>=40);assert.ok(Math.abs(compound.heights[0]-compound.heights[1])<1);
   await page.screenshot({path:path.join(__dirname,`../test-results/paired-readings-${width}-${dark?'dark':'light'}.png`),fullPage:true});
  }
  console.log('Account tiles: two columns, square geometry, large centred values, long names, single accounts, mobile/desktop and both themes passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
