const svgNS = 'http://www.w3.org/2000/svg';
const SEC = 1000;
const MIN = 60 * SEC;
const HR = 60 * MIN;
let context: AudioContext;
let source: AudioBufferSourceNode;
let sonicPanic: AudioBuffer;

window.addEventListener('load', initAudio, false);
function initAudio() {
    try {
        context = new AudioContext();
        // source = context.createBufferSource();
        fetch('https://heinous.industries/sonic.mp3')
            .then(res => res.arrayBuffer())
            .then(res => context.decodeAudioData(res))
            .then(buff => sonicPanic = buff);
        // .then(buff => source.buffer = buff)
        // .then(() => source.connect(context.destination))
        // .then(() => source.start(0));
    }
    catch (e) {
        alert('Web Audio is broked! :-(');
    }
}

class Pomodoro {
    private cx = 200;
    private cy = 200;
    private r = 50;
    // private f = 0.75;
    private f = 0;
    private element: SVGElement;
    private breakEl: HTMLElement;
    private sessionEl: HTMLElement;
    private displayEl: HTMLElement;
    private arc: SVGPathElement;
    // private duration = 14000;
    private duration: number = 1 * MIN;//25*MIN;
    private breakDur: number = 5 * MIN;
    private T: number;
    private isRunning: boolean = false;
    private dT: number;
    private isPlaying: boolean = false;

    constructor(private positive = true) {
        const { height, width } = document.getElementsByTagName('main')[0].getBoundingClientRect();
        this.r = Math.min(height, width) * 0.45;
        // this.cx = 0;
        this.cx = this.r;
        this.cy = this.r;
        this.T = Date.now();
        this.dT = 0;
        this.element = document.getElementsByTagNameNS(svgNS, 'svg')[0];
        this.element.setAttribute('width', (2 * this.r).toFixed(0));
        this.element.setAttribute('height', (2 * this.r).toFixed(0));

        this.arc = document.createElementNS(svgNS, 'path');
        this.breakEl = document.querySelector('#break .value') as HTMLElement;
        this.breakEl.innerHTML = '' + this.breakDur / MIN;
        this.sessionEl = document.querySelector('#session .value') as HTMLElement;
        this.sessionEl.innerHTML = '' + this.duration / MIN;
        this.displayEl = document.getElementById('time-display') as HTMLElement;
        this.displayEl.innerHTML = '' + (this.duration - this.T);
        this.start();
        // this.pause();
        this.element.appendChild(this.arc);
        // console.log(this.element);
    }
    playAlert() {
        this.isPlaying = true;
        source = context.createBufferSource();
        source.buffer = sonicPanic;
        source.connect(context.destination);
        source.start(0);
        source.addEventListener('onended', () => this.isPlaying = false);
    }
    start() {
        this.isRunning = true;
        this.f = 0;
        this.T = Date.now();
        this.dT = 0;
        this.update();
    }
    stop() {
        this.isRunning = false;
        this.f = 1;
        this.T = 0;
    }
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
        } else {
            this.isRunning = true;
            this.T = Date.now() - this.dT;
        }
    }
    setTime(num: number) {
        this.duration = num;
    }
    addTime(num: number) {
        this.duration += num;
        if (this.duration < 1) {
            this.duration = 1;
        }
        this.f = this.dT / this.duration;
    }
    update() {
        if (this.isRunning) {
            this.dT = Date.now() - this.T;
            this.f = this.dT / this.duration;
            let remaining = this.duration - this.dT;
            if (remaining <= 1) {
                this.isRunning = false;
                this.f = 1.0;
                this.dT = this.duration;
            } else if (remaining <= 12500 && !this.isPlaying) {
                this.playAlert();
            }
        }
        // console.log(this.f);
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }
    draw() {
        if (this.positive) {
            this.arc.setAttribute('d', this.positivePath);
        } else {
            this.arc.setAttribute('d', this.negativePath);
        }
        // Should really put these behind setters instead of here.. but.. eh.
        this.breakEl.innerHTML = (this.breakDur / MIN).toFixed(0);
        this.sessionEl.innerHTML = (this.duration / MIN).toFixed(0);
        const remaining = this.duration - this.dT;
        const min = Math.abs(Math.floor(remaining / MIN));
        const sec = Math.abs(Math.floor((remaining - min * MIN) / SEC));
        this.displayEl.innerHTML = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
    }
    get x() {
        return Math.round(100 * this.r * Math.cos((2 * Math.PI * this.f) + Math.PI / 2)) / 100;
    }
    get y() {
        return Math.round(100 * this.r * Math.sin((2 * Math.PI * this.f) + Math.PI / 2)) / 100;
    }
    get positivePath() {
        if (this.f < 1) {
            return `M${this.cx} ${this.cy} l0 -${this.r} A${this.r} ${this.r}, 0, ${this.f < 0.5 ? 0 : 1}, 0, ${this.cx + this.x} ${this.cy - this.y} L${this.cx} ${this.cy}`;
        } else {
            return `M${this.cx} ${this.cy - this.r} a${this.r} ${this.r}, 0, 0, 0, 0 ${2 * this.r} a${this.r} ${this.r}, 0, 0, 0, 0 ${-2 * this.r}`;
        }
    }
    get negativePath() {
        if (this.f < 1) {
            return `M${this.cx} ${this.cy} l0 -${this.r} A${this.r} ${this.r}, 0, ${this.f < 0.5 ? 1 : 0}, 1, ${this.cx + this.x} ${this.cy - this.y} L${this.cx} ${this.cy}`;
        } else {
            return `M${this.cx} ${this.cy - this.r} a${this.r} ${this.r}, 0, 1, 1, 0 ${2 * this.r} a${this.r} ${this.r}, 0, 1, 1, 0 ${-2 * this.r}`;
        }
    }
}

const pomo = new Pomodoro;
console.log(pomo.positivePath);
pomo.update();
