import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weatherGraphic,weatherMetricIcon,weatherPeriod,weatherStrip,weatherNow,weatherList,WEATHER_GRAPHICS} from '../dist/family-ui.js';

test('weather symbols cover all WMO groups, nights, wind and missing conditions',()=>{
  for(const [code,kind] of [[0,'clear'],[2,'partly-cloudy'],[3,'cloudy'],[48,'fog'],[61,'rain'],[82,'showers'],[75,'snow'],[67,'sleet'],[95,'thunder'],[99,'hail'],[null,'unknown']])
    assert.match(weatherGraphic({code}),new RegExp('data-weather-graphic="'+kind+'"'));
  for(const kind of WEATHER_GRAPHICS)assert.match(weatherGraphic({kind}),/<svg/);
  assert.notEqual(weatherGraphic({code:0,isDay:true}),weatherGraphic({code:0,isDay:false}));
  assert.notEqual(weatherGraphic({code:63}),weatherGraphic({code:63,windy:true}));
  assert.throws(()=>weatherGraphic({kind:'fake'}));assert.throws(()=>weatherMetricIcon('fake'));
});
test('weather text is escaped and illustrations never fetch remote assets',()=>{
  const unsafe='<img src=x onerror=alert(1)>';
  const markup=weatherStrip({label:unsafe,items:[{time:unsafe,temperature:unsafe,condition:unsafe,graphic:{label:unsafe},metrics:[{icon:'rain',label:unsafe,value:unsafe,detail:unsafe}]}]})+weatherNow({label:unsafe,temperature:unsafe});
  assert.doesNotMatch(markup,/<img|<script|https?:|url\(/);assert.match(markup,/&lt;img/);
});
test('measurements and forecast stay identifiable without colour, with exact time bounds',()=>{
  const measured=weatherPeriod({kind:'actual',time:'06:00–06:40 Uhr',start:12,end:20,temperature:'— °C',graphic:{kind:'thermometer'}});
  assert.match(measured,/Gemessen/);assert.match(measured,/data-start="12" data-end="20"/);assert.match(measured,/data-weather-graphic="thermometer"/);
  assert.match(weatherPeriod(),/Vorhersage/);assert.throws(()=>weatherPeriod({kind:'both'}));
  assert.match(weatherStrip(),/role="region".*tabindex="0"/);
});
test('vertical list includes current values once and escapes identifiers',()=>{
  const markup=weatherList({label:'<Heute>',items:[{id:'now" onclick="bad',time:'Jetzt',kind:'actual',temperature:'12 °C',graphic:{kind:'thermometer'}},{time:'12–15 Uhr',temperature:'14 °C',graphic:{code:0}}]});
  assert.match(markup,/fui-weather-list/);assert.doesNotMatch(markup,/fui-weather-strip|tabindex|id="now" onclick/);
  assert.equal((markup.match(/>Jetzt</g)||[]).length,1);assert.match(markup,/id="now&quot; onclick=&quot;bad"/);
});
