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
    constructor() {
        this.board = document.getElementById('board') as HTMLElement;
        this.board.addEventListener('click', this.click.bind(this), true);
    }
    click(ev: Event) {
        const el: HTMLElement = ev.target as HTMLElement;
        let loc = el.dataset.loc;
        if (!loc || el.dataset.mark !== undefined) {
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
        // this.setX(el);
        // console.log(el);
    }
    setX(el: HTMLElement) {
        el.dataset.mark = 'X';
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#X');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
    }
    setO(el: HTMLElement) {
        el.dataset.mark = 'O';
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#O');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
    }
    reset() {
        this.cells.forEach((el) => {
            delete el.dataset.mark;
            (el.querySelector('svg') as SVGElement).innerHTML = '';
        })
    }
}

const game = new TicTacToe;
