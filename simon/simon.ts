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

enum Tones {
    SILENT = 0,
    YELLOW = 1,
    BLUE = 2,
    RED = 3,
    GREEN = 4,
    ERROR = 5,
    FANCY4 = 6,
    FANCY2 = 7
}

const Levels = [0, 8, 14, 20, 31];

class Simon {
    private ctx: AudioContext;
    private gainNode: GainNode;
    private game: 1 | 2 | 3;
    private level: 1 | 2 | 3 | 4;
    private rng = 1;
    /** game has been started */
    private isActive = false;
    /** game is waiting for player input */
    private isWaiting = false;
    /** game is waiting to start its turn */
    private isHolding = false;
    /** game is playing a sequence */
    private isPlaying = false;
    private currentlyPlaying: IterableIterator<boolean>;
    private hasWon = false;
    private startTime: number;
    private inputTime: number;
    private currentGame: 1 | 2 | 3 = 1;
    private currentLevel: 1 | 2 | 3 | 4 = 1;
    private counter = -1;

    // The div elements, pulled in by the constructor.
    private counterElement: HTMLParagraphElement;
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
    private lastMoves: Tones[] = [];
    private longestMoves: Tones[] = [];
    private currentMoves: Tones[] = [];
    private playedMoves: Tones[] = [];
    private playedIndex: number = 0;


    constructor() {

        try {
            this.ctx = new (AudioContext || webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = volume;
            this.gainNode.connect(this.ctx.destination);
        } catch (e) {
            throw new Error('No Audio Context! ' + e);
        };

        this.counterElement = document.getElementById('counter') as HTMLParagraphElement;
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
        if (this.counter !== this.currentMoves.length) {
            this.counter = this.currentMoves.length;
            this.counterElement.innerHTML = `# of steps: ${this.counter}`;
        }
        const now = performance.now();
        if (this.rng >= 4) {
            this.rng = 1;
        } else {
            this.rng++;
        }
         if (this.isHolding) {
            if (now >= this.inputTime + 800) {
                this.addMove();
            }
        } else if (this.isWaiting) {
            if (now >= this.inputTime + 3000) {
                this.loseGame();
            }
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
    playTone(freq: number, time: number, color: Tones = 0): Promise<boolean> {
        return new Promise((resolve, reject) => {

            const oscillator = this.ctx.createOscillator();
            let el: HTMLElement = this.boardElement;
            switch (color) {
                case Tones.BLUE: el = this.blueElement; break;
                case Tones.GREEN: el = this.greenElement; break;
                case Tones.RED: el = this.redElement; break;
                case Tones.YELLOW: el = this.yellowElement; break;
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
    playGreen = (time: number = 420) => this.playTone(415, time, Tones.GREEN);
    /** Plays the Red Tone: 310Hz (D#4/311.127Hz) */
    playRed = (time: number = 420) => this.playTone(310, time, Tones.RED);
    /** Plays the Yellow Tone: 252Hz (B3/247.942Hz) */
    playYellow = (time: number = 420) => this.playTone(252, time, Tones.YELLOW);
    /** Plays the Blue Tone: 209Hz (G#3/207.652Hz) */
    playBlue = (time: number = 420) => this.playTone(209, time, Tones.BLUE);
    /** Plays the Fail Tone: 42Hz, defaults to 1.5s */
    playLose = (time: number = 1500) => this.playTone(42, time);
    /** Just a Promisified Delay mechanism to support pauses in playback */
    playDelay(time: number): Promise<boolean> {
        return new Promise(r => setTimeout(r, time));
    }

    playFancy = (four: boolean = true) => {
        let promises: Promise<boolean>[] = [];
        promises.push(this.playRed(100));
        promises.push(this.playYellow(100));
        if (four) {
            promises.push(this.playGreen(100));
            promises.push(this.playBlue(100));
        }
        return Promise.all(promises);
    }

    playWin(fancy?: boolean) {
        let prev = this.currentMoves[this.currentMoves.length - 1];
        let sequence: [Tones, number][];
        if (!fancy && prev) {
            sequence = [
                [Tones.SILENT, 800],
                [prev, 20], [0, 20],
                [prev, 70], [0, 20],
                [prev, 70], [0, 20],
                [prev, 70], [0, 20],
                [prev, 70], [0, 20],
                [prev, 70], [0, 20]
            ];
        } else {
            sequence = [
                [Tones.SILENT, 800],
                [Tones.RED, 100], [0, 20],
                [Tones.YELLOW, 100], [0, 20],
                [Tones.BLUE, 100], [0, 20],
                [Tones.GREEN, 100], [0, 20],
                [Tones.RED, 100], [0, 20],
                [Tones.YELLOW, 100], [0, 20],
                [Tones.BLUE, 100], [0, 20],
                [Tones.GREEN, 100], [0, 20],
                [Tones.RED, 100], [0, 20],
                [Tones.YELLOW, 100], [0, 20],
                [Tones.BLUE, 100], [0, 20],
                [Tones.GREEN, 100], [0, 20],
                [Tones.RED, 100], [0, 20],
                [Tones.YELLOW, 100], [0, 20],
                // [Tones.FANCY4, 100],
                // [Tones.FANCY2, 100],
                [Tones.ERROR, 800]
            ];
        }
        this.runIter(this.playSequence(sequence));
    }

    playMoves(moves: Tones[] = this.currentMoves) {
        let sequence: [Tones, number][] = [[Tones.SILENT, 800]];
        for (let move of moves) {
            sequence.push([move, this.delay], [Tones.SILENT, 50]);
        }
        this.runIter(this.playSequence(sequence));
    }

    /**
     * Produces an Iterator that we can pass to runIter. Accepts an array of
     * Colors or 0 an a time to play each tone/delay.
     *
     * @param {(([Tones, number])[])} sequence
     * @returns {IterableIterator<Promise<boolean>>}
     * @memberof Simon
     */
    *playSequence(sequence: ([Tones, number])[]): IterableIterator<Promise<any>> {
        this.isPlaying = true;
        for (let note of sequence) {
            switch (note[0]) {
                case Tones.BLUE: yield this.playBlue(note[1]); break;
                case Tones.RED: yield this.playRed(note[1]); break;
                case Tones.GREEN: yield this.playGreen(note[1]); break;
                case Tones.YELLOW: yield this.playYellow(note[1]); break;
                case Tones.SILENT: yield this.playDelay(note[1]); break;
                case Tones.ERROR: yield this.playLose(note[1]); break;
                case Tones.FANCY4: yield this.playFancy(); break;
                case Tones.FANCY2: yield this.playFancy(false); break;
            }
        }
        this.isPlaying = false;
        yield Promise.resolve(false);
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
        if ((ev.target as HTMLElement).nodeName === 'INPUT') {
            const el: HTMLInputElement = ev.target as HTMLInputElement;
            if (el.name === 'mode-selector') {
                this.setGame(parseInt(el.value));
            }
            if (el.name === 'level-selector') {
                this.setLevel(parseInt(el.value));
            }
        }
        if (this.isPlaying && !this.isWaiting && ev.target !== this.startButton) {
            return;
        }
        let fail = false;
        if (this.isWaiting || !this.isActive) {
            // Gives us a way to cheat using the mode/level elements for now..
            let playedColor: Tones = this.currentMoves[this.playedIndex];
            this.isWaiting = false;
            this.inputTime = performance.now();
            switch (ev.target) {
                case this.greenElement: playedColor = Tones.GREEN; break;
                case this.redElement: playedColor = Tones.RED; break;
                case this.blueElement: playedColor = Tones.BLUE; break;
                case this.yellowElement: playedColor = Tones.YELLOW; break;
                case this.startButton: return this.start();
                case this.lastButton: return this.last();
                case this.longestButton: return this.longest();
                case this.modeElement:
                case this.levelElement:
                default: break;
            }

            this.playedMoves.push(playedColor);

            if (playedColor === this.currentMoves[this.playedIndex]) {
                this.lastMoves = [...this.playedMoves];
                if (this.playedIndex >= this.longestMoves.length) {
                    this.longestMoves = [...this.playedMoves];
                }
                if (this.currentMoves.length >= Levels[this.currentLevel] && this.playedIndex >= this.currentMoves.length - 1) {
                    this.winGame();
                } else if (this.playedIndex >= this.currentMoves.length - 1) {
                    this.playedIndex = 0;
                    this.isHolding = true;
                } else {
                    this.playedIndex++;
                    this.isWaiting = true;
                }

                switch (playedColor) {
                    case Tones.GREEN: this.playGreen(250); break;
                    case Tones.RED: this.playRed(250); break;
                    case Tones.BLUE: this.playBlue(250); break;
                    case Tones.YELLOW: this.playYellow(250); break;
                }
            } else {
                if (this.isActive) {
                    this.loseGame();
                } else {
                    switch (playedColor) {
                        case Tones.GREEN: this.playGreen(500); break;
                        case Tones.RED: this.playRed(500); break;
                        case Tones.BLUE: this.playBlue(500); break;
                        case Tones.YELLOW: this.playYellow(500); break;
                    }
                }
            }
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
        const delay = this.delay + 20;
        this.isHolding = false;
        this.currentMoves.push(this.rng);
        this.inputTime = performance.now() + delay * this.currentMoves.length;
        this.playedMoves = [];
        this.playMoves();
        setTimeout(() => this.isWaiting = true, delay - 100);
        // this.isWaiting = true;
    }

    loseGame() {
        console.log('Game lost!');
        this.playLose();
        this.isActive = false;
        this.isWaiting = false;
        this.isHolding = false;
        this.lastMoves = [...this.currentMoves];
        this.currentMoves = [];
        this.playedMoves = [];
        this.playedIndex = 0;
    }

    winGame() {
        console.log('Game won!');
        this.playWin((this.level === 4));
        this.isActive = false;
        this.isWaiting = false;
        this.isHolding = false;
        this.lastMoves = [... this.currentMoves];
        this.currentMoves = [];
        this.playedMoves = [];
        this.playedIndex = 0;

    }

    start() {
        console.log('start!');
        this.isActive = true;
        this.isWaiting = false;
        this.isHolding = false;
        this.currentMoves = [];
        this.playedMoves = [];
        this.playedIndex = 0;
        this.startTime = performance.now();
        this.addMove();
    }
    last() {
        if (!this.isActive) {
            this.playMoves(this.lastMoves);
        }
        // console.log('last!');
    }
    longest() {
        if (!this.isActive) {
            this.playMoves(this.longestMoves);
        }
        // console.log('longest!');
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
