const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),source=fs.readFileSync(path.join(__dirname,'../dist/family-ui.js'),'utf8');
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
  for(const width of [1100,430,390,375,320])for(const dark of [false,true]){
   await page.setViewportSize({width,height:900});
   await page.setContent('<style>body{margin:0;--primary-color:#03a9f4;--ha-font-family-body:Arial,sans-serif}</style><div id="host"></div>');
   await page.addScriptTag({type:'module',content:source+';window.UI={UI_CSS,userAccessRow,bindUI};'});
   await page.evaluate(dark=>{
    const {UI_CSS,userAccessRow,bindUI}=UI,host=document.getElementById('host'),root=host.attachShadow({mode:'open'});
    if(dark)for(const [name,value]of Object.entries({'--ha-card-background':'#1c1c1c','--primary-text-color':'#eee','--secondary-text-color':'#aaa','--secondary-background-color':'#282828','--divider-color':'#444'}))host.style.setProperty(name,value);
    root.innerHTML='<style>'+UI_CSS+'</style><ha-card><main>'+userAccessRow({id:'admin',title:'Manuel mit einem sehr langen vollständigen Administratornamen',description:'Administrator',admin:true})+userAccessRow({id:'test',title:'Ein sehr langer vollständiger Benutzername ohne Kürzung',description:'Eingeschränkt',enabled:true,toggleAction:'enabled',value:'long',options:[{value:'none',label:'Keine Rolle'},{value:'long',label:'Eine sehr lange Rollenbezeichnung, die das Feld nicht verbreitern darf'}]})+'</main></ha-card>';
    window.actions=[];bindUI(root,event=>actions.push({action:event.action,checked:event.checked}));
   },dark);
   const host=page.locator('#host'),row=host.locator('[data-access-user="test"]');
   const rect=await row.evaluate(el=>{const n=el.querySelector('.row-text').getBoundingClientRect(),r=el.querySelector('select').getBoundingClientRect(),t=el.querySelector('[role=switch]').getBoundingClientRect();return{n:{x:n.x,y:n.y,right:n.right},r:{x:r.x,y:r.y,right:r.right},t:{x:t.x,y:t.y,right:t.right},overflow:el.scrollWidth>el.clientWidth};});
   assert.equal(rect.overflow,false);
   assert(await host.locator('[data-access-user="admin"]').evaluate(el=>el.querySelector('.row-text').getBoundingClientRect().right<=el.querySelector('.fui-user-access-admin').getBoundingClientRect().x),'Administrator name and badge do not overlap');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width>600){assert(rect.n.right<=rect.r.x&&rect.r.right<=rect.t.x,'Desktop uses name, role, toggle columns');}
   else{assert(rect.r.y>rect.n.y&&rect.t.y<rect.r.y,'Mobile role stays in its own row, toggle beside the name');}
   await row.getByRole('combobox').selectOption('none');assert.equal(await row.getByRole('combobox').inputValue(),'none');
   await row.getByRole('switch').click();assert.equal(await page.evaluate(()=>actions.at(-1).checked),false);
   await page.screenshot({path:path.join(__dirname,`../test-results/user-access-${width}-${dark?'dark':'light'}.png`),fullPage:true});
  }
  console.log('User access rows: 10 desktop/mobile/theme variants and controls passed');
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
