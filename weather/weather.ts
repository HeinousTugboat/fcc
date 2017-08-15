// https://fcc-weather-api.glitch.me/
const main = document.getElementsByTagName('main')[0];
let coords: Coordinates;
let lat: number;
let lon: number;
let corr: number;

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(x => {
        coords = x.coords;
        corr = Math.pow(10, Math.floor(Math.log10(coords.accuracy / 111111)));
        lat = corr * Math.floor(coords.latitude / corr);
        lon = corr * Math.floor(coords.longitude / corr);
        fetch('https://fcc-weather-api.glitch.me/api/current?' + `lon=${lon}&lat=${lat}`)
            .then(x => x.json())
            .then(x => console.log(x));
        console.log(`${lat} x ${lon} [${corr}]`);
    });
}

function addText(text): Promise<any> {
    return new Promise((resolve) => {
        main.innerHTML += text;
        window.setTimeout(resolve, 700);
    });
}

function addCharacter(text: string, element: Element, position: number = 0, speed: number = 40): Promise<any> {
    return new Promise((resolve) => {
        element.innerHTML += text.substr(position, 1);
        window.setTimeout(resolve, Math.max(10000 / (speed + Math.random() * 20 - 10), 100));
    }).then(() => {
        if (position <= text.length) {
            return addCharacter(text, element, position + 1, speed);
        } else {
            element.classList.add('bounce');
            return new Promise(resolve => {
                window.setTimeout(() => { resolve(element) }, 1500);
            });
        }
    });
}

window.addEventListener('load', (ev) => {
    let hello = document.createElement('div');
    hello.id = 'hello';
    hello.classList.add('them', 'centered');
    main.appendChild(hello);
    addCharacter('Hi.', hello)
        .then(el => el.classList.remove('centered'));
    // addText('<div class="them" id="hello">Hello</div>')
    //     .then(() => addText('<div class="us" id="hi">Hi</div>'))
    //     .then(() => addText('<div class="them" id="sphinx">Sphinx of black quartz, judge my vow.</div>'))
    //     .then(() => addText('<div class="us" id="no">No, thank you.</div>'));
});

