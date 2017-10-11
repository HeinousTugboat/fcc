const svgNS = 'http://www.w3.org/2000/svg';

class Pomodoro {
    private cx = 200;
    private cy = 200;
    private r = 50;
    // private f = 0.75;
    private f = 0;
    private element: SVGElement;
    private arc: SVGPathElement;
    private duration: number = 2 * 1000;
    private T: number;
    private isRunning: boolean = false;
    private dT: number;

    constructor(private positive = true) {
        const { height, width } = document.getElementsByTagName('main')[0].getBoundingClientRect();
        this.r = Math.min(height, width) / 2 - 32;
        this.cx = 0;
        this.cy = this.r;
        this.T = Date.now();
        this.dT = 0;
        this.element = document.getElementsByTagNameNS(svgNS, 'svg')[0];
        this.arc = document.createElementNS(svgNS, 'path');
        this.start();
        this.element.appendChild(this.arc);
        // console.log(this.element);
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
        this.f = this.dT / this.duration;
    }
    update() {
        if (this.isRunning) {
            this.dT = Date.now() - this.T;
            this.f = this.dT / this.duration;
            if (this.f > 1) {
                this.isRunning = false;
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
