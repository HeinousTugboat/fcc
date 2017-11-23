export { }
/**

    Simon says!

    Buttons:
        Green
        Red
        Yellow
        Blue
        Skill (1-4)
        Longest
        Last
        Start/Reset

    Skill levels:
        1    8
        2   14
        3   20
        4   31

    Links:
        https://en.wikipedia.org/wiki/Simon_%28game%29
        https://www.hasbro.com/common/instruct/Simon.PDF
        http://www.waitingforfriday.com/?p=586

    Timings:
        Seq  1- 5:  0.42s on    0.05s off
        Seq  6-13:  0.32s on    0.05s off
        Seq 14-31:  0.22s on    0.05s off

        Timeout:    3.0s
        Delay after Press: 0.8s
        Failure:    0.8s on
        Victory:    0.02s on    0.02s off
           5x       0.07s on    0.02s off
        Fancy Victory: RYBGGGRY (0.10s on, ??? off)
            Failure Signal
            Flash BG > RYBG > RY

    RNG:
        Increment counter 1-4 each loop, use counter to select next button on button press


**/


/**
 * User Stories!
 *
 * User Story: I am presented with a random series of button presses.
 *
 * User Story: Each time I input a series of button presses correctly, I see the
 * same series of button presses but with an additional step.
 *
 * User Story: I hear a sound that corresponds to each button both when the
 * series of button presses plays, and when I personally press a button.
 *
 * User Story: If I press the wrong button, I am notified that I have done so,
 * and that series of button presses starts again to remind me of the pattern so
 * I can try again.
 *
 * User Story: I can see how many steps are in the current series of button
 * presses.
 *
 * User Story: If I want to restart, I can hit a button to do so, and the game
 * will return to a single step.
 *
 * User Story: I can play in strict mode where if I get a button press wrong, it
 * notifies me that I have done so, and the game restarts at a new random series
 * of button presses.
 *
 * User Story: I can win the game by getting a series of 20 steps correct. I am
 * notified of my victory, then the game starts over.
 **/

declare const webkitAudioContext: AudioContext;

/** Default gain for tones. 1.00 is deafening for me.. 0.25 sounds decent. */
// const volume = 0.25;
const volume = 0.05;

enum Colors {
    YELLOW = 1,
    BLUE = 2,
    RED = 3,
    GREEN = 4
}

class Simon {
    private ctx: AudioContext;
    private gainNode: GainNode;
    private game: 1 | 2 | 3;
    private level: 1 | 2 | 3 | 4;
    private rng = 0;
    private isActive = false;
    private isWaiting = false;
    private isHolding = false;
    private isPlaying = false;
    private currentlyPlaying: IterableIterator<boolean>;
    private hasWon = false;
    private startTime: number;
    private inputTime: number;
    private currentGame: 1 | 2 | 3;
    private currentLevel: 1 | 2 | 3 | 4;

    // The div elements, pulled in by the constructor.
    private boardElement: HTMLDivElement;
    private yellowElement: HTMLDivElement;
    private redElement: HTMLDivElement;
    private greenElement: HTMLDivElement;
    private blueElement: HTMLDivElement;
    private modeElement: HTMLDivElement;
    private levelElement: HTMLDivElement;
    private lastButton: HTMLButtonElement;
    private startButton: HTMLButtonElement;
    private longestButton: HTMLButtonElement;

    // Keep track of longest streak, last streak, and current streak;
    private lastMoves: Colors[] = [];
    private longestMoves: Colors[] = [];
    private currentMoves: Colors[] = [];


    constructor() {

        try {
            this.ctx = new (AudioContext || webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = volume;
            this.gainNode.connect(this.ctx.destination);
        } catch (e) {
            throw new Error('No Audio Context! ' + e);
        };

        this.boardElement = document.getElementById('board') as HTMLDivElement;
        this.yellowElement = document.getElementById('yellow') as HTMLDivElement;
        this.redElement = document.getElementById('red') as HTMLDivElement;
        this.greenElement = document.getElementById('green') as HTMLDivElement;
        this.blueElement = document.getElementById('blue') as HTMLDivElement;
        this.modeElement = document.getElementById('mode') as HTMLDivElement;
        this.levelElement = document.getElementById('level') as HTMLDivElement;
        this.lastButton = document.getElementById('last') as HTMLButtonElement;
        this.startButton = document.getElementById('start') as HTMLButtonElement;
        this.longestButton = document.getElementById('longest') as HTMLButtonElement;

        this.boardElement.addEventListener('click', this.clickHandler.bind(this), true);
        this.tick();
    }

    /**
     * Processes ticks. Uses an RNG similar to how the original did, by simply
     * iterating a counter every pulse. Unfortunately, this runs at 60Hz instead
     * of 4400Hz like the original. I'm not clever enough to perfectly emulate
     * that. :-|
     *
     * NB: Recursively calles into rAF to cycle, only call once.
     *
     * @memberof Simon
     */
    tick() {
        const now = performance.now();
        if (this.rng >= 4) {
            this.rng = 1;
        } else {
            this.rng++;
        }
        if (this.isWaiting) {
            if (now >= this.inputTime + 3000) {
                this.loseGame();
            }
        } else if (this.isActive) {
            // This is where we process the system's move...
        } else if (this.isHolding) {
            if (now >= this.inputTime + 800) {
                this.addMove();
            }
            // } else if (this.isPlaying) {
            // console.log(this.currentlyPlaying.next());
        }
        requestAnimationFrame(this.tick.bind(this));
    }

    /**
     * Plays a square wave oscillator for the given time at the given frequency.
     *
     * @param {number} freq
     * @param {number} time
     * @memberof Simon
     */
    playTone(freq: number, time: number, color: Colors = 0): Promise<boolean> { // TODO: Replace this with Promises? Hmmm.
        return new Promise((resolve, reject) => {

            const oscillator = this.ctx.createOscillator();
            let el: HTMLElement = this.boardElement;
            switch (color) {
                case Colors.BLUE: el = this.blueElement; break;
                case Colors.GREEN: el = this.greenElement; break;
                case Colors.RED: el = this.redElement; break;
                case Colors.YELLOW: el = this.yellowElement; break;
            }
            oscillator.type = 'square';
            oscillator.frequency.value = freq;
            oscillator.connect(this.gainNode);
            oscillator.start();
            el.classList.add('active')
            setTimeout(() => {
                oscillator.stop();
                el.classList.remove('active');
                resolve(true);
            }, time);
        });
    }
    /** Plays the Green Tone: 415Hz (G#4/415.305Hz) */
    playGreen = (time: number = 420) => this.playTone(415, time, Colors.GREEN);
    /** Plays the Red Tone: 310Hz (D#4/311.127Hz) */
    playRed = (time: number = 420) => this.playTone(310, time, Colors.RED);
    /** Plays the Yellow Tone: 252Hz (B3/247.942Hz) */
    playYellow = (time: number = 420) => this.playTone(252, time, Colors.YELLOW);
    /** Plays the Blue Tone: 209Hz (G#3/207.652Hz) */
    playBlue = (time: number = 420) => this.playTone(209, time, Colors.BLUE);
    /** Plays the Fail Tone: 42Hz, defaults to 1.5s */
    playLose = (time: number = 1500) => this.playTone(42, time);
    /** Just a Promisified Delay mechanism to support pauses in playback */
    playDelay(time: number): Promise<boolean> {
        return new Promise(r => setTimeout(r, time));
    }

    /**
     * Produces an Iterator that we can pass to runIter. Accepts an array of
     * Colors or 0 an a time to play each tone/delay.
     *
     * @param {(([Colors | 0, number])[])} sequence
     * @returns {IterableIterator<Promise<boolean>>}
     * @memberof Simon
     */
    *playSequence(sequence: ([Colors | 0, number])[]): IterableIterator<Promise<boolean>> {
        this.isPlaying = true;
        for (let note of sequence) {
            switch (note[0]) {
                case Colors.BLUE: yield this.playBlue(note[1]); break;
                case Colors.RED: yield this.playRed(note[1]); break;
                case Colors.GREEN: yield this.playGreen(note[1]); break;
                case Colors.YELLOW: yield this.playYellow(note[1]); break;
                case 0: yield this.playDelay(note[1]); break;
            }
        }
    }

    /** Simple function to iterate over a Promise Generator */
    runIter(iter: IterableIterator<Promise<any>>) {
        let next = iter.next();
        if (!next.done) {
            next.value.then((value) => {
                this.runIter(iter);
            })
        }
    }

    /**
     * Click Handler! Instead of wiring up individual onClicks on the HTML
     * Elements, this project will route all clickhandling through one place.
     * Here.
     *
     * @param {Event} ev
     * @memberof Simon
     */
    clickHandler(ev: Event) {

        let fail = false;
        if (this.isWaiting || !this.isActive) {
            this.isWaiting = false;
            this.inputTime = performance.now();
            switch (ev.target) {
                case this.greenElement:
                    if (this.currentMoves[this.currentMoves.length - 1] === Colors.GREEN || !this.isActive) {
                        this.isHolding = true;
                        this.playGreen(500);
                    } else {
                        fail = true;
                    }
                    break;
                case this.redElement:
                    if (this.currentMoves[this.currentMoves.length - 1] === Colors.RED || !this.isActive) {
                        this.isHolding = true;
                        this.playRed(500);
                    } else {
                        fail = true;
                    }
                    break;
                case this.blueElement:
                    if (this.currentMoves[this.currentMoves.length - 1] === Colors.BLUE || !this.isActive) {
                        this.isHolding = true;
                        this.playBlue(500);
                    } else {
                        fail = true;
                    }
                    break;
                case this.yellowElement:
                    if (this.currentMoves[this.currentMoves.length - 1] === Colors.YELLOW || !this.isActive) {
                        this.isHolding = true;
                        this.playYellow(500);
                    } else {
                        fail = true;
                    }
                    break;
                case this.startButton:
                    this.start();
                    break;
                case this.lastButton:
                    this.last();
                    break;
                case this.longestButton:
                    this.longest();
                    break;
                case this.modeElement:
                case this.levelElement:
                default:
                    // console.log(ev.target);
                    break;
            }
        }
        if ((ev.target as HTMLElement).nodeName === 'INPUT') {
            const el: HTMLInputElement = ev.target as HTMLInputElement;
            // console.log(el.id, el.name, el.value);
            if (el.name === 'mode-selector') {
                this.setGame(parseInt(el.value));
            }
            if (el.name === 'level-selector') {
                this.setLevel(parseInt(el.value));
            }
        }
        if (fail) {
            this.loseGame();
        }
    }

    get delay() {
        if (this.currentMoves.length <= 5) {
            return 420;
        } else if (this.currentMoves.length <= 14) {
            return 320;
        } else {
            return 220;
        }

    }

    addMove() {
        const delay = this.delay;
        this.currentMoves.push(this.rng);
        this.inputTime = performance.now() + delay;
        switch (this.rng) {
            case Colors.BLUE:
                this.playBlue(delay);
                break;
            case Colors.RED:
                this.playRed(delay);
                break;
            case Colors.YELLOW:
                this.playYellow(delay);
                break;
            case Colors.GREEN:
                this.playGreen(delay);
                break;
        }
        this.isWaiting = true;
    }

    loseGame() {
        console.log('Game lost!');
        this.playLose();
        this.isActive = false;
        this.isWaiting = false;
        this.lastMoves = [...this.currentMoves];
    }

    start() {
        console.log('start!');
        this.isActive = true;
        this.isWaiting = false;
        this.startTime = performance.now();
        this.addMove();
    }
    last() {
        console.log('last!');
    }
    longest() {
        console.log('longest!');
    }
    setLevel(level: number) {
        console.log('setLevel', level);
        if (this.level !== level) {
            this.level = level as (1 | 2 | 3 | 4);
        }
    }
    setGame(mode: number) {
        console.log('setGame', mode);
        if (this.game !== mode) {
            this.game = mode as (1 | 2 | 3);
        }
    }


}

const game = new Simon;
