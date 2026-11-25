const D = {Gasabo:[-1.87,30.12],Kicukiro:[-1.99,30.10],Nyarugenge:[-1.95,30.06],Nyanza:[-2.35,29.75],Gisagara:[-2.6,29.85],Nyaruguru:[-2.72,29.52],Huye:[-2.6,29.74],Nyamagabe:[-2.47,29.42],Ruhango:[-2.23,29.78],Muhanga:[-2.08,29.75],Kamonyi:[-2.02,29.9],Karongi:[-2.07,29.38],Rustiro:[-1.95,29.32],Rubavu:[-1.68,29.26],Nyabihu:[-1.67,29.5],Ngororero:[-1.87,29.63],Rusizi:[-2.48,28.9],Nyamasheke:[-2.35,29.13],Rulindo:[-1.75,30.05],Gakenke:[-1.69,29.78],Musanze:[-1.5,29.63],Burera:[-1.47,29.85],Gicumbi:[-1.58,30.07],Rwamagana:[-1.95,30.43],Nyagatare:[-1.3,30.33],Gatsibo:[-1.58,30.4],Kayonza:[-1.88,30.65],Kirehe:[-2.27,30.7],Ngoma:[-2.15,30.5],Bugesera:[-2.22,30.2]};
const A = {
    planting: d => d.rain > 25 ?[10,'Heavy rain: seeds may  wash away'] : d.rain >= 3 ? [95,'Good soil moisture for planting'] :
                   d.rain >= 0.5 ? [70,'Light rain: OK, water seedlings'] : [45,'Dry soil: plant only if you can irrigate'],
    drying:    d => d.rain >= 1 || d.prob > 50? [10,'Rain likely: keep harvest covered'] : d.prob > 25 ? [60,'Some rain risk: watch the sky'] : [95,'Dry weather: ideal for drying'],
    spraying:  d => d.rain >= 1 ? [10,'Rain would wash the spray off'] : d.wind > 20 ?  [20,' Too windy: spray will drift'] : d.wind > 12 ? [60, 'Breezy:spray early morning'] : [95,'Calm and dry: good for spraying'],  
    travel:    d => d.rain >= 15 ? [15,'Heavy rain: slippery roads'] : d.rain >= 5 ? [55,'Rainy: travel with care'] : [95,'Clear roads,easy travel']                
};
const $ = id => document.getElementById(id), names = Object.keys(D);
let days = [];
$('dl').innerHTML = names.map(n => `<option value="${n}">`).join('');

async function load() {
    const key = names.find(n => n.toLowerCase() == $('district').value.trim().toLowerCase());
    if (!key) { $('grid').innerHTML = ''; return $('status').textContent = 'Please choose a valid Rwandan district from the list.';}
    $('district').value = key; $('status').textContent = 'Loading forecast...';
    try {
        const ck = 'fd_' + key, c = JSON.parse(sessionStorage.getItem(ck) || 'null');
        if (c && Date.now() - c.t < 18e5) days = c.days;
        else {
            const [la,lo] = D[key];
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,wind_speed_10m_max&timezone=Africa%2FKigali&forecast_days=7`);
            if (!r.ok) throw new Error('API error' +r.status);
            const j = (await r.json()).daily;
            if (!j || !j.time) throw new Error('Invalid response');
            days = j.time.map((t, i) => ({date: t, rain: j.precipitation_sum[i] ?? 0, prob: j.precipitation_probability_max[i] ?? 0,temp: j.temperature_2m_max[i],wind: j.wind_speed_10m_max[i] ?? 0}));
            sessionStorage.setItem(ck, JSON.stringify({t:Date.now(), days}));
        }
        render();
    } catch (e) { $('grid').innerHTML = ''; $('status').textContent = ' Could not load forecast:' + e.message +'.Check your connection and try again.'; }
}

function render() {
    const act = $('activity').value;
    let list = days.map(d => {const [s, t] = A[act](d); return {...d, s, t}; });
    if ($('filter').value === 'good') list = list.filter(x => x.s >= 80);
    list.sort((a,b) => $('sort').value === 'best' ? b.s - a.s : a.date.localeCompare(b.date));
    $('status').textContent = list.length ? `${list.length} day(s) . ${act} in ${$('district').value}` : 'No best days this week for this activity. Try another activity or district.';
    $('grid').innerHTML = list.map(x => `<div class="card ${x.s >= 80 ? 'good' : x.s >= 50 ? 'ok': 'bad'}">
       <h3>${new Date(x.date + 'T00:00').toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'})}</h3> 
       <b>${x.s >= 80 ? '✅Best' : x.s >= 50 ? '⚠️ok' : '❌Avoid'}</b><p class="adv">${x.t}</p>
       <p>${x.rain} mm (${x.prob}%)</p><p>${x.temp}°C. ${x.wind} km/h</p></div>`).join('');
}
$('go').onclick = load; $('district').onchange = load;
['activity', 'sort', 'filter'].forEach(id => $(id).oninput = () => days.length && render());

fetch(location.href, {method: 'HEAD', cache: 'no-store'}).then(r => $('srv').textContent = r.headers.get('X-Served-By') || 'local').catch(() => $('srv').textContent = 'local');
load();