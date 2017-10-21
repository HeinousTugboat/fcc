// https://www.freecodecamp.org/challenges/build-a-tic-tac-toe-game

// https://codepen.io/freeCodeCamp/full/KzXQgy

// User Story: I can play a game of Tic Tac Toe with the computer.
// User Story: My game will reset as soon as it's over so I can play again.
// User Story: I can choose whether I want to play as X or O.

const svgNS = 'http://www.w3.org/2000/svg';

class TicTacToe {
    private board: HTMLElement;
    private cells: NodeListOf<HTMLElement> = document.querySelectorAll('.cell') as NodeListOf<HTMLElement>;
    private human = 'X';
    private twoPlayer = true;
    private state = Array(9).fill(0);
    private winConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    private won = false;
    constructor() {
        this.board = document.getElementById('board') as HTMLElement;
        this.board.addEventListener('click', this.click.bind(this), true);
    }
    click(ev: Event) {
        const el: HTMLElement = ev.target as HTMLElement;
        let loc = el.dataset.loc;
        if (!loc || el.dataset.mark !== undefined || this.won) {
            return;
        }
        if (this.human === 'X') {
            this.setX(el);
            if (this.twoPlayer) {
                this.human = 'O';
            }
        } else if (this.human === 'O') {
            this.setO(el);
            if (this.twoPlayer) {
                this.human = 'X';
            }
        } else {
            return;
        }
    }
    setX(el: HTMLElement) {
        el.dataset.mark = 'X';
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#X');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
        this.state[+(el.dataset.loc as string)] = 1;
        if (this.checkState() >= 3) {
            console.log('X wins!');
            this.won = true;
        }
    }
    setO(el: HTMLElement) {
        el.dataset.mark = 'O';
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#O');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
        this.state[+(el.dataset.loc as string)] = -1;
        if (this.checkState() <= -3) {
            console.log('O wins!');
            this.won = true;
        }
    }
    reset() {
        this.cells.forEach((el) => {
            delete el.dataset.mark;
            (el.querySelector('svg') as SVGElement).innerHTML = '';
        })
    }
    checkState() {
        return this.winConditions.reduce((bestScore, winState) => {
            if (Math.abs(bestScore) >= 3) {
                return bestScore
            }
            const score = winState.reduce((score, cellIndex) => {
                return score + this.state[cellIndex];
            }, 0);
            if (Math.abs(score) >= Math.abs(bestScore)) {
                return score;
            } else {
                return bestScore;
            }
        }, 0);
    }
    // http://neverstopbuilding.com/minimax
    // AI...
    selectNext() {

    }
}

const game = new TicTacToe;
