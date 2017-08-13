// https://fcc-weather-api.glitch.me/
const main = document.getElementsByTagName('main')[0];
let coords: Coordinates;
let lat: number;
let lon: number;
let corr: number;

function addText(text): Promise<any> {
  return new Promise((resolve)=> {
    main.innerHTML += text;
    window.setTimeout(resolve, 700);
  });
}

window.addEventListener('load', (ev)=>{
  addText('<div id="hello">Hello</div>')
    .then(()=>addText('<div id="hi">Hi</div>'))
    .then(()=>addText('<div id="sphinx">Sphinx of black quartz, judge my vow.</div>'))
    .then(()=>addText('<div id="no">No, thank you.</div>'));
  });

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(x=>{
    coords = x.coords;
    corr = Math.pow(10, Math.floor(Math.log10(coords.accuracy/111111)));
    lat = corr*Math.floor(coords.latitude/corr);
    lon = corr*Math.floor(coords.longitude/corr);
    fetch('https://fcc-weather-api.glitch.me/api/current?'+`lon=${lon}&lat=${lat}`)
      .then(x=>x.json())
      .then(x=>console.log(x));
    console.log(`${lat} x ${lon} [${corr}]`);
  });
}
