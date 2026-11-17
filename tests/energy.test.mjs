import {test} from 'node:test';
import assert from 'node:assert/strict';
import {energyFlow,seriesChart,UI_CSS,ICON_NAMES} from '../dist/family-ui.js';
test('energy nodes escape names and optional battery is absent',()=>{const markup=energyFlow({nodes:[{id:'solar',label:'<img onerror=x>',value:'1 kW'},{id:'home',label:'House',value:'—'}],flows:[{from:'solar',to:'home',value:1000}]});assert.ok(!markup.includes('<img'));assert.match(markup,/&lt;img/);assert.match(markup,/data-node="solar"/);assert.ok(!markup.includes('data-node="battery"'));for(const role of ['solar','grid','home','battery'])assert.ok(ICON_NAMES.includes('energy-'+role));assert.match(UI_CSS,/prefers-reduced-motion/);});
test('series nulls break lines and inspector data escapes external labels',()=>{const markup=seriesChart({id:'history',title:'<test>',unit:'W',series:[{label:'</div><script>x</script>',role:'solar',points:[{x:1,y:2},{x:2,y:null},{x:3,y:4}]}]});assert.ok(!markup.includes('<script>'));assert.match(markup,/M52,130 M672,40/);assert.match(markup,/tabindex="0"/);assert.match(markup,/fui-chart-inspector/);assert.match(seriesChart({id:'empty',title:'Empty',series:[]}),/Keine historischen Werte/);});

test('empty charts never format undefined timestamps',()=>{seriesChart({id:'empty-time',title:'Empty',series:[{label:'PV',points:[]}],formatX:t=>{assert.ok(Number.isFinite(t));return String(t);}});});

test('dense signed bar groups fit within mobile chart without covering adjacent bars', () => {
  const day = Array.from({length: 288}, (_, i) => i);
  const series = ['solar', 'home', 'grid', 'battery'].map((role, i) => ({
    label: role,
    role,
    points: day.filter(x => x !== 17).map(x => ({x, y: i < 2 ? 100 : -50})),
  }));
  const html = seriesChart({id: 'dense-bars', title: 'Power', width: 280, kind: 'bar', series});
  const bars = [...html.matchAll(/class="fui-chart-bar [^"]+" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)]
    .map(([, x, y, width, height]) => ({x: +x, y: +y, width: +width, height: +height}))
    .sort((a, b) => a.x - b.x);
  const zero = +html.match(/class="fui-chart-zero"[^>]+ y1="([^"]+)"/)[1];
  assert.equal(bars.length, 287 * 4);
  assert.ok(bars.every((bar, i) => bar.width > 0 && bar.x >= 52 && bar.x + bar.width <= 252 &&
    (!i || bars[i - 1].x + bars[i - 1].width <= bar.x + 1e-8)));
  assert.ok(bars.some(bar => bar.y < zero && bar.y + bar.height === zero));
  assert.ok(bars.some(bar => bar.y === zero && bar.height > 0));
});
