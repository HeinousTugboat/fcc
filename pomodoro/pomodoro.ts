export { }
const svgNS = 'http://www.w3.org/2000/svg';
const SEC = 1000;
const MIN = 60 * SEC;
const HR = 60 * MIN;
let context: AudioContext;
let source: AudioBufferSourceNode;
let sonicPanic: AudioBuffer;

enum pType { WORK, BREAK };

declare const webkitAudioContext: AudioContext;
window.addEventListener('load', initAudio, false);
function initAudio() {
    return Promise.resolve(context = new (AudioContext || webkitAudioContext)())
        .then(() => fetch('https://heinous.industries/sonic.mp3'))
        .then(res => res.arrayBuffer())
        .then(res => context.decodeAudioData(res))
        .then(buff => sonicPanic = buff)
        .catch(e => alert('Web Audio is broked! :-( ' + e));
    // try {
    //     context = new (AudioContext || webkitAudioContext)();
    //     // source = context.createBufferSource();
    //     fetch('https://heinous.industries/sonic.mp3')
    //         .then(res => res.arrayBuffer())
    //         .then(res => context.decodeAudioData(res))
    //         .then(buff => sonicPanic = buff);
    //     // .then(buff => source.buffer = buff)
    //     // .then(() => source.connect(context.destination))
    //     // .then(() => source.start(0));
    // }
    // catch (e) {
    //     alert('Web Audio is broked! :-( ' + e);
    // }
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
    private labelEl: HTMLElement;
    private arc: SVGPathElement;
    // private duration: number = 5 * SEC;//25*MIN;
    private workDur: number = 25 * MIN;
    private breakDur: number = 5 * MIN;
    private duration: number = this.workDur;
    private isRunning: boolean = false;
    private isPlaying: boolean = false;
    /** Time current period started */
    private T: number;
    /** Time elapsed since `this.T` */
    private dT: number;
    private type: pType = pType.WORK;

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
        this.labelEl = document.getElementById('label-display') as HTMLElement;
        // this.start();
        // this.pause();
        this.update();
        this.element.appendChild(this.arc);
        // console.log(this.element);
    }
    playAlert() {
        this.isPlaying = true;
        source = context.createBufferSource();
        source.buffer = sonicPanic;
        source.connect(context.destination);
        source.start(0);
        source.addEventListener('ended', () => this.isPlaying = false);
    }
    start() {
        this.isRunning = true;
        if (!this.isRunning || this.T+this.duration < Date.now() || this.dT >= this.duration) {
            this.f = 0;
            this.T = Date.now();
            this.dT = 0;
        }
        this.update();
    }
    stop() {
        if (this.isRunning) {
            this.labelEl.innerHTML += '<br /><small>stopped</small>';
        }
        this.isRunning = false;
        this.isPlaying = false;
    }
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.labelEl.innerHTML += '<br /><small>paused</small>';
        } else {
            this.isRunning = true;
            this.T = Date.now() - this.dT;
        }
    }
    reset() {
        this.stop();
        this.duration = this.workDur;
        this.type = pType.WORK;
        this.f = 0;
        this.T = Date.now();
        this.dT = 0;
    }
    end() {
        this.T = Date.now();
        this.f = 0;
        this.dT = 0;
        switch(this.type) {
            case pType.WORK:
            this.labelEl.innerHTML = 'Break!';
            this.type = pType.BREAK;
            this.duration = this.breakDur;
            break;
            case pType.BREAK:
            this.labelEl.innerHTML = 'Work!';
                this.type = pType.WORK;
                this.duration = this.workDur;
                this.isPlaying = false;
                break;
        }
    }
    setTime(num: number) {
        this.duration = num;
    }
    addWorkTime(num: number) {
        this.workDur += num;
        if (this.workDur < 1) {
            this.workDur = 1;
        }
    }
    addBreakTime(num: number) {
        this.breakDur += num;
        if(this.breakDur < 1) {
            this.breakDur = 1;
        }
    }
    update() {
        if (this.isRunning) {
            this.dT = Date.now() - this.T;
            let remaining = this.duration - this.dT;
            switch (this.type) {
                case pType.WORK:
                    this.labelEl.innerHTML = 'Work!'; // FIXME: This is really ugly and horrible and wrong..
                    this.f = this.dT / this.duration;
                    break;
                case pType.BREAK:
                    this.labelEl.innerHTML = 'Break!'; // FIXME: This is really ugly and horrible and wrong..
                    this.f = remaining / this.duration;
                    break;
            }

            if (remaining <= 1) {
                this.end();
                // this.isRunning = false;
                // this.f = 1.0;
                // this.dT = this.duration;
            } else if (this.type === pType.WORK && remaining <= 12500 && !this.isPlaying) {
                this.playAlert();
            }
        }
        // console.log(this.f);
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }
    draw() {
        // switch (this.type) {
            // case pType.WORK:
                // this.arc.setAttribute('d', this.positivePath);
                // break;
            // case pType.BREAK:
                // this.arc.setAttribute('d', this.negativePath);
                // break;
        // }
        if (this.positive) {
            this.arc.setAttribute('d', this.positivePath);
        } else {
            this.arc.setAttribute('d', this.negativePath);
        }
        // Should really put these behind setters instead of here.. but.. eh.
        this.breakEl.innerHTML = (this.breakDur / MIN).toFixed(0);
        this.sessionEl.innerHTML = (this.workDur / MIN).toFixed(0);
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
// console.log(pomo.positivePath);
// pomo.update();
