// https://fcc-weather-api.glitch.me/
const main = document.getElementsByTagName('main')[0];
const svg = document.getElementsByTagName('svg')[0];
const screenRatio = innerWidth / innerHeight;
if (innerWidth < innerHeight) {
    const screenX = 1;
    const screenY = innerHeight / innerWidth;
} else {
    const screenX = innerWidth / innerHeight;
    const screenY = 1;
}
let coords: Coordinates;
let lat: number;
let lon: number;
let corr: number;
let weatherResults: Weather;
let tempUnit: 'F' | 'C' = 'C';

interface Weather {
    base: string;
    clouds: {all: number};
    cod: number;
    coord: {lon: number, lat: number};
    dt: number;
    id: number;
    main: {
        temp: number,
        pressure: number,
        humidity: number,
        temp_min: number,
        temp_max: number
    };
    name: string;
    sys: {
        country: string,
        id: number,
        message: number,
        sunrise: number,
        sunset: number,
        type: number,
    };
    visibility: number;
    weather: Array<{
        description: string,
        icon: string,
        id: number,
        main: string
    }>;
    wind: {
        deg: number,
        speed: number
    };
};

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(x => {
        coords = x.coords;
        corr = Math.pow(10, Math.floor(Math.log10(coords.accuracy / 111111)));
        lat = corr * Math.floor(coords.latitude / corr);
        lon = corr * Math.floor(coords.longitude / corr);
        fetch('https://fcc-weather-api.glitch.me/api/current?' + `lon=${lon}&lat=${lat}`)
            .then(x => x.json())
            .then(x => weatherResults = x);
            // .then(x => console.log(x));
        console.log(`${lat} x ${lon} [${corr}]`);
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
            if (element.classList.contains('centered')) {
                element.classList.add('bounce');
            }
            return new Promise(resolve => {
                window.setTimeout(() => { resolve(element) }, 1500);
            });
        }
    });
}

class Point {
    public x: number;
    public y: number;
    constructor(x: Point);
    constructor(x: number, y: number);
    constructor(x: number | Point, y?: number) {
        if (x instanceof Point) {
            this.x = x.x;
            this.y = x.y;
        } else if (y) {
            this.x = x;
            this.y = y;
        }
    }
    moveY(y: number): this {
        this.y += y;
        return this;
    }
    moveX(x: number): this {
        this.x += x;
        return this;
    }
}


function drawPath(from: Point, to: Point, delay: number = 50): Promise<SVGPathElement> {
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${from.x} ${from.y} L${to.x} ${to.y}`);
    let len = path.getTotalLength();
    path.setAttribute('stroke-dashoffset', '' + len);
    path.setAttribute('stroke-dasharray', '' + len);

    return new Promise((resolve) => {
        window.setTimeout(() => { resolve(svg.appendChild(path)) }, delay);
    });
}

function addWeather(right: Point) {
    let weather = document.getElementById('weather');
    if (weather === null) {
        weather = document.createElement('div');
        weather.id = 'weather';
        weather.classList.add('hidden', 'weather');
        weather.style.right = innerWidth - right.x + 48 + 'px';
        main.appendChild(weather);
    }
    let CtoF = (C: number) => (C*9/5)+32;
    let FtoC = (F: number) => (F-32)*5/9;
    let temp = weatherResults.main.temp;
    let tempMin = weatherResults.main.temp_min;
    let tempMax = weatherResults.main.temp_max;
    if (tempUnit === 'F') {
        temp = CtoF(temp);
        tempMin = CtoF(tempMin);
        tempMax = CtoF(tempMax);
    }
    weather.innerHTML = `
    <h1>....WEATHER REPORT....</h1>
    <p>for ${weatherResults.name}</p><br />
    <p>Temp: ${temp}\u00B0${tempUnit} (${tempMin}|${tempMax})</p><br />
    <p>${weatherResults.weather[0].description}
        <img src="${weatherResults.weather[0].icon}" alt="weather icon" title="${weatherResults.weather[0].description}">
    </p>
    <br /><br />
    <p id="dumper">kthx</p>`;
    (document.getElementById('dumper') as HTMLElement).addEventListener('click', (ev)=>{(weather as HTMLElement).innerHTML+='<p>'+JSON.stringify(weatherResults, null, 2)+'</p>'});
    weather.classList.remove('hidden');
    return weather;
}

function clickHello(el: Element) {
    return (ev: Event) => {
        el.classList.remove('centered');
        window.setTimeout(() => {
            let box = el.getBoundingClientRect();
            let from = new Point(box.left + box.width / 2, box.top + box.height / 2);
            let to_1 = new Point(box.left - 2*box.width, box.bottom + 2*box.height);
            let to_2 = new Point(to_1).moveX(24 * 4);

            let choice_1 = document.createElement('div');
            choice_1.classList.add('hidden', 'choice');
            choice_1.innerHTML = '\u00B0F'
            main.appendChild(choice_1);
            let choice_1_box = choice_1.getBoundingClientRect();
            choice_1.style.left =  to_1.x-choice_1_box.width+3+'px';
            choice_1.style.top = to_1.y-3+'px';
            choice_1.style.right = 'unset';

            let choice_2 = document.createElement('div');
            choice_2.classList.add('hidden', 'choice');
            choice_2.innerHTML = '\u00B0C';
            main.appendChild(choice_2);
            let choice_2_box = choice_2.getBoundingClientRect();
            choice_2.style.left = to_2.x-choice_2_box.width+3+'px';
            choice_2.style.top = to_2.y-3+'px';
            choice_2.style.right = 'unset';
            let path_1: SVGPathElement;
            let path_2: SVGPathElement;

            drawPath(from, to_1, 0)
                .then((path) => {path_1 = path; return drawPath(from, to_2)})
                .then((path) => {path_2 = path; return new Promise(resolve=>setTimeout(resolve, 1000))})
                .then(() => {
                    choice_1.classList.remove('hidden');
                    choice_2.classList.remove('hidden');
                    choice_1.addEventListener('click', (ev)=>{
                        // choice_2.classList.add('hidden');
                        path_1.classList.add('hidden');
                        path_2.classList.add('hidden');
                        choice_1.classList.add('active');
                        choice_2.classList.remove('active');
                        choice_1.style.top = '';
                        choice_1.style.left = innerWidth - choice_1_box.width - 4*24 + 'px';
                        choice_2.style.top = choice_1_box.bottom + 24 + 'px';
                        choice_2.style.left = choice_1.style.left;
                        tempUnit = 'F';
                        setTimeout(()=>addWeather(from), 250);
                    });
                    choice_2.addEventListener('click', (ev)=>{
                        // choice_1.classList.add('hidden');
                        path_1.classList.add('hidden');
                        path_2.classList.add('hidden');
                        choice_2.classList.add('active');
                        choice_1.classList.remove('active');
                        choice_2.style.top = '';
                        choice_2.style.left = innerWidth - choice_2_box.width - 4*24 + 'px';
                        choice_1.style.top = choice_2_box.bottom +24 + 'px';
                        choice_1.style.left = choice_2.style.left;
                        tempUnit = 'C';
                        setTimeout(()=>addWeather(from), 250);
                    });
                })
        }, 200);
    }
}

window.addEventListener('load', (ev) => {
    let hello = document.createElement('div');
    hello.id = 'hello';
    hello.classList.add('them', 'centered');
    hello.addEventListener('click', clickHello(hello));
    main.appendChild(hello);
    addCharacter('Hi.', hello)
        // .then(() => drawPath(new Point(0,0), new Point(innerWidth, innerHeight), 0))
        // .then(() => drawPath(new Point(innerWidth, 0), new Point(0, innerHeight), 0));
});

